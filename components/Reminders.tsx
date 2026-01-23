
import React, { useState, useRef } from 'react';
import { Reminder, Transaction } from '../types';
import { 
  Plus, Trash2, Bell, CheckCircle2, Circle, Receipt, Camera, Upload, 
  X, Eye, FileText, CheckCircle, Barcode, Share2, Copy, Pencil, 
  ArrowLeft, Download as DownloadIcon, Clock, Paperclip, ExternalLink, Check
} from 'lucide-react';
import { CameraModal } from './CameraModal';

interface Props {
  reminders: Reminder[];
  transactions: Transaction[];
  onAdd: (reminder: Reminder) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onPay: (reminderId: string, attachment: string, fileName: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export const Reminders: React.FC<Props> = ({ 
  reminders, transactions, onAdd, onRemove, onToggle, onPay, onEditTransaction 
}) => {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedReminderDetail, setSelectedReminderDetail] = useState<Reminder | null>(null);
  const [isAttachingReceipt, setIsAttachingReceipt] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!text || !time || !date) return;
    onAdd({ id: crypto.randomUUID(), text, time, date, completed: false });
    setText('');
    setTime('');
  };

  const getLinkedTransaction = (rem: Reminder) => {
    if (!rem.transactionId) return null;
    return transactions.find(t => t.id === rem.transactionId) || null;
  };

  const handleCopyBarcode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const openFile = (dataUrl: string) => {
    if (dataUrl.includes('application/pdf')) {
      try {
        const base64Parts = dataUrl.split(',');
        const byteCharacters = atob(base64Parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const win = window.open(url, '_blank');
        if (win) {
          win.focus();
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.click();
        }
        
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      } catch (err) {
        console.error("Erro PDF:", err);
        alert("Erro ao abrir leitor de PDF.");
      }
    } else {
      setPreviewImage(dataUrl);
    }
  };

  const shareContent = async (title: string, text: string, dataUrl?: string, fileName?: string) => {
    if (!navigator.share) return alert("Não suportado");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedReminderDetail) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPay(selectedReminderDetail.id, reader.result as string, file.name);
        setIsAttachingReceipt(false);
        setSelectedReminderDetail(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64: string) => {
    if (selectedReminderDetail) {
      onPay(selectedReminderDetail.id, base64, `Recibo_${Date.now()}.jpg`);
    }
    setIsCameraOpen(false);
    setIsAttachingReceipt(false);
    setSelectedReminderDetail(null);
  };

  return (
    <div className="h-full flex flex-col p-8 relative">
      <div className="mb-8">
        <h3 className="text-2xl font-black">Lembretes</h3>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] mb-8 space-y-4 border-2 border-primary/10">
        <input placeholder="Lembrar de..." value={text} onChange={e => setText(e.target.value)} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold border border-transparent focus:border-primary outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold outline-none border border-transparent focus:border-primary" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl font-bold outline-none border border-transparent focus:border-primary" />
        </div>
        <button onClick={handleAdd} className="w-full bg-primary text-white p-4 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Agendar</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {reminders.sort((a, b) => a.date.localeCompare(b.date)).map(r => (
          <div key={r.id} onClick={() => setSelectedReminderDetail(r)} className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer ${r.completed ? 'opacity-50 bg-slate-50 border-transparent grayscale' : 'bg-white shadow-sm border-slate-50 hover:border-primary'}`}>
            <div className="flex items-center justify-between">
               <div>
                  <p className="font-black text-sm uppercase text-slate-700 dark:text-slate-200">{r.text}</p>
                  <p className="text-[10px] font-bold opacity-40 uppercase">{new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')} • {r.time}</p>
               </div>
               {r.completed ? <CheckCircle2 className="text-emerald-500" size={20}/> : <Circle className="text-slate-200" size={20}/>}
            </div>
          </div>
        ))}
      </div>

      {selectedReminderDetail && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="absolute inset-0" onClick={() => setSelectedReminderDetail(null)}></div>
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black uppercase tracking-tight">Informações</h4>
              <button onClick={() => setSelectedReminderDetail(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 mb-8 text-center border border-slate-100 dark:border-slate-800 shadow-inner">
               <div className="flex justify-center mb-2">
                 <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedReminderDetail.completed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white animate-pulse'}`}>
                   {selectedReminderDetail.completed ? 'Concluído' : 'Pendente'}
                 </span>
               </div>
               <h5 className="text-2xl font-black mb-1 text-slate-800 dark:text-white">{selectedReminderDetail.text}</h5>
               <p className="text-[10px] font-black opacity-40 uppercase">{new Date(selectedReminderDetail.date + 'T12:00:00').toLocaleDateString('pt-BR')} às {selectedReminderDetail.time}</p>
            </div>

            {getLinkedTransaction(selectedReminderDetail) && (
              <div className="space-y-6 mb-10">
                {/* EXIBIÇÃO DO CÓDIGO DE BARRAS NO LEMBRETE */}
                {getLinkedTransaction(selectedReminderDetail)!.barcode && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <Barcode size={14}/> Código de Barras
                    </p>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-primary/10">
                       <p className="font-mono text-[10px] break-all text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-center">
                         {getLinkedTransaction(selectedReminderDetail)!.barcode}
                       </p>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleCopyBarcode(getLinkedTransaction(selectedReminderDetail)!.barcode!)}
                            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-primary border border-primary/20 shadow-sm'}`}
                          >
                            {copied ? <Check size={14} strokeWidth={4}/> : <Copy size={14}/>}
                            {copied ? 'Copiado!' : 'Copiar Código'}
                          </button>
                          <button 
                            onClick={() => shareContent('Código de Barras', `Pagamento: ${getLinkedTransaction(selectedReminderDetail)!.description}\nCódigo: ${getLinkedTransaction(selectedReminderDetail)!.barcode}`)}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700 font-black text-[9px] uppercase tracking-widest shadow-sm"
                          >
                            <Share2 size={14}/> Compartilhar
                          </button>
                       </div>
                    </div>
                  </div>
                )}

                {/* BOTÃO PARA ABRIR A CONTA COMPLETA IGUAL AOS OUTROS MENUS */}
                <button 
                  onClick={() => {
                    const t = getLinkedTransaction(selectedReminderDetail!);
                    if (t && onEditTransaction) {
                      onEditTransaction(t);
                      setSelectedReminderDetail(null);
                    }
                  }}
                  className="w-full py-4 bg-primary/5 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-primary/10 hover:bg-primary/10 transition-all"
                >
                  <ExternalLink size={16}/> Abrir Detalhes da Conta
                </button>

                {getLinkedTransaction(selectedReminderDetail)!.billAttachment && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Paperclip size={14}/> Anexo da Conta</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => openFile(getLinkedTransaction(selectedReminderDetail)!.billAttachment!)} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex flex-col items-center gap-2 group transition-all hover:border-primary border-2 border-transparent shadow-sm">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                          {getLinkedTransaction(selectedReminderDetail)!.billAttachment?.includes('pdf') ? <FileText size={20}/> : <Eye size={20}/>}
                        </div>
                        <span className="text-[8px] font-black uppercase">Ver Conta</span>
                      </button>
                      <button onClick={() => shareContent('Conta', 'Arquivo da conta', getLinkedTransaction(selectedReminderDetail)!.billAttachment, 'conta.pdf')} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex flex-col items-center gap-2 group transition-all hover:border-primary border-2 border-transparent shadow-sm">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all"><Share2 size={20}/></div>
                        <span className="text-[8px] font-black uppercase">Enviar Conta</span>
                      </button>
                    </div>
                  </div>
                )}

                {(selectedReminderDetail.receiptAttachment || getLinkedTransaction(selectedReminderDetail)!.receiptAttachment) && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Receipt size={14}/> Comprovante / Anexo</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => openFile(selectedReminderDetail.receiptAttachment || getLinkedTransaction(selectedReminderDetail)!.receiptAttachment!)}
                        className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex flex-col items-center gap-2 group transition-all hover:border-emerald-500 border-2 border-transparent shadow-sm"
                      >
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {(selectedReminderDetail.receiptAttachment || getLinkedTransaction(selectedReminderDetail)!.receiptAttachment)?.includes('pdf') ? <FileText size={20}/> : <Eye size={20}/>}
                        </div>
                        <span className="text-[8px] font-black uppercase">Ver Anexo</span>
                      </button>
                      <button onClick={() => shareContent('Comprovante', 'Comprovante do lembrete', selectedReminderDetail.receiptAttachment || getLinkedTransaction(selectedReminderDetail)!.receiptAttachment!, 'comprovante.pdf')} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex flex-col items-center gap-2 group transition-all hover:border-emerald-500 border-2 border-transparent shadow-sm">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all"><Share2 size={20}/></div>
                        <span className="text-[8px] font-black uppercase">Enviar Anexo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
               {!selectedReminderDetail.completed && (
                  <button onClick={() => setIsAttachingReceipt(true)} className="w-full py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
                    <CheckCircle size={20}/> Pagar e Anexar
                  </button>
               )}
               <button 
                 onClick={() => { onToggle(selectedReminderDetail.id); setSelectedReminderDetail(null); }} 
                 className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black text-[10px] uppercase transition-all hover:bg-slate-200"
               >
                 {selectedReminderDetail.completed ? 'Reabrir Lembrete' : 'Concluir s/ Recibo'}
               </button>
               <button onClick={() => { onRemove(selectedReminderDetail.id); setSelectedReminderDetail(null); }} className="w-full py-4 text-rose-500 font-black text-[9px] uppercase tracking-widest hover:text-rose-600 transition-colors mt-2">
                 Remover Lembrete Permanentemente
               </button>
            </div>
          </div>
        </div>
      )}

      {/* VISUALIZADOR INTERNO (APENAS IMAGEM) */}
      {previewImage && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-8 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in zoom-in-95">
           <button onClick={() => setPreviewImage(null)} className="absolute top-8 right-8 p-5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[610]">
             <X size={28}/>
           </button>
           <div className="w-full h-full max-w-5xl flex items-center justify-center relative">
              <img src={previewImage} className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl" alt="Preview"/>
           </div>
        </div>
      )}

      {isAttachingReceipt && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl">
           <div className="absolute inset-0" onClick={() => setIsAttachingReceipt(false)}></div>
           <div className="relative w-full max-w-lg animate-in slide-in-from-bottom-10">
             <div className="flex justify-between items-center mb-10 px-4 text-white">
                <h4 className="text-xl font-black uppercase tracking-tight">Anexar Comprovante</h4>
                <button onClick={() => setIsAttachingReceipt(false)} className="p-2 text-white/40"><X size={24}/></button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsCameraOpen(true)} className="p-10 bg-primary text-white rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:scale-105 shadow-2xl shadow-primary/20"><Camera size={40}/><span className="font-black text-[10px] uppercase">Câmera</span></button>
                <button onClick={() => fileInputRef.current?.click()} className="p-10 bg-slate-800 text-white rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:scale-105 shadow-2xl"><Upload size={40}/><span className="font-black text-[10px] uppercase">Galeria</span></button>
             </div>
             <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
           </div>
        </div>
      )}

      {isCameraOpen && <CameraModal onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};
