'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User, Users, UserPlus, Settings, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useTeamStore } from '@/store/teamStore'
import { TeamMembers, InviteDialog } from '@/components/team'

export function UserMenu() {
  const { user, logout, loading } = useAuthStore()
  const { currentTeam, currentTeamId } = useTeamStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Error is handled in the store
    }
  }

  const displayName = user.displayName || user.email?.split('@')[0] || '사용자'

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline max-w-[100px] truncate">{displayName}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-lg z-50">
            <div className="p-2 border-b">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            {currentTeam && currentTeamId && (
              <div className="p-1 border-b">
                <button
                  onClick={() => {
                    setShowMembers(true)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                >
                  <Users className="h-4 w-4" />
                  팀 멤버
                </button>
                <button
                  onClick={() => {
                    setShowInvite(true)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"
                >
                  <UserPlus className="h-4 w-4" />
                  팀원 초대
                </button>
              </div>
            )}

            <div className="p-1">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent text-destructive disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>

      {currentTeamId && (
        <>
          <TeamMembers
            teamId={currentTeamId}
            open={showMembers}
            onOpenChange={setShowMembers}
          />
          <InviteDialog
            teamId={currentTeamId}
            open={showInvite}
            onOpenChange={setShowInvite}
          />
        </>
      )}
    </>
  )
}
