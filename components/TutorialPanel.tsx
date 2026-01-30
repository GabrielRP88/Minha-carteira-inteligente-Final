
import React from 'react';
import { BookOpen, Wallet, CreditCard, Sparkles, Shield, Settings2, Calendar, LayoutList, Eye, Plus, CheckCircle, Smartphone, Camera, Receipt, Calculator, StickyNote, Bell, ArrowRightLeft, Move } from 'lucide-react';

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
      title: "Personalização de Animações",
      desc: "Deixe o app com a sua cara! Acesse o menu e escolha 'Animações' para selecionar entre 30 efeitos de movimento diferentes para botões e ícones, ajustando velocidade e intensidade.",
      icon: <Move className="text-emerald-500" size={24}/>,
      bg: "bg-emerald-500/5",
      preview: (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-3xl flex flex-col items-center gap-2">
           <div className="flex gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl animate-bounce"></div>
              <div className="w-8 h-8 bg-rose-500 rounded-xl animate-pulse"></div>
              <div className="w-8 h-8 bg-amber-500 rounded-xl animate-spin"></div>
           </div>
           <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-2">Escolha seu estilo</p>
        </div>
      )
    },
    {
      title: "Ferramentas Rápidas",
      desc: "Abaixo dos seus cartões, você encontra o dock de utilidades: Calculadora (Amarelo), Lembretes (Rosa), Notas (Verde) e Conversor de Moedas (Azul). Toque em qualquer ícone para abrir a ferramenta instantaneamente.",
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
      title: "Calendário Interativo",
      desc: "O calendário permite navegar pelo tempo. Ao pressionar uma data específica, o aplicativo filtra automaticamente todas as transações daquele dia no seu extrato principal.",
      icon: <Calendar className="text-blue-500" size={24}/>,
      bg: "bg-blue-500/5",
      preview: (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
           <div className="grid grid-cols-7 gap-1 text-center">
              {[12,13,14,15,16,17,18].map(d => (
                <div key={d} className={`p-1.5 rounded-lg text-[7px] font-black ${d === 15 ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>{d}</div>
              ))}
           </div>
           <p className="text-[6px] font-black text-primary uppercase text-center mt-3 tracking-widest">Toque para filtrar o dia</p>
        </div>
      )
    },
    {
      title: "Lançamentos e Recibos",
      desc: "Clique em qualquer transação no extrato para ver detalhes, anexar comprovantes via câmera ou compartilhar o comprovante de pagamento.",
      icon: <LayoutList className="text-slate-500" size={24}/>,
      bg: "bg-slate-500/5",
      preview: (
        <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center"><CheckCircle size={14}/></div>
             <div>
               <p className="text-[8px] font-black uppercase">Supermercado</p>
               <p className="text-[7px] text-slate-400">Pago • 15/05/2024</p>
             </div>
           </div>
           <div className="text-[9px] font-black text-rose-500">- R$ 150,00</div>
        </div>
      )
    },
    {
      title: "Câmera e Escaneamento",
      desc: "Não perca tempo digitando. Ao criar uma saída, você pode fotografar a conta ou o recibo para armazenamento digital seguro.",
      icon: <Camera className="text-purple-500" size={24}/>,
      bg: "bg-purple-500/5",
      preview: (
        <div className="mt-4 grid grid-cols-2 gap-2">
           <div className="p-4 bg-primary text-white rounded-2xl flex flex-col items-center gap-2">
              <Camera size={16}/>
              <span className="text-[6px] font-black uppercase">Tirar Foto</span>
           </div>
           <div className="p-4 bg-slate-800 text-white rounded-2xl flex flex-col items-center gap-2">
              <Receipt size={16}/>
              <span className="text-[6px] font-black uppercase">Ver Anexo</span>
           </div>
        </div>
      )
    },
    {
      title: "Segurança por PIN",
      desc: "Proteja seus dados contra acesso físico não autorizado. Ative o bloqueio por PIN nas configurações de segurança (ícone de escudo).",
      icon: <Shield className="text-rose-500" size={24}/>,
      bg: "bg-rose-500/5",
      preview: (
        <div className="mt-4 p-4 bg-slate-900 rounded-3xl flex flex-col items-center">
           <div className="grid grid-cols-3 gap-1 mb-2">
              {[1,2,3].map(n => <div key={n} className="w-4 h-4 bg-white/10 rounded-md"></div>)}
           </div>
           <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Digite seu código</span>
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
           Mantenha o backup (arquivo .json) sempre atualizado. Você pode exportá-lo na seção de "Cópia de Segurança" para nunca perder seus dados se trocar de celular!
         </p>
      </div>
      
      <div className="pb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
           <Smartphone size={12} className="text-slate-300"/>
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">App Version 3.2.0 (Build 2024)</span>
        </div>
        <p className="text-[7px] font-bold text-slate-200 uppercase tracking-[0.5em]">Minha Carteira Inteligente</p>
      </div>
    </div>
  );
};
