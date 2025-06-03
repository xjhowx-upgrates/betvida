import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import BetModal from "../BetModal";
import VideoPlayer from "../VideoPlayer";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

export default function FortuneDragon() {
  const [user] = useAuthState(auth);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [betResult, setBetResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  
  const dragonControls = useAnimation();
  const buttonControls = useAnimation();
  const imageRef = useRef(null);
  
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
      // Animar o dragão
      dragonControls.start({ 
        scale: [1, result.win ? 1.2 : 0.95, 1],
        rotate: result.win ? [0, 5, -5, 0] : [0, -3, 3, -3, 0],
        filter: result.win ? ["brightness(1)", "brightness(1.3)", "brightness(1)"] : ["brightness(1)", "brightness(0.7)", "brightness(1)"],
        transition: { duration: 1.2 }
      });
      
      setShowResult(true);
      
      // Se necessário mostrar vídeo
      if (result.requiresVideo) {
        setTimeout(() => {
          setShowResult(false);
          setSelectedVideo(result.video);
          setShowVideo(true);
        }, 3000); // Mostrar resultado por 3 segundos antes do vídeo
      } else {
        // Esconder resultado após 4 segundos se não tiver vídeo
        setTimeout(() => {
          setShowResult(false);
        }, 4000);
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
  
  // Efeito para animação contínua do dragão quando hover
  useEffect(() => {
    if (isHovering) {
      dragonControls.start({
        scale: [1, 1.05, 1],
        filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"],
        transition: { duration: 3, repeat: Infinity }
      });
    } else {
      dragonControls.stop();
      dragonControls.set({ scale: 1, filter: "brightness(1)" });
    }
  }, [isHovering, dragonControls]);
  
  // Efeito para animação do botão quando hover
  useEffect(() => {
    if (isButtonHovered) {
      buttonControls.start({
        boxShadow: ["0 5px 15px rgba(220, 38, 38, 0.3)", "0 8px 25px rgba(220, 38, 38, 0.6)", "0 5px 15px rgba(220, 38, 38, 0.3)"],
        transition: { duration: 1.5, repeat: Infinity }
      });
    } else {
      buttonControls.stop();
      buttonControls.set({ boxShadow: "0 5px 15px rgba(220, 38, 38, 0.3)" });
    }
  }, [isButtonHovered, buttonControls]);
  
  // Efeito para criar partículas de fogo quando hover
  const createFireParticle = () => {
    if (!imageRef.current || !isHovering) return;
    
    const container = imageRef.current;
    const particle = document.createElement('div');
    particle.className = 'absolute w-2 h-2 bg-amber-500 rounded-full opacity-80 z-20';
    
    // Posição aleatória na parte inferior da imagem
    const x = Math.random() * container.offsetWidth;
    particle.style.left = `${x}px`;
    particle.style.bottom = '0px';
    
    container.appendChild(particle);
    
    // Animação da partícula
    const animation = particle.animate([
      { transform: `translate(0, 0) scale(1)`, opacity: 0.8 },
      { transform: `translate(${(Math.random() - 0.5) * 20}px, -${Math.random() * 100 + 50}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => {
      particle.remove();
    };
  };
  
  useEffect(() => {
    let interval;
    if (isHovering && imageRef.current) {
      interval = setInterval(createFireParticle, 100);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [isHovering]);

  return (
    <div className="relative">
      <motion.div 
        className="bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 text-center overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 12 }}
        whileHover={{ boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)" }}
      >
        <motion.h2 
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <motion.span 
            className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-amber-500 to-red-600 inline-block"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          >
            Fortune Dragon
          </motion.span>
        </motion.h2>
        
        <motion.div 
          ref={imageRef}
          className="aspect-[9/16] sm:aspect-[4/3] bg-gradient-to-br from-red-900/20 to-amber-800/20 rounded-lg overflow-hidden relative mb-4 shadow-xl border border-amber-500/30"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(220, 38, 38, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          onClick={handleOpenBetModal}
        >
          {/* Overlay de gradiente animado */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-amber-800/40 to-red-700/30 z-10"
            animate={{ 
              opacity: isHovering ? [0.7, 0.8, 0.7] : 0.6,
              background: isHovering ? 
                ["linear-gradient(to top, rgba(153, 27, 27, 0.8), rgba(217, 119, 6, 0.4), rgba(153, 27, 27, 0.3))", 
                 "linear-gradient(to top, rgba(153, 27, 27, 0.8), rgba(217, 119, 6, 0.5), rgba(153, 27, 27, 0.3))",
                 "linear-gradient(to top, rgba(153, 27, 27, 0.8), rgba(217, 119, 6, 0.4), rgba(153, 27, 27, 0.3))"] : 
                "linear-gradient(to top, rgba(153, 27, 27, 0.8), rgba(217, 119, 6, 0.4), rgba(153, 27, 27, 0.3))" 
            }}
            transition={{ duration: 2, repeat: isHovering ? Infinity : 0 }}
          />
          
          {/* Efeito de fogo na base */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-amber-600/40 to-transparent z-5"
            animate={{ 
              height: isHovering ? ["30%", "35%", "30%"] : "30%",
              opacity: isHovering ? [0.4, 0.6, 0.4] : 0.4
            }}
            transition={{ duration: 1.5, repeat: isHovering ? Infinity : 0 }}
          />
          
          {/* Imagem do dragão */}
          <motion.img 
            src="https://www.askgamblers.com/uploads/slot_screenshot/gamereview_screenshot/98/9b/65/dd95c0782c9e4b4c9e3e5f2c5a8e1c5a.webp" 
            alt="Fortune Dragon"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={dragonControls}
            transition={{ duration: 0.4 }}
          />
          
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="flex items-center justify-center mb-3"
              animate={{ y: isHovering ? [0, -8, 0] : 0 }}
              transition={{ duration: 2, repeat: isHovering ? Infinity : 0 }}
            >
              <motion.div 
                className="text-white text-base sm:text-xl font-bold bg-gradient-to-r from-red-800/80 to-amber-800/80 px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-white/10 flex items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={buttonControls}
                onHoverStart={() => setIsButtonHovered(true)}
                onHoverEnd={() => setIsButtonHovered(false)}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="mr-2"
                  animate={{ 
                    rotate: isHovering ? [0, 360] : 0,
                    fill: isButtonHovered ? "rgba(255,255,255,0.2)" : "none"
                  }}
                  transition={{ 
                    rotate: { repeat: isHovering ? Infinity : 0, duration: 2 },
                    fill: { duration: 0.3 }
                  }}
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m12 15 3-3-3-3"></path>
                  <path d="M9 12h6"></path>
                </motion.svg>
                Jogar Agora
              </motion.div>
            </motion.div>
            
            {/* Efeito de brilho pulsante */}
            <motion.div 
              className="absolute inset-0 bg-amber-500/0 rounded-lg z-5"
              animate={{ 
                boxShadow: isHovering ? 
                  ["inset 0 0 20px 10px rgba(245, 158, 11, 0)", 
                   "inset 0 0 50px 10px rgba(245, 158, 11, 0.2)", 
                   "inset 0 0 20px 10px rgba(245, 158, 11, 0)"] : 
                  "inset 0 0 0px 0px rgba(245, 158, 11, 0)"
              }}
              transition={{ duration: 2, repeat: isHovering ? Infinity : 0 }}
            />
          </motion.div>
        </motion.div>
        
        <motion.button
          onClick={handleOpenBetModal}
          className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-6 py-3 rounded-lg font-medium shadow-md relative overflow-hidden group w-full sm:w-auto"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          disabled={showBetModal}
        >
          <motion.span 
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-500 to-amber-500 opacity-0 group-hover:opacity-100"
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
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m8 14 2 2 6-6"></path>
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
              className={`p-8 rounded-2xl flex flex-col items-center justify-center ${betResult.win ? 'bg-gradient-to-br from-green-500/90 to-emerald-700/90' : 'bg-gradient-to-br from-red-500/90 to-rose-700/90'} shadow-2xl border border-white/20 backdrop-blur-md`}
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
            gameId="fortune_dragon"
            gameName="Fortune Dragon"
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
