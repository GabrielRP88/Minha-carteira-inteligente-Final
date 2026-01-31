import React from 'react';
/* Added Database and Check to the imports from lucide-react */
import { BookOpen, Wallet, CreditCard, Sparkles, Shield, Settings2, Calendar, LayoutList, Eye, Plus, CheckCircle, Smartphone, Camera, Receipt, Calculator, StickyNote, Bell, ArrowRightLeft, Move, Palette, Database, Check } from 'lucide-react';

export const TutorialPanel: React.FC = () => {
  const steps = [
    {
      title: "Visão Geral e Privacidade",
      desc: "O card principal exibe seu saldo atual. Use o ícone de olho no canto superior direito do card para ocultar seus valores em ambientes públicos.",
      icon: <Wallet className="text-primary" size={24}/>,
      bg: "bg-primary/5",
      preview: (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[7px] font-black uppercase text-slate-400">Saldo Geral</span>
            <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-md"><Eye size={10} className="text-primary"/></div>
          </div>
          <div className="text-lg font-black tracking-tight">R$ ••••••</div>
          <div className="flex gap-2 mt-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center"><Plus size={12} className="text-white"/></div>
            <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center"><Plus size={12} className="text-white rotate-45"/></div>
          </div>
        </div>
      )
    },
    {
      title: "Movimentação Dinâmica",
      desc: "Todos os botões e ícones clicáveis reagem ao seu toque e ao passar o cursor. No menu 'Animações', você pode escolher o tipo de movimento e ajustar a força da reação.",
      icon: <Move className="text-emerald-500" size={24}/>,
      bg: "bg-emerald-500/5",
      preview: (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-3xl flex flex-col items-center gap-2">
           <div className="flex gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center text-white font-black text-[10px]">TAP</div>
              <div className="w-10 h-10 bg-emerald-500 rounded-xl transition-all hover:-translate-y-1 active:translate-y-1"></div>
           </div>
           <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-2">Reação física ao toque</p>
        </div>
      )
    },
    {
      title: "Tema Personalizado",
      desc: "Crie sua própria identidade visual. No menu 'Temas', você pode usar o seletor de cores para definir a cor principal de todo o aplicativo.",
      icon: <Palette className="text-amber-500" size={24}/>,
      bg: "bg-amber-500/5",
      preview: (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500"></div>
           <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-primary"></div>
           </div>
        </div>
      )
    },
    {
      title: "Dock de Utilitários",
      desc: "Abaixo dos seus cartões, você encontra as ferramentas rápidas: Calculadora, Lembretes, Notas e Conversor de Moedas. Toque em qualquer ícone para abrir.",
      icon: <Settings2 className="text-indigo-500" size={24}/>,
      bg: "bg-indigo-500/5",
      preview: (
        <div className="mt-4 grid grid-cols-4 gap-2">
           <div className="aspect-square bg-amber-500/10 rounded-xl flex items-center justify-center"><Calculator size={14} className="text-amber-500"/></div>
           <div className="aspect-square bg-rose-500/10 rounded-xl flex items-center justify-center"><Bell size={14} className="text-rose-500"/></div>
           <div className="aspect-square bg-emerald-500/10 rounded-xl flex items-center justify-center"><StickyNote size={14} className="text-emerald-500"/></div>
           <div className="aspect-square bg-blue-500/10 rounded-xl flex items-center justify-center"><ArrowRightLeft size={14} className="text-blue-500"/></div>
        </div>
      )
    },
    {
      title: "Backup Completo",
      desc: "Nunca perca seus dados. Acesse 'Backup' para exportar um arquivo .JSON com todas as suas informações, fotos e configurações para guardar com segurança.",
      icon: <Database className="text-violet-500" size={24}/>,
      bg: "bg-violet-500/5",
      preview: (
        <div className="mt-4 p-4 bg-slate-900 rounded-3xl flex items-center justify-between px-6">
           <div className="flex flex-col">
              <span className="text-[7px] font-black text-white/40 uppercase">JSON Export</span>
              <span className="text-[9px] font-black text-white uppercase">backup_v4.json</span>
           </div>
           <Check size={16} className="text-emerald-500"/>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 space-y-8 pt-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <BookOpen size={32}/>
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tight">Manual de Instruções</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Domine sua Carteira Inteligente</p>
      </div>

      <div className="space-y-10">
        {steps.map((step, idx) => (
          <div key={idx} className={`p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02] shadow-sm relative overflow-hidden ${step.bg}`}>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              {step.icon}
            </div>
            <div className="flex items-center gap-5 mb-4 relative z-10">
               <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">{step.icon}</div>
               <h4 className="font-black text-sm uppercase tracking-widest">{step.title}</h4>
            </div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tight relative z-10">
              {step.desc}
            </p>
            
            <div className="mt-6 relative z-10">
               <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-3">Visualização:</p>
               {step.preview}
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-slate-900 text-white rounded-[3rem] text-center mt-12 border-4 border-primary/20">
         <p className="text-[8px] font-black uppercase tracking-[0.4em] mb-4 text-primary">Dica de Ouro</p>
         <p className="text-[11px] font-bold leading-relaxed uppercase">
           Mantenha o backup sempre atualizado. Você pode restaurar seus dados em qualquer navegador ou celular apenas importando o arquivo salvo!
         </p>
      </div>
      
      <div className="pb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
           <Smartphone size={12} className="text-slate-300"/>
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">App Version 4.1.0 (Build 2025)</span>
        </div>
        <p className="text-[7px] font-bold text-slate-200 uppercase tracking-[0.5em]">Minha Carteira Inteligente</p>
      </div>
    </div>
  );
};