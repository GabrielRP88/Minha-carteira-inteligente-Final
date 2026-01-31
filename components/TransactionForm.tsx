import React, { useState, useRef, useMemo } from 'react';
import { TransactionType, Transaction, CreditCard, BankAccount } from '../types';
import { 
  X, Camera, Upload, Barcode, CheckCircle, Clock, 
  ChevronDown, FileText, Trash2, Receipt, Plus, 
  Tag, CreditCard as CardIcon, Building2, Calculator,
  ChevronRight, Calendar, Info, Check, Sparkles, Paperclip,
  Share2, Eye, Copy, Landmark, Wallet, Image as ImageIcon,
  ArrowLeft, Search, FolderClosed
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
  
  // Anexos
  const [billAttachment, setBillAttachment] = useState<string | undefined>(initialData?.billAttachment);
  const [billFileName, setBillFileName] = useState<string | undefined>(initialData?.billFileName);
  const [receiptAttachment, setReceiptAttachment] = useState<string | undefined>(initialData?.receiptAttachment);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>(initialData?.receiptFileName);

  const [view, setView] = useState<'FORM' | 'CATEGORIES' | 'INSTALLMENTS'>('FORM');
  const [activeCameraTarget, setActiveCameraTarget] = useState<'BILL' | 'RECEIPT' | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'ACCOUNT' | 'CARD'>(initialData?.cardId ? 'CARD' : 'ACCOUNT');
  const [selectedCardId, setSelectedCardId] = useState(initialData?.cardId || creditCards[0]?.id || '');
  const [selectedAccountId, setSelectedAccountId] = useState(initialData?.bankAccountId || bankAccounts.find(a=>a.isDefault)?.id || bankAccounts[0]?.id || '');
  const [installmentsCount, setInstallmentsCount] = useState(initialData?.totalInstallments || 1);
  const [newCatName, setNewCatName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFileInputTarget = useRef<'BILL' | 'RECEIPT' | null>(null);

  const isIncome = type === TransactionType.INCOME;

  const sortedCategories = useMemo(() => {
    const usage: Record<string, number> = {};
    allTransactions.forEach(t => { usage[t.category] = (usage[t.category] || 0) + 1; });
    return [...categories].sort((a, b) => (usage[b] || 0) - (usage[a] || 0));
  }, [categories, allTransactions]);

  const currentAmountNum = parseFloat(amount) || 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = currentFileInputTarget.current;
    const file = e.target.files?.[0];
    if (file && target) {
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

  const triggerFileInput = (target: 'BILL' | 'RECEIPT') => {
    currentFileInputTarget.current = target;
    fileInputRef.current?.click();
  };

  const handleCameraCapture = (base64: string) => {
    if (activeCameraTarget === 'BILL') {
      setBillAttachment(base64);
      setBillFileName(`Conta_${Date.now()}.jpg`);
    } else if (activeCameraTarget === 'RECEIPT') {
      setReceiptAttachment(base64);
      setReceiptFileName(`Comprovante_${Date.now()}.jpg`);
    }
    setActiveCameraTarget(null);
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
    } else setPreviewImage(dataUrl);
  };

  const submitWithStatus = (isPaidStatus: boolean) => {
    if (!description || !amount) return;
    const numAmount = parseFloat(amount) || 0;
    const isCard = paymentMethod === 'CARD' && !isIncome;
    const transactionsToCreate: Transaction[] = [];

    const baseData = {
      description,
      amount: numAmount,
      date,
      category,
      barcode: isIncome ? undefined : barcode,
      billAttachment: isIncome ? undefined : billAttachment,
      billFileName: isIncome ? undefined : billFileName,
      receiptAttachment: isIncome ? billAttachment : receiptAttachment, // No Income, o anexo principal é tratado como recibo
      receiptFileName: isIncome ? billFileName : receiptFileName,
    };

    if (isCard) {
      const parcelValue = parseFloat((numAmount / installmentsCount).toFixed(2));
      const [y, m, d] = date.split('-').map(Number);

      for (let i = 0; i < installmentsCount; i++) {
        const newDateObj = new Date(y, m - 1 + i, d);
        transactionsToCreate.push({
          ...baseData,
          id: generateId(),
          description: installmentsCount > 1 ? `${description} (${i + 1}/${installmentsCount})` : description,
          amount: parcelValue,
          date: newDateObj.toLocaleDateString('en-CA'),
          type: TransactionType.CREDIT_CARD,
          isInstallment: installmentsCount > 1,
          totalInstallments: installmentsCount,
          currentInstallment: i + 1,
          isPaid: false,
          cardId: selectedCardId,
          // Anexos apenas na primeira parcela para não duplicar espaço
          billAttachment: i === 0 ? baseData.billAttachment : undefined,
          receiptAttachment: i === 0 ? baseData.receiptAttachment : undefined,
        });
      }
    } else {
      transactionsToCreate.push({
        ...baseData,
        id: initialData?.id || generateId(),
        type: type,
        isInstallment: false,
        isPaid: isPaidStatus,
        bankAccountId: selectedAccountId,
      });
    }
    onAdd(transactionsToCreate);
    onClose();
  };

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
        </div>
      </div>
    );
  }

  if (view === 'INSTALLMENTS') {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
           <button onClick={() => setView('FORM')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><ArrowLeft size={18}/></button>
           <h3 className="text-sm font-black uppercase tracking-tight">Parcelas</h3>
           <div className="w-8"></div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(p => (
              <button key={p} onClick={() => { setInstallmentsCount(p); setView('FORM'); }} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${installmentsCount === p ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400'}`}>
                <span className="text-sm font-black">{p}x</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800">
        <h3 className={`text-base font-black uppercase tracking-tight ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
          {isIncome ? 'Nova Entrada' : 'Nova Saída'}
        </h3>
        <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={16}/></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5 pb-28">
        <section className={`p-4 rounded-2xl text-center ${isIncome ? 'bg-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
           <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1">Valor</p>
           <div className="flex items-center justify-center gap-1.5">
              <span className={`text-lg font-black ${isIncome ? 'text-emerald-500' : 'text-slate-400'}`}>R$</span>
              <input type="number" step="0.01" placeholder="0,00" autoFocus value={amount} onChange={e => setAmount(e.target.value)} className={`w-full max-w-[140px] bg-transparent font-black text-3xl outline-none text-center ${isIncome ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`} />
           </div>
        </section>

        {!isIncome && (
           <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             <button onClick={() => setPaymentMethod('ACCOUNT')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[8px] font-black uppercase transition-all ${paymentMethod === 'ACCOUNT' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}><Building2 size={12}/> Conta</button>
             <button onClick={() => setPaymentMethod('CARD')} className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-[8px] font-black uppercase transition-all ${paymentMethod === 'CARD' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}><CardIcon size={12}/> Cartão</button>
           </div>
        )}

        <section className="space-y-3">
           <select value={paymentMethod === 'CARD' && !isIncome ? selectedCardId : selectedAccountId} onChange={e => paymentMethod === 'CARD' && !isIncome ? setSelectedCardId(e.target.value) : setSelectedAccountId(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-[9px] uppercase outline-none appearance-none border-2 border-transparent focus:border-primary">
             {paymentMethod === 'CARD' && !isIncome ? creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName}</option>)}
           </select>

           {paymentMethod === 'CARD' && !isIncome && (
              <button onClick={() => setView('INSTALLMENTS')} className="w-full p-3.5 bg-blue-500/5 dark:bg-slate-800 rounded-xl border border-blue-500/10 flex items-center justify-between">
                <span className="font-black text-[9px] uppercase tracking-widest">{installmentsCount}x parcelas</span>
                <ChevronRight size={12} className="opacity-30"/>
              </button>
           )}

           <input placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs outline-none focus:border-primary border-2 border-transparent" />

           <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setView('CATEGORIES')} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                <span className="font-black text-[8px] uppercase truncate">{category}</span>
                <ChevronDown size={12} className="opacity-20"/>
              </button>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-black text-[8px] uppercase outline-none" />
           </div>
        </section>

        {/* DOCUMENTAÇÃO E ANEXOS */}
        <section className="space-y-4 pt-2">
           {!isIncome && (
             <div className="space-y-2">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Barcode size={10}/> Código de Barras (Opcional)</p>
                <textarea value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Cole o código do boleto..." className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-[8px] border-2 border-transparent focus:border-primary outline-none min-h-[40px] resize-none" />
             </div>
           )}

           {/* ANEXO 1: CONTA/FATURA (DESTINO: PASTA CONTAS) */}
           <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Paperclip size={10}/> {isIncome ? 'Anexo Principal' : 'Foto da Conta / Fatura'}</p>
                <div className="flex items-center gap-1 opacity-40"><FolderClosed size={8}/><span className="text-[6px] font-black uppercase">Pasta: Contas</span></div>
              </div>
              {billAttachment ? (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <button onClick={() => openFile(billAttachment)} className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                        {billAttachment.includes('pdf') ? <FileText size={16} className="text-primary"/> : <img src={billAttachment} className="w-full h-full object-cover"/>}
                      </button>
                      <span className="text-[8px] font-black uppercase text-slate-500 truncate w-32">{billFileName}</span>
                   </div>
                   <button onClick={() => { setBillAttachment(undefined); setBillFileName(undefined); }} className="p-1.5 text-rose-500"><Trash2 size={14}/></button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setActiveCameraTarget('BILL')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-primary transition-all">
                    <Camera size={16} className="text-slate-400 group-hover:text-primary"/><span className="text-[7px] font-black uppercase text-slate-400">Câmera</span>
                  </button>
                  <button onClick={() => triggerFileInput('BILL')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-primary transition-all">
                    <Upload size={16} className="text-slate-400 group-hover:text-primary"/><span className="text-[7px] font-black uppercase text-slate-400">PDF / Galeria</span>
                  </button>
                </div>
              )}
           </div>

           {/* ANEXO 2: COMPROVANTE (DESTINO: PASTA RECIBOS) - APENAS PARA SAÍDAS */}
           {!isIncome && (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Receipt size={10}/> Comprovante de Pagamento</p>
                  <div className="flex items-center gap-1 opacity-40"><FolderClosed size={8}/><span className="text-[6px] font-black uppercase">Pasta: Recibos</span></div>
                </div>
                {receiptAttachment ? (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <button onClick={() => openFile(receiptAttachment)} className="w-8 h-8 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                          {receiptAttachment.includes('pdf') ? <FileText size={16} className="text-emerald-500"/> : <img src={receiptAttachment} className="w-full h-full object-cover"/>}
                        </button>
                        <span className="text-[8px] font-black uppercase text-slate-500 truncate w-32">{receiptFileName}</span>
                     </div>
                     <button onClick={() => { setReceiptAttachment(undefined); setReceiptFileName(undefined); }} className="p-1.5 text-rose-500"><Trash2 size={14}/></button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveCameraTarget('RECEIPT')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-emerald-500 transition-all">
                      <Camera size={16} className="text-slate-400 group-hover:text-emerald-500"/><span className="text-[7px] font-black uppercase text-slate-400">Câmera</span>
                    </button>
                    <button onClick={() => triggerFileInput('RECEIPT')} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 group hover:border-emerald-500 transition-all">
                      <Upload size={16} className="text-slate-400 group-hover:text-emerald-500"/><span className="text-[7px] font-black uppercase text-slate-400">PDF / Galeria</span>
                    </button>
                  </div>
                )}
             </div>
           )}
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-white dark:from-slate-900 via-white/95 to-transparent z-40">
        <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto">
          <button onClick={() => submitWithStatus(false)} className="py-3.5 bg-white dark:bg-slate-800 text-slate-500 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-700">Agendar</button>
          <button onClick={() => submitWithStatus(true)} className={`py-3.5 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-md ${isIncome ? 'bg-emerald-500' : 'bg-primary'}`}>Confirmar</button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
      {activeCameraTarget && <CameraModal onCapture={handleCameraCapture} onClose={() => setActiveCameraTarget(null)} />}
      {previewImage && <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"/></div>}
    </div>
  );
};