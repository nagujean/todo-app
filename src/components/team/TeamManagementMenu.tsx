'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, Trash2, LogOut, Users } from 'lucide-react'
import { useTeamStore, type Team } from '@/store/teamStore'
import { cn } from '@/lib/utils'

interface TeamManagementMenuProps {
  team: Team
  onDeleteTeam: () => void
  onLeaveTeam: () => void
  onManageTeam?: () => void
  onOpenChange?: (open: boolean) => void
}

export function TeamManagementMenu({
  team,
  onDeleteTeam,
  onLeaveTeam,
  onManageTeam,
  onOpenChange,
}: TeamManagementMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { userId, getUserRole } = useTeamStore()
  const userRole = getUserRole(team.id)
  const isOwner = team.ownerId === userId || userRole === 'owner'

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      onOpenChange?.(true)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        onOpenChange?.(false)
      }
    }
  }, [isOpen, onOpenChange])

  // Close on escape key
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onDeleteTeam()
  }

  const handleLeaveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onLeaveTeam()
  }

  const handleManageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
    onManageTeam?.()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:opacity-100 focus:bg-accent focus:text-accent-foreground',
          isOpen && 'opacity-100 bg-accent text-accent-foreground'
        )}
        aria-label="팀 관리 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Settings className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover p-1 shadow-md z-50"
          role="menu"
          aria-label="팀 관리 옵션"
        >
          {/* 팀 관리 옵션 - 모든 사용자에게 표시 */}
          {onManageTeam && (
            <button
              type="button"
              onClick={handleManageClick}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                'text-muted-foreground'
              )}
              role="menuitem"
            >
              <Users className="h-4 w-4" />
              <span>팀 관리</span>
            </button>
          )}

          {/* 소유자만 팀 삭제 옵션 표시 */}
          {isOwner && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-destructive hover:text-destructive-foreground',
                'focus:bg-destructive focus:text-destructive-foreground',
                'text-destructive'
              )}
              role="menuitem"
            >
              <Trash2 className="h-4 w-4" />
              <span>팀 삭제</span>
            </button>
          )}

          {/* 소유자가 아닌 멤버만 탈퇴 옵션 표시 */}
          {!isOwner && (
            <button
              type="button"
              onClick={handleLeaveClick}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground',
                'text-muted-foreground'
              )}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              <span>팀 탈퇴</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
