'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTeamStore, type Team } from '@/store/teamStore'

interface LeaveTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onSuccess?: () => void
}

export function LeaveTeamDialog({ open, onOpenChange, team, onSuccess }: LeaveTeamDialogProps) {
  const [isLeaving, setIsLeaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { leaveTeam, setCurrentTeam, currentTeamId } = useTeamStore()

  const handleLeave = async () => {
    if (!team) return

    setIsLeaving(true)
    setError(null)

    try {
      await leaveTeam(team.id)

      // 탈퇴한 팀이 현재 선택된 팀이면 개인 모드로 전환
      if (currentTeamId === team.id) {
        setCurrentTeam(null)
      }

      handleClose()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '팀 탈퇴에 실패했습니다.')
    } finally {
      setIsLeaving(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onOpenChange(false)
  }

  if (!team) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팀 탈퇴</DialogTitle>
          <DialogDescription>
            정말로 <strong>&quot;{team.name}&quot;</strong> 팀에서 탈퇴하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              탈퇴 후에도 팀의 다른 멤버들은 계속 이 팀을 사용할 수 있습니다.
              다시 참여하려면 팀 관리자의 초대가 필요합니다.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLeaving}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {isLeaving ? '탈퇴 중...' : '팀 탈퇴'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
