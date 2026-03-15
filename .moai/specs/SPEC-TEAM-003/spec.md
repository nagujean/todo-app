---
id: SPEC-TEAM-003
version: "1.1.0"
status: completed
created: 2026-03-15
updated: 2026-03-15
author: nagu
priority: MEDIUM
---

# SPEC-TEAM-003: 팀 관리 메뉴 UX 개선

## HISTORY

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-03-15 | 1.0.0 | 초기 작성 | nagu |
| 2026-03-15 | 1.1.0 | 문서 동기화 완료, 모든 요구사항 구현 | nagu |

---

## 1. 개요

### 1.1 목적

팀 리스트의 톱니바퀴 메뉴에 "팀 관리" 옵션을 추가하여, 사용자가 팀 관리 시트로 빠르게 접근할 수 있도록 UX를 개선한다.

### 1.2 배경

현재 팀 리스트의 톱니바퀴 메뉴는 "팀 삭제"와 "팀 탈퇴" 옵션만 제공한다. "팀 관리" 기능은 우측 상단의 계정 메뉴를 통해서만 접근 가능하여 사용자 경험이 일관되지 않다.

### 1.3 범위

- TeamManagementMenu 컴포넌트에 "팀 관리" 옵션 추가
- TeamSwitcher에서 IntegratedTeamManagementSheet 연동
- 기존 삭제/탈퇴 기능 유지

---

## 2. 요구사항 (EARS 형식)

### 2.1 Ubiquitous (보편적 요구사항)

**REQ-001**: 팀 리스트의 모든 팀 항목은 톱니바퀴 아이콘(설정 버튼)을 표시해야 한다.

> The team list shall display a settings icon for every team item.

**근거**: 사용자가 일관된 방식으로 팀 관련 작업에 접근할 수 있어야 한다.

### 2.2 State-driven (상태 기반 요구사항)

**REQ-002**: 톱니바퀴 아이콘 클릭 시, 다음 옵션들을 포함한 드롭다운 메뉴가 표시되어야 한다:
- "팀 관리" (모든 팀 멤버에게 표시)
- "팀 삭제" (소유자에게만 표시) 또는 "팀 탈퇴" (일반 멤버에게만 표시)

> When the user clicks the settings icon, a dropdown menu shall appear containing team management options.

**근거**: 팀 관련 모든 작업을 한 곳에서 수행할 수 있어야 한다.

### 2.3 Event-driven (이벤트 기반 요구사항)

**REQ-003**: "팀 관리" 옵션 클릭 시, IntegratedTeamManagementSheet가 해당 팀의 정보와 함께 열려야 한다.

> When the user clicks "팀 관리", the IntegratedTeamManagementSheet shall open for the selected team.

**근거**: 사용자가 선택한 팀의 관리 기능에 즉시 접근할 수 있어야 한다.

**REQ-004**: 드롭다운 메뉴는 "팀 관리" 클릭 후 자동으로 닫혀야 한다.

> When the user clicks "팀 관리", the dropdown menu shall close automatically.

**근거**: UI가 깔끔하게 유지되어야 한다.

### 2.4 Optional (선택적 요구사항)

**REQ-005**: 소유자(owner) 역할의 사용자에게는 "팀 삭제" 옵션이 표시되어야 한다.

> The system shall display "팀 삭제" option to users with owner role.

**근거**: 팀 삭제는 소유자만 수행할 수 있는 권한 있는 작업이다.

**REQ-006**: 일반 멤버(editor, viewer)에게는 "팀 탈퇴" 옵션이 표시되어야 한다.

> The system shall display "팀 탈퇴" option to users with editor or viewer role.

**근거**: 일반 멤버는 팀을 탈퇴할 수 있지만 삭제할 수는 없다.

### 2.5 Unwanted Behavior (부정적 동작 방지)

**REQ-007**: 삭제 또는 탈퇴 작업은 확인 다이얼로그 없이 즉시 실행되지 않아야 한다.

> The system shall not execute delete or leave operations without confirmation dialog.

**근거**: 실수로 인한 데이터 손실을 방지해야 한다.

---

## 3. 기술 사양

### 3.1 수정 대상 컴포넌트

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `TeamManagementMenu.tsx` | 수정 | "팀 관리" 옵션 추가, onManageTeam prop 추가 |
| `TeamSwitcher.tsx` | 수정 | onManageTeam 콜백 처리, 시트 상태 관리 |
| `TeamManagementMenu.test.tsx` | 수정 | 새 기능 테스트 케이스 추가 |

### 3.2 Props 인터페이스 변경

```typescript
// TeamManagementMenuProps 확장
interface TeamManagementMenuProps {
  team: Team
  onDeleteTeam: () => void
  onLeaveTeam: () => void
  onManageTeam: () => void  // NEW: 팀 관리 콜백
  onOpenChange?: (open: boolean) => void
}
```

### 3.3 의존성

- `lucide-react`: Settings 아이콘 (기존 사용)
- `@/components/team/IntegratedTeamManagementSheet`: 팀 관리 시트

---

## 4. 제약사항

### 4.1 기술적 제약

- React 19 호환 필요
- Zustand 상태 관리 패턴 준수
- 기존 컴포넌트 인터페이스와의 호환성 유지

### 4.2 UI/UX 제약

- 기존 드롭다운 메뉴 스타일 일관성 유지
- 접근성(ARIA) 속성 준수
- 다크/라이트 테마 지원

---

## 5. 검증 기준

### 5.1 기능 테스트

- [x] 톱니바퀴 클릭 시 드롭다운 메뉴 표시
- [x] "팀 관리" 옵션 클릭 시 시트 열림
- [x] 소유자에게 "팀 삭제" 표시
- [x] 일반 멤버에게 "팀 탈퇴" 표시
- [x] 삭제/탈퇴 전 확인 다이얼로그 표시

**검증 완료**: 모든 요구사항이 구현되었으며 테스트에서 검증됨

### 5.2 접근성 테스트

- [ ] 키보드 탐색 지원
- [ ] ARIA 속성 정상 동작
- [ ] 스크린 리더 호환

---

## 6. 참조

- SPEC-TEAM-001: 팀 협업 기본 기능
- SPEC-TEAM-002: 통합 팀 관리 메뉴

---

*문서 끝*
