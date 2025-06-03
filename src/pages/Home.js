import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import LoginButton from "../components/LoginButton";
import FortuneTiger from "../components/games/FortuneTiger";
import FortuneOx from "../components/games/FortuneOx";
import FortuneRabbit from "../components/games/FortuneRabbit";
import FortuneDragon from "../components/games/FortuneDragon";
import FortuneMouse from "../components/games/FortuneMouse";
import Crash from "../components/games/Crash";
import Roleta from "../components/games/Roleta";
import Ranking from "../components/Ranking";
import Achievements from "../components/Achievements";
import { userService, rankingService, achievementService } from "../services/firestoreService";

export default function Home() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState("games");
  const [userProfile, setUserProfile] = useState(null);
  
  useEffect(() => {
    // Carregar perfil do usuário quando estiver autenticado
    const loadUserProfile = async () => {
      if (user) {
        try {
          // Criar/atualizar perfil
          await userService.createUserProfile(user);
          
          // Buscar perfil atualizado
          const profile = await userService.getUserProfile(user.uid);
          setUserProfile(profile);
          
          // Verificar conquistas
          await achievementService.checkAchievements(user.uid);
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
        }
      } else {
        setUserProfile(null);
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">BetVida</h1>
        <div className="flex items-center">
          {user && userProfile && (
            <div className="mr-4 text-right">
              <p className="font-medium">{userProfile.displayName}</p>
              <p className="text-sm text-green-300">
                +{userProfile.minutesWon} minutos ganhos
              </p>
              <p className="text-sm text-red-300">
                -{userProfile.minutesLost} minutos perdidos
              </p>
            </div>
          )}
          <LoginButton />
        </div>
      </header>
      
      {/* Navegação */}
      <nav className="flex mb-6 border-b border-indigo-700">
        <button 
          onClick={() => setActiveTab("games")} 
          className={`px-4 py-2 ${activeTab === "games" ? "border-b-2 border-white font-semibold" : "text-indigo-300"}`}
        >
          Jogos
        </button>
        <button 
          onClick={() => setActiveTab("ranking")} 
          className={`px-4 py-2 ${activeTab === "ranking" ? "border-b-2 border-white font-semibold" : "text-indigo-300"}`}
        >
          Ranking
        </button>
        <button 
          onClick={() => setActiveTab("achievements")} 
          className={`px-4 py-2 ${activeTab === "achievements" ? "border-b-2 border-white font-semibold" : "text-indigo-300"}`}
        >
          Conquistas
        </button>
      </nav>
      
      {/* Conteúdo da aba ativa */}
      {activeTab === "games" && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Jogos Disponíveis</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-yellow-300">Série Fortune</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <FortuneTiger />
              <FortuneOx />
              <FortuneRabbit />
              <FortuneDragon />
              <FortuneMouse />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3 text-yellow-300">Outros Jogos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Crash />
              <Roleta />
            </div>
          </div>
        </section>
      )}
      
      {activeTab === "ranking" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Ranking Global</h2>
          <Ranking />
        </section>
      )}
      
      {activeTab === "achievements" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Suas Conquistas</h2>
          <Achievements userAchievements={userProfile?.achievements || []} />
        </section>
      )}
    </div>
  );
}
