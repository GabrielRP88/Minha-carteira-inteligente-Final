
import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // Taxa relativa ao BRL
}

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('BRL');
  const [to, setTo] = useState('USD');
  const [result, setResult] = useState('0,00');
  
  const currencies: Currency[] = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷', rate: 1.0 },
    { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸', rate: 5.45 },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 5.98 },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧', rate: 7.02 },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵', rate: 0.035 },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷', rate: 0.0058 },
  ];

  useEffect(() => {
    // Melhoria na limpeza do valor de entrada para suportar formato brasileiro (1.000,00)
    // Remove pontos de milhar e substitui vírgula decimal por ponto
    const cleanAmount = amount.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(cleanAmount) || 0;
    
    const fromRate = currencies.find(c => c.code === from)?.rate || 1;
    const toRate = currencies.find(c => c.code === to)?.rate || 1;
    
    // Converte montante da moeda 'from' para BRL, e então de BRL para a moeda 'to'
    const finalValue = (val * fromRate) / toRate;
    
    setResult(finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [amount, from, to]);

  const swapMoedas = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="mb-10 flex items-center gap-4">
        <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl shadow-inner"><Coins size={24}/></div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Câmbio</h3>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Conversão Instantânea</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Valor para Converter</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] text-3xl font-black outline-none border-2 border-transparent focus:border-primary transition-all text-center"
            placeholder="0,00"
          />
        </div>

        <div className="flex flex-col gap-4 relative">
          <div className="flex-1">
            <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4 mb-2 block">De</label>
            <select 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black text-xs uppercase outline-none border border-slate-100 dark:border-slate-700"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
            </select>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
             <button onClick={swapMoedas} className="p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900">
                <RefreshCw size={24}/>
             </button>
          </div>

          <div className="flex-1">
            <label className="text-[9px] font-black opacity-40 uppercase tracking-widest ml-4 mb-2 block">Para</label>
            <select 
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-black text-xs uppercase outline-none border border-slate-100 dark:border-slate-700"
            >
              {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-primary p-10 rounded-[3.5rem] text-white text-center shadow-2xl shadow-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Coins size={80}/></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-60">Valor Convertido</p>
          <div className="text-5xl font-black tracking-tighter truncate">{result} <span className="text-xl opacity-50">{to}</span></div>
        </div>
      </div>
      
      <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-center">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
           Cotações baseadas em taxas médias de mercado atualizadas localmente.
         </p>
      </div>
    </div>
  );
};
