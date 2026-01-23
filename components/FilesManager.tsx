
import React, { useState, useMemo } from 'react';
import { Transaction, UserProfile } from '../types';
import { Download, FileText, Search, Grid, Receipt, X, HardDrive, Settings, Trash2, FolderClosed, ChevronRight, Share2, Eye, LayoutGrid, Database, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onDeleteTransactionFiles: (id: string, type: 'BILL' | 'RECEIPT') => void;
}

type FolderType = 'ROOT' | 'BILLS' | 'RECEIPTS' | 'BACKUP';

export const FilesManager: React.FC<Props> = ({ transactions, user, onUpdateUser, onDeleteTransactionFiles }) => {
  const [currentFolder, setCurrentFolder] = useState<FolderType>('ROOT');
  const [selectedFile, setSelectedFile] = useState<{data: string, name: string, isPdf?: boolean} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{id: string, type: 'BILL' | 'RECEIPT' | 'BACKUP_AUTO' | 'BACKUP_MANUAL'} | null>(null);

  const attachments = useMemo(() => {
    const list: any[] = [];
    transactions.forEach(t => {
      if (t.billAttachment) {
        list.push({ 
          id: t.id, 
          type: 'BILL', 
          data: t.billAttachment, 
          name: t.billFileName || 'conta.pdf', 
          desc: t.description, 
          date: t.date,
          isPdf: t.billAttachment.includes('application/pdf')
        });
      }
      if (t.receiptAttachment) {
        list.push({ 
          id: t.id, 
          type: 'RECEIPT', 
          data: t.receiptAttachment, 
          name: t.receiptFileName || 'recibo.pdf', 
          desc: t.description, 
          date: t.date,
          isPdf: t.receiptAttachment.includes('application/pdf')
        });
      }
    });
    return list;
  }, [transactions]);

  const backups = useMemo(() => {
    const savedAutoBackups = localStorage.getItem('wallet_auto_backups');
    const autoList = savedAutoBackups ? JSON.parse(savedAutoBackups) : [];
    
    const savedManualBackups = localStorage.getItem('wallet_manual_backups');
    const manualList = savedManualBackups ? JSON.parse(savedManualBackups) : [];

    return [
      ...manualList.map((b: any) => ({ ...b, type: 'BACKUP_MANUAL' })),
      ...autoList.map((b: any) => ({ ...b, type: 'BACKUP_AUTO' }))
    ].sort((a, b) => b.timestamp - a.timestamp);
  }, [currentFolder]);

  const filteredFiles = useMemo(() => {
    if (currentFolder === 'BILLS') return attachments.filter(a => a.type === 'BILL');
    if (currentFolder === 'RECEIPTS') return attachments.filter(a => a.type === 'RECEIPT');
    if (currentFolder === 'BACKUP') return backups;
    return [];
  }, [currentFolder, attachments, backups]);

  const handleDownload = (data: string, name: string) => {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const openFile = (dataUrl: string, name: string) => {
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
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch (err) {
        alert("Erro ao abrir PDF.");
      }
    } else {
      setSelectedFile({ data: dataUrl, name });
    }
  };

  const shareFile = async (data: string, name: string, isBackup?: boolean) => {
    try {
      let file;
      if (isBackup) {
        file = new File([data], name, { type: 'application/json' });
      } else {
        const response = await fetch(data);
        const blob = await response.blob();
        file = new File([blob], name, { type: blob.type });
      }
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) return;
    if (showDeleteConfirm.type.startsWith('BACKUP')) {
      const key = showDeleteConfirm.type === 'BACKUP_AUTO' ? 'wallet_auto_backups' : 'wallet_manual_backups';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((b: any) => b.id !== showDeleteConfirm.id);
      localStorage.setItem(key, JSON.stringify(filtered));
      // Forçamos um re-render resetando o folder (simples e eficaz)
      setCurrentFolder('ROOT');
      setTimeout(() => setCurrentFolder('BACKUP'), 10);
    } else {
      onDeleteTransactionFiles(showDeleteConfirm.id, showDeleteConfirm.type as any);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden relative">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-black tracking-tight uppercase leading-none mb-1">Meus Arquivos</h3>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">Armazenamento Local</p>
        </div>
        {currentFolder !== 'ROOT' && (
          <button onClick={() => setCurrentFolder('ROOT')} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all">
            <LayoutGrid size={14}/> Voltar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {currentFolder === 'ROOT' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="p-8 bg-primary/5 dark:bg-primary/10 rounded-[3rem] border-2 border-primary/5 flex items-center gap-6">
                <div className="p-4 bg-primary text-white rounded-3xl shadow-xl shadow-primary/20">
                  <HardDrive size={28}/>
                </div>
                <div>
                   <p className="text-sm font-black uppercase tracking-tight">Memória Local</p>
                   <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">Sincronizado com o navegador</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'BILLS', name: 'Contas Anexadas', icon: <FileText className="text-blue-500"/>, count: attachments.filter(a => a.type === 'BILL').length, color: 'bg-blue-500/10' },
                  { id: 'RECEIPTS', name: 'Recibos e Comprovantes', icon: <Receipt className="text-emerald-500"/>, count: attachments.filter(a => a.type === 'RECEIPT').length, color: 'bg-emerald-500/10' },
                  { id: 'BACKUP', name: 'Backups (Auto + Manual)', icon: <Database className="text-amber-500"/>, count: backups.length, color: 'bg-amber-500/10' }
                ].map(folder => (
                  <button 
                    key={folder.id} 
                    onClick={() => setCurrentFolder(folder.id as FolderType)}
                    className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[2.5rem] hover:border-primary transition-all group shadow-sm hover:shadow-xl"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-4 ${folder.color} rounded-2xl transition-all group-hover:scale-110`}>{folder.icon}</div>
                      <div className="text-left">
                        <p className="text-[11px] font-black uppercase tracking-widest">{folder.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{folder.count} Arquivos</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all"/>
                  </button>
                ))}
             </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
             <div className="flex items-center gap-3 text-slate-400 px-4">
               <FolderClosed size={16} className="text-primary"/>
               <span className="text-[10px] font-black uppercase tracking-widest">
                 Pasta: {currentFolder === 'BILLS' ? 'Contas' : currentFolder === 'RECEIPTS' ? 'Recibos' : 'Backups'}
               </span>
             </div>

             <div className="grid grid-cols-2 gap-4 pb-10">
                {filteredFiles.length === 0 ? (
                  <div className="col-span-2 py-24 text-center">
                    <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-300">Pasta Vazia</p>
                  </div>
                ) : (
                  filteredFiles.map((file, idx) => (
                    <div key={idx} className="group relative bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all">
                       <div className="aspect-square bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                          {file.type.startsWith('BACKUP') ? (
                             <div className="flex flex-col items-center gap-4">
                                <Database size={48} className={file.type === 'BACKUP_AUTO' ? 'text-amber-500 opacity-20' : 'text-primary opacity-20'}/>
                                <span className={`${file.type === 'BACKUP_AUTO' ? 'bg-amber-500' : 'bg-primary'} text-white px-3 py-1 rounded-full text-[8px] font-black uppercase`}>
                                   {file.type === 'BACKUP_AUTO' ? 'AUTO' : 'MANUAL'}
                                </span>
                             </div>
                          ) : (
                            file.isPdf ? (
                              <div className="flex flex-col items-center gap-4">
                                <FileText size={48} className="text-primary opacity-20"/>
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-[8px] font-black uppercase">PDF</span>
                              </div>
                            ) : (
                              <img src={file.data} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={file.name} />
                            )
                          )}
                          
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 p-4">
                             {!file.type.startsWith('BACKUP') ? (
                               <button onClick={() => openFile(file.data, file.name)} className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 shadow-xl"><Eye size={20}/></button>
                             ) : (
                               <button onClick={() => handleDownload(file.data, file.name)} className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 shadow-xl"><Download size={20}/></button>
                             )}
                             <button onClick={() => shareFile(file.data, file.name, file.type.startsWith('BACKUP'))} className="p-4 bg-white text-slate-900 rounded-full hover:scale-110 shadow-xl"><Share2 size={20}/></button>
                             <button onClick={() => setShowDeleteConfirm({id: file.id, type: file.type})} className="p-4 bg-rose-500 text-white rounded-full hover:scale-110 shadow-xl"><Trash2 size={20}/></button>
                          </div>
                       </div>
                       <div className="p-6">
                          <p className="text-[9px] font-black uppercase truncate mb-1">{file.desc || file.name}</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase">{new Date(file.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 text-center shadow-2xl">
              <AlertCircle size={40} className="text-rose-500 mx-auto mb-6"/>
              <h4 className="text-xl font-black uppercase mb-2">Excluir Arquivo?</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-10 leading-relaxed">Esta ação é permanente e o arquivo não poderá ser recuperado.</p>
              <div className="flex flex-col gap-3">
                 <button onClick={handleDelete} className="w-full py-5 bg-rose-500 text-white rounded-3xl font-black text-xs uppercase shadow-xl">Sim, Excluir</button>
                 <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black text-xs uppercase">Cancelar</button>
              </div>
           </div>
        </div>
      )}

      {selectedFile && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl">
           <button onClick={() => setSelectedFile(null)} className="absolute top-10 right-10 p-5 bg-white/10 text-white rounded-full"><X size={28}/></button>
           <img src={selectedFile.data} className="max-w-full max-h-full object-contain rounded-[3rem] shadow-2xl" alt="Preview"/>
        </div>
      )}
    </div>
  );
};
