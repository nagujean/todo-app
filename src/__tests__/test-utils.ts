import { vi } from 'vitest'
import type { User } from 'firebase/auth'
import type { Team, TeamMember, TeamRole } from '@/store/teamStore'
import type { Invitation, InvitationType, InvitationStatus, InvitationRole } from '@/store/invitationStore'

// ============================================================================
// Mock User Factory
// ============================================================================

export interface MockUserOptions {
  uid?: string
  email?: string
  displayName?: string
  emailVerified?: boolean
}

export function createMockUser(options: MockUserOptions = {}): User {
  const {
    uid = 'test-user-uid-12345',
    email = 'test@example.com',
    displayName = 'Test User',
    emailVerified = true,
  } = options

  return {
    uid,
    email,
    displayName,
    emailVerified,
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
}

// ============================================================================
// Mock Team Factory
// ============================================================================

export interface MockTeamOptions {
  id?: string
  name?: string
  description?: string
  ownerId?: string
  memberCount?: number
  createdAt?: string
  settings?: {
    defaultRole?: 'editor' | 'viewer'
    allowInviteLinks?: boolean
  }
}

export function createMockTeam(options: MockTeamOptions = {}): Team {
  const {
    id = `team-${Date.now()}`,
    name = 'Test Team',
    description,
    ownerId = 'test-user-uid-12345',
    memberCount = 1,
    createdAt = new Date().toISOString(),
    settings = { defaultRole: 'editor', allowInviteLinks: true },
  } = options

  return {
    id,
    name,
    description,
    ownerId,
    memberCount,
    createdAt,
    settings,
  }
}

// ============================================================================
// Mock Team Member Factory
// ============================================================================

export interface MockTeamMemberOptions {
  id?: string
  role?: TeamRole
  displayName?: string
  email?: string
  joinedAt?: string
}

export function createMockTeamMember(options: MockTeamMemberOptions = {}): TeamMember {
  const {
    id = `member-${Date.now()}`,
    role = 'editor',
    displayName = 'Test Member',
    email = 'member@example.com',
    joinedAt = new Date().toISOString(),
  } = options

  return {
    id,
    role,
    displayName,
    email,
    joinedAt,
  }
}

// ============================================================================
// Mock Invitation Factory
// ============================================================================

export interface MockInvitationOptions {
  id?: string
  teamId?: string
  teamName?: string
  type?: InvitationType
  email?: string
  role?: InvitationRole
  createdBy?: string
  createdAt?: string
  expiresAt?: string
  status?: InvitationStatus
  maxUses?: number
  uses?: number
}

export function createMockInvitation(options: MockInvitationOptions = {}): Invitation {
  const now = new Date()
  const expirationDate = new Date(now.getTime() + (6 * 24 + 23) * 60 * 60 * 1000)

  const {
    id = `invitation-${Date.now()}`,
    teamId = 'team-123',
    teamName = 'Test Team',
    type = 'email',
    email = type === 'email' ? 'invited@example.com' : undefined,
    role = 'editor',
    createdBy = 'test-user-uid-12345',
    createdAt = now.toISOString(),
    expiresAt = expirationDate.toISOString(),
    status = 'pending',
    maxUses = type === 'link' ? 10 : undefined,
    uses = type === 'link' ? 0 : undefined,
  } = options

  return {
    id,
    teamId,
    teamName,
    type,
    email,
    role,
    createdBy,
    createdAt,
    expiresAt,
    status,
    maxUses,
    uses,
  }
}

// ============================================================================
// Firebase Mock Factories
// ============================================================================

/**
 * Mock document data for getDoc responses
 */
export interface MockDocData {
  exists: boolean
  id?: string
  data?: Record<string, unknown>
}

/**
 * Creates a mock DocumentSnapshot for getDoc responses
 */
export function createMockDocSnapshot(config: MockDocData) {
  return {
    exists: () => config.exists,
    id: config.id || 'mock-doc-id',
    data: () => config.data || null,
    ref: { id: config.id || 'mock-doc-id' },
  }
}

/**
 * Creates a tracked write batch mock that records operations
 */
export function createTrackedWriteBatchMock() {
  const operations: Array<{ type: string; ref: unknown; data?: unknown }> = []

  return {
    operations,
    batch: {
      set: vi.fn((ref, data) => {
        operations.push({ type: 'set', ref, data })
      }),
      delete: vi.fn((ref) => {
        operations.push({ type: 'delete', ref })
      }),
      update: vi.fn((ref, data) => {
        operations.push({ type: 'update', ref, data })
      }),
      commit: vi.fn().mockResolvedValue(undefined),
    },
  }
}

/**
 * Creates a mock invitation document for testing acceptInvitation
 */
export function createMockInvitationDoc(options: {
  exists?: boolean
  teamId?: string
  teamName?: string
  type?: 'email' | 'link'
  email?: string
  role?: 'editor' | 'viewer'
  status?: 'pending' | 'accepted' | 'declined'
  expiresAt?: Date
  maxUses?: number
  uses?: number
} = {}): MockDocData {
  const {
    exists = true,
    teamId = 'team-123',
    teamName = 'Test Team',
    type = 'email',
    email = 'test@example.com',
    role = 'editor',
    status = 'pending',
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    maxUses = 10,
    uses = 0,
  } = options

  if (!exists) {
    return { exists: false }
  }

  return {
    exists: true,
    id: 'invitation-123',
    data: {
      teamId,
      teamName,
      type,
      email: type === 'email' ? email : undefined,
      role,
      status,
      expiresAt: { toDate: () => expiresAt },
      maxUses: type === 'link' ? maxUses : undefined,
      uses: type === 'link' ? uses : undefined,
    },
  }
}

/**
 * Creates a mock team member document for permission checks
 */
export function createMockMemberDoc(options: {
  exists?: boolean
  role?: 'owner' | 'admin' | 'editor' | 'viewer'
} = {}): MockDocData {
  const { exists = true, role = 'owner' } = options

  if (!exists) {
    return { exists: false }
  }

  return {
    exists: true,
    id: 'member-123',
    data: { role },
  }
}

export function createFirestoreMock() {
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    Timestamp: {
      now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
      fromDate: (date: Date) => ({ toDate: () => date, seconds: date.getTime() / 1000, nanoseconds: 0 }),
    },
    increment: vi.fn((n: number) => n),
  }
}

export function createAuthMock() {
  return {
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    onAuthStateChanged: vi.fn(),
  }
}

// ============================================================================
// Timestamp Mock Helpers
// ============================================================================

export function createMockTimestamp(date: Date = new Date()) {
  return {
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  }
}

export function createPastTimestamp(daysAgo: number): ReturnType<typeof createMockTimestamp> {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return createMockTimestamp(date)
}

export function createFutureTimestamp(daysAhead: number): ReturnType<typeof createMockTimestamp> {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  return createMockTimestamp(date)
}

// ============================================================================
// Store Reset Utilities
// ============================================================================

/**
 * Resets a Zustand store to a specific state
 * @param store - The Zustand store (e.g., useAuthStore)
 * @param initialState - Partial state to reset to
 */
export function resetStoreState<T extends object>(
  store: { getState: () => T; setState: (state: Partial<T>) => void },
  initialState: Partial<T>
) {
  store.setState(initialState)
}

/**
 * Creates a mock for isE2ETestMode function
 * @param isE2E - Whether to mock as E2E mode
 */
export function mockE2EMode(isE2E: boolean = false) {
  return vi.fn(() => isE2E)
}

// ============================================================================
// Date Helpers for Testing
// ============================================================================

/**
 * Creates a date string for an expired invitation (in the past)
 */
export function createExpiredDateString(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1) // 1 day ago
  return date.toISOString()
}

/**
 * Creates a date string for a valid invitation (in the future)
 */
export function createValidExpirationDateString(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7) // 7 days from now
  return date.toISOString()
}

/**
 * Creates a date string for an invitation expiring soon (within hours)
 */
export function createExpiringSoonDateString(hoursFromNow: number = 1): string {
  const date = new Date()
  date.setTime(date.getTime() + hoursFromNow * 60 * 60 * 1000)
  return date.toISOString()
}
