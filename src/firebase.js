import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "betvida-app.firebaseapp.com",
  projectId: "betvida-app",
  storageBucket: "betvida-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuv"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Provedores de autenticação
const googleProvider = new GoogleAuthProvider();
// Aqui o ID do provedor deve ser exatamente o que você colocou no Firebase (oidc.discord)
const discordProvider = new OAuthProvider('oidc.discord');

// Funções de autenticação
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Erro ao fazer login com Google:", error);
    throw error;
  }
};

export const signInWithDiscord = async () => {
  try {
    const result = await signInWithPopup(auth, discordProvider);
    return result.user;
  } catch (error) {
    console.error("Erro ao fazer login com Discord:", error);
    throw error;
  }
};

export const signOut = () => auth.signOut();

export { auth, db };
