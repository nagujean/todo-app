import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Preset {
  id: string
  text: string
  createdAt: Date
}

interface PresetState {
  presets: Preset[]
  addPreset: (text: string) => void
  deletePreset: (id: string) => void
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set, get) => ({
      presets: [],
      addPreset: (text) => {
        // 중복 체크
        const exists = get().presets.some((p) => p.text === text)
        if (exists) return

        set((state) => ({
          presets: [
            ...state.presets,
            {
              id: crypto.randomUUID(),
              text,
              createdAt: new Date(),
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
