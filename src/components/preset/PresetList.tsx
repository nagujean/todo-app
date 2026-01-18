'use client'

import { Button } from '@/components/ui/button'
import { usePresetStore } from '@/store/presetStore'
import { useTodoStore } from '@/store/todoStore'
import { X } from 'lucide-react'

export function PresetList() {
  const { presets, deletePreset } = usePresetStore()
  const addTodo = useTodoStore((state) => state.addTodo)

  if (presets.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">빠른 추가</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <div key={preset.id} className="group relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTodo({ title: preset.title })} // Changed from 'text' to 'title'
              className="pr-7"
            >
              {preset.title} {/* Changed from preset.text to preset.title */}
            </Button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deletePreset(preset.id)
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
              aria-label={`${preset.title} 프리셋 삭제`} // Changed from preset.text to preset.title
            >
              <X className="h-3 w-3 text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
