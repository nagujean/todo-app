import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
  increment,
  getDoc,
  addDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { isE2ETestMode, convertTimestamp } from '@/lib/utils'
import { TeamRole } from './teamStore'
import { logger } from '@/lib/logger'

// Types
export type InvitationType = 'email' | 'link'
export type InvitationStatus = 'pending' | 'accepted' | 'declined'
export type InvitationRole = Exclude<TeamRole, 'owner' | 'admin'>

export interface Invitation {
  id: string
  teamId: string
  teamName: string
  type: InvitationType
  email?: string
  role: InvitationRole
  createdBy: string
  createdAt: string
  expiresAt: string
  status: InvitationStatus
  maxUses?: number
  uses?: number
}

// State interface
interface InvitationState {
  pendingInvitations: Invitation[]
  teamInvitations: Invitation[]
  isLoading: boolean

  // Actions
  createEmailInvitation: (
    teamId: string,
    teamName: string,
    email: string,
    role: InvitationRole,
    createdBy: string
  ) => Promise<string | null>
  createLinkInvitation: (
    teamId: string,
    teamName: string,
    role: InvitationRole,
    createdBy: string,
    maxUses?: number
  ) => Promise<string | null>
  acceptInvitation: (invitationId: string, userId: string, userEmail: string, displayName: string) => Promise<boolean>
  declineInvitation: (invitationId: string) => Promise<void>
  revokeInvitation: (invitationId: string) => Promise<void>
  clearInvitations: () => void

  // Internal setters
  setPendingInvitations: (invitations: Invitation[]) => void
  setTeamInvitations: (invitations: Invitation[]) => void
  setLoading: (loading: boolean) => void
}

// Helper to get invitations collection reference
function getInvitationsCollection() {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'invitations')
}

// Helper to get team members collection reference
function getTeamMembersCollection(teamId: string) {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'teams', teamId, 'members')
}

// Helper to get user memberships collection reference
function getUserMembershipsCollection(userId: string) {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'users', userId, 'teamMemberships')
}

// Helper to generate invitation link URL
export function generateInvitationLink(invitationId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/join/${invitationId}`
}

// Helper to check if invitation is expired
export function isInvitationExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

// Helper to create expiration date (6 days 23 hours from now)
// Note: Using slightly less than 7 days to account for clock skew between client and server
// Firestore rules validate: expiresAt <= request.time + 7 days
function createExpirationDate(): Date {
  const date = new Date()
  // 6 days 23 hours = 167 hours = 6 * 24 + 23 hours
  date.setTime(date.getTime() + (6 * 24 + 23) * 60 * 60 * 1000)
  return date
}

export const useInvitationStore = create<InvitationState>()(
  persist(
    (set, get) => ({
      pendingInvitations: [],
      teamInvitations: [],
      isLoading: false,

      createEmailInvitation: async (teamId, teamName, email, role, createdBy) => {
        if (!db) {
          logger.error('Error creating email invitation: Firestore not initialized')
          return null
        }

        const trimmedEmail = email.trim().toLowerCase()
        if (!trimmedEmail) {
          logger.error('Error creating email invitation: Email is empty')
          return null
        }

        // Validate email format (same regex as Firestore rules)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(trimmedEmail)) {
          logger.error('Error creating email invitation: Invalid email format')
          return null
        }

        // E2E mock mode: create invitation locally without Firestore
        if (isE2ETestMode()) {
          const mockInvitationId = `mock-invitation-${Date.now()}`
          const expirationDate = createExpirationDate()
          const mockInvitation: Invitation = {
            id: mockInvitationId,
            teamId,
            teamName,
            type: 'email',
            email: trimmedEmail,
            role,
            createdBy,
            createdAt: new Date().toISOString(),
            expiresAt: expirationDate.toISOString(),
            status: 'pending',
          }
          const { teamInvitations } = get()
          set({ teamInvitations: [...teamInvitations, mockInvitation] })
          logger.debug('[E2E] Created mock email invitation:', mockInvitationId)
          return mockInvitationId
        }

        try {
          // Pre-validation: Check if member document exists
          const memberRef = doc(db, 'teams', teamId, 'members', createdBy)
          const memberDoc = await getDoc(memberRef)

          if (!memberDoc.exists()) {
            logger.error('Member document does not exist. User is not a team member.')
            return null
          }

          const memberData = memberDoc.data()
          const memberRole = memberData?.role

          if (!['owner', 'admin', 'editor'].includes(memberRole)) {
            logger.error('User role does not allow invitation creation. Current role:', memberRole)
            return null
          }

          const expirationDate = createExpirationDate()
          const invitationData = {
            teamId,
            teamName,
            type: 'email' as InvitationType,
            email: trimmedEmail,
            role,
            createdBy,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(expirationDate),
            status: 'pending' as InvitationStatus,
          }

          const docRef = await addDoc(getInvitationsCollection(), invitationData)
          logger.debug('Email invitation created:', docRef.id)
          return docRef.id
        } catch (error) {
          const firebaseError = error as { code?: string; message?: string }
          logger.error('Error creating email invitation:', {
            code: firebaseError.code,
            message: firebaseError.message,
            teamId,
            createdBy,
            role,
          })

          return null
        }
      },

      createLinkInvitation: async (teamId, teamName, role, createdBy, maxUses = 10) => {
        if (!db) {
          logger.error('Error creating link invitation: Firestore not initialized')
          return null
        }

        // E2E mock mode: create invitation locally without Firestore
        if (isE2ETestMode()) {
          const mockInvitationId = `mock-link-invitation-${Date.now()}`
          const expirationDate = createExpirationDate()
          const mockInvitation: Invitation = {
            id: mockInvitationId,
            teamId,
            teamName,
            type: 'link',
            role,
            createdBy,
            createdAt: new Date().toISOString(),
            expiresAt: expirationDate.toISOString(),
            status: 'pending',
            maxUses,
            uses: 0,
          }
          const { teamInvitations } = get()
          set({ teamInvitations: [...teamInvitations, mockInvitation] })
          logger.debug('[E2E] Created mock link invitation:', mockInvitationId)
          return mockInvitationId
        }

        try {
          // Pre-validation: Check if member document exists
          const memberRef = doc(db, 'teams', teamId, 'members', createdBy)
          const memberDoc = await getDoc(memberRef)

          if (!memberDoc.exists()) {
            logger.error('Member document does not exist. User is not a team member.')
            return null
          }

          const memberData = memberDoc.data()
          const memberRole = memberData?.role

          if (!['owner', 'admin', 'editor'].includes(memberRole)) {
            logger.error('User role does not allow invitation creation. Current role:', memberRole)
            return null
          }

          const expirationDate = createExpirationDate()
          const invitationData = {
            teamId,
            teamName,
            type: 'link' as InvitationType,
            role,
            createdBy,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(expirationDate),
            status: 'pending' as InvitationStatus,
            maxUses,
            uses: 0,
          }

          const docRef = await addDoc(getInvitationsCollection(), invitationData)
          logger.debug('Link invitation created:', docRef.id)
          return docRef.id
        } catch (error) {
          const firebaseError = error as { code?: string; message?: string }
          logger.error('Error creating link invitation:', {
            code: firebaseError.code,
            message: firebaseError.message,
            teamId,
            createdBy,
            role,
          })

          return null
        }
      },

      acceptInvitation: async (invitationId, userId, userEmail, displayName) => {
        if (!db) return false

        try {
          const invitationRef = doc(db, 'invitations', invitationId)
          const invitationDoc = await getDoc(invitationRef)

          if (!invitationDoc.exists()) {
            logger.error('Invitation not found')
            return false
          }

          const invitationData = invitationDoc.data()

          // Check expiration
          const expiresAt = convertTimestamp(invitationData.expiresAt)
          if (isInvitationExpired(expiresAt)) {
            logger.error('Invitation has expired')
            return false
          }

          // Check status
          if (invitationData.status !== 'pending') {
            logger.error('Invitation is no longer pending')
            return false
          }

          // Check max uses for link invitations
          if (invitationData.type === 'link') {
            if (invitationData.maxUses && invitationData.uses >= invitationData.maxUses) {
              logger.error('Invitation has reached maximum uses')
              return false
            }
          }

          // Check email match for email invitations
          if (invitationData.type === 'email' && invitationData.email !== userEmail.toLowerCase()) {
            logger.error('Email does not match invitation')
            return false
          }

          const batch = writeBatch(db)

          // Add user to team members
          const memberRef = doc(getTeamMembersCollection(invitationData.teamId), userId)
          const memberData = {
            role: invitationData.role,
            displayName: displayName || '',
            email: userEmail,
            joinedAt: Timestamp.now(),
          }
          batch.set(memberRef, memberData)

          // Add team to user memberships
          const membershipRef = doc(getUserMembershipsCollection(userId), invitationData.teamId)
          const membershipData = {
            teamId: invitationData.teamId,
            teamName: invitationData.teamName,
            role: invitationData.role,
            joinedAt: Timestamp.now(),
          }
          batch.set(membershipRef, membershipData)

          // Update team memberCount
          const teamRef = doc(db, 'teams', invitationData.teamId)
          batch.update(teamRef, { memberCount: increment(1) })

          // Update invitation status or uses
          if (invitationData.type === 'email') {
            batch.update(invitationRef, { status: 'accepted' })
          } else {
            batch.update(invitationRef, { uses: increment(1) })
          }

          await batch.commit()
          return true
        } catch (error) {
          logger.error('Error accepting invitation:', error)
          return false
        }
      },

      declineInvitation: async (invitationId) => {
        if (!db) return

        try {
          const invitationRef = doc(db, 'invitations', invitationId)
          await updateDoc(invitationRef, { status: 'declined' })
        } catch (error) {
          logger.error('Error declining invitation:', error)
          throw error
        }
      },

      revokeInvitation: async (invitationId) => {
        if (!db) return

        try {
          const invitationRef = doc(db, 'invitations', invitationId)
          await deleteDoc(invitationRef)
        } catch (error) {
          logger.error('Error revoking invitation:', error)
          throw error
        }
      },

      clearInvitations: () => {
        set({ pendingInvitations: [], teamInvitations: [] })
      },

      setPendingInvitations: (pendingInvitations) => set({ pendingInvitations }),
      setTeamInvitations: (teamInvitations) => set({ teamInvitations }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'invitation-storage',
      partialize: () => ({}), // Don't persist any invitation data
    }
  )
)

// Subscription management
let userInvitationsUnsubscribe: Unsubscribe | null = null
let teamInvitationsUnsubscribe: Unsubscribe | null = null

export function subscribeToUserInvitations(email: string) {
  if (userInvitationsUnsubscribe) {
    userInvitationsUnsubscribe()
  }

  if (!db || !email) {
    return () => {}
  }

  const { setPendingInvitations, setLoading } = useInvitationStore.getState()
  setLoading(true)

  const trimmedEmail = email.trim().toLowerCase()
  const invitationsQuery = query(
    getInvitationsCollection(),
    where('email', '==', trimmedEmail),
    where('status', '==', 'pending')
  )

  userInvitationsUnsubscribe = onSnapshot(
    invitationsQuery,
    (snapshot) => {
      const invitations: Invitation[] = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            teamId: data.teamId,
            teamName: data.teamName,
            type: data.type as InvitationType,
            email: data.email,
            role: data.role as InvitationRole,
            createdBy: data.createdBy,
            createdAt: convertTimestamp(data.createdAt),
            expiresAt: convertTimestamp(data.expiresAt),
            status: data.status as InvitationStatus,
            maxUses: data.maxUses,
            uses: data.uses,
          }
        })
        .filter((invitation) => !isInvitationExpired(invitation.expiresAt))

      setPendingInvitations(invitations)
      setLoading(false)
    },
    (error) => {
      logger.error('Error subscribing to user invitations:', error)
      setLoading(false)
    }
  )

  return userInvitationsUnsubscribe
}

export function subscribeToTeamInvitations(teamId: string) {
  if (teamInvitationsUnsubscribe) {
    teamInvitationsUnsubscribe()
  }

  if (!db || !teamId) {
    return () => {}
  }

  const { setTeamInvitations } = useInvitationStore.getState()

  const invitationsQuery = query(
    getInvitationsCollection(),
    where('teamId', '==', teamId)
  )

  teamInvitationsUnsubscribe = onSnapshot(
    invitationsQuery,
    (snapshot) => {
      const invitations: Invitation[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          teamId: data.teamId,
          teamName: data.teamName,
          type: data.type as InvitationType,
          email: data.email,
          role: data.role as InvitationRole,
          createdBy: data.createdBy,
          createdAt: convertTimestamp(data.createdAt),
          expiresAt: convertTimestamp(data.expiresAt),
          status: data.status as InvitationStatus,
          maxUses: data.maxUses,
          uses: data.uses,
        }
      })

      setTeamInvitations(invitations)
    },
    (error) => {
      logger.error('Error subscribing to team invitations:', error)
    }
  )

  return teamInvitationsUnsubscribe
}

export function unsubscribeFromInvitations() {
  if (userInvitationsUnsubscribe) {
    userInvitationsUnsubscribe()
    userInvitationsUnsubscribe = null
  }
  if (teamInvitationsUnsubscribe) {
    teamInvitationsUnsubscribe()
    teamInvitationsUnsubscribe = null
  }
  const { clearInvitations } = useInvitationStore.getState()
  clearInvitations()
}
