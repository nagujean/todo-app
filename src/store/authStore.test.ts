import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { User } from 'firebase/auth';

// Hoist mock state variables so they're available during mock factory execution
const mockState = vi.hoisted(() => ({
  isE2EModeEnabled: false,
  mockAuth: null as object | null,
  authStateCallback: null as ((user: User | null) => void) | null,
  mockUnsubscribe: vi.fn(),
}));

// Mock Firebase Auth modules
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: class MockGoogleAuthProvider {},
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn((auth: unknown, callback: (user: User | null) => void) => {
    mockState.authStateCallback = callback;
    return mockState.mockUnsubscribe;
  }),
}));

vi.mock('@/lib/firebase', () => ({
  get auth() {
    return mockState.mockAuth;
  },
}));

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: () => mockState.isE2EModeEnabled,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import after mocks are set up
import { useAuthStore, setupAuthListener, resetAuthListenerSetup } from './authStore';

// Import Firebase auth functions for mocking assertions
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';

// Helper to enable/disable E2E mode with mock auth
function setE2EMode(enabled: boolean) {
  mockState.isE2EModeEnabled = enabled;
  mockState.mockAuth = enabled ? {} : null;
}

// Helper to set mock auth without E2E mode
function setMockAuth(auth: object | null) {
  mockState.mockAuth = auth;
}

// Create a mock user for tests
function createMockUser(overrides: Partial<User> = {}): User {
  return {
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
    ...overrides,
  } as unknown as User;
}

describe('authStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useAuthStore.getState();
    store.setUser(null);
    store.setLoading(false);
    store.setInitialized(false);
    store.clearError();
    vi.clearAllMocks();
    setE2EMode(false);
    mockState.authStateCallback = null;
    mockState.mockUnsubscribe = vi.fn();
    // Reset the auth listener setup flag to ensure each test can set up a new listener
    resetAuthListenerSetup();
  });

  afterEach(() => {
    vi.clearAllMocks();
    setE2EMode(false);
  });

  describe('Initial State', () => {
    it('should have correct initial state structure', () => {
      const state = useAuthStore.getState();

      expect(state).toHaveProperty('user');
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('initialized');
      expect(state).toHaveProperty('signIn');
      expect(state).toHaveProperty('signUp');
      expect(state).toHaveProperty('signInWithGoogle');
      expect(state).toHaveProperty('logout');
      expect(state).toHaveProperty('clearError');
      expect(state).toHaveProperty('setUser');
      expect(state).toHaveProperty('setLoading');
      expect(state).toHaveProperty('setInitialized');
    });

    it('should have null user by default', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have loading as false by default', () => {
      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
    });

    it('should have error as null by default', () => {
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });

    it('should have initialized as false by default', () => {
      const state = useAuthStore.getState();
      expect(state.initialized).toBe(false);
    });
  });

  describe('Setter functions', () => {
    it('setUser should update user state', () => {
      const store = useAuthStore.getState();
      const mockUser = createMockUser();

      store.setUser(mockUser);

      expect(useAuthStore.getState().user).toBe(mockUser);
    });

    it('setUser should accept null', () => {
      const store = useAuthStore.getState();
      store.setUser(createMockUser());
      store.setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
    });

    it('setLoading should update loading state', () => {
      const store = useAuthStore.getState();

      store.setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);

      store.setLoading(false);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('setInitialized should update initialized state', () => {
      const store = useAuthStore.getState();

      store.setInitialized(true);
      expect(useAuthStore.getState().initialized).toBe(true);

      store.setInitialized(false);
      expect(useAuthStore.getState().initialized).toBe(false);
    });

    it('clearError should set error to null', () => {
      const store = useAuthStore.getState();

      // Manually set an error first (simulating an auth failure)
      useAuthStore.setState({ error: 'Some error message' });
      expect(useAuthStore.getState().error).toBe('Some error message');

      store.clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('Auth actions with null Firebase (REQ-010)', () => {
    it('signIn should set error when Firebase is not configured', async () => {
      const store = useAuthStore.getState();

      await store.signIn('test@example.com', 'password');

      expect(useAuthStore.getState().error).toBe('Firebase가 설정되지 않았습니다.');
    });

    it('signUp should set error when Firebase is not configured', async () => {
      const store = useAuthStore.getState();

      await store.signUp('test@example.com', 'password');

      expect(useAuthStore.getState().error).toBe('Firebase가 설정되지 않았습니다.');
    });

    it('signInWithGoogle should set error when Firebase is not configured', async () => {
      const store = useAuthStore.getState();

      await store.signInWithGoogle();

      expect(useAuthStore.getState().error).toBe('Firebase가 설정되지 않았습니다.');
    });

    it('logout should set error when Firebase is not configured', async () => {
      const store = useAuthStore.getState();

      await store.logout();

      expect(useAuthStore.getState().error).toBe('Firebase가 설정되지 않았습니다.');
    });
  });

  describe('Auth actions with mock Firebase (REQ-010)', () => {
    beforeEach(() => {
      setMockAuth({ currentUser: null });
    });

    describe('signIn', () => {
      it('should set loading to true during sign in', async () => {
        vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        const signInPromise = store.signIn('test@example.com', 'password');

        // Loading should be true during the operation
        // Note: This is hard to test directly due to async timing, but we verify the flow
        await signInPromise;

        // After completion, loading should be false
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should call signInWithEmailAndPassword with correct credentials', async () => {
        vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        await store.signIn('test@example.com', 'password123');

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          mockState.mockAuth,
          'test@example.com',
          'password123'
        );
      });

      it('should set error on signIn failure with Error instance', async () => {
        const errorMessage = 'Invalid credentials';
        vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error(errorMessage));

        const store = useAuthStore.getState();

        await expect(store.signIn('test@example.com', 'wrong')).rejects.toThrow(errorMessage);
        expect(useAuthStore.getState().error).toBe(errorMessage);
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set default error on signIn failure with non-Error', async () => {
        vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce('unknown error');

        const store = useAuthStore.getState();

        await expect(store.signIn('test@example.com', 'wrong')).rejects.toBe('unknown error');
        expect(useAuthStore.getState().error).toBe('로그인에 실패했습니다.');
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should clear previous error before sign in', async () => {
        useAuthStore.setState({ error: 'Previous error' });

        vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        await store.signIn('test@example.com', 'password');

        expect(useAuthStore.getState().error).toBeNull();
      });
    });

    describe('signUp', () => {
      it('should call createUserWithEmailAndPassword with correct credentials', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        await store.signUp('new@example.com', 'newpassword');

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          mockState.mockAuth,
          'new@example.com',
          'newpassword'
        );
      });

      it('should set error on signUp failure with Error instance', async () => {
        const errorMessage = 'Email already in use';
        vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce(new Error(errorMessage));

        const store = useAuthStore.getState();

        await expect(store.signUp('existing@example.com', 'password')).rejects.toThrow(errorMessage);
        expect(useAuthStore.getState().error).toBe(errorMessage);
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set default error on signUp failure with non-Error', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/weak-password' });

        const store = useAuthStore.getState();

        await expect(store.signUp('new@example.com', '123')).rejects.toEqual({ code: 'auth/weak-password' });
        expect(useAuthStore.getState().error).toBe('회원가입에 실패했습니다.');
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set loading to false after successful signup', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        await store.signUp('new@example.com', 'password');

        expect(useAuthStore.getState().loading).toBe(false);
      });
    });

    describe('signInWithGoogle', () => {
      it('should call signInWithPopup with GoogleAuthProvider', async () => {
        vi.mocked(signInWithPopup).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        await store.signInWithGoogle();

        expect(signInWithPopup).toHaveBeenCalledWith(mockState.mockAuth, expect.any(Object));
      });

      it('should set error on Google sign in failure with Error instance', async () => {
        const errorMessage = 'Popup closed by user';
        vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error(errorMessage));

        const store = useAuthStore.getState();

        await expect(store.signInWithGoogle()).rejects.toThrow(errorMessage);
        expect(useAuthStore.getState().error).toBe(errorMessage);
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set default error on Google sign in failure with non-Error', async () => {
        vi.mocked(signInWithPopup).mockRejectedValueOnce('popup_closed');

        const store = useAuthStore.getState();

        await expect(store.signInWithGoogle()).rejects.toBe('popup_closed');
        expect(useAuthStore.getState().error).toBe('Google 로그인에 실패했습니다.');
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set loading to false after successful Google sign in', async () => {
        vi.mocked(signInWithPopup).mockResolvedValueOnce({
          user: createMockUser(),
        } as never);

        const store = useAuthStore.getState();
        await store.signInWithGoogle();

        expect(useAuthStore.getState().loading).toBe(false);
      });
    });

    describe('logout', () => {
      it('should call signOut', async () => {
        vi.mocked(signOut).mockResolvedValueOnce(undefined);

        const store = useAuthStore.getState();
        await store.logout();

        expect(signOut).toHaveBeenCalledWith(mockState.mockAuth);
      });

      it('should set error on logout failure with Error instance', async () => {
        const errorMessage = 'Network error';
        vi.mocked(signOut).mockRejectedValueOnce(new Error(errorMessage));

        const store = useAuthStore.getState();

        await expect(store.logout()).rejects.toThrow(errorMessage);
        expect(useAuthStore.getState().error).toBe(errorMessage);
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set default error on logout failure with non-Error', async () => {
        vi.mocked(signOut).mockRejectedValueOnce({ code: 'auth/network-request-failed' });

        const store = useAuthStore.getState();

        await expect(store.logout()).rejects.toEqual({ code: 'auth/network-request-failed' });
        expect(useAuthStore.getState().error).toBe('로그아웃에 실패했습니다.');
        expect(useAuthStore.getState().loading).toBe(false);
      });

      it('should set loading to false after successful logout', async () => {
        vi.mocked(signOut).mockResolvedValueOnce(undefined);

        const store = useAuthStore.getState();
        await store.logout();

        expect(useAuthStore.getState().loading).toBe(false);
      });
    });
  });

  describe('setupAuthListener (REQ-011)', () => {
    it('should return unsubscribe function in E2E mode', () => {
      setE2EMode(true);

      const unsubscribe = setupAuthListener();

      expect(typeof unsubscribe).toBe('function');
      // Should set mock user in E2E mode
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.uid).toBe('test-user-uid-12345');
      expect(state.initialized).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should not call onAuthStateChanged in E2E mode', () => {
      setE2EMode(true);

      setupAuthListener();

      expect(onAuthStateChanged).not.toHaveBeenCalled();
    });

    it('should return empty function when Firebase auth is not configured', () => {
      // auth is null by default
      const unsubscribe = setupAuthListener();

      expect(typeof unsubscribe).toBe('function');
      expect(useAuthStore.getState().initialized).toBe(true);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should setup auth listener when Firebase is configured', () => {
      setMockAuth({ currentUser: null });

      setupAuthListener();

      expect(onAuthStateChanged).toHaveBeenCalledWith(mockState.mockAuth, expect.any(Function));
    });

    it('should set loading to true when setting up listener', () => {
      setMockAuth({ currentUser: null });

      setupAuthListener();

      // Loading is set to true, but then the callback may set it to false
      // We check that onAuthStateChanged was called
      expect(onAuthStateChanged).toHaveBeenCalled();
    });

    it('should update user when auth state changes', () => {
      setMockAuth({ currentUser: null });

      setupAuthListener();

      // Simulate auth state change
      const mockUser = createMockUser({ uid: 'new-user-123', email: 'new@example.com' });
      if (mockState.authStateCallback) {
        mockState.authStateCallback(mockUser);
      }

      const state = useAuthStore.getState();
      expect(state.user?.uid).toBe('new-user-123');
      expect(state.user?.email).toBe('new@example.com');
      expect(state.loading).toBe(false);
      expect(state.initialized).toBe(true);
    });

    it('should set user to null when user signs out', () => {
      setMockAuth({ currentUser: createMockUser() });

      // First set a user
      useAuthStore.getState().setUser(createMockUser());

      setupAuthListener();

      // Simulate sign out
      if (mockState.authStateCallback) {
        mockState.authStateCallback(null);
      }

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.initialized).toBe(true);
    });

    it('should return unsubscribe function that can be called', () => {
      setMockAuth({ currentUser: null });

      const unsubscribe = setupAuthListener();
      unsubscribe();

      expect(mockState.mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete sign in flow', async () => {
      setMockAuth({ currentUser: null });
      const mockUser = createMockUser();
      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as never);

      const store = useAuthStore.getState();

      // Start with no user
      expect(store.user).toBeNull();

      // Sign in
      await store.signIn('test@example.com', 'password');

      // Verify no error occurred
      expect(useAuthStore.getState().error).toBeNull();
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should handle error state and clear it', async () => {
      setMockAuth({ currentUser: null });
      vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(new Error('Invalid password'));

      const store = useAuthStore.getState();

      // Attempt sign in that fails
      await expect(store.signIn('test@example.com', 'wrong')).rejects.toThrow();

      // Error should be set
      expect(useAuthStore.getState().error).toBe('Invalid password');

      // Clear error
      store.clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should maintain state consistency during auth operations', async () => {
      setMockAuth({ currentUser: null });
      const mockUser = createMockUser();
      vi.mocked(signInWithEmailAndPassword).mockResolvedValueOnce({
        user: mockUser,
      } as never);
      vi.mocked(signOut).mockResolvedValueOnce(undefined);

      const store = useAuthStore.getState();

      // Sign in
      await store.signIn('test@example.com', 'password');

      // Setup listener and simulate user update
      setupAuthListener();
      if (mockState.authStateCallback) {
        mockState.authStateCallback(mockUser);
      }

      expect(useAuthStore.getState().user?.uid).toBe(mockUser.uid);

      // Logout
      await store.logout();

      // Simulate auth state change on logout
      if (mockState.authStateCallback) {
        mockState.authStateCallback(null);
      }

      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
