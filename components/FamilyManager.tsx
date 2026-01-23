
import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { Shield, UserPlus, Pencil, Trash2, Crown } from 'lucide-react';

interface Props {
  members: FamilyMember[];
  onInvite: (email: string) => void;
  onUpdateNickname: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  currentUserEmail: string;
}

export const FamilyManager: React.FC<Props> = ({ members, onInvite, onUpdateNickname, onRemove, currentUserEmail }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const isAdmin = members.find(m => m.email === currentUserEmail)?.role === 'ADMIN';

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h3 className="text-2xl font-black">Minha Família</h3>
        <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Até 5 contas compartilhadas</p>
      </div>

      {isAdmin && members.length < 6 && (
        <div className="mb-10 space-y-3">
          <p className="text-[10px] font-black opacity-40 uppercase tracking-widest ml-1">Convidar por E-mail</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="exemplo@gmail.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-primary transition-all text-sm"
            />
            <button 
              onClick={() => { onInvite(inviteEmail); setInviteEmail(''); }}
              className="bg-primary text-white p-4 rounded-2xl hover:scale-105 transition-transform"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {members.map(member => (
          <div key={member.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[32px] flex items-center justify-between border border-transparent hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={member.picture || `https://ui-avatars.com/api/?name=${member.name}`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                {member.role === 'ADMIN' && (
                  <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                    <Crown size={10} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">{member.nickname || member.name}</span>
                  {member.email === currentUserEmail && <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Você</span>}
                </div>
                <p className="text-[10px] font-bold opacity-30 truncate w-32">{member.email}</p>
              </div>
            </div>

            {isAdmin && member.email !== currentUserEmail && (
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    const nick = prompt("Novo apelido para " + member.name);
                    if (nick) onUpdateNickname(member.id, nick);
                  }}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  onClick={() => onRemove(member.id)}
                  className="p-2 hover:bg-rose-100 text-rose-400 rounded-xl transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
