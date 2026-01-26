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

// E2E Test Mode detection - checks at runtime
function checkE2ETestMode(): boolean {
  // Check build-time env var
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true') {
    console.log('[E2E] Detected via env var')
    return true
  }

  // Check runtime indicators (browser only)
  if (typeof window !== 'undefined') {
    console.log('[E2E] Checking browser indicators, URL:', window.location.href)

    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const e2eParam = urlParams.get('e2e')
    console.log('[E2E] URL param e2e:', e2eParam)
    if (e2eParam === 'true') {
      console.log('[E2E] Detected via URL param')
      return true
    }

    // Check localStorage (can be set by Playwright before navigation)
    const localStorageFlag = localStorage.getItem('E2E_TEST_MODE')
    console.log('[E2E] localStorage flag:', localStorageFlag)
    if (localStorageFlag === 'true') {
      console.log('[E2E] Detected via localStorage')
      return true
    }
  } else {
    console.log('[E2E] Running on server (window undefined)')
  }

  console.log('[E2E] Not in E2E test mode')
  return false
}

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
    const isE2E = checkE2ETestMode()
    if (isE2E) {
      console.log('[E2E] Setting initial state with mock user')
      return {
        user: mockUser,
        loading: false,
        error: null,
        initialized: true,
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
export function setupAuthListener() {
  const { setUser, setLoading, setInitialized } = useAuthStore.getState()

  // E2E Test Mode - use mock user (runtime check)
  const isE2ETestMode = checkE2ETestMode()
  if (isE2ETestMode) {
    setUser(mockUser)
    setLoading(false)
    setInitialized(true)
    console.log('E2E Test Mode: Using mock user')
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
    setUser(user)
    setLoading(false)
    setInitialized(true)
  })

  return unsubscribe
}
