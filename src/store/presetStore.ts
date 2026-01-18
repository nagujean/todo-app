import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Preset {
  id: string
  title: string // Changed from 'text' to 'title' for consistency
  createdAt: string // ISO 8601 format
}

interface PresetState {
  presets: Preset[]
  addPreset: (title: string) => void
  deletePreset: (id: string) => void
}

/**
 * Helper function to generate ISO 8601 timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString()
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      addPreset: (title) => {
        // 중복 체크
        const exists = get().presets.some((p) => p.title === title)
        if (exists) return

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
      },
      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== id),
        })),
    }),
    {
      name: 'preset-storage',
    }
  )
)
