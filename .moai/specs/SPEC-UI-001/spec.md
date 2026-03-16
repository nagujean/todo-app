# Team List Toggle Height Expansion

## SPEC Metadata

| Field | Value |
|-------|-------|
| SPEC ID | SPEC-UI-001 |
| Title | Team List Toggle Height Expansion |
| Status | Completed |
| Priority | High |
| Created | 2026-03-16 |
| Completed | 2026-03-16 |
| Domain | UI |
| Related Components | TeamSwitcher, TeamManagementMenu |

---

## Problem Analysis

### Current Issue

TeamSwitcher 컴포넌트의 팀 목록 토글 영역에 `max-h-48` CSS 클래스가 적용되어 있어, 팀 목록이 지나치게 작게 표시됩니다. 이로 인해:

1. **TeamManagementMenu**의 "팀 관리" 및 "팀 삭제" 버튼이 잘려 보이지 않음
2. 사용자가 전체 버튼을 확인하거나 클릭할 수 없음
3. 팀이 많을 경우 스크롤 영역이 너무 좁아 사용성 저하

### Root Cause

- `TeamSwitcher.tsx` 153번째 줄: `<div className="max-h-48 overflow-y-auto">`
- `max-h-48`은 약 192px (48 × 4px) 높이로 제한
- TeamManagementMenu 드롭다운이 이 영역 내에서 잘림

### Proposed Solution

팀 목록 컨테이너의 `max-h` 값을 2배로 증가시켜 모든 버튼이 완전히 표시되도록 수정

---

## Environment

- **Framework**: Next.js 16.1.2 with React 19.2.3
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **Project Type**: Progressive Web Application (PWA)
- **Target Browsers**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Assumptions

1. **사용자는 일반적으로 5개 이하의 팀에 속함** - 대부분의 사용자는 적은 수의 팀만 관리
2. **모바일 기기에서도 동일한 UI 사용** - 반응형 디자인 필요
3. **스크롤 가능성 유지** - 팀이 많은 경우에도 스크롤로 탐색 가능
4. **기존 레이아웃 구조 유지** - 드롭다운 너비와 위치 변경 없음

---

## Requirements

### Ubiquitous Requirements

The system **shall** display all team management action buttons completely without truncation.

### Event-Driven Requirements

WHEN the user opens the team list toggle, THEN the system **shall** display the full TeamManagementMenu dropdown without visual truncation.

WHEN the team list contains multiple teams, THEN the system **shall** provide adequate scrollable height to accommodate all team entries with their action menus.

### State-Driven Requirements

IF the viewport height is limited, THEN the system **shall** maintain scroll functionality for the team list.

IF the user is on a mobile device, THEN the system **shall** ensure the expanded toggle does not overflow the viewport.

### Unwanted Behavior Requirements

The system **shall not** truncate or hide any team action buttons ("팀 관리", "팀 삭제", "팀 탈퇴").

The system **shall not** cause the dropdown to extend beyond reasonable viewport boundaries on mobile devices.

### Optional Requirements

WHERE possible, provide smooth scrolling behavior for the team list container.

---

## Specifications

### Technical Approach

**변경 사항:**

1. `TeamSwitcher.tsx` 153번째 줄의 `max-h-48`을 `max-h-96`으로 변경
   - `max-h-48` (192px) → `max-h-96` (384px)
   - 2배 높이 증가로 모든 버튼 완전 표시

**영향 범위:**

- 파일: `src/components/team/TeamSwitcher.tsx`
- 라인: 153
- 변경 클래스: `max-h-48` → `max-h-96`

### Layout Considerations

```
Before: max-h-48 (~192px)
┌─────────────────────────┐
│ Team 1  [⋮]           │ ← 잘림 가능성
│ Team 2  [⋮]           │
│ ...                    │
└─────────────────────────┘

After: max-h-96 (~384px)
┌─────────────────────────┐
│ Team 1  [⋮]            │
│   └─ 팀 관리           │ ← 완전히 표시
│   └─ 팀 삭제           │ ← 완전히 표시
│ Team 2  [⋮]            │
│   └─ 팀 탈퇴           │ ← 완전히 표시
│ ...                    │
└─────────────────────────┘
```

### Tailwind CSS Height Classes Reference

| Class | Pixels | Description |
|-------|--------|-------------|
| max-h-48 | 192px | Current (too short) |
| max-h-64 | 256px | Alternative option |
| max-h-80 | 320px | Alternative option |
| max-h-96 | 384px | Proposed (2x current) |

---

## Constraints

### Technical Constraints

- Must maintain Tailwind CSS utility classes
- Must preserve existing overflow-y-auto behavior
- Must not break existing layout structure
- Must maintain ARIA accessibility attributes

### Design Constraints

- Dropdown must not extend beyond viewport on mobile
- Visual consistency with existing design system
- No changes to dropdown width (w-56)

### Performance Constraints

- No JavaScript logic changes required
- Pure CSS modification for instant performance

---

## Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Mobile viewport overflow | Low | Medium | Use max-h-[value] with viewport-relative units if needed |
| Design inconsistency | Very Low | Low | Follows existing Tailwind patterns |
| User confusion with larger area | Very Low | Very Low | Natural expansion, no behavior change |

---

## TAG BLOCK

```yaml
TAG: SPEC-UI-001
DOMAIN: UI
COMPONENTS:
  - TeamSwitcher
  - TeamManagementMenu
FILES:
  - src/components/team/TeamSwitcher.tsx
TEST_FILES:
  - src/components/team/__tests__/TeamSwitcher.test.tsx
PRIORITY: High
STATUS: Completed
```

---

## References

- Tailwind CSS Max Height: https://tailwindcss.com/docs/max-height
- Radix UI Dropdown Menu: https://www.radix-ui.com/primitives/docs/components/dropdown-menu
- Project Tech Stack: `.moai/project/tech.md`
