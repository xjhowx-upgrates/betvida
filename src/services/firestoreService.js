import { db, auth } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  increment
} from "firebase/firestore";

// Estrutura de coleções do Firestore
const COLLECTIONS = {
  USERS: "users",
  BETS: "bets",
  GAMES: "games",
  VIDEOS: "videos",
  ACHIEVEMENTS: "achievements",
  LEADERBOARD: "leaderboard"
};

// Serviço de usuários
export const userService = {
  // Criar ou atualizar perfil de usuário após login
  async createUserProfile(user) {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Novo usuário
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        minutesWon: 0,
        minutesLost: 0,
        totalBets: 0,
        achievements: [],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isVIP: false
      });
    } else {
      // Usuário existente - atualiza último login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    }
    
    return userRef;
  },
  
  // Obter perfil do usuário
  async getUserProfile(uid) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    
    return null;
  },
  
  // Atualizar minutos ganhos/perdidos
  async updateUserMinutes(uid, minutesWon = 0, minutesLost = 0) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    
    await updateDoc(userRef, {
      minutesWon: increment(minutesWon),
      minutesLost: increment(minutesLost),
      totalBets: increment(1)
    });
  },
  
  // Adicionar conquista ao usuário
  async addAchievement(uid, achievementId) {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (!userData.achievements.includes(achievementId)) {
        await updateDoc(userRef, {
          achievements: [...userData.achievements, achievementId]
        });
      }
    }
  }
};

// Serviço de apostas
export const betService = {
  // Registrar nova aposta
  async createBet(gameId, minutesWagered) {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado");
    
    const betRef = await addDoc(collection(db, COLLECTIONS.BETS), {
      userId: user.uid,
      gameId,
      minutesWagered,
      result: null, // será atualizado após o jogo
      videoToWatch: null, // será atualizado se perder
      createdAt: serverTimestamp(),
      completed: false
    });
    
    return betRef;
  },
  
  // Atualizar resultado da aposta
  async updateBetResult(betId, won, videoId = null) {
    const betRef = doc(db, COLLECTIONS.BETS, betId);
    const user = auth.currentUser;
    
    await updateDoc(betRef, {
      result: won ? "win" : "lose",
      videoToWatch: won ? null : videoId,
      updatedAt: serverTimestamp()
    });
    
    // Atualizar estatísticas do usuário
    if (user) {
      const betDoc = await getDoc(betRef);
      const { minutesWagered } = betDoc.data();
      
      await userService.updateUserMinutes(
        user.uid,
        won ? minutesWagered : 0,
        won ? 0 : minutesWagered
      );
    }
    
    return betRef;
  },
  
  // Marcar aposta como concluída (vídeo assistido)
  async completeBet(betId) {
    const betRef = doc(db, COLLECTIONS.BETS, betId);
    
    await updateDoc(betRef, {
      completed: true,
      completedAt: serverTimestamp()
    });
    
    return betRef;
  },
  
  // Obter apostas do usuário atual
  async getUserBets(limit = 10) {
    const user = auth.currentUser;
    if (!user) return [];
    
    const betsQuery = query(
      collection(db, COLLECTIONS.BETS),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(limit)
    );
    
    const betsSnap = await getDocs(betsQuery);
    return betsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Obter apostas pendentes (vídeos a assistir)
  async getPendingBets() {
    const user = auth.currentUser;
    if (!user) return [];
    
    const pendingQuery = query(
      collection(db, COLLECTIONS.BETS),
      where("userId", "==", user.uid),
      where("result", "==", "lose"),
      where("completed", "==", false)
    );
    
    const pendingSnap = await getDocs(pendingQuery);
    return pendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Serviço de jogos
export const gameService = {
  // Obter todos os jogos disponíveis
  async getGames() {
    const gamesSnap = await getDocs(collection(db, COLLECTIONS.GAMES));
    return gamesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Obter detalhes de um jogo
  async getGame(gameId) {
    const gameRef = doc(db, COLLECTIONS.GAMES, gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return { id: gameSnap.id, ...gameSnap.data() };
    }
    
    return null;
  }
};

// Serviço de vídeos
export const videoService = {
  // Obter vídeo aleatório para assistir
  async getRandomVideo(duration) {
    // Buscar vídeo com duração aproximada aos minutos perdidos
    const videosQuery = query(
      collection(db, COLLECTIONS.VIDEOS),
      where("duration", ">=", duration),
      orderBy("duration"),
      limit(3)
    );
    
    const videosSnap = await getDocs(videosQuery);
    const videos = videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Selecionar um vídeo aleatoriamente entre os resultados
    if (videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * videos.length);
      return videos[randomIndex];
    }
    
    // Fallback: buscar qualquer vídeo se não encontrar um com duração adequada
    const fallbackQuery = query(
      collection(db, COLLECTIONS.VIDEOS),
      limit(1)
    );
    
    const fallbackSnap = await getDocs(fallbackQuery);
    if (!fallbackSnap.empty) {
      return { id: fallbackSnap.docs[0].id, ...fallbackSnap.docs[0].data() };
    }
    
    return null;
  }
};

// Serviço de conquistas
export const achievementService = {
  // Obter todas as conquistas
  async getAchievements() {
    const achievementsSnap = await getDocs(collection(db, COLLECTIONS.ACHIEVEMENTS));
    return achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  // Verificar conquistas do usuário
  async checkAchievements(uid) {
    const user = await userService.getUserProfile(uid);
    if (!user) return;
    
    const achievements = await this.getAchievements();
    const userBets = await betService.getUserBets(100); // Buscar histórico de apostas
    
    // Verificar cada conquista
    for (const achievement of achievements) {
      // Pular se já tem a conquista
      if (user.achievements.includes(achievement.id)) continue;
      
      let earned = false;
      
      switch (achievement.type) {
        case "first_bet":
          earned = userBets.length > 0;
          break;
          
        case "minutes_wagered":
          earned = user.minutesWon + user.minutesLost >= achievement.threshold;
          break;
          
        case "consecutive_losses":
          // Verificar sequência de derrotas
          let lossStreak = 0;
          let maxLossStreak = 0;
          
          for (const bet of userBets) {
            if (bet.result === "lose") {
              lossStreak++;
              maxLossStreak = Math.max(maxLossStreak, lossStreak);
            } else {
              lossStreak = 0;
            }
          }
          
          earned = maxLossStreak >= achievement.threshold;
          break;
          
        case "video_watched":
          // Contar minutos de vídeo assistidos
          const watchedBets = userBets.filter(bet => bet.completed && bet.result === "lose");
          const totalWatchTime = watchedBets.reduce((total, bet) => total + bet.minutesWagered, 0);
          
          earned = totalWatchTime >= achievement.threshold;
          break;
      }
      
      if (earned) {
        await userService.addAchievement(uid, achievement.id);
      }
    }
  }
};

// Serviço de ranking
export const rankingService = {
  // Obter ranking de usuários por minutos ganhos
  async getLeaderboard(limit = 10) {
    const leaderboardQuery = query(
      collection(db, COLLECTIONS.USERS),
      orderBy("minutesWon", "desc"),
      limit(limit)
    );
    
    const leaderboardSnap = await getDocs(leaderboardQuery);
    return leaderboardSnap.docs.map(doc => ({ 
      id: doc.id, 
      displayName: doc.data().displayName,
      photoURL: doc.data().photoURL,
      minutesWon: doc.data().minutesWon
    }));
  }
};
