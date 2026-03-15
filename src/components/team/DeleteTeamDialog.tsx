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
import { Input } from '@/components/ui/input'
import { useTeamStore, type Team } from '@/store/teamStore'

interface DeleteTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onSuccess?: () => void
}

export function DeleteTeamDialog({ open, onOpenChange, team, onSuccess }: DeleteTeamDialogProps) {
  const [teamNameInput, setTeamNameInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { deleteTeam, setCurrentTeam, currentTeamId } = useTeamStore()

  const isNameMatching = teamNameInput.trim() === team?.name

  const handleDelete = async () => {
    if (!team || !isNameMatching) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteTeam(team.id)

      // 삭제된 팀이 현재 선택된 팀이면 개인 모드로 전환
      if (currentTeamId === team.id) {
        setCurrentTeam(null)
      }

      handleClose()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '팀 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setTeamNameInput('')
    setError(null)
    onOpenChange(false)
  }

  if (!team) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">팀 삭제</DialogTitle>
          <DialogDescription>
            이 작업은 취소할 수 없습니다. 팀과 모든 데이터가 영구적으로 삭제됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              <strong>주의:</strong> 삭제 시 팀의 모든 할 일, 멤버 정보, 초대 링크가 함께 삭제됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="team-name-confirm" className="text-sm font-medium">
              확인을 위해 팀 이름을 입력하세요: <strong>{team.name}</strong>
            </label>
            <Input
              id="team-name-confirm"
              type="text"
              value={teamNameInput}
              onChange={(e) => setTeamNameInput(e.target.value)}
              placeholder="팀 이름 입력"
              disabled={isDeleting}
              autoFocus
            />
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
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || !isNameMatching}
          >
            {isDeleting ? '삭제 중...' : '팀 삭제'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
