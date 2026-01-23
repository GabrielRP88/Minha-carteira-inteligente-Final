
import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, RefreshCw, User, Scissors, Shirt, Palette, Eye, Smile, Briefcase, Glasses, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onSave: (imageUrl: string, config: any) => void;
  onClose: () => void;
  initialConfig?: any;
}

const AVATAR_OPTIONS = {
  skinColor: ['614335', 'ae5d29', 'd08b5b', 'edb98a', 'f8d25c', 'fd9841', 'ffdbb4'],
  top: ['longHair', 'shortHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'curly', 'straight01', 'straight02', 'flatTop', 'frizzle', 'shaggy', 'shaggyMullet', 'noHair'],
  hairColor: ['2c1b18', '4a312c', '724130', 'a55728', 'b58143', 'c93305', 'e8e1e1', 'f59700', '724130'],
  eyes: ['default', 'closed', 'cry', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
  eyebrows: ['default', 'defaultNatural', 'angry', 'angryNatural', 'flatNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadHelpful', 'unibrowNatural', 'upsideDown'],
  mouth: ['default', 'concerned', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'],
  accessories: ['none', 'eyepatch', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'],
  clothing: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
  clothingColor: ['262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', 'ff5c5c', 'ff485e', 'ffafb9', 'ffffb1', 'b1ffb1', 'e1ca72', 'ffffff']
};

export const AvatarCreator: React.FC<Props> = ({ onSave, onClose, initialConfig }) => {
  const [config, setConfig] = useState(initialConfig || {
    seed: 'custom',
    backgroundColor: 'b6e3f4',
    skinColor: 'edb98a',
    top: 'shortHair',
    hairColor: '2c1b18',
    eyes: 'default',
    eyebrows: 'default',
    mouth: 'smile',
    accessories: 'none',
    clothing: 'shirtCrewNeck',
    clothingColor: '262e33',
    radius: 50,
  });

  const [activeCategory, setActiveCategory] = useState<string>('skinColor');
  
  const currentPreviewUrl = useMemo(() => {
    const params = new URLSearchParams({
      seed: config.seed,
      backgroundColor: config.backgroundColor,
      radius: config.radius.toString(),
      skinColor: config.skinColor,
      top: config.top,
      hairColor: config.hairColor,
      eyes: config.eyes,
      eyebrow: config.eyebrows,
      mouth: config.mouth,
      accessories: config.accessories === 'none' ? '' : config.accessories,
      clothing: config.clothing,
      clothingColor: config.clothingColor,
    });
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  }, [config]);

  const categories = [
    { id: 'skinColor', name: 'Pele', icon: <User size={14}/> },
    { id: 'top', name: 'Cabelo', icon: <Scissors size={14}/> },
    { id: 'hairColor', name: 'Tinta', icon: <Palette size={14}/> },
    { id: 'eyes', name: 'Olhos', icon: <Eye size={14}/> },
    { id: 'eyebrows', name: 'Sobrancelha', icon: <User size={14}/> },
    { id: 'mouth', name: 'Boca', icon: <Smile size={14}/> },
    { id: 'clothing', name: 'Roupas', icon: <Briefcase size={14}/> },
    { id: 'clothingColor', name: 'Cor Roupa', icon: <Palette size={14}/> },
    { id: 'accessories', name: 'Óculos', icon: <Glasses size={14}/> },
    { id: 'bg', name: 'Fundo', icon: <Palette size={14}/> },
  ];

  const randomize = () => {
    const randomChoice = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    setConfig({
      ...config,
      seed: Math.random().toString(36).substring(7),
      skinColor: randomChoice(AVATAR_OPTIONS.skinColor),
      top: randomChoice(AVATAR_OPTIONS.top),
      hairColor: randomChoice(AVATAR_OPTIONS.hairColor),
      eyes: randomChoice(AVATAR_OPTIONS.eyes),
      eyebrows: randomChoice(AVATAR_OPTIONS.eyebrows),
      mouth: randomChoice(AVATAR_OPTIONS.mouth),
      accessories: randomChoice(AVATAR_OPTIONS.accessories),
      clothing: randomChoice(AVATAR_OPTIONS.clothing),
      clothingColor: randomChoice(AVATAR_OPTIONS.clothingColor),
    });
  };

  const renderOptionItem = (catId: string, opt: string) => {
    const isSelected = config[catId as keyof typeof config] === opt;
    const isColor = catId.toLowerCase().includes('color') || catId === 'bg';
    
    // Gerar uma URL de mini-prévia focada apenas nessa mudança
    const miniConfig = { ...config, [catId]: opt };
    const miniParams = new URLSearchParams({
      seed: 'mini',
      backgroundColor: catId === 'bg' ? opt : 'f1f5f9',
      radius: '50',
      skinColor: catId === 'skinColor' ? opt : config.skinColor,
      top: catId === 'top' ? opt : config.top,
      hairColor: catId === 'hairColor' ? opt : config.hairColor,
      eyes: catId === 'eyes' ? opt : config.eyes,
      eyebrow: catId === 'eyebrows' ? opt : config.eyebrows,
      mouth: catId === 'mouth' ? opt : config.mouth,
      accessories: catId === 'accessories' ? (opt === 'none' ? '' : opt) : (config.accessories === 'none' ? '' : config.accessories),
      clothing: catId === 'clothing' ? opt : config.clothing,
      clothingColor: catId === 'clothingColor' ? opt : config.clothingColor,
    });
    const miniUrl = `https://api.dicebear.com/7.x/avataaars/svg?${miniParams.toString()}`;

    return (
      <button 
        key={opt}
        onClick={() => setConfig(prev => ({ ...prev, [catId]: opt }))}
        className={`relative aspect-square rounded-[1.5rem] border-4 transition-all overflow-hidden flex items-center justify-center p-1 ${
          isSelected ? 'border-primary bg-primary/5 shadow-lg scale-105 z-10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
        }`}
      >
        {isColor ? (
          <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: `#${opt}` }}></div>
        ) : (
          <img src={miniUrl} alt={opt} className="w-full h-full object-contain" loading="lazy" />
        )}
        {isSelected && (
          <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
            <Check size={8} strokeWidth={4} />
          </div>
        )}
      </button>
    );
  };

  const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'ffffff', 'f8fafc', 'cbd5e1', 'f43f5e', '3b82f6'];

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl h-full md:h-[750px] bg-white dark:bg-slate-900 md:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
        
        {/* Lado Esquerdo: Visualização Principal */}
        <div className="md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 shrink-0">
          <div className="relative group">
            <div className="w-56 h-56 md:w-80 md:h-80 bg-white dark:bg-slate-900 rounded-[4.5rem] shadow-2xl p-6 border-8 border-white dark:border-slate-800 overflow-hidden">
               <img src={currentPreviewUrl} alt="Preview" className="w-full h-full object-contain animate-in fade-in duration-300" />
            </div>
            <button 
              onClick={randomize}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-110 active:scale-95 transition-all"
            >
              <RefreshCw size={14} /> Aleatório
            </button>
          </div>
          
          <div className="mt-16 text-center hidden md:block">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 leading-tight">
              Avatar<br/><span className="text-primary opacity-60">Studio Pro</span>
            </h2>
          </div>
        </div>

        {/* Lado Direito: Seleção Granular */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="px-8 pt-8 flex justify-between items-center shrink-0">
            <h3 className="text-2xl font-black uppercase tracking-tight">Personalização</h3>
            <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full hover:rotate-90 transition-all"><X size={20}/></button>
          </div>

          {/* Abas de Categorias */}
          <div className="px-8 mt-6 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-3.5 rounded-2xl flex items-center gap-2 whitespace-nowrap transition-all ${
                    activeCategory === cat.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat.icon}
                  <span className="font-black text-[9px] uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Área de Seleção */}
          <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
              {activeCategory === 'bg' ? (
                bgColors.map(c => renderOptionItem('backgroundColor', c))
              ) : (
                AVATAR_OPTIONS[activeCategory as keyof typeof AVATAR_OPTIONS]?.map(opt => renderOptionItem(activeCategory, opt))
              )}
            </div>
          </div>

          {/* Footer Ações */}
          <div className="p-8 border-t border-slate-50 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <button 
              onClick={() => onSave(currentPreviewUrl, config)}
              className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              <Check size={24} /> Concluir Personagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
