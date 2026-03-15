'use client'

import { useState } from 'react'
import { Settings, Users2, Trash2, LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTeamStore, type Team } from '@/store/teamStore'
import { useAuthStore } from '@/store/authStore'
import { TeamMembers } from './TeamMembers'
import { InviteDialog } from './InviteDialog'
import { DeleteTeamDialog } from './DeleteTeamDialog'
import { LeaveTeamDialog } from './LeaveTeamDialog'
import { canDeleteTeam, canLeaveTeam } from '@/lib/team-permissions'
import { cn } from '@/lib/utils'

/**
 * 통합 팀 관리 시트 컴포넌트
 *
 * SPEC-TEAM-002: 통합 팀 관리 메뉴
 *
 * 기능:
 * - 팀 정보 표시 (헤더 섹션)
 * - 팀원 관리 (멤버 섹션)
 * - 위험 영역 (팀 삭제/탈퇴)
 * - 역할 기반 UI 렌더링
 *
 * @MX:NOTE 통합 팀 관리의 메인 컴포넌트
 * UserMenu에서 "팀 관리" 클릭 시 표시됩니다
 */
export interface IntegratedTeamManagementSheetProps {
  teamId: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/**
 * 헤더 섹션 - 팀 기본 정보
 */
function HeaderSection({
  teamName,
  teamDescription,
}: {
  teamName: string
  teamDescription?: string
}) {
  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-xl font-semibold">{teamName}</h2>
        {teamDescription && (
          <p className="text-sm text-muted-foreground mt-1">{teamDescription}</p>
        )}
      </div>
      <Separator />
    </div>
  )
}

/**
 * 멤버 섹션 - 팀원 관리
 *
 * @MX:NOTE TeamMembers 컴포넌트를 100% 재사용
 */
function MembersSection({ teamId }: { teamId: string }) {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          <h3 className="font-medium">팀 멤버</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInvite(true)}
          className="gap-1"
        >
          초대
        </Button>
      </div>

      {/* TeamMembers 컴포넌트 재사용 (Dialog 없이 직접 렌더링) */}
      <TeamMembers teamId={teamId} className="mt-2" />

      {/* 초대 다이얼로그 */}
      <InviteDialog
        teamId={teamId}
        open={showInvite}
        onOpenChange={setShowInvite}
      />
    </div>
  )
}

/**
 * 위험 영역 섹션 - 팀 삭제/탈퇴
 *
 * @MX:WARN 위험한 작업이므로 명확한 경고 표시 필요
 */
function DangerZoneSection({
  team,
  canDelete,
  canLeave,
  isLastOwner,
}: {
  team: Team | null
  canDelete: boolean
  canLeave: boolean
  isLastOwner: boolean
}) {
  const [showDelete, setShowDelete] = useState(false)
  const [showLeave, setShowLeave] = useState(false)

  return (
    <div className="space-y-3 pt-4">
      <Separator />
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h3 className="font-medium">팀 관리</h3>
      </div>

      <div className="space-y-2">
        {/* 팀 삭제 버튼 */}
        {canDelete && (
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            팀 삭제
          </Button>
        )}

        {/* 팀 탈퇴 버튼 */}
        {canLeave && (
          <Button
            variant="outline"
            className="w-full justify-start hover:bg-muted"
            onClick={() => setShowLeave(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            팀 탈퇴
          </Button>
        )}

        {/* 마지막 소유자인 경우 경고 메시지 */}
        {isLastOwner && (
          <p className="text-xs text-muted-foreground">
            팀의 마지막 소유자입니다. 다른 멤버에게 소유자 권한을 이양한 후 탈퇴할 수
            있습니다.
          </p>
        )}
      </div>

      {/* 팀 삭제 다이얼로그 */}
      <DeleteTeamDialog
        team={canDelete ? team : null}
        open={showDelete}
        onOpenChange={setShowDelete}
      />

      {/* 팀 탈퇴 다이얼로그 */}
      <LeaveTeamDialog
        team={canLeave ? team : null}
        open={showLeave}
        onOpenChange={setShowLeave}
      />
    </div>
  )
}

/**
 * 메인 컴포넌트
 */
export function IntegratedTeamManagementSheet({
  teamId,
  trigger,
  open: controlledOpen,
  onOpenChange,
  className,
}: IntegratedTeamManagementSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // 제어되지 않는 모드 (trigger 제공 시)
  const isUncontrolled = controlledOpen === undefined
  const open = isUncontrolled ? internalOpen : controlledOpen
  const handleOpenChange = isUncontrolled ? setInternalOpen : onOpenChange

  const { currentTeam, members } = useTeamStore()
  const { user } = useAuthStore()

  // 현재 사용자의 역할 확인
  const currentUserId = user?.uid
  const currentMember = members.find((m) => m.id === currentUserId)
  const userRole = currentMember?.role || 'viewer'

  // 팀 정보
  const team = currentTeam
  const teamName = team?.name || '알 수 없는 팀'
  const teamDescription = team?.description

  // 소유자 수 확인 (마지막 소유자 체크용)
  const ownerCount = members.filter((m) => m.role === 'owner').length
  const isLastOwner = userRole === 'owner' && ownerCount <= 1

  // 권한 확인
  const canDelete = canDeleteTeam(userRole, isLastOwner)
  const canLeave = canLeaveTeam(userRole)

  const content = (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>팀 관리</SheetTitle>
          <SheetDescription>
            팀 멤버, 권한, 설정을 관리합니다
          </SheetDescription>
        </SheetHeader>

        <div className={cn('space-y-6 mt-6', className)}>
          {/* 헤더 섹션: 팀 정보 */}
          <HeaderSection
            teamName={teamName}
            teamDescription={teamDescription}
          />

          {/* 멤버 섹션: 팀원 관리 */}
          <MembersSection teamId={teamId} />

          {/* 위험 영역: 팀 삭제/탈퇴 */}
          <DangerZoneSection
            team={team}
            canDelete={canDelete}
            canLeave={canLeave}
            isLastOwner={isLastOwner}
          />
        </div>
      </SheetContent>
    </Sheet>
  )

  return content
}
