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
import { TeamRole } from './teamStore'

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

// Helper to convert Firestore timestamp to ISO string
function convertTimestamp(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return new Date().toISOString()
  if (typeof timestamp === 'string') return timestamp
  return timestamp.toDate().toISOString()
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

// Helper to create expiration date (7 days from now)
function createExpirationDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date
}

export const useInvitationStore = create<InvitationState>()(
  persist(
    (set, get) => ({
      pendingInvitations: [],
      teamInvitations: [],
      isLoading: false,

      createEmailInvitation: async (teamId, teamName, email, role, createdBy) => {
        if (!db) return null

        const trimmedEmail = email.trim().toLowerCase()
        if (!trimmedEmail) return null

        try {
          const invitationData = {
            teamId,
            teamName,
            type: 'email' as InvitationType,
            email: trimmedEmail,
            role,
            createdBy,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(createExpirationDate()),
            status: 'pending' as InvitationStatus,
          }

          const docRef = await addDoc(getInvitationsCollection(), invitationData)
          return docRef.id
        } catch (error) {
          console.error('Error creating email invitation:', error)
          return null
        }
      },

      createLinkInvitation: async (teamId, teamName, role, createdBy, maxUses = 10) => {
        if (!db) return null

        try {
          const invitationData = {
            teamId,
            teamName,
            type: 'link' as InvitationType,
            role,
            createdBy,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(createExpirationDate()),
            status: 'pending' as InvitationStatus,
            maxUses,
            uses: 0,
          }

          const docRef = await addDoc(getInvitationsCollection(), invitationData)
          return docRef.id
        } catch (error) {
          console.error('Error creating link invitation:', error)
          return null
        }
      },

      acceptInvitation: async (invitationId, userId, userEmail, displayName) => {
        if (!db) return false

        try {
          const invitationRef = doc(db, 'invitations', invitationId)
          const invitationDoc = await getDoc(invitationRef)

          if (!invitationDoc.exists()) {
            console.error('Invitation not found')
            return false
          }

          const invitationData = invitationDoc.data()

          // Check expiration
          const expiresAt = convertTimestamp(invitationData.expiresAt)
          if (isInvitationExpired(expiresAt)) {
            console.error('Invitation has expired')
            return false
          }

          // Check status
          if (invitationData.status !== 'pending') {
            console.error('Invitation is no longer pending')
            return false
          }

          // Check max uses for link invitations
          if (invitationData.type === 'link') {
            if (invitationData.maxUses && invitationData.uses >= invitationData.maxUses) {
              console.error('Invitation has reached maximum uses')
              return false
            }
          }

          // Check email match for email invitations
          if (invitationData.type === 'email' && invitationData.email !== userEmail.toLowerCase()) {
            console.error('Email does not match invitation')
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
          console.error('Error accepting invitation:', error)
          return false
        }
      },

      declineInvitation: async (invitationId) => {
        if (!db) return

        try {
          const invitationRef = doc(db, 'invitations', invitationId)
          await updateDoc(invitationRef, { status: 'declined' })
        } catch (error) {
          console.error('Error declining invitation:', error)
          throw error
        }
      },

      revokeInvitation: async (invitationId) => {
        if (!db) return

        try {
          const invitationRef = doc(db, 'invitations', invitationId)
          await deleteDoc(invitationRef)
        } catch (error) {
          console.error('Error revoking invitation:', error)
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
      console.error('Error subscribing to user invitations:', error)
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
      console.error('Error subscribing to team invitations:', error)
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
