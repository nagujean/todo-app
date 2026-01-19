import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '@/lib/firebase'

export interface Preset {
  id: string
  title: string
  createdAt: string
}

interface PresetState {
  presets: Preset[]
  userId: string | null
  isLoading: boolean
  addPreset: (title: string) => Promise<void>
  deletePreset: (id: string) => Promise<void>
  setUserId: (userId: string | null) => void
  setPresets: (presets: Preset[]) => void
  setLoading: (loading: boolean) => void
}

function getTimestamp(): string {
  return new Date().toISOString()
}

// Helper to get presets collection reference
function getPresetsCollection(userId: string) {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'users', userId, 'presets')
}

// Helper to convert Firestore timestamp to ISO string
function convertTimestamp(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return new Date().toISOString()
  if (typeof timestamp === 'string') return timestamp
  return timestamp.toDate().toISOString()
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      userId: null,
      isLoading: false,

      addPreset: async (title) => {
        const { userId, presets } = get()
        const exists = presets.some((p) => p.title === title)
        if (exists) return

        if (userId && db) {
          const presetData = {
            title,
            createdAt: Timestamp.now(),
          }

          await addDoc(getPresetsCollection(userId), presetData)
        } else {
          set((state) => ({
            presets: [
              ...state.presets,
              {
                id: crypto.randomUUID(),
                title,
                createdAt: getTimestamp(),
              },
            ],
          }))
        }
      },

      deletePreset: async (id) => {
        const { userId } = get()

        if (userId && db) {
          const presetRef = doc(db, 'users', userId, 'presets', id)
          await deleteDoc(presetRef)
        } else {
          set((state) => ({
            presets: state.presets.filter((preset) => preset.id !== id),
          }))
        }
      },

      setUserId: (userId) => set({ userId, presets: userId ? [] : get().presets }),
      setPresets: (presets) => set({ presets }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'preset-storage',
      partialize: (state) => ({
        // Only persist local presets when not logged in
        presets: state.userId ? [] : state.presets,
      }),
    }
  )
)

// Subscribe to Firestore changes
let unsubscribe: Unsubscribe | null = null

export function subscribeToPresets(userId: string) {
  if (unsubscribe) {
    unsubscribe()
  }

  if (!db) {
    return () => {}
  }

  const { setPresets, setLoading, setUserId } = usePresetStore.getState()
  setUserId(userId)
  setLoading(true)

  const presetsQuery = query(getPresetsCollection(userId))

  unsubscribe = onSnapshot(
    presetsQuery,
    (snapshot) => {
      const presets: Preset[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          createdAt: convertTimestamp(data.createdAt),
        }
      })

      setPresets(presets)
      setLoading(false)
    },
    (error) => {
      console.error('Error subscribing to presets:', error)
      setLoading(false)
    }
  )

  return unsubscribe
}

export function unsubscribeFromPresets() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
  const { setUserId } = usePresetStore.getState()
  setUserId(null)
}
