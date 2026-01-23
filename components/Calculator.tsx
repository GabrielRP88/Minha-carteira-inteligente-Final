
import React, { useState } from 'react';
import { Delete, Divide, X, Minus, Plus, Equal, Hash } from 'lucide-react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleClick = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }
    if (val === '=') {
      try {
        const mathEquation = equation.replace(/x/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
        const result = eval(mathEquation);
        const formattedResult = Number.isInteger(result) ? String(result) : result.toFixed(2).replace('.', ',');
        setDisplay(formattedResult);
        setEquation(formattedResult);
      } catch {
        setDisplay('Erro');
      }
      return;
    }
    
    if (val === 'back') {
      if (display.length <= 1) {
        setDisplay('0');
        setEquation('');
      } else {
        setDisplay(display.slice(0, -1));
        setEquation(equation.slice(0, -1));
      }
      return;
    }

    const currentEquation = display === '0' ? val : equation + val;
    setEquation(currentEquation);
    setDisplay(display === '0' ? val : display + val);
  };

  const btnCircle = "aspect-square rounded-full flex items-center justify-center text-xl font-black transition-all active:scale-90 active:bg-primary active:text-white";
  const numBtn = `${btnCircle} bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-inner border border-slate-100 dark:border-slate-700/50`;
  const opBtn = `${btnCircle} bg-primary/5 text-primary border border-primary/10`;
  const equalBtn = `${btnCircle} bg-primary text-white shadow-lg shadow-primary/30 scale-110`;

  return (
    <div className="h-full flex flex-col p-8 bg-white dark:bg-[#0f172a]">
      <div className="mb-10 flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Hash size={20}/></div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Calculadora</h3>
          <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em]">Precision Engine</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-10 mb-10 text-right shadow-2xl relative overflow-hidden ring-4 ring-slate-800/50">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Hash size={80}/></div>
        <div className="text-primary/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2 h-4 overflow-hidden">
          {equation || '0'}
        </div>
        <div className="text-white text-5xl font-black tracking-tighter overflow-hidden truncate">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 flex-1 items-center justify-items-center">
        <button onClick={() => handleClick('C')} className={`${btnCircle} bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs`}>CLR</button>
        <button onClick={() => handleClick('back')} className={opBtn}><Delete size={20}/></button>
        <button onClick={() => handleClick('÷')} className={opBtn}><Divide size={20}/></button>
        <button onClick={() => handleClick('x')} className={opBtn}><X size={20}/></button>
        
        <button onClick={() => handleClick('7')} className={numBtn}>7</button>
        <button onClick={() => handleClick('8')} className={numBtn}>8</button>
        <button onClick={() => handleClick('9')} className={numBtn}>9</button>
        <button onClick={() => handleClick('-')} className={opBtn}><Minus size={20}/></button>
        
        <button onClick={() => handleClick('4')} className={numBtn}>4</button>
        <button onClick={() => handleClick('5')} className={numBtn}>5</button>
        <button onClick={() => handleClick('6')} className={numBtn}>6</button>
        <button onClick={() => handleClick('+')} className={opBtn}><Plus size={20}/></button>
        
        <button onClick={() => handleClick('1')} className={numBtn}>1</button>
        <button onClick={() => handleClick('2')} className={numBtn}>2</button>
        <button onClick={() => handleClick('3')} className={numBtn}>3</button>
        <button onClick={() => handleClick('=')} className={equalBtn}><Equal size={24} strokeWidth={3}/></button>
        
        <button onClick={() => handleClick('0')} className={`${numBtn} col-span-2 aspect-auto w-full h-full`}>0</button>
        <button onClick={() => handleClick(',')} className={numBtn}>,</button>
      </div>
      
      <div className="mt-10 text-center opacity-20">
         <p className="text-[7px] font-black uppercase tracking-[0.5em]">Real-time Floating Point Logic</p>
      </div>
    </div>
  );
};
