
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, TransactionType, BankAccount, UserProfile, CreditCard, Reminder, AutoBackupConfig, PeriodType } from './types';
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
  TrendingUp, AlertCircle, Wallet, AlertTriangle, Calendar, History, Search, CalendarDays, ArrowLeft
} from 'lucide-react';

export const APP_ICON_URL = "https://cdn-icons-png.flaticon.com/512/9181/9181081.png";

const safeLoad = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined" || saved === "null" || saved === "") return defaultValue;
    return JSON.parse(saved) ?? defaultValue;
  } catch (e) { return defaultValue; }
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
    <div className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl flex items-center justify-center p-5 mb-2 border-4 border-primary/5 transition-transform hover:scale-105`}>
      <img src={APP_ICON_URL} alt="Logo" className="w-full h-full object-contain" />
    </div>
    <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">
      {t.appName} <span className="text-primary">{t.smart}</span>
    </h1>
  </div>
);

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile>({ id: '0', name: 'Visitante', isLocal: true, notificationsEnabled: true, notificationSound: 'cash_register' });
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

  const t = useMemo(() => translations[language] || translations.pt, [language]);
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = useMemo(() => getLocalDateStr(tomorrowDate), []);
  const todayDate = useMemo(() => new Date(todayStr + 'T12:00:00'), [todayStr]);
  const quoteIndex = useMemo(() => getDayOfYearIndex(), []);
  const dailyQuote = DAILY_QUOTES[quoteIndex];

  // Formatação da data atual por extenso
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

  const handleUpdatePin = (newPin: string) => {
    setAppPin(newPin);
    localStorage.setItem('wallet_app_pin', newPin);
    if (newPin) { setIsLocked(true); setActivePanel(null); }
    else setIsLocked(false);
  };

  const runAutoBackup = useCallback(() => {
    const configRaw = localStorage.getItem('wallet_auto_backup_config');
    if (!configRaw) return;
    const config: AutoBackupConfig = JSON.parse(configRaw);
    if (!config.enabled) return;
    const last = config.lastBackup || 0;
    const now = Date.now();
    const diffMs = now - last;
    let threshold = 24 * 60 * 60 * 1000; 
    if (config.frequency === 'WEEKLY') threshold *= 7;
    if (config.frequency === 'MONTHLY') threshold *= 30;
    if (diffMs >= threshold) {
      const keys = ['wallet_transactions', 'wallet_bank_accounts', 'wallet_credit_cards', 'wallet_reminders', 'wallet_user', 'wallet_categories'];
      const data: Record<string, any> = {};
      keys.forEach(k => { const val = localStorage.getItem(k); if (val) data[k] = JSON.parse(val); });
      const entry = { id: `auto-${now}`, name: `Auto_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`, date: new Date().toLocaleDateString('pt-BR'), time: new Date().toLocaleTimeString('pt-BR'), timestamp: now, data: JSON.stringify(data), type: 'AUTO' };
      const existing = JSON.parse(localStorage.getItem('wallet_backups_local_folder') || '[]');
      localStorage.setItem('wallet_backups_local_folder', JSON.stringify([entry, ...existing].slice(0, 20)));
      localStorage.setItem('wallet_auto_backup_config', JSON.stringify({ ...config, lastBackup: now }));
    }
  }, []);

  const runNotificationScanner = useCallback(() => {
    if (!user.notificationsEnabled) return;
    if (pendingNotificationCount > 0) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Gestão Financeira", { body: `Você tem ${pendingNotificationCount} alertas (Vencidos, Hoje ou Amanhã).`, icon: APP_ICON_URL });
      }
      try { playNotificationSound(user.notificationSound || 'cash_register'); } catch (e) {}
    }
  }, [user.notificationsEnabled, user.notificationSound, pendingNotificationCount]);

  const loadAllData = useCallback(() => {
    setTransactions(sanitizeTransactions(safeLoad('wallet_transactions', [])));
    setCategories(safeLoad('wallet_categories', DEFAULT_CATEGORIES));
    setUser(safeLoad('wallet_user', { id: '0', name: 'Visitante', isLocal: true, notificationsEnabled: true, notificationSound: 'cash_register' }));
    setBankAccounts(safeLoad('wallet_bank_accounts', [{ id: 'default-cash', bankName: 'Dinheiro', accountNumber: '---', agency: '---', color: '#10b981', initialBalance: 0, isDefault: true }]));
    setCreditCards(safeLoad('wallet_credit_cards', []));
    setReminders(safeLoad('wallet_reminders', []));
    setDailyNotes(safeLoad('wallet_daily_notes', {}));
    setLanguage((localStorage.getItem('wallet_language') as Language) || 'pt');
    setIsDark(localStorage.getItem('wallet_dark') === 'true');
    setCurrentTheme(localStorage.getItem('wallet_theme') || 'default');
    setIsBalanceHidden(localStorage.getItem('wallet_balance_hidden') === 'true');
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData, refreshTrigger]);

  useEffect(() => {
    if (transactions.length > 0 || reminders.length > 0) {
      const timer = setTimeout(() => { runNotificationScanner(); runAutoBackup(); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transactions.length, reminders.length, runNotificationScanner, runAutoBackup]);

  useEffect(() => {
    localStorage.setItem('wallet_transactions', JSON.stringify(transactions));
    localStorage.setItem('wallet_categories', JSON.stringify(categories));
    localStorage.setItem('wallet_user', JSON.stringify(user));
    localStorage.setItem('wallet_bank_accounts', JSON.stringify(bankAccounts));
    localStorage.setItem('wallet_credit_cards', JSON.stringify(creditCards));
    localStorage.setItem('wallet_reminders', JSON.stringify(reminders));
    localStorage.setItem('wallet_daily_notes', JSON.stringify(dailyNotes));
    localStorage.setItem('wallet_dark', String(isDark));
    localStorage.setItem('wallet_theme', currentTheme);
    localStorage.setItem('wallet_balance_hidden', String(isBalanceHidden));
    localStorage.setItem('wallet_language', language);
    document.documentElement.classList.toggle('dark', isDark);
    const themeColor = THEMES.find(th => th.id === currentTheme)?.color || '#6366f1';
    document.documentElement.style.setProperty('--primary-color', themeColor);
  }, [transactions, categories, user, bankAccounts, creditCards, reminders, dailyNotes, isDark, currentTheme, isBalanceHidden, language]);

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
      return { label: statusLabel, mainValue: currentInvoice, subLabel: 'Saldo Devedor Total', subValue: totalDebt, isCredit: true, invoiceKey: filterKey, dueDate: dueDateDisplay, isOverdue };
    }
    if (viewAccountId === 'all') { const total = bankAccountsWithBalance.reduce((acc, b) => acc + (b.currentBalance || 0), 0); return { label: 'SALDO TODAS AS CONTAS', mainValue: total, isCredit: false }; }
    else { const acc = bankAccountsWithBalance.find(a => a.id === viewAccountId); return { label: `SALDO ${acc?.bankName.toUpperCase()}`, mainValue: acc?.currentBalance || 0, isCredit: false }; }
  }, [bankAccountsWithBalance, viewAccountId, viewCardId, transactions, viewingMonth, viewingYear, creditCards, todayDate, todayStr]);

  const handlePayInvoice = (cardId: string, invoiceKey: string, total: number, selectedIds?: string[]) => {
    const card = creditCards.find(c => c.id === cardId); if (!card) return;
    const updatedTransactions = transactions.map(t => { if (t.type === TransactionType.CREDIT_CARD && t.cardId === cardId && !t.isPaid) { if (selectedIds) { if (selectedIds.includes(t.id)) return { ...t, isPaid: true }; } else if (getInvoiceKey(t.date, card.closingDay) <= invoiceKey) return { ...t, isPaid: true }; } return t; });
    const debitAccount = card.bankAccountId || bankAccounts.find(a => a.isDefault)?.id || bankAccounts[0]?.id;
    if (debitAccount) setTransactions([...updatedTransactions, { id: generateId(), description: `Pgto Fatura ${card.name} - Ref ${invoiceKey}`, amount: total, date: todayStr, type: TransactionType.EXPENSE, category: 'Cartão de Crédito', isPaid: true, isInstallment: false, bankAccountId: debitAccount }]);
    else setTransactions(updatedTransactions);
  };

  const sortedTransactions = useMemo(() => {
    return transactions.filter(t => {
      const term = searchTerm.toLowerCase();
      const formattedDate = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR');
      
      const matchesSearch = 
        String(t.description || '').toLowerCase().includes(term) ||
        formattedDate.includes(term) ||
        String(t.category || '').toLowerCase().includes(term);

      const matchesAccount = viewCardId === null && (viewAccountId === 'all' || t.bankAccountId === viewAccountId);
      const matchesCard = viewCardId !== null && (viewCardId === 'all' || t.cardId === viewCardId);
      
      if (!matchesSearch || (!matchesAccount && !matchesCard)) return false;
      
      if (searchTerm.trim().length > 0) return true;

      if (listPeriod === 'DAILY') return t.date === todayStr;
      if (listPeriod === 'NEXT_DAYS') return t.date > todayStr;
      if (listPeriod === 'SPECIFIC_DATE') return t.date === getLocalDateStr(calendarDate);
      
      const parts = t.date.split('-');
      return parseInt(parts[0]) === viewingYear && (parseInt(parts[1]) - 1) === viewingMonth;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchTerm, viewAccountId, viewCardId, viewingMonth, viewingYear, listPeriod, todayStr, calendarDate]);

  const getBankIcon = (name: string) => BANK_PRESETS.find(p => p.name === name)?.icon || '🏦';

  const daysWithTransactions = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.date)));
  }, [transactions]);

  const daysWithReminders = useMemo(() => {
    return Array.from(new Set(reminders.map(r => r.date)));
  }, [reminders]);

  const daysWithNotes = useMemo(() => {
    return Object.keys(dailyNotes).filter(k => dailyNotes[k].trim().length > 0);
  }, [dailyNotes]);

  const handleCalendarDayClick = (date: Date) => {
    setCalendarDate(date);
  };

  const handleOpenTransactionForDate = (date: string) => {
    setPreSelectedDate(date);
    setPreSelectedType(TransactionType.EXPENSE);
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleOpenReminderForDate = (date: string) => {
    setActivePanel('reminders');
  };

  if (appPin && isLocked) {
    return <SecurityLock correctPin={appPin} user={user} onUnlock={() => setIsLocked(false)} appName={t.appName} smartText={t.smart} />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'} relative pb-12 transition-colors duration-500`}>
      <header className="max-w-4xl mx-auto px-6 pt-8">
        
        <StandardHeader t={t} />

        <div className="flex flex-col items-center mb-6 animate-in fade-in slide-in-from-top-2 duration-700">
           <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
             Olá, <span className="text-primary">{user.name.split(' ')[0]}</span>
           </h2>
        </div>

        <div className="flex items-center justify-center gap-2 mb-10"> 
          <button onClick={() => setActivePanel('notificationCenter')} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative hover:text-primary transition-all">
            <Bell size={18}/>
            {pendingNotificationCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-800">
                {pendingNotificationCount}
              </span>
            )}
          </button>
          
          <button onClick={() => setActivePanel('themes')} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:text-primary transition-all">
            <Palette size={18}/>
          </button>
          
          <button 
            onClick={() => { if(appPin) setIsLocked(true); else setActivePanel('security'); }} 
            className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:text-rose-500 transition-all"
          >
            <Lock size={18}/>
          </button>

          <button onClick={() => setActivePanel('language')} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:text-primary transition-all">
            <Globe size={18}/>
          </button>
          
          <button onClick={() => setIsDark(!isDark)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:text-primary transition-all">
            {isDark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          
          <button onClick={() => setActivePanel('menu')} className="p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            <Menu size={18}/>
          </button>
        </div>

        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-2 duration-700">
           <button 
             onClick={() => setActivePanel('calendar')}
             className="group flex items-center gap-5 hover:scale-105 transition-all p-3 px-6 rounded-[2.5rem] active:scale-95 bg-white dark:bg-slate-800 shadow-2xl shadow-primary/10 border border-slate-100 dark:border-slate-700/50"
           >
             <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-6 transition-all">
               <span className="text-3xl font-black">
                 {dateInfo.day}
               </span>
             </div>
             <div className="flex flex-col items-start">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">
                 {dateInfo.weekday}
               </span>
               <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                   {dateInfo.month}
                 </span>
                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                 <span className="text-xs font-black text-slate-400">
                   {dateInfo.year}
                 </span>
               </div>
             </div>
             <ChevronRight size={16} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all"/>
           </button>

           <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-8 text-center max-w-[280px] leading-relaxed italic">
             "{dailyQuote}"
           </p>
        </div>

        {/* CARD DE SALDO */}
        <div 
          onClick={() => viewCardId !== null ? setActivePanel('notificationCenter') : setActivePanel('extrato_mensal')} 
          className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border p-8 mb-8 relative overflow-hidden transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group active:scale-[0.98] ${
            balanceDisplayData.isOverdue ? 'border-rose-500 shadow-rose-500/20' : 'border-slate-100 dark:border-slate-700 hover:border-primary/40'
          }`}
        >
           <button 
             onClick={(e) => { 
               e.stopPropagation(); 
               setIsBalanceHidden(!isBalanceHidden); 
             }} 
             className="absolute top-6 right-6 text-slate-300 hover:text-primary p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl z-20"
           >
             {isBalanceHidden ? <EyeOff size={18}/> : <Eye size={18}/>}
           </button>
           
           <div className="w-full text-center relative z-10">
              <div className="flex items-center justify-center gap-4 mb-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    let nm = viewingMonth - 1;
                    let ny = viewingYear; 
                    if (nm < 0) { nm = 11; ny--; } 
                    setViewingMonth(nm); 
                    setViewingYear(ny); 
                  }} 
                  className="p-1 text-slate-300 hover:text-primary"
                >
                  <ChevronLeft size={16}/>
                </button>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                  <List size={10} className="text-primary"/> {balanceDisplayData.label}
                </p>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    let nm = viewingMonth + 1;
                    let ny = viewingYear; 
                    if (nm > 11) { nm = 0; ny++; } 
                    setViewingMonth(nm); 
                    setViewingYear(ny); 
                  }} 
                  className="p-1 text-slate-300 hover:text-primary"
                >
                  <ChevronRight size={16}/>
                </button>
              </div>
              
              <h3 className={`text-4xl md:text-5xl font-black tracking-tighter truncate leading-none ${
                balanceDisplayData.isCredit ? (balanceDisplayData.mainValue > 0 ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-900 dark:text-white'
              }`}>
                {isBalanceHidden ? '••••••' : balanceDisplayData.mainValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
              
              {balanceDisplayData.dueDate && (
                <div className="mt-3 flex flex-col items-center gap-1">
                   <p className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${balanceDisplayData.isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                     {balanceDisplayData.isOverdue ? <AlertTriangle size={10}/> : <Calendar size={10}/>}
                     {balanceDisplayData.isOverdue ? 'FATURA ATRASADA - VENCIMENTO:' : 'VENCIMENTO:'} {balanceDisplayData.dueDate}
                   </p>
                </div>
              )}
              
              {balanceDisplayData.subLabel && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-fit mx-auto border border-slate-100 dark:border-slate-800">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{balanceDisplayData.subLabel}</p>
                   <p className="text-sm font-black text-slate-600 dark:text-slate-400 tracking-tight">
                     {isBalanceHidden ? '••••' : balanceDisplayData.subValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                   </p>
                </div>
              )}
           </div>
           
           <div className="flex items-center justify-center gap-4 relative z-10" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => { setPreSelectedType(TransactionType.INCOME); setPreSelectedDate(undefined); setEditingTransaction(undefined); setIsModalOpen(true); }} 
                className="w-12 h-12 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Plus size={24} strokeWidth={4}/>
              </button>
              <button 
                onClick={() => { setPreSelectedType(TransactionType.EXPENSE); setPreSelectedDate(undefined); setEditingTransaction(undefined); setIsModalOpen(true); }} 
                className="w-12 h-12 bg-rose-500 text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Minus size={24} strokeWidth={4}/>
              </button>
           </div>
        </div>

        <div className="space-y-6 mb-8">
           <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Wallet size={12}/> Contas Bancárias</p>
                 <button onClick={() => setActivePanel('accounts')} className="p-1.5 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-all"><Plus size={14} strokeWidth={3}/></button>
              </div>
              <div className="overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2">
                   <button onClick={() => { setViewAccountId('all'); setViewCardId(null); }} className={`px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-2 ${viewAccountId === 'all' && viewCardId === null ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><LayoutGrid size={12}/> Todas as Contas</button>
                   {bankAccounts.map(acc => (
                     <button key={acc.id} onClick={() => { setViewAccountId(acc.id); setViewCardId(null); }} className={`px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-3 ${viewAccountId === acc.id && viewCardId === null ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><span className="text-xs">{getBankIcon(acc.bankName)}</span> {acc.bankName}</button>
                   ))}
                </div>
              </div>
           </div>
           <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><CreditCardIcon size={12}/> Cartões de Crédito</p>
                 <button onClick={() => setActivePanel('cards')} className="p-1.5 bg-blue-500/5 text-blue-600 rounded-lg hover:bg-blue-500/10 transition-all"><Plus size={14} strokeWidth={3}/></button>
              </div>
              <div className="overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2">
                   <button onClick={() => { setViewCardId('all'); setViewAccountId('all'); }} className={`px-5 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-2 ${viewCardId === 'all' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><CreditCardIcon size={12}/> Todos Cartões</button>
                   {creditCards.map(card => (
                     <button key={card.id} onClick={() => { setViewCardId(card.id); setViewAccountId('all'); }} className={`px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 flex items-center gap-3 ${viewCardId === card.id ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-primary/20'}`}><div className="w-8 h-5 rounded-[3px] shadow-sm border border-black/5" style={{ backgroundColor: card.color }}></div> {card.name}</button>
                   ))}
                </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { id: 'calc', icon: <CalcIcon size={16}/>, color: 'bg-amber-500', label: 'Calc' },
            { id: 'reminders', icon: <Bell size={16}/>, color: 'bg-rose-500', label: 'Alertas' },
            { id: 'notes', icon: <StickyNote size={16}/>, color: 'bg-emerald-500', label: 'Notas' },
            { id: 'files', icon: <FolderOpen size={16}/>, color: 'bg-slate-900 dark:bg-slate-600', label: 'Arquivos' }
          ].map(tool => (
            <button key={tool.id} onClick={() => setActivePanel(tool.id as any)} className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-105 transition-all"><div className={`p-2.5 ${tool.color} text-white rounded-xl`}>{tool.icon}</div><span className="text-[7px] font-black uppercase text-slate-400">{tool.label}</span></button>
          ))}
        </div>

        {/* CAMPO DE PESQUISA (CLEAN STYLE) */}
        <div className="mb-6 animate-in fade-in duration-500">
           <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                 <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Pesquisar por nome ou data (ex: 15/05)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-50 dark:border-slate-700 outline-none font-bold text-xs shadow-sm focus:border-primary transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-rose-500 p-2"
                >
                  <X size={16} />
                </button>
              )}
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-50 dark:border-slate-700 shadow-xl overflow-hidden mb-8">
           <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <LayoutList size={12}/> 
                {listPeriod === 'SPECIFIC_DATE' ? (
                  <span className="flex items-center gap-2 text-primary">
                    Movimentações: {calendarDate.toLocaleDateString('pt-BR')}
                    <button onClick={() => setListPeriod('MONTHLY')} className="p-1 hover:bg-primary/10 rounded-lg"><X size={10}/></button>
                  </span>
                ) : searchTerm.trim().length > 0 ? `Resultados: ${sortedTransactions.length}` : (listPeriod === 'MONTHLY' ? 'Extrato Mensal' : listPeriod === 'DAILY' ? 'Extrato de Hoje' : 'Próximos Lançamentos')}
              </h3>
              {searchTerm.trim().length === 0 && listPeriod !== 'SPECIFIC_DATE' && (
                <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  {[
                    { id: 'MONTHLY', label: 'Mês', icon: <Calendar size={10}/> },
                    { id: 'DAILY', label: 'Hoje', icon: <History size={10}/> },
                    { id: 'NEXT_DAYS', label: 'Próx.', icon: <ChevronRight size={10}/> }
                  ].map(p => (
                    <button key={p.id} onClick={() => setListPeriod(p.id as any)} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${listPeriod === p.id ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{p.icon} {p.label}</button>
                  ))}
                </div>
              )}
              {listPeriod === 'SPECIFIC_DATE' && (
                <button onClick={() => setListPeriod('MONTHLY')} className="px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-slate-900 text-white flex items-center gap-2 shadow-md">
                  <ArrowLeft size={10}/> Ver Tudo
                </button>
              )}
           </div>
           <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
              {sortedTransactions.length === 0 ? (
                 <div className="p-16 text-center opacity-20 flex flex-col items-center"><LayoutList size={40} className="mb-3" /><p className="font-black text-[9px] uppercase tracking-widest">Sem lançamentos</p></div>
              ) : (
                sortedTransactions.map(trans => (
                   <TransactionItem key={trans.id} transaction={trans} onDelete={id => setTransactions(transactions.filter(t => t.id !== id))} onToggleStatus={id => setTransactions(transactions.map(x => x.id === id ? {...x, isPaid: !x.isPaid} : x))} onUpdate={u => setTransactions(transactions.map(x => x.id === u.id ? u : x))} onEdit={t => { setEditingTransaction(t); setIsModalOpen(true); }} hideValues={isBalanceHidden} todayStr={todayStr} bankAccounts={bankAccounts} showAccountInfo={viewAccountId === 'all'} />
                ))
              )}
           </div>
        </div>
      </header>

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
                    <h2 className="text-xl font-black uppercase tracking-widest mb-10 text-center">Ajustes</h2>
                    {[
                      { id: 'profile', icon: <UserCircle size={20}/>, label: t.profile },
                      { id: 'notifications', icon: <BellRing size={20}/>, label: 'Notificações' },
                      { id: 'security', icon: <Shield size={20}/>, label: t.security },
                      { id: 'database', icon: <FolderOpen size={20}/>, label: 'Backup e Dados' },
                      { id: 'accounts', icon: <Building2 size={20}/>, label: 'Minhas Contas' },
                      { id: 'cards', icon: <CreditCardIcon size={20}/>, label: 'Meus Cartões' },
                      { id: 'calendar', icon: <CalendarDays size={20}/>, label: 'Calendário' },
                      { id: 'language', icon: <Globe size={20}/>, label: 'Idioma' },
                      { id: 'themes', icon: <Palette size={20}/>, label: 'Temas' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setActivePanel(item.id as any)} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-between transition-all hover:bg-primary/10 group"><div className="flex items-center gap-6 text-slate-500 group-hover:text-primary">{item.icon}<span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span></div><ChevronRight size={16} className="opacity-20"/></button>
                    ))}
                  </div>
                )}
                {activePanel === 'language' && (
                  <div className="p-10 space-y-4 text-center">
                    <h2 className="text-xl font-black uppercase tracking-widest mb-10">Idioma</h2>
                    {Object.entries(translations).map(([key, val]: [any, any]) => (
                      <button key={key} onClick={() => { setLanguage(key); setActivePanel('menu'); }} className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${language === key ? 'border-primary bg-primary/5' : 'border-slate-50 dark:border-slate-800'}`}><span className="font-black text-[10px] uppercase tracking-widest">{val.flag} {val.appName}</span>{language === key && <Check size={16} className="text-primary"/>}</button>
                    ))}
                  </div>
                )}
                {activePanel === 'themes' && (
                  <div className="p-10 space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-widest mb-10 text-center">Temas</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {THEMES.map(th => (
                        <button key={th.id} onClick={() => { setCurrentTheme(th.id); setActivePanel('menu'); }} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 ${currentTheme === th.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-50 dark:border-slate-800'}`}><div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: th.color }}></div><span className="font-black text-[8px] uppercase tracking-widest">{th.name}</span></button>
                      ))}
                    </div>
                  </div>
                )}
                {activePanel === 'extrato_mensal' && (
                  <div className="p-8 flex flex-col h-full bg-white dark:bg-slate-900">
                    <h3 className="text-3xl font-black tracking-tight uppercase leading-none mb-8">Extrato Detalhado</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                       {sortedTransactions.map(trans => (
                         <TransactionItem key={trans.id} transaction={trans} onDelete={id => setTransactions(transactions.filter(t => t.id !== id))} onToggleStatus={id => setTransactions(transactions.map(x => x.id === id ? {...x, isPaid: !x.isPaid} : x))} onUpdate={u => setTransactions(transactions.map(x => x.id === u.id ? u : x))} onEdit={t => { setEditingTransaction(t); setIsModalOpen(true); }} hideValues={isBalanceHidden} todayStr={todayStr} bankAccounts={bankAccounts} showAccountInfo={true} />
                       ))}
                    </div>
                  </div>
                )}
                {activePanel === 'notificationCenter' && <NotificationCenter transactions={transactions} reminders={reminders} creditCards={creditCards} initialCardId={viewCardId !== 'all' ? viewCardId : undefined} initialInvoiceKey={balanceDisplayData.invoiceKey} onOpenTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onUpdateTransaction={u => setTransactions(transactions.map(x => x.id === u.id ? u : x))} onDeleteTransaction={id => setTransactions(transactions.filter(t => t.id !== id))} onOpenReminders={() => setActivePanel('reminders')} onSelectDate={() => {}} onPayInvoice={handlePayInvoice} todayStr={todayStr} tomorrowStr={tomorrowStr} hideValues={isBalanceHidden} />}
                {activePanel === 'notifications' && <NotificationSettings user={user} onUpdate={setUser} />}
                {activePanel === 'calc' && <Calculator />}
                {activePanel === 'notes' && <Notes />}
                {activePanel === 'reminders' && <Reminders reminders={reminders} transactions={transactions} onAdd={r => setReminders([...reminders, r])} onRemove={id => setReminders(reminders.filter(x => x.id !== id))} onToggle={id => setReminders(reminders.map(x => x.id === id ? {...x, completed: !x.completed} : x))} onPay={(rid, att, f) => setReminders(prev => prev.map(x => x.id === rid ? {...x, completed: true, receiptAttachment: att, receiptFileName: f} : x))} />}
                {activePanel === 'profile' && <ProfileEditor user={user} onUpdate={setUser} />}
                {activePanel === 'security' && <SecuritySettings currentPin={appPin} onUpdatePin={handleUpdatePin} />}
                {activePanel === 'database' && <DatabaseManager onRefresh={() => { setRefreshTrigger(p => p + 1); setActivePanel(null); }} />}
                {activePanel === 'accounts' && <BankAccountManager accounts={bankAccountsWithBalance} onAdd={acc => setBankAccounts([...bankAccounts, acc])} onRemove={id => setBankAccounts(bankAccounts.filter(x => x.id !== id))} onUpdate={u => setBankAccounts(bankAccounts.map(a => a.id === u.id ? u : a))} onSetDefault={id => setBankAccounts(bankAccounts.map(a => ({...a, isDefault: a.id === id})))} selectedId={viewAccountId} onSelect={setViewAccountId} />}
                {activePanel === 'cards' && <CreditCardManager cards={creditCards} accounts={bankAccounts} onAdd={card => setCreditCards([...creditCards, card])} onUpdate={u => setCreditCards(prevCards => prevCards.map(c => c.id === u.id ? u : c))} onRemove={id => setCreditCards(creditCards.filter(x => x.id !== id))} />}
                {activePanel === 'files' && <FilesManager transactions={transactions} user={user} onUpdateUser={setUser} onDeleteTransactionFiles={(id, type) => setTransactions(transactions.map(t => t.id === id ? (type === 'BILL' ? {...t, billAttachment: undefined, billFileName: undefined} : {...t, receiptAttachment: undefined, receiptFileName: undefined}) : t))} />}
                {activePanel === 'calendar' && (
                  <CalendarView 
                    period={calendarPeriod} 
                    setPeriod={setCalendarPeriod} 
                    selectedDate={calendarDate} 
                    onChangeDate={handleCalendarDayClick} 
                    daysWithTransactions={daysWithTransactions} 
                    daysWithReminders={daysWithReminders}
                    daysWithNotes={daysWithNotes}
                    transactions={transactions}
                    reminders={reminders}
                    dailyNotes={dailyNotes}
                    onUpdateDailyNote={(date, text) => setDailyNotes(prev => ({...prev, [date]: text}))}
                    onAddTransaction={handleOpenTransactionForDate}
                    onAddReminder={(date, text) => {
                       const newRem = { id: generateId(), text, date, time: "12:00", completed: false };
                       setReminders(prev => [...prev, newRem]);
                    }}
                    onToggleReminder={id => setReminders(reminders.map(x => x.id === id ? {...x, completed: !x.completed} : x))}
                    onViewTransaction={t => { setEditingTransaction(t); setIsModalOpen(true); }}
                    onGoToMainFilter={() => {
                        setListPeriod('SPECIFIC_DATE');
                        setActivePanel(null);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}/>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`relative ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}><TransactionForm initialData={editingTransaction} preDefinedDate={preSelectedDate} fixedType={editingTransaction ? undefined : preSelectedType} onAdd={(list) => { if(editingTransaction) setTransactions(transactions.map(t => t.id === list[0].id ? list[0] : t)); else setTransactions([...transactions, ...list]); setIsModalOpen(false); }} onClose={() => setIsModalOpen(false)} creditCards={creditCards} bankAccounts={bankAccounts} categories={categories} allTransactions={transactions} onAddCategory={c => setCategories([...categories, c])} onRemoveCategory={c => setCategories(categories.filter(x => x !== c))} /></motion.div>
        </div>
      )}
    </div>
  );
};

export default App;
