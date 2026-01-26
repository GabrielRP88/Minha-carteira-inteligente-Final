
import React from 'react';
import { 
  BookOpen, Wallet, CreditCard, Shield, Calendar, LayoutList, Eye, Plus, 
  CheckCircle, Smartphone, Camera, Receipt, Calculator, StickyNote, Bell, 
  ArrowRightLeft, FileDown, Search, Database, TrendingUp, TrendingDown,
  MoreHorizontal, AlertCircle, Lock, Coins
} from 'lucide-react';

export const TutorialPanel: React.FC = () => {
  const sections = [
    {
      title: "1. Visão Geral e Privacidade",
      icon: <LayoutList size={20}/>,
      content: [
        {
          subtitle: "O Painel Principal",
          text: "Ao abrir o aplicativo, você vê o Card de Saldo Geral. Este valor é a soma de todas as suas contas bancárias mais suas receitas do mês, subtraindo as despesas pagas. Use o ícone de 'Olho' para esconder os valores quando estiver em público.",
          visual: (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Saldo Atual</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">R$ 1.250,00</span>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl"><Eye size={14} className="text-slate-500"/></div>
               </div>
               <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg flex items-center gap-2">
                    <TrendingUp size={12} className="text-emerald-500"/>
                    <span className="text-[8px] font-bold text-emerald-600">Receitas</span>
                  </div>
                  <div className="px-3 py-1.5 bg-rose-500/10 rounded-lg flex items-center gap-2">
                    <TrendingDown size={12} className="text-rose-500"/>
                    <span className="text-[8px] font-bold text-rose-600">Despesas</span>
                  </div>
               </div>
            </div>
          )
        },
        {
          subtitle: "Inteligência Artificial",
          text: "No topo do painel, há um botão de Lâmpada. Ao clicar nele, o Gemini (IA do Google) analisa seus últimos 50 lançamentos e gera 3 dicas personalizadas para você economizar dinheiro.",
          visual: (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl text-white shadow-lg">
               <div className="flex items-center gap-2 mb-2">
                 <span className="bg-white/20 p-1 rounded-md"><Smartphone size={12}/></span>
                 <span className="text-[10px] font-black uppercase">Dica Inteligente</span>
               </div>
               <p className="text-[9px] font-bold leading-relaxed opacity-90">"Notei que você gastou muito com 'Lazer' este fim de semana. Que tal cozinhar em casa nos próximos dias?"</p>
            </div>
          )
        }
      ]
    },
    {
      title: "2. Gerenciando Transações",
      icon: <ArrowRightLeft size={20}/>,
      content: [
        {
          subtitle: "Novo Lançamento",
          text: "O botão '+' principal abre o formulário. Você pode registrar Receitas, Despesas ou Gastos no Cartão de Crédito. A descrição é opcional! Se não preencher, o app usa a categoria como nome.",
          visual: (
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
               <div className="flex justify-between mb-4">
                  <div className="h-8 w-24 bg-emerald-500 rounded-xl flex items-center justify-center text-[8px] text-white font-black uppercase">Receita</div>
                  <div className="h-8 w-24 bg-rose-500 rounded-xl flex items-center justify-center text-[8px] text-white font-black uppercase opacity-20">Despesa</div>
               </div>
               <div className="h-10 bg-white dark:bg-slate-900 rounded-xl mb-2 w-full border border-slate-200 dark:border-slate-700 flex items-center px-4">
                  <span className="text-xs font-black text-slate-300">R$ 0,00</span>
               </div>
               <div className="h-10 bg-white dark:bg-slate-900 rounded-xl w-full border border-slate-200 dark:border-slate-700 flex items-center px-4">
                  <span className="text-xs font-black text-slate-300">Descrição (Opcional)</span>
               </div>
            </div>
          )
        },
        {
          subtitle: "Agendar vs Confirmar",
          text: "No rodapé do formulário, existem dois botões. 'Agendar' salva o lançamento como Pendente (ideal para contas futuras). 'Confirmar' salva como Pago/Liquidado (o dinheiro sai da conta na hora).",
          visual: (
            <div className="flex gap-2">
               <div className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[8px] font-black uppercase text-slate-500">Botão Agendar</span>
                  <span className="text-[7px] text-slate-400">Fica Pendente</span>
               </div>
               <div className="flex-1 py-3 bg-primary text-white rounded-xl flex flex-col items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-[8px] font-black uppercase">Botão Confirmar</span>
                  <span className="text-[7px] opacity-80">Saldo Atualiza</span>
               </div>
            </div>
          )
        }
      ]
    },
    {
      title: "3. Cartões de Crédito Inteligentes",
      icon: <CreditCard size={20}/>,
      content: [
        {
          subtitle: "Ciclo de Fatura",
          text: "O app entende datas de corte! Se você comprar no cartão HOJE, e hoje for DEPOIS do dia de fechamento, a compra cairá automaticamente na fatura do MÊS SEGUINTE. Se comprar antes, cai na ATUAL.",
          visual: (
            <div className="relative h-24 w-full rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-4 text-white overflow-hidden shadow-lg">
               <div className="absolute top-0 right-0 p-2 opacity-10"><CreditCard size={60}/></div>
               <div className="flex justify-between items-start relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-widest">Nubank</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-end">
                       <span className="text-[6px] font-bold opacity-50 uppercase">Fechamento</span>
                       <span className="text-[9px] font-black">Dia 05</span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[6px] font-bold opacity-50 uppercase">Vencimento</span>
                       <span className="text-[9px] font-black text-rose-400">Dia 12</span>
                    </div>
                  </div>
               </div>
               <div className="mt-4 relative z-10">
                  <span className="text-[7px] font-bold opacity-50 uppercase">Limite Disponível</span>
                  <span className="text-lg font-black block">R$ 2.450,00</span>
               </div>
            </div>
          )
        },
        {
          subtitle: "Pagamento de Fatura",
          text: "Na Central de Notificações, quando uma fatura fecha, aparece um card específico para ela. Você pode 'Pagar Fatura Total' ou selecionar itens individuais para pagar parcialmente.",
          visual: (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-l-4 border-rose-500 shadow-sm flex justify-between items-center">
               <div>
                  <p className="text-[9px] font-black uppercase text-slate-800 dark:text-white">Fatura Nubank</p>
                  <p className="text-[8px] font-bold text-slate-400">Vence Amanhã</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-rose-500">R$ 850,00</p>
                  <span className="text-[6px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase">Aberto</span>
               </div>
            </div>
          )
        }
      ]
    },
    {
      title: "4. Calendário e Agenda",
      icon: <Calendar size={20}/>,
      content: [
        {
          subtitle: "Navegação Temporal",
          text: "O Calendário permite ver seus gastos no tempo. Dias com pontos AZUIS têm transações. Pontos VERMELHOS são lembretes. Pontos VERDES são notas.",
          visual: (
            <div className="grid grid-cols-7 gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
               {[10,11,12,13,14,15,16].map((d, i) => (
                 <div key={d} className={`flex flex-col items-center p-1 rounded-lg ${i === 3 ? 'bg-primary text-white shadow-lg' : ''}`}>
                    <span className="text-[8px] font-black">{d}</span>
                    <div className="flex gap-0.5 mt-1">
                       {i % 2 === 0 && <div className={`w-1 h-1 rounded-full ${i === 3 ? 'bg-white' : 'bg-blue-500'}`}></div>}
                       {i % 3 === 0 && <div className={`w-1 h-1 rounded-full ${i === 3 ? 'bg-white' : 'bg-rose-500'}`}></div>}
                    </div>
                 </div>
               ))}
            </div>
          )
        },
        {
          subtitle: "Filtro por Dia",
          text: "Ao clicar em um dia específico no calendário, o extrato principal muda para 'Movimentações: DD/MM/AAAA' e mostra apenas o que aconteceu naquele dia.",
          visual: null
        }
      ]
    },
    {
      title: "5. Backup e Segurança",
      icon: <Shield size={20}/>,
      content: [
        {
          subtitle: "Tudo é Offline (Local)",
          text: "Seus dados ficam salvos EXCLUSIVAMENTE no seu navegador. O app não envia seus dados financeiros para nuvem nenhuma. Isso garante privacidade total.",
          visual: (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <Database size={16} className="text-emerald-600"/>
               <span className="text-[8px] font-black text-emerald-700 uppercase">Armazenamento 100% Local</span>
            </div>
          )
        },
        {
          subtitle: "Gerando Backup",
          text: "Como os dados são locais, se você limpar o cache ou trocar de celular, PERDE TUDO. Para evitar isso, vá em Ajustes > Backup > Exportar. Isso baixa um arquivo `.json`.",
          visual: (
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-3 rounded-xl mt-2">
               <div className="flex items-center gap-2">
                  <FileDown size={14} className="text-slate-500"/>
                  <span className="text-[8px] font-black uppercase text-slate-600 dark:text-slate-300">Backup_Carteira.json</span>
               </div>
               <span className="text-[8px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">Baixar</span>
            </div>
          )
        },
        {
          subtitle: "Bloqueio por Senha",
          text: "Você pode definir um PIN numérico. Sempre que abrir o app ou tentar acessar áreas sensíveis, a senha será exigida.",
          visual: (
            <div className="flex justify-center gap-2 my-2">
               {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-800 dark:bg-white"></div>)}
            </div>
          )
        }
      ]
    },
    {
      title: "6. Utilitários (Dock)",
      icon: <Calculator size={20}/>,
      content: [
        {
          subtitle: "Acesso Rápido (Dock)",
          text: "No centro da tela inicial existem 5 ícones coloridos: Calculadora, Alertas, Câmbio (Novo), Notas e Arquivos.",
          visual: (
            <div className="grid grid-cols-3 gap-2 mt-2">
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500"></div>
                  <span className="text-[8px] font-bold">Calculadora</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-rose-500"></div>
                  <span className="text-[8px] font-bold">Alertas</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-sky-500"></div>
                  <span className="text-[8px] font-bold">Câmbio</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <span className="text-[8px] font-bold">Notas</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-800"></div>
                  <span className="text-[8px] font-bold">Arquivos</span>
               </div>
            </div>
          )
        },
        {
          subtitle: "Conversor de Moedas",
          text: "Utilize o botão 'Câmbio' para converter valores entre moedas (USD, BRL, EUR, etc). O sistema utiliza fontes confiáveis (Morningstar · Fontes) e atualizações horárias para garantir precisão.",
          visual: (
            <div className="flex items-center gap-2 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl">
               <Coins size={16} className="text-sky-500"/>
               <span className="text-[8px] font-black uppercase text-sky-600">Cotação em Tempo Real</span>
            </div>
          )
        },
        {
          subtitle: "Arquivos e Fotos",
          text: "A seção 'Arquivos' organiza todas as fotos de recibos e contas que você anexou. Você pode excluir arquivos antigos para liberar espaço na memória do navegador.",
          visual: null
        }
      ]
    }
  ];

  return (
    <div className="p-8 h-full flex flex-col bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar">
      
      {/* Header do Manual */}
      <div className="text-center mb-10 shrink-0">
        <div className="w-20 h-20 bg-primary text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30 animate-in zoom-in duration-500">
          <BookOpen size={40}/>
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Manual do Usuário</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Guia Completo v3.1</p>
      </div>

      {/* Lista de Seções */}
      <div className="space-y-12 pb-20">
        {sections.map((section, idx) => (
          <div key={idx} className="animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
               <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-white">
                 {section.icon}
               </div>
               <h4 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
                 {section.title}
               </h4>
            </div>

            <div className="space-y-8 pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-5">
               {section.content.map((item, i) => (
                 <div key={i} className="relative pl-8">
                    {/* Marcador da linha do tempo */}
                    <div className="absolute top-1.5 -left-[5px] w-2.5 h-2.5 rounded-full bg-primary border-4 border-white dark:border-slate-900"></div>
                    
                    <h5 className="text-sm font-black uppercase tracking-widest text-primary mb-2">
                      {item.subtitle}
                    </h5>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4 text-justify">
                      {item.text}
                    </p>
                    
                    {/* Visual Mockup (Print) */}
                    {item.visual && (
                      <div className="mt-3 mb-6 transform transition-transform hover:scale-[1.02]">
                         {item.visual}
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pro Tip Footer */}
      <div className="mt-8 p-8 bg-slate-900 text-white rounded-[3rem] text-center border-4 border-primary/20 shadow-2xl shrink-0">
         <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white animate-pulse">
            <AlertCircle size={24}/>
         </div>
         <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-4 text-primary">Aviso Importante</p>
         <p className="text-xs font-bold leading-loose uppercase">
           Este aplicativo não possui servidor na nuvem. <br/>
           <span className="text-primary underline">Faça backups regulares</span> se você possui dados importantes.
           Se você limpar o histórico do navegador, os dados serão perdidos.
         </p>
      </div>

      <div className="h-10"></div>
    </div>
  );
};
