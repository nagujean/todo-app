import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from 'firebase/auth';

// Mock Firebase Auth modules
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  auth: null, // Set to null to test error handling
}));

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: vi.fn(() => false),
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useAuthStore.getState();
    store.setUser(null);
    store.setLoading(false);
    store.setInitialized(false);
    store.clearError();
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
  });

  describe('Setter functions', () => {
    it('setUser should update user state', () => {
      const store = useAuthStore.getState();
      const mockUser = { uid: 'test-123', email: 'test@example.com' } as unknown as User;

      store.setUser(mockUser);

      expect(useAuthStore.getState().user).toBe(mockUser);
    });

    it('setUser should accept null', () => {
      const store = useAuthStore.getState();
      store.setUser({ uid: 'test' } as unknown as User);
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

  describe('Auth actions with null Firebase', () => {
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
});
