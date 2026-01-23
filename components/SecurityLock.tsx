
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Delete, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { APP_ICON_URL } from '../App';

interface Props {
  correctPin: string;
  user: UserProfile;
  onUnlock: () => void;
  appName: string;
  smartText: string;
}

export const SecurityLock: React.FC<Props> = ({ correctPin, user, onUnlock, appName, smartText }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleInput = (digit: string) => {
    if (pin.length < 10) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin === correctPin) {
        onUnlock();
      } else if (newPin.length >= correctPin.length && newPin !== correctPin) {
        setError(true);
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white dark:bg-[#0f172a] flex flex-col items-center p-6 md:p-10 overflow-hidden">
      
      {/* HEADER DE MARCA - PADRONIZADO E CENTRALIZADO */}
      <div className="flex flex-col items-center text-center mt-6 md:mt-10 animate-in fade-in duration-700">
        <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl flex items-center justify-center p-6 mb-3 border-4 border-primary/5 transition-transform hover:scale-105">
          <img src={APP_ICON_URL} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800 dark:text-white">
            {appName} <span className="text-primary">{smartText}</span>
          </h1>
        </div>
      </div>

      {/* ÁREA CENTRAL: AVATAR + STATUS */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        
        {/* AVATAR DO USUÁRIO */}
        <div className="mb-6 relative animate-in zoom-in duration-500 delay-150">
          <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center overflow-hidden">
            {user.picture ? (
              <img src={user.picture} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <span className="text-3xl">{user.avatar || '👤'}</span>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-full shadow-md border-2 border-white dark:border-slate-900">
            <Lock size={10} strokeWidth={3} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-[0.4em]">
            Dispositivo Protegido
          </h2>
          <h3 className="text-slate-800 dark:text-white font-black text-xl leading-tight mt-1">
            Olá, {user.name.split(' ')[0]}
          </h3>
        </div>

        {/* FEEDBACK DO PIN */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className={`flex items-center justify-center gap-3 h-10 transition-all ${error ? 'animate-shake' : ''}`}>
             {Array.from({ length: Math.max(pin.length, 4) }).map((_, i) => (
               <div 
                 key={i} 
                 className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                   i < pin.length 
                   ? (error ? 'bg-rose-500 border-rose-500 scale-125' : 'bg-primary border-primary scale-110 shadow-lg shadow-primary/30') 
                   : 'border-slate-200 dark:border-slate-700'
                 }`}
               />
             ))}
          </div>
          <button 
            onClick={() => setShowPin(!showPin)} 
            className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-primary transition-colors flex items-center gap-1.5"
          >
            {showPin ? <EyeOff size={12}/> : <Eye size={12}/>} {showPin ? 'Ocultar' : 'Ver Senha'}
          </button>
          {showPin && <p className="text-lg font-black text-primary tracking-[0.4em] h-6">{pin}</p>}
        </div>

        {/* TECLADO NUMÉRICO - AJUSTADO PARA MOBILE */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 w-full px-4 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleInput(n.toString())}
              className="h-14 md:h-20 w-full rounded-[1.8rem] bg-slate-50 dark:bg-slate-800/50 text-xl md:text-2xl font-black text-slate-700 dark:text-white border border-transparent active:bg-primary active:text-white transition-all shadow-sm"
            >
              {n}
            </button>
          ))}
          
          <div className="w-full"></div>

          <button
            onClick={() => handleInput('0')}
            className="h-14 md:h-20 w-full rounded-[1.8rem] bg-slate-50 dark:bg-slate-800/50 text-xl md:text-2xl font-black text-slate-700 dark:text-white border border-transparent active:bg-primary active:text-white transition-all shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 md:h-20 w-full rounded-[1.8rem] flex items-center justify-center text-rose-500 bg-rose-500/10 active:scale-90 transition-all"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="pb-4 md:pb-8 opacity-20 flex flex-col items-center gap-1 shrink-0">
         <Shield size={16}/>
         <p className="text-[7px] font-black uppercase tracking-[0.5em]">Segurança Local Ativa</p>
      </div>

    </div>
  );
};
