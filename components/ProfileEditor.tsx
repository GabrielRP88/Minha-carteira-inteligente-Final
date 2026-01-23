
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Camera, User, Save, Upload, RefreshCw, Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { CameraModal } from './CameraModal';

interface Props {
  user: UserProfile;
  onUpdate: (updated: UserProfile) => void;
}

export const ProfileEditor: React.FC<Props> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<UserProfile>(({ ...user }));
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const avatarsPerPage = 12;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateRandomSuggestions();
  }, []);

  const generateRandomSuggestions = () => {
    const styles = ['avataaars', 'personas', 'lorelei', 'bottts', 'adventurer'];
    // Geramos 48 avatares para ter 4 páginas de 12
    const suggestedUrls = Array.from({ length: 48 }, () => {
      const style = styles[Math.floor(Math.random() * styles.length)];
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4`;
    });
    setRandomSuggestions(suggestedUrls);
    setCurrentPage(0);
  };

  const handleSave = () => {
    if (!formData.name) return;
    onUpdate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, picture: reader.result as string, avatar: undefined, avatarConfig: undefined });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (base64: string) => {
    setFormData({ ...formData, picture: base64, avatar: undefined, avatarConfig: undefined });
    setIsCameraOpen(false);
  };

  const totalPages = Math.ceil(randomSuggestions.length / avatarsPerPage);
  const currentAvatars = randomSuggestions.slice(currentPage * avatarsPerPage, (currentPage + 1) * avatarsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-10 text-center">
        <h3 className="text-2xl font-black tracking-tight uppercase">Meu Perfil</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Sparkles size={10} className="text-primary"/>
          <p className="text-[7px] font-black opacity-40 uppercase tracking-[0.4em]">Gestão de Perfil Local</p>
        </div>
      </div>

      <div className="space-y-10 pb-10">
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-36 h-36 rounded-[4rem] bg-slate-100 dark:bg-slate-800 border-8 border-white dark:border-slate-900 p-1 flex items-center justify-center text-6xl shadow-2xl overflow-hidden transition-all bg-white dark:bg-slate-900 ring-4 ring-primary/5">
              {formData.picture ? (
                <img src={formData.picture} className="w-full h-full object-cover rounded-[3.5rem]" alt="Profile" />
              ) : (
                <span className="animate-in zoom-in duration-300">{formData.avatar || '👤'}</span>
              )}
            </div>
            
            <div className="absolute -bottom-1 -right-1 flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-slate-900"
                title="Upload"
              >
                <Upload size={18} />
              </button>
              <button 
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-slate-900"
                title="Câmera"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
          
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

          <div className="w-full space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
              <User size={10}/> Nome de Exibição
            </label>
            <div className="relative">
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 outline-none font-black text-sm text-slate-700 dark:text-white placeholder:opacity-20 transition-all focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/5"
                placeholder="Seu nome aqui"
              />
            </div>
          </div>

          <div className="w-full space-y-5 pt-4">
             <div className="flex items-center justify-between px-2">
               <div className="flex flex-col">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Personagens Rápidos</p>
                 <p className="text-[7px] font-bold text-slate-300 uppercase">Página {currentPage + 1} de {totalPages}</p>
               </div>
               <div className="flex items-center gap-2">
                 <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                   <button 
                     onClick={prevPage}
                     disabled={currentPage === 0}
                     className={`p-1.5 rounded-lg transition-all ${currentPage === 0 ? 'text-slate-300 dark:text-slate-600' : 'text-primary hover:bg-white dark:hover:bg-slate-700'}`}
                   >
                     <ChevronLeft size={16}/>
                   </button>
                   <button 
                     onClick={nextPage}
                     disabled={currentPage === totalPages - 1}
                     className={`p-1.5 rounded-lg transition-all ${currentPage === totalPages - 1 ? 'text-slate-300 dark:text-slate-600' : 'text-primary hover:bg-white dark:hover:bg-slate-700'}`}
                   >
                     <ChevronRight size={16}/>
                   </button>
                 </div>
                 <button 
                   onClick={generateRandomSuggestions} 
                   className="px-4 py-2 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center gap-2 text-[8px] font-black uppercase tracking-widest border border-primary/10"
                 >
                   <RefreshCw size={10}/> Novos
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                {currentAvatars.map((url, idx) => (
                  <button 
                    key={`${currentPage}-${idx}`}
                    type="button"
                    onClick={() => setFormData({...formData, picture: url, avatar: undefined, avatarConfig: undefined})}
                    className={`aspect-square rounded-[2rem] overflow-hidden transition-all relative border-4 bg-white dark:bg-slate-800 shadow-sm ${formData.picture === url ? 'border-primary scale-110 z-10 shadow-xl' : 'border-transparent hover:scale-105'}`}
                  >
                    <img src={url} className="w-full h-full object-contain p-1" alt="Suggested Avatar" />
                    {formData.picture === url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-primary text-white p-1 rounded-full shadow-lg">
                          <Check size={16} strokeWidth={4}/>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="button"
            onClick={handleSave}
            className="w-full py-6 bg-primary text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group"
          >
            <Save size={20} className="group-hover:rotate-12 transition-transform"/> Salvar Alterações
          </button>
        </div>
      </div>

      {isCameraOpen && <CameraModal onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};
