
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Database, RefreshCw, Trash2, X, AlertOctagon, History, RotateCcw, 
  FileUp, AlertCircle, Save, Share2, Download, 
  ChevronRight, Check, HardDrive, FileJson,
  Loader2, CheckCircle, Clock, FileDown, ShieldCheck, Zap,
  ExternalLink, ArrowUpRight
} from 'lucide-react';
import { AutoBackupConfig } from '../types';

interface Props {
  onRefresh?: () => void;
}

export const DatabaseManager: React.FC<Props> = ({ onRefresh }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading' | 'confirming'>('idle');
  const [pendingData, setPendingData] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestoreList, setShowRestoreList] = useState(false);
  
  const ALL_STORAGE_KEYS = [
    'wallet_transactions', 
    'wallet_bank_accounts', 
    'wallet_credit_cards', 
    'wallet_reminders', 
    'wallet_user', 
    'wallet_categories',
    'wallet_language',
    'wallet_dark',
    'wallet_theme',
    'wallet_balance_hidden',
    'wallet_app_pin',
    'wallet_notes',
    'wallet_auto_backup_config'
  ];

  const [autoConfig, setAutoConfig] = useState<AutoBackupConfig>(() => {
    const saved = localStorage.getItem('wallet_auto_backup_config');
    return saved ? JSON.parse(saved) : { enabled: true, frequency: 'DAILY', lastBackup: Date.now() };
  });

  useEffect(() => {
    localStorage.setItem('wallet_auto_backup_config', JSON.stringify(autoConfig));
  }, [autoConfig]);

  const getFullBackupData = () => {
    const data: Record<string, any> = {};
    ALL_STORAGE_KEYS.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          data[key] = JSON.parse(val);
        } catch(e) {
          data[key] = val;
        }
      }
    });
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (dataStr: string, filename: string) => {
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateInternalSnapshot = () => {
    setStatus('loading');
    try {
      const dataStr = getFullBackupData();
      const now = new Date();
      const filename = `Snapshot_${now.toLocaleDateString('pt-BR').replace(/\//g, '-')}_${now.getHours()}h${now.getMinutes()}`;
      
      const backupEntry = {
        id: `b-${Date.now()}`,
        name: filename,
        date: now.toLocaleDateString('pt-BR'),
        time: now.toLocaleTimeString('pt-BR'),
        timestamp: Date.now(),
        data: dataStr,
        type: 'MANUAL'
      };

      const existing = JSON.parse(localStorage.getItem('wallet_backups_local_folder') || '[]');
      const updated = [backupEntry, ...existing].slice(0, 20);
      localStorage.setItem('wallet_backups_local_folder', JSON.stringify(updated));
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setStatus('error');
    }
  };

  const handleExportToFile = () => {
    const dataStr = getFullBackupData();
    const now = new Date();
    const filename = `Backup_Carteira_${now.toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    downloadFile(dataStr, filename);
  };

  const executeRestore = () => {
    if (!pendingData) return;
    try {
      const data = JSON.parse(pendingData);
      ALL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
      Object.entries(data).forEach(([key, value]) => {
        if (!key.startsWith('wallet_')) return;
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
      setStatus('success');
      setTimeout(() => {
        if (onRefresh) onRefresh();
        setStatus('idle');
        setPendingData(null);
      }, 800);
    } catch (e) {
      setStatus('error');
    }
  };

  const localSnapshots = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('wallet_backups_local_folder') || '[]');
    } catch(e) { return []; }
  }, [status, showRestoreList]);

  const lastBackupStr = useMemo(() => {
    if (!autoConfig.lastBackup) return 'Nunca realizado';
    return new Date(autoConfig.lastBackup).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }, [autoConfig.lastBackup]);

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
      <div className="mb-12 text-center">
        <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Backup</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Segurança de Dados</p>
      </div>

      <div className="space-y-8 pb-32">
        
        {/* INDICADOR DE STATUS (CLEAN) */}
        <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado da Proteção</p>
            <p className="text-sm font-black text-slate-800 dark:text-white">Último envio: {lastBackupStr}</p>
          </div>
        </div>

        {/* CARD PRINCIPAL: SNAPSHOT (MAIS CLEAN) */}
        <section className="relative p-8 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-[3rem] overflow-hidden group">
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
                 {status === 'loading' ? <Loader2 className="animate-spin" size={32}/> : <Save size={32}/>}
              </div>
              <h4 className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-tight">Snapshot Rápido</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-[240px]">Cria um ponto de restauração instantâneo na memória do app</p>
              
              <button 
                onClick={handleCreateInternalSnapshot} 
                disabled={status === 'loading'}
                className="mt-8 w-full py-5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {status === 'success' ? <><Check size={18}/> Salvo!</> : 'Capturar Agora'}
              </button>
           </div>
        </section>

        {/* GRID DE UTILIDADES REFINADO */}
        <div className="grid grid-cols-2 gap-4">
           {/* EXPORTAR */}
           <button 
             onClick={handleExportToFile}
             className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:border-emerald-500 hover:bg-emerald-500/5 group shadow-sm"
           >
              <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                 <FileDown size={24}/>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Exportar</span>
           </button>

           {/* IMPORTAR */}
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:border-amber-500 hover:bg-amber-500/5 group shadow-sm"
           >
              <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                 <FileUp size={24}/>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Importar</span>
           </button>
           <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                 const reader = new FileReader();
                 reader.onload = (ev) => {
                    setPendingData(ev.target?.result as string);
                    setStatus('confirming');
                 };
                 reader.readAsText(file);
              }
           }} />

           {/* HISTÓRICO */}
           <button 
             onClick={() => setShowRestoreList(true)}
             className="p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all hover:border-primary hover:bg-primary/5 group shadow-sm"
           >
              <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                 <History size={24}/>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Histórico</span>
           </button>

           {/* AUTO BACKUP CONFIG */}
           <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-2 border-transparent rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoConfig.enabled} 
                  onChange={() => setAutoConfig({...autoConfig, enabled: !autoConfig.enabled})}
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary shadow-inner"></div>
              </label>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auto Backup</span>
           </div>
        </div>

        {/* SEÇÃO: FREQUÊNCIA (CLEAN STYLE) */}
        {autoConfig.enabled && (
           <section className="p-2 bg-slate-100 dark:bg-slate-800/60 rounded-[2.2rem] border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="grid grid-cols-3 gap-1">
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setAutoConfig({...autoConfig, frequency: freq})}
                    className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${autoConfig.frequency === freq ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    {freq === 'DAILY' ? 'Diário' : freq === 'WEEKLY' ? 'Semanal' : 'Mensal'}
                  </button>
                ))}
             </div>
           </section>
        )}

        {/* ZONA DE PERIGO (CLEAN & SUBTLE) */}
        <section className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
           <button 
             onClick={() => setShowResetConfirm(true)} 
             className="text-[10px] font-black text-rose-500/60 hover:text-rose-600 uppercase tracking-[0.4em] flex items-center gap-2 transition-all p-4"
           >
             <AlertOctagon size={14}/> Redefinir Aplicativo
           </button>
        </section>
      </div>

      {/* MODAL DE HISTÓRICO (CLEAN) */}
      {showRestoreList && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl flex flex-col max-h-[80vh] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-10">
              <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Snapshots</h4>
              <button onClick={() => setShowRestoreList(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
              {localSnapshots.length === 0 ? (
                <div className="py-24 text-center opacity-30">
                  <p className="font-black text-[10px] uppercase tracking-widest">Vazio</p>
                </div>
              ) : (
                localSnapshots.map((b: any) => (
                  <div key={b.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-between border-2 border-transparent hover:border-primary/20 transition-all group">
                    <div className="text-left">
                      <p className="text-[11px] font-black uppercase text-slate-800 dark:text-white truncate max-w-[160px]">{b.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{b.date} • {b.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => downloadFile(b.data, `${b.name}.json`)}
                        className="p-3 bg-white dark:bg-slate-700 text-slate-500 rounded-xl hover:text-primary transition-colors shadow-sm"
                        title="Baixar"
                      >
                        <Download size={18}/>
                      </button>
                      <button 
                        onClick={() => { setPendingData(b.data); setStatus('confirming'); setShowRestoreList(false); }}
                        className="p-3 bg-primary text-white rounded-xl hover:scale-110 transition-transform shadow-md"
                        title="Restaurar"
                      >
                        <RotateCcw size={18}/>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE RESTAURAÇÃO */}
      {status === 'confirming' && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in zoom-in-95">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[4rem] p-12 text-center shadow-2xl border-4 border-amber-500/20">
            <div className="w-20 h-20 bg-amber-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/20">
              <AlertCircle size={40} />
            </div>
            <h4 className="text-2xl font-black uppercase mb-4 tracking-tighter text-slate-900 dark:text-white">Substituir?</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed px-2">Os dados atuais serão apagados permanentemente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={executeRestore} className="w-full py-6 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all">Sim, Restaurar</button>
              <button onClick={() => { setStatus('idle'); setPendingData(null); }} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black text-xs uppercase">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESET TOTAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[4rem] p-12 text-center shadow-2xl border-4 border-rose-500/10">
            <div className="w-20 h-20 bg-rose-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/20">
              <AlertOctagon size={40} />
            </div>
            <h4 className="text-2xl font-black uppercase mb-4 tracking-tighter text-slate-900 dark:text-white">Limpar Tudo?</h4>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed px-4">Esta ação é irreversível e apagará todos os seus registros.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { localStorage.clear(); if(onRefresh) onRefresh(); }} className="w-full py-5 bg-rose-500 text-white rounded-3xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all">Apagar Agora</button>
              <button onClick={() => setShowResetConfirm(false)} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black text-xs uppercase">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
