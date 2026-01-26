
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

  // Inicializa a câmera
  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      setIsLoading(true);
      setError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mounted) {
          setError("Câmera não disponível. Verifique se está usando HTTPS ou se o dispositivo possui câmera.");
          setIsLoading(false);
        }
        return;
      }

      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: { 
            facingMode: { ideal: facingMode }
          },
          audio: false 
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (mounted) {
          currentStream = mediaStream;
          setStream(mediaStream);
          setIsLoading(false);
        } else {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err: any) {
        console.error("Camera Error:", err);
        if (mounted) {
          setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
          setIsLoading(false);
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.log("Erro no play automático:", e));
    }
  }, [stream, videoRef]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setCapturedImage(dataUrl);
        } catch (e) {
          console.error("Erro ao gerar imagem:", e);
          setError("Erro ao processar a imagem capturada.");
        }
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onCapture(capturedImage);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <button 
        onClick={handleClose} 
        className="absolute top-6 right-6 z-[1010] p-4 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-md transition-all active:scale-90"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-[9/16] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        
        {isLoading && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-slate-900 z-20">
            <RefreshCw size={40} className="animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Iniciando Câmera...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center bg-slate-900 z-30">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black mb-2">Erro na Câmera</h3>
            <p className="font-medium opacity-60 text-sm mb-8 leading-relaxed">{error}</p>
            <button 
              onClick={handleClose}
              className="px-8 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
            >
              Fechar
            </button>
          </div>
        ) : capturedImage ? (
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

        {!capturedImage && !error && !isLoading && (
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/50 to-transparent"></div>
             <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
             <div className="absolute inset-8 border-2 border-white/20 rounded-3xl opacity-50">
                <div className="absolute top-[-2px] left-[-2px] w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-[-2px] right-[-2px] w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-[-2px] right-[-2px] w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
             </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between w-full max-w-lg px-10">
        {!capturedImage && !error && !isLoading && (
          <>
            <button 
              onClick={toggleCamera}
              className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md active:scale-90 shadow-lg border border-white/5"
              title="Trocar Câmera"
            >
              <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button 
              onClick={takePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all border-[6px] border-slate-900 ring-4 ring-white"
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
