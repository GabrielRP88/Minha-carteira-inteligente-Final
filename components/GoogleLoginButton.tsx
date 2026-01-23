
import React, { useEffect, useRef, useState } from 'react';

// Declaração para o objeto global do Google Identity Services
declare global {
  interface Window {
    google: any;
  }
}

interface Props {
  onSuccess: (userData: { name: string; email: string; picture: string; sub: string }) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

export const GoogleLoginButton: React.FC<Props> = ({ onSuccess, text = 'continue_with' }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Helper para decodificar o JWT do Google sem bibliotecas externas
  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Erro ao decodificar JWT", e);
      return null;
    }
  };

  useEffect(() => {
    // Verifica se o script do Google já está disponível no window
    const checkGSI = () => {
      if (window.google?.accounts?.id) {
        setIsReady(true);
      } else {
        setTimeout(checkGSI, 500);
      }
    };
    checkGSI();
  }, []);

  useEffect(() => {
    if (!isReady || !buttonRef.current) return;

    /**
     * IMPORTANTE: O "Erro 401: invalid_client" ocorre porque o ID abaixo é fictício.
     * Para que o login funcione em produção ou localmente, você deve:
     * 1. Acessar https://console.cloud.google.com/
     * 2. Criar um projeto e um "ID de cliente OAuth 2.0" para "Aplicativo da Web".
     * 3. Adicionar sua URL (ex: http://localhost:3000) nas "Origens JavaScript autorizadas".
     * 4. Substituir a string abaixo pelo seu ID real.
     */
    const clientId = (process.env as any).GOOGLE_CLIENT_ID || "775567364120-u7u7u7u7u7u7u7u7.apps.googleusercontent.com";

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const payload = decodeJwt(response.credential);
          if (payload) {
            onSuccess({
              name: payload.name,
              email: payload.email,
              picture: payload.picture,
              sub: payload.sub
            });
          }
        },
      });

      // Renderiza o botão oficial do Google
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: text,
        width: buttonRef.current.offsetWidth || 300
      });
    } catch (error) {
      console.error("Falha na inicialização do Google Sign-In:", error);
    }
  }, [isReady, onSuccess, text]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div ref={buttonRef} className="w-full flex justify-center min-h-[46px] animate-in fade-in duration-500">
        {!isReady && (
          <div className="flex items-center gap-3 text-slate-400 py-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Conectando ao Google...</span>
          </div>
        )}
      </div>
      {!isReady && (
        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Aguardando serviços de identidade
        </p>
      )}
    </div>
  );
};
