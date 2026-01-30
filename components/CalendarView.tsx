import React, { useMemo, useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Receipt, Bell, 
  TrendingUp, TrendingDown, CheckCircle2, Circle, 
  ArrowRight, Calendar as CalendarIcon, StickyNote,
  Clock, CreditCard, Wallet, List, Save, ArrowLeft,
  CalendarDays, Check
} from 'lucide-react';
import { PeriodType, Transaction, Reminder, TransactionType } from '../types';

interface Props {
  period: PeriodType;
  setPeriod: (p: PeriodType) => void;
  selectedDate: Date;
  onChangeDate: (d: Date) => void;
  daysWithTransactions: string[];
  daysWithReminders?: string[];
  daysWithNotes?: string[];
  transactions: Transaction[];
  reminders: Reminder[];
  dailyNotes: Record<string, string>;
  onUpdateDailyNote: (date: string, text: string) => void;
  onAddTransaction: (date: string) => void;
  onAddReminder: (date: string, text: string) => void;
  onToggleReminder: (id: string) => void;
  onViewTransaction: (t: Transaction) => void;
  onGoToMainFilter: () => void;
}

// FIX: Export CalendarView component.
export const CalendarView: React.FC<Props> = ({ 
  period, 
  setPeriod, 
  selectedDate, 
  onChangeDate, 
  daysWithTransactions,
  daysWithReminders = [],
  daysWithNotes = [],
  transactions,
  reminders,
  dailyNotes,
  onUpdateDailyNote,
  onAddTransaction,
  onAddReminder,
  onToggleReminder,
  onViewTransaction,
  onGoToMainFilter
}) => {
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'DAY_DETAILS'>('CALENDAR');
  const [newReminderText, setNewReminderText] = useState('');
  const [noteValue, setNoteValue] = useState('');

  const selectedDateStr = useMemo(() => {
    return selectedDate.toLocaleDateString('en-CA');
  }, [selectedDate]);

  useEffect(() => {
    setNoteValue(dailyNotes[selectedDateStr] || '');
  }, [selectedDateStr, dailyNotes]);

  const dayTransactions = useMemo(() => {
    return transactions.filter(t => t.date === selectedDateStr);
  }, [transactions, selectedDateStr]);

  const dayReminders = useMemo(() => {
    return reminders.filter(r => r.date === selectedDateStr);
  }, [reminders, selectedDateStr]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrev = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    onChangeDate(d);
  };

  const handleNext = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    onChangeDate(d);
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onChangeDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onChangeDate(d);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteValue(val);
    onUpdateDailyNote(selectedDateStr, val);
  };

  const handleAddQuickReminder = () => {
    if (!newReminderText.trim()) return;
    onAddReminder(selectedDateStr, newReminderText);
    setNewReminderText('');
  };

  const renderCalendar = () => {
    const currentDays = getDaysInMonth(selectedDate);
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d) => (
            <div key={d} className="text-center text-[7px] font-black opacity-30 py-2 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {currentDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
            
            const dateStr = day.toLocaleDateString('en-CA');
            const isSelected = selectedDateStr === dateStr;
            const hasTrans = daysWithTransactions.includes(dateStr);
            const hasRem = daysWithReminders.includes(dateStr);
            const hasNote = daysWithNotes.includes(dateStr);
            const isToday = new Date().toLocaleDateString('en-CA') === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => {
                  onChangeDate(day);
                  setViewMode('DAY_DETAILS');
                }}
                className={`aspect-square rounded-2xl flex flex-col justify-between items-center p-1 pt-2 transition-all relative border-2 ${
                  isSelected ? 'bg-primary border-primary text-white shadow-lg scale-110 z-10' : 
                  isToday ? 'border-primary/30 bg-primary/5 text-primary' :
                  'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-black">{day.getDate()}</span>
                <div className="flex gap-0.5 justify-center w-full mb-1">
                  {hasTrans && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></div>}
                  {hasRem && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-rose-500'}`}></div>}
                  {hasNote && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/40' : 'bg-emerald-500'}`}></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Capitalize first letter of weekday
  const getWeekdayName = (date: Date) => {
    const name = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    return name.charAt(0).toUpperCase() + name.slice(1).split('-')[0];
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* HEADER FIXO DO CALENDÁRIO */}
      {viewMode === 'CALENDAR' && (
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black tracking-tight uppercase leading-none">Calendário</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1">Agenda Inteligente</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('CALENDAR')} 
                className={`p-3 rounded-2xl transition-all ${viewMode === 'CALENDAR' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                <CalendarIcon size={18}/>
              </button>
              <button 
                onClick={() => setViewMode('DAY_DETAILS')} 
                className={`p-3 rounded-2xl transition-all ${viewMode === 'DAY_DETAILS' ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
              >
                <List size={18}/>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6 bg-slate-50 dark:bg-slate-800 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-700">
            <button onClick={handlePrev} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all"><ChevronLeft size={20}/></button>
            <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white">
              {months[selectedDate.getMonth()]} <span className="opacity-30">{selectedDate.getFullYear()}</span>
            </span>
            <button onClick={handleNext} className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all"><ChevronRight size={20}/></button>
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO SCROLLABLE */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar px-6 pb-10 ${viewMode === 'DAY_DETAILS' ? 'pt-6' : ''}`}>
        {viewMode === 'CALENDAR' ? (
          <>
            {renderCalendar()}
            <div className="mt-8 grid grid-cols-3 gap-2">
              <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex flex-col items-center gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                <span className="text-[6px] font-black uppercase text-indigo-600 tracking-widest">Finanças</span>
              </div>
              <div className="p-3 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex flex-col items-center gap-1">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                <span className="text-[6px] font-black uppercase text-rose-600 tracking-widest">Alertas</span>
              </div>
              <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex flex-col items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[6px] font-black uppercase text-emerald-600 tracking-widest">Notas</span>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
            {/* CABEÇALHO DA AGENDA COM NAVEGAÇÃO DE DIAS */}
            <div className="flex flex-col gap-6 p-6 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><CalendarIcon size={120}/></div>
              
              {/* Barra Superior: Voltar e Título */}
              <div className="flex items-center justify-between relative z-10">
                <button onClick={() => setViewMode('CALENDAR')} className="flex items-center gap-2 p-2 pr-4 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                  <ArrowLeft size={16}/> <span className="text-[9px] font-black uppercase tracking-widest">Voltar</span>
                </button>
                <div className="flex items-center gap-1.5 opacity-50">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                   <span className="text-[8px] font-black uppercase tracking-widest">Agenda Inteligente</span>
                </div>
              </div>

              {/* Área de Navegação de Datas */}
              <div className="flex items-center justify-between relative z-10">
                <button onClick={handlePrevDay} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90 border border-white/5">
                   <ChevronLeft size={24}/>
                </button>

                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-primary rounded-3xl flex flex-col items-center justify-center shadow-2xl shadow-primary/30 border-4 border-white/10">
                    <span className="text-4xl font-black tracking-tighter">{selectedDate.getDate()}</span>
                  </div>
                  <div className="text-left">
                     <span className="font-black text-2xl uppercase tracking-wider">{getWeekdayName(selectedDate)}</span>
                     <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                       {months[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
                     </p>
                  </div>
                </div>
                
                <button onClick={handleNextDay} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90 border border-white/5">
                   <ChevronRight size={24}/>
                </button>
              </div>
            </div>

            {/* SEÇÃO DE LEMBRETES */}
            <div className="space-y-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <Bell size={10}/> Lembretes
              </p>
              {dayReminders.length > 0 && dayReminders.map(r => (
                <div key={r.id} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onToggleReminder(r.id)} className="transition-transform active:scale-90">
                      {r.completed ? <CheckCircle2 size={18} className="text-rose-400"/> : <Circle size={18} className="text-rose-200 group-hover:text-rose-400"/>}
                    </button>
                    <div className={r.completed ? 'line-through opacity-50' : ''}>
                      <p className="text-[9px] font-black text-rose-800 uppercase">{r.text}</p>
                      <p className="text-[7px] font-bold text-rose-400 uppercase">{r.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                 <input value={newReminderText} onChange={e => setNewReminderText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddQuickReminder()} placeholder="Novo lembrete rápido..." className="flex-1 bg-transparent px-3 py-2 text-xs font-bold outline-none"/>
                 <button onClick={handleAddQuickReminder} className="p-2.5 bg-primary text-white rounded-xl"><Plus size={14}/></button>
              </div>
            </div>
            
            {/* SEÇÃO DE TRANSAÇÕES */}
            <div className="space-y-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <Wallet size={10}/> Transações
              </p>
              {dayTransactions.length > 0 ? dayTransactions.map(t => {
                 const isIncome = t.type === TransactionType.INCOME;
                 const isCard = t.type === TransactionType.CREDIT_CARD;
                 return (
                   <div key={t.id} onClick={() => onViewTransaction(t)} className="p-4 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:border-primary/20">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : isCard ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                           {isIncome ? <TrendingUp size={16}/> : isCard ? <CreditCard size={16}/> : <TrendingDown size={16}/>}
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase">{t.description}</p>
                           <p className="text-[7px] font-bold text-slate-400 uppercase">{t.category}</p>
                        </div>
                     </div>
                     <span className={`text-xs font-black ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{isIncome ? '+' : '-'} {t.amount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                   </div>
                 );
              }) : (
                <div className="text-center py-6">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Nenhum lançamento</p>
                </div>
              )}
              <button onClick={() => onAddTransaction(selectedDateStr)} className="w-full py-4 bg-primary/10 text-primary rounded-2xl font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 border border-dashed border-primary/20 hover:bg-primary/20">
                 <Plus size={12}/> Adicionar Lançamento
              </button>
            </div>
            
            {/* SEÇÃO NOTA RÁPIDA */}
            <div className="space-y-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <StickyNote size={10}/> Bloco de Notas do Dia
              </p>
              <div className="relative">
                <textarea 
                  value={noteValue}
                  onChange={handleNoteChange}
                  placeholder="Anotações para este dia..."
                  className="w-full h-32 p-4 bg-amber-500/5 border-2 border-amber-500/10 rounded-2xl text-xs font-bold leading-relaxed resize-none outline-none focus:border-amber-500/50"
                />
                <Save size={12} className="absolute bottom-4 right-4 text-amber-500/20"/>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
