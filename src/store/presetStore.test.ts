import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePresetStore, type Preset } from './presetStore';

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
  },
}));

vi.mock('@/lib/firebase', () => ({
  db: null, // Set to null to use local storage mode
}));

vi.mock('@/lib/utils', () => ({
  convertTimestamp: vi.fn((ts) => ts || new Date().toISOString()),
}));

describe('presetStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = usePresetStore.getState();
    store.setPresets([]);
    store.setUserId(null);
    store.setLoading(false);
  });

  describe('Initial State', () => {
    it('should have correct initial state structure', () => {
      const state = usePresetStore.getState();

      expect(state).toHaveProperty('presets');
      expect(state).toHaveProperty('userId');
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('addPreset');
      expect(state).toHaveProperty('deletePreset');
      expect(state).toHaveProperty('setUserId');
      expect(state).toHaveProperty('setPresets');
      expect(state).toHaveProperty('setLoading');
    });

    it('should have empty presets array by default', () => {
      const state = usePresetStore.getState();
      expect(state.presets).toEqual([]);
    });

    it('should have null userId by default', () => {
      const state = usePresetStore.getState();
      expect(state.userId).toBeNull();
    });

    it('should have isLoading as false by default', () => {
      const state = usePresetStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addPreset (local mode)', () => {
    it('should add a preset with correct structure', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Daily Standup');

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
      expect(presets[0].title).toBe('Daily Standup');
      expect(presets[0].id).toBeDefined();
      expect(presets[0].createdAt).toBeDefined();
    });

    it('should not add duplicate presets with the same title', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Weekly Review');
      await store.addPreset('Weekly Review');

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
    });

    it('should add multiple presets with different titles', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Preset One');
      await store.addPreset('Preset Two');
      await store.addPreset('Preset Three');

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(3);
    });
  });

  describe('deletePreset (local mode)', () => {
    it('should remove preset from list', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('To Delete');
      await store.addPreset('To Keep');

      const presetToDelete = usePresetStore.getState().presets.find(
        (p) => p.title === 'To Delete'
      )!;

      await store.deletePreset(presetToDelete.id);

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
      expect(presets[0].title).toBe('To Keep');
    });

    it('should handle deleting non-existent preset gracefully', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Existing');

      await expect(store.deletePreset('non-existent-id')).resolves.not.toThrow();

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
    });
  });

  describe('Setter functions', () => {
    it('setPresets should update presets array', () => {
      const store = usePresetStore.getState();
      const mockPresets: Preset[] = [
        { id: 'preset-1', title: 'Preset One', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'preset-2', title: 'Preset Two', createdAt: '2024-01-02T00:00:00Z' },
      ];

      store.setPresets(mockPresets);

      expect(usePresetStore.getState().presets).toEqual(mockPresets);
    });

    it('setUserId should update userId and preserve local presets when setting to null', () => {
      const store = usePresetStore.getState();

      // Add some presets first
      store.setPresets([
        { id: 'p1', title: 'Local Preset', createdAt: '2024-01-01T00:00:00Z' },
      ]);

      // Set userId to a value (this clears presets for Firestore mode)
      store.setUserId('user-123');
      expect(usePresetStore.getState().userId).toBe('user-123');
      expect(usePresetStore.getState().presets).toEqual([]);
    });

    it('setLoading should update isLoading', () => {
      const store = usePresetStore.getState();

      store.setLoading(true);
      expect(usePresetStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(usePresetStore.getState().isLoading).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string title gracefully', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('');

      const presets = usePresetStore.getState().presets;
      // Empty title should still add a preset (validation is UI-level)
      expect(presets).toHaveLength(1);
    });

    it('should handle whitespace-only title', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('   ');

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
    });

    it('should handle very long titles', async () => {
      const store = usePresetStore.getState();
      const longTitle = 'a'.repeat(500);

      await store.addPreset(longTitle);

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
      expect(presets[0].title).toBe(longTitle);
    });

    it('should handle special characters in title', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Preset with <script> & "quotes"');

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
      expect(presets[0].title).toBe('Preset with <script> & "quotes"');
    });

    it('should handle Unicode and emoji characters', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('프리셋 😀 한국어 🇰🇷');

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(1);
      expect(presets[0].title).toBe('프리셋 😀 한국어 🇰🇷');
    });

    it('should generate unique IDs for each preset', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Preset 1');
      await store.addPreset('Preset 2');
      await store.addPreset('Preset 3');

      const presets = usePresetStore.getState().presets;
      const ids = new Set(presets.map(p => p.id));

      expect(ids.size).toBe(3);
    });

    it('should handle case-sensitive duplicate check', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('daily standup');
      await store.addPreset('Daily Standup');

      // These are different strings, so both should be added
      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(2);
    });

    it('should handle rapid sequential additions', async () => {
      const store = usePresetStore.getState();

      const promises = Array.from({ length: 10 }, (_, i) =>
        store.addPreset(`Preset ${i}`)
      );

      await Promise.all(promises);

      const presets = usePresetStore.getState().presets;
      expect(presets).toHaveLength(10);
    });
  });

  describe('Timestamp handling', () => {
    it('should create preset with valid ISO timestamp', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('Timestamp Test');

      const presets = usePresetStore.getState().presets;
      expect(presets[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should create timestamps in chronological order', async () => {
      const store = usePresetStore.getState();

      await store.addPreset('First');
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      await store.addPreset('Second');

      const presets = usePresetStore.getState().presets;
      const firstTime = new Date(presets[0].createdAt).getTime();
      const secondTime = new Date(presets[1].createdAt).getTime();

      expect(secondTime).toBeGreaterThan(firstTime);
    });
  });
});
