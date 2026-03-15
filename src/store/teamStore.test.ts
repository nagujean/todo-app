import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useTeamStore, type Team, type TeamMember } from './teamStore';
import {
  createMockDocSnapshot,
} from '@/__tests__/test-utils';

// Track E2E mode and db state for runtime switching
let isE2EModeEnabled = false;
let mockDb: object | null = null;

// Configurable mock responses for Firebase operations
let mockGetDocResponse: ReturnType<typeof createMockDocSnapshot> | null = null;
let mockUpdateDocError: Error | null = null;
let mockBatchCommitError: Error | null = null;

// Track batch operations
let trackedBatchOperations: Array<{ type: string; ref: unknown; data?: unknown }> = [];

// Mock Firebase modules with configurable responses
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, ...pathSegments) => ({ path: pathSegments.join('/') })),
  doc: vi.fn((collectionOrDb, ...pathSegments) => ({
    id: pathSegments[pathSegments.length - 1] || 'mock-doc-id',
    path: pathSegments.join('/'),
  })),
  updateDoc: vi.fn(() => {
    if (mockUpdateDocError) {
      return Promise.reject(mockUpdateDocError);
    }
    return Promise.resolve();
  }),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
  },
  writeBatch: vi.fn(() => ({
    set: vi.fn((ref, data) => {
      trackedBatchOperations.push({ type: 'set', ref, data });
    }),
    delete: vi.fn((ref) => {
      trackedBatchOperations.push({ type: 'delete', ref });
    }),
    update: vi.fn((ref, data) => {
      trackedBatchOperations.push({ type: 'update', ref, data });
    }),
    commit: vi.fn(() => {
      if (mockBatchCommitError) {
        return Promise.reject(mockBatchCommitError);
      }
      return Promise.resolve();
    }),
  })),
  increment: vi.fn((n) => n),
  getDoc: vi.fn(() => {
    if (mockGetDocResponse) {
      return Promise.resolve(mockGetDocResponse);
    }
    return Promise.resolve({ exists: () => false, data: () => null });
  }),
}));

vi.mock('@/lib/firebase', () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: () => isE2EModeEnabled,
  convertTimestamp: vi.fn((ts) => ts || new Date().toISOString()),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Helper to enable/disable E2E mode with mock db
function setE2EMode(enabled: boolean) {
  isE2EModeEnabled = enabled;
  mockDb = enabled ? {} : null;
}

// Helper to set mock Firebase responses
function setMockUpdateDocError(error: Error | null) {
  mockUpdateDocError = error;
}

function setMockBatchCommitError(error: Error | null) {
  mockBatchCommitError = error;
}

function resetMockFirebase() {
  mockGetDocResponse = null;
  mockUpdateDocError = null;
  mockBatchCommitError = null;
  trackedBatchOperations = [];
}

describe('teamStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useTeamStore.getState();
    store.clearTeams();
    vi.clearAllMocks();
    setE2EMode(false);
    resetMockFirebase();
  });

  afterEach(() => {
    vi.clearAllMocks();
    setE2EMode(false);
    resetMockFirebase();
  });

  describe('Initial State', () => {
    it('should have correct initial state structure', () => {
      const state = useTeamStore.getState();

      expect(state).toHaveProperty('teams');
      expect(state).toHaveProperty('currentTeamId');
      expect(state).toHaveProperty('currentTeam');
      expect(state).toHaveProperty('members');
      expect(state).toHaveProperty('userId');
      expect(state).toHaveProperty('isLoading');
    });

    it('should have empty teams array by default', () => {
      const state = useTeamStore.getState();
      expect(state.teams).toEqual([]);
    });

    it('should have null currentTeamId by default', () => {
      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBeNull();
    });

    it('should have null currentTeam by default', () => {
      const state = useTeamStore.getState();
      expect(state.currentTeam).toBeNull();
    });

    it('should have empty members array by default', () => {
      const state = useTeamStore.getState();
      expect(state.members).toEqual([]);
    });

    it('should have null userId by default', () => {
      const state = useTeamStore.getState();
      expect(state.userId).toBeNull();
    });

    it('should have isLoading as false by default', () => {
      const state = useTeamStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Setter functions', () => {
    it('setUserId should update userId and clear teams', () => {
      const store = useTeamStore.getState();

      // First set some teams
      store.setTeams([
        {
          id: 'team-1',
          name: 'Test Team',
          ownerId: 'user-1',
          memberCount: 1,
          createdAt: new Date().toISOString(),
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      ]);

      store.setUserId('new-user-id');

      const state = useTeamStore.getState();
      expect(state.userId).toBe('new-user-id');
      expect(state.teams).toEqual([]);
    });

    it('setTeams should update teams array', () => {
      const store = useTeamStore.getState();
      const mockTeams: Team[] = [
        {
          id: 'team-1',
          name: 'Team One',
          ownerId: 'user-1',
          memberCount: 3,
          createdAt: '2024-01-01T00:00:00Z',
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
        {
          id: 'team-2',
          name: 'Team Two',
          ownerId: 'user-2',
          memberCount: 5,
          createdAt: '2024-01-02T00:00:00Z',
          settings: { defaultRole: 'viewer', allowInviteLinks: false },
        },
      ];

      store.setTeams(mockTeams);

      expect(useTeamStore.getState().teams).toEqual(mockTeams);
    });

    it('setMembers should update members array', () => {
      const store = useTeamStore.getState();
      const mockMembers: TeamMember[] = [
        {
          id: 'member-1',
          role: 'owner',
          displayName: 'John Doe',
          email: 'john@example.com',
          joinedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'member-2',
          role: 'editor',
          displayName: 'Jane Doe',
          email: 'jane@example.com',
          joinedAt: '2024-01-02T00:00:00Z',
        },
      ];

      store.setMembers(mockMembers);

      expect(useTeamStore.getState().members).toEqual(mockMembers);
    });

    it('setLoading should update isLoading', () => {
      const store = useTeamStore.getState();

      store.setLoading(true);
      expect(useTeamStore.getState().isLoading).toBe(true);

      store.setLoading(false);
      expect(useTeamStore.getState().isLoading).toBe(false);
    });

    it('setCurrentTeam should update currentTeamId and currentTeam', () => {
      const store = useTeamStore.getState();
      const mockTeam: Team = {
        id: 'team-1',
        name: 'Test Team',
        ownerId: 'user-1',
        memberCount: 1,
        createdAt: '2024-01-01T00:00:00Z',
        settings: { defaultRole: 'editor', allowInviteLinks: true },
      };

      store.setTeams([mockTeam]);
      store.setCurrentTeam('team-1');

      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBe('team-1');
      expect(state.currentTeam).toEqual(mockTeam);
    });

    it('setCurrentTeam with null should clear current team', () => {
      const store = useTeamStore.getState();

      store.setCurrentTeam(null);

      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBeNull();
      expect(state.currentTeam).toBeNull();
    });

    it('clearTeams should reset all team-related state', () => {
      const store = useTeamStore.getState();

      // Set up some state
      store.setTeams([
        {
          id: 'team-1',
          name: 'Test',
          ownerId: 'user-1',
          memberCount: 1,
          createdAt: '2024-01-01T00:00:00Z',
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      ]);
      store.setMembers([
        {
          id: 'member-1',
          role: 'owner',
          displayName: 'Test',
          email: 'test@example.com',
          joinedAt: '2024-01-01T00:00:00Z',
        },
      ]);
      useTeamStore.setState({ userId: 'user-123' });

      store.clearTeams();

      const state = useTeamStore.getState();
      expect(state.teams).toEqual([]);
      expect(state.currentTeamId).toBeNull();
      expect(state.currentTeam).toBeNull();
      expect(state.members).toEqual([]);
      expect(state.userId).toBeNull();
    });
  });

  describe('createTeam (REQ-005)', () => {
    it('should return null when userId is not set and not in E2E mode', async () => {
      const store = useTeamStore.getState();

      const result = await store.createTeam('New Team', 'Description');

      expect(result).toBeNull();
    });

    it('should return null for empty team name', async () => {
      setE2EMode(true);
      const store = useTeamStore.getState();

      const result = await store.createTeam('', 'Description');

      expect(result).toBeNull();
    });

    it('should return null for whitespace-only team name', async () => {
      setE2EMode(true);
      const store = useTeamStore.getState();

      const result = await store.createTeam('   ', 'Description');

      expect(result).toBeNull();
    });

    describe('E2E Mode', () => {
      beforeEach(() => {
        setE2EMode(true);
      });

      it('should create mock team in E2E mode without userId', async () => {
        const store = useTeamStore.getState();

        const result = await store.createTeam('New Team', 'Description');

        expect(result).not.toBeNull();
        expect(result).toContain('mock-team-');
      });

      it('should add mock team to teams array in E2E mode', async () => {
        const store = useTeamStore.getState();

        await store.createTeam('Test Team', 'A test team');

        const { teams } = useTeamStore.getState();
        expect(teams.length).toBe(1);
        expect(teams[0].name).toBe('Test Team');
        expect(teams[0].description).toBe('A test team');
        expect(teams[0].memberCount).toBe(1);
        expect(teams[0].settings.defaultRole).toBe('editor');
        expect(teams[0].settings.allowInviteLinks).toBe(true);
      });

      it('should use mock user ID as owner in E2E mode', async () => {
        const store = useTeamStore.getState();

        await store.createTeam('Test Team');

        const { teams } = useTeamStore.getState();
        expect(teams[0].ownerId).toBe('test-user-uid-12345');
      });

      it('should truncate team name to 100 characters', async () => {
        const store = useTeamStore.getState();
        const longName = 'A'.repeat(150);

        await store.createTeam(longName);

        const { teams } = useTeamStore.getState();
        expect(teams[0].name.length).toBe(100);
      });

      it('should handle undefined description', async () => {
        const store = useTeamStore.getState();

        await store.createTeam('Test Team');

        const { teams } = useTeamStore.getState();
        expect(teams[0].description).toBeUndefined();
      });

      it('should accumulate multiple teams', async () => {
        const store = useTeamStore.getState();

        await store.createTeam('Team 1');
        await store.createTeam('Team 2');
        await store.createTeam('Team 3');

        const { teams } = useTeamStore.getState();
        expect(teams.length).toBe(3);
      });
    });
  });

  describe('updateTeam (REQ-006)', () => {
    it('should not update when userId is not set', async () => {
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when userId is null)
      await expect(store.updateTeam('team-1', { name: 'New Name' })).resolves.toBeUndefined();
    });

    it('should not update when db is null', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when db is null)
      await expect(store.updateTeam('team-1', { name: 'New Name' })).resolves.toBeUndefined();
    });
  });

  describe('deleteTeam (REQ-006)', () => {
    it('should not delete when userId is not set', async () => {
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when userId is null)
      await expect(store.deleteTeam('team-1')).resolves.toBeUndefined();
    });

    it('should not delete when db is null', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when db is null)
      await expect(store.deleteTeam('team-1')).resolves.toBeUndefined();
    });
  });

  describe('leaveTeam (REQ-006)', () => {
    it('should not leave when userId is not set', async () => {
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when userId is null)
      await expect(store.leaveTeam('team-1')).resolves.toBeUndefined();
    });

    it('should not leave when db is null', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when db is null)
      await expect(store.leaveTeam('team-1')).resolves.toBeUndefined();
    });
  });

  describe('updateMemberRole (REQ-007)', () => {
    it('should not update role when userId is not set', async () => {
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when userId is null)
      await expect(store.updateMemberRole('team-1', 'member-1', 'editor')).resolves.toBeUndefined();
    });

    it('should not update role when db is null', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when db is null)
      await expect(store.updateMemberRole('team-1', 'member-1', 'editor')).resolves.toBeUndefined();
    });

    it('should prevent changing role to owner', async () => {
      // This tests the guard: if (newRole === 'owner') return
      setE2EMode(true);
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Should complete immediately without action when trying to set owner role
      await expect(store.updateMemberRole('team-1', 'member-1', 'owner')).resolves.toBeUndefined();
    });
  });

  describe('removeMember (REQ-007)', () => {
    it('should not remove member when userId is not set', async () => {
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when userId is null)
      await expect(store.removeMember('team-1', 'member-1')).resolves.toBeUndefined();
    });

    it('should not remove member when db is null', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Should complete without throwing (early return when db is null)
      await expect(store.removeMember('team-1', 'member-1')).resolves.toBeUndefined();
    });

    it('should prevent removing owner', async () => {
      // This tests the guard: if (member?.role === 'owner') return
      setE2EMode(true);
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      // Set up a member with owner role
      store.setMembers([
        {
          id: 'owner-member',
          role: 'owner',
          displayName: 'Owner',
          email: 'owner@example.com',
          joinedAt: new Date().toISOString(),
        },
      ]);

      // Should complete immediately without action when trying to remove owner
      await expect(store.removeMember('team-1', 'owner-member')).resolves.toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      setE2EMode(true);
    });

    it('should create multiple teams and set current team', () => {
      const store = useTeamStore.getState();

      // Use explicit teams with unique IDs to avoid timestamp collision issues
      const mockTeams: Team[] = [
        {
          id: 'integration-team-1',
          name: 'Team 1',
          description: 'First team',
          ownerId: 'user-1',
          memberCount: 1,
          createdAt: '2024-01-01T00:00:00Z',
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
        {
          id: 'integration-team-2',
          name: 'Team 2',
          description: 'Second team',
          ownerId: 'user-1',
          memberCount: 1,
          createdAt: '2024-01-02T00:00:00Z',
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      ];

      store.setTeams(mockTeams);
      const { teams } = useTeamStore.getState();
      expect(teams.length).toBe(2);

      // Set current team to Team 2
      store.setCurrentTeam('integration-team-2');

      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBe('integration-team-2');
      expect(state.currentTeam?.name).toBe('Team 2');
    });

    it('should update teams list and maintain currentTeam reference', () => {
      const store = useTeamStore.getState();

      const mockTeams: Team[] = [
        {
          id: 'team-1',
          name: 'Team One',
          ownerId: 'user-1',
          memberCount: 3,
          createdAt: '2024-01-01T00:00:00Z',
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
        {
          id: 'team-2',
          name: 'Team Two',
          ownerId: 'user-2',
          memberCount: 5,
          createdAt: '2024-01-02T00:00:00Z',
          settings: { defaultRole: 'viewer', allowInviteLinks: false },
        },
      ];

      // Set teams and current team
      store.setTeams(mockTeams);
      store.setCurrentTeam('team-1');

      // Update teams (simulating a refresh)
      const updatedTeams = mockTeams.map((t) =>
        t.id === 'team-1' ? { ...t, name: 'Updated Team One' } : t
      );
      store.setTeams(updatedTeams);

      // Current team should reflect the update
      const state = useTeamStore.getState();
      expect(state.currentTeam?.name).toBe('Updated Team One');
    });

    it('should handle setCurrentTeam with non-existent team ID', () => {
      const store = useTeamStore.getState();

      const mockTeams: Team[] = [
        {
          id: 'team-1',
          name: 'Team One',
          ownerId: 'user-1',
          memberCount: 1,
          createdAt: '2024-01-01T00:00:00Z',
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      ];

      store.setTeams(mockTeams);
      store.setCurrentTeam('non-existent-id');

      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBe('non-existent-id');
      expect(state.currentTeam).toBeNull();
    });
  });

  // ============================================================================
  // Firebase Path Tests for createTeam
  // ============================================================================
  describe('createTeam Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {};
      isE2EModeEnabled = false;
    });

    it('should return null when userId is null and not in E2E mode', async () => {
      const store = useTeamStore.getState();
      useTeamStore.setState({ userId: null });

      const result = await store.createTeam('New Team', 'Description');

      expect(result).toBeNull();
    });

    it('should return null when db is null and not in E2E mode', async () => {
      mockDb = null;
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();

      const result = await store.createTeam('New Team', 'Description');

      expect(result).toBeNull();
    });

    it('should call writeBatch operations when creating team', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');

      await store.createTeam('New Team', 'Description');

      expect(writeBatch).toHaveBeenCalled();
    });

    it('should return null when batch commit fails', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      setMockBatchCommitError(new Error('Batch commit failed'));
      const store = useTeamStore.getState();

      const result = await store.createTeam('New Team', 'Description');

      expect(result).toBeNull();
    });
  });

  // ============================================================================
  // Firebase Path Tests for updateTeam
  // ============================================================================
  describe('updateTeam Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {};
      isE2EModeEnabled = false;
    });

    it('should call updateDoc when updating team name', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { updateDoc } = await import('firebase/firestore');

      await store.updateTeam('team-123', { name: 'Updated Name' });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should call updateDoc when updating team description', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { updateDoc } = await import('firebase/firestore');

      await store.updateTeam('team-123', { description: 'New description' });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should call updateDoc when updating team settings', async () => {
      useTeamStore.setState({
        userId: 'user-123',
        currentTeam: {
          id: 'team-123',
          name: 'Test Team',
          ownerId: 'user-123',
          memberCount: 1,
          createdAt: new Date().toISOString(),
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      });
      const store = useTeamStore.getState();
      const { updateDoc } = await import('firebase/firestore');

      await store.updateTeam('team-123', { settings: { defaultRole: 'viewer' } });

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw error when updateDoc fails', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      setMockUpdateDocError(new Error('Update failed'));
      const store = useTeamStore.getState();

      await expect(store.updateTeam('team-123', { name: 'New Name' })).rejects.toThrow('Update failed');
    });
  });

  // ============================================================================
  // Firebase Path Tests for deleteTeam
  // ============================================================================
  describe('deleteTeam Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {};
      isE2EModeEnabled = false;
    });

    it('should call writeBatch when deleting team', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');

      await store.deleteTeam('team-123');

      expect(writeBatch).toHaveBeenCalled();
    });

    it('should clear currentTeam when deleting current team', async () => {
      useTeamStore.setState({
        userId: 'user-123',
        currentTeamId: 'team-123',
        currentTeam: {
          id: 'team-123',
          name: 'Test Team',
          ownerId: 'user-123',
          memberCount: 1,
          createdAt: new Date().toISOString(),
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      });
      const store = useTeamStore.getState();

      await store.deleteTeam('team-123');

      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBeNull();
      expect(state.currentTeam).toBeNull();
    });

    it('should throw error when batch commit fails', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      setMockBatchCommitError(new Error('Batch commit failed'));
      const store = useTeamStore.getState();

      await expect(store.deleteTeam('team-123')).rejects.toThrow('Batch commit failed');
    });
  });

  // ============================================================================
  // Firebase Path Tests for leaveTeam
  // ============================================================================
  describe('leaveTeam Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {};
      isE2EModeEnabled = false;
    });

    it('should call writeBatch when leaving team', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');

      await store.leaveTeam('team-123');

      expect(writeBatch).toHaveBeenCalled();
    });

    it('should clear currentTeam when leaving current team', async () => {
      useTeamStore.setState({
        userId: 'user-123',
        currentTeamId: 'team-123',
        currentTeam: {
          id: 'team-123',
          name: 'Test Team',
          ownerId: 'owner-123',
          memberCount: 2,
          createdAt: new Date().toISOString(),
          settings: { defaultRole: 'editor', allowInviteLinks: true },
        },
      });
      const store = useTeamStore.getState();

      await store.leaveTeam('team-123');

      const state = useTeamStore.getState();
      expect(state.currentTeamId).toBeNull();
      expect(state.currentTeam).toBeNull();
    });

    it('should throw error when batch commit fails', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      setMockBatchCommitError(new Error('Batch commit failed'));
      const store = useTeamStore.getState();

      await expect(store.leaveTeam('team-123')).rejects.toThrow('Batch commit failed');
    });
  });

  // ============================================================================
  // Firebase Path Tests for updateMemberRole
  // ============================================================================
  describe('updateMemberRole Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {};
      isE2EModeEnabled = false;
    });

    it('should call writeBatch when updating member role', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');

      await store.updateMemberRole('team-123', 'member-456', 'editor');

      expect(writeBatch).toHaveBeenCalled();
    });

    it('should not update role to owner', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');
      vi.clearAllMocks();

      await store.updateMemberRole('team-123', 'member-456', 'owner');

      // writeBatch should not be called because of early return
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it('should throw error when batch commit fails', async () => {
      useTeamStore.setState({ userId: 'user-123' });
      setMockBatchCommitError(new Error('Batch commit failed'));
      const store = useTeamStore.getState();

      await expect(store.updateMemberRole('team-123', 'member-456', 'editor')).rejects.toThrow('Batch commit failed');
    });
  });

  // ============================================================================
  // Firebase Path Tests for removeMember
  // ============================================================================
  describe('removeMember Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {};
      isE2EModeEnabled = false;
    });

    it('should call writeBatch when removing non-owner member', async () => {
      useTeamStore.setState({
        userId: 'user-123',
        members: [
          {
            id: 'member-456',
            role: 'editor',
            displayName: 'Member',
            email: 'member@example.com',
            joinedAt: new Date().toISOString(),
          },
        ],
      });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');

      await store.removeMember('team-123', 'member-456');

      expect(writeBatch).toHaveBeenCalled();
    });

    it('should not remove owner member', async () => {
      useTeamStore.setState({
        userId: 'user-123',
        members: [
          {
            id: 'owner-456',
            role: 'owner',
            displayName: 'Owner',
            email: 'owner@example.com',
            joinedAt: new Date().toISOString(),
          },
        ],
      });
      const store = useTeamStore.getState();
      const { writeBatch } = await import('firebase/firestore');
      vi.clearAllMocks();

      await store.removeMember('team-123', 'owner-456');

      // writeBatch should not be called because of early return
      expect(writeBatch).not.toHaveBeenCalled();
    });

    it('should throw error when batch commit fails', async () => {
      useTeamStore.setState({
        userId: 'user-123',
        members: [
          {
            id: 'member-456',
            role: 'editor',
            displayName: 'Member',
            email: 'member@example.com',
            joinedAt: new Date().toISOString(),
          },
        ],
      });
      setMockBatchCommitError(new Error('Batch commit failed'));
      const store = useTeamStore.getState();

      await expect(store.removeMember('team-123', 'member-456')).rejects.toThrow('Batch commit failed');
    });
  });
});
