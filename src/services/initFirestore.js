import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch
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

// Dados iniciais para jogos
const initialGames = [
  {
    id: "fortune_tiger",
    name: "Fortune Tiger",
    description: "Slot inspirado em tigres da sorte",
    image: "https://static.wikia.nocookie.net/slot/images/2/2d/FortuneTiger.png",
    winChance: 0.4, // 40% de chance de ganhar
    minBet: 1,
    maxBet: 60
  },
  {
    id: "fortune_ox",
    name: "Fortune Ox",
    description: "Slot inspirado no búfalo da sorte",
    image: "https://img.cacaniqueisonline.com/wp-content/uploads/2023/05/fortune-ox.jpg",
    winChance: 0.38, // 38% de chance de ganhar
    minBet: 1,
    maxBet: 50
  },
  {
    id: "fortune_rabbit",
    name: "Fortune Rabbit",
    description: "Slot inspirado no coelho da sorte",
    image: "https://img.cacaniqueisonline.com/wp-content/uploads/2024/01/fortune-rabbit.jpg",
    winChance: 0.42, // 42% de chance de ganhar
    minBet: 1,
    maxBet: 45
  },
  {
    id: "fortune_dragon",
    name: "Fortune Dragon",
    description: "Slot inspirado no dragão da sorte",
    image: "https://www.askgamblers.com/uploads/slot_screenshot/gamereview_screenshot/98/9b/65/dd95c0782c9e4b4c9e3e5f2c5a8e1c5a.webp",
    winChance: 0.37, // 37% de chance de ganhar
    minBet: 1,
    maxBet: 70
  },
  {
    id: "fortune_mouse",
    name: "Fortune Mouse",
    description: "Slot inspirado no rato da sorte",
    image: "https://img.cacaniqueisonline.com/wp-content/uploads/2024/05/fotune-mouse.jpg",
    winChance: 0.43, // 43% de chance de ganhar
    minBet: 1,
    maxBet: 40
  },
  {
    id: "crash",
    name: "Crash",
    description: "Aposte antes que o gráfico caia!",
    image: "https://cdn-icons-png.flaticon.com/512/3523/3523887.png",
    winChance: 0.35, // 35% de chance de ganhar
    minBet: 1,
    maxBet: 120
  },
  {
    id: "roleta",
    name: "Roleta",
    description: "Roleta clássica de cassino",
    image: "https://cdn-icons-png.flaticon.com/512/1043/1043467.png",
    winChance: 0.45, // 45% de chance de ganhar
    minBet: 1,
    maxBet: 30
  }
];

// Dados iniciais para vídeos
const initialVideos = [
  {
    id: "video1",
    title: "Vídeo Motivacional 1",
    description: "Vídeo para assistir após perder uma aposta",
    youtubeId: "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
    duration: 5 * 60, // 5 minutos
    category: "motivacional"
  },
  {
    id: "video2",
    title: "Vídeo Motivacional 2",
    description: "Vídeo para assistir após perder uma aposta",
    youtubeId: "ZXsQAXx_ao0", // Shia LaBeouf - Just Do It
    duration: 1 * 60, // 1 minuto
    category: "motivacional"
  },
  {
    id: "video3",
    title: "Vídeo Educacional",
    description: "Vídeo para assistir após perder uma aposta",
    youtubeId: "8nW-IPrzM1g", // Vídeo educacional
    duration: 10 * 60, // 10 minutos
    category: "educacional"
  }
];

// Dados iniciais para conquistas
const initialAchievements = [
  {
    id: "first_bet",
    name: "Primeira Aposta",
    description: "Faça sua primeira aposta",
    type: "first_bet",
    threshold: 1
  },
  {
    id: "minutes_wagered_10",
    name: "10 Minutos Apostados",
    description: "Aposte um total de 10 minutos",
    type: "minutes_wagered",
    threshold: 10
  },
  {
    id: "minutes_wagered_60",
    name: "1 Hora Apostada",
    description: "Aposte um total de 60 minutos",
    type: "minutes_wagered",
    threshold: 60
  },
  {
    id: "consecutive_losses_3",
    name: "3 Derrotas Seguidas",
    description: "Perca 3 apostas consecutivas",
    type: "consecutive_losses",
    threshold: 3
  },
  {
    id: "consecutive_losses_5",
    name: "5 Derrotas Seguidas",
    description: "Perca 5 apostas consecutivas",
    type: "consecutive_losses",
    threshold: 5
  },
  {
    id: "video_watched_30",
    name: "30 Minutos de Vídeo",
    description: "Assista 30 minutos de vídeos",
    type: "video_watched",
    threshold: 30
  }
];

// Função para inicializar dados no Firestore
export const initializeFirestore = async () => {
  try {
    console.log("Inicializando dados no Firestore...");
    
    // Inicializar jogos
    await initializeCollection(COLLECTIONS.GAMES, initialGames);
    
    // Inicializar vídeos
    await initializeCollection(COLLECTIONS.VIDEOS, initialVideos);
    
    // Inicializar conquistas
    await initializeCollection(COLLECTIONS.ACHIEVEMENTS, initialAchievements);
    
    console.log("Dados inicializados com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar dados:", error);
    return false;
  }
};

// Função auxiliar para inicializar uma coleção
const initializeCollection = async (collectionName, items) => {
  console.log(`Inicializando coleção ${collectionName}...`);
  
  // Verificar se já existem documentos na coleção
  const collectionRef = collection(db, collectionName);
  const existingDocs = await getDocs(collectionRef);
  
  if (!existingDocs.empty) {
    console.log(`Coleção ${collectionName} já possui dados. Pulando...`);
    return;
  }
  
  // Usar batch para inserir múltiplos documentos de uma vez
  const batch = writeBatch(db);
  
  items.forEach(item => {
    const docRef = doc(db, collectionName, item.id);
    batch.set(docRef, item);
  });
  
  await batch.commit();
  console.log(`Coleção ${collectionName} inicializada com ${items.length} itens.`);
};

// Função para verificar se os dados já foram inicializados
export const checkInitialized = async () => {
  try {
    // Verificar se há jogos cadastrados
    const gamesRef = collection(db, COLLECTIONS.GAMES);
    const gamesSnap = await getDocs(gamesRef);
    
    return !gamesSnap.empty;
  } catch (error) {
    console.error("Erro ao verificar inicialização:", error);
    return false;
  }
};
