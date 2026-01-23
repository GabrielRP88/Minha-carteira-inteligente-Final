
import React, { useState } from 'react';
import { CreditCard as CreditCardType, BankAccount } from '../types';
import { Plus, Trash2, X, Pencil, Wifi } from 'lucide-react';

interface Props {
  cards: CreditCardType[];
  accounts: BankAccount[];
  onAdd: (card: CreditCardType) => void;
  onUpdate: (card: CreditCardType) => void;
  onRemove: (id: string) => void;
}

const CARD_BRANDS = [
  { id: 'visa', name: 'Visa', icon: '💳', color: '#1a1f71' },
  { id: 'mastercard', name: 'Mastercard', icon: '🔴', color: '#eb001b' },
  { id: 'elo', name: 'Elo', icon: '🟡', color: '#00a3e0' },
  { id: 'amex', name: 'American Express', icon: '🛡️', color: '#007bc1' }
];

export const CreditCardManager: React.FC<Props> = ({ cards, accounts, onAdd, onUpdate, onRemove }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<Partial<CreditCardType>>({
    name: '',
    brand: 'visa',
    limit: 0,
    closingDay: 1,
    dueDay: 10,
    color: '#1e293b',
    bankAccountId: ''
  });

  const handleOpenEdit = (card: CreditCardType) => {
    setNewCard(card);
    setEditingId(card.id);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!newCard.name || !newCard.limit) return;
    if (editingId) {
      onUpdate({ ...newCard, id: editingId } as CreditCardType);
    } else {
      onAdd({ ...newCard, id: crypto.randomUUID() } as CreditCardType);
    }
    setShowAdd(false);
    setEditingId(null);
    setNewCard({ name: '', brand: 'visa', limit: 0, closingDay: 1, dueDay: 10, color: '#1e293b', bankAccountId: '' });
  };

  const getBrandLogo = (brandId: string) => {
    switch(brandId) {
      case 'visa': return <span className="text-2xl font-black italic text-white/90">VISA</span>;
      case 'mastercard': return (
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-red-500 opacity-90"></div>
          <div className="w-6 h-6 rounded-full bg-orange-500 opacity-90"></div>
        </div>
      );
      case 'elo': return <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div><div className="w-2 h-2 rounded-full bg-yellow-400"></div><div className="w-2 h-2 rounded-full bg-blue-400"></div></div>;
      case 'amex': return <span className="text-[10px] font-black bg-white/20 theme-pill px-1 rounded text-white">AMEX</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Meus Cartões</h3>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Gestão Esqueumórfica de Crédito</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-40 space-y-6">
        {showAdd && (
          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] mb-8 space-y-6 border-2 border-primary/20 animate-in zoom-in-95 duration-200 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">{editingId ? 'Editar Cartão' : 'Novo Cartão'}</span>
              <button onClick={() => { setShowAdd(false); setEditingId(null); }} className="p-1 text-slate-400"><X size={16}/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black opacity-30 uppercase ml-2 mb-1 block">Bandeira do Cartão</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   {CARD_BRANDS.map(b => (
                     <button 
                       key={b.id}
                       onClick={() => setNewCard({...newCard, brand: b.id})}
                       className={`shrink-0 px-4 py-3 rounded-2xl flex items-center gap-2 text-[9px] font-black uppercase transition-all border-2 ${newCard.brand === b.id ? 'border-primary bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                     >
                       <span>{b.icon}</span> {b.name}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Nome Impresso no App</label>
                <input placeholder="Ex: Meu Cartão Principal..." value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-none outline-none font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Limite Total</label>
                  <input type="number" value={newCard.limit} onChange={e => setNewCard({...newCard, limit: Number(e.target.value)})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-none outline-none font-black text-xs text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Cor do Cartão</label>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl">
                     {/* Fix: Replaced setNewAccount with setNewCard and newAccount with newCard */}
                     <input type="color" value={newCard.color} onChange={e => setNewCard({...newCard, color: e.target.value})} className="w-10 h-10 rounded-xl border-none outline-none cursor-pointer bg-transparent" />
                     <span className="text-[8px] font-bold text-slate-400 uppercase">Selecionar</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Dia Fechamento</label>
                  <input type="number" min="1" max="31" value={newCard.closingDay} onChange={e => setNewCard({...newCard, closingDay: Number(e.target.value)})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-none outline-none font-bold text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black opacity-30 uppercase ml-2 block">Dia Vencimento</label>
                  <input type="number" min="1" max="31" value={newCard.dueDay} onChange={e => setNewCard({...newCard, dueDay: Number(e.target.value)})} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-none outline-none font-bold text-xs" />
                </div>
              </div>

              <button onClick={handleSave} className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                 {editingId ? 'Atualizar Cartão' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        )}

        {cards.map(card => {
          const account = accounts.find(a => a.id === card.bankAccountId);
          return (
            <div key={card.id} className="relative group perspective-1000">
              <div 
                className="relative h-56 w-full rounded-[2rem] p-8 text-white shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 group-hover:scale-[1.02] cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)` }}
              >
                {/* Efeito de Brilho */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>
                
                {/* Cabeçalho do Cartão */}
                <div className="flex justify-between items-start relative z-10">
                   <div className="flex flex-col gap-1">
                      <h4 className="text-xl font-black tracking-tight leading-none">{card.name}</h4>
                      <p className="text-[7px] font-bold uppercase tracking-[0.4em] opacity-40">Credit Card</p>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(card); }} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"><Pencil size={14}/></button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir este cartão?')) onRemove(card.id); }} className="p-2 bg-rose-500/80 rounded-xl hover:bg-rose-500 transition-all"><Trash2 size={14}/></button>
                   </div>
                </div>

                {/* Chip e Contactless */}
                <div className="flex items-center gap-6 relative z-10">
                   <div className="w-12 h-9 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 rounded-lg relative overflow-hidden shadow-inner border border-black/10">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[1px] opacity-20">
                         {Array.from({length: 6}).map((_, i) => <div key={i} className="border-[0.5px] border-black"></div>)}
                      </div>
                   </div>
                   <Wifi size={24} className="text-white/30 rotate-90" />
                </div>

                {/* Info e Bandeira */}
                <div className="flex justify-between items-end relative z-10">
                   <div>
                      <p className="text-[7px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Limit Available</p>
                      <p className="text-xl font-black tracking-tighter">R$ {card.limit.toLocaleString('pt-BR')}</p>
                      {account && (
                        <p className="text-[6px] font-black uppercase tracking-widest mt-2 bg-black/20 px-2 py-1 rounded w-fit">Auto Debit: {account.bankName}</p>
                      )}
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <div className="mb-1">{getBrandLogo(card.brand)}</div>
                      <div className="flex gap-4 text-[7px] font-black uppercase opacity-60">
                         <div>FECH: {card.closingDay}</div>
                         <div>VENC: {card.dueDay}</div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {cards.length === 0 && !showAdd && (
          <div className="py-24 text-center opacity-20 flex flex-col items-center">
            <div className="w-20 h-14 border-4 border-dashed border-slate-300 rounded-xl mb-4"></div>
            <p className="font-black text-xs uppercase tracking-[0.4em]">Nenhum cartão ativo</p>
          </div>
        )}
      </div>

      {!showAdd && (
        <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent z-10">
          <button onClick={() => setShowAdd(true)} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-[9px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
            <Plus size={20} /> Novo Cartão de Crédito
          </button>
        </div>
      )}
    </div>
  );
};
