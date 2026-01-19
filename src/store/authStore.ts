import { create } from 'zustand'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  signIn: async (email: string, password: string) => {
    if (!auth) {
      set({ error: 'Firebase가 설정되지 않았습니다.' })
      return
    }
    set({ loading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그인에 실패했습니다.'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string) => {
    if (!auth) {
      set({ error: 'Firebase가 설정되지 않았습니다.' })
      return
    }
    set({ loading: true, error: null })
    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signInWithGoogle: async () => {
    if (!auth) {
      set({ error: 'Firebase가 설정되지 않았습니다.' })
      return
    }
    set({ loading: true, error: null })
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google 로그인에 실패했습니다.'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  logout: async () => {
    if (!auth) {
      set({ error: 'Firebase가 설정되지 않았습니다.' })
      return
    }
    set({ loading: true, error: null })
    try {
      await signOut(auth)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '로그아웃에 실패했습니다.'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}))

// Auth state listener setup function
export function setupAuthListener() {
  const { setUser, setLoading, setInitialized } = useAuthStore.getState()

  if (!auth) {
    // If Firebase is not configured, immediately set initialized
    setLoading(false)
    setInitialized(true)
    return () => {}
  }

  setLoading(true)

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user)
    setLoading(false)
    setInitialized(true)
  })

  return unsubscribe
}
