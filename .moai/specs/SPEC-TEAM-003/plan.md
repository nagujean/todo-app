---
id: SPEC-TEAM-003
version: "1.0.0"
status: draft
created: 2026-03-15
updated: 2026-03-15
author: nagu
priority: MEDIUM
---

# 구현 계획: SPEC-TEAM-003 팀 관리 메뉴 UX 개선

## 1. 작업 분해

### 1.1 Task 목록

| Task ID | 설명 | 의존성 | 예상 난이도 |
|---------|------|--------|------------|
| TASK-001 | TeamManagementMenu에 "팀 관리" 옵션 추가 | 없음 | 낮음 |
| TASK-002 | TeamSwitcher에 onManageTeam prop 전달 | TASK-001 | 낮음 |
| TASK-003 | IntegratedTeamManagementSheet 상태 관리 | TASK-002 | 낮음 |
| TASK-004 | 테스트 케이스 추가 및 수정 | TASK-003 | 낮음 |

---

## 2. 상세 구현 계획

### TASK-001: TeamManagementMenu에 "팀 관리" 옵션 추가

**파일**: `src/components/team/TeamManagementMenu.tsx`

**변경 내용**:

1. Props 인터페이스 확장:
```typescript
interface TeamManagementMenuProps {
  team: Team
  onDeleteTeam: () => void
  onLeaveTeam: () => void
  onManageTeam: () => void  // 추가
  onOpenChange?: (open: boolean) => void
}
```

2. 드롭다운 메뉴에 "팀 관리" 옵션 추가:
```typescript
// Settings 아이콘과 함께 "팀 관리" 버튼 추가
<button onClick={handleManageClick}>
  <Settings className="h-4 w-4" />
  <span>팀 관리</span>
</button>
```

3. 이벤트 핸들러 추가:
```typescript
const handleManageClick = (e: React.MouseEvent) => {
  e.stopPropagation()
  setIsOpen(false)
  onManageTeam()
}
```

**검증**: 드롭다운 메뉴에 "팀 관리"가 첫 번째 옵션으로 표시되는지 확인

---

### TASK-002: TeamSwitcher에 onManageTeam prop 전달

**파일**: `src/components/team/TeamSwitcher.tsx`

**변경 내용**:

1. TeamManagementMenu 호출 부분 수정:
```typescript
<TeamManagementMenu
  team={team}
  onDeleteTeam={() => handleDeleteTeam(team)}
  onLeaveTeam={() => handleLeaveTeam(team)}
  onManageTeam={() => handleManageTeam(team)}  // 추가
  onOpenChange={(open) => handleMenuOpenChange(team.id, open)}
/>
```

2. handleManageTeam 함수 추가:
```typescript
const handleManageTeam = (team: Team) => {
  setCurrentTeam(team.id)  // 해당 팀으로 전환
  setShowTeamManagement(true)  // 시트 열기
}
```

**검증**: 톱니바퀴 메뉴에서 "팀 관리" 클릭 시 해당 팀의 관리 시트가 열리는지 확인

---

### TASK-003: IntegratedTeamManagementSheet 상태 관리

**파일**: `src/components/team/TeamSwitcher.tsx`

**변경 내용**:

1. 시트 상태 및 대상 팀 ID 관리:
```typescript
const [showTeamManagement, setShowTeamManagement] = useState(false)
const [managedTeamId, setManagedTeamId] = useState<string | null>(null)

const handleManageTeam = (team: Team) => {
  setManagedTeamId(team.id)
  setShowTeamManagement(true)
}
```

2. 시트 컴포넌트 렌더링:
```tsx
{managedTeamId && (
  <IntegratedTeamManagementSheet
    teamId={managedTeamId}
    open={showTeamManagement}
    onOpenChange={setShowTeamManagement}
  />
)}
```

**검증**: 선택한 팀의 정보가 시트에 정상적으로 표시되는지 확인

---

### TASK-004: 테스트 케이스 추가 및 수정

**파일**: `src/components/team/TeamManagementMenu.test.tsx`, `TeamSwitcher.test.tsx`

**추가 테스트 케이스**:

1. TeamManagementMenu:
   - "팀 관리" 옵셔셔클릭 시 onManageTeam 호출
   - "팀 관리" 클릭 후 메뉴 닫힘

2. TeamSwitcher:
   - 톱니바퀴 → "팀 관리" 클릭 → 시트 열림
   - 시트에 올바른 팀 ID 전달

**검증**: 모든 테스트 케이스 통과

---

## 3. 리스크 분석

| 리스크 | 영향도 | 가능성 | 대응 방안 |
|--------|--------|--------|----------|
| Props 누락으로 인한 런타임 에러 | 높음 | 낮음 | TypeScript strict mode, 필수 prop 지정 |
| 기존 기능 영향 | 중간 | 낮음 | 기존 테스트 케이스 유지, 회귀 테스트 수행 |
| 상태 동기화 문제 | 중간 | 낮음 | currentTeamId와 managedTeamId 분리 관리 |

---

## 4. 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 컴포넌트 |
| TypeScript | 5.x | 타입 안전성 |
| Zustand | 5.x | 상태 관리 |
| Lucide React | 0.562.x | 아이콘 |
| Tailwind CSS | 4.x | 스타일링 |

---

## 5. 타임라인

| 단계 | 작업 | 예상 소요 시간 |
|------|------|---------------|
| 1 | TeamManagementMenu 수정 | 10분 |
| 2 | TeamSwitcher 수정 | 15분 |
| 3 | 테스트 작성 및 실행 | 15분 |
| 4 | 통합 테스트 및 검증 | 10분 |

**총 예상 소요 시간**: 50분

---

## 6. 완료 기준

- [ ] 모든 Task 구현 완료
- [ ] 기존 테스트 케이스 모두 통과
- [ ] 새 테스트 케이스 모두 통과
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 수동 테스트 시나리오 검증

---

*문서 끝*
