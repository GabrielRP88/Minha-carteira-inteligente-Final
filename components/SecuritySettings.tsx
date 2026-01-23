
import React, { useState } from 'react';
import { Shield, Lock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
}

export const SecuritySettings: React.FC<Props> = ({ currentPin, onUpdatePin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'INITIAL' | 'SETTING' | 'CONFIRMING'>('INITIAL');
  const [error, setError] = useState('');

  const handleSetPin = () => {
    if (pin.length < 4 || pin.length > 10) {
      setError('A senha deve ter entre 4 e 10 números.');
      return;
    }
    setStep('CONFIRMING');
    setError('');
  };

  const handleConfirmPin = () => {
    if (pin === confirmPin) {
      onUpdatePin(pin);
      setStep('INITIAL');
      setPin('');
      setConfirmPin('');
    } else {
      setError('As senhas não coincidem.');
      setConfirmPin('');
    }
  };

  const removePin = () => {
    if (window.confirm("Deseja realmente remover a senha de acesso?")) {
      onUpdatePin('');
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-10">
        <h3 className="text-3xl font-black tracking-tight uppercase">Segurança</h3>
        <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mt-1">Proteção de Dados</p>
      </div>

      <div className="flex-1 space-y-6">
        <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${currentPin ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
            {currentPin ? <Shield size={32} /> : <Lock size={32} />}
          </div>
          <h4 className="font-black text-sm uppercase tracking-widest mb-2">
            {currentPin ? 'Acesso Protegido' : 'Acesso Livre'}
          </h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed px-4">
            {currentPin 
              ? 'Seu aplicativo está protegido. A senha será solicitada sempre que você abrir o app.' 
              : 'Cadastre uma senha de 4 a 10 números para impedir acessos não autorizados.'}
          </p>
        </div>

        {step === 'INITIAL' ? (
          <div className="grid grid-cols-1 gap-4">
            {currentPin ? (
              <>
                <button 
                  onClick={() => setStep('SETTING')}
                  className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-xl"
                >
                  Alterar Senha Atual
                </button>
                <button 
                  onClick={removePin}
                  className="w-full py-6 bg-white dark:bg-slate-800 border-2 border-rose-100 dark:border-rose-900/30 text-rose-500 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={18} /> Remover Proteção
                </button>
              </>
            ) : (
              <button 
                onClick={() => setStep('SETTING')}
                className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all shadow-xl"
              >
                Ativar Senha de Acesso
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="text-center">
              <h5 className="font-black text-xs uppercase tracking-widest mb-4">
                {step === 'SETTING' ? 'Digite a Nova Senha' : 'Confirme a Nova Senha'}
              </h5>
              <div className="flex justify-center gap-3 mb-8 h-4">
                {(step === 'SETTING' ? pin : confirmPin).split('').map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full bg-primary animate-in zoom-in"></div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === 'C') {
                        step === 'SETTING' ? setPin('') : setConfirmPin('');
                      } else if (btn === 'OK') {
                        step === 'SETTING' ? handleSetPin() : handleConfirmPin();
                      } else {
                        const current = step === 'SETTING' ? pin : confirmPin;
                        if (current.length < 10) {
                          step === 'SETTING' ? setPin(pin + btn) : setConfirmPin(confirmPin + btn);
                        }
                      }
                    }}
                    className={`h-16 rounded-2xl font-black text-lg transition-all active:scale-90 ${
                      btn === 'OK' ? 'bg-emerald-500 text-white' : 
                      btn === 'C' ? 'bg-rose-100 text-rose-500' : 
                      'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-6 flex items-center justify-center gap-2 text-rose-500 font-black text-[8px] uppercase tracking-widest animate-shake">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button 
                onClick={() => { setStep('INITIAL'); setPin(''); setConfirmPin(''); setError(''); }}
                className="mt-8 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-start gap-4">
        <Shield className="text-primary shrink-0 mt-1" size={16}/>
        <p className="text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter leading-normal">
          A senha protege seus dados localmente. Memorize-a bem, pois sem ela o acesso só é recuperado limpando os dados do app.
        </p>
      </div>
    </div>
  );
};
