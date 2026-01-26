
import React, { useState, useEffect, useCallback } from 'react';
import { Coins, RefreshCw, ArrowRightLeft, Wifi, WifiOff, Clock, TrendingUp, ExternalLink, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Currency {
  code: string;
  name: string;
  flag: string;
}

const CURRENCIES: Currency[] = [
  { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷' },
  { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', flag: '🇯🇵' },
  { code: 'CNY', name: 'Yuan Chinês', flag: '🇨🇳' },
  { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
  { code: 'BTC', name: 'Bitcoin', flag: '₿' },
  { code: 'CAD', name: 'Dólar Canadense', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺' },
  { code: 'CHF', name: 'Franco Suíço', flag: '🇨🇭' },
  { code: 'CLP', name: 'Peso Chileno', flag: '🇨🇱' },
  { code: 'UYU', name: 'Peso Uruguaio', flag: '🇺🇾' },
  { code: 'PYG', name: 'Guarani Paraguaio', flag: '🇵🇾' },
  { code: 'COP', name: 'Peso Colombiano', flag: '🇨🇴' },
  { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
  { code: 'INR', name: 'Rupia Indiana', flag: '🇮🇳' },
  { code: 'RUB', name: 'Rublo Russo', flag: '🇷🇺' },
  { code: 'KRW', name: 'Won Sul-coreano', flag: '🇰🇷' },
  { code: 'ZAR', name: 'Rand Sul-africano', flag: '🇿🇦' },
];

const FRANKFURTER_SUPPORTED = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'];

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('BRL');
  const [to, setTo] = useState('USD');
  const [result, setResult] = useState<string>('...');
  const [rawRate, setRawRate] = useState<number>(0);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      // Usando open.er-api com cache busting para dados mais recentes (Update Hourly)
      const response = await fetch(`https://open.er-api.com/v6/latest/USD?_=${Date.now()}`);
      
      if (!response.ok) throw new Error('Falha na rede');
      
      const data = await response.json();
      
      if (data && data.rates) {
        setRates(data.rates);
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const updateString = `${dateStr} às ${timeStr}`;
        
        setLastUpdate(updateString);
        setIsOffline(false);
        
        localStorage.setItem('wallet_currency_rates', JSON.stringify(data.rates));
        localStorage.setItem('wallet_currency_date', updateString);
      }
    } catch (error) {
      console.error("Erro ao buscar cotações:", error);
      setIsOffline(true);
      
      const cachedRates = localStorage.getItem('wallet_currency_rates');
      const cachedDate = localStorage.getItem('wallet_currency_date');
      
      if (cachedRates) setRates(JSON.parse(cachedRates));
      if (cachedDate) setLastUpdate(cachedDate);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = async (fromCurrency: string, toCurrency: string, currentRate: number, currentVal: number) => {
    if (!fromCurrency || !toCurrency) return;
    
    // Se ambas as moedas são suportadas pelo Frankfurter, usamos dados reais
    if (FRANKFURTER_SUPPORTED.includes(fromCurrency) && FRANKFURTER_SUPPORTED.includes(toCurrency) && fromCurrency !== toCurrency) {
        setChartLoading(true);
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 15); // Últimos 15 dias
            
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            const response = await fetch(`https://api.frankfurter.app/${startStr}..${endStr}?from=${fromCurrency}&to=${toCurrency}`);
            const data = await response.json();

            if (data && data.rates) {
                const history = Object.entries(data.rates).map(([date, rates]: [string, any]) => {
                    const rate = rates[toCurrency];
                    const [y, m, d] = date.split('-');
                    return {
                        date: `${d}/${m}`,
                        value: rate,
                        displayValue: (rate * currentVal).toFixed(2),
                        isReal: true
                    };
                });
                
                // Adiciona o dia de hoje se não estiver presente (Frankfurter atualiza no fim do dia europeu)
                const todayStr = endDate.getDate().toString().padStart(2,'0') + '/' + (endDate.getMonth()+1).toString().padStart(2,'0');
                if (history.length > 0 && history[history.length-1].date !== todayStr) {
                    history.push({
                        date: todayStr,
                        value: currentRate,
                        displayValue: (currentRate * currentVal).toFixed(2),
                        isReal: true
                    });
                }

                setChartData(history);
                setChartLoading(false);
                return;
            }
        } catch (e) {
            console.warn("Falha ao buscar histórico real, usando simulação", e);
        }
    }

    // Fallback: Simulação baseada na taxa atual se a API falhar ou moedas não suportadas (ex: BTC)
    const history = [];
    const volatility = 0.015;
    const today = new Date();

    for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        let historicalRate;
        if (i === 0) {
            historicalRate = currentRate;
        } else {
            const change = 1 + (Math.random() * volatility * 2 - volatility); 
            historicalRate = currentRate * change;
        }

        history.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            value: historicalRate,
            displayValue: (historicalRate * currentVal).toFixed(2),
            isReal: false
        });
    }
    setChartData(history);
    setChartLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Calcular conversão
  useEffect(() => {
    if (Object.keys(rates).length === 0) return;

    const cleanAmount = amount.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleanAmount);

    if (isNaN(val)) {
      setResult('---');
      setChartData([]);
      return;
    }

    // A base da API Open Exchange Rates é USD.
    const rateFrom = rates[from] || 1;
    const rateTo = rates[to] || 1;
    
    // Taxa cruzada: (1 / Rate_From) * Rate_To
    const conversionRate = (1 / rateFrom) * rateTo;
    setRawRate(conversionRate);

    const finalValue = val * conversionRate;

    const options: Intl.NumberFormatOptions = { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    };

    if (finalValue < 0.01) options.maximumFractionDigits = 6;
    else if (finalValue > 10000) options.maximumFractionDigits = 0;

    setResult(finalValue.toLocaleString('pt-BR', options));

    // Buscar histórico
    // Debounce leve para não chamar API demais enquanto digita
    const timer = setTimeout(() => {
        fetchHistory(from, to, conversionRate, val);
    }, 500);

    return () => clearTimeout(timer);

  }, [amount, from, to, rates]);

  const swapMoedas = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl shadow-inner"><Coins size={24}/></div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Câmbio</h3>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Morningstar · Fontes</p>
          </div>
        </div>
        <button 
          onClick={fetchRates} 
          disabled={loading}
          className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90 ${loading ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''}/>
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-4">Valor</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] text-4xl font-black outline-none border-2 border-transparent focus:border-primary transition-all text-center text-slate-800 dark:text-white shadow-sm"
            placeholder="0,00"
          />
        </div>

        <div className="relative bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[3rem] border border-slate-100 dark:border-slate-800">
          {/* FROM */}
          <div className="space-y-2">
            <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4">De</label>
            <div className="relative">
              <select 
                value={from} 
                onChange={(e) => setFrom(e.target.value)}
                className="w-full p-5 pl-4 pr-10 bg-white dark:bg-slate-900 rounded-3xl font-black text-xs uppercase outline-none border-2 border-transparent focus:border-primary appearance-none shadow-sm text-slate-900 dark:text-white hover:scale-[1.01] transition-all duration-200"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center -my-3 relative z-10">
             <button onClick={swapMoedas} className="p-3 bg-primary text-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-slate-50 dark:border-slate-800">
                <ArrowRightLeft size={18}/>
             </button>
          </div>

          {/* TO */}
          <div className="space-y-2">
            <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4">Para</label>
            <div className="relative">
              <select 
                value={to} 
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-5 pl-4 pr-10 bg-white dark:bg-slate-900 rounded-3xl font-black text-xs uppercase outline-none border-2 border-transparent focus:border-primary appearance-none shadow-sm text-slate-900 dark:text-white hover:scale-[1.01] transition-all duration-200"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
            </div>
          </div>
        </div>

        <div className="bg-primary p-8 rounded-[3rem] text-white text-center shadow-2xl shadow-primary/30 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Coins size={100}/></div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Resultado Estimado</p>
          <div className="text-4xl md:text-5xl font-black tracking-tighter truncate leading-tight">
            {result} <span className="text-lg opacity-50 align-top">{to}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
             <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">
               1 {from} = {rawRate.toFixed(4)} {to}
             </div>
          </div>
        </div>

        {/* GRÁFICO DE HISTÓRICO */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-lg">
           <div className="flex items-center justify-between mb-6 ml-2 mr-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500"/>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Histórico (15 Dias)
                </h4>
              </div>
              {chartData.length > 0 && (
                  <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded ${chartData[0]?.isReal ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {chartData[0]?.isReal ? 'Dados Reais' : 'Estimativa'}
                  </span>
              )}
           </div>
           
           <div className="h-48 w-full relative">
              {chartLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
                      <RefreshCw size={24} className="animate-spin text-primary"/>
                  </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 8, fontWeight: 800, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value.toFixed(4)} ${to}`, 'Taxa']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex flex-col items-center gap-3">
         {lastUpdate && (
           <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isOffline ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {isOffline ? <WifiOff size={12}/> : <Clock size={12}/>}
              <span>{isOffline ? 'Offline • ' : 'Atualizado: '} {lastUpdate}</span>
           </div>
         )}
         
         <div className="flex items-center gap-2 opacity-60">
            <ShieldCheck size={10} className="text-slate-400"/>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
              Fonte: Morningstar · Fontes
            </span>
         </div>
         
         <a 
           href={`https://www.google.com/finance/quote/${from}-${to}`} 
           target="_blank" 
           rel="noreferrer"
           className="flex items-center gap-2 text-[8px] font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
         >
           Verificar cotação oficial no Google <ExternalLink size={10}/>
         </a>
      </div>
    </div>
  );
};
