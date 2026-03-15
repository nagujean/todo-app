import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  createMockInvitation,
  createExpiredDateString,
  createValidExpirationDateString,
  createMockDocSnapshot,
  createMockInvitationDoc,
  createMockMemberDoc,
} from '@/__tests__/test-utils'

// Track E2E mode for runtime switching
let isE2EModeEnabled = false

// Track mock db state
let mockDb: object | null = null

// Configurable mock responses for Firebase operations
let mockGetDocResponse: ReturnType<typeof createMockDocSnapshot> | null = null
let mockAddDocResponse: { id: string } | null = null
let mockUpdateDocError: Error | null = null
let mockDeleteDocError: Error | null = null
let mockBatchCommitError: Error | null = null

// Track batch operations
let trackedBatchOperations: Array<{ type: string; ref: unknown; data?: unknown }> = []

// Mock Firebase Firestore with configurable responses
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, ...pathSegments) => ({ path: pathSegments.join('/') })),
  doc: vi.fn((collectionOrDb, ...pathSegments) => ({
    id: pathSegments[pathSegments.length - 1] || 'mock-doc-id',
    path: pathSegments.join('/'),
  })),
  getDoc: vi.fn(() => {
    if (mockGetDocResponse) {
      return Promise.resolve(mockGetDocResponse)
    }
    return Promise.resolve({ exists: () => false, data: () => null })
  }),
  addDoc: vi.fn(() => {
    if (mockAddDocResponse) {
      return Promise.resolve(mockAddDocResponse)
    }
    return Promise.resolve({ id: 'new-doc-id' })
  }),
  updateDoc: vi.fn(() => {
    if (mockUpdateDocError) {
      return Promise.reject(mockUpdateDocError)
    }
    return Promise.resolve()
  }),
  deleteDoc: vi.fn(() => {
    if (mockDeleteDocError) {
      return Promise.reject(mockDeleteDocError)
    }
    return Promise.resolve()
  }),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date(), seconds: Date.now() / 1000, nanoseconds: 0 }),
    fromDate: (date: Date) => ({ toDate: () => date, seconds: date.getTime() / 1000, nanoseconds: 0 }),
  },
  writeBatch: vi.fn(() => ({
    set: vi.fn((ref, data) => {
      trackedBatchOperations.push({ type: 'set', ref, data })
    }),
    delete: vi.fn((ref) => {
      trackedBatchOperations.push({ type: 'delete', ref })
    }),
    update: vi.fn((ref, data) => {
      trackedBatchOperations.push({ type: 'update', ref, data })
    }),
    commit: vi.fn(() => {
      if (mockBatchCommitError) {
        return Promise.reject(mockBatchCommitError)
      }
      return Promise.resolve()
    }),
  })),
  increment: vi.fn((n: number) => n),
}))

// Mock Firebase instance - dynamically return mockDb
vi.mock('@/lib/firebase', () => ({
  get db() {
    return mockDb
  },
}))

// Mock utils with dynamic E2E mode check
vi.mock('@/lib/utils', () => ({
  isE2ETestMode: () => isE2EModeEnabled,
  convertTimestamp: vi.fn((ts) => {
    if (!ts) return new Date().toISOString()
    if (typeof ts === 'string') return ts
    if (ts.toDate) return ts.toDate().toISOString()
    return new Date().toISOString()
  }),
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

// Import after mocks are set up
import { useInvitationStore, generateInvitationLink, isInvitationExpired } from './invitationStore'

// Helper to enable/disable E2E mode with mock db
function setE2EMode(enabled: boolean) {
  isE2EModeEnabled = enabled
  // When E2E mode is enabled, provide a mock db object so the code proceeds past the !db check
  mockDb = enabled ? {} : null
}

// Helper to set mock Firebase responses
function setMockGetDocResponse(response: ReturnType<typeof createMockDocSnapshot> | null) {
  mockGetDocResponse = response
}

function setMockAddDocResponse(response: { id: string } | null) {
  mockAddDocResponse = response
}

function setMockUpdateDocError(error: Error | null) {
  mockUpdateDocError = error
}

function setMockDeleteDocError(error: Error | null) {
  mockDeleteDocError = error
}

function setMockBatchCommitError(error: Error | null) {
  mockBatchCommitError = error
}

function resetMockFirebase() {
  mockGetDocResponse = null
  mockAddDocResponse = null
  mockUpdateDocError = null
  mockDeleteDocError = null
  mockBatchCommitError = null
  trackedBatchOperations = []
}

describe('invitationStore', () => {
  beforeEach(() => {
    // Reset store state
    useInvitationStore.setState({
      pendingInvitations: [],
      teamInvitations: [],
      isLoading: false,
    })
    vi.clearAllMocks()
    setE2EMode(false)
    resetMockFirebase()
  })

  afterEach(() => {
    vi.clearAllMocks()
    setE2EMode(false)
    resetMockFirebase()
  })

  describe('Initial State', () => {
    it('should have correct initial state structure', () => {
      const state = useInvitationStore.getState()

      expect(state).toHaveProperty('pendingInvitations')
      expect(state).toHaveProperty('teamInvitations')
      expect(state).toHaveProperty('isLoading')
      expect(state).toHaveProperty('createEmailInvitation')
      expect(state).toHaveProperty('createLinkInvitation')
      expect(state).toHaveProperty('acceptInvitation')
      expect(state).toHaveProperty('declineInvitation')
      expect(state).toHaveProperty('revokeInvitation')
      expect(state).toHaveProperty('clearInvitations')
    })

    it('should have empty pendingInvitations array by default', () => {
      const state = useInvitationStore.getState()
      expect(state.pendingInvitations).toEqual([])
    })

    it('should have empty teamInvitations array by default', () => {
      const state = useInvitationStore.getState()
      expect(state.teamInvitations).toEqual([])
    })

    it('should have isLoading as false by default', () => {
      const state = useInvitationStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('Setter Functions', () => {
    it('setPendingInvitations should update pendingInvitations', () => {
      const mockInvitations = [createMockInvitation({ id: 'inv-1' })]
      const { setPendingInvitations } = useInvitationStore.getState()

      setPendingInvitations(mockInvitations)

      expect(useInvitationStore.getState().pendingInvitations).toEqual(mockInvitations)
    })

    it('setTeamInvitations should update teamInvitations', () => {
      const mockInvitations = [createMockInvitation({ id: 'inv-1', type: 'link' })]
      const { setTeamInvitations } = useInvitationStore.getState()

      setTeamInvitations(mockInvitations)

      expect(useInvitationStore.getState().teamInvitations).toEqual(mockInvitations)
    })

    it('setLoading should update isLoading', () => {
      const { setLoading } = useInvitationStore.getState()

      setLoading(true)
      expect(useInvitationStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useInvitationStore.getState().isLoading).toBe(false)
    })

    it('clearInvitations should reset all invitations', () => {
      // Set some initial invitations
      useInvitationStore.setState({
        pendingInvitations: [createMockInvitation({ id: 'inv-1' })],
        teamInvitations: [createMockInvitation({ id: 'inv-2', type: 'link' })],
      })

      const { clearInvitations } = useInvitationStore.getState()
      clearInvitations()

      const state = useInvitationStore.getState()
      expect(state.pendingInvitations).toEqual([])
      expect(state.teamInvitations).toEqual([])
    })
  })

  describe('Helper Functions (REQ-004)', () => {
    describe('generateInvitationLink', () => {
      it('should generate correct URL format', () => {
        const invitationId = 'test-invitation-123'
        const link = generateInvitationLink(invitationId)

        expect(link).toContain('/join/')
        expect(link).toContain(invitationId)
        expect(link).toMatch(/\/join\/test-invitation-123$/)
      })

      it('should handle empty invitation ID', () => {
        const link = generateInvitationLink('')
        expect(link).toMatch(/\/join\/$/)
      })

      it('should handle special characters in invitation ID', () => {
        const invitationId = 'inv-123-abc'
        const link = generateInvitationLink(invitationId)
        expect(link).toContain('/join/')
        expect(link).toContain(invitationId)
      })
    })

    describe('isInvitationExpired', () => {
      it('should return true for expired invitation', () => {
        const expiredDate = createExpiredDateString()
        expect(isInvitationExpired(expiredDate)).toBe(true)
      })

      it('should return false for valid invitation', () => {
        const validDate = createValidExpirationDateString()
        expect(isInvitationExpired(validDate)).toBe(false)
      })

      it('should return true for past date string', () => {
        const pastDate = new Date('2020-01-01T00:00:00Z').toISOString()
        expect(isInvitationExpired(pastDate)).toBe(true)
      })

      it('should return false for future date string', () => {
        const futureDate = new Date('2030-01-01T00:00:00Z').toISOString()
        expect(isInvitationExpired(futureDate)).toBe(false)
      })

      it('should handle boundary case - just expired', () => {
        // Create a date 1 second in the past
        const justExpired = new Date(Date.now() - 1000).toISOString()
        expect(isInvitationExpired(justExpired)).toBe(true)
      })

      it('should handle boundary case - about to expire', () => {
        // Create a date 1 minute in the future
        const aboutToExpire = new Date(Date.now() + 60000).toISOString()
        expect(isInvitationExpired(aboutToExpire)).toBe(false)
      })
    })
  })

  describe('createEmailInvitation (REQ-001)', () => {
    it('should return null when Firestore is not initialized', async () => {
      const { createEmailInvitation } = useInvitationStore.getState()

      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@example.com',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should return null for empty email', async () => {
      setE2EMode(true) // Enable E2E mode so we get past the db check
      const { createEmailInvitation } = useInvitationStore.getState()

      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        '',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should return null for whitespace-only email', async () => {
      setE2EMode(true)
      const { createEmailInvitation } = useInvitationStore.getState()

      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        '   ',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should return null for invalid email format', async () => {
      setE2EMode(true)
      const { createEmailInvitation } = useInvitationStore.getState()

      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'invalid-email',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should return null for email without domain', async () => {
      setE2EMode(true)
      const { createEmailInvitation } = useInvitationStore.getState()

      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    describe('E2E Mode', () => {
      beforeEach(() => {
        setE2EMode(true)
      })

      it('should create mock invitation in E2E mode', async () => {
        const { createEmailInvitation } = useInvitationStore.getState()

        const result = await createEmailInvitation(
          'team-123',
          'Test Team',
          'test@example.com',
          'editor',
          'user-123'
        )

        expect(result).not.toBeNull()
        expect(result).toContain('mock-invitation-')
      })

      it('should add mock invitation to teamInvitations in E2E mode', async () => {
        const { createEmailInvitation } = useInvitationStore.getState()

        await createEmailInvitation(
          'team-123',
          'Test Team',
          'test@example.com',
          'editor',
          'user-123'
        )

        const { teamInvitations } = useInvitationStore.getState()
        expect(teamInvitations.length).toBe(1)
        expect(teamInvitations[0].type).toBe('email')
        expect(teamInvitations[0].email).toBe('test@example.com')
        expect(teamInvitations[0].teamId).toBe('team-123')
        expect(teamInvitations[0].role).toBe('editor')
        expect(teamInvitations[0].status).toBe('pending')
      })

      it('should normalize email to lowercase in E2E mode', async () => {
        const { createEmailInvitation } = useInvitationStore.getState()

        await createEmailInvitation(
          'team-123',
          'Test Team',
          'TEST@EXAMPLE.COM',
          'viewer',
          'user-123'
        )

        const { teamInvitations } = useInvitationStore.getState()
        expect(teamInvitations[0].email).toBe('test@example.com')
      })

      it('should set correct expiration date in E2E mode', async () => {
        const { createEmailInvitation } = useInvitationStore.getState()

        await createEmailInvitation(
          'team-123',
          'Test Team',
          'test@example.com',
          'editor',
          'user-123'
        )

        const { teamInvitations } = useInvitationStore.getState()
        const expiresAt = new Date(teamInvitations[0].expiresAt)
        const now = new Date()

        // Expiration should be approximately 6 days 23 hours from now
        const diffMs = expiresAt.getTime() - now.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)

        expect(diffHours).toBeGreaterThan(166) // ~6 days 22 hours
        expect(diffHours).toBeLessThan(168) // ~7 days
      })
    })
  })

  describe('createLinkInvitation (REQ-002)', () => {
    it('should return null when Firestore is not initialized', async () => {
      const { createLinkInvitation } = useInvitationStore.getState()

      const result = await createLinkInvitation(
        'team-123',
        'Test Team',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    describe('E2E Mode', () => {
      beforeEach(() => {
        setE2EMode(true)
      })

      it('should create mock link invitation in E2E mode', async () => {
        const { createLinkInvitation } = useInvitationStore.getState()

        const result = await createLinkInvitation(
          'team-123',
          'Test Team',
          'editor',
          'user-123'
        )

        expect(result).not.toBeNull()
        expect(result).toContain('mock-link-invitation-')
      })

      it('should add mock link invitation to teamInvitations', async () => {
        const { createLinkInvitation } = useInvitationStore.getState()

        await createLinkInvitation(
          'team-123',
          'Test Team',
          'viewer',
          'user-123'
        )

        const { teamInvitations } = useInvitationStore.getState()
        expect(teamInvitations.length).toBe(1)
        expect(teamInvitations[0].type).toBe('link')
        expect(teamInvitations[0].email).toBeUndefined()
        expect(teamInvitations[0].teamId).toBe('team-123')
        expect(teamInvitations[0].role).toBe('viewer')
        expect(teamInvitations[0].status).toBe('pending')
      })

      it('should set default maxUses to 10', async () => {
        const { createLinkInvitation } = useInvitationStore.getState()

        await createLinkInvitation(
          'team-123',
          'Test Team',
          'editor',
          'user-123'
        )

        const { teamInvitations } = useInvitationStore.getState()
        expect(teamInvitations[0].maxUses).toBe(10)
        expect(teamInvitations[0].uses).toBe(0)
      })

      it('should respect custom maxUses parameter', async () => {
        const { createLinkInvitation } = useInvitationStore.getState()

        await createLinkInvitation(
          'team-123',
          'Test Team',
          'editor',
          'user-123',
          25
        )

        const { teamInvitations } = useInvitationStore.getState()
        expect(teamInvitations[0].maxUses).toBe(25)
      })

      it('should accumulate multiple link invitations', async () => {
        const { createLinkInvitation } = useInvitationStore.getState()

        await createLinkInvitation('team-1', 'Team 1', 'editor', 'user-1')
        await createLinkInvitation('team-2', 'Team 2', 'viewer', 'user-2')

        const { teamInvitations } = useInvitationStore.getState()
        expect(teamInvitations.length).toBe(2)
      })
    })
  })

  describe('acceptInvitation (REQ-003)', () => {
    it('should return false when Firestore is not initialized', async () => {
      const { acceptInvitation } = useInvitationStore.getState()

      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })
  })

  describe('declineInvitation', () => {
    it('should not throw when Firestore is not initialized', async () => {
      const { declineInvitation } = useInvitationStore.getState()

      // Should complete without throwing (early return when db is null)
      await expect(declineInvitation('invitation-123')).resolves.toBeUndefined()
    })
  })

  describe('revokeInvitation', () => {
    it('should not throw when Firestore is not initialized', async () => {
      const { revokeInvitation } = useInvitationStore.getState()

      // Should complete without throwing (early return when db is null)
      await expect(revokeInvitation('invitation-123')).resolves.toBeUndefined()
    })
  })

  describe('Integration with Team Operations', () => {
    beforeEach(() => {
      setE2EMode(true)
    })

    it('should handle mixed email and link invitations', async () => {
      const { createEmailInvitation, createLinkInvitation } = useInvitationStore.getState()

      await createEmailInvitation('team-1', 'Team 1', 'user1@example.com', 'editor', 'admin-1')
      await createLinkInvitation('team-1', 'Team 1', 'viewer', 'admin-1')
      await createEmailInvitation('team-1', 'Team 1', 'user2@example.com', 'editor', 'admin-1')

      const { teamInvitations } = useInvitationStore.getState()
      expect(teamInvitations.length).toBe(3)

      const emailInvitations = teamInvitations.filter(inv => inv.type === 'email')
      const linkInvitations = teamInvitations.filter(inv => inv.type === 'link')

      expect(emailInvitations.length).toBe(2)
      expect(linkInvitations.length).toBe(1)
    })

    it('should clear all invitations correctly', async () => {
      const { createEmailInvitation, createLinkInvitation, clearInvitations } = useInvitationStore.getState()

      await createEmailInvitation('team-1', 'Team 1', 'user@example.com', 'editor', 'admin-1')
      await createLinkInvitation('team-1', 'Team 1', 'viewer', 'admin-1')

      expect(useInvitationStore.getState().teamInvitations.length).toBe(2)

      clearInvitations()

      expect(useInvitationStore.getState().teamInvitations.length).toBe(0)
      expect(useInvitationStore.getState().pendingInvitations.length).toBe(0)
    })
  })

  // ============================================================================
  // Firebase Path Tests for acceptInvitation (REQ-003)
  // ============================================================================
  describe('acceptInvitation Firebase Paths', () => {
    beforeEach(() => {
      // Enable Firebase mode (not E2E mode)
      mockDb = {}
      isE2EModeEnabled = false
    })

    it('should return false when invitation does not exist', async () => {
      setMockGetDocResponse(createMockDocSnapshot({ exists: false }))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'nonexistent-invitation',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })

    it('should return false for expired invitation', async () => {
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ expiresAt: expiredDate })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })

    it('should return false for already accepted invitation', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ status: 'accepted' })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })

    it('should return false for declined invitation', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ status: 'declined' })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })

    it('should return false for link invitation that reached max uses', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ type: 'link', maxUses: 5, uses: 5 })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })

    it('should return false for email invitation with mismatched email', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ type: 'email', email: 'other@example.com' })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com', // Different from invitation email
        'Test User'
      )

      expect(result).toBe(false)
    })

    it('should return true for valid email invitation with matching email', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ type: 'email', email: 'test@example.com' })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(true)
    })

    it('should return true for valid link invitation with remaining uses', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ type: 'link', maxUses: 10, uses: 5 })
      ))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(true)
    })

    it('should return false when batch commit fails', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockInvitationDoc({ type: 'email', email: 'test@example.com' })
      ))
      setMockBatchCommitError(new Error('Batch commit failed'))

      const { acceptInvitation } = useInvitationStore.getState()
      const result = await acceptInvitation(
        'invitation-123',
        'user-123',
        'test@example.com',
        'Test User'
      )

      expect(result).toBe(false)
    })
  })

  // ============================================================================
  // Firebase Path Tests for declineInvitation
  // ============================================================================
  describe('declineInvitation Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {}
      isE2EModeEnabled = false
    })

    it('should call updateDoc to set status to declined', async () => {
      const { updateDoc } = await import('firebase/firestore')
      const { declineInvitation } = useInvitationStore.getState()

      await declineInvitation('invitation-123')

      expect(updateDoc).toHaveBeenCalled()
    })

    it('should throw error when updateDoc fails', async () => {
      setMockUpdateDocError(new Error('Update failed'))

      const { declineInvitation } = useInvitationStore.getState()

      await expect(declineInvitation('invitation-123')).rejects.toThrow('Update failed')
    })
  })

  // ============================================================================
  // Firebase Path Tests for revokeInvitation
  // ============================================================================
  describe('revokeInvitation Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {}
      isE2EModeEnabled = false
    })

    it('should call deleteDoc to remove invitation', async () => {
      const { deleteDoc } = await import('firebase/firestore')
      const { revokeInvitation } = useInvitationStore.getState()

      await revokeInvitation('invitation-123')

      expect(deleteDoc).toHaveBeenCalled()
    })

    it('should throw error when deleteDoc fails', async () => {
      setMockDeleteDocError(new Error('Delete failed'))

      const { revokeInvitation } = useInvitationStore.getState()

      await expect(revokeInvitation('invitation-123')).rejects.toThrow('Delete failed')
    })
  })

  // ============================================================================
  // Firebase Path Tests for createEmailInvitation
  // ============================================================================
  describe('createEmailInvitation Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {}
      isE2EModeEnabled = false
    })

    it('should return null when member document does not exist', async () => {
      setMockGetDocResponse(createMockDocSnapshot({ exists: false }))

      const { createEmailInvitation } = useInvitationStore.getState()
      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@example.com',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should return null when user role does not allow invitation', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockMemberDoc({ role: 'viewer' })
      ))

      const { createEmailInvitation } = useInvitationStore.getState()
      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@example.com',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should create invitation when user has owner role', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockMemberDoc({ role: 'owner' })
      ))
      setMockAddDocResponse({ id: 'new-invitation-id' })

      const { createEmailInvitation } = useInvitationStore.getState()
      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@example.com',
        'editor',
        'user-123'
      )

      expect(result).toBe('new-invitation-id')
    })

    it('should create invitation when user has admin role', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockMemberDoc({ role: 'admin' })
      ))
      setMockAddDocResponse({ id: 'new-invitation-id' })

      const { createEmailInvitation } = useInvitationStore.getState()
      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@example.com',
        'editor',
        'user-123'
      )

      expect(result).toBe('new-invitation-id')
    })

    it('should create invitation when user has editor role', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockMemberDoc({ role: 'editor' })
      ))
      setMockAddDocResponse({ id: 'new-invitation-id' })

      const { createEmailInvitation } = useInvitationStore.getState()
      const result = await createEmailInvitation(
        'team-123',
        'Test Team',
        'test@example.com',
        'editor',
        'user-123'
      )

      expect(result).toBe('new-invitation-id')
    })
  })

  // ============================================================================
  // Firebase Path Tests for createLinkInvitation
  // ============================================================================
  describe('createLinkInvitation Firebase Paths', () => {
    beforeEach(() => {
      mockDb = {}
      isE2EModeEnabled = false
    })

    it('should return null when member document does not exist', async () => {
      setMockGetDocResponse(createMockDocSnapshot({ exists: false }))

      const { createLinkInvitation } = useInvitationStore.getState()
      const result = await createLinkInvitation(
        'team-123',
        'Test Team',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should return null when user role does not allow invitation', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockMemberDoc({ role: 'viewer' })
      ))

      const { createLinkInvitation } = useInvitationStore.getState()
      const result = await createLinkInvitation(
        'team-123',
        'Test Team',
        'editor',
        'user-123'
      )

      expect(result).toBeNull()
    })

    it('should create link invitation when user has valid role', async () => {
      setMockGetDocResponse(createMockDocSnapshot(
        createMockMemberDoc({ role: 'owner' })
      ))
      setMockAddDocResponse({ id: 'new-link-invitation-id' })

      const { createLinkInvitation } = useInvitationStore.getState()
      const result = await createLinkInvitation(
        'team-123',
        'Test Team',
        'editor',
        'user-123',
        20
      )

      expect(result).toBe('new-link-invitation-id')
    })
  })
})
