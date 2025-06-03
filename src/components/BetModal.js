import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { betService, videoService } from "../services/firestoreService";

export default function BetModal({ gameId, gameName, onClose, onBetResult }) {
  const [minutes, setMinutes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Função para processar a aposta
  const handleBet = async () => {
    if (minutes < 1) {
      setError("Aposte pelo menos 1 minuto");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Criar aposta no Firestore
      const betRef = await betService.createBet(gameId, minutes);
      
      // Simular processamento (para efeito visual)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular resultado da aposta (aleatório)
      const win = Math.random() > 0.6; // 40% de chance de ganhar
      
      // Se perdeu, buscar vídeo para assistir
      let video = null;
      if (!win) {
        video = await videoService.getRandomVideo(minutes);
      }
      
      // Atualizar resultado da aposta
      await betService.updateBetResult(betRef.id, win, video?.id);
      
      // Mostrar resultado
      setResult({ 
        win, 
        amount: minutes,
        requiresVideo: !win && !!video,
        video: video
      });
    } catch (err) {
      console.error("Erro ao processar aposta:", err);
      setError("Erro ao processar sua aposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        className="bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-6 max-w-md w-full shadow-lg border border-white/20"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
        style={{ width: "95%", maxWidth: "450px" }}
      >
        <div className="flex justify-between items-center mb-4">
          <motion.h2 
            className="text-lg sm:text-xl font-bold text-indigo-900"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {gameName}
          </motion.h2>
          <motion.button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full"
            whileHover={{ backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.9 }}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            &times;
          </motion.button>
        </div>
        
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="bet-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <motion.p 
                  className="mb-4 text-gray-700 text-sm sm:text-base"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Quanto tempo da sua vida você quer apostar?
                </motion.p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
                  <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                    <motion.button 
                      onClick={() => setMinutes(Math.max(1, minutes - 5))}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg w-10 h-10 flex items-center justify-center text-lg font-bold"
                      whileHover={{ backgroundColor: "#e0e7ff", scale: 1.05 }}
                      whileTap={{ scale: 0.95, backgroundColor: "#c7d2fe" }}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      -5
                    </motion.button>
                    
                    <motion.button 
                      onClick={() => setMinutes(Math.max(1, minutes - 1))}
                      className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-lg w-10 h-10 flex items-center justify-center text-lg font-bold"
                      whileHover={{ backgroundColor: "#c7d2fe", scale: 1.05 }}
                      whileTap={{ scale: 0.95, backgroundColor: "#a5b4fc" }}
                      initial={{ x: -5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      -
                    </motion.button>
                    
                    <motion.div 
                      className="relative w-24"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <input
                        type="number"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full text-center border-2 border-indigo-200 focus:border-indigo-500 rounded-lg py-2 text-xl font-bold outline-none"
                        min="1"
                      />
                      <motion.div 
                        className="absolute -bottom-1 left-0 right-0 h-1 bg-indigo-500 rounded-full"
                        initial={{ scaleX: 0, width: 0 }}
                        animate={{ scaleX: Math.min(1, minutes / 60), width: "100%" }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                      />
                    </motion.div>
                    
                    <motion.button 
                      onClick={() => setMinutes(minutes + 1)}
                      className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-lg w-10 h-10 flex items-center justify-center text-lg font-bold"
                      whileHover={{ backgroundColor: "#c7d2fe", scale: 1.05 }}
                      whileTap={{ scale: 0.95, backgroundColor: "#a5b4fc" }}
                      initial={{ x: 5, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      +
                    </motion.button>
                    
                    <motion.button 
                      onClick={() => setMinutes(minutes + 5)}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg w-10 h-10 flex items-center justify-center text-lg font-bold"
                      whileHover={{ backgroundColor: "#e0e7ff", scale: 1.05 }}
                      whileTap={{ scale: 0.95, backgroundColor: "#c7d2fe" }}
                      initial={{ x: 10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      +5
                    </motion.button>
                  </div>
                  <motion.span 
                    className="text-gray-600 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    minutos
                  </motion.span>
                </div>
                
                <motion.div 
                  className="flex justify-center gap-2 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button
                    onClick={() => setMinutes(5)}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"
                    whileHover={{ backgroundColor: "#e0e7ff", scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    5 min
                  </motion.button>
                  <motion.button
                    onClick={() => setMinutes(10)}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"
                    whileHover={{ backgroundColor: "#e0e7ff", scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    10 min
                  </motion.button>
                  <motion.button
                    onClick={() => setMinutes(30)}
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"
                    whileHover={{ backgroundColor: "#e0e7ff", scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    30 min
                  </motion.button>
                </motion.div>
                
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      className="text-red-500 text-sm mt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center mt-6">
                <motion.button
                  onClick={handleBet}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-semibold shadow-md ${loading ? 'bg-gray-400' : 'bg-indigo-600'}`}
                  whileHover={!loading ? { scale: 1.02, boxShadow: "0 6px 12px rgba(79, 70, 229, 0.3)" } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  {loading ? (
                    <motion.div 
                      className="flex justify-center items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div 
                        className="rounded-full h-5 w-5 border-t-2 border-b-2 border-white"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      ></motion.div>
                      <span className="ml-2">Processando...</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Apostar
                    </motion.span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="bet-result"
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className={`text-2xl font-bold mb-4 text-center ${result.win ? 'text-green-500' : 'text-red-500'}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  damping: 10, 
                  delay: 0.1,
                  duration: 0.5 
                }}
              >
                <motion.div
                  className="relative inline-flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: result.win ? [0, 5, -5, 5, 0] : [0, -5, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {result.win && (
                    <motion.div 
                      className="absolute -inset-4 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.2, 0],
                        scale: [0.8, 1.5, 0.8],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }}
                      style={{ background: "radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, rgba(255, 255, 255, 0) 70%)" }}
                    />
                  )}
                  
                  {!result.win && (
                    <motion.div 
                      className="absolute -inset-4 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: [0, 0.2, 0],
                        scale: [0.8, 1.5, 0.8],
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }}
                      style={{ background: "radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(255, 255, 255, 0) 70%)" }}
                    />
                  )}
                  
                  {result.win ? 'VOCÊ GANHOU!' : 'VOCÊ PERDEU!'}
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {result.win ? (
                  <div className="mb-6">
                    <motion.p 
                      className="mb-2 text-lg"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Parabéns! Você ganhou
                    </motion.p>
                    <motion.p 
                      className="text-3xl font-bold text-green-500"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    >
                      +{result.amount} minutos de vida!
                    </motion.p>
                  </div>
                ) : (
                  <div className="mt-6">
                    <motion.p 
                      className="mb-2 text-lg"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Você perdeu
                    </motion.p>
                    <motion.p 
                      className="text-3xl font-bold text-red-500"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    >
                      {result.amount} minutos da sua vida
                    </motion.p>
                    {result.requiresVideo && (
                      <motion.p 
                        className="mt-2 text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        Agora você precisa assistir a um vídeo
                      </motion.p>
                    )}
                  </div>
                )}
                
                <motion.button
                  onClick={() => onBetResult(result)}
                  className={`w-full sm:w-auto px-6 py-3 font-semibold rounded-lg shadow-md transition ${
                    result.win 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}
                  whileHover={{ scale: 1.05, boxShadow: result.win ? "0 8px 16px rgba(34, 197, 94, 0.5)" : "0 8px 16px rgba(239, 68, 68, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={result.win ? {
                    y: 0, 
                    opacity: 1,
                    boxShadow: ["0 4px 6px rgba(34, 197, 94, 0.2)", "0 8px 16px rgba(34, 197, 94, 0.5)", "0 4px 6px rgba(34, 197, 94, 0.2)"],
                  } : {
                    y: 0, 
                    opacity: 1
                  }}
                  transition={{ delay: 1.2, type: "spring", duration: 2, repeat: result.win ? Infinity : 0 }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    {result.win ? 'Continuar' : 'Assistir Vídeo'}
                  </motion.span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
