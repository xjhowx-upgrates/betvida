import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoPlayer({ betId, videoId, minutes = 1, onComplete }) {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [player, setPlayer] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Inicializar o player do YouTube quando o componente montar
  useEffect(() => {
    // Carregar a API do YouTube
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Criar o player quando a API estiver pronta
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
      setPlayer(newPlayer);
    };
    
    // Mostrar dica após 5 segundos
    const tipTimer = setTimeout(() => {
      setShowTip(true);
      
      // Esconder a dica após 5 segundos
      setTimeout(() => {
        setShowTip(false);
      }, 5000);
    }, 5000);

    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (player) {
        player.destroy();
      }
      clearTimeout(tipTimer);
    };
  }, [videoId]);

  const onPlayerReady = (event) => {
    event.target.playVideo();
    setIsLoading(false);
    
    // Adicionar listener para mostrar controles quando o mouse se move
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('touchstart', handleMouseMove);
      containerRef.current.addEventListener('mouseleave', () => setShowControls(false));
    }
    
    startProgressTracker();
  };
  
  // Função para mostrar os controles quando o mouse se move
  const handleMouseMove = () => {
    setShowControls(true);
    
    // Esconder os controles após 3 segundos de inatividade
    clearTimeout(window.controlsTimer);
    window.controlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const onPlayerStateChange = (event) => {
    // Estado 1 = reproduzindo
    if (event.data === 1) {
      setIsBuffering(false);
    }
    // Estado 3 = buffering
    else if (event.data === 3) {
      setIsBuffering(true);
    }
    // Estado 2 = pausado
    else if (event.data === 2) {
      // Mostrar controles quando pausado
      setShowControls(true);
    }
    // Estado 0 = finalizado
    else if (event.data === 0) {
      handleVideoComplete();
    }
  };

  const onPlayerError = (event) => {
    console.error("Erro do player do YouTube:", event.data);
    setIsError(true);
    setIsLoading(false);
  };

  const startProgressTracker = () => {
    if (!player) return;
    
    const interval = setInterval(() => {
      if (player && player.getCurrentTime && player.getDuration) {
        try {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          const calculatedProgress = (currentTime / duration) * 100;
          setProgress(calculatedProgress);
          
          // Animar a barra de progresso
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${calculatedProgress}%`;
          }

          // Verificar se o vídeo foi assistido pelo tempo mínimo necessário (em minutos)
          const requiredTime = minutes * 60; // converter minutos para segundos
          if (currentTime >= requiredTime && !isVideoComplete) {
            setIsVideoComplete(true);
            handleVideoComplete();
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Erro ao atualizar progresso:", err);
        }
      }
    }, 500); // Atualização mais frequente para animação mais suave

    return () => clearInterval(interval);
  };

  const handleVideoComplete = async () => {
    // Mostrar animação de conclusão
    setIsVideoComplete(true);
    
    if (user && betId) {
      try {
        // Atualizar o documento da aposta para marcar o vídeo como assistido
        const betRef = doc(db, "bets", betId);
        await updateDoc(betRef, {
          videoWatched: true
        });
        
        // Pequeno atraso para mostrar a animação de conclusão
        setTimeout(() => {
          // Chamar o callback de conclusão
          if (onComplete) {
            onComplete();
          }
        }, 1500);
      } catch (error) {
        console.error("Erro ao atualizar aposta:", error);
        setIsError(true);
        
        // Mesmo com erro, chamar o callback após um atraso
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 1500);
      }
    } else {
      // Se não houver usuário ou betId, apenas chamar o callback após um atraso
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1500);
    }
  };
  
  // Função para pausar/reproduzir o vídeo
  const togglePlayPause = () => {
    if (!player) return;
    
    const playerState = player.getPlayerState();
    if (playerState === 1) { // reproduzindo
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };
  
  // Função para mutar/desmutar o vídeo
  const toggleMute = () => {
    if (!player) return;
    
    if (player.isMuted()) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        ref={containerRef}
        className="relative w-full h-full max-w-4xl max-h-[80vh] rounded-lg overflow-hidden shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-16 h-16 border-4 border-t-red-600 border-r-red-600 border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <motion.p 
                className="text-white text-lg mt-4"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Carregando vídeo...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isError && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-red-600/90 rounded-full p-4 mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </motion.div>
              <motion.p className="text-white text-xl mb-2">Erro ao carregar o vídeo</motion.p>
              <motion.p className="text-white/70 text-base">Tente novamente mais tarde</motion.p>
              <motion.button
                className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
              >
                Fechar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {isBuffering && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="w-12 h-12 border-4 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div id="youtube-player" className="w-full h-full"></div>
        
        <AnimatePresence>
          {isVideoComplete && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-green-500 rounded-full p-5 mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </motion.div>
              <motion.p 
                className="text-white text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Vídeo Concluído!
              </motion.p>
              <motion.p 
                className="text-white/80 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Obrigado por assistir
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showTip && (
            <motion.div 
              className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p className="text-sm">Assista o vídeo completo para continuar</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showControls && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center justify-between mb-2">
                <motion.button 
                  className="text-white p-2 rounded-full hover:bg-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                </motion.button>
                
                <motion.button 
                  className="text-white p-2 rounded-full hover:bg-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                      <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  )}
                </motion.button>
                
                <motion.div className="text-white text-sm">
                  {Math.floor(progress)}%
                </motion.div>
                
                <motion.button 
                  className="text-white p-2 rounded-full hover:bg-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onComplete}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.button>
              </div>
              
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  ref={progressBarRef}
                  className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  initial={{ width: "0%" }}
                  transition={{ type: "tween" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
