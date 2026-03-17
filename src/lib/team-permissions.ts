/**
 * 팀 권한 관리 유틸리티
 *
 * 팀 역할(Role)에 따른 수행 가능한 액션을 정의합니다.
 *
 * @MX:ANCHOR 팀 권한 시스템의 핵심 진입점
 * 변경 시 모든 팀 관련 컴포넌트에 영향을 미칩니다.
 */

import type { TeamRole } from "@/store/teamStore";

/**
 * 팀 관련 액션 타입
 *
 * @MX:NOTE 모든 가능한 팀 관리 액션을 열거형으로 정의
 */
export type TeamAction =
  | "view_members" // 팀원 목록 보기
  | "invite_member" // 팀원 초대
  | "remove_member" // 팀원 제거
  | "change_role" // 역할 변경
  | "view_settings" // 팀 설정 보기
  | "edit_settings" // 팀 설정 편집
  | "delete_team" // 팀 삭제
  | "leave_team"; // 팀 탈퇴

/**
 * 역할별 권한 매트릭스
 *
 * @MX:ANCHOR 권한 정의의 단일 진실 공급원 (SSOT)
 * SPEC-TEAM-002 요구사항에 정의된 권한 매트릭스 구현
 *
 * | Role      | view_members | invite | remove | change_role | settings | delete | leave |
 * |-----------|--------------|--------|--------|-------------|----------|--------|-------|
 * | owner     | ✅           | ✅     | ✅     | ✅          | ✅       | ✅     | ❌    |
 * | admin     | ✅           | ✅     | ✅     | ✅          | ✅       | ❌     | ✅    |
 * | editor    | ✅           | ❌     | ❌     | ❌          | ❌       | ❌     | ✅    |
 * | viewer    | ✅           | ❌     | ❌     | ❌          | ❌       | ❌     | ✅    |
 */
const ROLE_PERMISSIONS: Record<TeamRole, Set<TeamAction>> = {
  owner: new Set([
    "view_members",
    "invite_member",
    "remove_member",
    "change_role",
    "view_settings",
    "edit_settings",
    "delete_team",
    // owner는 팀 탈퇴 불가
  ]),
  admin: new Set([
    "view_members",
    "invite_member",
    "remove_member",
    "change_role",
    "view_settings",
    "edit_settings",
    "leave_team",
    // admin은 팀 삭제 불가
  ]),
  editor: new Set(["view_members", "leave_team"]),
  viewer: new Set(["view_members", "leave_team"]),
};

/**
 * 특정 역할이 액션을 수행할 수 있는지 확인합니다.
 *
 * @param action - 확인하려는 액션
 * @param role - 사용자의 역할
 * @returns 액션 수행 가능 여부
 *
 * @example
 * ```ts
 * if (canPerformAction('delete_team', userRole)) {
 *   // 팀 삭제 로직
 * }
 * ```
 *
 * @MX:NOTE 이 함수는 팀 권한 검증의 유일한 진입점입니다
 * 모든 권한 체크는 이 함수를 통해야 합니다.
 */
export function canPerformAction(action: TeamAction, role: TeamRole): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

/**
 * 역할에 부여된 모든 권한 목록을 반환합니다.
 *
 * @param role - 조회하려는 역할
 * @returns 해당 역할의 권한 집합
 *
 * @MX:NOTE UI에서 권한 목록을 표시할 때 사용
 */
export function getRolePermissions(role: TeamRole): Set<TeamAction> {
  return new Set(ROLE_PERMISSIONS[role]);
}

/**
 * 팀을 삭제할 수 있는지 확인합니다.
 *
 * @MX:NOTE 삭제는 팀 전체를 제거하는 것이므로 마지막 소유자도 가능합니다
 * 탈퇴(Leave)는 팀을 유지하므로 소유자에게 차단됩니다.
 *
 * @param role - 사용자의 역할
 * @param isLastOwner - 이 사용자가 마지막 소유자인지 여부 (API 호환성을 위해 유지되나 무시됨)
 * @returns 팀 삭제 가능 여부
 */
export function canDeleteTeam(role: TeamRole, _isLastOwner: boolean): boolean {
  // _isLastOwner 파라미터는 삭제 권한에 영향을 주지 않습니다
  // 삭제는 팀 전체를 제거하는 작업이므로 owner 권한만 있으면 가능합니다
  return canPerformAction("delete_team", role);
}

/**
 * 팀에서 탈퇴할 수 있는지 확인합니다.
 *
 * @MX:WARN 소유자는 팀을 탈퇴할 수 없습니다
 * 소유자는 먼저 다른 멤버에게 소유자 권한을 이양해야 합니다.
 *
 * @param role - 사용자의 역할
 * @returns 팀 탈퇴 가능 여부
 */
export function canLeaveTeam(role: TeamRole): boolean {
  return canPerformAction("leave_team", role);
}
