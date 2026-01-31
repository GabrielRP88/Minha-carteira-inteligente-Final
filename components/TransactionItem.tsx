import React, { useState, useRef, useMemo } from 'react';
import { Transaction, TransactionType, BankAccount } from '../types';
import { 
  Download, Camera, Trash2, X, Receipt, Clock, Upload, CheckCircle, 
  Paperclip, ChevronRight, Pencil, Share2, Eye, FileText,
  Barcode, Copy, Check, AlertCircle, CalendarClock, Landmark, TrendingUp, TrendingDown, CreditCard,
  ExternalLink, ArrowRight, FolderClosed
} from 'lucide-react';
import { CameraModal } from './CameraModal';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  hideValues?: boolean;
  todayStr?: string;
  bankAccounts?: BankAccount[];
  showAccountInfo?: boolean;
}

export const TransactionItem: React.FC<Props> = ({ 
  transaction, onDelete, onToggleStatus, onUpdate, onEdit, hideValues, todayStr, bankAccounts, showAccountInfo 
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [paymentFlow, setPaymentFlow] = useState<'DETAILS' | 'PAY_OPTIONS'>('DETAILS');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!transaction || !transaction.id) return null;

  const isNegative = transaction.type !== TransactionType.INCOME;
  const isOverdue = !transaction.isPaid && todayStr && transaction.date && transaction.date < todayStr;
  const isToday = !transaction.isPaid && todayStr && transaction.date === todayStr;
  
  const formattedAmount = hideValues ? 'R$ •••••' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount);

  const handleCopyBarcode = () => {
    if (transaction.barcode) {
      navigator.clipboard.writeText(transaction.barcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    } else setPreviewImage(dataUrl);
  };

  const handleConfirmAction = (attachment?: string, fileName?: string) => {
    onUpdate({
      ...transaction,
      isPaid: true,
      receiptAttachment: attachment || transaction.receiptAttachment,
      receiptFileName: fileName || transaction.receiptFileName
    });
    setIsDetailModalOpen(false);
    setPaymentFlow('DETAILS');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleConfirmAction(reader.result as string, file.name);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`border-b border-slate-50 dark:border-slate-800 last:border-0 ${isOverdue ? 'bg-rose-500/[0.04]' : isToday ? 'bg-amber-500/[0.02]' : ''}`}>
      <div onClick={() => { setPaymentFlow('DETAILS'); setIsDetailModalOpen(true); }} className="flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all cursor-pointer group">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-all ${
            transaction.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 
            isOverdue ? 'bg-rose-500 text-white' : 
            isToday ? 'bg-amber-500 text-white' :
            transaction.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
          }`}>
            {transaction.isPaid ? <CheckCircle size={20}/> : <Clock size={20}/>}
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{transaction.category}</span>
            <span className="font-bold text-sm text-slate-700 dark:text-white">{transaction.description}</span>
            <span className="text-[8px] font-bold text-slate-300 uppercase">{new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className={`font-black text-xs ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>{isNegative ? '-' : '+'} {formattedAmount}</p>
          <ChevronRight size={14} className="text-slate-300"/>
        </div>
      </div>

      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black uppercase tracking-tight">Detalhes</h4>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="p-6 rounded-[2rem] text-center border mb-6 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${transaction.isPaid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{transaction.isPaid ? 'Liquidado' : 'Pendente'}</span>
                <h5 className="text-xl font-black mt-2 text-slate-800 dark:text-white leading-tight">{transaction.description}</h5>
                <p className={`text-3xl font-black mt-1 ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>{formattedAmount}</p>
              </div>

              {paymentFlow === 'DETAILS' ? (
                <div className="space-y-6">
                  {/* CÓDIGO DE BARRAS */}
                  {isNegative && transaction.barcode && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Barcode size={10}/> Boleto</p>
                        <p className="font-mono text-[8px] break-all text-center mb-4 text-slate-600 dark:text-slate-300">{transaction.barcode}</p>
                        <div className="grid grid-cols-2 gap-2">
                           <button onClick={handleCopyBarcode} className={`py-3 rounded-xl font-black text-[8px] uppercase flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 text-primary border border-primary/10 shadow-sm'}`}>
                             {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Copiado' : 'Copiar'}
                           </button>
                           <button onClick={() => shareContent('Boleto', transaction.barcode || '')} className="py-3 bg-white dark:bg-slate-700 text-slate-500 rounded-xl font-black text-[8px] uppercase border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2"><Share2 size={12}/> Enviar</button>
                        </div>
                    </div>
                  )}

                  {/* ANEXOS MÚLTIPLOS */}
                  <div className="space-y-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Paperclip size={12}/> Documentos Anexados</p>
                    
                    {/* ANEXO DA CONTA */}
                    {transaction.billAttachment && (
                       <div className="p-4 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <button onClick={() => openFile(transaction.billAttachment!)} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                                {transaction.billAttachment.includes('pdf') ? <FileText size={20} className="text-primary"/> : <img src={transaction.billAttachment} className="w-full h-full object-cover"/>}
                             </button>
                             <div>
                                <p className="text-[8px] font-black uppercase text-slate-500 truncate w-32">{transaction.billFileName || 'Conta'}</p>
                                <div className="flex items-center gap-1 opacity-40"><FolderClosed size={8}/><span className="text-[6px] font-black uppercase">Pasta: Contas</span></div>
                             </div>
                          </div>
                          <button onClick={() => shareContent('Conta', 'Arquivo anexo', transaction.billAttachment, transaction.billFileName)} className="p-3 bg-white dark:bg-slate-700 text-primary rounded-full shadow-sm hover:scale-110 transition-all"><Share2 size={14}/></button>
                       </div>
                    )}

                    {/* ANEXO DO COMPROVANTE */}
                    {transaction.receiptAttachment && (
                       <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                             <button onClick={() => openFile(transaction.receiptAttachment!)} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                                {transaction.receiptAttachment.includes('pdf') ? <FileText size={20} className="text-emerald-500"/> : <img src={transaction.receiptAttachment} className="w-full h-full object-cover"/>}
                             </button>
                             <div>
                                <p className="text-[8px] font-black uppercase text-slate-500 truncate w-32">{transaction.receiptFileName || 'Comprovante'}</p>
                                <div className="flex items-center gap-1 opacity-40"><FolderClosed size={8}/><span className="text-[6px] font-black uppercase">Pasta: Recibos</span></div>
                             </div>
                          </div>
                          <button onClick={() => shareContent('Comprovante', 'Comprovante de pagamento', transaction.receiptAttachment, transaction.receiptFileName)} className="p-3 bg-white dark:bg-slate-700 text-emerald-500 rounded-full shadow-sm hover:scale-110 transition-all"><Share2 size={14}/></button>
                       </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setIsDetailModalOpen(false); onEdit(transaction); }} className="py-4 bg-blue-600/10 text-blue-600 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2"><Pencil size={14}/> Editar</button>
                    <button onClick={() => { if(confirm('Excluir?')) { onDelete(transaction.id); setIsDetailModalOpen(false); } }} className="py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2"><Trash2 size={14}/> Excluir</button>
                  </div>

                  {!transaction.isPaid && (
                    <button onClick={() => setPaymentFlow('PAY_OPTIONS')} className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                      PAGAR AGORA <ArrowRight size={20}/>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 pb-6">
                   <button onClick={() => setPaymentFlow('DETAILS')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><ArrowRight size={16} className="rotate-180"/></button>
                   <div className="grid grid-cols-1 gap-3">
                      <button onClick={() => setIsCameraOpen(true)} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 rounded-[2rem] flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-xl"><Camera size={20}/></div>
                        <div className="text-left"><p className="text-[10px] font-black uppercase">Tirar Foto do Recibo</p></div>
                      </button>
                      <button onClick={() => handleConfirmAction()} className="w-full p-6 bg-white border-2 border-emerald-500/20 rounded-[2rem] flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-xl"><CheckCircle size={20}/></div>
                        <div className="text-left"><p className="text-[10px] font-black uppercase text-emerald-600">Confirmar s/ Recibo</p></div>
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && <CameraModal onCapture={(base64) => { handleConfirmAction(base64, `Recibo_${Date.now()}.jpg`); setIsCameraOpen(false); }} onClose={() => setIsCameraOpen(false)} />}
      {previewImage && <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"/></div>}
    </div>
  );
};