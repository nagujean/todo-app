import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTeamStore, type Team, type TeamMember } from './teamStore';

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
  },
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  increment: vi.fn((n) => n),
  getDoc: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({
  db: null, // Set to null to use local/mock mode
}));

vi.mock('@/lib/utils', () => ({
  isE2ETestMode: vi.fn(() => false),
  convertTimestamp: vi.fn((ts) => ts || new Date().toISOString()),
}));

describe('teamStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    const store = useTeamStore.getState();
    store.clearTeams();
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

  describe('createTeam (with null db)', () => {
    it('should return null when userId is not set and not in E2E mode', async () => {
      const store = useTeamStore.getState();

      const result = await store.createTeam('New Team', 'Description');

      expect(result).toBeNull();
    });
  });
});
