import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Reminder, TransactionType, CreditCard } from '../types';
import { 
  Bell, Clock, AlertTriangle, CheckCircle, 
  CalendarDays, CalendarRange, ChevronRight, ChevronLeft,
  CreditCard as CardIcon, CreditCard as PayIcon,
  Check, AlertCircle, ArrowLeft, ReceiptText, 
  ShoppingBag, Calendar, Info, TrendingUp, TrendingDown,
  Square, CheckSquare, Wallet, LayoutGrid
} from 'lucide-react';
import { TransactionItem } from './TransactionItem';
import { getInvoiceKey } from '../utils/helpers';

interface Props {
  transactions: Transaction[];
  reminders: Reminder[];
  creditCards: CreditCard[];
  initialCardId?: string | null;
  initialInvoiceKey?: string | null;
  initialAccountId?: string | null;
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
  initialAccountId,
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
  const [selectedStatementAccount, setSelectedStatementAccount] = useState<string | null>(null);
  const [statementDate, setStatementDate] = useState(new Date());
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
      setSelectedInvoiceKey(targetKey);
      setSelectedStatementAccount(null);
    }
  }, [initialCardId, initialInvoiceKey]);

  useEffect(() => {
    if (initialAccountId !== undefined && initialAccountId !== null) {
      setSelectedStatementAccount(initialAccountId);
      setSelectedInvoiceKey(null);
    }
  }, [initialAccountId]);

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

  const statementData = useMemo(() => {
    if (!selectedStatementAccount) return null;
    
    const y = statementDate.getFullYear();
    const m = statementDate.getMonth();
    
    const filtered = transactions.filter(t => {
       const tDate = new Date(t.date + 'T12:00:00');
       const sameMonth = tDate.getFullYear() === y && tDate.getMonth() === m;
       
       if (!sameMonth) return false;
       
       if (selectedStatementAccount === 'all') {
          return t.type !== TransactionType.CREDIT_CARD;
       } else {
          return t.bankAccountId === selectedStatementAccount && t.type !== TransactionType.CREDIT_CARD;
       }
    });

    const income = filtered.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + Number(t.amount), 0);
    
    return { items: filtered, income, expense, balance: income - expense };
  }, [transactions, selectedStatementAccount, statementDate]);

  const currentInvoiceData = useMemo(() => {
    if (!selectedInvoiceKey) return null;
    let invoice = cardInvoices[selectedInvoiceKey];
    if (!invoice) {
        const [cardId, invKey] = selectedInvoiceKey.split('-');
        const card = creditCards.find(c => c.id === cardId);
        if (!card) return null;
        const [y, m] = invKey.split('-');
        const dueDate = `${y}-${m}-${String(card.dueDay).padStart(2, '0')}`;
        invoice = {
            total: 0,
            totalPaid: 0,
            card: card,
            date: dueDate,
            items: [],
            invoiceKey: invKey,
            isFullyPaid: true
        };
    }
    return invoice;
  }, [selectedInvoiceKey, cardInvoices, creditCards]);

  const totalDebtBalance = useMemo(() => {
      if (!currentInvoiceData) return 0;
      return transactions
        .filter(t => t.cardId === currentInvoiceData.card.id && t.type === TransactionType.CREDIT_CARD && !t.isPaid)
        .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [currentInvoiceData, transactions]);

  const invoiceDates = useMemo(() => {
      if (!currentInvoiceData) return { closing: '', due: '', monthLabel: '' };
      const [year, month] = currentInvoiceData.invoiceKey.split('-').map(Number);
      const dueDateObj = new Date(year, month - 1, currentInvoiceData.card.dueDay);
      let closingMonth = month - 1;
      let closingYear = year;
      if (currentInvoiceData.card.closingDay >= currentInvoiceData.card.dueDay) {
          closingMonth = month - 2; 
      }
      const closingDateObj = new Date(closingYear, closingMonth, currentInvoiceData.card.closingDay);
      return {
          closing: closingDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          due: dueDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          monthLabel: dueDateObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          status: (currentInvoiceData.total === 0 && currentInvoiceData.items.length === 0) ? 'Sem Fatura' :
                  (currentInvoiceData.isFullyPaid ? 'Paga' : 
                  (dueDateObj < new Date(todayStr + 'T00:00:00') ? 'Vencida' : 'Pendente'))
      };
  }, [currentInvoiceData, todayStr]);

  const toggleSelectItem = (id: string, isAlreadyPaid: boolean) => {
    if (isAlreadyPaid) return; 
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const selectedSum = useMemo(() => {
    if (!currentInvoiceData) return 0;
    return currentInvoiceData.items
      .filter((i: any) => selectedItems.has(i.id))
      .reduce((acc: number, cur: any) => acc + Number(cur.amount), 0);
  }, [selectedItems, currentInvoiceData]);

  const navigateInvoice = (direction: 'prev' | 'next') => {
      if (!currentInvoiceData) return;
      const [year, month] = currentInvoiceData.invoiceKey.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      if (direction === 'prev') date.setMonth(date.getMonth() - 1);
      else date.setMonth(date.getMonth() + 1);
      const nextYear = date.getFullYear();
      const nextMonth = date.getMonth() + 1;
      const nextKey = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
      setSelectedInvoiceKey(`${currentInvoiceData.card.id}-${nextKey}`);
      setSelectedItems(new Set());
  };

  const navigateStatement = (direction: 'prev' | 'next') => {
      const newDate = new Date(statementDate);
      if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
      else newDate.setMonth(newDate.getMonth() + 1);
      setStatementDate(newDate);
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col bg-white dark:bg-slate-900 relative">
      <>
        {selectedStatementAccount ? (
           <div key="statement" className="flex flex-col h-full">
              <div className="mb-6 flex items-center justify-between">
                <button onClick={() => setSelectedStatementAccount(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center gap-2 hover:text-primary transition-all"><ArrowLeft size={18}/> <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span></button>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                   <Wallet size={14} className="text-primary"/>
                   <span className="text-[9px] font-black uppercase tracking-widest">{selectedStatementAccount === 'all' ? 'Visão Geral' : 'Conta Selecionada'}</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-[3rem] shadow-2xl overflow-hidden mb-6 p-6 relative">
                 <div className="flex items-center justify-between mb-6">
                    <button onClick={() => navigateStatement('prev')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><ChevronLeft size={20}/></button>
                    <span className="text-sm font-black uppercase tracking-widest">{statementDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => navigateStatement('next')} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"><ChevronRight size={20}/></button>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                       <p className="text-[8px] font-black uppercase text-emerald-400 mb-1">Entradas</p>
                       <p className="text-xs font-black">{hideValues ? '•••' : (statementData?.income || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/20">
                       <p className="text-[8px] font-black uppercase text-rose-400 mb-1">Saídas</p>
                       <p className="text-xs font-black">{hideValues ? '•••' : (statementData?.expense || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                       <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Balanço</p>
                       <p className={`text-xs font-black ${(statementData?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {hideValues ? '•••' : (statementData?.balance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                 {statementData?.items.length === 0 ? (
                    <div className="text-center py-12 opacity-30">
                       <LayoutGrid size={40} className="mx-auto mb-2"/>
                       <p className="text-[9px] font-black uppercase tracking-widest">Sem movimentações</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {statementData?.items.sort((a,b) => b.date.localeCompare(a.date)).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700">
                             <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${item.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                   {item.type === TransactionType.INCOME ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-800 dark:text-white">{item.description}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {item.category}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className={`text-xs font-black ${item.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                                   {item.type === TransactionType.INCOME ? '+' : '-'} {hideValues ? '•••' : item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                {item.isPaid && <span className="text-[7px] font-black uppercase text-slate-300">Confirmado</span>}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        ) 
        : selectedInvoiceKey ? (
          <div key="invoiceDetail" className="flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => setSelectedInvoiceKey(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl flex items-center gap-2 hover:text-primary transition-all"><ArrowLeft size={18}/> <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span></button>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                 <CardIcon size={14} className="text-primary"/>
                 <span className="text-[9px] font-black uppercase tracking-widest">{currentInvoiceData?.card.name}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-6">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                   <button onClick={() => navigateInvoice('prev')} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-primary"><ChevronLeft size={20}/></button>
                   <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Fatura</span>
                      <span className="text-sm font-black uppercase text-slate-800 dark:text-white">{invoiceDates.monthLabel}</span>
                   </div>
                   <button onClick={() => navigateInvoice('next')} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-primary"><ChevronRight size={20}/></button>
                </div>

                <div className="p-8 text-center relative">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-4 ${
                       invoiceDates.status === 'Paga' ? 'bg-emerald-100 text-emerald-600' : 
                       invoiceDates.status === 'Vencida' ? 'bg-rose-100 text-rose-600 animate-pulse' : 
                       'bg-amber-100 text-amber-600'
                   }`}>
                       {invoiceDates.status === 'Paga' ? <CheckCircle size={10}/> : invoiceDates.status === 'Vencida' ? <AlertCircle size={10}/> : <Clock size={10}/>}
                       {invoiceDates.status}
                   </span>

                   <div className="mb-6">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total da Fatura</p>
                      <p className={`text-4xl font-black tracking-tighter ${invoiceDates.status === 'Paga' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                         {hideValues ? '•••••' : currentInvoiceData?.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                   </div>

                   <div className="flex justify-center gap-8 text-slate-500 dark:text-slate-400 mb-6">
                      <div className="flex flex-col items-center">
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Fechamento</span>
                         <span className="text-xs font-bold text-slate-800 dark:text-white">{invoiceDates.closing}</span>
                      </div>
                      <div className="w-[1px] bg-slate-200 dark:bg-slate-700 h-8"></div>
                      <div className="flex flex-col items-center">
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Vencimento</span>
                         <span className="text-xs font-bold text-slate-800 dark:text-white">{invoiceDates.due}</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 inline-block w-full">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Saldo Devedor Total (Todas Faturas)</p>
                      <p className="text-sm font-black text-rose-500">{hideValues ? '•••••' : totalDebtBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                   </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-8 pr-1">
               {currentInvoiceData?.items.length === 0 ? (
                   <div className="text-center py-12 opacity-30">
                       <ShoppingBag size={40} className="mx-auto mb-2"/>
                       <p className="text-[9px] font-black uppercase tracking-widest">Sem compras neste mês</p>
                   </div>
               ) : (
                   currentInvoiceData?.items.sort((a:any,b:any) => b.date.localeCompare(a.date)).map((item: any) => (
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
                           <p className={`font-black text-sm ${item.isPaid ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>{Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           {item.isPaid && <span className="text-[7px] font-black uppercase text-emerald-500 tracking-widest">Pago</span>}
                        </div>
                     </div>
                   ))
               )}
            </div>

            <div className="pt-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
               {!currentInvoiceData?.isFullyPaid && currentInvoiceData && currentInvoiceData.total > 0 && (
                  selectedItems.size > 0 ? (
                    <button onClick={() => { if(currentInvoiceData) { onPayInvoice(currentInvoiceData.card.id, currentInvoiceData.invoiceKey, selectedSum, Array.from(selectedItems)); setSelectedInvoiceKey(null); } }} className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                       <CheckCircle size={20}/> Pagar Selecionados ({selectedItems.size})
                    </button>
                  ) : (
                    <button onClick={() => { if(currentInvoiceData) { onPayInvoice(currentInvoiceData.card.id, currentInvoiceData.invoiceKey, currentInvoiceData.total); setSelectedInvoiceKey(null); } }} className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                       <CheckCircle size={20}/> Pagar Fatura Total
                    </button>
                  )
               )}
            </div>
          </div>
        ) 
        : (
          <div key="list" className="flex flex-col h-full">
            <div className="mb-8 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-sm"><Bell size={24}/></div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Notificações</h3>
                <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Gestão de Vencimentos e Ciclos</p>
              </div>
            </div>

            <div className="relative mb-6">
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

            <div className={`flex-1 overflow-y-auto custom-scrollbar pb-10 rounded-[2rem] p-2 transition-colors ${activeFilter === 'OVERDUE' ? 'bg-rose-500/5' : ''}`}>
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
                }) : <div className="p-24 text-center opacity-20 flex flex-col items-center"><CheckCircle size={56} className="mb-4 text-emerald-500" /><p className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-500">Tudo em dia!</p></div>}
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};