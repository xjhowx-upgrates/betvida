import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import { checkInitialized, initializeFirestore } from "./services/initFirestore";

export default function App() {
  const [user] = useAuthState(auth);
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Verificar e inicializar dados do Firestore
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Verificar se os dados já foram inicializados
        const isInitialized = await checkInitialized();
        setInitialized(isInitialized);
        
        // Se não estiver inicializado e houver um usuário logado, inicializar
        if (!isInitialized && user) {
          setInitializing(true);
          await initializeFirestore();
          setInitialized(true);
          setInitializing(false);
        }
      } catch (error) {
        console.error("Erro ao inicializar dados:", error);
        setInitializing(false);
      }
    };
    
    initializeData();
  }, [user]);
  
  return (
    <>
      {initializing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-indigo-900 mb-4">Inicializando BetVida</h2>
            <p className="mb-4">Estamos preparando tudo para você...</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        </div>
      )}
      <Home />
    </>
  );
}
