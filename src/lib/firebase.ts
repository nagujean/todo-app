import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase config is available
const isFirebaseConfigured = !!firebaseConfig.apiKey

// Check if running in emulator mode
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let emulatorsConnected = false

if (isFirebaseConfigured) {
  // Initialize Firebase only if it hasn't been initialized
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)

  // Connect to emulators if enabled (only once)
  if (useEmulator && !emulatorsConnected && typeof window !== 'undefined') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
    emulatorsConnected = true
    console.log('🔥 Firebase Emulators connected')
  }
}

export { auth, db, isFirebaseConfigured, useEmulator }
