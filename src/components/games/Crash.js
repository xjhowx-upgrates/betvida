import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import BetModal from "../BetModal";
import VideoPlayer from "../VideoPlayer";

export default function Crash() {
  const [user] = useAuthState(auth);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [crashValue, setCrashValue] = useState(1.00);
  const [isCrashed, setIsCrashed] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [betResult, setBetResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [crashHistory, setCrashHistory] = useState([1.35, 2.50, 1.10, 3.75, 1.25]);
  
  const animationRef = useRef(null);
  const controls = useAnimation();
  const pathControls = useAnimation();
  
  const handleOpenBetModal = () => {
    if (user) {
      setShowBetModal(true);
    } else {
      alert("Faça login para apostar!");
    }
  };

  const handleBetResult = (result) => {
    setShowBetModal(false);
    setBetResult(result);
    
    if (result) {
      setShowDemo(true);
      
      if (result.win) {
        // Mostrar animação de vitória
        startCrashAnimation(result.win, result.amount);
        setShowResult(true);
        
        // Esconder resultado após 3 segundos
        setTimeout(() => {
          setShowResult(false);
        }, 3000);
      } else if (result.requiresVideo) {
        // Mostrar animação de derrota e depois vídeo
        startCrashAnimation(result.win, result.amount, () => {
          setShowResult(true);
          
          // Mostrar resultado por 2.5 segundos antes do vídeo
          setTimeout(() => {
            setShowResult(false);
            setSelectedVideo(result.video);
            setShowVideo(true);
          }, 2500);
        });
      }
    }
  };

  const handleVideoComplete = () => {
    setShowVideo(false);
    setSelectedVideo(null);
    setBetResult(null);
  };
  
  // Limpar resultado quando não estiver sendo exibido
  useEffect(() => {
    if (!showResult && !showVideo) {
      const timer = setTimeout(() => {
        setBetResult(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showResult, showVideo]);

  const startCrashAnimation = (isWin, betAmount, callback) => {
    setIsAnimating(true);
    setIsCrashed(false);
    setCrashValue(1.00);
    
    let startTime = Date.now();
    let duration = isWin ? 5000 : 2000; // Duração mais longa para vitórias
    let maxMultiplier = isWin ? (betAmount / 10) + 2.5 : 1.2; // Multiplier baseado na aposta para vitórias
    maxMultiplier = Math.max(2.5, maxMultiplier); // Garantir um mínimo de 2.5x para vitórias
    
    // Resetar controles de animação
    controls.set({ scale: 1, rotate: 0 });
    pathControls.set({ pathLength: 0 });
    
    // Iniciar animação do caminho
    pathControls.start({ 
      pathLength: 1, 
      transition: { duration: duration / 1000, ease: "easeOut" } 
    });
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (isWin) {
        // Curva exponencial suave para vitórias
        const multiplier = 1 + (Math.pow(progress, 1.5) * (maxMultiplier - 1));
        setCrashValue(parseFloat(multiplier.toFixed(2)));
        
        // Adicionar pequenas oscilações para parecer mais orgânico
        if (progress > 0.7) {
          const oscillation = Math.sin(progress * 20) * 0.05;
          setCrashValue(prev => parseFloat((prev + oscillation).toFixed(2)));
        }
      } else {
        // Curva que sobe e depois cai rapidamente para derrotas
        const curve = Math.sin(progress * Math.PI);
        const multiplier = 1 + (curve * 0.2);
        setCrashValue(parseFloat(multiplier.toFixed(2)));
        
        if (progress >= 0.8) {
          setIsCrashed(true);
          // Animar o crash com shake
          controls.start({ 
            rotate: [0, -2, 2, -2, 0],
            transition: { duration: 0.5, times: [0, 0.25, 0.5, 0.75, 1] }
          });
        }
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        if (!isWin) {
          setIsCrashed(true);
          // Animar o crash final
          controls.start({ 
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, -3, 3, -3, 0],
            transition: { duration: 0.8 }
          });
        } else {
          // Animar vitória
          controls.start({ 
            scale: [1, 1.1, 1],
            transition: { duration: 0.5, repeat: 1 }
          });
          
          // Adicionar ao histórico
          setCrashHistory(prev => [crashValue, ...prev.slice(0, 4)]);
        }
        
        if (callback) setTimeout(callback, 1000);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Limpar animação ao desmontar
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleDemoClick = () => {
    setShowDemo(true);
    startCrashAnimation(Math.random() > 0.5, 10);
  };

  return (
    <div className="relative">
      <motion.div 
        className="bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-lg border border-white/20 text-center overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 12 }}
        whileHover={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}
      >
        <motion.h2 
          className="text-xl sm:text-2xl font-bold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Crash</span>
        </motion.h2>
        
        {/* Histórico de crashes */}
        <motion.div 
          className="flex justify-center gap-2 mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {crashHistory.map((value, index) => (
            <motion.div 
              key={index}
              className={`text-xs font-mono px-2 py-1 rounded-full ${value >= 2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + (index * 0.1) }}
              whileHover={{ scale: 1.1 }}
            >
              {value.toFixed(2)}x
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
          className="aspect-square sm:aspect-[4/3] bg-gradient-to-b from-blue-900 to-black rounded-lg overflow-hidden relative mb-4 shadow-md"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          whileHover={{ scale: 1.02 }}
          onClick={() => !isAnimating && handleDemoClick()}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          {!showDemo ? (
            <>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"
                animate={{ opacity: isHovering ? 0.8 : 0.5 }}
              />
              
              <motion.img 
                src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png" 
                alt="Crash"
                className="w-1/3 h-1/3 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                initial={{ scale: 1 }}
                animate={{ 
                  scale: isHovering ? [1, 1.1, 1] : 1,
                  rotate: isHovering ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 1.5, repeat: isHovering ? Infinity : 0 }}
              />
              
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.p 
                  className="text-white text-lg sm:text-xl font-bold drop-shadow-lg bg-blue-900/50 px-4 py-2 rounded-lg backdrop-blur-sm"
                  animate={{ 
                    scale: isHovering ? 1.1 : 1,
                    y: isHovering ? [-2, 2, -2] : 0
                  }}
                  transition={{ duration: 1.5, repeat: isHovering ? Infinity : 0 }}
                >
                  Clique para demonstração
                </motion.p>
              </motion.div>
            </>
          ) : (
            <motion.div 
              className="p-4 h-full flex flex-col items-center justify-center text-white relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Fundo animado */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-black/90 z-0"
                animate={{ 
                  background: isCrashed 
                    ? ["linear-gradient(to bottom, rgba(30,58,138,0.7) 0%, rgba(0,0,0,0.9) 100%)", "linear-gradient(to bottom, rgba(220,38,38,0.7) 0%, rgba(0,0,0,0.9) 100%)"] 
                    : ["linear-gradient(to bottom, rgba(30,58,138,0.7) 0%, rgba(0,0,0,0.9) 100%)", "linear-gradient(to bottom, rgba(30,58,138,0.8) 0%, rgba(0,0,0,0.95) 100%)"] 
                }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              />
              
              <AnimatePresence>
                {isAnimating && (
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <motion.div 
                      className={`text-4xl sm:text-6xl font-bold mb-2 sm:mb-4 z-10`}
                      animate={controls}
                      style={{ 
                        textShadow: isCrashed 
                          ? "0 0 10px rgba(239, 68, 68, 0.7)" 
                          : "0 0 10px rgba(74, 222, 128, 0.7)" 
                      }}
                    >
                      <span className={isCrashed ? 'text-red-500' : 'text-green-400'}>
                        {crashValue}x
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      className="w-full max-w-64 h-28 sm:h-36 relative z-10"
                      style={{ overflow: 'hidden' }}
                    >
                      <svg viewBox="0 0 100 50" className="w-full h-full">
                        {/* Linhas de grade */}
                        {[1, 1.5, 2, 2.5, 3].map((level, index) => (
                          <motion.line 
                            key={index}
                            x1="0" 
                            y1={50 - (level - 1) * 50} 
                            x2="100" 
                            y2={50 - (level - 1) * 50}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                          />
                        ))}
                        
                        {/* Linha principal */}
                        <motion.path
                          d={`M 0,50 Q 50,${50 - (crashValue - 1) * 50} 100,50`}
                          fill="none"
                          stroke={isCrashed ? "#ef4444" : "#4ade80"}
                          strokeWidth="3"
                          strokeLinecap="round"
                          animate={pathControls}
                          filter="drop-shadow(0 0 3px rgba(255,255,255,0.5))"
                        />
                      </svg>
                      
                      {/* Ponto indicador */}
                      <motion.div 
                        className={`absolute w-5 h-5 rounded-full flex items-center justify-center ${isCrashed ? 'bg-red-500' : 'bg-green-400'}`}
                        style={{ 
                          top: `${50 - (crashValue - 1) * 50}%`,
                          right: '0%',
                          transform: 'translate(50%, 50%)',
                          boxShadow: isCrashed 
                            ? '0 0 10px rgba(239, 68, 68, 0.7)' 
                            : '0 0 10px rgba(74, 222, 128, 0.7)'
                        }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                      
                      {/* Valores na lateral */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/60 font-mono">
                        {[3, 2.5, 2, 1.5, 1].map((value, index) => (
                          <div key={index} className="flex items-center">
                            <span className="mr-1">{value}x</span>
                            <div className="w-1 h-px bg-white/20" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    
                    {isCrashed && (
                      <motion.div 
                        className="text-red-500 font-bold text-xl sm:text-2xl mt-2 z-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: [1, 1.3, 1],
                          textShadow: ["0 0 5px rgba(239, 68, 68, 0.5)", "0 0 20px rgba(239, 68, 68, 0.8)", "0 0 5px rgba(239, 68, 68, 0.5)"]
                        }}
                        transition={{ duration: 1, repeat: 2 }}
                      >
                        CRASH!
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!isAnimating && (
                <motion.button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md z-10 relative overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDemoClick();
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <motion.span 
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span className="relative flex items-center justify-center">
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="mr-2"
                      animate={{ rotate: [0, 360] }}
                      transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m8 12 3 3 5-5"></path>
                    </motion.svg>
                    Jogar Demo
                  </motion.span>
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>
        
        <motion.button
          onClick={handleOpenBetModal}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium shadow-md relative overflow-hidden group w-full sm:w-auto"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          disabled={isAnimating}
        >
          <motion.span 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
          
          <motion.span className="relative flex items-center justify-center">
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mr-2"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
            >
              <path d="M12 2v8"></path>
              <path d="m4.93 10.93 1.41 1.41"></path>
              <path d="M2 18h2"></path>
              <path d="M20 18h2"></path>
              <path d="m19.07 10.93-1.41 1.41"></path>
              <path d="M22 22H2"></path>
              <path d="m16 6-4 4-4-4"></path>
              <path d="M16 18a4 4 0 0 0-8 0"></path>
            </motion.svg>
            Apostar
          </motion.span>
        </motion.button>
      </motion.div>

      {/* Animação de resultado da aposta */}
      <AnimatePresence>
        {showResult && betResult && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={`p-8 rounded-2xl flex flex-col items-center justify-center ${betResult.win ? 'bg-gradient-to-br from-green-500/90 to-emerald-700/90' : 'bg-gradient-to-br from-red-500/90 to-rose-700/90'} shadow-2xl border border-white/20`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.7, 1.1, 1],
                opacity: 1,
                rotate: [0, betResult.win ? 5 : -5, 0]
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <motion.div 
                className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  boxShadow: ["0 0 0 0 rgba(255,255,255,0.4)", "0 0 0 20px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0)"]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="64" 
                  height="64" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-white"
                  animate={{ 
                    rotate: betResult.win ? [0, 360] : [0, -15, 15, -15, 15, 0],
                    scale: betResult.win ? [1, 1.2, 1] : [1, 0.9, 1, 0.9, 1]
                  }}
                  transition={{ duration: betResult.win ? 1 : 0.5, repeat: 1 }}
                >
                  {betResult.win ? (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </>
                  )}
                </motion.svg>
              </motion.div>
              
              <motion.h3 
                className="text-3xl font-bold text-white mb-2 text-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 1, duration: 0.5 }}
              >
                {betResult.win ? "Você Ganhou!" : "Você Perdeu!"}
              </motion.h3>
              
              <motion.p 
                className="text-white/90 text-lg mb-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {betResult.win 
                  ? `+${betResult.amount} moedas` 
                  : betResult.requiresVideo 
                    ? "Assista o vídeo para continuar" 
                    : "Tente novamente"}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de aposta */}
      <AnimatePresence>
        {showBetModal && (
          <BetModal 
            onClose={() => setShowBetModal(false)} 
            gameId="crash"
            gameName="Crash"
            onBetResult={handleBetResult}
          />
        )}
      </AnimatePresence>

      {/* Player de vídeo */}
      <AnimatePresence>
        {showVideo && selectedVideo && (
          <VideoPlayer
            betId={selectedVideo.id}
            videoId={selectedVideo.videoId}
            minutes={selectedVideo.minutes || 1}
            onComplete={handleVideoComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
