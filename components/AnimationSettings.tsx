
import React, { useState, useEffect } from 'react';
import { AnimationConfig, UserProfile } from '../types';
import { 
  Activity, Play, Sparkles, Check, X, Sliders, Zap, 
  RotateCcw, MousePointer, Gauge, Move
} from 'lucide-react';
import { ANIMATION_PRESETS, applyGlobalAnimations } from '../utils/animations';

interface Props {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

export const AnimationSettings: React.FC<Props> = ({ user, onUpdate }) => {
  const [config, setConfig] = useState<AnimationConfig>(user.animationConfig || {
    enabled: true,
    type: 'scale-up',
    intensity: 1,
    speed: 1
  });

  // Apply animations immediately when config changes in this view for preview
  useEffect(() => {
    applyGlobalAnimations(config);
    return () => {
      // Revert to saved config when unmounting if cancelled? 
      // Actually, we want to save on confirm, so we might need a way to revert.
      // But for global effect, we apply `user.animationConfig` in parent when this closes.
    };
  }, [config]);

  const handleSave = () => {
    onUpdate({ ...user, animationConfig: config });
  };

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="mb-8">
        <h3 className="text-3xl font-black uppercase tracking-tight">Animações</h3>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Interatividade & Movimento</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 pr-2 space-y-8">
        
        {/* Ativar/Desativar */}
        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${config.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                 <Sparkles size={24}/>
              </div>
              <div>
                 <h4 className="font-black text-xs uppercase tracking-widest">Animações Globais</h4>
                 <p className="text-[8px] font-bold text-slate-400 mt-0.5">Aplicar a todos os botões e ícones</p>
              </div>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input 
               type="checkbox" 
               className="sr-only peer" 
               checked={config.enabled} 
               onChange={() => setConfig({...config, enabled: !config.enabled})}
             />
             <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary shadow-inner"></div>
           </label>
        </div>

        {config.enabled && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Preview Box */}
            <div className="flex justify-center py-4">
               <button className="w-full max-w-xs py-6 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
                  <MousePointer size={20}/> Teste o Clique
               </button>
            </div>

            {/* Controles Deslizantes */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4 text-slate-400">
                     <Gauge size={14}/>
                     <span className="text-[9px] font-black uppercase tracking-widest">Intensidade</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={config.intensity} 
                    onChange={e => setConfig({...config, intensity: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-[7px] font-bold text-slate-400 uppercase">
                     <span>Suave</span>
                     <span>Forte</span>
                  </div>
               </div>

               <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4 text-slate-400">
                     <Zap size={14}/>
                     <span className="text-[9px] font-black uppercase tracking-widest">Velocidade</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.1" 
                    value={config.speed} 
                    onChange={e => setConfig({...config, speed: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between mt-2 text-[7px] font-bold text-slate-400 uppercase">
                     <span>Lento</span>
                     <span>Rápido</span>
                  </div>
               </div>
            </div>

            {/* Lista de Presets */}
            <div>
               <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 ml-4 mb-4 flex items-center gap-2">
                  <Move size={12}/> Estilos de Movimento
               </h4>
               <div className="grid grid-cols-2 gap-3">
                  {ANIMATION_PRESETS.map(preset => (
                     <button
                        key={preset.id}
                        onClick={() => setConfig({...config, type: preset.id})}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all relative overflow-hidden group ${config.type === preset.id ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-primary/30'}`}
                     >
                        <div className="relative z-10">
                           <span className={`text-[9px] font-black uppercase tracking-widest block mb-1 ${config.type === preset.id ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{preset.name}</span>
                           <span className="text-[7px] font-bold text-slate-400 uppercase">{preset.type}</span>
                        </div>
                        {config.type === preset.id && <Check size={16} className="text-primary"/>}
                     </button>
                  ))}
               </div>
            </div>

          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent z-20">
         <button onClick={handleSave} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
            <Check size={18}/> Salvar Configuração
         </button>
      </div>
    </div>
  );
};
