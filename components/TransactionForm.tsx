
import React, { useState, useRef, useMemo } from 'react';
import { TransactionType, Transaction, CreditCard, BankAccount } from '../types';
import { 
  X, Camera, Upload, Barcode, CheckCircle, Clock, 
  ChevronDown, FileText, Trash2, Receipt, Plus, 
  Tag, CreditCard as CardIcon, Building2, Calculator,
  ChevronRight, Calendar, Info, Check, Sparkles, Paperclip,
  Share2, Eye, Copy, Landmark, Wallet, Image as ImageIcon,
  ArrowLeft, Search
} from 'lucide-react';
import { CameraModal } from './CameraModal';
import { generateId } from '../utils/helpers';

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
  onAddCategory: (cat: string) => void;
  onRemoveCategory: (cat: string) => void;
}

export const TransactionForm: React.FC<Props> = ({ 
  initialData, preDefinedDate, fixedType, onAdd, onClose, creditCards, bankAccounts, categories, allTransactions, onAddCategory, onRemoveCategory 
}) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [date, setDate] = useState(initialData?.date || preDefinedDate || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>(fixedType || initialData?.type || TransactionType.INCOME);
  const [category, setCategory] = useState(initialData?.category || categories[0]);
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  
  const [billAttachment, setBillAttachment] = useState<string | undefined>(initialData?.billAttachment);
  const [billFileName, setBillFileName] = useState<string | undefined>(initialData?.billFileName);
  const [receiptAttachment, setReceiptAttachment] = useState<string | undefined>(initialData?.receiptAttachment);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(initialData?.receiptFileName);

  const [view, setView] = useState<'FORM' | 'CATEGORIES' | 'INSTALLMENTS'>('FORM');
  const [activeCameraType, setActiveCameraType] = useState<'BILL' | 'RECEIPT' | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'ACCOUNT' | 'CARD'>(initialData?.cardId ? 'CARD' : 'ACCOUNT');
  const [selectedCardId, setSelectedCardId] = useState(initialData?.cardId || creditCards[0]?.id || '');
  const [selectedAccountId, setSelectedAccountId] = useState(initialData?.bankAccountId || bankAccounts.find(a=>a.isDefault)?.id || bankAccounts[0]?.id || '');
  const [installmentsCount, setInstallmentsCount] = useState(initialData?.totalInstallments || 1);
  const [newCatName, setNewCatName] = useState('');

  const billFileInputRef = useRef<HTMLInputElement>(null);
  const receiptFileInputRef = useRef<HTMLInputElement>(null);

  const sortedCategories = useMemo(() => {
    const usage: Record<string, number> = {};
    allTransactions.forEach(t => { usage[t.category] = (usage[t.category] || 0) + 1; });
    return [...categories].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));
  }, [categories, allTransactions]);

  const currentAmountNum = parseFloat(amount) || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'BILL' | 'RECEIPT') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'BILL') {
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

  const handleCameraCapture = (base64: string) => {
    if (activeCameraType === 'BILL') {
      setBillAttachment(base64);
      setBillFileName(`Doc_${Date.now()}.jpg`);
    } else if (activeCameraType === 'RECEIPT') {
      setReceiptAttachment(base64);
      setReceiptFileName(`Comprovante_${Date.now()}.jpg`);
    }
    setActiveCameraType(null);
  };

  const shareContent = async (title: string, text: string, dataUrl?: string, fileName?: string) => {
    if (!navigator.share) return alert("Compartilhamento não suportado.");
    try {
      const shareData: ShareData = { title, text };
      if (dataUrl && fileName) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })) shareData.files = [file];
      }
      await navigator.share(shareData);
    } catch (err) { console.error(err); }
  };

  const openFile = (dataUrl: string) => {
    if (dataUrl.includes('application/pdf')) {
      const base64Parts = dataUrl.split(',');
      const byteCharacters = atob(base64Parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else setPreviewImage(dataUrl);
  };

  const submitWithStatus = (isPaidStatus: boolean) => {
    if (!description || !amount) return;
    const numAmount = parseFloat(amount) || 0;
    const isCard = paymentMethod === 'CARD' && type !== TransactionType.INCOME;
    const transactionsToCreate: Transaction[] = [];

    if (isCard) {
      const card = creditCards.find(c => c.id === selectedCardId);
      if (!card) return;
      const parcelValue = parseFloat((numAmount / installmentsCount).toFixed(2));
      
      // Quebrar a data inicial para manipulação
      const [y, m, d] = date.split('-').map(Number);

      for (let i = 0; i < installmentsCount; i++) {
        // Incrementa o mês corretamente
        const newDateObj = new Date(y, m - 1 + i, d);
        const installmentDate = newDateObj.toLocaleDateString('en-CA');

        transactionsToCreate.push({
          id: generateId(),
          description: installmentsCount > 1 ? `${description} (${i + 1}/${installmentsCount})` : description,
          amount: parcelValue,
          date: installmentDate,
          type: TransactionType.CREDIT_CARD,
          category,
          barcode: undefined,
          billAttachment: undefined,
          billFileName: undefined,
          receiptAttachment: i === 0 ? receiptAttachment : undefined,
          receiptFileName: i === 0 ? receiptFileName : undefined,
          isInstallment: installmentsCount > 1,
          totalInstallments: installmentsCount,
          currentInstallment: i + 1,
          isPaid: false,
          cardId: selectedCardId
        });
      }
    } else {
      transactionsToCreate.push({
        id: initialData?.id || generateId(),
        description,
        amount: numAmount,
        date,
        type: type,
        category,
        barcode: type === TransactionType.INCOME ? undefined : barcode,
        billAttachment,
        billFileName,
        receiptAttachment,
        receiptFileName,
        isInstallment: false,
        isPaid: isPaidStatus,
        bankAccountId: selectedAccountId,
      });
    }
    onAdd(transactionsToCreate);
    onClose();
  };

  const isIncome = type === TransactionType.INCOME;

  if (view === 'CATEGORIES') {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
           <button onClick={() => setView('FORM')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><ArrowLeft size={18}/></button>
           <h3 className="text-sm font-black uppercase tracking-tight">Categorias</h3>
           <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {sortedCategories.map((cat, idx) => (
            <div key={idx} className={`w-full flex items-center gap-2 p-1 rounded-xl transition-all ${category === cat ? 'bg-primary/10 border border-primary/20' : 'bg-slate-50 dark:bg-slate-800 border border-transparent'}`}>
              <button onClick={() => { setCategory(cat); setView('FORM'); }} className="flex-1 flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <Tag size={14} className={category === cat ? 'text-primary' : 'text-slate-400'}/>
                  <span className={`font-black text-[9px] uppercase tracking-widest ${category === cat ? 'text-primary' : 'text-slate-500'}`}>{cat}</span>
                </div>
                {category === cat && <CheckCircle size={14} className="text-primary"/>}
              </button>
              <button onClick={() => onRemoveCategory(cat)} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={14}/></button>
            </div>
          ))}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Categoria</p>
            <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
               <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nome..." className="flex-1 bg-transparent px-3 py-1.5 font-bold text-xs outline-none" />
               <button onClick={() => { if(newCatName) { onAddCategory(newCatName); setCategory(newCatName); setNewCatName(''); } }} className="p-2 bg-primary text-white rounded-lg"><Plus size={14}/></button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'INSTALLMENTS') {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
           <button onClick={() => setView('FORM')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><ArrowLeft size={18}/></button>
           <h3 className="text-sm font-black uppercase tracking-tight">Opções de Parcelamento</h3>
           <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(p => {
              const installmentValue = currentAmountNum / p;
              return (
                <button 
                  key={p} 
                  onClick={() => { setInstallmentsCount(p); setView('FORM'); }} 
                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${installmentsCount === p ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}
                >
                  <span className="text-sm font-black">{p}x</span>
                  <span className={`text-[8px] font-bold ${installmentsCount === p ? 'text-white/70' : 'text-slate-400'}`}>
                    {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Nº Personalizado</p>
             <div className="flex gap-2">
                <input 
                  type="number" 
                  value={installmentsCount} 
                  onChange={e => setInstallmentsCount(parseInt(e.target.value) || 1)}
                  className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xl font-black text-center outline-none border-2 border-transparent focus:border-blue-500"
                />
                <button onClick={() => setView('FORM')} className="px-6 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">OK</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-slate-50 dark:border-slate-800">
        <div>
           <h3 className={`text-base font-black uppercase tracking-tight leading-none mb-0.5 ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
             {isIncome ? 'Nova Entrada' : 'Nova Saída'}
           </h3>
           <p className="text-[7px] font-black opacity-30 uppercase tracking-[0.4em]">Financeiro Smart</p>
        </div>
        <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={16}/></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 pb-28">
        
        {/* VALOR DESTAQUE */}
        <section className={`p-4 rounded-2xl shadow-inner text-center relative overflow-hidden transition-colors ${isIncome ? 'bg-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
           <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">{isIncome ? 'Recebimento' : 'Valor Total'}</p>
           <div className="flex items-center justify-center gap-1.5">
              <span className={`text-lg font-black ${isIncome ? 'text-emerald-500' : 'text-slate-400'}`}>R$</span>
              <input 
                type="number" step="0.01" placeholder="0,00" autoFocus
                value={amount} onChange={e => setAmount(e.target.value)} 
                className={`w-full max-w-[140px] bg-transparent font-black text-3xl tracking-tighter outline-none text-center ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}
              />
           </div>
           {!fixedType && (
              <div className="flex gap-1.5 p-1 bg-white dark:bg-slate-950/50 rounded-lg mt-3 w-fit mx-auto border border-slate-100 dark:border-slate-800 shadow-sm">
                {[TransactionType.INCOME, TransactionType.EXPENSE].map(opt => (
                  <button key={opt} type="button" onClick={() => setType(opt)} className={`px-4 py-1.5 rounded-md text-[7px] font-black uppercase tracking-widest transition-all ${type === opt ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-400'}`}>{opt === 'INCOME' ? 'Entrada' : 'Saída'}</button>
                ))}
              </div>
           )}
        </section>

        {/* FORMA DE PAGAMENTO */}
        {!isIncome && (
           <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             <button onClick={() => setPaymentMethod('ACCOUNT')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'ACCOUNT' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><Building2 size={12}/> Conta</button>
             <button onClick={() => setPaymentMethod('CARD')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'CARD' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}><CardIcon size={12}/> Cartão</button>
           </div>
        )}

        {/* SELEÇÃO CONTA/CARTÃO */}
        <section className="space-y-2.5">
           <div className="relative">
              <select 
                value={paymentMethod === 'CARD' && !isIncome ? selectedCardId : selectedAccountId} 
                onChange={e => paymentMethod === 'CARD' && !isIncome ? setSelectedCardId(e.target.value) : setSelectedAccountId(e.target.value)} 
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-[9px] uppercase outline-none appearance-none border-2 border-transparent focus:border-primary pr-10"
              >
                {paymentMethod === 'CARD' && !isIncome ? creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"/>
           </div>

           {paymentMethod === 'CARD' && !isIncome && (
              <button onClick={() => setView('INSTALLMENTS')} className="w-full p-3.5 bg-blue-500/5 dark:bg-slate-800 rounded-xl border border-blue-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-md"><Calculator size={12}/></div>
                  <span className="font-black text-[9px] uppercase tracking-widest">{installmentsCount}x de {(currentAmountNum/installmentsCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <ChevronRight size={12} className="opacity-30"/>
              </button>
           )}

           <input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none border-2 border-transparent focus:border-primary" />

           <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setView('CATEGORIES')} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between group overflow-hidden">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-primary/10 text-primary rounded-md"><Tag size={12}/></div>
                   <span className="font-black text-[8px] uppercase tracking-widest truncate max-w-[60px]">{category}</span>
                </div>
                <ChevronDown size={12} className="opacity-20"/>
              </button>
              <div className="relative flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3">
                 <Calendar size={12} className="text-slate-400 mr-2"/>
                 <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 bg-transparent font-black text-[8px] uppercase outline-none py-3 appearance-none" />
              </div>
           </div>
        </section>

        {/* DOCUMENTAÇÃO */}
        <section className="space-y-3">
           {!isIncome && paymentMethod === 'ACCOUNT' && (
             <div className="space-y-1.5">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Barcode size={10}/> Boleto</p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-2">
                   <textarea value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Cole o código aqui..." className="w-full p-3 bg-white dark:bg-slate-900 rounded-lg font-mono text-[8px] border-2 border-transparent focus:border-primary outline-none shadow-sm min-h-[40px] resize-none" />
                   {barcode.trim().length > 0 && (
                      <button onClick={() => shareContent('Boleto', `Código: ${barcode}`)} className="w-full py-2 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center gap-2 font-black text-[7px] uppercase tracking-widest text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700"><Share2 size={10}/> Compartilhar</button>
                   )}
                </div>
             </div>
           )}

           <div className="space-y-1.5">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Paperclip size={10}/> {isIncome ? 'Comprovante' : (paymentMethod === 'CARD' ? 'Recibo Compra' : 'Anexo Doc/Recibo')}
              </p>
              {billAttachment ? (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                         {billAttachment.includes('pdf') ? <FileText size={16} className="text-primary"/> : <img src={billAttachment} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openFile(billAttachment)} className="p-1.5 bg-primary/10 text-primary rounded-md"><Eye size={10}/></button>
                        <button onClick={() => shareContent('Arquivo', 'Anexo', billAttachment, billFileName || 'doc.pdf')} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded-md"><Share2 size={10}/></button>
                      </div>
                   </div>
                   <button onClick={() => { setBillAttachment(undefined); setBillFileName(undefined); }} className="p-1.5 text-rose-500"><Trash2 size={14}/></button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setActiveCameraType('BILL')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-primary transition-all">
                    <Camera size={16} className="text-slate-400 group-hover:text-primary"/><span className="text-[7px] font-black uppercase text-slate-400">Foto</span>
                  </button>
                  <button onClick={() => billFileInputRef.current?.click()} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-primary transition-all">
                    <Upload size={16} className="text-slate-400 group-hover:text-primary"/><span className="text-[7px] font-black uppercase text-slate-400">PDF</span>
                  </button>
                </div>
              )}
              <input ref={billFileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'BILL')} />
           </div>

           {!isIncome && paymentMethod === 'ACCOUNT' && (
             <div className="space-y-1.5 pt-1.5 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Receipt size={10}/> Comprovante</p>
                {receiptAttachment ? (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                           {receiptAttachment.includes('pdf') ? <FileText size={16} className="text-emerald-500"/> : <img src={receiptAttachment} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex gap-1">
                           <button onClick={() => openFile(receiptAttachment)} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-md"><Eye size={10}/></button>
                           <button onClick={() => shareContent('Recibo', 'Comprovante', receiptAttachment, receiptFileName || 'comprovante.pdf')} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded-md"><Share2 size={10}/></button>
                        </div>
                     </div>
                     <button onClick={() => { setReceiptAttachment(undefined); setReceiptFileName(undefined); }} className="p-1.5 text-rose-500"><Trash2 size={14}/></button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveCameraType('RECEIPT')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-emerald-500 transition-all">
                      <Camera size={16} className="text-slate-400 group-hover:text-emerald-500"/><span className="text-[7px] font-black uppercase text-slate-400">Foto</span>
                    </button>
                    <button onClick={() => receiptFileInputRef.current?.click()} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-emerald-500 transition-all">
                      <Upload size={16} className="text-slate-400 group-hover:text-emerald-500"/><span className="text-[7px] font-black uppercase text-slate-400">PDF</span>
                    </button>
                  </div>
                )}
                <input ref={receiptFileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'RECEIPT')} />
             </div>
           )}
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-white dark:from-slate-900 via-white/95 to-transparent z-40">
        <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
          <button onClick={() => submitWithStatus(false)} className={`py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 ${paymentMethod === 'CARD' && !isIncome ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 col-span-2' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'}`}>
            {isIncome ? 'Agendar' : (paymentMethod === 'CARD' ? 'Confirmar Compra' : 'Agendar')}
          </button>
          {!(paymentMethod === 'CARD' && !isIncome) && (
            <button onClick={() => submitWithStatus(true)} className={`py-3.5 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-md active:scale-95 transition-all ${isIncome ? 'bg-emerald-500' : 'bg-primary'}`}>
              Confirmar
            </button>
          )}
        </div>
      </div>

      {activeCameraType && <CameraModal onCapture={handleCameraCapture} onClose={() => setActiveCameraType(null)} />}
      
      {previewImage && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setPreviewImage(null)}>
           <button className="absolute top-6 right-6 p-4 bg-white/10 text-white rounded-full"><X size={24}/></button>
           <img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" alt="Preview"/>
        </div>
      )}
    </div>
  );
};
