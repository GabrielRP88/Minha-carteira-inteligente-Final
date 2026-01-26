
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
                className={`aspect-square rounded-2xl flex flex-col justify-start items-center gap-1 p-1 pt-2 transition-all relative border-2 ${
                  isSelected ? 'bg-primary border-primary text-white shadow-lg scale-110 z-10' : 
                  isToday ? 'border-primary/30 bg-primary/5 text-primary' :
                  'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-xs font-black leading-none">{day.getDate()}</span>
                <div className="flex gap-0.5 justify-center w-full mt-auto mb-1">
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
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border border-white/20 shadow-2xl">
                    <span className="text-[9px] font-black uppercase opacity-60 leading-none mb-1">{getWeekdayName(selectedDate)}</span>
                    <span className="text-4xl font-black leading-none tracking-tighter">{selectedDate.getDate()}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tight">{months[selectedDate.getMonth()]}</h4>
                    <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{selectedDate.getFullYear()}</p>
                  </div>
                </div>

                <button onClick={handleNextDay} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90 border border-white/5">
                   <ChevronRight size={24}/>
                </button>
              </div>
            </div>

            {/* SEÇÃO: NOTAS DO DIA */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <StickyNote size={14} className="text-emerald-500"/>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bloco de Notas</h5>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-900/30 p-4">
                <textarea 
                  value={noteValue}
                  onChange={handleNoteChange}
                  placeholder="Escreva algo sobre este dia..."
                  className="w-full bg-transparent min-h-[100px] outline-none font-bold text-sm text-slate-700 dark:text-slate-200 placeholder:text-emerald-300 dark:placeholder:text-emerald-800 resize-none leading-relaxed"
                />
                <div className="flex justify-end mt-2">
                   <div className="flex items-center gap-1.5 text-[7px] font-black uppercase text-emerald-500 opacity-60">
                      <Save size={10}/> Auto-salvamento ativo
                   </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO: LEMBRETES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-rose-500"/>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lembretes</h5>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-800 focus-within:border-rose-500/20 transition-all">
                   <input 
                     value={newReminderText} 
                     onChange={e => setNewReminderText(e.target.value)}
                     placeholder="Novo lembrete rápido..." 
                     className="flex-1 bg-transparent px-3 py-1 font-bold text-xs outline-none" 
                   />
                   <button onClick={handleAddQuickReminder} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
                      <Plus size={16}/>
                   </button>
                </div>

                {dayReminders.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {dayReminders.map(r => (
                      <div 
                        key={r.id} 
                        className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${r.completed ? 'bg-slate-50 dark:bg-slate-800/30 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800'}`}
                      >
                        <div className="flex items-center gap-4">
                          <button onClick={() => onToggleReminder(r.id)} className={`transition-all ${r.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-rose-400'}`}>
                            {r.completed ? <CheckCircle2 size={24}/> : <Circle size={24}/>}
                          </button>
                          <p className={`text-xs font-black ${r.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO: MOVIMENTAÇÕES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-primary"/>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Movimentações</h5>
                </div>
                <button onClick={() => onAddTransaction(selectedDateStr)} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Plus size={14}/></button>
              </div>
              
              <div className="space-y-2">
                {dayTransactions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Sem transações financeiras</p>
                  </div>
                ) : (
                  dayTransactions.map(t => (
                    <button 
                      key={t.id} 
                      onClick={() => onViewTransaction(t)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-3xl hover:border-primary transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`p-2.5 rounded-xl ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {t.type === TransactionType.INCOME ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors truncate max-w-[120px]">{t.description}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-black ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={onGoToMainFilter}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Abrir no Extrato Principal <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
