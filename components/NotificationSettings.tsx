
import React from 'react';
import { Bell, Volume2, Music, Check, Smartphone, AlertCircle, Coins, Sparkles, Drum, Waves, GlassWater, BellRing, Zap, History, Wind, Activity, Mic2, Star } from 'lucide-react';
import { playNotificationSound } from '../utils/audio';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

export const NotificationSettings: React.FC<Props> = ({ user, onUpdate }) => {
  const sounds: { id: UserProfile['notificationSound'] | any, name: string, icon: React.ReactNode }[] = [
    { id: 'cash_register', name: 'Caixa Registradora', icon: <Volume2 size={16}/> },
    { id: 'coins', name: 'Moedas Tilintando', icon: <Coins size={16}/> },
    { id: 'success', name: 'Melodia de Sucesso', icon: <Sparkles size={16}/> },
    { id: 'harp', name: 'Harpa Celestial', icon: <Activity size={16}/> },
    { id: 'guitar', name: 'Toque de Violão', icon: <Activity size={16}/> },
    { id: 'whistle', name: 'Assobio Alegre', icon: <Mic2 size={16}/> },
    { id: 'crystal', name: 'Sino de Cristal', icon: <Star size={16}/> },
    { id: 'bubble', name: 'Burbulha Suave', icon: <Waves size={16}/> },
    { id: 'glass', name: 'Toque de Vidro', icon: <GlassWater size={16}/> },
    { id: 'silver', name: 'Sino de Prata', icon: <BellRing size={16}/> },
    { id: 'laser', name: 'Laser Futurista', icon: <Zap size={16}/> },
    { id: 'retro', name: 'Alerta Retro', icon: <History size={16}/> },
    { id: 'drum', name: 'Batida Seca', icon: <Drum size={16}/> },
    { id: 'beep', name: 'Beep Simples', icon: <Bell size={16}/> },
    { id: 'digital', name: 'Alerta Digital', icon: <Smartphone size={16}/> },
    { id: 'chime', name: 'Sino Suave', icon: <Music size={16}/> },
  ];

  const handleToggleSystemNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações de desktop");
      return;
    }

    if (Notification.permission === "granted") {
      onUpdate({ ...user, notificationsEnabled: !user.notificationsEnabled });
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        onUpdate({ ...user, notificationsEnabled: true });
        new Notification("Minha Carteira", { body: "Notificações ativadas com sucesso!" });
      } else {
        alert("As permissões de notificação foram negadas. Por favor, ative-as nas configurações do seu navegador.");
      }
    }
  };

  const handleSelectSound = (soundId: any) => {
    onUpdate({ ...user, notificationSound: soundId });
    playNotificationSound(soundId);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-10">
        <h3 className="text-3xl font-black tracking-tight uppercase">Notificações</h3>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Alertas e Sons</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
        <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Smartphone size={20}/></div>
                 <div>
                    <h4 className="font-black text-[10px] uppercase tracking-widest">Notificações Inteligentes</h4>
                    <p className="text-[8px] font-bold text-slate-400 mt-0.5">Filtro de 3 Dias</p>
                 </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={user.notificationsEnabled || false} 
                  onChange={handleToggleSystemNotifications}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
           </div>
           
           <div className="p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <AlertCircle size={14} className="text-primary shrink-0 mt-0.5"/>
              <p className="text-[8px] font-bold text-slate-400 leading-normal uppercase">
                O sistema enviará alertas visuais e sonoros exclusivamente para itens VENCIDOS, de HOJE e de AMANHÃ.
              </p>
           </div>
        </div>

        <div className="space-y-4">
           <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 ml-4 mb-2 flex items-center gap-2">
              <Volume2 size={12}/> Sons de Notificação
           </h4>
           <div className="grid grid-cols-1 gap-2.5">
              {sounds.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => handleSelectSound(sound.id)}
                  className={`w-full p-5 rounded-[2rem] border-2 flex items-center justify-between transition-all ${
                    user.notificationSound === sound.id || (!user.notificationSound && sound.id === 'cash_register')
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${user.notificationSound === sound.id ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                      {sound.icon}
                    </div>
                    <span className="font-black text-[9px] uppercase tracking-widest">{sound.name}</span>
                  </div>
                  {(user.notificationSound === sound.id || (!user.notificationSound && sound.id === 'cash_register')) && <Check size={16} className="text-primary"/>}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="mt-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] text-center shrink-0">
         <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
           Sons habilitados para o período de 3 dias
         </p>
      </div>
    </div>
  );
};
