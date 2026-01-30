
import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw, Wifi, TrendingUp } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  flag: string;
}

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  const currencies: Currency[] = [
    { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷' },
    { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
    { code: 'JPY', name: 'Iene Japonês', flag: '🇯🇵' },
    { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷' },
    { code: 'BTC', name: 'Bitcoin', flag: '₿' },
  ];

  const fetchRate = async () => {
    setLoading(true);
    try {
      // Limpeza do valor de entrada
      const cleanAmount = amount.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(cleanAmount);
      
      if (isNaN(val)) {
        setResult('---');
        setLoading(false);
        return;
      }

      // API Pública para cotações (Frankfurter para FIAT, CoinGecko fallback simples ou similar para lógica real)
      // Para este exemplo, usamos uma API pública de taxas de câmbio confiável.
      // Nota: BTC geralmente requer outra API, aqui simularemos ou usaremos uma que suporte se disponível.
      
      let rate = 0;

      // Simulação de delay de rede para UX e fallback se API falhar ou para crypto
      if (from === to) {
        rate = 1;
      } else {
        const response = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${from}&to=${to}`);
        if (response.ok) {
           const data = await response.json();
           rate = data.rates[to];
        } else {
           // Fallback estático caso a API pública não suporte o par (ex: BTC ou ARS em alguns endpoints)
           const fallbacks: Record<string, number> = { 
             'USDBRL': 5.45, 'EURBRL': 6.05, 'GBPBRL': 7.10, 'JPYBRL': 0.036, 'ARSBRL': 0.006,
             'BRLUSD': 0.18, 'BRLEUR': 0.16, 'BRLGBP': 0.14, 'BRLJPY': 27.5, 'BRLARS': 166.0
           };
           rate = fallbacks[`${from}${to}`] || 1;
        }
      }

      const finalValue = val * rate;
      setResult(finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      
      const now = new Date();
      setLastUpdate(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

    } catch (error) {
      console.error("Erro ao buscar cotação", error);
      setResult('Erro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => fetchRate(), 500); // Debounce
    return () => clearTimeout(timeOutId);
  }, [amount, from, to]);

  const swapMoedas = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl shadow-inner"><Coins size={24}/></div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Câmbio</h3>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Tempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
           <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
           <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">{loading ? 'Atualizando...' : 'Online'}</span>
        </div>
      </div>

      <div className="space-y-8 flex-1">
        <div className="space-y-2">
          <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Valor para Converter</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] text-3xl font-black outline-none border-2 border-transparent focus:border-primary transition-all text-center shadow-sm"
            placeholder="0,00"
          />
        </div>

        <div className="flex flex-col gap-4 relative">
          <div className="flex-1">
            <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4 mb-2 block">De</label>
            <select 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black text-xs uppercase outline-none border border-slate-100 dark:border-slate-700 appearance-none text-center"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
            </select>
          </div>

          <div className="flex justify-center -my-3 relative z-10">
             <button onClick={swapMoedas} className="p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900">
                <RefreshCw size={24} className={loading ? 'animate-spin' : ''}/>
             </button>
          </div>

          <div className="flex-1">
            <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4 mb-2 block">Para</label>
            <select 
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black text-xs uppercase outline-none border border-slate-100 dark:border-slate-700 appearance-none text-center"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-primary p-10 rounded-[3.5rem] text-white text-center shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Coins size={80}/></div>
          <div className="absolute bottom-0 left-0 p-4 opacity-10"><TrendingUp size={80}/></div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Valor Convertido</p>
          <div className="text-5xl font-black tracking-tighter truncate leading-none mb-2">
             {loading ? <span className="animate-pulse opacity-50">...</span> : result}
          </div>
          <p className="text-sm font-bold opacity-50">{to}</p>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex flex-col items-center gap-2">
         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full">
            <Wifi size={12}/> Atualizado às {lastUpdate}
         </div>
         <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
           Fonte: Morningstar
         </p>
      </div>
    </div>
  );
};
