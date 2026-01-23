
import React, { useState } from 'react';
import { BankAccount } from '../types';
import { Plus, Trash2, Landmark, Building2, X, CheckCircle2, LayoutGrid, Pencil } from 'lucide-react';

interface BankAccountWithBalance extends BankAccount {
  currentBalance?: number;
}

interface Props {
  accounts: BankAccountWithBalance[];
  onAdd: (account: BankAccount) => void;
  onRemove: (id: string) => void;
  onUpdate: (account: BankAccount) => void;
  onSetDefault: (id: string) => void;
  onSelect: (id: 'all' | string) => void;
  selectedId: 'all' | string;
}

export const BANK_PRESETS = [
  { name: 'Nubank', color: '#820ad1', icon: '💜' },
  { name: 'Itaú', color: '#ff7800', icon: '🟧' },
  { name: 'Inter', color: '#ff7a00', icon: '🟠' },
  { name: 'Bradesco', color: '#cc092f', icon: '🟥' },
  { name: 'Santander', color: '#ec0000', icon: '🔥' },
  { name: 'C6 Bank', color: '#212121', icon: '⬛' },
  { name: 'Caixa', color: '#005ca9', icon: '🟦' },
  { name: 'Banco do Brasil', color: '#fcf200', icon: '🟨' },
  { name: 'Dinheiro', color: '#10b981', icon: '💵' },
];

export const BankAccountManager: React.FC<Props> = ({ accounts, onAdd, onRemove, onUpdate, onSelect, selectedId }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    bankName: '',
    accountNumber: '',
    agency: '',
    color: '#10b981',
    initialBalance: 0,
    isDefault: false
  });

  const handleOpenEdit = (acc: BankAccount) => {
    setNewAccount(acc);
    setEditingId(acc.id);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!newAccount.bankName) return;
    if (editingId) {
      onUpdate({ ...newAccount, id: editingId } as BankAccount);
    } else {
      onAdd({ ...newAccount, id: crypto.randomUUID() } as BankAccount);
    }
    setShowAdd(false);
    setEditingId(null);
    setNewAccount({ bankName: '', accountNumber: '', agency: '', color: '#10b981', initialBalance: 0, isDefault: false });
  };

  const getBankIcon = (name: string) => {
    return BANK_PRESETS.find(p => p.name === name)?.icon || '🏦';
  };

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Gerenciar Contas</h3>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Toque para selecionar ou editar</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 space-y-4">
        {!showAdd && (
          <button 
            onClick={() => onSelect('all')}
            className={`w-full p-6 rounded-[2.5rem] border-2 flex items-center justify-between transition-all ${
              selectedId === 'all' 
              ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
              : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${selectedId === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                <LayoutGrid size={24}/>
              </div>
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest">Todas as Contas</p>
                <p className={`text-[8px] font-bold uppercase ${selectedId === 'all' ? 'opacity-60' : 'opacity-40'}`}>Visão Consolidada</p>
              </div>
            </div>
            {selectedId === 'all' && <CheckCircle2 size={20}/>}
          </button>
        )}

        {showAdd ? (
          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-primary/20 animate-in zoom-in-95 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-primary">{editingId ? 'Editar Conta' : 'Nova Conta'}</span>
              <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="text-slate-400"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black opacity-30 uppercase ml-2 mb-1 block">Escolha o Banco</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {BANK_PRESETS.map(preset => (
                     <button 
                       key={preset.name}
                       onClick={() => setNewAccount({...newAccount, bankName: preset.name, color: preset.color})}
                       className={`shrink-0 px-4 py-3 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase transition-all border-2 ${newAccount.bankName === preset.name ? 'border-primary bg-primary text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                     >
                       <span className="text-xs">{preset.icon}</span>
                       {preset.name}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Personalizar Nome</label>
                <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl px-4">
                   <span className="text-lg mr-2">{getBankIcon(newAccount.bankName || '')}</span>
                   <input placeholder="Nome da conta..." value={newAccount.bankName} onChange={e => setNewAccount({...newAccount, bankName: e.target.value})} className="flex-1 py-4 bg-transparent outline-none font-bold text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Agência</label>
                  <input placeholder="0001" value={newAccount.agency} onChange={e => setNewAccount({...newAccount, agency: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl outline-none font-bold text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Conta</label>
                  <input placeholder="12345-6" value={newAccount.accountNumber} onChange={e => setNewAccount({...newAccount, accountNumber: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl outline-none font-bold text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Cor</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl">
                     <input type="color" value={newAccount.color} onChange={e => setNewAccount({...newAccount, color: e.target.value})} className="w-10 h-10 rounded-xl border-none outline-none cursor-pointer bg-transparent" />
                     <span className="text-[8px] font-bold text-slate-400 uppercase">Personalizar</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block text-emerald-600">Valor que já possui</label>
                  <input type="number" placeholder="0,00" value={newAccount.initialBalance} onChange={e => setNewAccount({...newAccount, initialBalance: Number(e.target.value)})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl outline-none font-black text-xs text-emerald-500" />
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                {editingId ? 'Atualizar Dados' : 'Criar Conta'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="pt-4 pb-2">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Minhas Contas</p>
            </div>

            {accounts.map(acc => (
              <div 
                key={acc.id} 
                onClick={() => onSelect(acc.id)}
                className={`relative overflow-hidden p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer group ${
                  selectedId === acc.id 
                  ? 'border-primary bg-slate-900 text-white shadow-2xl scale-[1.02]' 
                  : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'
                }`}
              >
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl text-xl flex items-center justify-center ${selectedId === acc.id ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      {getBankIcon(acc.bankName)}
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        {acc.bankName}
                      </h4>
                      <p className="text-[8px] font-bold opacity-40 uppercase">Ag: {acc.agency} • CC: {acc.accountNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(acc); }} className="p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all"><Pencil size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir esta conta?')) onRemove(acc.id); }} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={14}/></button>
                  </div>
                </div>

                <div className="flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-40">Saldo Atual</p>
                    <p className={`text-xl font-black ${selectedId === acc.id ? 'text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                      R$ {(acc.currentBalance ?? acc.initialBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {selectedId === acc.id && <CheckCircle2 size={24} className="text-primary"/>}
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: acc.color }}></div>
              </div>
            ))}
          </>
        )}
      </div>

      {!showAdd && (
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 to-transparent">
          <button onClick={() => setShowAdd(true)} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-[9px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3">
            <Plus size={20} /> Adicionar Nova Conta
          </button>
        </div>
      )}
    </div>
  );
};
