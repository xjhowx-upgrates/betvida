import React, { useState } from "react";
import BetModal from "../BetModal";
import VideoPlayer from "../VideoPlayer";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function FortuneTiger() {
  const [user] = useAuthState(auth);
  const [showBetModal, setShowBetModal] = useState(false);
  const [betResult, setBetResult] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Dados do jogo
  const gameData = {
    id: "fortune_tiger",
    name: "Fortune Tiger",
    description: "Slot inspirado em tigres da sorte",
    image: "https://static.wikia.nocookie.net/slot/images/2/2d/FortuneTiger.png"
  };
  
  // Lidar com o resultado da aposta
  const handleBetComplete = (result) => {
    setBetResult(result);
    setShowBetModal(false);
    
    // Adicionar animação de vitória se ganhou
    if (result && result.win) {
      // A animação será controlada pelo estado betResult
    }
  };
  
  // Lidar com o fim do vídeo
  const handleVideoComplete = () => {
    setBetResult(null);
  };
  
  return (
    <>
      <motion.div 
        className="bg-white/90 rounded-xl p-4 flex flex-col items-center shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)" }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        <motion.div
          className="relative"
          animate={isHovering ? { rotate: [0, -5, 5, -5, 0] } : {}}
          transition={{ duration: 1, repeat: isHovering ? Infinity : 0, repeatType: "loop" }}
        >
          <motion.img 
            src={gameData.image} 
            alt={gameData.name} 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-2" 
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
          />
          {betResult && betResult.win && (
            <motion.div 
              className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              WIN!
            </motion.div>
          )}
        </motion.div>
        <h3 className="font-bold text-indigo-900 text-base sm:text-lg">{gameData.name}</h3>
        <motion.button 
          onClick={() => user ? setShowBetModal(true) : alert("Faça login para apostar")}
          className="mt-2 px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold w-full sm:w-auto shadow-md"
          whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(79, 70, 229, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Apostar
        </motion.button>
      </motion.div>
      
      <AnimatePresence>
        {showBetModal && (
          <BetModal 
            gameId="fortune_tiger"
            gameName="Fortune Tiger"
            onClose={() => setShowBetModal(false)} 
            onBetResult={handleBetComplete}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {betResult && betResult.requiresVideo && betResult.video && (
          <VideoPlayer 
            video={betResult.video}
            onComplete={handleVideoComplete}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {betResult && betResult.win && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleVideoComplete}
          >
            <motion.div 
              className="bg-white rounded-xl p-6 flex flex-col items-center max-w-sm mx-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 12 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.img 
                src={gameData.image} 
                alt={gameData.name} 
                className="w-32 h-32 object-contain mb-4 pulse-animation" 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 5, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  repeatType: "loop" 
                }}
              />
              <motion.h2 
                className="text-2xl font-bold text-green-600 mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Você Ganhou!
              </motion.h2>
              <p className="text-gray-700 mb-4 text-center">
                Parabéns! Você ganhou {betResult.amount} minutos no Fortune Tiger.
              </p>
              <motion.button
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 4px 8px rgba(34, 197, 94, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVideoComplete}
              >
                Continuar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
