'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Users, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTeamStore } from '@/store/teamStore'
import { cn } from '@/lib/utils'
import { CreateTeamDialog } from './CreateTeamDialog'

interface TeamSwitcherProps {
  className?: string
}

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { teams, currentTeamId, currentTeam, setCurrentTeam, isLoading } = useTeamStore()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelectTeam = (teamId: string | null) => {
    setCurrentTeam(teamId)
    setIsOpen(false)
  }

  const handleCreateTeam = () => {
    setIsOpen(false)
    setShowCreateDialog(true)
  }

  const displayName = currentTeam ? currentTeam.name : '개인'

  return (
    <>
      <div ref={dropdownRef} className={cn('relative', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center gap-2 min-w-[120px] justify-between"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="워크스페이스 선택"
        >
          <span className="flex items-center gap-2 truncate">
            {currentTeam ? (
              <Users className="h-4 w-4 shrink-0" />
            ) : (
              <User className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate max-w-[100px]">{displayName}</span>
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </Button>

        {isOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-56 rounded-md border bg-popover p-1 shadow-md z-50"
            role="listbox"
            aria-label="워크스페이스 목록"
          >
            {/* Personal option */}
            <button
              type="button"
              onClick={() => handleSelectTeam(null)}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                !currentTeamId && 'bg-accent text-accent-foreground'
              )}
              role="option"
              aria-selected={!currentTeamId}
            >
              <User className="h-4 w-4" />
              <span>개인</span>
            </button>

            {/* Team list */}
            {teams.length > 0 && (
              <>
                <div className="my-1 h-px bg-border" role="separator" />
                <div className="max-h-48 overflow-y-auto">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => handleSelectTeam(team.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus:bg-accent focus:text-accent-foreground',
                        currentTeamId === team.id && 'bg-accent text-accent-foreground'
                      )}
                      role="option"
                      aria-selected={currentTeamId === team.id}
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      <span className="truncate">{team.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {team.memberCount}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Create team button */}
            <div className="my-1 h-px bg-border" role="separator" />
            <button
              type="button"
              onClick={handleCreateTeam}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                'text-muted-foreground'
              )}
            >
              <Plus className="h-4 w-4" />
              <span>새 팀 만들기</span>
            </button>
          </div>
        )}
      </div>

      <CreateTeamDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
