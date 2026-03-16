# Acceptance Criteria

## SPEC: SPEC-UI-001 - Team List Toggle Height Expansion

---

## Acceptance Criteria Summary

**핵심 목표:** 팀 목록 토글의 높이를 2배로 증가시켜 모든 팀 관리 버튼이 잘리지 않고 완전히 표시되어야 함

---

## Acceptance Criteria

### AC-001: Team Management Buttons Fully Visible

**Given:** 사용자가 팀 목록 토글을 열었을 때
**When:** TeamManagementMenu 드롭다운이 펼쳐지면
**Then:** 모든 버튼 ("팀 관리", "팀 삭제", "팀 탈퇴")이 잘리지 않고 완전히 표시되어야 함

**검증 방법:**

1. 팀 목록 토글 클릭
2. 임의의 팀의 ⋮ (더보기) 버튼 클릭
3. 드롭다운 메뉴의 모든 옵션이 시각적으로 잘리지 않음을 확인

**상태:** 🔴 Not Started

---

### AC-002: Scroll Functionality Preserved

**Given:** 사용자가 여러 팀에 속해 있을 때 (5개 이상)
**When:** 팀 목록 토글을 열었을 때
**Then:** 팀 목록이 스크롤 가능해야 함

**검증 방법:**

1. 5개 이상의 팀이 있는 상태에서 팀 목록 토글 열기
2. 목록이 max-h-96 높이를 초과하는지 확인
3. 스크롤바가 나타나고 스크롤이 가능한지 확인

**상태:** 🔴 Not Started

---

### AC-003: Mobile Viewport Compatibility

**Given:** 사용자가 모바일 기기를 사용할 때
**When:** 팀 목록 토글을 열었을 때
**Then:** 드롭다운이 뷰포트를 벗어나지 않아야 함

**검증 방법:**

1. Chrome DevTools에서 iPhone/Android 뷰포트 선택
2. 팀 목록 토글 열기
3. 드롭다운이 화면 하단을 벗어나지 않는지 확인

**상태:** 🔴 Not Started

---

### AC-004: No Layout Regression

**Given:** 팀 목록 토글이 닫혀 있을 때
**When:** 페이지 로드 시
**Then:** 기존 레이아웃과 동일한 모양이어야 함

**검증 방법:**

1. 페이지 새로고침
2. 토글 버튼의 위치와 모양이 이전과 동일한지 확인
3. 주변 컴포넌트에 영향이 없는지 확인

**상태:** 🔴 Not Started

---

### AC-005: Accessibility Maintained

**Given:** 스크린 리더 사용자가 팀 목록에 접근할 때
**When:** 키보드로 팀 목록을 탐색하면
**Then:** 모든 ARIA 속성과 키보드 탐색이 정상 작동해야 함

**검증 방법:**

1. Tab 키로 팀 목록 토글에 포커스
2. Enter 키로 드롭다운 열기
3. 화살표 키로 팀 목록 탐색
4. ARIA 속성이 유지되었는지 개발자 도구로 확인

**상태:** 🔴 Not Started

---

## Test Scenarios

### Scenario 1: Single Team with Management Menu

**전제 조건:**

- 사용자가 1개 팀의 소유자로 로그인
- 팀 관리 권한 있음

**테스트 단계:**

1. 팀 목록 토글 클릭
2. 팀의 ⋮ 버튼 클릭
3. "팀 관리" 옵션 확인
4. "팀 삭제" 옵션 확인

**예상 결과:**

- ✅ 두 옵션 모두 완전히 표시됨
- ✅ 클릭 가능함
- ✅ 잘림 없음

---

### Scenario 2: Multiple Teams with Scroll

**전제 조건:**

- 사용자가 6개 이상의 팀에 소속됨
- 다양한 역할 (소유자, 관리자, 편집자)

**테스트 단계:**

1. 팀 목록 토글 클릭
2. 목록 아래로 스크롤
3. 마지막 팀의 ⋮ 버튼 클릭
4. "팀 탈퇴" 옵션 확인

**예상 결과:**

- ✅ 스크롤바가 나타남
- ✅ 마지막 팀의 메뉴가 완전히 표시됨
- ✅ 모든 버튼 클릭 가능

---

### Scenario 3: Mobile Viewport

**전제 조건:**

- iPhone 12 Pro 뷰포트 (390 × 844)
- 세로 모드

**테스트 단계:**

1. 팀 목록 토글 클릭
2. 화면 하단 경계 확인
3. 여러 팀이 있을 때 스크롤 동작 확인

**예상 결과:**

- ✅ 드롭다운이 화면을 벗어나지 않음
- ✅ 스크롤로 모든 팀 접근 가능
- ✅ 터치 인터랙션 정상 작동

---

### Scenario 4: Desktop Large Viewport

**전제 조건:**

- 데스크톱 브라우저 (1920 × 1080)
- Chrome 브라우저

**테스트 단계:**

1. 팀 목록 토글 클릭
2. 팀 목록 전체 표시 확인
3. TeamManagementMenu 드롭다운 확인

**예상 결과:**

- ✅ 모든 팀이 한눈에 표시 (팀이 적을 때)
- ✅ 메뉴 드롭다운이 잘리지 않음
- ✅ 레이아웃 일관성 유지

---

## Quality Gates

### Functional Requirements

- [ ] 모든 팀 관리 버튼이 잘리지 않고 표시됨
- [ ] 스크롤 동작이 정상적으로 유지됨
- [ ] 기존 레이아웃이 변경되지 않음

### Non-Functional Requirements

- [ ] 반응형 디자인 유지 (모바일/태블릿/데스크톱)
- [ ] 접근성 표준 준수 (WCAG 2.1)
- [ ] 성능 저하 없음 (CSS만 변경)

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Verification Methods

### Visual Inspection

1. 개발 서버 실행: `npm run dev`
2. 팀 목록 토글 열기
3. TeamManagementMenu 드롭다운 확인
4. 모바일 뷰포트에서 확인

### Code Review Checklist

- [ ] `max-h-96` 클래스가 올바르게 적용됨
- [ ] `overflow-y-auto` 유지됨
- [ ] 다른 클래스 변경 없음
- [ ] ARIA 속성 유지됨

### Regression Testing

- [ ] 팀 생성 플로우 정상 작동
- [ ] 팀 전환 기능 정상 작동
- [ ] 팀 삭제/탈퇴 기능 정상 작동
- [ ] 팀 관리 시트 정상 작동

---

## Definition of Done

### Development Complete

- [ ] 코드 변경 완료 (1 file, 1 line)
- [ ] 로컬 테스트 통과
- [ ] 코드 리뷰 완료 (self-review)

### Quality Validation

- [ ] 모든 Acceptance Criteria 통과
- [ ] 모든 Test Scenarios 통과
- [ ] 브라우저 호환성 확인

### Documentation

- [ ] 변경 사항 커밋 메시지에 명시
- [ ] 필요시 사용자 가이드 업데이트 (N/A - UI 개선)

---

## Post-Implementation Verification

**검증 일정:** Implementation 후 즉시

**검증자:** Developer (self-verification)

**검증 환경:**

- Development server (localhost:3000)
- Chrome DevTools (mobile simulation)
- 실제 모바일 기기 (선택사항)

**검증 결과 기록:**

- 스크린샷: Before/After 비교
- 테스트 체크리스트 완료 여부
- 발견된 이슈 (있다면)

---

## Traceability Matrix

| Requirement | Acceptance Criteria | Test Scenario | Status |
|-------------|---------------------|---------------|--------|
| Buttons fully visible | AC-001 | Scenario 1, 2 | 🔴 |
| Scroll functionality | AC-002 | Scenario 2 | 🔴 |
| Mobile compatibility | AC-003 | Scenario 3 | 🔴 |
| No layout regression | AC-004 | Scenario 4 | 🔴 |
| Accessibility | AC-005 | Scenario 1 | 🔴 |

**Legend:** 🔴 Not Started | 🟡 In Progress | 🟢 Passed | 🔵 Failed

---

## TAG BLOCK

```yaml
TAG: SPEC-UI-001
ACCEPTANCE_CRITERIA:
  - AC-001: Team Management Buttons Fully Visible
  - AC-002: Scroll Functionality Preserved
  - AC-003: Mobile Viewport Compatibility
  - AC-004: No Layout Regression
  - AC-005: Accessibility Maintained
TEST_SCENARIOS:
  - Scenario 1: Single Team with Management Menu
  - Scenario 2: Multiple Teams with Scroll
  - Scenario 3: Mobile Viewport
  - Scenario 4: Desktop Large Viewport
VERIFICATION: Manual
```
