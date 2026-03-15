/**
 * 팀 권한 유틸리티 단위 테스트
 *
 * SPEC-TEAM-002 권한 매트릭스 검증
 */

import { describe, it, expect } from 'vitest'
import {
  canPerformAction,
  canDeleteTeam,
  canLeaveTeam,
  getRolePermissions,
  type TeamAction,
} from './team-permissions'

describe('team-permissions', () => {
  describe('canPerformAction', () => {
    it('owner는 모든 작업을 수행할 수 있다 (팀 탈퇴 제외)', () => {
      const ownerActions: TeamAction[] = [
        'view_members',
        'invite_member',
        'remove_member',
        'change_role',
        'view_settings',
        'edit_settings',
        'delete_team',
      ]

      ownerActions.forEach((action) => {
        expect(canPerformAction(action, 'owner')).toBe(true)
      })

      // owner는 팀 탈퇴 불가
      expect(canPerformAction('leave_team', 'owner')).toBe(false)
    })

    it('admin은 팀 삭제를 제외한 모든 관리 작업을 수행할 수 있다', () => {
      const adminActions: TeamAction[] = [
        'view_members',
        'invite_member',
        'remove_member',
        'change_role',
        'view_settings',
        'edit_settings',
        'leave_team',
      ]

      adminActions.forEach((action) => {
        expect(canPerformAction(action, 'admin')).toBe(true)
      })

      // admin은 팀 삭제 불가
      expect(canPerformAction('delete_team', 'admin')).toBe(false)
    })

    it('editor는 팀원 보기와 팀 탈퇴만 가능하다', () => {
      expect(canPerformAction('view_members', 'editor')).toBe(true)
      expect(canPerformAction('leave_team', 'editor')).toBe(true)

      const editorNotAllowedActions: TeamAction[] = [
        'invite_member',
        'remove_member',
        'change_role',
        'view_settings',
        'edit_settings',
        'delete_team',
      ]

      editorNotAllowedActions.forEach((action) => {
        expect(canPerformAction(action, 'editor')).toBe(false)
      })
    })

    it('viewer는 팀원 보기와 팀 탈퇴만 가능하다', () => {
      expect(canPerformAction('view_members', 'viewer')).toBe(true)
      expect(canPerformAction('leave_team', 'viewer')).toBe(true)

      const viewerNotAllowedActions: TeamAction[] = [
        'invite_member',
        'remove_member',
        'change_role',
        'view_settings',
        'edit_settings',
        'delete_team',
      ]

      viewerNotAllowedActions.forEach((action) => {
        expect(canPerformAction(action, 'viewer')).toBe(false)
      })
    })
  })

  describe('canDeleteTeam', () => {
    it('owner이 마지막 소유자가 아니면 팀을 삭제할 수 있다', () => {
      expect(canDeleteTeam('owner', false)).toBe(true)
    })

    it('owner은 마지막 소유자여도 팀을 삭제할 수 있다', () => {
      // 삭제는 팀 전체를 제거하는 작업이므로 마지막 소유자도 가능합니다
      expect(canDeleteTeam('owner', true)).toBe(true)
    })

    it('admin은 팀을 삭제할 수 없다', () => {
      expect(canDeleteTeam('admin', false)).toBe(false)
      expect(canDeleteTeam('admin', true)).toBe(false)
    })

    it('editor와 viewer는 팀을 삭제할 수 없다', () => {
      expect(canDeleteTeam('editor', false)).toBe(false)
      expect(canDeleteTeam('viewer', false)).toBe(false)
    })

    it('마지막 소유자도 팀을 삭제할 수 있다', () => {
      // SPEC-TEAM-003: 마지막 소유자도 팀 삭제 가능
      // 삭제는 팀 전체를 제거하는 작업이므로 소유자 권한만 있으면 됩니다
      expect(canDeleteTeam('owner', true)).toBe(true)
    })
  })

  describe('canLeaveTeam', () => {
    it('owner는 팀을 탈퇴할 수 없다', () => {
      expect(canLeaveTeam('owner')).toBe(false)
    })

    it('admin, editor, viewer는 팀을 탈퇴할 수 있다', () => {
      expect(canLeaveTeam('admin')).toBe(true)
      expect(canLeaveTeam('editor')).toBe(true)
      expect(canLeaveTeam('viewer')).toBe(true)
    })
  })

  describe('getRolePermissions', () => {
    it('owner의 모든 권한을 반환한다', () => {
      const permissions = getRolePermissions('owner')

      expect(permissions.has('view_members')).toBe(true)
      expect(permissions.has('invite_member')).toBe(true)
      expect(permissions.has('remove_member')).toBe(true)
      expect(permissions.has('change_role')).toBe(true)
      expect(permissions.has('view_settings')).toBe(true)
      expect(permissions.has('edit_settings')).toBe(true)
      expect(permissions.has('delete_team')).toBe(true)
      expect(permissions.has('leave_team')).toBe(false)
    })

    it('viewer의 제한된 권한을 반환한다', () => {
      const permissions = getRolePermissions('viewer')

      expect(permissions.has('view_members')).toBe(true)
      expect(permissions.has('leave_team')).toBe(true)
      expect(permissions.has('invite_member')).toBe(false)
      expect(permissions.has('delete_team')).toBe(false)
    })
  })
})
