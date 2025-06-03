import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import BetModal from "../BetModal";
import VideoPlayer from "../VideoPlayer";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

export default function FortuneOx() {
  const [user] = useAuthState(auth);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [betResult, setBetResult] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showResult, setShowResult] = useState(false);
  
  const controls = useAnimation();
  const imageControls = useAnimation();
  
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
      if (result.win) {
        // Mostrar animação de vitória
        setShowResult(true);
        
        // Animar a imagem
        imageControls.start({ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 5, 0],
          transition: { duration: 1.5 }
        });
        
        // Esconder resultado após 4 segundos
        setTimeout(() => {
          setShowResult(false);
        }, 4000);
      } else if (result.requiresVideo) {
        // Pequena pausa antes de mostrar o vídeo
        setTimeout(() => {
          setSelectedVideo(result.video);
          setShowVideo(true);
        }, 800);
      }
    }
  };

  const handleVideoComplete = () => {
    setShowVideo(false);
    setSelectedVideo(null);
    setBetResult(null);
    setShowResult(false);
  };
  
  // Efeito para animação contínua da imagem quando hover
  useEffect(() => {
    if (isHovering) {
      imageControls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity }
      });
    } else {
      imageControls.stop();
      imageControls.set({ scale: 1 });
    }
  }, [isHovering, imageControls]);

  return (
    <div className="relative">
      <motion.div 
        className="bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-lg border border-white/20 text-center overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 12 }}
        whileHover={{ boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)" }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        <motion.h2 
          className="text-xl sm:text-2xl font-bold mb-3"
          animate={isHovering ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-amber-600">Fortune Ox</span>
        </motion.h2>
        <motion.div 
          className="aspect-square sm:aspect-[4/3] bg-gradient-to-br from-red-100 to-amber-50 rounded-lg overflow-hidden relative mb-4 shadow-md"
          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(220, 38, 38, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-amber-700/30 z-10"
            animate={{ opacity: isHovering ? 0.8 : 0.6 }}
            transition={{ duration: 0.5 }}
          />
          
          <motion.img 
            src="https://img.cacaniqueisonline.com/wp-content/uploads/2023/05/fortune-ox.jpg" 
            alt="Fortune Ox"
            className="w-full h-full object-cover"
            animate={imageControls}
            initial={{ scale: 1 }}
          />
          
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            onClick={handleOpenBetModal}
          >
            <motion.div 
              className="flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.p 
                className="text-white text-base sm:text-xl font-bold bg-gradient-to-r from-red-800/80 to-amber-800/80 px-5 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: isHovering ? ["0 5px 15px rgba(220, 38, 38, 0.3)", "0 8px 25px rgba(220, 38, 38, 0.6)", "0 5px 15px rgba(220, 38, 38, 0.3)"] : "0 5px 15px rgba(220, 38, 38, 0.3)"
                }}
                transition={{ repeat: isHovering ? Infinity : 0, duration: 1.5 }}
              >
                <motion.span className="flex items-center">
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
                    animate={{ rotate: isHovering ? [0, 360] : 0 }}
                    transition={{ repeat: isHovering ? Infinity : 0, duration: 2 }}
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </motion.svg>
                  Jogar Agora
                </motion.span>
              </motion.p>
            </motion.div>
          </motion.div>
          
          {betResult && betResult.win && (
            <motion.div 
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 backdrop-blur-sm text-white text-lg sm:text-xl font-bold rounded-xl px-6 py-3 shadow-lg border border-white/20"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [-10, 10, 0],
                  y: [0, -10, 0]
                }}
                transition={{ duration: 0.8, times: [0, 0.6, 1] }}
              >
                <motion.span 
                  className="flex items-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="mr-2"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </motion.svg>
                  VITÓRIA!
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        <motion.button
          onClick={handleOpenBetModal}
          className="bg-gradient-to-r from-red-600 to-amber-600 text-white px-6 py-3 rounded-lg font-medium shadow-md relative overflow-hidden group w-full sm:w-auto"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
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
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
              <line x1="16" y1="8" x2="2" y2="22"></line>
              <line x1="17.5" y1="15" x2="9" y2="15"></line>
            </motion.svg>
            Apostar
          </motion.span>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showBetModal && (
          <BetModal 
            onClose={() => setShowBetModal(false)} 
            gameId="fortune_ox"
            gameName="Fortune Ox"
            onBetResult={handleBetResult}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideo && selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onComplete={handleVideoComplete}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showResult && betResult && betResult.win && !showVideo && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleVideoComplete}
          >
            <motion.div 
              className="bg-gradient-to-br from-red-500/90 to-amber-700/90 rounded-2xl p-8 flex flex-col items-center max-w-sm mx-4 shadow-2xl border border-white/20"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.7, 1.1, 1],
                opacity: 1,
                rotate: [0, 5, 0]
              }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
              onClick={e => e.stopPropagation()}
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
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 1, repeat: 1 }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </motion.svg>
              </motion.div>
              
              <motion.div 
                className="relative mb-4"
              >
                <motion.img 
                  src="https://img.cacaniqueisonline.com/wp-content/uploads/2023/05/fortune-ox.jpg" 
                  alt="Fortune Ox" 
                  className="w-40 h-40 object-cover rounded-xl shadow-lg border-2 border-white/30" 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                
                <motion.div 
                  className="absolute -top-3 -right-3 bg-amber-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  +{betResult.amount}
                </motion.div>
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-bold text-white mb-2 text-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 1, duration: 0.5 }}
              >
                Você Ganhou!
              </motion.h2>
              
              <motion.p 
                className="text-white/90 text-lg mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Parabéns! Você ganhou {betResult.amount} moedas no Fortune Ox.
              </motion.p>
              
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg relative overflow-hidden group"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVideoComplete}
              >
                <motion.span 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <motion.span className="relative flex items-center">
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
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </motion.svg>
                  Continuar
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
