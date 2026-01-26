
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Reminder, TransactionType, CreditCard } from '../types';
import { 
  Bell, Clock, AlertTriangle, CheckCircle, 
  CalendarDays, CalendarRange, ChevronRight,
  CreditCard as CardIcon, CreditCard as PayIcon,
  Check, AlertCircle, ArrowLeft, ReceiptText, 
  ShoppingBag, Calendar, Info, TrendingUp,
  Square, CheckSquare
} from 'lucide-react';
import { TransactionItem } from './TransactionItem';
import { motion, AnimatePresence } from 'framer-motion';
import { getInvoiceKey } from '../utils/helpers';

interface Props {
  transactions: Transaction[];
  reminders: Reminder[];
  creditCards: CreditCard[];
  initialCardId?: string | null;
  initialInvoiceKey?: string | null;
  onOpenTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenReminders: () => void;
  onSelectDate: (date: Date) => void; 
  onPayInvoice: (cardId: string, invoiceKey: string, total: number, selectedIds?: string[]) => void;
  todayStr: string;
  tomorrowStr: string;
  hideValues?: boolean;
}

type FilterType = 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'NEXT_DAYS';

export const NotificationCenter: React.FC<Props> = ({ 
  transactions, 
  reminders, 
  creditCards,
  initialCardId,
  initialInvoiceKey,
  onOpenTransaction, 
  onUpdateTransaction,
  onDeleteTransaction,
  onOpenReminders, 
  onPayInvoice,
  todayStr, 
  tomorrowStr,
  hideValues
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('TODAY');
  const [selectedInvoiceKey, setSelectedInvoiceKey] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const cardInvoices = useMemo(() => {
    const cardTransactions = transactions.filter(t => t.type === TransactionType.CREDIT_CARD);
    const invoices: Record<string, { total: number, totalPaid: number, card: CreditCard, date: string, items: Transaction[], invoiceKey: string, isFullyPaid: boolean }> = {};
    
    cardTransactions.forEach(t => {
      if (t.cardId) {
        const card = creditCards.find(c => c.id === t.cardId);
        if (card) {
          const invKey = getInvoiceKey(t.date, card.closingDay); 
          const key = `${t.cardId}-${invKey}`;
          
          if (!invoices[key]) {
            const [y, m] = invKey.split('-');
            const dueDate = `${y}-${m}-${String(card.dueDay).padStart(2, '0')}`;
            invoices[key] = { total: 0, totalPaid: 0, card, date: dueDate, items: [], invoiceKey: invKey, isFullyPaid: false };
          }
          invoices[key].items.push(t);
          if (t.isPaid) invoices[key].totalPaid += Number(t.amount);
          else invoices[key].total += Number(t.amount);
        }
      }
    });

    Object.keys(invoices).forEach(k => {
      const inv = invoices[k];
      inv.isFullyPaid = inv.items.length > 0 && inv.items.every(i => i.isPaid);
      
      if (!inv.isFullyPaid) {
         const [cardId, currentKey] = k.split('-');
         const oldPending = transactions.filter(t => 
           t.type === TransactionType.CREDIT_CARD && 
           !t.isPaid && 
           t.cardId === cardId && 
           getInvoiceKey(t.date, inv.card.closingDay) < currentKey
         );
         oldPending.forEach(o => {
            if (!inv.items.find(x => x.id === o.id)) {
               inv.items.push(o);
               inv.total += Number(o.amount);
            }
         });
      }
    });

    return invoices;
  }, [transactions, creditCards]);

  useEffect(() => {
    if (initialCardId && initialInvoiceKey) {
      const targetKey = `${initialCardId}-${initialInvoiceKey}`;
      if (cardInvoices[targetKey]) setSelectedInvoiceKey(targetKey);
    }
  }, [initialCardId, initialInvoiceKey, cardInvoices]);

  const allItemsMapped = useMemo(() => {
    const bankPending = transactions.filter(t => !t.isPaid && (t.type === TransactionType.EXPENSE || t.type === TransactionType.INCOME));
    const activeReminders = reminders.filter(r => !r.completed);
    
    return [
      ...bankPending.map(t => ({ ...t, itemType: 'TRANS' as const })),
      ...Object.entries(cardInvoices)
        .map(([id, data]: [string, any]) => ({
          id,
          description: `Fatura ${data.card.name}`,
          amount: data.total,
          date: data.date,
          itemType: 'INVOICE' as const,
          cardName: data.card.name,
          cardId: data.card.id,
          invoiceKey: data.invoiceKey,
          count: data.items.length,
          type: TransactionType.EXPENSE,
          isFullyPaid: data.isFullyPaid
        })),
      ...activeReminders.map(r => ({ ...r, itemType: 'REM' as const }))
    ];
  }, [transactions, reminders, cardInvoices]);

  const filteredItems = useMemo(() => {
    return allItemsMapped.filter(item => {
      // Se for fatura paga, não mostrar em vencidos
      if (item.itemType === 'INVOICE' && (item as any).isFullyPaid) {
          if (activeFilter === 'OVERDUE') return false;
      }

      if (activeFilter === 'OVERDUE') return item.date < todayStr;
      if (activeFilter === 'TODAY') return item.date === todayStr;
      if (activeFilter === 'TOMORROW') return item.date === tomorrowStr;
      if (activeFilter === 'NEXT_DAYS') return item.date > tomorrowStr;
      return false;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [allItemsMapped, activeFilter, todayStr, tomorrowStr]);

  const stats = useMemo(() => {
    const pendingsOnly = allItemsMapped.filter(i => (i as any).isFullyPaid !== true && (i as any).completed !== true);
    return {
      OVERDUE: pendingsOnly.filter(i => i.date < todayStr).length,
      TODAY: pendingsOnly.filter(i => i.date === todayStr).length,
      TOMORROW: pendingsOnly.filter(i => i.date === tomorrowStr).length,
      NEXT_DAYS: pendingsOnly.filter(i => i.date > tomorrowStr).length
    };
  }, [allItemsMapped, todayStr, tomorrowStr]);

  const selectedInvoice = selectedInvoiceKey ? cardInvoices[selectedInvoiceKey] : null;

  const toggleSelectItem = (id: string, isAlreadyPaid: boolean) => {
    if (isAlreadyPaid) return; 
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const selectedSum = useMemo(() => {
    if (!selectedInvoice) return 0;
    return selectedInvoice.items
      .filter((i: any) => selectedItems.has(i.id))
      .reduce((acc: number, cur: any) => acc + Number(cur.amount), 0);
  }, [selectedItems, selectedInvoice]);

  return (
    <div className="p-6 md:p-8 h-full flex flex-col bg-white dark:bg-slate-900 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedInvoiceKey ? (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full overflow-hidden">
            <div className="mb-8 flex items-center gap-4 shrink-0">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm"><Bell size={24}/></div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Notificações</h3>
                <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Gestão de Vencimentos e Ciclos</p>
              </div>
            </div>

            <div className="relative mb-6 shrink-0">
              <div className="flex gap-2.5 p-2 bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-x-auto no-scrollbar border border-slate-200/50 dark:border-slate-800 flex-nowrap">
                {[
                  { id: 'OVERDUE', label: 'Vencidos', icon: <AlertCircle size={14}/>, count: stats.OVERDUE, activeBg: 'bg-rose-500' }, 
                  { id: 'TODAY', label: 'Hoje', icon: <Clock size={14}/>, count: stats.TODAY, activeBg: 'bg-primary' }, 
                  { id: 'TOMORROW', label: 'Amanhã', icon: <CalendarDays size={14}/>, count: stats.TOMORROW, activeBg: 'bg-primary' }, 
                  { id: 'NEXT_DAYS', label: 'Próximos Dias', icon: <CalendarRange size={14}/>, count: stats.NEXT_DAYS, activeBg: 'bg-primary' }
                ].map(filter => (
                  <button key={filter.id} onClick={() => setActiveFilter(filter.id as FilterType)} className={`min-w-[110px] flex-1 py-4 rounded-[1.5rem] flex flex-col items-center gap-2 transition-all relative shrink-0 ${activeFilter === filter.id ? `${filter.activeBg} text-white shadow-lg` : `text-slate-400 opacity-80 hover:opacity-100`}`}>
                    <div>{filter.icon}</div>
                    <span className="text-[7px] font-black uppercase tracking-widest whitespace-nowrap">{filter.label}</span>
                    {filter.count > 0 && <span className={`absolute top-2 right-2 w-4 h-4 rounded-full text-[7px] font-black flex items-center justify-center ${activeFilter === filter.id ? 'bg-white text-slate-900' : 'bg-current text-white invert'}`}>{filter.count}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar min-h-0 pb-10 rounded-[2rem] p-2 transition-colors touch-pan-y overscroll-contain ${activeFilter === 'OVERDUE' ? 'bg-rose-500/5' : ''}`}>
              <div className="space-y-4">
                {filteredItems.length > 0 ? filteredItems.map((item: any, idx) => {
                  const isLate = item.date < todayStr && !item.isFullyPaid;
                  
                  if (item.itemType === 'INVOICE') {
                    return (
                      <div key={idx} onClick={() => { setSelectedInvoiceKey(item.id); setSelectedItems(new Set()); }} className={`p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border cursor-pointer hover:scale-[1.02] transition-all ${item.isFullyPaid ? 'bg-emerald-600 border-emerald-400' : isLate ? 'bg-rose-600 border-rose-400' : 'bg-slate-900 border-white/5'} text-white`}>
                        <div className="relative z-10">
                          <p className="text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                            <PayIcon size={12}/> {item.isFullyPaid ? 'Fatura Paga ✅' : (isLate ? 'Fatura Atrasada ⚠️' : 'Fatura de Cartão')}
                          </p>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-black">{item.cardName}</h4>
                            <ChevronRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                              <p className="text-[7px] font-black uppercase opacity-60 mb-0.5">{item.isFullyPaid ? 'Total Liquidado' : 'Total Aberto'}</p>
                              <p className="text-lg font-black">{hideValues ? '••••' : Number(item.amount || (item as any).totalPaid || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                              <p className="text-[7px] font-black uppercase opacity-60 mb-0.5">Vencimento</p>
                              <p className="text-xs font-black">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (item.itemType === 'TRANS') {
                    return (
                      <div key={item.id} className={`rounded-[2rem] border-2 overflow-hidden transition-all ${item.type === TransactionType.INCOME ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-50 dark:border-slate-800'}`}>
                        {item.type === TransactionType.INCOME && (
                          <div className="bg-emerald-500 px-4 py-1 flex items-center gap-2">
                            <TrendingUp size={10} className="text-white"/>
                            <span className="text-[7px] font-black uppercase text-white tracking-widest">Recebimento Agendado</span>
                          </div>
                        )}
                        <TransactionItem 
                          transaction={item} onDelete={onDeleteTransaction} 
                          onToggleStatus={() => onUpdateTransaction({ ...item, isPaid: true })}
                          onUpdate={onUpdateTransaction} onEdit={onOpenTransaction}
                          hideValues={hideValues} todayStr={todayStr}
                        />
                      </div>
                    );
                  }
                  return (
                    <button key={item.id} onClick={onOpenReminders} className={`w-full p-6 border-2 rounded-[2rem] text-left flex items-center justify-between group shadow-sm transition-all ${isLate ? 'bg-rose-50 border-rose-200' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isLate ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}><Clock size={18}/></div>
                        <div>
                          <p className="text-[8px] font-black uppercase text-slate-400">Lembrete</p>
                          <p className={`font-bold text-sm ${isLate ? 'text-rose-700' : 'text-slate-700 dark:text-slate-200'}`}>{item.text}</p>
                          <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')} {item.time}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-200 group-hover:text-primary transition-all"/>
                    </button>
                  );
                }) : (
                  <div className="p-24 text-center opacity-20 flex flex-col items-center">
                    <CheckCircle size={56} className="mb-4 text-emerald-500" />
                    <p className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-500">
                      {activeFilter === 'NEXT_DAYS' ? 'Sem pendências futuras' : 'Tudo em dia!'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col h-full overflow-hidden">
            <div className="mb-8 flex items-center justify-between shrink-0">
              <button onClick={() => setSelectedInvoiceKey(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center gap-2 hover:text-primary transition-all"><ArrowLeft size={18}/> <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span></button>
              <div className="text-right">
                <h4 className="text-xl font-black uppercase leading-none mb-1">{selectedInvoice?.card.name}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Venc: {new Date(selectedInvoice?.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className={`rounded-[2.5rem] p-8 mb-8 text-white relative overflow-hidden shadow-2xl transition-colors shrink-0 ${selectedInvoice?.isFullyPaid ? 'bg-emerald-600' : 'bg-slate-900'}`}>
               <div className="absolute top-0 right-0 p-6 opacity-10"><ReceiptText size={60}/></div>
               <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">
                  {selectedInvoice?.isFullyPaid ? 'Fatura Liquidada' : (selectedItems.size > 0 ? `Pagamento Selecionado (${selectedItems.size})` : 'Total Desta Fatura')}
               </p>
               <div className="flex flex-col gap-1">
                 <p className="text-4xl font-black tracking-tighter">
                   {hideValues ? '••••' : (selectedItems.size > 0 ? selectedSum : (selectedInvoice?.isFullyPaid ? selectedInvoice?.totalPaid : selectedInvoice?.total)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </p>
                 {selectedInvoice?.isFullyPaid && (
                    <div className="mt-4 flex items-center gap-2 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm">
                       <Check size={14} strokeWidth={4}/>
                       <span className="text-[9px] font-black uppercase tracking-widest">Tudo Pago</span>
                    </div>
                 )}
               </div>
            </div>

            <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-4 mb-4 flex items-center gap-2 shrink-0"><ShoppingBag size={12}/> Detalhes do Ciclo</h5>

            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-2 pb-8 pr-2 touch-pan-y overscroll-contain">
               {selectedInvoice?.items.sort((a:any,b:any) => b.date.localeCompare(a.date)).map((item: any) => (
                 <div 
                   key={item.id} 
                   onClick={() => toggleSelectItem(item.id, item.isPaid)} 
                   className={`flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all ${item.isPaid ? 'border-emerald-500/20 bg-emerald-500/[0.03] opacity-60' : (selectedItems.has(item.id) ? 'border-primary bg-primary/5' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800')} ${!item.isPaid ? 'cursor-pointer' : 'cursor-default'}`}
                 >
                    <div className={item.isPaid ? 'text-emerald-500' : (selectedItems.has(item.id) ? 'text-primary' : 'text-slate-300')}>
                       {item.isPaid ? <CheckCircle size={24} /> : (selectedItems.has(item.id) ? <CheckSquare size={24} /> : <Square size={24} />)}
                    </div>
                    <div className="flex-1">
                       <p className={`text-sm font-bold ${item.isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.description}</p>
                       <p className="text-[9px] font-black opacity-30 uppercase">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {item.category}</p>
                    </div>
                    <div className="text-right">
                       <p className={`font-black text-sm ${item.isPaid ? 'text-emerald-500' : 'text-rose-500'}`}>{Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                       {item.isPaid && <span className="text-[7px] font-black uppercase text-emerald-500 tracking-widest">Pago</span>}
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-6 space-y-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
               {!selectedInvoice?.isFullyPaid && (
                  selectedItems.size > 0 ? (
                    <button onClick={() => { if(selectedInvoice) { onPayInvoice(selectedInvoice.card.id, selectedInvoice.invoiceKey, selectedSum, Array.from(selectedItems)); setSelectedInvoiceKey(null); } }} className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                       <CheckCircle size={20}/> Pagar Selecionados
                    </button>
                  ) : (
                    <button onClick={() => { if(selectedInvoice) { onPayInvoice(selectedInvoice.card.id, selectedInvoice.invoiceKey, selectedInvoice.total); setSelectedInvoiceKey(null); } }} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                       <CheckCircle size={20}/> Pagar Fatura Total
                    </button>
                  )
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
