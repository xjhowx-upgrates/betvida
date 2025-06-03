import React, { useState, useEffect } from "react";
import { rankingService } from "../services/firestoreService";
import { motion, AnimatePresence } from "framer-motion";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        // Buscar ranking do Firestore
        const leaderboard = await rankingService.getLeaderboard(10);
        setRanking(leaderboard.map(user => ({
          id: user.id,
          name: user.displayName || "Usuário Anônimo",
          photoURL: user.photoURL,
          minutes: user.minutesWon
        })));
      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
        // Fallback para dados mock se houver erro
        setRanking([
          { id: "1", name: "João", minutes: 120, photoURL: null },
          { id: "2", name: "Ana", minutes: 90, photoURL: null },
          { id: "3", name: "Carlos", minutes: 75, photoURL: null },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadRanking();
    
    // Atualizar ranking a cada 60 segundos
    const interval = setInterval(loadRanking, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <motion.div 
        className="bg-white/80 rounded-xl p-4 shadow-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Ranking</h2>
        <div className="flex justify-center items-center py-4">
          <motion.div
            className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-500 ml-3">Carregando ranking...</p>
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
        Ranking
      </motion.h2>
      
      {ranking.length === 0 ? (
        <motion.p 
          className="text-gray-500 text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Nenhum usuário no ranking ainda
        </motion.p>
      ) : (
        <motion.ul 
          className="divide-y divide-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {ranking.map((user, i) => (
            <motion.li 
              key={user.id} 
              className="flex items-center justify-between py-2 sm:py-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ backgroundColor: "rgba(79, 70, 229, 0.05)", paddingLeft: "8px", paddingRight: "8px" }}
              style={{ borderRadius: "4px" }}
            >
              <div className="flex items-center">
                {i < 3 ? (
                  <motion.div 
                    className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 text-white font-bold text-xs
                      ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 * i, type: "spring" }}
                    whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                  >
                    {i + 1}
                  </motion.div>
                ) : (
                  <motion.span 
                    className="font-semibold text-indigo-800 w-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    {i + 1}.
                  </motion.span>
                )}
                
                {user.photoURL ? (
                  <motion.img 
                    src={user.photoURL} 
                    alt={user.name} 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 object-cover border-2 border-indigo-100"
                    whileHover={{ scale: 1.2, borderColor: "#6366F1" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                ) : (
                  <motion.div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-xs"
                    whileHover={{ scale: 1.2, backgroundColor: "#E0E7FF" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.div>
                )}
                
                <span className="font-medium text-sm sm:text-base">{user.name}</span>
              </div>
              
              <motion.span 
                className="font-mono font-semibold text-green-600 text-sm sm:text-base bg-green-50 px-2 py-1 rounded-md"
                whileHover={{ scale: 1.05, backgroundColor: "#DCFCE7" }}
                animate={i < 3 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: i < 3 ? Infinity : 0, repeatType: "loop", duration: 2 }}
              >
                +{user.minutes} min
              </motion.span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </motion.div>
  );
}
