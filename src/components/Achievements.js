import React, { useState, useEffect } from "react";
import { achievementService } from "../services/firestoreService";
import { motion, AnimatePresence } from "framer-motion";

export default function Achievements({ userAchievements = [] }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        // Buscar todas as conquistas disponíveis
        const allAchievements = await achievementService.getAchievements();
        
        // Marcar quais estão desbloqueadas para o usuário
        const mappedAchievements = allAchievements.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          unlocked: userAchievements.includes(achievement.id)
        }));
        
        setAchievements(mappedAchievements);
      } catch (error) {
        console.error("Erro ao carregar conquistas:", error);
        // Fallback para dados mock se houver erro
        setAchievements([
          { id: "first_bet", name: "Primeira aposta", description: "Faça sua primeira aposta", unlocked: userAchievements.includes("first_bet") },
          { id: "minutes_wagered_10", name: "10 minutos apostados", description: "Aposte um total de 10 minutos", unlocked: userAchievements.includes("minutes_wagered_10") },
          { id: "consecutive_losses_3", name: "3 derrotas seguidas", description: "Perca 3 apostas consecutivas", unlocked: userAchievements.includes("consecutive_losses_3") },
          { id: "video_watched_30", name: "30 minutos de vídeo", description: "Assista 30 minutos de vídeos", unlocked: userAchievements.includes("video_watched_30") },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadAchievements();
  }, [userAchievements]);
  
  if (loading) {
    return (
      <motion.div 
        className="bg-white/80 rounded-xl p-4 shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Conquistas</h2>
        <div className="flex justify-center items-center py-4">
          <motion.div
            className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-500 ml-3">Carregando conquistas...</p>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="bg-white/80 rounded-xl p-4 shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2 
        className="text-xl sm:text-2xl font-bold text-indigo-900 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Conquistas
      </motion.h2>
      
      {achievements.length === 0 ? (
        <motion.p 
          className="text-gray-500 text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Nenhuma conquista disponível
        </motion.p>
      ) : (
        <motion.div 
          className="space-y-2 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-3 sm:space-y-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {achievements.map((achievement, index) => (
            <motion.div 
              key={achievement.id}
              className={`p-3 rounded-lg border ${achievement.unlocked 
                ? "border-green-400 bg-green-50" 
                : "border-gray-200 bg-gray-50"}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
            >
              <div className="flex items-center">
                <motion.div 
                  className={`w-3 h-3 rounded-full mr-2 ${achievement.unlocked 
                    ? "bg-green-500" 
                    : "bg-gray-300"}`}
                  animate={achievement.unlocked ? {
                    scale: [1, 1.3, 1],
                    backgroundColor: ["#10B981", "#34D399", "#10B981"]
                  } : {}}
                  transition={{ duration: 1, repeat: achievement.unlocked ? Infinity : 0, repeatType: "loop" }}
                />
                <h3 className={`font-semibold ${achievement.unlocked 
                  ? "text-green-700" 
                  : "text-gray-500"}`}
                >
                  {achievement.name}
                </h3>
              </div>
              {achievement.description && (
                <motion.p 
                  className="text-sm text-gray-500 ml-5 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + (0.1 * index) }}
                >
                  {achievement.description}
                </motion.p>
              )}
              
              {achievement.unlocked && (
                <motion.div 
                  className="mt-2 text-xs text-green-600 font-semibold flex items-center justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + (0.1 * index) }}
                >
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
                    className="mr-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, 0] }}
                    transition={{ delay: 0.4 + (0.1 * index), duration: 0.5 }}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </motion.svg>
                  Desbloqueado
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
