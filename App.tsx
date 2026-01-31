import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bell, Lock, Globe, Palette, Sun, Moon, Menu, ChevronLeft, ChevronRight, 
  Eye, EyeOff, TrendingUp, TrendingDown, Wallet, LayoutGrid, CreditCard as CreditCardIcon, 
  LayoutList, Calculator as CalcIcon, Coins, ListCheck, StickyNote, FolderOpen, Cake, Database, Search, History,
  UserCircle, Building2, AlertTriangle, Shield, Sparkles, Activity, Check, ArrowLeft, X, PartyPopper, Move,
  Pipette
} from 'lucide-react';

import { 
  Transaction, BankAccount, CreditCard, Reminder, Birthday, UserProfile, 
  Language, TransactionType, PeriodType, AutoBackupConfig 
} from './types';
import { THEMES, CATEGORIES as DEFAULT_CATEGORIES } from './constants';
import { generateId, getLocalDateStr, getInvoiceKey } from './utils/helpers';
import { translations } from './locales';
import { DAILY_QUOTES } from './quotes';
import { playNotificationSound } from './utils/audio';
import { applyGlobalAnimations } from './utils/animations';

// Components
import { SecurityLock } from './components/SecurityLock';
import { TransactionForm } from './components/TransactionForm';
import { TransactionItem } from './components/TransactionItem';
import { CalendarView } from './components/CalendarView';
import { NotificationCenter } from './components/NotificationCenter';
import { BirthdayManager } from './components/BirthdayManager';
import { ProfileEditor } from './components/ProfileEditor';
import { BankAccountManager } from './components/BankAccountManager';
import { CreditCardManager } from './components/CreditCardManager';
import { Calculator } from './components/Calculator';
import { Notes } from './components/Notes';
import { ChecklistManager } from './components/ChecklistManager';
import { Reminders } from './components/Reminders';
import { CurrencyConverter } from './components/CurrencyConverter';
import { FilesManager } from './components/FilesManager';
import { DatabaseManager } from './components/DatabaseManager';
import { SecuritySettings } from './components/SecuritySettings';
import { NotificationSettings } from './components/NotificationSettings';
import { TutorialPanel } from './components/TutorialPanel';
import { AnimationSettings } from './components/AnimationSettings';

export const APP_ICON_URL = "https://cdn-icons-png.flaticon.com/512/9181/9181081.png";

const safeLoad = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      return parsed.filter(i => i !== null && i !== undefined) as any;
    }
    
    return parsed;
  } catch {
    return fallback;
  }
};

const DEFAULT_USER: UserProfile = {
  id: 'user-1',
  name: 'Usuário',
  isLocal: true,
  notificationsEnabled: true,
  animationConfig: { enabled: true, type: 'scale-up', intensity: 1, speed: 1 }
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<Language>('pt');
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [customThemeColor, setCustomThemeColor] = useState('#6366f1');
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [appPin, setAppPin] = useState('');
  
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [preSelectedDate, setPreSelectedDate] = useState<string | undefined>(undefined);
  const [formFixedType, setFormFixedType] = useState<TransactionType | undefined>(undefined);
  
  const [viewAccountId, setViewAccountId] = useState<string | 'all'>('all');
  const [viewCardId, setViewCardId] = useState<string | 'all' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moveFilter, setMoveFilter] = useState<'TODOS' | 'VENCIDOS' | 'HOJE' | 'AMANHA' | 'FUTUROS'>('TODOS');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [invoiceMonthOffset, setInvoiceMonthOffset] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [openInvoiceDetails, setOpenInvoiceDetails] = useState<{cardId: string, invoiceKey: string} | null>(null);
  const [openStatementAccountId, setOpenStatementAccountId] = useState<string | null>(null);

  const loadAllData = useCallback(() => {
    const loadedTrans = safeLoad<Transaction[]>('wallet_transactions', []);
    setTransactions(loadedTrans.map(t => ({...t, amount: Number(t.amount) || 0})));
    
    setCategories(safeLoad('wallet_categories', DEFAULT_CATEGORIES));
    setUser({ ...DEFAULT_USER, ...safeLoad('wallet_user', DEFAULT_USER) });
    setBankAccounts(safeLoad('wallet_bank_accounts', [{ id: 'default-cash', bankName: 'Dinheiro', accountNumber: '---', agency: '---', color: '#10b981', initialBalance: 0, isDefault: true, type: 'CHECKING', includeInTotal: true, isVisible: true }]));
    setCreditCards(safeLoad('wallet_credit_cards', []));
    setReminders(safeLoad('wallet_reminders', []));
    setBirthdays(safeLoad('wallet_birthdays', []));
    setDailyNotes(safeLoad('wallet_daily_notes', {}));
    setLanguage((localStorage.getItem('wallet_language') as Language) || 'pt');
    setIsDark(localStorage.getItem('wallet_dark') === 'true');
    setCurrentTheme(localStorage.getItem('wallet_theme') || 'default');
    setCustomThemeColor(localStorage.getItem('wallet_custom_color') || '#6366f1');
    setIsBalanceHidden(localStorage.getItem('wallet_balance_hidden') === 'true');
    setAppPin(localStorage.getItem('wallet_app_pin') || '');
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  useEffect(() => {
    localStorage.setItem('wallet_transactions', JSON.stringify(transactions));
    localStorage.setItem('wallet_categories', JSON.stringify(categories));
    localStorage.setItem('wallet_user', JSON.stringify(user));
    localStorage.setItem('wallet_bank_accounts', JSON.stringify(bankAccounts));
    localStorage.setItem('wallet_credit_cards', JSON.stringify(creditCards));
    localStorage.setItem('wallet_reminders', JSON.stringify(reminders));
    localStorage.setItem('wallet_birthdays', JSON.stringify(birthdays));
    localStorage.setItem('wallet_daily_notes', JSON.stringify(dailyNotes));
    localStorage.setItem('wallet_language', language);
    localStorage.setItem('wallet_dark', String(isDark));
    localStorage.setItem('wallet_theme', currentTheme);
    localStorage.setItem('wallet_custom_color', customThemeColor);
    localStorage.setItem('wallet_balance_hidden', String(isBalanceHidden));
    localStorage.setItem('wallet_app_pin', appPin);
  }, [transactions, categories, user, bankAccounts, creditCards, reminders, birthdays, dailyNotes, language, isDark, currentTheme, customThemeColor, isBalanceHidden, appPin]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (currentTheme === 'custom') {
      document.documentElement.style.setProperty('--primary-color', customThemeColor);
    } else {
      const theme = THEMES.find(t => t.id === currentTheme);
      if (theme) {
        document.documentElement.style.setProperty('--primary-color', theme.color);
      }
    }
  }, [currentTheme, customThemeColor]);

  // Apply Global Animations
  useEffect(() => {
    if (user.animationConfig) {
      applyGlobalAnimations(user.animationConfig);
    }
  }, [user.animationConfig]);

  const todayStr = getLocalDateStr();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrow);

  const t = translations[language] || translations['pt'];
  const dailyQuote = DAILY_QUOTES[quoteIndex % DAILY_QUOTES.length];

  useEffect(() => {
    if (!user.notificationsEnabled || Notification.permission !== 'granted') {
      return;
    }

    const checkNotifications = () => {
      const itemsToNotify: string[] = [];
      let didUpdate = false;

      const updatedTransactions = transactions.map(t => {
        if (!t.isPaid && !t.notified && t.date <= todayStr) {
          itemsToNotify.push(t.description);
          didUpdate = true;
          return { ...t, notified: true };
        }
        return t;
      });

      const updatedReminders = reminders.map(r => {
        if (!r.completed && !r.notified && r.date <= todayStr) {
          itemsToNotify.push(r.text);
          didUpdate = true;
          return { ...r, notified: true };
        }
        return r;
      });

      if (itemsToNotify.length > 0) {
        const body = `Você tem ${itemsToNotify.length} pendência(s) hoje ou em atraso.`;
        new Notification("Minha Carteira: Alerta de Vencimento", {
          body: body,
          icon: APP_ICON_URL,
          silent: true,
        });
        
        if (user.notificationSound) {
          playNotificationSound(user.notificationSound);
        }
        
        setTransactions(updatedTransactions);
        setReminders(updatedReminders);
      }
    };

    const timeoutId = setTimeout(checkNotifications, 3000);
    const intervalId = setInterval(checkNotifications, 60000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
}, [user.notificationsEnabled, transactions, reminders]);

  const filteredTransactions = useMemo(() => {
    let filtered = Array.isArray(transactions) ? transactions : [];

    if (viewCardId) {
        if (viewCardId === 'all') {
            filtered = filtered.filter(t => t.type === TransactionType.CREDIT_CARD);
        } else {
            filtered = filtered.filter(t => t.cardId === viewCardId);
        }
    } else {
        if (viewAccountId !== 'all') {
            filtered = filtered.filter(t => t.bankAccountId === viewAccountId);
        }
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(t => (t.description || '').toLowerCase().includes(lower) || (t.category || '').toLowerCase().includes(lower));
    }
    
    if (moveFilter === 'VENCIDOS') {
      filtered = filtered.filter(t => !t.isPaid && t.date < todayStr);
      return filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else if (moveFilter === 'HOJE') {
      filtered = filtered.filter(t => t.date === todayStr);
    } else if (moveFilter === 'AMANHA') {
      filtered = filtered.filter(t => t.date === tomorrowStr);
    } else if (moveFilter === 'FUTUROS') {
      filtered = filtered.filter(t => t.date > tomorrowStr);
    }

    return filtered.sort((a, b) => (a.date || '').localeCompare(a.date || ''));
  }, [transactions, searchTerm, moveFilter, todayStr, tomorrowStr, viewAccountId, viewCardId]);

  const bankAccountsWithBalance = useMemo(() => {
    return (bankAccounts || []).map(acc => {
      const accTransactions = transactions.filter(t => t.bankAccountId === acc.id && t.type !== TransactionType.CREDIT_CARD && t.isPaid);
      const income = accTransactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expense = accTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      return { ...acc, currentBalance: (acc.initialBalance || 0) + income - expense };
    });
  }, [bankAccounts, transactions]);

  const currentBalanceData = useMemo(() => {
    // SOMA CONSOLIDADA DE TODOS OS CARTÕES
    if (viewCardId === 'all') {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + invoiceMonthOffset);
      
      const activeCards = creditCards.filter(c => c.isVisible);
      const cardsToSum = activeCards.filter(c => c.includeInTotal);

      let totalInvoice = 0;
      let totalDebt = 0;

      cardsToSum.forEach(card => {
          const targetKey = getInvoiceKey(getLocalDateStr(targetDate), card.closingDay);
          
          // Fatura do mês selecionado
          const invoiceSum = transactions
              .filter(t => t.cardId === card.id && t.type === TransactionType.CREDIT_CARD && !t.isPaid && getInvoiceKey(t.date || '', card.closingDay) === targetKey)
              .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
          
          // Dívida total pendente do cartão
          const debtSum = transactions
              .filter(t => t.cardId === card.id && t.type === TransactionType.CREDIT_CARD && !t.isPaid)
              .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

          totalInvoice += invoiceSum;
          totalDebt += debtSum;
      });

      return {
          label: `Fatura Geral`,
          value: totalInvoice,
          color: 'text-rose-500',
          isCard: true,
          details: {
              status: 'Consolidado',
              closing: '---', 
              due: '---', 
              totalDebt: totalDebt
          },
          monthLabel: targetDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })
      };
    }

    if (viewCardId && viewCardId !== 'all') {
      const card = creditCards.find(c => c.id === viewCardId);
      if (card) {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + invoiceMonthOffset);
        
        const targetKey = getInvoiceKey(getLocalDateStr(targetDate), card.closingDay);
        const [y, m] = targetKey.split('-');
        
        const dueDate = new Date(parseInt(y), parseInt(m) - 1, card.dueDay);
        const closingDate = new Date(parseInt(y), parseInt(m) - 1, card.closingDay);
        if (card.closingDay >= card.dueDay) {
           closingDate.setMonth(closingDate.getMonth() - 1);
        }

        const invoiceTotal = transactions
          .filter(t => t.cardId === viewCardId && t.type === TransactionType.CREDIT_CARD && getInvoiceKey(t.date || '', card.closingDay) === targetKey && !t.isPaid)
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        const totalDebt = transactions
          .filter(t => t.cardId === viewCardId && t.type === TransactionType.CREDIT_CARD && !t.isPaid)
          .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        const now = new Date();
        now.setHours(0,0,0,0);
        let status = 'pendente';
        if (invoiceTotal > 0 && now > dueDate) status = 'vencida';
        else if (invoiceTotal === 0) status = 'paga';

        return {
           label: `Fatura ${card.name}`,
           value: invoiceTotal,
           color: 'text-rose-500',
           isCard: true,
           details: { 
             status, 
             closing: closingDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}), 
             due: dueDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'}), 
             totalDebt 
           },
           monthLabel: dueDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })
        };
      }
    }
    
    if (viewAccountId !== 'all') {
       const acc = bankAccountsWithBalance.find(a => a.id === viewAccountId);
       return {
         label: `Saldo ${acc?.bankName || 'Conta'}`,
         value: acc?.currentBalance || 0,
         color: (acc?.currentBalance || 0) >= 0 ? 'text-primary' : 'text-rose-500',
         isCard: false
       };
    }

    const total = bankAccountsWithBalance.filter(a => a.includeInTotal).reduce((sum, a) => sum + (a.currentBalance || 0), 0);
    return {
      label: t.totalBalance,
      value: total,
      color: total >= 0 ? 'text-primary' : 'text-rose-500',
      isCard: false
    };
  }, [bankAccountsWithBalance, viewCardId, viewAccountId, creditCards, invoiceMonthOffset, t, language, transactions]);

  const visibleAccounts = (bankAccounts || []).filter(a => a.isVisible);
  const visibleCards = (creditCards || []).filter(c => c.isVisible);

  const userBirthdayInfo = useMemo(() => {
    if (!user.birthDate) return null;
    const [y, m, d] = user.birthDate.split('-').map(Number);
    const today = new Date();
    if (today.getMonth() + 1 === m && today.getDate() === d) {
       return { age: today.getFullYear() - y };
    }
    return null;
  }, [user.birthDate]);

  const otherBirthdaysToday = useMemo(() => {
    return (birthdays || []).filter(b => {
      if (!b.birthDate) return false;
      const [_, m, d] = b.birthDate.split('-').map(Number);
      const today = new Date();
      return today.getMonth() + 1 === m && today.getDate() === d;
    });
  }, [birthdays]);

  const handleBalanceClick = () => {
    if (currentBalanceData.isCard && viewCardId && viewCardId !== 'all') {
      const card = creditCards.find(c => c.id === viewCardId);
      if (card) {
         const targetDate = new Date();
         targetDate.setMonth(targetDate.getMonth() + invoiceMonthOffset);
         const invoiceKey = getInvoiceKey(getLocalDateStr(targetDate), card.closingDay);
         
         setOpenInvoiceDetails({ cardId: card.id, invoiceKey });
         setOpenStatementAccountId(null);
         setActivePanel('alerts_center');
      }
    } else {
      setOpenStatementAccountId(viewAccountId);
      setOpenInvoiceDetails(null);
      setActivePanel('alerts_center');
    }
  };

  const handleTransfer = (fromId: string, toId: string, amount: number, date: string) => {
     const transferId = generateId();
     const fromAcc = bankAccounts.find(a => a.id === fromId);
     const toAcc = bankAccounts.find(a => a.id === toId);
     
     if (!fromAcc || !toAcc) return;

     const expense: Transaction = {
       id: `trans-${transferId}-out`,
       description: `Transferência para ${toAcc.bankName}`,
       amount: amount,
       date: date,
       type: TransactionType.EXPENSE,
       category: 'Transferência',
       isPaid: true,
       bankAccountId: fromId,
       isInstallment: false
     };

     const income: Transaction = {
      id: `trans-${transferId}-in`,
      description: `Transferência de ${fromAcc.bankName}`,
      amount: amount,
      date: date,
      type: TransactionType.INCOME,
      category: 'Transferência',
      isPaid: true,
      bankAccountId: toId,
      isInstallment: false
    };
    
    setTransactions(prev => [...prev, expense, income]);
  };

  const handlePayInvoice = (cardId: string, invoiceKey: string, total: number, selectedIds?: string[]) => {
    let updatedTransactions = [...transactions];
    
    if (selectedIds && selectedIds.length > 0) {
       updatedTransactions = updatedTransactions.map(t => selectedIds.includes(t.id) ? { ...t, isPaid: true } : t);
    } else {
       const card = creditCards.find(c => c.id === cardId);
       if (card) {
          updatedTransactions = updatedTransactions.map(t => {
             if (t.cardId === cardId && t.type === TransactionType.CREDIT_CARD && !t.isPaid) {
                const tKey = getInvoiceKey(t.date, card.closingDay);
                if (tKey <= invoiceKey) {
                   return { ...t, isPaid: true };
                }
             }
             return t;
          });
       }
    }

    const payment: Transaction = {
      id: generateId(),
      description: `Pagamento Fatura ${creditCards.find(c => c.id === cardId)?.name || ''}`,
      amount: total,
      date: todayStr,
      type: TransactionType.EXPENSE,
      category: 'Pagamento de Fatura',
      isPaid: true,
      isInstallment: false,
      bankAccountId: bankAccounts.find(b => b.isDefault)?.id || bankAccounts[0]?.id
    };
    
    setTransactions([...updatedTransactions, payment]);
  };

  if (appPin && isLocked) {
    return <SecurityLock correctPin={appPin} user={user} onUnlock={() => setIsLocked(false)} appName={t.appName} smartText={t.smart} />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'} transition-colors duration-500 pb-20 overflow-x-hidden custom-scrollbar selection:bg-primary selection:text-white`}>
      <header className="max-w-4xl mx-auto px-4 pt-8 md:pt-10 flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-6 w-full">
           <div className="w-28 h-28 p-5 mb-4 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 transition-transform hover:scale-105 duration-500 flex items-center justify-center">
             <img src={APP_ICON_URL} alt="Logo" className="w-full h-full object-contain" />
           </div>
           <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-[0.2em] leading-tight uppercase text-center whitespace-nowrap">
             {t.appName.toUpperCase()} <span className="text-primary">{t.smart.toUpperCase()}</span>
           </h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
             Olá, <span className="text-primary font-black">{user.name.split(' ')[0]}</span>
           </p>
        </div>

        {userBirthdayInfo && (
            <div className="flex flex-col items-center gap-2 text-amber-500 mb-6 text-center animate-pulse">
              <div className="flex items-center gap-2">
                <Cake size={18} strokeWidth={2.5}/>
                <span className="text-xs font-bold uppercase tracking-widest">hoje é seu aniversário! ({userBirthdayInfo.age} anos)</span>
                <PartyPopper size={18}/>
              </div>
              <p className="text-[10px] font-medium italic opacity-80 uppercase tracking-wide">"que a abundância te encontre neste novo ciclo"</p>
            </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-8 py-3 px-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-lg overflow-x-auto max-w-full">
          <button onClick={() => { setOpenInvoiceDetails(null); setOpenStatementAccountId(null); setActivePanel('alerts_center'); }} className="text-slate-400 hover:text-primary transition-all relative shrink-0 p-1">
             <Bell size={20}/>
             {(transactions.filter(t => !t.isPaid && t.date <= todayStr).length + reminders.filter(r => !r.completed && r.date <= todayStr).length) > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
          </button>
          <button onClick={() => setActivePanel('security')} className="text-slate-400 hover:text-primary transition-all shrink-0 p-1"><Lock size={20}/></button>
          <button onClick={() => setActivePanel('language')} className="text-slate-400 hover:text-primary transition-all shrink-0 p-1"><Globe size={20}/></button>
          <button onClick={() => setActivePanel('themes')} className="text-slate-400 hover:text-primary transition-all shrink-0 p-1"><Palette size={20}/></button>
          <button onClick={() => setIsDark(!isDark)} className="text-slate-400 hover:text-primary transition-all shrink-0 p-1">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
          <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
          <button onClick={() => setActivePanel('menu')} className="text-primary hover:scale-110 transition-all shrink-0 p-1"><Menu size={20}/></button>
        </div>

        <div className="w-full flex items-center justify-center gap-3 mb-8 px-4">
          <button onClick={() => setQuoteIndex(prev => (prev - 1 + DAILY_QUOTES.length) % DAILY_QUOTES.length)} className="text-slate-300 hover:text-primary transition-colors p-1"><ChevronLeft size={18}/></button>
          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 text-center italic max-w-[260px] leading-relaxed select-none">"{dailyQuote}"</p>
          <button onClick={() => setQuoteIndex(prev => (prev + 1) % DAILY_QUOTES.length)} className="text-slate-300 hover:text-primary transition-colors p-1"><ChevronRight size={18}/></button>
        </div>

        <div className="mb-8">
           <button onClick={() => setActivePanel('calendar')} className="flex items-center gap-3 group transition-all">
             <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all">
                <span className="text-lg font-black">{new Date().getDate()}</span>
             </div>
             <div className="text-left">
               <p className="text-xs font-bold text-slate-800 dark:text-white uppercase leading-none mb-0.5 group-hover:text-primary transition-colors">{new Date().toLocaleDateString(language, { weekday: 'long' })}</p>
               <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString(language, { month: 'long', year: 'numeric' })}</p>
             </div>
           </button>
        </div>

        {otherBirthdaysToday.length > 0 && (
            <div className="flex flex-col items-center gap-2 text-amber-500 mb-8 text-center px-4">
              {otherBirthdaysToday.map(person => (
                <div key={person.id} className="flex items-center justify-center gap-2">
                  <Cake size={16} strokeWidth={2.5}/>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Hoje é aniversário de {person.name} <span className="opacity-60">({new Date().getFullYear() - new Date(person.birthDate + 'T12:00:00').getFullYear()} anos)</span>
                  </span>
                  <PartyPopper size={16}/>
                </div>
              ))}
            </div>
        )}

        <div className={`w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 relative overflow-hidden text-center transition-all ${isBalanceHidden ? 'opacity-95' : ''}`}>
           <button onClick={() => setIsBalanceHidden(!isBalanceHidden)} className="absolute top-5 right-5 text-slate-300 hover:text-primary p-2 transition-all z-20">
             {isBalanceHidden ? <EyeOff size={18}/> : <Eye size={18}/>}
           </button>
           
           {currentBalanceData.isCard && (
             <div className="flex items-center justify-center gap-3 mb-3">
                <button onClick={() => setInvoiceMonthOffset(p => p - 1)} className="text-slate-300 hover:text-primary p-1"><ChevronLeft size={16}/></button>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">{currentBalanceData.monthLabel}</span>
                   <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${currentBalanceData.details?.status === 'paga' ? 'bg-emerald-100 text-emerald-600' : (currentBalanceData.details?.status === 'vencida' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600')}`}>
                     {currentBalanceData.details?.status}
                   </span>
                </div>
                <button onClick={() => setInvoiceMonthOffset(p => p + 1)} className="text-slate-300 hover:text-primary p-1"><ChevronRight size={16}/></button>
             </div>
           )}

           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{currentBalanceData.label}</p>
           
           <button onClick={handleBalanceClick} className="hover:opacity-80 transition-opacity">
             <h3 className={`text-4xl font-black tracking-tighter truncate leading-tight mb-5 ${currentBalanceData.color}`}>
               {isBalanceHidden ? 'R$ •••••' : currentBalanceData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </h3>
           </button>

           {currentBalanceData.isCard && !isBalanceHidden && (
             <div>
                <div className="flex justify-center gap-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <span>fechamento</span>
                      <span className="text-slate-600 dark:text-slate-300 font-black text-[10px]">{currentBalanceData.details?.closing}</span>
                    </div>
                    <div className="w-[1px] bg-slate-200 dark:bg-slate-700 h-6"></div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span>vencimento</span>
                      <span className="text-slate-600 dark:text-slate-300 font-black text-[10px]">{currentBalanceData.details?.due}</span>
                    </div>
                </div>
                <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">saldo devedor total</p>
                   <p className="text-sm font-black text-slate-600 dark:text-slate-300">R$ {currentBalanceData.details?.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
             </div>
           )}

           <div className="flex justify-center gap-6 mt-2">
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => { setPreSelectedDate(undefined); setEditingTransaction(undefined); setFormFixedType(TransactionType.INCOME); setIsModalOpen(true); }} 
                  className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all border-4 border-white dark:border-slate-800 hover:scale-110"
                >
                  <TrendingUp size={32} strokeWidth={3}/>
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entrada</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => { setPreSelectedDate(undefined); setEditingTransaction(undefined); setFormFixedType(TransactionType.EXPENSE); setIsModalOpen(true); }} 
                  className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all border-4 border-white dark:border-slate-800 hover:scale-110"
                >
                  <TrendingDown size={32} strokeWidth={3}/>
                </button>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Saída</span>
              </div>
           </div>
        </div>

        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-3 px-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={14}/> {t.accounts.toLowerCase()}</h3>
            <button onClick={() => setActivePanel('accounts')} className="text-primary hover:underline font-bold text-[9px] uppercase tracking-wider">adicionar</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 px-2">
            <button onClick={() => { setViewAccountId('all'); setViewCardId(null); }} className={`shrink-0 p-4 rounded-[1.8rem] border-2 transition-all min-w-[110px] flex flex-col items-center justify-center gap-2 shadow-sm ${viewAccountId === 'all' && viewCardId === null ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
              <LayoutGrid size={18}/><span className="text-[9px] font-bold uppercase tracking-widest">geral</span>
            </button>
            {visibleAccounts.map(acc => (
              <button key={acc.id} onClick={() => { setViewAccountId(acc.id); setViewCardId(null); }} className={`shrink-0 p-4 rounded-[1.8rem] border-2 transition-all min-w-[120px] flex flex-col items-center gap-2 relative overflow-hidden shadow-sm ${viewAccountId === acc.id ? 'border-primary bg-white dark:bg-slate-800 shadow-md ring-2 ring-primary/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800'}`}>
                <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase truncate w-full text-center">{acc.bankName}</span>
                <div className="mt-0.5"><p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{isBalanceHidden ? 'R$ ••' : (acc.currentBalance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                <div className="w-6 h-1 rounded-full mt-1.5 opacity-80" style={{ backgroundColor: acc.color }}></div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-3 px-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCardIcon size={14}/> {t.cards.toLowerCase()}</h3>
            <button onClick={() => setActivePanel('cards')} className="text-primary hover:underline font-bold text-[9px] uppercase tracking-wider">adicionar</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 px-2">
             {visibleCards.length === 0 ? (
               <div className="w-full text-center py-4 opacity-40 text-[9px] font-bold uppercase tracking-widest flex flex-col items-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[1.8rem]">
                  <CreditCardIcon size={18}/> Nenhum cartão
               </div>
             ) : (
               <>
                 <button onClick={() => { setViewCardId('all'); setViewAccountId('all'); setInvoiceMonthOffset(0); }} className={`shrink-0 p-4 rounded-[1.8rem] border-2 transition-all min-w-[110px] flex flex-col items-center justify-center gap-2 shadow-sm ${viewCardId === 'all' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                   <LayoutList size={18}/><span className="text-[9px] font-bold uppercase tracking-widest">todos os cartões</span>
                 </button>
                 {visibleCards.map(card => (
                   <button key={card.id} onClick={() => { setViewCardId(card.id); setViewAccountId('all'); setInvoiceMonthOffset(0); }} className={`shrink-0 p-4 rounded-[1.8rem] border-2 transition-all min-w-[120px] flex flex-col items-center gap-2 relative overflow-hidden shadow-sm ${viewCardId === card.id ? 'border-primary bg-white dark:bg-slate-800 shadow-md ring-2 ring-primary/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800'}`}>
                     <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase truncate w-full text-center">{card.name}</span>
                     <div className="mt-0.5"><p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Limite {isBalanceHidden ? '•••' : (card.limit/1000).toFixed(1)+'k'}</p></div>
                     <div className="w-6 h-1 rounded-full mt-1.5 opacity-80" style={{ backgroundColor: card.color }}></div>
                   </button>
                 ))}
               </>
             )}
          </div>
        </div>

        <div className="w-full mb-8 px-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-5"><LayoutGrid size={14}/> utilitários</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'calc', icon: <CalcIcon size={20} className="text-white"/>, label: 'calculadora', color: 'bg-orange-500 shadow-orange-500/40' },
              { id: 'reminders', icon: <Bell size={20} className="text-white"/>, label: 'lembretes', color: 'bg-rose-500 shadow-rose-500/40' },
              { id: 'converter', icon: <Coins size={20} className="text-white"/>, label: 'câmbio', color: 'bg-emerald-500 shadow-emerald-500/40' },
              { id: 'checklist', icon: <ListCheck size={20} className="text-white"/>, label: 'check-list', color: 'bg-sky-500 shadow-sky-500/40' },
              { id: 'notes', icon: <StickyNote size={20} className="text-white"/>, label: 'notas', color: 'bg-amber-400 shadow-amber-400/40' },
              { id: 'files', icon: <FolderOpen size={20} className="text-white"/>, label: 'arquivos', color: 'bg-indigo-500 shadow-indigo-500/40' },
              { id: 'birthdays', icon: <Cake size={20} className="text-white"/>, label: 'aniversário', color: 'bg-pink-500 shadow-pink-500/40' },
              { id: 'database', icon: <Database size={20} className="text-white"/>, label: 'backup', color: 'bg-violet-500 shadow-violet-500/40' },
            ].map(tool => (
              <button key={tool.id} onClick={() => setActivePanel(tool.id)} className="flex flex-col items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-[2rem] border shadow-lg transition-all border-slate-200 dark:border-slate-800 group">
                <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-all duration-300 ${tool.color}`}>
                  {tool.icon}
                </div>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 text-center uppercase tracking-tight leading-tight">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full relative mb-6">
           <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"/>
           <input placeholder="pesquisar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-800 rounded-[2rem] font-bold text-xs outline-none transition-all border border-slate-200 dark:border-slate-800 focus:border-primary/30 text-center shadow-lg"/>
        </div>

        <div className="w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-16">
           <div className="p-5 border-b dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 uppercase tracking-widest mb-4"><History size={14} className="text-slate-400"/> movimentações</h3>
              
              <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-[1.2rem] w-full overflow-x-auto no-scrollbar">
                {['TODOS', 'VENCIDOS', 'HOJE', 'AMANHA', 'FUTUROS'].map(f => (
                  <button key={f} onClick={() => setMoveFilter(f as any)} className={`flex-1 py-2.5 px-2 rounded-xl text-[8px] font-bold uppercase transition-all whitespace-nowrap flex items-center justify-center ${moveFilter === f ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{f.toLowerCase()}</button>
                ))}
              </div>
           </div>
           <div className="divide-y dark:divide-slate-700 max-h-[350px] overflow-y-auto custom-scrollbar">
              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center opacity-20 flex flex-col items-center"><History size={40}/><p className="font-bold text-xs mt-3 uppercase tracking-widest">{t.noTransactions}</p></div>
              ) : (
                filteredTransactions.map(trans => (
                  <TransactionItem key={trans.id} transaction={trans} onDelete={id => setTransactions(transactions.filter(t => t.id !== id))} onToggleStatus={id => setTransactions(transactions.map(x => x.id === id ? {...x, isPaid: !x.isPaid} : x))} onUpdate={u => setTransactions(transactions.map(x => x.id === u.id ? u : x))} onEdit={t => { setEditingTransaction(t); setFormFixedType(undefined); setIsModalOpen(true); }} hideValues={isBalanceHidden} todayStr={todayStr} />
                ))
              )}
           </div>
        </div>
      </header>

      {activePanel && (
          <div className="fixed inset-0 z-[400] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setActivePanel(null)}/>
            <div className={`relative w-full md:w-[600px] h-full ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} shadow-2xl flex flex-col overflow-hidden`}>
              <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
                {activePanel !== 'menu' && <button onClick={() => setActivePanel('menu')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:text-primary transition-all"><ArrowLeft size={20}/></button>}
                <button onClick={() => setActivePanel(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all"><X size={20}/></button>
              </div>
              <div className="flex-1">
                {activePanel === 'menu' && (
                  <div className="h-full overflow-y-auto custom-scrollbar pt-20 px-6 pb-8">
                    <div className="space-y-3">
                      <h2 className="text-xl font-black mb-6 text-center uppercase tracking-[0.4em]">{t.profile} e Ajustes</h2>
                      {[
                        { id: 'profile', icon: <UserCircle size={20}/>, label: 'meu perfil' }, 
                        { id: 'accounts', icon: <Building2 size={20}/>, label: 'contas' }, 
                        { id: 'cards', icon: <CreditCardIcon size={20}/>, label: 'cartões' }, 
                        { id: 'notifications', icon: <Bell size={20}/>, label: 'sons e notificações' },
                        { id: 'animations', icon: <Move size={20}/>, label: 'animações' },
                        // { id: 'alerts_center', icon: <AlertTriangle size={20}/>, label: 'alertas e vencimentos' }, // REMOVIDO DO MENU
                        { id: 'database', icon: <Database size={20}/>, label: 'backup' }, 
                        { id: 'security', icon: <Shield size={20}/>, label: t.security },
                        { id: 'tutorial', icon: <Sparkles size={20}/>, label: 'guia do usuário' },
                        { id: 'themes', icon: <Palette size={20}/>, label: 'temas' },
                        { id: 'language', icon: <Globe size={20}/>, label: 'idioma' },
                      ].map(item => (
                        <button key={item.id} onClick={() => {
                          if (item.id === 'alerts_center') {
                            setOpenInvoiceDetails(null);
                            setOpenStatementAccountId(null);
                          }
                          setActivePanel(item.id);
                        }} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-between hover:bg-primary/10 transition-all border-2 border-transparent hover:border-primary/10 group">
                          <div className="flex items-center gap-4 text-slate-500 group-hover:text-primary">{item.icon}<span className="font-bold text-xs uppercase tracking-widest">{item.label}</span></div><ChevronRight size={16} className="opacity-20"/>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {activePanel === 'calendar' && <CalendarView period={PeriodType.MONTHLY} setPeriod={() => {}} selectedDate={selectedDate} onChangeDate={(d) => { setSelectedDate(d); }} daysWithTransactions={transactions.map(t => t.date)} daysWithReminders={reminders.map(r => r.date)} daysWithNotes={Object.keys(dailyNotes)} transactions={transactions} reminders={reminders} dailyNotes={dailyNotes} onUpdateDailyNote={(date, text) => setDailyNotes(prev => ({ ...prev, [date]: text }))} onAddTransaction={(date) => { setPreSelectedDate(date); setEditingTransaction(undefined); setIsModalOpen(true); }} onAddReminder={(date, text) => setReminders(prev => [...prev, { id: generateId(), text, date, time: '12:00', completed: false }])} onToggleReminder={(id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))} onViewTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onGoToMainFilter={() => { setActivePanel(null); }} />}
                {activePanel === 'language' && (
                  <div className="h-full overflow-y-auto custom-scrollbar pt-20 px-6 pb-8">
                    <div className="space-y-3">
                      <h2 className="text-xl font-black mb-6 text-center uppercase tracking-[0.4em]">idioma</h2>
                      {Object.keys(translations).map(langKey => (
                        <button key={langKey} onClick={() => { setLanguage(langKey as Language); setActivePanel(null); }} className={`w-full p-5 rounded-[2rem] border-2 flex items-center justify-between transition-all ${language === langKey ? 'bg-primary border-primary text-white shadow-xl scale-105' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'}`}>
                          <div className="flex items-center gap-4"><span className="text-xl">{translations[langKey].flag}</span><span className="font-bold text-xs uppercase tracking-widest">{translations[langKey].appName}</span></div>
                          {language === langKey && <Check size={18} strokeWidth={4} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {activePanel === 'alerts_center' && (
                  <NotificationCenter
                    transactions={transactions}
                    reminders={reminders}
                    creditCards={creditCards}
                    initialCardId={openInvoiceDetails?.cardId}
                    initialInvoiceKey={openInvoiceDetails?.invoiceKey}
                    initialAccountId={openStatementAccountId}
                    onOpenTransaction={(t) => { setEditingTransaction(t); setFormFixedType(undefined); setIsModalOpen(true); }}
                    onUpdateTransaction={(updated) => setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t))}
                    onDeleteTransaction={(id) => setTransactions(prev => prev.filter(t => t.id !== id))}
                    onOpenReminders={() => setActivePanel('reminders')}
                    onSelectDate={(d) => { setSelectedDate(d); setActivePanel('calendar'); }}
                    onPayInvoice={handlePayInvoice}
                    todayStr={todayStr}
                    tomorrowStr={tomorrowStr}
                    hideValues={isBalanceHidden}
                  />
                )}
                {activePanel === 'birthdays' && <BirthdayManager birthdays={birthdays} onAdd={b => setBirthdays([...birthdays, b])} onRemove={id => setBirthdays(birthdays.filter(x => x.id !== id))} />}
                {activePanel === 'profile' && <ProfileEditor user={user} onUpdate={setUser} />}
                {activePanel === 'accounts' && <BankAccountManager accounts={bankAccountsWithBalance} onAdd={acc => setBankAccounts([...bankAccounts, acc])} onRemove={id => setBankAccounts(bankAccounts.filter(x => x.id !== id))} onUpdate={u => setBankAccounts(bankAccounts.map(a => a.id === u.id ? u : a))} onSetDefault={id => setBankAccounts(bankAccounts.map(a => ({...a, isDefault: a.id === id})))} selectedId={viewAccountId} onSelect={setViewAccountId} onTransfer={handleTransfer} />}
                {activePanel === 'cards' && <CreditCardManager cards={creditCards} accounts={bankAccounts} onAdd={card => setCreditCards([...creditCards, card])} onUpdate={u => setCreditCards(prevCards => prevCards.map(c => c.id === u.id ? u : c))} onRemove={id => setCreditCards(creditCards.filter(x => x.id !== id))} />}
                {activePanel === 'calc' && <Calculator />}
                {activePanel === 'notes' && <Notes />}
                {activePanel === 'checklist' && <ChecklistManager />}
                {activePanel === 'reminders' && <Reminders reminders={reminders} transactions={transactions} onAdd={r => setReminders([...reminders, r])} onRemove={id => setReminders(reminders.filter(x => x.id !== id))} onToggle={id => setReminders(reminders.map(x => x.id === id ? {...x, completed: !x.completed} : x))} onPay={(id, attachment, fileName) => {
                    const r = reminders.find(rem => rem.id === id);
                    if (r) {
                        setTransactions(prev => [...prev, {
                            id: generateId(),
                            description: r.text,
                            amount: 0,
                            date: r.date,
                            type: TransactionType.EXPENSE,
                            category: 'Lembrete',
                            isPaid: true,
                            isInstallment: false,
                            receiptAttachment: attachment,
                            receiptFileName: fileName
                        }]);
                        setReminders(prev => prev.map(rem => rem.id === id ? {...rem, completed: true} : rem));
                    }
                }} onEditTransaction={t => { setEditingTransaction(t); setFormFixedType(undefined); setIsModalOpen(true); }} />}
                {activePanel === 'converter' && <CurrencyConverter />}
                {activePanel === 'files' && <FilesManager transactions={transactions} user={user} onUpdateUser={setUser} onDeleteTransactionFiles={(id, type) => {
                    setTransactions(prev => prev.map(t => {
                        if (t.id === id) {
                            if (type === 'BILL') return { ...t, billAttachment: undefined, billFileName: undefined };
                            if (type === 'RECEIPT') return { ...t, receiptAttachment: undefined, receiptFileName: undefined };
                        }
                        return t;
                    }));
                }} />}
                {activePanel === 'database' && <DatabaseManager onRefresh={loadAllData} />}
                {activePanel === 'security' && <SecuritySettings currentPin={appPin} onUpdatePin={setAppPin} />}
                {activePanel === 'notifications' && <NotificationSettings user={user} onUpdate={setUser} />}
                {activePanel === 'animations' && <AnimationSettings user={user} onUpdate={setUser} />}
                {activePanel === 'tutorial' && <TutorialPanel />}
                {activePanel === 'themes' && (
                  <div className="h-full overflow-y-auto custom-scrollbar pt-20 px-6 pb-8">
                    <h2 className="text-xl font-black mb-8 text-center uppercase tracking-[0.4em]">Paleta de Cores</h2>
                    
                    <div className="grid grid-cols-2 gap-3 mb-10">
                      {THEMES.map(theme => (
                        <button key={theme.id} onClick={() => setCurrentTheme(theme.id)} className={`p-5 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all ${currentTheme === theme.id ? 'border-primary bg-primary/5 shadow-xl' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}><div className="w-10 h-10 rounded-[1rem] shadow-lg" style={{ backgroundColor: theme.color }}></div><span className="font-bold text-[9px] uppercase tracking-widest">{theme.name}</span></button>
                      ))}
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                       <h4 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Pipette size={16} className="text-primary"/> Tema Personalizado</h4>
                       
                       <div className="flex flex-col items-center gap-6">
                          <div 
                            className="w-20 h-20 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: customThemeColor }}
                          >
                             <input 
                               type="color" 
                               value={customThemeColor} 
                               onChange={(e) => {
                                 setCustomThemeColor(e.target.value);
                                 setCurrentTheme('custom');
                               }}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                             />
                             <Check size={32} className="text-white drop-shadow-md"/>
                          </div>
                          
                          <div className="w-full">
                             <div className="flex justify-between mb-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase">Seletor de Cor</span>
                                <span className="text-[8px] font-black text-primary uppercase">{customThemeColor}</span>
                             </div>
                             <button 
                               onClick={() => setCurrentTheme('custom')}
                               className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${currentTheme === 'custom' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600'}`}
                             >
                               Aplicar Minha Cor
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-3xl" onClick={() => setIsModalOpen(false)}/>
          <div className={`relative ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} w-full max-w-2xl rounded-[3rem] p-0 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}>
            <TransactionForm initialData={editingTransaction} preDefinedDate={preSelectedDate} fixedType={formFixedType} onAdd={(list) => { setTransactions([...transactions, ...list]); setIsModalOpen(false); }} onClose={() => setIsModalOpen(false)} creditCards={creditCards} bankAccounts={bankAccounts} categories={categories} onAddCategory={c => setCategories([...categories, c])} onRemoveCategory={c => setCategories(categories.filter(x => x !== c))} allTransactions={transactions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
