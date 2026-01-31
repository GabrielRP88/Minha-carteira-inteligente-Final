import React, { useState, useEffect, useMemo } from 'react';
import { AnimationConfig, UserProfile } from '../types';
import { 
  Check, Move, Gauge, Zap, MousePointer, Info, Sparkles, Activity, Rocket, Flame
} from 'lucide-react';
import { ANIMATION_PRESETS, applyGlobalAnimations } from '../utils/animations';

interface Props {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

export const AnimationSettings: React.FC<Props> = ({ user, onUpdate }) => {
  const [config, setConfig] = useState<AnimationConfig>(user.animationConfig || {
    enabled: true,
    type: 'jelly-stretch',
    intensity: 1,
    speed: 1
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyGlobalAnimations(config);
  }, [config]);

  const handleSave = () => {
    onUpdate({ ...user, animationConfig: config });
    setSaved(true);
    if ('vibrate' in navigator) navigator.vibrate(40);
    setTimeout(() => setSaved(false), 2000);
  };

  const categorizedPresets = useMemo(() => {
    const groups: Record<string, typeof ANIMATION_PRESETS> = {};
    ANIMATION_PRESETS.forEach(p => {
      if (!groups[p.type]) groups[p.type] = [];
      groups[p.type].push(p);
    });
    return groups;
  }, []);

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black uppercase tracking-tight">Física do App</h3>
          <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Movimentos que voltam ao normal</p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl animate-pulse">
           <Flame size={24}/>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 pr-2 space-y-8">
        
        {/* Toggle Principal */}
        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${config.enabled ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'}`}>
                 <Activity size={24}/>
              </div>
              <div>
                 <h4 className="font-black text-xs uppercase tracking-widest">Ativar Reações</h4>
                 <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase">Movimento apenas ao interagir</p>
              </div>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input 
               type="checkbox" 
               className="sr-only peer" 
               checked={config.enabled} 
               onChange={() => setConfig({...config, enabled: !config.enabled})}
             />
             <div className="w-12 h-7 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-primary shadow-inner"></div>
           </label>
        </div>

        {config.enabled && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Playground de Teste */}
            <div className="flex flex-col items-center gap-4 p-8 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20">
               <button className="w-full py-10 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl flex flex-col items-center justify-center gap-4 active:shadow-none hover:brightness-110 transition-all">
                  <Rocket size={32}/>
                  Passe o mouse ou toque aqui
               </button>
               <p className="text-[7px] font-black text-primary uppercase tracking-[0.3em]">Teste a reação selecionada acima</p>
            </div>

            {/* Sliders de Poder */}
            <div className="grid grid-cols-1 gap-4">
               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-slate-500">
                        <Gauge size={14}/>
                        <span className="text-[9px] font-black uppercase tracking-widest">Força (Intensidade)</span>
                     </div>
                     <span className="text-[10px] font-black text-primary">{(config.intensity * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.3" max="2.5" step="0.1" 
                    value={config.intensity} 
                    onChange={e => setConfig({...config, intensity: parseFloat(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
               </div>

               <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2 text-slate-500">
                        <Zap size={14}/>
                        <span className="text-[9px] font-black uppercase tracking-widest">Velocidade da Reação</span>
                     </div>
                     <span className="text-[10px] font-black text-emerald-500">{(config.speed * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="4" step="0.1" 
                    value={config.speed} 
                    onChange={e => setConfig({...config, speed: parseFloat(e.target.value)})}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
               </div>
            </div>

            {/* Lista de Presets Malucos */}
            <div className="space-y-12">
               {Object.entries(categorizedPresets).map(([category, items]) => (
                  <div key={category} className="space-y-4">
                     <div className="flex items-center gap-3 px-4">
                        <div className="w-1.5 h-6 bg-amber-500/40 rounded-full"></div>
                        <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400">{category}</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {(items as any[]).map(preset => (
                           <button
                              key={preset.id}
                              onClick={() => setConfig({...config, type: preset.id})}
                              className={`p-5 rounded-[2rem] border-2 text-left transition-all ${
                                config.type === preset.id 
                                ? 'border-primary bg-primary/5 shadow-lg scale-105 z-10' 
                                : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-primary/20'
                              }`}
                           >
                              <span className={`text-[10px] font-black uppercase block mb-1 ${config.type === preset.id ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                                {preset.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                 <div className={`w-1 h-1 rounded-full ${config.type === preset.id ? 'bg-primary' : 'bg-slate-300'}`}></div>
                                 <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">{preset.type}</span>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-8 bg-amber-500/5 rounded-[3rem] border border-amber-500/10 flex gap-5">
               <Info size={24} className="text-amber-500 shrink-0 mt-1"/>
               <p className="text-[9px] font-bold text-amber-700 dark:text-amber-500/80 uppercase leading-relaxed tracking-tight">
                 Segurança de Interface: Estes movimentos são puramente visuais e reativos. O sistema garante que os elementos retornem à sua forma perfeita imediatamente após a interação.
               </p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent">
         <button 
           onClick={handleSave} 
           className={`w-full py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-3 ${saved ? 'bg-emerald-500 text-white scale-95' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'}`}
         >
            {saved ? <Check size={20}/> : <Sparkles size={20}/>}
            {saved ? 'Física Aplicada com Sucesso' : 'Salvar Preferências Físicas'}
         </button>
      </div>
    </div>
  );
};