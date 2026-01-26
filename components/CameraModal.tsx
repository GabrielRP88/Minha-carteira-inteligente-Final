
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Check, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraModal: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Função para limpar o stream
  const stopStream = (s: MediaStream | null) => {
    if (s) {
      s.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      setIsLoading(true);
      setError(null);

      // Verificação básica de suporte
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Seu navegador não suporta acesso à câmera ou você não está em uma conexão segura (HTTPS).");
        setIsLoading(false);
        return;
      }

      try {
        // Para qualquer stream existente antes de tentar um novo
        stopStream(stream);

        const constraints: MediaStreamConstraints = {
          video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false 
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (mounted) {
          setStream(mediaStream);
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            
            // Força o play() e lida com a promessa (necessário para Mobile)
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  if (mounted) setIsLoading(false);
                })
                .catch(err => {
                  console.error("Autoplay preventer:", err);
                  // Se falhar o autoplay, ainda tentamos mostrar a UI
                  if (mounted) setIsLoading(false);
                });
            }
          }
        } else {
          stopStream(mediaStream);
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        if (mounted) {
          let msg = "Não foi possível acessar a câmera.";
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = "Permissão da câmera negada. Por favor, habilite nas configurações do seu navegador.";
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            msg = "Nenhuma câmera encontrada no dispositivo.";
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            msg = "A câmera está sendo usada por outro aplicativo.";
          }
          setError(msg);
          setIsLoading(false);
        }
      }
    };

    // Pequeno atraso para garantir que o elemento de vídeo esteja montado
    const timer = setTimeout(startCamera, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
      // O cleanup do stream acontece no useEffect de desmontagem ou na próxima execução
    };
  }, [facingMode]);

  // Cleanup final ao fechar o componente
  useEffect(() => {
    return () => stopStream(stream);
  }, [stream]);

  const toggleCamera = () => {
    setIsLoading(true);
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ajusta o canvas para a resolução real do vídeo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Espelhar apenas se estiver usando a câmera frontal
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedImage(dataUrl);
          // Paramos o stream para economizar energia após a captura bem-sucedida
          stopStream(stream);
        } catch (e) {
          console.error("Capture Error:", e);
          setError("Erro ao processar a foto capturada.");
        }
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setIsLoading(true);
    // O useEffect do facingMode será disparado ou podemos forçar a reinicialização
    setFacingMode(facingMode); 
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Botão Fechar */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-[1010] p-4 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-all active:scale-90"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-[9/16] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center">
        
        {/* Loading State */}
        {isLoading && !capturedImage && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-slate-900 z-20">
            <RefreshCw size={40} className="animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Iniciando Câmera...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900 z-30">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black mb-2">Ops! Algo deu errado</h3>
            <p className="font-medium opacity-60 text-sm mb-8 leading-relaxed">{error}</p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              Voltar
            </button>
          </div>
        )}

        {capturedImage ? (
          <img 
            src={capturedImage} 
            className="w-full h-full object-cover animate-in zoom-in-95 duration-300" 
            alt="Captura" 
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        )}

        {/* Guia Visual */}
        {!capturedImage && !error && !isLoading && (
          <div className="absolute inset-0 pointer-events-none z-10">
             <div className="absolute inset-8 border-2 border-white/20 rounded-3xl opacity-50">
                <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
             </div>
          </div>
        )}
      </div>

      {/* Controles Inferiores */}
      <div className="mt-8 flex items-center justify-between w-full max-w-lg px-10">
        {!capturedImage && !error && (
          <>
            <button 
              onClick={toggleCamera}
              disabled={isLoading}
              className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md active:scale-90 shadow-lg border border-white/5 disabled:opacity-50"
              title="Trocar Câmera"
            >
              <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button 
              onClick={takePhoto}
              disabled={isLoading}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all border-[6px] border-slate-900 ring-4 ring-white disabled:opacity-50"
            >
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <Camera className="text-slate-900" size={24} />
              </div>
            </button>

            <div className="w-[56px] h-[56px]"></div>
          </>
        )}

        {capturedImage && (
          <div className="flex gap-4 w-full animate-in slide-in-from-bottom-4">
            <button 
              onClick={handleReset}
              className="flex-1 py-5 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-700 active:scale-95"
            >
              <RotateCcw size={16} /> Repetir
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-emerald-600 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Check size={16} /> Confirmar
            </button>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
