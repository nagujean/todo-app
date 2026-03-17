---
id: SPEC-TEAM-001
version: "1.1.0"
status: Closed
created: 2026-03-15
updated: 2026-03-17
author: MoAI
priority: MEDIUM
completion_date: 2026-03-17
completion_note: Requirements implemented in SPEC-TEAM-002 and SPEC-TEAM-003
---

# SPEC-TEAM-001: 팀 관리 기능

## HISTORY

| 날짜       | 버전  | 작성자 | 변경 내용                                                        |
| ---------- | ----- | ------ | ---------------------------------------------------------------- |
| 2026-03-15 | 1.0.0 | MoAI   | 초기 SPEC 생성                                                   |
| 2026-03-17 | 1.1.0 | MoAI   | Closed - 요구사항이 SPEC-TEAM-002, SPEC-TEAM-003에서 구현 완료됨 |

## Closure Summary

이 SPEC의 모든 요구사항이 다음 SPEC에서 구현되었습니다:

- **SPEC-TEAM-002**: IntegratedTeamManagementSheet 컴포넌트 구현
- **SPEC-TEAM-003**: TeamManagementMenu UX 개선

구현된 컴포넌트:

- `src/components/team/TeamManagementMenu.tsx` ✅
- `src/components/team/DeleteTeamDialog.tsx` ✅
- `src/components/team/LeaveTeamDialog.tsx` ✅
- `src/components/team/IntegratedTeamManagementSheet.tsx` ✅

---

## 개요

### 배경

현재 Todo 앱에서는 팀 생성 기능만 제공되며, 팀 삭제, 탈퇴, 설정 변경 등의 관리 기능이 UI에 존재하지 않습니다. 백엔드 로직(`teamStore.ts`)에는 `deleteTeam()`, `leaveTeam()`, `updateTeam()` 함수가 이미 구현되어 있으나, 사용자가 이 기능에 접근할 수 있는 UI가 없습니다.

### 목표

사용자가 팀을 관리할 수 있는 UI를 제공하여 다음 기능을 가능하게 합니다:

1. 소유자: 팀 삭제, 팀 설정 변경
2. 관리자/편집자/뷰어: 팀 탈퇴

### 범위

**포함 (In-Scope):**

- 팀 관리 메뉴 UI 컴포넌트
- 팀 삭제 다이얼로그 (소유자 전용)
- 팀 탈퇴 다이얼로그 (멤버용)
- 권한 기반 UI 렌더링
- 소유자 권한 백엔드 검증

**제외 (Out-of-Scope):**

- 팀 설정 상세 페이지 (별도 SPEC)
- 멤버 초대/관리 기능 (기존 구현됨)
- 팀 이관 (소유권 이전)

---

## 요구사항 (EARS 형식)

### 1. Ubiquitous Requirements (보편적 요구사항)

**REQ-TEAM-001**: 모든 팀 삭제 작업은 소유자만 수행할 수 있다.

**REQ-TEAM-002**: 팀 삭제 및 탈퇴 작업은 확인 다이얼로그를 통해 사용자 승인이 필요하다.

**REQ-TEAM-003**: 팀 삭제 시 팀의 모든 데이터(할 일, 멤버십, 초대)가 함께 삭제된다.

**REQ-TEAM-004**: 사용자가 마지막 남은 팀 소유자인 경우, 팀 탈퇴 대신 팀 삭제만 허용된다.

### 2. Event-Driven Requirements (이벤트 기반 요구사항)

**REQ-TEAM-005**: 사용자가 팀 관리 메뉴를 열면, 현재 사용자의 권한에 따라 적절한 옵션이 표시된다.

**REQ-TEAM-006**: 소유자가 "팀 삭제" 옵션을 클릭하면, 팀 이름을 입력하여 확인하는 다이얼로그가 표시된다.

**REQ-TEAM-007**: 멤버가 "팀 탈퇴" 옵션을 클릭하면, 확인 다이얼로그가 표시된다.

**REQ-TEAM-008**: 팀 삭제/탈퇴가 완료되면, 사용자는 자동으로 개인 모드로 전환된다.

### 3. State-Driven Requirements (상태 기반 요구사항)

**REQ-TEAM-009**: 현재 선택된 팀이 없으면(null), 팀 관리 메뉴는 비활성화된다.

**REQ-TEAM-010**: 팀 관리 메뉴는 팀 목록의 각 팀 항목 옆에 표시된다.

### 4. Optional Requirements (선택적 요구사항)

**REQ-TEAM-011**: 소유자는 팀 이름과 설명을 수정할 수 있다 (선택적 기능, Phase 2).

**REQ-TEAM-012**: 팀 삭제 다이얼로그에서 팀 이름을 입력하여 실수를 방지할 수 있다.

### 5. Unwanted Behavior (바람직하지 않은 동작)

**REQ-TEAM-013**: 팀에는 항상 최소 1명의 소유자가 존재해야 한다. 마지막 소유자는 탈퇴할 수 없다.

**REQ-TEAM-014**: 소유자가 아닌 사용자는 팀 삭제 옵션을 볼 수 없다.

**REQ-TEAM-015**: 삭제된 팀의 데이터는 복구할 수 없다 (soft delete 미적용).

---

## 기술 사양

### 프론트엔드 아키텍처

```
src/components/team/
├── TeamSwitcher.tsx        # 기존: 팀 선택 드롭다운
├── TeamManagementMenu.tsx  # 신규: 팀별 관리 메뉴
├── DeleteTeamDialog.tsx    # 신규: 팀 삭제 확인 다이얼로그
├── LeaveTeamDialog.tsx     # 신규: 팀 탈퇴 확인 다이얼로그
└── TeamSettingsDialog.tsx  # 신규 (선택): 팀 설정 다이얼로그
```

### 상태 관리

기존 `teamStore.ts` 활용:

- `deleteTeam(teamId)` - 팀 삭제
- `leaveTeam(teamId)` - 팀 탈퇴
- `currentTeam` - 현재 선택된 팀
- `members` - 팀 멤버 목록 (권한 확인용)

### 권한 체계

| 권한   | 팀 삭제 | 팀 탈퇴       | 팀 설정 |
| ------ | ------- | ------------- | ------- |
| Owner  | O       | X (팀 삭제만) | O       |
| Admin  | X       | O             | O       |
| Editor | X       | O             | X       |
| Viewer | X       | O             | X       |

### Firestore 보안 규칙 업데이트 필요

```javascript
// teams/{teamId}
allow delete: if request.auth.uid == resource.data.ownerId;

// teams/{teamId}/members/{userId}
allow delete: if request.auth.uid == userId
              || request.auth.uid == resource.data.ownerId;
```

---

## UI/UX 가이드라인

### 팀 관리 메뉴 위치

TeamSwitcher 드롭다운 내 팀 항목 우측에 설정 아이콘 배치

### 다이얼로그 디자인

**팀 삭제 다이얼로그:**

- 제목: "팀 삭제"
- 내용: 정말로 이 팀을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
- 확인 입력: 팀 이름 입력 필드
- 경고: 삭제 시 모든 할 일과 멤버 정보가 함께 삭제됩니다.
- 버튼: [취소] [삭제]

**팀 탈퇴 다이얼로그:**

- 제목: "팀 탈퇴"
- 내용: "{팀이름}" 팀에서 탈퇴하시겠습니까?
- 안내: 탈퇴 후에도 팀의 다른 멤버들은 계속 이 팀을 사용할 수 있습니다.
- 버튼: [취소] [탈퇴]

---

## 제약사항

1. **권한 검증**: 프론트엔드와 백엔드 모두 권한 검증 필요
2. **데이터 무결성**: 팀 삭제 시 연관 데이터 일괄 삭제 필요
3. **사용자 경험**: 파괴적 작업에 대한 충분한 경고 필요
4. **동시성**: 여러 사용자가 동시에 작업할 때 데이터 일관성 유지

---

## 성공 기준

1. 소유자가 팀 삭제 메뉴를 통해 팀을 삭제할 수 있다
2. 멤버가 팀 탈퇴 메뉴를 통해 팀에서 탈퇴할 수 있다
3. 권한이 없는 사용자는 해당 옵션을 볼 수 없다
4. 모든 파괴적 작업에 확인 다이얼로그가 표시된다
5. 작업 완료 후 적절한 피드백이 사용자에게 전달된다

---

## 참조

- 관련 파일: src/store/teamStore.ts
- 관련 컴포넌트: src/components/team/TeamSwitcher.tsx
- 제품 문서: .moai/project/product.md
