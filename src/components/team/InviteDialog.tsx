'use client'

import { useState } from 'react'
import { Copy, Check, Mail, Link as LinkIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTeamStore } from '@/store/teamStore'
import { useInvitationStore, generateInvitationLink, type InvitationRole } from '@/store/invitationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface InviteDialogProps {
  teamId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type InviteMethod = 'email' | 'link'

const ROLE_OPTIONS: { value: InvitationRole; label: string; description: string }[] = [
  { value: 'editor', label: '편집자', description: '할 일을 추가, 수정, 삭제할 수 있습니다' },
  { value: 'viewer', label: '뷰어', description: '할 일을 볼 수만 있습니다' },
]

export function InviteDialog({ teamId, open, onOpenChange }: InviteDialogProps) {
  const [method, setMethod] = useState<InviteMethod>('email')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitationRole>('editor')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const { currentTeam } = useTeamStore()
  const { createEmailInvitation, createLinkInvitation } = useInvitationStore()
  const { user } = useAuthStore()

  const handleClose = () => {
    setEmail('')
    setRole('editor')
    setError(null)
    setSuccess(null)
    setCopied(false)
    setInviteLink(null)
    onOpenChange(false)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('이메일 주소를 입력해주세요.')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('올바른 이메일 주소를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user?.uid) {
        setError('로그인이 필요합니다.')
        return
      }

      if (!currentTeam?.name) {
        setError('팀 정보를 불러올 수 없습니다.')
        return
      }

      console.log('Attempting to create invitation:', {
        teamId,
        teamName: currentTeam.name,
        email: trimmedEmail,
        role,
        userId: user.uid,
      })

      const invitationId = await createEmailInvitation(
        teamId,
        currentTeam.name,
        trimmedEmail,
        role,
        user.uid
      )

      if (invitationId) {
        setSuccess(`${trimmedEmail}에 초대 이메일을 보냈습니다.`)
        setEmail('')
      } else {
        setError('초대 생성에 실패했습니다. 브라우저 콘솔(F12)에서 상세 오류를 확인하세요.')
      }
    } catch (err) {
      console.error('Invitation creation error:', err)
      setError('초대 이메일 전송에 실패했습니다. 브라우저 콘솔(F12)에서 상세 오류를 확인하세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateLink = async () => {
    if (!user?.uid) {
      setError('로그인이 필요합니다.')
      return
    }

    if (!currentTeam?.name) {
      setError('팀 정보를 불러올 수 없습니다.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log('Attempting to create link invitation:', {
        teamId,
        teamName: currentTeam.name,
        role,
        userId: user.uid,
      })

      const invitationId = await createLinkInvitation(
        teamId,
        currentTeam.name,
        role,
        user.uid
      )

      if (invitationId) {
        const link = generateInvitationLink(invitationId)
        setInviteLink(link)
      } else {
        setError('초대 링크 생성에 실패했습니다. 브라우저 콘솔(F12)에서 상세 오류를 확인하세요.')
      }
    } catch (err) {
      console.error('Link invitation creation error:', err)
      setError('초대 링크 생성에 실패했습니다. 브라우저 콘솔(F12)에서 상세 오류를 확인하세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteLink) {
      await handleGenerateLink()
      return
    }

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = inviteLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>팀원 초대</DialogTitle>
          <DialogDescription>
            {currentTeam?.name}에 새 멤버를 초대하세요.
          </DialogDescription>
        </DialogHeader>

        {/* Method toggle */}
        <div className="flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => {
              setMethod('email')
              setError(null)
              setSuccess(null)
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              method === 'email'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Mail className="h-4 w-4" />
            <span>이메일로 초대</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod('link')
              setError(null)
              setSuccess(null)
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              method === 'link'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LinkIcon className="h-4 w-4" />
            <span>링크로 초대</span>
          </button>
        </div>

        {/* Role selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">역할</label>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={cn(
                  'flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                  role === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Email invite form */}
        {method === 'email' && (
          <form onSubmit={handleEmailInvite} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                이메일 주소
              </label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                  setSuccess(null)
                }}
                placeholder="email@example.com"
                disabled={isSubmitting}
                aria-describedby={error ? 'email-error' : success ? 'email-success' : undefined}
                aria-invalid={!!error}
                className={error ? 'border-destructive' : ''}
              />
              {error && (
                <p id="email-error" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {success && (
                <p id="email-success" className="text-sm text-green-600 dark:text-green-400">
                  {success}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full"
            >
              {isSubmitting ? '보내는 중...' : '초대하기'}
            </Button>
          </form>
        )}

        {/* Link invite */}
        {method === 'link' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">초대 링크</label>
              {inviteLink ? (
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    title="링크 복사"
                    disabled={isSubmitting}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  링크 생성 버튼을 눌러 초대 링크를 만드세요.
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <p className="text-xs text-muted-foreground">
                이 링크를 통해 가입하는 사람은 {ROLE_OPTIONS.find((o) => o.value === role)?.label}{' '}
                역할로 팀에 참여합니다.
              </p>
            </div>

            <Button
              type="button"
              onClick={inviteLink ? handleCopyLink : handleGenerateLink}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '생성 중...' : inviteLink ? (copied ? '복사됨!' : '링크 복사') : '초대 링크 생성'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
