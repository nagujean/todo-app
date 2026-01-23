'use client'

import { useState, useEffect } from 'react'
import { UserMinus, ChevronDown, Shield, Crown, Pencil, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTeamStore, type TeamRole, subscribeToTeamMembers, unsubscribeFromTeamMembers } from '@/store/teamStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export interface TeamMembersProps {
  teamId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: '소유자',
  admin: '관리자',
  editor: '편집자',
  viewer: '뷰어',
}

const ROLE_ICONS: Record<TeamRole, React.ReactNode> = {
  owner: <Crown className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  editor: <Pencil className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
}

const ROLE_COLORS: Record<TeamRole, string> = {
  owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

const ASSIGNABLE_ROLES: TeamRole[] = ['admin', 'editor', 'viewer']

export function TeamMembers({ teamId, open, onOpenChange, className }: TeamMembersProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const { members, updateMemberRole, removeMember } = useTeamStore()
  const { user } = useAuthStore()

  // Subscribe to team members when dialog is open
  useEffect(() => {
    if (!open) return
    const unsubscribe = subscribeToTeamMembers(teamId)
    return () => {
      unsubscribe()
      unsubscribeFromTeamMembers()
    }
  }, [teamId, open])

  const currentUserId = user?.uid
  const currentMember = members.find((m) => m.id === currentUserId)
  const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin'

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    setIsUpdating(memberId)
    setRoleDropdownOpen(null)
    try {
      await updateMemberRole(teamId, memberId, newRole)
    } catch (error) {
      console.error('Failed to update member role:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('이 멤버를 팀에서 제거하시겠습니까?')) {
      return
    }

    setIsUpdating(memberId)
    try {
      await removeMember(teamId, memberId)
    } catch (error) {
      console.error('Failed to remove member:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const content = (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        {members.map((member) => {
          const isOwner = member.role === 'owner'
          const isCurrentUser = member.id === currentUserId
          const canModify = isAdmin && !isOwner && !isCurrentUser

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              {/* Member info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {member.displayName || '(이름 없음)'}
                    {isCurrentUser && (
                      <span className="text-muted-foreground text-xs ml-1">(나)</span>
                    )}
                  </span>
                </div>
                {member.email && (
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                )}
              </div>

              {/* Role badge / dropdown */}
              <div className="flex items-center gap-2">
                {canModify ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setRoleDropdownOpen(roleDropdownOpen === member.id ? null : member.id)
                      }
                      disabled={isUpdating === member.id}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        ROLE_COLORS[member.role],
                        'hover:opacity-80',
                        isUpdating === member.id && 'opacity-50'
                      )}
                      aria-expanded={roleDropdownOpen === member.id}
                      aria-haspopup="listbox"
                    >
                      {ROLE_ICONS[member.role]}
                      <span>{ROLE_LABELS[member.role]}</span>
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 transition-transform',
                          roleDropdownOpen === member.id && 'rotate-180'
                        )}
                      />
                    </button>

                    {roleDropdownOpen === member.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-32 rounded-md border bg-popover p-1 shadow-md z-50"
                        role="listbox"
                        aria-label="역할 선택"
                      >
                        {ASSIGNABLE_ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleChange(member.id, role)}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
                              'hover:bg-accent hover:text-accent-foreground',
                              member.role === role && 'bg-accent'
                            )}
                            role="option"
                            aria-selected={member.role === role}
                          >
                            {ROLE_ICONS[role]}
                            <span>{ROLE_LABELS[role]}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                      ROLE_COLORS[member.role]
                    )}
                  >
                    {ROLE_ICONS[member.role]}
                    <span>{ROLE_LABELS[member.role]}</span>
                  </span>
                )}

                {/* Remove button */}
                {canModify && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={isUpdating === member.id}
                    title="멤버 제거"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            팀 멤버가 없습니다.
          </p>
        )}
      </div>
    </div>
  )

  // If open/onOpenChange are provided, wrap in Dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>팀 멤버</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  // Otherwise render directly
  return content
}
