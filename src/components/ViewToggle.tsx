'use client'

import { useTodoStore, type ViewMode } from '@/store/todoStore'
import { List, Calendar } from 'lucide-react'

const viewOptions: { value: ViewMode; label: string; icon: typeof List }[] = [
  { value: 'list', label: '목록', icon: List },
  { value: 'calendar', label: '달력', icon: Calendar },
]

export function ViewToggle() {
  const { viewMode, setViewMode } = useTodoStore()

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {viewOptions.map((option) => {
        const Icon = option.icon
        const isActive = viewMode === option.value

        return (
          <button
            key={option.value}
            onClick={() => setViewMode(option.value)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
