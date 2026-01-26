
import React, { useState, useRef, useMemo } from 'react';
import { Transaction, TransactionType, BankAccount } from '../types';
import { 
  Download, Camera, Trash2, X, Receipt, Clock, Upload, CheckCircle, 
  Paperclip, ChevronRight, Pencil, Share2, Eye, FileText,
  Barcode, Copy, Check, AlertCircle, CalendarClock, Landmark, TrendingUp, TrendingDown, CreditCard,
  ExternalLink, ArrowRight
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
  
  const isNegative = transaction.type !== TransactionType.INCOME;
  const isOverdue = !transaction.isPaid && todayStr && transaction.date < todayStr;
  const isToday = !transaction.isPaid && todayStr && transaction.date === todayStr;
  
  const accountInfo = useMemo(() => {
    if (!bankAccounts || !transaction.bankAccountId) return null;
    return bankAccounts.find(acc => acc.id === transaction.bankAccountId);
  }, [bankAccounts, transaction.bankAccountId]);

  const safeAmount = Number(transaction.amount) || 0;
  const formattedAmount = hideValues ? 'R$ •••••' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeAmount);

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
      setTimeout(() => URL.revokeObjectURL(url), 10000);
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

  const StatusIcon = () => {
    if (transaction.isPaid) return <CheckCircle size={20}/>;
    if (isOverdue) return <AlertCircle size={20}/>;
    if (isToday) return <Clock size={20}/>;
    if (transaction.type === TransactionType.INCOME) return <TrendingUp size={20}/>;
    if (transaction.type === TransactionType.CREDIT_CARD) return <CreditCard size={20}/>;
    return <TrendingDown size={20}/>;
  };

  return (
    <div className={`border-b border-slate-50 dark:border-slate-800 last:border-0 ${isOverdue ? 'bg-rose-500/[0.04]' : isToday ? 'bg-amber-500/[0.02]' : ''}`}>
      <div 
        onClick={() => { setPaymentFlow('DETAILS'); setIsDetailModalOpen(true); }} 
        className="flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-all ${
            transaction.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 
            isOverdue ? 'bg-rose-500 text-white' : 
            isToday ? 'bg-amber-500 text-white' :
            transaction.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
          }`}>
            <StatusIcon />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
               <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{String(transaction.category || 'Outros')}</span>
               {showAccountInfo && accountInfo && <span className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase border" style={{ color: accountInfo.color, borderColor: `${accountInfo.color}30` }}>{accountInfo.bankName}</span>}
               {isOverdue && <span className="text-[6px] font-black bg-rose-500 text-white px-1 py-0.5 rounded uppercase">Vencido</span>}
            </div>
            <span className="font-bold text-sm text-slate-700 dark:text-white group-hover:text-primary transition-colors">{transaction.description}</span>
            <span className="text-[8px] font-bold text-slate-300 uppercase">{transaction.date ? new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className={`font-black text-xs tracking-tight ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>{isNegative ? '-' : '+'} {formattedAmount}</p>
          <ChevronRight size={14} className="text-slate-300"/>
        </div>
      </div>

      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black uppercase tracking-tight">Detalhes do Lançamento</h4>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:scale-110 active:scale-90 transition-all duration-300"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className={`p-6 rounded-[2rem] text-center border mb-6 ${isOverdue ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-inner'}`}>
                <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${transaction.isPaid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{transaction.isPaid ? 'Liquidado' : 'Pendente'}</span>
                <h5 className="text-xl font-black mt-2 text-slate-800 dark:text-white leading-tight">{transaction.description}</h5>
                <p className={`text-3xl font-black mt-1 ${isNegative ? 'text-rose-500' : 'text-emerald-500'}`}>{formattedAmount}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-2">{transaction.date ? new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR') : ''} • {transaction.category}</p>
              </div>

              {paymentFlow === 'DETAILS' ? (
                <>
                  {/* SEÇÃO CÓDIGO DE BARRAS - POSICIONADA ACIMA DOS BOTÕES */}
                  {isNegative && transaction.barcode && (
                    <div className="mb-6 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Barcode size={12}/> Código de Barras</p>
                       <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <p className="font-mono text-[9px] break-all text-center mb-4 text-slate-600 dark:text-slate-300">{transaction.barcode}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleCopyBarcode} className={`py-3 rounded-xl font-black text-[8px] uppercase flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-700 text-primary border border-primary/10 shadow-sm'}`}>
                               {copied ? <Check size={12}/> : <Copy size={12}/>} {copied ? 'Copiado' : 'Copiar'}
                            </button>
                            <button onClick={() => shareContent('Código de Barras', transaction.barcode || '')} className="py-3 bg-white dark:bg-slate-700 text-slate-500 rounded-xl font-black text-[8px] uppercase border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300">
                               <Share2 size={12}/> Compartilhar
                            </button>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* SEÇÃO ANEXO DA CONTA / COMPROVANTE AGENDADO - POSICIONADA ACIMA DOS BOTÕES */}
                  {transaction.billAttachment && (
                    <div className="mb-6 space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><FileText size={12}/> {isNegative ? 'Documento da Conta' : 'Anexo de Recebimento'}</p>
                       <div className="p-4 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                {transaction.billAttachment.includes('pdf') ? <FileText size={20} className="text-primary"/> : <img src={transaction.billAttachment} className="w-full h-full object-cover rounded-xl" />}
                             </div>
                             <div>
                                <p className="text-[8px] font-black uppercase text-slate-500 truncate w-32">{transaction.billFileName || 'arquivo'}</p>
                                <button onClick={() => openFile(transaction.billAttachment!)} className="text-[8px] font-black text-primary uppercase flex items-center gap-1 mt-0.5 hover:underline"><Eye size={10}/> Visualizar</button>
                             </div>
                          </div>
                          <button onClick={() => shareContent('Arquivo', 'Documento anexado', transaction.billAttachment, transaction.billFileName || 'arquivo')} className="p-3 bg-white dark:bg-slate-700 text-primary rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all duration-300"><Share2 size={14}/></button>
                       </div>
                    </div>
                  )}

                  {/* BOTÕES DE EDIÇÃO E EXCLUSÃO - LOGO ABAIXO DOS DOCUMENTOS */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => { setIsDetailModalOpen(false); onEdit(transaction); }} className="py-4 bg-blue-600/10 text-blue-600 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 border border-blue-600/10 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"><Pencil size={14}/> Editar</button>
                    <button onClick={() => { if(confirm('Excluir este lançamento permanentemente?')) { onDelete(transaction.id); setIsDetailModalOpen(false); } }} className="py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"><Trash2 size={14}/> Excluir</button>
                  </div>

                  {/* BOTÃO PRINCIPAL DE AÇÃO AO FINAL (PAGAR / RECEBER) */}
                  {!transaction.isPaid && (
                    <button 
                      onClick={() => setPaymentFlow('PAY_OPTIONS')} 
                      className={`w-full py-6 mb-4 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${isNegative ? 'bg-primary text-white shadow-primary/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}
                    >
                      {isNegative ? 'PAGAR AGORA' : 'RECEBER AGORA'} <ArrowRight size={20}/>
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 pb-6">
                   <div className="flex items-center gap-3 mb-6">
                      <button onClick={() => setPaymentFlow('DETAILS')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:scale-110 active:scale-90 transition-all duration-300"><ArrowRight size={16} className="rotate-180"/></button>
                      <h5 className="font-black text-sm uppercase">Como deseja {isNegative ? 'pagar' : 'receber'}?</h5>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      <button onClick={() => setIsCameraOpen(true)} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-between group hover:border-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary text-white rounded-xl"><Camera size={20}/></div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase">Tirar Foto do Comprovante</p>
                            <p className="text-[8px] font-bold text-slate-400">Capturar recibo agora</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                      </button>

                      <button onClick={() => fileInputRef.current?.click()} className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-between group hover:border-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary text-white rounded-xl"><Upload size={20}/></div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase">Selecionar PDF ou Foto</p>
                            <p className="text-[8px] font-bold text-slate-400">Buscar dos arquivos locais</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-300"/>
                      </button>

                      <button onClick={() => handleConfirmAction()} className="w-full p-6 bg-white dark:bg-slate-900 border-2 border-emerald-500/20 rounded-[2rem] flex items-center justify-between group hover:bg-emerald-500/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500 text-white rounded-xl"><CheckCircle size={20}/></div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-emerald-600">{isNegative ? 'Pagar sem Comprovante' : 'Confirmar sem Comprovante'}</p>
                            <p className="text-[8px] font-bold text-slate-400">Lançar valor imediatamente</p>
                          </div>
                        </div>
                        <Check size={16} className="text-emerald-500"/>
                      </button>
                   </div>
                   <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCameraOpen && <CameraModal onCapture={(base64) => { handleConfirmAction(base64, `Recibo_${Date.now()}.jpg`); setIsCameraOpen(false); }} onClose={() => setIsCameraOpen(false)} />}
      
      {previewImage && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setPreviewImage(null)}>
           <button className="absolute top-8 right-8 p-5 bg-white/10 text-white rounded-full hover:scale-110 active:scale-90 transition-all duration-300"><X size={28}/></button>
           <img src={previewImage} className="max-w-full max-h-[85vh] object-contain rounded-[2rem] shadow-2xl" alt="Preview"/>
        </div>
      )}
    </div>
  );
};
