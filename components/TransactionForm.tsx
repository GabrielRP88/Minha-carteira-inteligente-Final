
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, CreditCard, BankAccount } from '../types';
import { 
  X, Check, Calendar, Tag, CreditCard as CardIcon, DollarSign, 
  Repeat, Camera, Upload, Trash2, Plus, Paperclip, FileText, 
  Eye, Share2, Receipt, ScanBarcode, Minus, Wallet, ChevronRight, ChevronLeft, CalendarClock
} from 'lucide-react';
import { CameraModal } from './CameraModal';
import { generateId, getLocalDateStr } from '../utils/helpers';

interface Props {
  initialData?: Transaction;
  preDefinedDate?: string;
  fixedType?: TransactionType;
  onAdd: (transactions: Transaction[]) => void;
  onClose: () => void;
  creditCards: CreditCard[];
  bankAccounts: BankAccount[];
  categories: string[];
  allTransactions: Transaction[];
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
}

export const TransactionForm: React.FC<Props> = ({
  initialData, preDefinedDate, fixedType, onAdd, onClose,
  creditCards, bankAccounts, categories, onAddCategory, onRemoveCategory
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(getLocalDateStr());
  const [category, setCategory] = useState('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<'ACCOUNT' | 'CARD'>('ACCOUNT');
  const [cardId, setCardId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [barcode, setBarcode] = useState('');
  
  const [billAttachment, setBillAttachment] = useState<string | undefined>(undefined);
  const [billFileName, setBillFileName] = useState<string | undefined>(undefined);
  const [receiptAttachment, setReceiptAttachment] = useState<string | undefined>(undefined);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(undefined);
  
  const [activeCameraType, setActiveCameraType] = useState<'BILL' | 'RECEIPT' | null>(null);
  const billFileInputRef = useRef<HTMLInputElement>(null);
  const receiptFileInputRef = useRef<HTMLInputElement>(null);

  const [isSelectingCategory, setIsSelectingCategory] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setAmount(String(initialData.amount));
      setType(initialData.type);
      setDate(initialData.date);
      setCategory(initialData.category);
      setIsInstallment(initialData.isInstallment);
      setTotalInstallments(initialData.totalInstallments || 2);
      setPaymentMethod(initialData.type === TransactionType.CREDIT_CARD ? 'CARD' : 'ACCOUNT');
      setCardId(initialData.cardId || '');
      setBankAccountId(initialData.bankAccountId || '');
      setBarcode(initialData.barcode || '');
      setBillAttachment(initialData.billAttachment);
      setBillFileName(initialData.billFileName);
      setReceiptAttachment(initialData.receiptAttachment);
      setReceiptFileName(initialData.receiptFileName);
    } else {
      if (fixedType) setType(fixedType);
      
      const today = getLocalDateStr();
      if (preDefinedDate) {
        setDate(preDefinedDate);
      }

      if (bankAccounts.length > 0) {
        const defaultAcc = bankAccounts.find(a => a.isDefault) || bankAccounts[0];
        setBankAccountId(defaultAcc.id);
      }
      if (creditCards.length > 0) setCardId(creditCards[0].id);
      if (categories.length > 0) setCategory(categories[0]);
    }
  }, [initialData, preDefinedDate, fixedType, bankAccounts, creditCards, categories]);

  // Scroll to bottom when creating category
  useEffect(() => {
    if (isCreatingCategory && categoryListRef.current) {
        setTimeout(() => {
            if (categoryListRef.current) {
                categoryListRef.current.scrollTop = categoryListRef.current.scrollHeight;
            }
        }, 100);
    }
  }, [isCreatingCategory]);

  const isIncome = type === TransactionType.INCOME;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'BILL' | 'RECEIPT') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'BILL') {
          setBillAttachment(reader.result as string);
          setBillFileName(file.name);
        } else {
          setReceiptAttachment(reader.result as string);
          setReceiptFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openFile = (dataUrl: string) => {
    if (dataUrl.includes('application/pdf')) {
      const base64Parts = dataUrl.split(',');
      const byteCharacters = atob(base64Parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
        const win = window.open();
        if(win) {
            win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        }
    }
  };

  const shareContent = async (title: string, text: string, dataUrl?: string, fileName?: string) => {
    if (!navigator.share) return alert("Compartilhamento não disponível.");
    try {
      const shareData: ShareData = { title, text };
      if (dataUrl && fileName) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }
      await navigator.share(shareData);
    } catch (err) { console.error(err); }
  };

  const handleSave = (finalIsPaid: boolean) => {
    if (!amount || !date || !category) {
      alert("Preencha o valor e a categoria");
      return;
    }

    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert("Valor inválido");
      return;
    }

    const transactionsToAdd: Transaction[] = [];
    const baseId = initialData?.id || generateId();
    const descToSave = description.trim() || category; 

    if (paymentMethod === 'CARD' && !isIncome) {
        if (isInstallment && totalInstallments > 1) {
            const partValue = val / totalInstallments;
            let currentDate = new Date(date + 'T12:00:00');
            
            for (let i = 0; i < totalInstallments; i++) {
                const dateStr = getLocalDateStr(currentDate);
                transactionsToAdd.push({
                    id: i === 0 ? baseId : generateId(),
                    description: `${descToSave} (${i + 1}/${totalInstallments})`,
                    amount: partValue,
                    date: dateStr,
                    type: TransactionType.CREDIT_CARD,
                    category,
                    isInstallment: true,
                    totalInstallments,
                    currentInstallment: i + 1,
                    isPaid: false, 
                    parentId: i === 0 ? undefined : baseId,
                    cardId,
                    billAttachment: i === 0 ? billAttachment : undefined,
                    billFileName: i === 0 ? billFileName : undefined,
                    barcode: undefined // No barcode for credit card purchases usually
                });
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        } else {
            transactionsToAdd.push({
                id: baseId,
                description: descToSave,
                amount: val,
                date,
                type: TransactionType.CREDIT_CARD,
                category,
                isInstallment: false,
                isPaid: false, 
                cardId,
                billAttachment,
                billFileName,
                barcode: undefined
            });
        }
    } else {
        transactionsToAdd.push({
            id: baseId,
            description: descToSave,
            amount: val,
            date,
            type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
            category,
            isInstallment: false,
            isPaid: finalIsPaid, 
            bankAccountId,
            billAttachment,
            billFileName,
            receiptAttachment,
            receiptFileName,
            barcode
        });
    }
    
    onAdd(transactionsToAdd);
  };

  const handleCameraCapture = (base64: string) => {
    if (activeCameraType === 'BILL') {
        setBillAttachment(base64);
        setBillFileName(`Foto_${Date.now()}.jpg`);
    } else if (activeCameraType === 'RECEIPT') {
        setReceiptAttachment(base64);
        setReceiptFileName(`Recibo_${Date.now()}.jpg`);
    }
    setActiveCameraType(null);
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed) {
      if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        alert('Esta categoria já existe.');
        return;
      }
      onAddCategory(trimmed);
      setCategory(trimmed);
      setNewCategory('');
      setIsCreatingCategory(false);
    }
  };

  if (isSelectingCategory) {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-4 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0 pt-2 px-1">
          <button 
            type="button"
            onClick={() => { setIsSelectingCategory(false); setDeletingCategory(null); }} 
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={20}/> <span className="text-xs font-black uppercase">Voltar</span>
          </button>
          <h3 className="text-xl font-black uppercase tracking-tight">Categorias</h3>
          <div className="w-10"></div>
        </div>

        <div 
            ref={categoryListRef} 
            className="flex-1 overflow-y-auto custom-scrollbar p-1 min-h-0 space-y-2 pb-24 touch-pan-y overscroll-contain"
        >
           {categories.map(cat => (
             <div key={cat} className="flex items-center gap-2 group w-full shrink-0 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
               <button 
                 type="button"
                 onClick={() => { setCategory(cat); setIsSelectingCategory(false); }}
                 className={`flex-1 p-4 rounded-2xl font-bold text-xs text-left transition-all flex justify-between items-center border-2 ${category === cat ? 'bg-primary border-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800 hover:border-primary/50'}`}
               >
                 {cat}
                 {category === cat && <Check size={16}/>}
               </button>
               
               {deletingCategory === cat ? (
                 <div className="flex items-center gap-1 animate-in slide-in-from-right-4 fade-in duration-300">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemoveCategory(cat);
                        if(category === cat) setCategory('');
                        setDeletingCategory(null);
                      }}
                      className="p-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all flex items-center justify-center"
                    >
                      Apagar
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeletingCategory(null);
                      }}
                      className="p-4 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl active:scale-95 transition-all"
                    >
                      <X size={18}/>
                    </button>
                 </div>
               ) : (
                 <button 
                   type="button"
                   onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation();
                      setDeletingCategory(cat);
                   }}
                   className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shrink-0 active:scale-90 border-2 border-transparent"
                 >
                   <Trash2 size={18}/>
                 </button>
               )}
             </div>
           ))}

           {isCreatingCategory ? (
              <div className="flex gap-2 items-center p-1 animate-in fade-in slide-in-from-bottom-2 shrink-0">
                  <input 
                    autoFocus
                    placeholder="Nome da nova categoria..." 
                    value={newCategory} 
                    onChange={e => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-primary rounded-2xl font-bold outline-none text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button 
                    type="button"
                    onClick={handleAddCategory} 
                    className="p-4 bg-primary text-white rounded-2xl shadow-lg active:scale-95 transition-all"
                  >
                    <Check size={20}/>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsCreatingCategory(false); setNewCategory(''); }} 
                    className="p-4 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-2xl active:scale-95 transition-all"
                  >
                    <X size={20}/>
                  </button>
              </div>
           ) : (
              <button
                type="button"
                onClick={() => setIsCreatingCategory(true)}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group shrink-0 active:scale-95"
              >
                <Plus size={18} className="group-hover:scale-110 transition-transform"/>
                <span className="font-black text-[10px] uppercase tracking-widest">Criar Nova Categoria</span>
              </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="text-2xl font-black uppercase tracking-tight">{initialData ? 'Editar' : 'Novo'} Lançamento</h3>
        <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 hover:scale-110 active:scale-90 transition-all duration-300"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2 min-h-0 pb-24">
         {!initialData && (
             <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] shrink-0">
                 <button onClick={() => setType(TransactionType.INCOME)} className={`py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>Receita</button>
                 <button onClick={() => setType(TransactionType.EXPENSE)} className={`py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 ${type !== TransactionType.INCOME ? 'bg-rose-500 text-white shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>Despesa</button>
             </div>
         )}

         {!isIncome && (
             <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] grid grid-cols-2 gap-2">
                 <button onClick={() => setPaymentMethod('ACCOUNT')} className={`py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all duration-300 active:scale-95 ${paymentMethod === 'ACCOUNT' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white scale-[1.02]' : 'text-slate-400'}`}><Wallet size={14}/> Conta / Dinheiro</button>
                 <button onClick={() => setPaymentMethod('CARD')} className={`py-3 rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all duration-300 active:scale-95 ${paymentMethod === 'CARD' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white scale-[1.02]' : 'text-slate-400'}`}><CardIcon size={14}/> Cartão Crédito</button>
             </div>
         )}

         <div className="space-y-4">
             {paymentMethod === 'CARD' && !isIncome ? (
                 <div className="space-y-4 animate-in slide-in-from-top-4">
                     <div className="space-y-1.5">
                         <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Cartão de Crédito</p>
                         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                             {creditCards.map(c => (
                                 <button 
                                    key={c.id} 
                                    onClick={() => setCardId(c.id)}
                                    className={`shrink-0 px-4 py-3 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${cardId === c.id ? 'border-primary bg-primary/5 text-primary scale-105' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                                 >
                                    <div className="w-3 h-3 rounded-full" style={{ background: c.color }}></div> {c.name}
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all hover:scale-[1.01]">
                         <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${isInstallment ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}><Repeat size={16}/></div>
                             <div>
                                 <p className="font-bold text-xs">Parcelado?</p>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isInstallment ? `${totalInstallments}x de ${(parseFloat(amount || '0')/totalInstallments).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}` : 'À vista'}</p>
                             </div>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isInstallment} onChange={() => setIsInstallment(!isInstallment)} />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                         </label>
                     </div>
                     {isInstallment && (
                         <div className="space-y-1.5 animate-in slide-in-from-top-2">
                             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Número de Parcelas</p>
                             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
                                <input 
                                    type="range" 
                                    min="2" max="24" 
                                    value={totalInstallments} 
                                    onChange={e => setTotalInstallments(Number(e.target.value))}
                                    className="flex-1 accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="font-black text-lg w-8 text-center">{totalInstallments}x</span>
                             </div>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="space-y-4 animate-in slide-in-from-top-4">
                     <div className="space-y-1.5">
                         <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">{isIncome ? 'Conta de Destino' : 'Conta de Origem'}</p>
                         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                             {bankAccounts.map(acc => (
                                 <button 
                                    key={acc.id} 
                                    onClick={() => setBankAccountId(acc.id)}
                                    className={`shrink-0 px-4 py-3 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${bankAccountId === acc.id ? 'border-primary bg-primary/5 text-primary scale-105' : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                                 >
                                     {acc.bankName}
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>
             )}
         </div>

         <div className="space-y-4">
            <div className="relative group">
                <span className={`absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>R$</span>
                <input 
                    type="number" 
                    placeholder="0,00" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)}
                    className={`w-full pl-14 pr-6 py-6 rounded-[2rem] text-3xl font-black outline-none border-2 transition-all group-hover:scale-[1.02] focus:scale-[1.02] ${isIncome ? 'bg-emerald-500/5 border-emerald-500/20 focus:border-emerald-500 text-emerald-600' : 'bg-rose-500/5 border-rose-500/20 focus:border-rose-500 text-rose-600'}`}
                />
            </div>
            <input 
                placeholder="Descrição (Opcional)" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-primary/50 transition-all focus:scale-[1.01]"
            />
         </div>

         <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</p>
                 <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none text-xs transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                    />
                 </div>
             </div>
             <div className="space-y-1.5">
                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</p>
                 <button 
                    onClick={() => setIsSelectingCategory(true)}
                    className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
                 >
                    <div className="flex items-center gap-2 truncate">
                       <Tag size={16} className="text-slate-400"/>
                       <span className="truncate">{category || 'Selecionar...'}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-primary transition-colors"/>
                 </button>
             </div>
         </div>

         {!isIncome && paymentMethod === 'ACCOUNT' && (
            <div className="space-y-1.5">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de Barras (Opcional)</p>
                <div className="relative">
                   <ScanBarcode size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                   <input 
                       placeholder="Digite ou cole o código" 
                       value={barcode} 
                       onChange={e => setBarcode(e.target.value)}
                       className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none text-xs transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                   />
                </div>
            </div>
         )}

         <div className="space-y-1.5">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
            <Paperclip size={10}/> {isIncome ? 'Comprovante' : (paymentMethod === 'CARD' ? 'Recibo Compra' : 'Anexo de Cupom ou Conta')}
          </p>
          {billAttachment ? (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between transition-all hover:scale-[1.02]">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                     {billAttachment.includes('pdf') ? <FileText size={16} className="text-primary"/> : <img src={billAttachment} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openFile(billAttachment!)} className="p-1.5 bg-primary/10 text-primary rounded-md hover:scale-110 transition-transform"><Eye size={10}/></button>
                    <button onClick={() => shareContent('Arquivo', 'Anexo', billAttachment, billFileName || 'doc.pdf')} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded-md hover:scale-110 transition-transform"><Share2 size={10}/></button>
                  </div>
               </div>
               <button onClick={() => { setBillAttachment(undefined); setBillFileName(undefined); }} className="p-1.5 text-rose-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActiveCameraType('BILL')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-primary transition-all active:scale-95">
                <Camera size={16} className="text-slate-400 group-hover:text-primary"/><span className="text-[7px] font-black uppercase text-slate-400">Foto</span>
              </button>
              <button onClick={() => billFileInputRef.current?.click()} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-primary transition-all active:scale-95">
                <Upload size={16} className="text-slate-400 group-hover:text-primary"/><span className="text-[7px] font-black uppercase text-slate-400">PDF</span>
              </button>
            </div>
          )}
          <input ref={billFileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'BILL')} />
       </div>

       {!isIncome && paymentMethod === 'ACCOUNT' && (
         <div className="space-y-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-800">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Receipt size={10}/> Comprovante de Pagamento</p>
            {receiptAttachment ? (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between transition-all hover:scale-[1.02]">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                       {receiptAttachment.includes('pdf') ? <FileText size={16} className="text-emerald-500"/> : <img src={receiptAttachment} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => openFile(receiptAttachment!)} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md hover:scale-110 transition-transform"><Eye size={10}/></button>
                       <button onClick={() => shareContent('Recibo', 'Comprovante', receiptAttachment, receiptFileName || 'comprovante.pdf')} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded-md hover:scale-110 transition-transform"><Share2 size={10}/></button>
                    </div>
                 </div>
                 <button onClick={() => { setReceiptAttachment(undefined); setReceiptFileName(undefined); }} className="p-1.5 text-rose-500 hover:scale-110 transition-transform"><Trash2 size={14}/></button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveCameraType('RECEIPT')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-emerald-500 transition-all active:scale-95">
                  <Camera size={16} className="text-slate-400 group-hover:text-emerald-500"/><span className="text-[7px] font-black uppercase text-slate-400">Foto</span>
                </button>
                <button onClick={() => receiptFileInputRef.current?.click()} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-emerald-500 transition-all active:scale-95">
                  <Upload size={16} className="text-slate-400 group-hover:text-emerald-500"/><span className="text-[7px] font-black uppercase text-slate-400">PDF</span>
                </button>
              </div>
            )}
            <input ref={receiptFileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'RECEIPT')} />
         </div>
       )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pt-10 flex gap-4">
          <button 
            onClick={() => handleSave(false)} 
            className="flex-1 py-5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
          >
             <CalendarClock size={20}/> Agendar
          </button>
          
          <button 
            onClick={() => handleSave(true)} 
            className={`flex-1 py-5 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 ${isIncome ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-primary shadow-primary/20'}`}
          >
             <Check size={20}/> {isIncome ? 'Recebido' : 'Confirmar'}
          </button>
      </div>

      {activeCameraType && (
          <CameraModal 
            onCapture={handleCameraCapture} 
            onClose={() => setActiveCameraType(null)} 
          />
      )}
    </div>
  );
};
