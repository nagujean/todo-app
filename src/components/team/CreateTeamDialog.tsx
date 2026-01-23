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
import { Textarea } from '@/components/ui/textarea'
import { useTeamStore } from '@/store/teamStore'

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

export function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createTeam, setCurrentTeam } = useTeamStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('팀 이름을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const teamId = await createTeam(trimmedName, description.trim() || undefined)
      if (teamId) {
        setCurrentTeam(teamId)
        handleClose()
      } else {
        setError('팀 생성에 실패했습니다. 다시 시도해주세요.')
      }
    } catch {
      setError('팀 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setError(null)
    onOpenChange(false)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_NAME_LENGTH) {
      setName(value)
      setError(null)
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 팀 만들기</DialogTitle>
          <DialogDescription>
            팀을 만들어 다른 사람들과 할 일을 함께 관리하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              팀 이름 <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                id="team-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="팀 이름을 입력하세요"
                maxLength={MAX_NAME_LENGTH}
                disabled={isSubmitting}
                aria-describedby={error ? 'name-error' : undefined}
                aria-invalid={!!error}
                className={error ? 'border-destructive' : ''}
                autoFocus
              />
              {name.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {name.length}/{MAX_NAME_LENGTH}
                </span>
              )}
            </div>
            {error && (
              <p id="name-error" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="team-description" className="text-sm font-medium">
              설명 <span className="text-muted-foreground text-xs">(선택)</span>
            </label>
            <div className="relative">
              <Textarea
                id="team-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="팀에 대한 설명을 입력하세요"
                maxLength={MAX_DESCRIPTION_LENGTH}
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
              />
              {description.length > 0 && (
                <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? '만드는 중...' : '만들기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
