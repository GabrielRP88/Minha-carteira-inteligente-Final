
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Transaction, TransactionType, BankAccount, UserProfile, CreditCard, Reminder, AutoBackupConfig, PeriodType, FamilyMember } from './types';
import { TransactionForm } from './components/TransactionForm';
import { TransactionItem } from './components/TransactionItem';
import { Calculator } from './components/Calculator';
import { Notes } from './components/Notes';
import { Reminders } from './components/Reminders';
import { BankAccountManager, BANK_PRESETS } from './components/BankAccountManager';
import { CreditCardManager } from './components/CreditCardManager';
import { ProfileEditor } from './components/ProfileEditor';
import { SecuritySettings } from './components/SecuritySettings';
import { SecurityLock } from './components/SecurityLock';
import { DatabaseManager } from './components/DatabaseManager';
import { FilesManager } from './components/FilesManager';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationSettings } from './components/NotificationSettings';
import { CalendarView } from './components/CalendarView';
import { THEMES, CATEGORIES as DEFAULT_CATEGORIES } from './constants';
import { translations, Language } from './locales';
import { playNotificationSound } from './utils/audio';
import { DAILY_QUOTES, getDayOfYearIndex } from './quotes';
import { getLocalDateStr, getInvoiceKey, generateId } from './utils/helpers';
import { 
  Plus, Sun, Moon, Palette, Menu, CreditCard as CreditCardIcon, ChevronRight, ChevronLeft, X, 
  LayoutGrid, Building2, UserCircle, Shield, Globe, Eye, EyeOff, Calculator as CalcIcon, StickyNote, Bell, Minus, 
  LayoutList, BellRing, ArrowRightLeft, FolderOpen, Check, List, Lock,
  TrendingUp, AlertCircle, Wallet, AlertTriangle, Calendar, History, Search, CalendarDays, ArrowLeft, Coins, Lightbulb, TrendingDown, DollarSign,
  GripHorizontal
} from 'lucide-react';
import { TutorialPanel } from './components/TutorialPanel';
import { FamilyManager } from './components/FamilyManager';
import { CurrencyConverter } from './components/CurrencyConverter';
import { getSmartInsights } from './services/geminiService';

export const APP_ICON_URL = "https://cdn-icons-png.flaticon.com/512/9181/9181081.png";

const DEFAULT_USER: UserProfile = { 
  id: '0', 
  name: 'Visitante', 
  isLocal: true, 
  notificationsEnabled: true, 
  notificationSound: 'cash_register' 
};

const safeLoad = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined" || saved === "null" || saved === "") return defaultValue;
    return JSON.parse(saved) ?? defaultValue;
  } catch (e) { return defaultValue; }
};

const safeSave = (key: string, value: any) => {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
};

const sanitizeTransactions = (data: any[]): Transaction[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(t => t && typeof t === 'object').map(t => ({
    ...t,
    id: String(t.id || generateId()),
    amount: isNaN(Number(t.amount)) ? 0 : Number(t.amount),
    date: typeof t.date === 'string' && t.date.length >= 10 ? t.date : getLocalDateStr(),
    type: t.type || TransactionType.EXPENSE,
    isPaid: Boolean(t.isPaid),
  }));
};

const StandardHeader: React.FC<{ t: any, compact?: boolean }> = ({ t, compact }) => (
  <div className={`flex flex-col items-center text-center ${compact ? 'mb-4' : 'mb-2'}`}>
    <div className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl flex items-center justify-center p-5 mb-2 border-4 border-primary/5 transition-transform hover:scale-110 duration-300`}>
      <img src={APP_ICON_URL} alt="Logo" className="w-full h-full object-contain" />
    </div>
    <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">
      {t.appName} <span className="text-primary">{t.smart}</span>
    </h1>
  </div>
);

const DraggableWidget: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const controls = useDragControls();
  
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className="relative" 
      whileDrag={{ scale: 1.02, zIndex: 100, opacity: 0.95 }}
    >
      <div 
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-16 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none group"
        onPointerDown={(e) => controls.start(e)}
      >
        <div className="bg-slate-100 dark:bg-slate-800/80 text-slate-300 dark:text-slate-600 group-hover:text-primary group-hover:bg-white dark:group-hover:bg-slate-800 rounded-full py-1 px-3 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all flex gap-1">
           <GripHorizontal size={14} />
        </div>
      </div>
      {children}
    </Reorder.Item>
  );
};

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<Language>('pt');
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  
  const [appPin, setAppPin] = useState(() => localStorage.getItem('wallet_app_pin') || '');
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem('wallet_app_pin'));
  
  const [viewAccountId, setViewAccountId] = useState<'all' | string>('all');
  const [viewCardId, setViewCardId] = useState<'all' | string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePanel, setActivePanel] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preSelectedType, setPreSelectedType] = useState<TransactionType>(TransactionType.INCOME);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [viewingMonth, setViewingMonth] = useState(new Date().getMonth());
  const [viewingYear, setViewingYear] = useState(new Date().getFullYear());
  const [listPeriod, setListPeriod] = useState<'MONTHLY' | 'DAILY' | 'NEXT_DAYS' | 'SPECIFIC_DATE'>('MONTHLY');
  const [calendarPeriod, setCalendarPeriod] = useState<PeriodType>(PeriodType.MONTHLY);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [dashboardOrder, setDashboardOrder] = useState<string[]>(() => 
    safeLoad('wallet_dashboard_order', ['date-section', 'quote-section', 'balance-section', 'account-section', 'card-section', 'tools-section', 'search-section', 'list-section'])
  );

  const t = useMemo(() => translations[language] || translations.pt, [language]);
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return getLocalDateStr(d);
  }, []);
  const todayDate = useMemo(() => new Date(todayStr + 'T12:00:00'), [todayStr]);
  
  const [quoteIndex, setQuoteIndex] = useState(() => getDayOfYearIndex());
  const dailyQuote = DAILY_QUOTES[quoteIndex];

  const dateInfo = useMemo(() => {
    const now = new Date();
    return {
      weekday: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
      month: now.toLocaleDateString('pt-BR', { month: 'long' }),
      day: now.getDate(),
      year: now.getFullYear()
    };
  }, []);

  const pendingNotificationCount = useMemo(() => {
    const pendingTrans = transactions.filter(tr => !tr.isPaid && tr.type !== TransactionType.CREDIT_CARD && tr.date <= tomorrowStr).length;
    const pendingReminders = reminders.filter(rem => !rem.completed && rem.date <= tomorrowStr).length;
    let pendingInvoices = 0;
    const cardTransactions = transactions.filter(t => t.type === TransactionType.CREDIT_CARD && !t.isPaid);
    const invoiceKeys = new Set<string>();
    cardTransactions.forEach(t => {
      const card = creditCards.find(c => c.id === t.cardId);
      if (card) {
        const invKey = getInvoiceKey(t.date, card.closingDay);
        const [y, m] = invKey.split('-');
        const dueDate = `${y}-${m}-${String(card.dueDay).padStart(2, '0')}`;
        if (dueDate <= tomorrowStr) invoiceKeys.add(`${card.id}-${invKey}`);
      }
    });
    pendingInvoices = invoiceKeys.size;
    return pendingTrans + pendingReminders + pendingInvoices;
  }, [transactions, reminders, creditCards, tomorrowStr]);

  const loadAllData = useCallback(() => {
    setTransactions(sanitizeTransactions(safeLoad('wallet_transactions', [])));
    setCategories(safeLoad('wallet_categories', DEFAULT_CATEGORIES));
    setUser({ ...DEFAULT_USER, ...safeLoad('wallet_user', DEFAULT_USER) });
    setBankAccounts(safeLoad('wallet_bank_accounts', [{ id: 'default-cash', bankName: 'Dinheiro', accountNumber: '---', agency: '---', color: '#10b981', initialBalance: 0, isDefault: true }]));
    setCreditCards(safeLoad('wallet_credit_cards', []));
    setReminders(safeLoad('wallet_reminders', []));
    setDailyNotes(safeLoad('wallet_daily_notes', {}));
    setLanguage((localStorage.getItem('wallet_language') as Language) || 'pt');
    setIsDark(localStorage.getItem('wallet_dark') === 'true');
    setCurrentTheme(localStorage.getItem('wallet_theme') || 'default');
    setIsBalanceHidden(localStorage.getItem('wallet_balance_hidden') === 'true');
    setDashboardOrder(safeLoad('wallet_dashboard_order', ['date-section', 'quote-section', 'balance-section', 'account-section', 'card-section', 'tools-section', 'search-section', 'list-section']));
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData, refreshTrigger]);

  useEffect(() => {
    safeSave('wallet_transactions', transactions);
    safeSave('wallet_categories', categories);
    safeSave('wallet_user', user);
    safeSave('wallet_bank_accounts', bankAccounts);
    safeSave('wallet_credit_cards', creditCards);
    safeSave('wallet_reminders', reminders);
    safeSave('wallet_daily_notes', dailyNotes);
    safeSave('wallet_dark', String(isDark));
    safeSave('wallet_theme', currentTheme);
    safeSave('wallet_balance_hidden', String(isBalanceHidden));
    safeSave('wallet_language', language);
    safeSave('wallet_dashboard_order', dashboardOrder);
    
    document.documentElement.classList.toggle('dark', isDark);
    const themeColor = THEMES.find(th => th.id === currentTheme)?.color || '#6366f1';
    document.documentElement.style.setProperty('--primary-color', themeColor);
  }, [transactions, categories, user, bankAccounts, creditCards, reminders, dailyNotes, isDark, currentTheme, isBalanceHidden, language, dashboardOrder]);

  const bankAccountsWithBalance = useMemo(() => {
    return bankAccounts.map(acc => {
      const balance = transactions.filter(t => t.bankAccountId === acc.id && t.isPaid && t.type !== TransactionType.CREDIT_CARD).reduce((v, t) => t.type === TransactionType.INCOME ? v + Number(t.amount) : v - Number(t.amount), 0);
      return { ...acc, currentBalance: Number(acc.initialBalance) + balance };
    });
  }, [bankAccounts, transactions]);

  const balanceDisplayData = useMemo(() => {
    if (viewCardId !== null) {
      const ccTrans = transactions.filter(t => t.type === TransactionType.CREDIT_CARD && (viewCardId === 'all' ? true : t.cardId === viewCardId));
      const filterKey = `${viewingYear}-${String(viewingMonth + 1).padStart(2, '0')}`;
      const currentInvoice = ccTrans.filter(t => { const card = creditCards.find(c => c.id === t.cardId); if (!card) return false; return !t.isPaid && getInvoiceKey(t.date, card.closingDay) <= filterKey; }).reduce((acc, t) => acc + Number(t.amount), 0);
      const totalDebt = ccTrans.filter(t => !t.isPaid).reduce((acc, t) => acc + Number(t.amount), 0);
      let statusLabel = `FATURA ${new Date(viewingYear, viewingMonth).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}`;
      let dueDateDisplay = '';
      let isOverdue = false;
      if (viewCardId !== 'all') {
        const card = creditCards.find(c => c.id === viewCardId);
        if (card) {
          const dueDateStr = `${viewingYear}-${String(viewingMonth + 1).padStart(2, '0')}-${String(card.dueDay).padStart(2, '0')}`;
          dueDateDisplay = new Date(dueDateStr + 'T12:00:00').toLocaleDateString('pt-BR');
          isOverdue = currentInvoice > 0 && todayStr > dueDateStr;
          if (viewingMonth === todayDate.getMonth() && viewingYear === todayDate.getFullYear()) { if (todayDate.getDate() > card.closingDay) statusLabel = "FATURA FECHADA"; else statusLabel = "FATURA EM ABERTO"; }
        }
      }
      return { label: statusLabel, mainValue: currentInvoice, subValue: totalDebt, isCredit: true, invoiceKey: filterKey, dueDate: dueDateDisplay, isOverdue };
    }
    if (viewAccountId === 'all') { return { label: 'SALDO TODAS AS CONTAS', mainValue: bankAccountsWithBalance.reduce((acc, b) => acc + (b.currentBalance || 0), 0), isCredit: false }; }
    else { const acc = bankAccountsWithBalance.find(a => a.id === viewAccountId); return { label: `SALDO ${acc?.bankName.toUpperCase()}`, mainValue: acc?.currentBalance || 0, isCredit: false }; }
  }, [bankAccountsWithBalance, viewAccountId, viewCardId, transactions, viewingMonth, viewingYear, creditCards, todayDate, todayStr]);

  const sortedTransactions = useMemo(() => {
    return transactions.filter(t => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (t.description || '').toLowerCase().includes(term) || (t.category || '').toLowerCase().includes(term);
      if (listPeriod === 'SPECIFIC_DATE') return matchesSearch && t.date === getLocalDateStr(calendarDate);
      const matchesAccount = viewCardId === null && (viewAccountId === 'all' || t.bankAccountId === viewAccountId);
      const matchesCard = viewCardId !== null && (viewCardId === 'all' || t.cardId === viewCardId);
      if (!matchesSearch || (!matchesAccount && !matchesCard)) return false;
      if (searchTerm.trim().length > 0) return true;
      if (listPeriod === 'DAILY') return t.date === todayStr;
      if (listPeriod === 'NEXT_DAYS') return t.date > todayStr;
      const parts = t.date.split('-');
      return parseInt(parts[0]) === viewingYear && (parseInt(parts[1]) - 1) === viewingMonth;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchTerm, viewAccountId, viewCardId, viewingMonth, viewingYear, listPeriod, todayStr, calendarDate]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nm = viewingMonth - 1; let ny = viewingYear;
    if (nm < 0) { nm = 11; ny--; }
    setViewingMonth(nm); setViewingYear(ny);
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nm = viewingMonth + 1; let ny = viewingYear;
    if (nm > 11) { nm = 0; ny++; }
    setViewingMonth(nm); setViewingYear(ny);
  };

  const renderSection = (id: string) => {
    switch(id) {
      case 'date-section':
        return (
          <div className="flex flex-col items-center mb-6">
             <button onClick={() => setActivePanel('calendar')} className="group flex items-center gap-5 hover:scale-105 transition-all duration-300 p-3 px-6 rounded-[2.5rem] active:scale-95 bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700/50">
               <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-6 transition-all duration-300">
                 <span className="text-3xl font-black">{dateInfo.day}</span>
               </div>
               <div className="flex flex-col items-start">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">{dateInfo.weekday}</span>
                 <div className="flex items-center gap-2">
                   <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{dateInfo.month}</span>
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <span className="text-xs font-black text-slate-400">{dateInfo.year}</span>
                 </div>
               </div>
               <ChevronRight size={16} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"/>
             </button>
          </div>
        );
      case 'quote-section':
        return (
          <div className="mt-2 flex items-center justify-center gap-4 w-full max-w-[340px] mx-auto mb-8">
              <button onClick={(e) => { e.stopPropagation(); setQuoteIndex(prev => (prev - 1 + DAILY_QUOTES.length) % DAILY_QUOTES.length); }} className="p-2 text-slate-300 hover:text-primary transition-colors hover:scale-110 active:scale-90"><ChevronLeft size={18}/></button>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center leading-relaxed italic flex-1 pointer-events-none">"{dailyQuote}"</p>
              <button onClick={(e) => { e.stopPropagation(); setQuoteIndex(prev => (prev + 1) % DAILY_QUOTES.length); }} className="p-2 text-slate-300 hover:text-primary transition-colors hover:scale-110 active:scale-90"><ChevronRight size={18}/></button>
          </div>
        );
      case 'balance-section':
        return (
          <div 
            onClick={() => viewCardId !== null ? setActivePanel('notificationCenter') : setActivePanel('extrato_mensal')} 
            className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border p-8 mb-8 relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center gap-4 group hover:scale-[1.01] active:scale-[0.99] ${balanceDisplayData.isOverdue ? 'border-rose-500 shadow-rose-500/20' : 'border-slate-100 dark:border-slate-700 hover:border-primary/40'}`}
          >
             <button onClick={(e) => { e.stopPropagation(); setIsBalanceHidden(!isBalanceHidden); }} className="absolute top-6 right-6 text-slate-300 hover:text-primary p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl z-20 hover:scale-110 active:scale-90 transition-all duration-300">
               {isBalanceHidden ? <EyeOff size={18}/> : <Eye size={18}/>}
             </button>
             <div className="w-full text-center relative z-10 pointer-events-none">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <button onClick={handlePrevMonth} className="p-1 text-slate-300 hover:text-primary hover:scale-110 active:scale-90 transition-all duration-300 pointer-events-auto"><ChevronLeft size={16}/></button>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2"><List size={10} className="text-primary"/> {balanceDisplayData.label}</p>
                  <button onClick={handleNextMonth} className="p-1 text-slate-300 hover:text-primary hover:scale-110 active:scale-90 transition-all duration-300 pointer-events-auto"><ChevronRight size={16}/></button>
                </div>
                <h3 className={`text-4xl md:text-5xl font-black tracking-tighter truncate leading-none ${balanceDisplayData.isCredit ? (balanceDisplayData.mainValue > 0 ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-900 dark:text-white'}`}>{isBalanceHidden ? '••••••' : balanceDisplayData.mainValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h3>
                {balanceDisplayData.dueDate && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                     <span className={`text-[7px] font-black uppercase tracking-widest ${balanceDisplayData.isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>Vencimento: <span className="text-xs ml-1">{balanceDisplayData.dueDate}</span></span>
                  </div>
                )}
             </div>
             <div className="flex items-center justify-center relative z-10 pointer-events-auto" onClick={e => e.stopPropagation()}>
                <button onClick={() => { setPreSelectedType(TransactionType.EXPENSE); setPreSelectedDate(undefined); setEditingTransaction(undefined); setIsModalOpen(true); }} className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"><div className="p-1 bg-white/20 rounded-full"><Plus size={18} strokeWidth={4}/></div><span className="text-[10px] font-black uppercase tracking-[0.2em]">Nova Movimentação</span></button>
             </div>
          </div>
        );
      case 'account-section':
        return (
          <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between px-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Wallet size={12}/> Contas Bancárias</p>
                 <button onClick={(e) => { e.stopPropagation(); setActivePanel('accounts'); }} className="p-1.5 bg-primary/5 text-primary rounded-lg pointer-events-auto"><Plus size={14} strokeWidth={3}/></button>
              </div>
              <div className="overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2">
                   <button onClick={() => { setViewAccountId('all'); setViewCardId(null); }} className={`px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${viewAccountId === 'all' && viewCardId === null ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><LayoutGrid size={12}/> Todas as Contas</button>
                   {bankAccounts.map(acc => (
                     <button key={acc.id} onClick={() => { setViewAccountId(acc.id); setViewCardId(null); }} className={`px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${viewAccountId === acc.id && viewCardId === null ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><span className="text-xs">{BANK_PRESETS.find(p=>p.name===acc.bankName)?.icon || '🏦'}</span> {acc.bankName}</button>
                   ))}
                </div>
              </div>
          </div>
        );
      case 'card-section':
        return (
          <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between px-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><CreditCardIcon size={12}/> Cartões de Crédito</p>
                 <button onClick={(e) => { e.stopPropagation(); setActivePanel('cards'); }} className="p-1.5 bg-blue-500/5 text-blue-600 rounded-lg pointer-events-auto"><Plus size={14} strokeWidth={3}/></button>
              </div>
              <div className="overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2">
                   <button onClick={() => { setViewCardId('all'); setViewAccountId('all'); }} className={`px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${viewCardId === 'all' ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><CreditCardIcon size={12}/> Todos Cartões</button>
                   {creditCards.map(card => (
                     <button key={card.id} onClick={() => { setViewCardId(card.id); setViewAccountId('all'); }} className={`px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${viewCardId === card.id ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><div className="w-8 h-5 rounded-[3px] shadow-sm border border-black/5" style={{ backgroundColor: card.color }}></div> {card.name}</button>
                   ))}
                </div>
              </div>
          </div>
        );
      case 'tools-section':
        return (
          <div className="grid grid-cols-5 gap-2 mb-8">
            {[
              { id: 'calc', icon: <CalcIcon size={16}/>, color: 'bg-amber-500', label: 'Calc' },
              { id: 'reminders', icon: <Bell size={16}/>, color: 'bg-rose-500', label: 'Alertas' },
              { id: 'converter', icon: <Coins size={16}/>, color: 'bg-sky-500', label: 'Câmbio' },
              { id: 'notes', icon: <StickyNote size={16}/>, color: 'bg-emerald-500', label: 'Notas' },
              { id: 'files', icon: <FolderOpen size={16}/>, color: 'bg-slate-900 dark:bg-slate-600', label: 'Arquivos' }
            ].map(tool => (
              <button key={tool.id} onClick={() => setActivePanel(tool.id as any)} className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-110 active:scale-90 transition-all duration-300 pointer-events-auto"><div className={`p-2.5 ${tool.color} text-white rounded-xl`}>{tool.icon}</div><span className="text-[7px] font-black uppercase text-slate-400">{tool.label}</span></button>
            ))}
          </div>
        );
      case 'search-section':
        return (
          <div className="mb-6">
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400"><Search size={18} /></div>
                <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 outline-none font-bold text-xs pointer-events-auto" />
             </div>
          </div>
        );
      case 'list-section':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-50 dark:border-slate-700 shadow-xl overflow-hidden mb-8">
             <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center pointer-events-none">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><LayoutList size={12}/> Lançamentos</h3>
                <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl pointer-events-auto">
                    {['MONTHLY', 'DAILY'].map(p => (
                      <button key={p} onClick={() => setListPeriod(p as any)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${listPeriod === p ? 'bg-primary text-white shadow-sm' : 'text-slate-400'}`}>{p==='MONTHLY'?'Mês':'Hoje'}</button>
                    ))}
                </div>
             </div>
             <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[400px] overflow-y-auto custom-scrollbar pointer-events-auto">
                {sortedTransactions.length === 0 ? (
                   <div className="p-10 text-center opacity-20"><p className="font-black text-[9px] uppercase">Vazio</p></div>
                ) : (
                  sortedTransactions.slice(0, 10).map(trans => (
                     <TransactionItem key={trans.id} transaction={trans} onDelete={id => setTransactions(transactions.filter(t => t.id !== id))} onToggleStatus={id => setTransactions(transactions.map(x => x.id === id ? {...x, isPaid: !x.isPaid} : x))} onUpdate={u => setTransactions(transactions.map(x => x.id === u.id ? u : x))} onEdit={t => { setEditingTransaction(t); setIsModalOpen(true); }} hideValues={isBalanceHidden} todayStr={todayStr} bankAccounts={bankAccounts} showAccountInfo={viewAccountId === 'all'} />
                  ))
                )}
             </div>
          </div>
        );
      default: return null;
    }
  };

  if (appPin && isLocked) {
    return <SecurityLock correctPin={appPin} user={user} onUnlock={() => setIsLocked(false)} appName={t.appName} smartText={t.smart} />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'} relative pb-12 transition-colors duration-500 overflow-x-hidden`}>
      <header className="max-w-4xl mx-auto px-6 pt-8">
        
        {/* CABEÇALHO FIXO - IMÓVEL */}
        <div className="fixed-header-zone mb-10">
           <StandardHeader t={t} />
           <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Olá, <span className="text-primary">{user.name.split(' ')[0]}</span></h2>
           </div>
           
           <div className="flex items-center justify-center gap-2"> 
             <button onClick={() => setActivePanel('notificationCenter')} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative hover:text-primary transition-all">
               <Bell size={18}/>
               {pendingNotificationCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-800">{pendingNotificationCount}</span>}
             </button>
             <button onClick={() => setActivePanel('themes')} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border shadow-sm hover:text-primary transition-all"><Palette size={18}/></button>
             <button onClick={() => { if(appPin) setIsLocked(true); else setActivePanel('security'); }} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border shadow-sm hover:text-rose-500 transition-all"><Lock size={18}/></button>
             <button onClick={() => setIsDark(!isDark)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border shadow-sm hover:text-primary transition-all">{isDark ? <Sun size={18}/> : <Moon size={18}/>}</button>
             <button onClick={() => setActivePanel('menu')} className="p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 active:scale-90 transition-all"><Menu size={18}/></button>
           </div>
        </div>

        {/* ÁREA REORDENÁVEL COM ALÇAS (HANDLES) */}
        {!activePanel && (
          <Reorder.Group 
            axis="y" 
            values={dashboardOrder} 
            onReorder={setDashboardOrder} 
            className="space-y-4 pb-20"
          >
            {dashboardOrder.map(item => (
              <DraggableWidget key={item} id={item}>
                {renderSection(item)}
              </DraggableWidget>
            ))}
          </Reorder.Group>
        )}

      </header>

      {/* PAINÉIS LATERAIS E MODAIS */}
      <AnimatePresence>
        {activePanel && (
          <div className="fixed inset-0 z-[400] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setActivePanel(null)}/>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`relative w-full md:w-[500px] h-full ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} shadow-2xl flex flex-col overflow-hidden`}>
              <button onClick={() => setActivePanel(null)} className="absolute top-8 right-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-full z-10 hover:rotate-90 transition-all"><X size={20}/></button>
              <div className="flex-1 overflow-y-auto custom-scrollbar pt-12">
                <StandardHeader t={t} compact />
                {activePanel === 'menu' && (
                  <div className="p-10 space-y-4">
                    <h2 className="text-xl font-black uppercase mb-10 text-center">Ajustes</h2>
                    {[
                      { id: 'profile', icon: <UserCircle size={20}/>, label: t.profile },
                      { id: 'notifications', icon: <BellRing size={20}/>, label: 'Notificações' },
                      { id: 'security', icon: <Shield size={20}/>, label: t.security },
                      { id: 'database', icon: <FolderOpen size={20}/>, label: 'Backup e Dados' },
                      { id: 'accounts', icon: <Building2 size={20}/>, label: 'Minhas Contas' },
                      { id: 'cards', icon: <CreditCardIcon size={20}/>, label: 'Meus Cartões' },
                      { id: 'calendar', icon: <CalendarDays size={20}/>, label: 'Calendário' },
                      { id: 'themes', icon: <Palette size={20}/>, label: 'Temas' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setActivePanel(item.id as any)} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-between hover:bg-primary/10 transition-all group"><div className="flex items-center gap-6 text-slate-500 group-hover:text-primary">{item.icon}<span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span></div><ChevronRight size={16} className="opacity-20"/></button>
                    ))}
                  </div>
                )}
                {activePanel === 'themes' && (
                  <div className="p-10 space-y-4">
                    <h2 className="text-xl font-black uppercase mb-10 text-center">Temas</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {THEMES.map(th => (
                        <button key={th.id} onClick={() => { setCurrentTheme(th.id); setActivePanel(null); }} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${currentTheme === th.id ? 'border-primary bg-primary/5' : 'border-slate-50 dark:border-slate-800'}`}><div className="w-10 h-10 rounded-full" style={{ backgroundColor: th.color }}></div><span className="font-black text-[8px] uppercase">{th.name}</span></button>
                      ))}
                    </div>
                  </div>
                )}
                {activePanel === 'notificationCenter' && <NotificationCenter transactions={transactions} reminders={reminders} creditCards={creditCards} initialCardId={viewCardId !== 'all' ? viewCardId : undefined} initialInvoiceKey={balanceDisplayData.invoiceKey} onOpenTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onUpdateTransaction={u => setTransactions(transactions.map(x => x.id === u.id ? u : x))} onDeleteTransaction={id => setTransactions(transactions.filter(t => t.id !== id))} onOpenReminders={() => setActivePanel('reminders')} onSelectDate={() => {}} onPayInvoice={() => {}} todayStr={todayStr} tomorrowStr={tomorrowStr} hideValues={isBalanceHidden} />}
                {activePanel === 'calc' && <Calculator />}
                {activePanel === 'notes' && <Notes />}
                {activePanel === 'reminders' && <Reminders reminders={reminders} transactions={transactions} onAdd={r => setReminders([...reminders, r])} onRemove={id => setReminders(reminders.filter(x => x.id !== id))} onToggle={id => setReminders(reminders.map(x => x.id === id ? {...x, completed: !x.completed} : x))} onPay={() => {}} />}
                {activePanel === 'profile' && <ProfileEditor user={user} onUpdate={setUser} />}
                {activePanel === 'security' && <SecuritySettings currentPin={appPin} onUpdatePin={setAppPin} />}
                {activePanel === 'database' && <DatabaseManager onRefresh={() => { setRefreshTrigger(p => p + 1); setActivePanel(null); }} />}
                {activePanel === 'accounts' && <BankAccountManager accounts={bankAccountsWithBalance} onAdd={acc => setBankAccounts([...bankAccounts, acc])} onRemove={id => setBankAccounts(bankAccounts.filter(x => x.id !== id))} onUpdate={u => setBankAccounts(bankAccounts.map(a => a.id === u.id ? u : a))} onSetDefault={id => setBankAccounts(bankAccounts.map(a => ({...a, isDefault: a.id === id})))} selectedId={viewAccountId} onSelect={setViewAccountId} />}
                {activePanel === 'cards' && <CreditCardManager cards={creditCards} accounts={bankAccounts} onAdd={card => setCreditCards([...creditCards, card])} onUpdate={u => setCreditCards(prevCards => prevCards.map(c => c.id === u.id ? u : c))} onRemove={id => setCreditCards(creditCards.filter(x => x.id !== id))} />}
                {activePanel === 'files' && <FilesManager transactions={transactions} user={user} onUpdateUser={setUser} onDeleteTransactionFiles={(id, type) => setTransactions(transactions.map(t => t.id === id ? (type === 'BILL' ? {...t, billAttachment: undefined, billFileName: undefined} : {...t, receiptAttachment: undefined, receiptFileName: undefined}) : t))} />}
                {activePanel === 'calendar' && <CalendarView period={calendarPeriod} setPeriod={setCalendarPeriod} selectedDate={calendarDate} onChangeDate={setCalendarDate} daysWithTransactions={transactions.map(t=>t.date)} transactions={transactions} reminders={reminders} dailyNotes={dailyNotes} onUpdateDailyNote={(d, t) => setDailyNotes(prev => ({...prev, [d]: t}))} onAddTransaction={(date) => { setPreSelectedDate(date); setIsModalOpen(true); }} onAddReminder={() => {}} onToggleReminder={() => {}} onViewTransaction={() => {}} onGoToMainFilter={() => setActivePanel(null)} />}
                {activePanel === 'converter' && <CurrencyConverter />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}/>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} w-full max-w-xl rounded-[3rem] p-6 md:p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}><TransactionForm initialData={editingTransaction} preDefinedDate={preSelectedDate} fixedType={editingTransaction ? undefined : preSelectedType} onAdd={(list) => { if(editingTransaction) setTransactions(transactions.map(t => t.id === list[0].id ? list[0] : t)); else setTransactions([...transactions, ...list]); setIsModalOpen(false); }} onClose={() => setIsModalOpen(false)} creditCards={creditCards} bankAccounts={bankAccounts} categories={categories} allTransactions={transactions} onAddCategory={c => setCategories(prev => [...prev, c])} onRemoveCategory={c => setCategories(prev => prev.filter(x => x !== c))} /></motion.div>
        </div>
      )}
    </div>
  );
};

export default App;
