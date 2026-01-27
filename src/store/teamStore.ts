import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  collection,
  doc,
  updateDoc,
  query,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
  increment,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Types
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface TeamSettings {
  defaultRole: 'editor' | 'viewer'
  allowInviteLinks: boolean
}

export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  memberCount: number
  createdAt: string
  settings: TeamSettings
}

export interface TeamMember {
  id: string
  role: TeamRole
  displayName: string
  email: string
  joinedAt: string
}

export interface TeamMembership {
  teamId: string
  teamName: string
  role: TeamRole
  joinedAt: string
}

// State interface
interface TeamState {
  teams: Team[]
  currentTeamId: string | null
  currentTeam: Team | null
  members: TeamMember[]
  userId: string | null
  isLoading: boolean

  // Actions
  setUserId: (userId: string | null) => void
  setCurrentTeam: (teamId: string | null) => void
  createTeam: (name: string, description?: string) => Promise<string | null>
  updateTeam: (teamId: string, updates: { name?: string; description?: string; settings?: Partial<TeamSettings> }) => Promise<void>
  deleteTeam: (teamId: string) => Promise<void>
  leaveTeam: (teamId: string) => Promise<void>
  updateMemberRole: (teamId: string, memberId: string, newRole: TeamRole) => Promise<void>
  removeMember: (teamId: string, memberId: string) => Promise<void>
  clearTeams: () => void

  // Internal setters
  setTeams: (teams: Team[]) => void
  setMembers: (members: TeamMember[]) => void
  setLoading: (loading: boolean) => void
}

// Helper to convert Firestore timestamp to ISO string
function convertTimestamp(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return new Date().toISOString()
  if (typeof timestamp === 'string') return timestamp
  return timestamp.toDate().toISOString()
}

// Check if E2E test mode is enabled
function isE2ETestMode(): boolean {
  if (typeof window === 'undefined') return false
  if (process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true') return true
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('e2e') === 'true') return true
  if (localStorage.getItem('E2E_TEST_MODE') === 'true') return true
  return false
}

// Helper to get collection references
function getTeamsCollection() {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'teams')
}

function getTeamMembersCollection(teamId: string) {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'teams', teamId, 'members')
}

function getUserMembershipsCollection(userId: string) {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'users', userId, 'teamMemberships')
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeamId: null,
      currentTeam: null,
      members: [],
      userId: null,
      isLoading: false,

      setUserId: (userId) => {
        set({ userId, teams: [], members: [], currentTeam: null })
      },

      setCurrentTeam: (teamId) => {
        const { teams } = get()
        const team = teamId ? teams.find((t) => t.id === teamId) || null : null
        set({ currentTeamId: teamId, currentTeam: team, members: [] })
      },

      createTeam: async (name, description) => {
        let { userId } = get()
        const { teams, setTeams } = get()

        const trimmedName = name.trim().slice(0, 100)
        if (!trimmedName) return null

        // E2E mock mode: create team locally without Firestore
        if (isE2ETestMode()) {
          // In E2E mode, use mock user ID if userId is not set
          if (!userId) {
            userId = 'test-user-uid-12345' // Same as mockUser.uid in authStore
          }
          const mockTeamId = `mock-team-${Date.now()}`
          const mockTeam: Team = {
            id: mockTeamId,
            name: trimmedName,
            description: description?.trim() || undefined,
            ownerId: userId,
            memberCount: 1,
            createdAt: new Date().toISOString(),
            settings: {
              defaultRole: 'editor',
              allowInviteLinks: true,
            },
          }
          setTeams([...teams, mockTeam])
          console.log('[E2E] Created mock team:', mockTeamId)
          return mockTeamId
        }

        if (!userId || !db) return null

        try {
          const batch = writeBatch(db)

          const teamRef = doc(getTeamsCollection())
          const teamData = {
            name: trimmedName,
            description: description?.trim() || null,
            ownerId: userId,
            memberCount: 1,
            createdAt: Timestamp.now(),
            settings: {
              defaultRole: 'editor' as const,
              allowInviteLinks: true,
            },
          }
          batch.set(teamRef, teamData)

          const memberRef = doc(getTeamMembersCollection(teamRef.id), userId)
          const memberData = {
            role: 'owner' as TeamRole,
            displayName: '',
            email: '',
            joinedAt: Timestamp.now(),
          }
          batch.set(memberRef, memberData)

          const membershipRef = doc(getUserMembershipsCollection(userId), teamRef.id)
          const membershipData = {
            teamName: trimmedName,
            role: 'owner' as TeamRole,
            joinedAt: Timestamp.now(),
          }
          batch.set(membershipRef, membershipData)

          await batch.commit()
          return teamRef.id
        } catch (error) {
          console.error('Error creating team:', error)
          return null
        }
      },

      updateTeam: async (teamId, updates) => {
        const { userId } = get()
        if (!userId || !db) return

        try {
          const teamRef = doc(db, 'teams', teamId)
          const updateData: Record<string, unknown> = {}

          if (updates.name !== undefined) {
            updateData.name = updates.name.trim().slice(0, 100)
          }
          if (updates.description !== undefined) {
            updateData.description = updates.description?.trim() || null
          }
          if (updates.settings) {
            const { currentTeam } = get()
            if (currentTeam) {
              updateData.settings = {
                ...currentTeam.settings,
                ...updates.settings,
              }
            }
          }

          await updateDoc(teamRef, updateData)
        } catch (error) {
          console.error('Error updating team:', error)
          throw error
        }
      },

      deleteTeam: async (teamId) => {
        const { userId, currentTeamId } = get()
        if (!userId || !db) return

        try {
          const batch = writeBatch(db)

          const teamRef = doc(db, 'teams', teamId)
          batch.delete(teamRef)

          const membershipRef = doc(getUserMembershipsCollection(userId), teamId)
          batch.delete(membershipRef)

          await batch.commit()

          if (currentTeamId === teamId) {
            set({ currentTeamId: null, currentTeam: null, members: [] })
          }
        } catch (error) {
          console.error('Error deleting team:', error)
          throw error
        }
      },

      leaveTeam: async (teamId) => {
        const { userId, currentTeamId } = get()
        if (!userId || !db) return

        try {
          const batch = writeBatch(db)

          const memberRef = doc(getTeamMembersCollection(teamId), userId)
          batch.delete(memberRef)

          const membershipRef = doc(getUserMembershipsCollection(userId), teamId)
          batch.delete(membershipRef)

          const teamRef = doc(db, 'teams', teamId)
          batch.update(teamRef, { memberCount: increment(-1) })

          await batch.commit()

          if (currentTeamId === teamId) {
            set({ currentTeamId: null, currentTeam: null, members: [] })
          }
        } catch (error) {
          console.error('Error leaving team:', error)
          throw error
        }
      },

      updateMemberRole: async (teamId, memberId, newRole) => {
        const { userId } = get()
        if (!userId || !db) return

        if (newRole === 'owner') return

        try {
          const batch = writeBatch(db)

          const memberRef = doc(getTeamMembersCollection(teamId), memberId)
          batch.update(memberRef, { role: newRole })

          const membershipRef = doc(getUserMembershipsCollection(memberId), teamId)
          batch.update(membershipRef, { role: newRole })

          await batch.commit()
        } catch (error) {
          console.error('Error updating member role:', error)
          throw error
        }
      },

      removeMember: async (teamId, memberId) => {
        const { userId, members } = get()
        if (!userId || !db) return

        const member = members.find((m) => m.id === memberId)
        if (member?.role === 'owner') return

        try {
          const batch = writeBatch(db)

          const memberRef = doc(getTeamMembersCollection(teamId), memberId)
          batch.delete(memberRef)

          const membershipRef = doc(getUserMembershipsCollection(memberId), teamId)
          batch.delete(membershipRef)

          const teamRef = doc(db, 'teams', teamId)
          batch.update(teamRef, { memberCount: increment(-1) })

          await batch.commit()
        } catch (error) {
          console.error('Error removing member:', error)
          throw error
        }
      },

      clearTeams: () => {
        set({ teams: [], currentTeamId: null, currentTeam: null, members: [], userId: null })
      },

      setTeams: (teams) => {
        const { currentTeamId } = get()
        const currentTeam = currentTeamId ? teams.find((t) => t.id === currentTeamId) || null : null
        set({ teams, currentTeam })
      },

      setMembers: (members) => set({ members }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'team-storage',
      partialize: (state) => ({
        currentTeamId: state.currentTeamId,
      }),
    }
  )
)

// Subscription management
let teamsUnsubscribe: Unsubscribe | null = null
let membersUnsubscribe: Unsubscribe | null = null

export function subscribeToTeams(userId: string) {
  if (teamsUnsubscribe) {
    teamsUnsubscribe()
  }

  if (!db) {
    return () => {}
  }

  const { setTeams, setLoading, setUserId } = useTeamStore.getState()
  setUserId(userId)
  setLoading(true)

  const membershipsQuery = query(getUserMembershipsCollection(userId))

  teamsUnsubscribe = onSnapshot(
    membershipsQuery,
    async (snapshot) => {
      const teamIds = snapshot.docs.map((doc) => doc.id)

      if (teamIds.length === 0) {
        setTeams([])
        setLoading(false)
        return
      }

      const teams: Team[] = []
      for (const teamId of teamIds) {
        try {
          const teamDoc = await getDoc(doc(db!, 'teams', teamId))
          if (teamDoc.exists()) {
            const data = teamDoc.data()
            teams.push({
              id: teamDoc.id,
              name: data.name,
              description: data.description || undefined,
              ownerId: data.ownerId,
              memberCount: data.memberCount,
              createdAt: convertTimestamp(data.createdAt),
              settings: data.settings || { defaultRole: 'editor', allowInviteLinks: true },
            })
          }
        } catch (error) {
          console.error('Error fetching team ' + teamId + ':', error)
        }
      }

      setTeams(teams)
      setLoading(false)
    },
    (error) => {
      console.error('Error subscribing to teams:', error)
      setLoading(false)
    }
  )

  return teamsUnsubscribe
}

export function subscribeToTeamMembers(teamId: string) {
  if (membersUnsubscribe) {
    membersUnsubscribe()
  }

  if (!db) {
    return () => {}
  }

  const { setMembers } = useTeamStore.getState()

  const membersQuery = query(getTeamMembersCollection(teamId))

  membersUnsubscribe = onSnapshot(
    membersQuery,
    (snapshot) => {
      const members: TeamMember[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          role: data.role,
          displayName: data.displayName || '',
          email: data.email || '',
          joinedAt: convertTimestamp(data.joinedAt),
        }
      })

      setMembers(members)
    },
    (error) => {
      console.error('Error subscribing to team members:', error)
    }
  )

  return membersUnsubscribe
}

export function unsubscribeFromTeams() {
  if (teamsUnsubscribe) {
    teamsUnsubscribe()
    teamsUnsubscribe = null
  }
  const { clearTeams } = useTeamStore.getState()
  clearTeams()
}

export function unsubscribeFromTeamMembers() {
  if (membersUnsubscribe) {
    membersUnsubscribe()
    membersUnsubscribe = null
  }
  const { setMembers } = useTeamStore.getState()
  setMembers([])
}
