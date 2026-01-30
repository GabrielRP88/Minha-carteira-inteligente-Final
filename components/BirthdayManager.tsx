import React, { useState } from 'react';
import { Birthday } from '../types';
import { Plus, Trash2, Cake, Gift, Calculator } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface Props {
  birthdays: Birthday[];
  onAdd: (b: Birthday) => void;
  onRemove: (id: string) => void;
}

export const BirthdayManager: React.FC<Props> = ({ birthdays, onAdd, onRemove }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [ageInput, setAgeInput] = useState('');

  const handleAdd = () => {
    if (name && date) {
      onAdd({ id: generateId(), name, birthDate: date });
      setName('');
      setDate('');
      setAgeInput('');
    }
  };

  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    try {
      const today = new Date();
      const birthDate = new Date(birthDateStr + 'T12:00:00');
      if (isNaN(birthDate.getTime())) return 0;

      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 0;
    }
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    if (val) {
      const calculated = calculateAge(val);
      setAgeInput(calculated.toString());
    } else {
      setAgeInput('');
    }
  };

  const handleAgeChange = (val: string) => {
    setAgeInput(val);
    const newAge = parseInt(val, 10);

    if (!val || isNaN(newAge) || newAge < 0) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    let birthMonth = today.getMonth(); // 0-11
    let birthDay = today.getDate();

    if (date) {
      const parts = date.split('-'); // YYYY-MM-DD
      if (parts.length === 3) {
        birthMonth = parseInt(parts[1], 10) - 1;
        birthDay = parseInt(parts[2], 10);
      }
    }
    
    let birthYear = today.getFullYear() - newAge;

    // Cria uma data de aniversário hipotética para este ano
    const birthdayThisYear = new Date(today.getFullYear(), birthMonth, birthDay);

    // Se o aniversário deste ano ainda não passou, a pessoa ainda não completou a "nova idade" neste ano.
    // Portanto, o ano de nascimento dela deve ser o anterior.
    if (today < birthdayThisYear) {
      birthYear -= 1;
    }
    
    const newBirthDate = new Date(birthYear, birthMonth, birthDay);
    
    setDate(newBirthDate.toLocaleDateString('en-CA'));
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-2xl font-black uppercase tracking-tight">Aniversários</h3>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Datas Importantes</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] mb-8 space-y-4 border-2 border-primary/10">
        <div className="flex items-center gap-2 mb-2 px-2">
           <Gift size={16} className="text-primary"/>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adicionar Novo</span>
        </div>
        
        <input 
          placeholder="Nome da pessoa" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-primary outline-none text-xs" 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute -top-2 left-3 text-[8px] font-black bg-slate-50 dark:bg-slate-800 px-1 text-slate-400 uppercase z-10">Data</span>
            <input 
              type="date" 
              value={date} 
              onChange={e => handleDateChange(e.target.value)} 
              className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary text-xs uppercase h-[52px] relative" 
            />
          </div>
          
          <div className="relative">
            <span className="absolute -top-2 left-3 text-[8px] font-black bg-slate-50 dark:bg-slate-800 px-1 text-slate-400 uppercase z-10">Idade</span>
            <input 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={ageInput} 
              onChange={e => handleAgeChange(e.target.value)} 
              className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary text-xs text-center h-[52px] relative" 
            />
          </div>
        </div>
        <p className="text-[8px] text-slate-400 font-bold px-2 !mt-2">
          * Digite a idade para calcular o ano automaticamente.
        </p>

        <button 
          onClick={handleAdd} 
          className="w-full !mt-6 p-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all h-[52px] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <Plus size={16}/> Adicionar Aniversário
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-10">
        {birthdays.length === 0 ? (
           <div className="text-center py-10 opacity-30">
              <Cake size={40} className="mx-auto mb-3"/>
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum aniversário salvo</p>
           </div>
        ) : (
           birthdays.sort((a,b) => a.birthDate.localeCompare(b.birthDate)).map(b => {
            const currentAge = calculateAge(b.birthDate);
            return (
              <div key={b.id} className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <Cake size={18}/>
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase text-slate-700 dark:text-slate-200">
                      {b.name} <span className="text-primary ml-1 opacity-80">({currentAge} anos)</span>
                    </p>
                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-wider mt-0.5">
                      {new Date(b.birthDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => onRemove(b.id)} 
                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};