
import React, { useState, useEffect } from 'react';

export const Notes: React.FC = () => {
  const [note, setNote] = useState(() => {
    return localStorage.getItem('wallet_notes') || '';
  });

  useEffect(() => {
    localStorage.setItem('wallet_notes', note);
  }, [note]);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-black">Bloco de Notas</h3>
        <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Anotações Rápidas</p>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Digite aqui seus lembretes..."
        className="flex-1 w-full bg-amber-50/10 dark:bg-slate-800/50 border-2 border-amber-500/20 dark:border-slate-700 rounded-[32px] p-8 text-slate-700 dark:text-slate-300 font-medium leading-relaxed resize-none focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-20"
      />
      
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest text-center">
          As notas são salvas localmente.
        </p>
      </div>
    </div>
  );
};
