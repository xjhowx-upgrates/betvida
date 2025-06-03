import React, { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import BetModal from "../BetModal";
import VideoPlayer from "../VideoPlayer";

export default function Roleta() {
  const [user] = useAuthState(auth);
  const [showBetModal, setShowBetModal] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [result, setResult] = useState(null);
  const spinTimerRef = useRef(null);
  
  // Cores da roleta: vermelho e preto alternados, com o 0 em verde
  const wheelColors = [
    "#4CAF50", // 0 - Verde
    "#E53935", // 1 - Vermelho
    "#212121", // 2 - Preto
    "#E53935", // 3 - Vermelho
    "#212121", // 4 - Preto
    "#E53935", // 5 - Vermelho
    "#212121", // 6 - Preto
    "#E53935", // 7 - Vermelho
    "#212121", // 8 - Preto
    "#E53935", // 9 - Vermelho
    "#212121", // 10 - Preto
    "#E53935", // 11 - Vermelho
    "#212121", // 12 - Preto
    "#E53935", // 13 - Vermelho
    "#212121", // 14 - Preto
    "#E53935", // 15 - Vermelho
    "#212121", // 16 - Preto
    "#E53935", // 17 - Vermelho
    "#212121", // 18 - Preto
    "#E53935", // 19 - Vermelho
    "#212121", // 20 - Preto
    "#E53935", // 21 - Vermelho
    "#212121", // 22 - Preto
    "#E53935", // 23 - Vermelho
    "#212121", // 24 - Preto
    "#E53935", // 25 - Vermelho
    "#212121", // 26 - Preto
    "#E53935", // 27 - Vermelho
    "#212121", // 28 - Preto
    "#E53935", // 29 - Vermelho
    "#212121", // 30 - Preto
    "#E53935", // 31 - Vermelho
    "#212121", // 32 - Preto
    "#E53935", // 33 - Vermelho
    "#212121", // 34 - Preto
    "#E53935", // 35 - Vermelho
    "#212121", // 36 - Preto
  ];
  
  const handleOpenBetModal = () => {
    if (user) {
      setShowBetModal(true);
    } else {
      alert("Faça login para apostar!");
    }
  };

  const handleBetResult = (result) => {
    setShowBetModal(false);
    if (result) {
      // Iniciar animação da roleta
      spinRoulette(result.win, () => {
        // Callback após a animação terminar
        if (!result.win && result.requiresVideo) {
          setSelectedVideo(result.video);
          setShowVideo(true);
        }
      });
    }
  };

  const handleVideoComplete = () => {
    setShowVideo(false);
    setSelectedVideo(null);
    setResult(null);
  };

  const spinRoulette = (isWin, callback) => {
    setIsSpinning(true);
    setResult(null);
    
    // Determinar número vencedor
    // Se for vitória, escolher um número vermelho (1, 3, 5...)
    // Se for derrota, escolher um número preto (2, 4, 6...)
    const winningNumber = isWin 
      ? Math.floor(Math.random() * 18) * 2 + 1 // Números ímpares (vermelhos)
      : Math.floor(Math.random() * 18) * 2 + 2; // Números pares (pretos)
    
    // Calcular ângulo para o número vencedor
    // Cada número ocupa 360/37 graus (aproximadamente 9.73 graus)
    const degreesPerNumber = 360 / 37;
    const targetAngle = 360 * 5 + (winningNumber * degreesPerNumber); // 5 voltas completas + posição do número
    
    // Iniciar a animação
    const startTime = Date.now();
    const duration = 5000; // 5 segundos de animação
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Função de easing para desaceleração natural
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      // Calcular ângulo atual
      const currentAngle = targetAngle * easeOutQuart;
      setRotationAngle(currentAngle);
      
      if (progress < 1) {
        spinTimerRef.current = requestAnimationFrame(animate);
      } else {
        // Animação concluída
        setSelectedNumber(winningNumber);
        setIsSpinning(false);
        setResult({ number: winningNumber, win: isWin });
        
        if (callback) {
          setTimeout(callback, 1500); // Dar tempo para mostrar o resultado
        }
      }
    };
    
    spinTimerRef.current = requestAnimationFrame(animate);
  };

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        cancelAnimationFrame(spinTimerRef.current);
      }
    };
  }, []);

  const handleDemoClick = () => {
    if (!isSpinning) {
      setShowDemo(true);
      spinRoulette(Math.random() > 0.5);
    }
  };

  // Renderizar os números da roleta
  const renderRouletteNumbers = () => {
    return Array.from({ length: 37 }, (_, index) => {
      // Calcular posição do número na roleta
      const angle = index * (360 / 37);
      const rad = (angle - 90) * (Math.PI / 180);
      const x = 50 + 35 * Math.cos(rad);
      const y = 50 + 35 * Math.sin(rad);
      
      // Determinar cor do texto com base na cor do fundo
      // Números no fundo verde (0) terão texto branco
      // Outros números terão texto branco
      const textColor = "white";
      
      return (
        <text
          key={index}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize="3"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          {index}
        </text>
      );
    });
  };

  return (
    <div className="relative">
      <div className="bg-white/80 rounded-xl p-4 shadow text-center">
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Roleta</h2>
        <div 
          className="aspect-ratio-game bg-gradient-to-b from-purple-900 to-black rounded-lg overflow-hidden relative mb-3"
          onClick={() => !isSpinning && handleDemoClick()}
        >
          {!showDemo ? (
            <>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3523/3523543.png" 
                alt="Roleta"
                className="w-1/3 h-1/3 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <p className="text-white text-sm sm:text-lg font-bold">Clique para demonstração</p>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Roleta */}
              <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full max-w-[250px] max-h-[250px] mx-auto">
                  <motion.g
                    animate={{ rotate: rotationAngle }}
                    transition={{ duration: 0 }}
                    style={{ transformOrigin: 'center' }}
                  >
                    {/* Setores da roleta */}
                    {wheelColors.map((color, index) => {
                      const startAngle = index * (360 / 37);
                      const endAngle = (index + 1) * (360 / 37);
                      
                      const startRad = (startAngle - 90) * (Math.PI / 180);
                      const endRad = (endAngle - 90) * (Math.PI / 180);
                      
                      const x1 = 50 + 45 * Math.cos(startRad);
                      const y1 = 50 + 45 * Math.sin(startRad);
                      const x2 = 50 + 45 * Math.cos(endRad);
                      const y2 = 50 + 45 * Math.sin(endRad);
                      
                      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
                      
                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={color}
                          stroke="#fff"
                          strokeWidth="0.5"
                        />
                      );
                    })}
                    
                    {/* Números da roleta */}
                    {renderRouletteNumbers()}
                  </motion.g>
                  
                  {/* Bola da roleta */}
                  <circle cx="50" cy="50" r="5" fill="#fff" />
                  
                  {/* Marcador */}
                  <path d="M 50 5 L 53 15 L 47 15 Z" fill="#fff" />
                </svg>
                
                {/* Resultado */}
                <AnimatePresence>
                  {result && !isSpinning && (
                    <motion.div 
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-white/90 rounded-xl p-3 sm:p-4 shadow-lg z-10 ${result.win ? 'text-green-600' : 'text-red-600'}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, rotate: result.win ? [0, 5, -5, 0] : [0, -3, 3, 0] }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                    >
                      <h3 className="text-xl sm:text-2xl font-bold mb-1">{result.number}</h3>
                      <p className="text-base sm:text-lg font-semibold">
                        {result.win ? 'Você Ganhou!' : 'Você Perdeu!'}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {!isSpinning && !result && (
                <motion.button
                  className="mt-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDemoClick();
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(59, 130, 246, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Girar Demo
                </motion.button>
              )}
            </div>
          )}
        </div>
        
        <motion.button
          onClick={handleOpenBetModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto shadow-md"
          whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(79, 70, 229, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          disabled={isSpinning}
        >
          Apostar
        </motion.button>
      </div>

      {showBetModal && (
        <BetModal 
          onClose={() => setShowBetModal(false)} 
          gameId="roleta"
          gameName="Roleta"
          onBetResult={handleBetResult}
        />
      )}

      {showVideo && selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onComplete={handleVideoComplete}
        />
      )}
    </div>
  );
}
