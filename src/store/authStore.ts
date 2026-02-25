import { create } from 'zustand'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  getAuth,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isE2ETestMode } from '@/lib/utils'
import { logger } from '@/lib/logger'

// Mock user for E2E testing
const mockUser = {
  uid: 'test-user-uid-12345',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    claims: {},
    expirationTime: '',
    issuedAtTime: '',
    signInProvider: 'password',
    signInSecondFactor: null,
    authTime: '',
  }),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  photoURL: null,
  providerId: 'firebase',
} as unknown as User

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

// Check E2E mode at store creation time (runs on client only after hydration)
const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const isE2E = isE2ETestMode()
    if (isE2E) {
      logger.debug('[E2E] Setting initial state with mock user')
      return {
        user: mockUser,
        loading: false,
        error: null,
        initialized: true,
      }
    }

    // Check if there's already a logged-in Firebase user (e.g., after HMR)
    if (auth) {
      const currentUser = auth.currentUser
      if (currentUser) {
        logger.debug('[AuthStore] Found existing Firebase user:', currentUser.uid)
        return {
          user: currentUser,
          loading: false,
          error: null,
          initialized: true,
        }
      }
    }
  }
  return {
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),

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
let authListenerSetup = false
export function setupAuthListener() {
  const { setUser, setLoading, setInitialized, initialized } = useAuthStore.getState()

  // Prevent duplicate listeners
  if (authListenerSetup) {
    logger.debug('[AuthStore] Auth listener already setup, skipping')
    return () => {}
  }

  // E2E Test Mode - use mock user (runtime check)
  const isE2E = isE2ETestMode()
  if (isE2E) {
    setUser(mockUser)
    setLoading(false)
    setInitialized(true)
    authListenerSetup = true
    logger.debug('E2E Test Mode: Using mock user')
    return () => {}
  }

  if (!auth) {
    // If Firebase is not configured, immediately set initialized
    setLoading(false)
    setInitialized(true)
    return () => {}
  }

  setLoading(true)

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    logger.debug('[AuthStore] onAuthStateChanged fired:', user?.uid || 'null')
    setUser(user)
    setLoading(false)
    setInitialized(true)
  })

  authListenerSetup = true
  return unsubscribe
}

// Test helper to reset the auth listener setup flag
// Exported only for testing purposes
export function resetAuthListenerSetup() {
  authListenerSetup = false
}
