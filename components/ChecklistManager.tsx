import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ListCheck, Square, CheckSquare } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
}

export const ChecklistManager: React.FC = () => {
  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem('wallet_checklist_title') || 'Minha Check-list';
  });
  const [items, setItems] = useState<CheckItem[]>(() => {
    const saved = localStorage.getItem('wallet_checklist_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    localStorage.setItem('wallet_checklist_title', title);
    localStorage.setItem('wallet_checklist_items', JSON.stringify(items));
  }, [title, items]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: generateId(), text: newItem, checked: false }]);
    setNewItem('');
  };

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8">
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da Lista"
          className="text-2xl font-black uppercase tracking-tight bg-transparent outline-none w-full border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary transition-colors pb-1"
        />
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Metas e Tarefas</p>
      </div>

      <div className="flex gap-2 mb-8 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-3xl shadow-sm">
        <input 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Nova tarefa..."
          className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold text-xs outline-none border-2 border-transparent focus:border-primary transition-all"
        />
        <button 
          onClick={handleAdd}
          className="p-4 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20}/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-10">
        {items.length === 0 ? (
          <div className="text-center py-12 opacity-30">
             <ListCheck size={48} className="mx-auto mb-4"/>
             <p className="text-[10px] font-black uppercase tracking-widest">Lista vazia</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`p-4 rounded-[2rem] border-2 flex items-center justify-between transition-all group shadow-sm ${item.checked ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
            >
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                <div className={`transition-colors ${item.checked ? 'text-emerald-500' : 'text-slate-300 group-hover:text-primary'}`}>
                  {item.checked ? <CheckSquare size={24}/> : <Square size={24}/>}
                </div>
                <span className={`font-bold text-xs ${item.checked ? 'text-emerald-700/60 dark:text-emerald-400/60 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                  {item.text}
                </span>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="p-3 text-slate-300 hover:text-rose-500 rounded-xl transition-colors"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};