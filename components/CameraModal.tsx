
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Check, RotateCcw, AlertCircle, RefreshCw, FlipHorizontal } from 'lucide-react';

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

  useEffect(() => {
    startCamera();

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (isLoading && !error) {
        setError("A inicialização da câmera está demorando muito. Certifique-se de que deu permissão.");
        setIsLoading(false);
      }
    }, 8000);

    return () => {
      clearTimeout(timeout);
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    setError(null);
    setIsLoading(true);
    
    // Verifica suporte básico
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Seu navegador não suporta acesso à câmera ou você não está em uma conexão segura (HTTPS).");
      setIsLoading(false);
      return;
    }

    try {
      // Força parada de streams anteriores
      stopCamera();

      const constraints: MediaStreamConstraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Tenta dar play explicitamente
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.error("Play error:", playErr);
        }
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Não conseguimos acessar sua câmera. Verifique as permissões de privacidade.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Usa dimensões reais do vídeo
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Se for câmera frontal, espelha a imagem capturada também
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 right-8 z-[210]">
        <button onClick={onClose} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-xl aspect-[3/4] bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/5">
        {isLoading && !error && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
            <RefreshCw size={40} className="animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Lente...</p>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-black mb-3">Acesso Negado</h3>
            <p className="font-bold opacity-60 text-sm mb-8 leading-relaxed">{error}</p>
            <button 
              onClick={startCamera}
              className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Tentar Novamente
            </button>
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Captured" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            className="w-full h-full object-cover"
          />
        )}

        {!capturedImage && !error && !isLoading && (
          <div className="absolute inset-10 border-2 border-white/20 rounded-3xl pointer-events-none flex flex-col items-center justify-center">
             <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5"></div>
             <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/5"></div>
             <div className="mt-auto mb-6">
                <span className="text-[8px] font-black uppercase text-white/30 tracking-[0.5em]">Capture seu Documento</span>
             </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center gap-8">
        {!capturedImage && !error && !isLoading && (
          <>
            <button 
              onClick={toggleCamera}
              className="p-5 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-md active:scale-90"
              title="Trocar Câmera"
            >
              <FlipHorizontal size={24} />
            </button>

            <button 
              onClick={takePhoto}
              className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all border-[8px] border-white/10"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
                 <Camera className="text-white" size={28} />
              </div>
            </button>

            {/* Div para manter o equilíbrio visual do botão de troca */}
            <div className="w-[64px]"></div>
          </>
        )}

        {capturedImage && (
          <div className="flex gap-4 animate-in slide-in-from-bottom-4">
            <button 
              onClick={handleReset}
              className="px-10 py-5 bg-slate-800 text-white rounded-3xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-700"
            >
              <RotateCcw size={18} /> Repetir Foto
            </button>
            <button 
              onClick={handleConfirm}
              className="px-10 py-5 bg-emerald-500 text-white rounded-3xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-emerald-600 shadow-xl shadow-emerald-500/20"
            >
              <Check size={18} /> Usar esta Foto
            </button>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
