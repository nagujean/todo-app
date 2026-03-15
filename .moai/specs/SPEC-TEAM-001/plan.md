---
spec_id: SPEC-TEAM-001
version: "1.0.0"
status: draft
created: 2026-03-15
updated: 2026-03-15
---

# 구현 계획: 팀 관리 기능

## 개요

본 문서는 SPEC-TEAM-001 (팀 관리 기능)의 상세 구현 계획을 정의합니다.

---

## 작업 분해 구조 (WBS)

### Milestone 1: 기반 컴포넌트 구현

#### Task 1.1: TeamManagementMenu 컴포넌트 생성

**파일**: src/components/team/TeamManagementMenu.tsx

**인터페이스**:
```typescript
interface TeamManagementMenuProps {
  team: Team
  userRole: TeamRole
  onDeleteTeam: () => void
  onLeaveTeam: () => void
}
```

**기능**:
- DropdownMenu (Radix UI) 기반
- 권한별 메뉴 항목 필터링
- Owner: 팀 삭제 메뉴
- Member: 팀 탈퇴 메뉴

**예상 소요**: 1.5시간

#### Task 1.2: DeleteTeamDialog 컴포넌트 생성

**파일**: src/components/team/DeleteTeamDialog.tsx

**인터페이스**:
```typescript
interface DeleteTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team
  onConfirm: () => Promise<void>
}
```

**기능**:
- 팀 이름 입력 검증
- 삭제 확인 버튼 (입력값 일치 시 활성화)
- 로딩 상태 처리
- 에러 처리

**예상 소요**: 1.5시간

#### Task 1.3: LeaveTeamDialog 컴포넌트 생성

**파일**: src/components/team/LeaveTeamDialog.tsx

**인터페이스**:
```typescript
interface LeaveTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team
  onConfirm: () => Promise<void>
}
```

**기능**:
- 탈퇴 확인 메시지
- 로딩 상태 처리
- 에러 처리

**예상 소요**: 1시간

---

### Milestone 2: TeamSwitcher 통합

#### Task 2.1: TeamSwitcher에 관리 메뉴 통합

**파일**: src/components/team/TeamSwitcher.tsx (수정)

**변경 사항**:
1. 각 팀 항목 우측에 TeamManagementMenu 추가
2. 현재 사용자의 해당 팀 권한 조회 로직 추가
3. 메뉴 오픈 시 드롭다운 닫힘 방지

**예상 소요**: 1.5시간

#### Task 2.2: 권한 조회 헬퍼 함수 추가

**파일**: src/store/teamStore.ts (수정)

**추가 함수**:
```typescript
getUserRole: (teamId: string) => TeamRole | null
```

**예상 소요**: 0.5시간

---

### Milestone 3: 백엔드 검증 강화

#### Task 3.1: deleteTeam 소유자 검증 추가

**파일**: src/store/teamStore.ts (수정)

**변경 사항**:
- deleteTeam 함수 내부에 소유자 권한 검증 추가

**예상 소요**: 0.5시간

#### Task 3.2: Firestore 규칙 업데이트

**파일**: firestore.rules (수정)

**예상 소요**: 0.5시간

---

### Milestone 4: 테스트 및 검증

#### Task 4.1: 컴포넌트 단위 테스트

**파일**:
- src/components/team/TeamManagementMenu.test.tsx
- src/components/team/DeleteTeamDialog.test.tsx
- src/components/team/LeaveTeamDialog.test.tsx

**예상 소요**: 2시간

#### Task 4.2: E2E 테스트

**파일**: e2e/team-management.spec.ts

**예상 소요**: 1.5시간

---

## 파일 변경 요약

### 신규 파일

| 파일 | 목적 |
|------|------|
| src/components/team/TeamManagementMenu.tsx | 팀 관리 드롭다운 메뉴 |
| src/components/team/DeleteTeamDialog.tsx | 팀 삭제 확인 다이얼로그 |
| src/components/team/LeaveTeamDialog.tsx | 팀 탈퇴 확인 다이얼로그 |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| src/components/team/TeamSwitcher.tsx | 관리 메뉴 통합 |
| src/store/teamStore.ts | 권한 조회 함수, 검증 로직 추가 |
| firestore.rules | 삭제/탈퇴 권한 규칙 추가 |

---

## 예상 일정

| Phase | 예상 소요 |
|-------|-----------|
| Phase 1 | 4시간 |
| Phase 2 | 2시간 |
| Phase 3 | 1시간 |
| Phase 4 | 3.5시간 |

**총 예상 소요**: 약 10.5시간

---

## 완료 기준

- [ ] 모든 신규 컴포넌트 구현 완료
- [ ] TeamSwitcher에 관리 메뉴 통합 완료
- [ ] 백엔드 권한 검증 구현 완료
- [ ] Firestore 규칙 업데이트 완료
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] E2E 테스트 시나리오 통과
