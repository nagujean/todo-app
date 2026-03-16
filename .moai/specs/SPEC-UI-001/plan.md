# Implementation Plan

## SPEC: SPEC-UI-001 - Team List Toggle Height Expansion

---

## Overview

**목표:** TeamSwitcher 컴포넌트의 팀 목록 최대 높이를 2배로 증가시켜 모든 팀 관리 버튼이 완전히 표시되도록 수정

**복잡도:** Low (단일 CSS 클래스 변경)

**예상 파일 변경:** 1개 파일, 1줄 수정

---

## Milestones

### Priority 1: Core Implementation (Required)

**목표:** 팀 목록 토글 높이 증가

**태스크:**

1. ✅ TeamSwitcher.tsx에서 `max-h-48`을 `max-h-96`으로 변경
   - 파일: `src/components/team/TeamSwitcher.tsx`
   - 라인: 153
   - 변경: `max-h-48` → `max-h-96`

**완료 기준:**

- [ ] 팀 목록 드롭다운이 펼쳐졌을 때 TeamManagementMenu의 모든 버튼이 잘리지 않고 표시됨
- [ ] 스크롤 동작이 정상적으로 유지됨
- [ ] 기존 레이아웃 구조가 유지됨

### Priority 2: Validation (Recommended)

**목표:** 변경 사항 검증

**태스크:**

1. 로컬 개발 환경에서 UI 확인
2. 다양한 팀 개수로 테스트 (1개, 5개, 10개 팀)
3. 모바일 뷰포트에서 확인

**완료 기준:**

- [ ] 개발 서버에서 UI 정상 표시 확인
- [ ] 모바일, 태블릿, 데스크톱 반응형 확인
- [ ] 여러 팀이 있을 때 스크롤 동작 확인

---

## Technical Approach

### 변경 상세

**파일:** `src/components/team/TeamSwitcher.tsx`

**Before (Line 153):**
```tsx
<div className="max-h-48 overflow-y-auto">
```

**After (Line 153):**
```tsx
<div className="max-h-96 overflow-y-auto">
```

### 변경 이유

1. **현재 문제:** `max-h-48` (192px)은 TeamManagementMenu 드롭다운이 열릴 때 버튼이 잘림
2. **해결 방법:** `max-h-96` (384px)으로 2배 증가하여 충분한 공간 확보
3. **부작용 없음:** `overflow-y-auto` 유지로 팀이 많을 경우 스크롤 가능

### 대안 검토

| 옵션 | 높이 | 장점 | 단점 | 선택 |
|------|------|------|------|------|
| max-h-64 | 256px | 점진적 증가 | 여전히 잘림 가능 | ❌ |
| max-h-80 | 320px | 적당한 증가 | 사용자 요구(2배) 미달 | ❌ |
| max-h-96 | 384px | 사용자 요구 충족, 충분한 공간 | - | ✅ |

---

## Architecture Design

### 영향 범위

```
src/components/team/
├── TeamSwitcher.tsx     ← 수정 대상
├── TeamManagementMenu.tsx  ← 영향 받음 (버튼 표시 개선)
├── DeleteTeamDialog.tsx    ← 간접 영향 (접근성 향상)
└── LeaveTeamDialog.tsx     ← 간접 영향 (접근성 향상)
```

### 의존성 분석

- **직접 의존성:** 없음 (순수 CSS 변경)
- **간접 영향:** TeamManagementMenu의 드롭다운 위치 계산 (변경 없음)
- **Store 영향:** 없음 (Zustand store 변경 없음)

---

## Test Strategy

### Manual Testing Checklist

**데스크톱:**

1. [ ] 팀이 1개일 때 드롭다운 확인
2. [ ] 팀이 5개일 때 드롭다운과 스크롤 확인
3. [ ] TeamManagementMenu의 모든 버튼 클릭 가능 확인
4. [ ] "팀 관리", "팀 삭제", "팀 탈퇴" 버튼 완전히 표시 확인

**모바일:**

1. [ ] Chrome DevTools 모바일 뷰에서 확인
2. [ ] iPhone, Android 뷰포트에서 확인
3. [ ] 드롭다운이 화면을 벗어나지 않는지 확인

**접근성:**

1. [ ] 키보드 탐색 동작 확인
2. [ ] ARIA 속성 유지 확인

### Automated Testing

현재 자동화 테스트는 선택사항 (Priority 3):

- Component test: TeamSwitcher 렌더링 테스트
- E2E test: 팀 전환 플로우 테스트

---

## Risks and Response Plan

### Risk 1: 모바일 뷰포트 오버플로우

**확률:** Low
**영향:** Medium

**대응:**

- 사용자가 요청한 2배 높이 적용
- 모바일에서 오버플로우 발생 시 `max-h-[calc(100vh-200px)]` 등 반응형 클래스 고려
- Tailwind responsive variants 사용: `max-h-64 sm:max-h-96`

### Risk 2: 디자인 일관성

**확률:** Very Low
**영향:** Low

**대응:**

- Tailwind 표준 클래스 사용으로 일관성 유지
- 디자인 시스템 준수

---

## Rollback Plan

변경이 문제를 일으킬 경우 즉시 롤백 가능:

```bash
git revert <commit-hash>
```

또는 수동 복원:

```tsx
// TeamSwitcher.tsx line 153
<div className="max-h-48 overflow-y-auto">
```

---

## Next Steps

1. `/moai:2-run SPEC-UI-001` - Implementation execution
2. Manual validation in development environment
3. `/moai:3-sync SPEC-UI-001` - Documentation sync if needed
