// Configuración e inicialización de Firebase.
// Los valores se leen del archivo .env mediante import.meta.env (Vite).
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Si falta alguna variable, la app muestra un aviso en lugar de romperse.
export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

// auth: Firebase Authentication (usamos el inicio de sesión anónimo)
export const auth = app ? getAuth(app) : null
// db: Cloud Firestore (nuestra base de datos)
export const db = app ? getFirestore(app) : null
