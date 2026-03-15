# 인수 조건 (Acceptance Criteria): SPEC-MOBILE-001

**SPEC ID**: SPEC-MOBILE-001
**Title**: 모바일 UI 반응형 디자인 수정
**Status**: Planned
**Last Updated**: 2025-02-01

---

## 최우선 요구사항 인수 (Critical Requirements Acceptance)

### AC-MOBILE-001: Viewport 접근성 준수

**주어진 상황 (Given)** 사용자가 모바일 장치에서 애플리케이션을 볼 때
**작업 (When)** 사용자가 페이지를 pinch-to-zoom 하려고 시도할 때
**결과 (Then)** 페이지는 확대 제스처에 응답해야 한다
**그리고 (And)** 사용자는 최소 200%까지 확대할 수 있어야 한다
**그리고 (And)** viewport 제한이 사용자 제어 확대를 방지하면 안 된다

**테스트 시나리오 (Test Scenarios)**:

| Scenario | 주어진 상황 (Given) | 작업 (When) | 결과 (Then) |
|----------|-------------------|-------------|-------------|
| iOS Safari 확대 | iPhone에서 iOS Safari 사용 중인 사용자 | 사용자가 pinch로 확대 | 페이지가 200%로 확대됨 |
| Chrome Mobile 확대 | Android에서 Chrome 사용 중인 사용자 | 사용자가 pinch로 확대 | 페이지가 200%로 확대됨 |
| WCAG 준수 | 접근성 감사관이 viewport 검토 | 메타 태그 확인 | `user-scalable=false` 없음 |

**품질 게이트 (Quality Gate)**:
- [ ] Viewport 메타 태그에 `user-scalable=no`가 없음
- [ ] Viewport 메타 태그에 `maximum-scale=1`이 없음
- [ ] iOS Safari에서 pinch-to-zoom 작동
- [ ] Chrome Mobile에서 pinch-to-zoom 작동
- [ ] WCAG 2.1 Success Criterion 1.4.4 준수 검증 완료

---

### AC-MOBILE-002: 반응형 컨테이너 너비

**주어진 상황 (Given)** 사용자가 너비 320px - 767px의 모바일 장치에서 애플리케이션을 볼 때
**작업 (When)** 페이지가 로드될 때
**결과 (Then)** 콘텐츠는 사용 가능한 전체 너비를 차지해야 한다
**그리고 (And)** 가로 스크롤이 발생하면 안 된다
**그리고 (And)** 16px 수평 패딩이 유지되어야 한다

**주어진 상황 (Given)** 사용자가 너비 768px+의 데스크톱 장치에서 애플리케이션을 볼 때
**작업 (When)** 페이지가 로드될 때
**결과 (Then)** 콘텐츠는 최대 너비 576px으로 중앙 정렬되어야 한다
**그리고 (And)** 데스크톱 레이아웃은 변경되지 않아야 한다

**테스트 시나리오 (Test Scenarios)**:

| Scenario | Screen Width | Expected Behavior |
|----------|--------------|-------------------|
| 소형 모바일 | 320px | 전체 너비, 가로 스크롤 없음 |
| 중형 모바일 | 375px | 전체 너비, 가로 스크롤 없음 |
| 대형 모바일 | 414px | 전체 너비, 가로 스크롤 없음 |
| 태블릿 | 768px | 최대 576px 너비, 중앙 정렬 |
| 데스크톱 | 1024px | 최대 576px 너비, 중앙 정렬 |

**품질 게이트 (Quality Gate)**:
- [ ] 320px 너비에서 가로 스크롤 없음
- [ ] 375px 너비에서 가로 스크롤 없음
- [ ] 414px 너비에서 가로 스크롤 없음
- [ ] 모바일에서 콘텐츠에 16px 수평 패딩 있음
- [ ] 데스크톱 (768px+)에서 콘텐츠 중앙 정렬
- [ ] 데스크톱 레이아웃이 원본과 일치 (회귀 없음)

---

## 높은 우선순위 요구사항 인수 (High Priority Requirements Acceptance)

### AC-MOBILE-003: 반응형 헤더 레이아웃

**주어진 상황 (Given)** 사용자가 모바일 장치 (< 768px)에서 애플리케이션을 볼 때
**작업 (When)** 헤더가 렌더링될 때
**결과 (Then)** 헤더 요소는 수직으로 배치되어야 한다
**그리고 (And)** 요소 간 최소 8px 간격이 있어야 한다
**그리고 (And)** 요소 겹침이 발생하면 안 된다

**주어진 상황 (Given)** 사용자가 데스크톱 장치 (>= 768px)에서 애플리케이션을 볼 때
**작업 (When)** 헤더가 렌더링될 때
**결과 (Then)** 헤더 요소는 수평으로 배치되어야 한다
**그리고 (And)** 원본 데스크톱 레이아웃이 보존되어야 한다

**테스트 시나리오 (Test Scenarios)**:

| Scenario | Device Width | Layout Direction | Spacing |
|----------|--------------|------------------|---------|
| 모바일 세로 | 375px | 수직 (누적) | 8px |
| 모바일 가로 | 667px | 수직 (누적) | 8px |
| 태블릿 | 768px | 수평 (행) | 16px |
| 데스크톱 | 1024px | 수평 (행) | 16px |

**품질 게이트 (Quality Gate)**:
- [ ] 모바일에서 헤더 요소 수직 누적
- [ ] 데스크톱에서 헤더 요소 수평 정렬
- [ ] 모바일에서 요소 겹침 없음
- [ ] 모바일에서 최소 8px 간격
- [ ] 터치 대상 >= 44px 높이

---

### AC-MOBILE-004: 모바일 최적화 TodoItem 간격

**주어진 상황 (Given)** 사용자가 모바일 장치에서 할 일 항목을 볼 때
**작업 (When)** 여러 할 일 항목이 표시될 때
**결과 (Then)** 항목은 터치 상호작용에 적합한 간격을 가져야 한다
**그리고 (And)** 수직 패딩은 8px (py-2)이어야 한다
**그리고 (And)** 수평 패딩은 12px (px-3)이어야 한다
**그리고 (And)** 항목 간 간격은 8px (gap-2)이어야 한다

**주어진 상황 (Given)** 사용자가 데스크톱 장치에서 할 일 항목을 볼 때
**작업 (When)** 여러 할 일 항목이 표시될 때
**결과 (Then)** 항목은 데스크톱 간격 값을 사용해야 한다
**그리고 (And)** 수직 패딩은 12px (py-3)이어야 한다
**그리고 (And)** 수평 패딩은 16px (px-4)이어야 한다
**그리고 (And)** 항목 간 간격은 12px (gap-3)이어야 한다

**테스트 시나리오 (Test Scenarios)**:

| Scenario | Device | Padding (v/h) | Gap | Touch Target Height |
|----------|--------|---------------|-----|---------------------|
| 모바일 | < 768px | 8px / 12px | 8px | >= 44px |
| 데스크톱 | >= 768px | 12px / 16px | 12px | >= 44px |

**품질 게이트 (Quality Gate)**:
- [ ] 모바일에서 할 일 항목 적절한 간격
- [ ] 데스크톱에서 할 일 항목 적절한 간격
- [ ] 터치 대상이 44px 최소 충족 (WCAG 2.5.5)
- [ ] 텍스트가 최소 16px에서 가독성 유지

---

### AC-MOBILE-005: 오버플로우 안전 필터/정렬 버튼

**주어진 상황 (Given)** 사용자가 모바일 장치에서 필터 및 정렬 버튼을 볼 때
**작업 (When)** 결합된 버튼 너비가 컨테이너 너비를 초과할 때
**결과 (Then)** 버튼은 여러 줄로 감싸져야 한다
**그리고 (And)** 감싸진 버튼 간 최소 8px 간격이 유지되어야 한다
**그리고 (And)** 버튼이 화면을 넘치면 안 된다

**주어진 상황 (Given)** 사용자가 320px 너비 장치에서 필터 및 정렬 버튼을 볼 때
**작업 (When)** 모든 버튼이 표시될 때
**결과 (Then)** 모든 버튼이 표시되어야 한다
**그리고 (And)** 가로 스크롤이 발생하면 안 된다

**테스트 시나리오 (Test Scenarios)**:

| Scenario | Screen Width | Button Count | Expected Behavior |
|----------|--------------|--------------|-------------------|
| 좁은 모바일 | 320px | 4개 버튼 | 2줄로 감싸짐 |
| 중형 모바일 | 375px | 4개 버튼 | 2줄로 감싸지거나 맞음 |
| 넓은 모바일 | 414px | 4개 버튼 | 1줄에 맞을 수 있음 |
| 데스크톱 | 1024px | 4개 버튼 | 단일 행, 감싸짐 없음 |

**품질 게이트 (Quality Gate)**:
- [ ] 320px에서 버튼 오버플로우 없이 감싸짐
- [ ] 375px에서 버튼 오버플로우 없이 감싸짐
- [ ] 414px에서 버튼 오버플로우 없이 감싸짐
- [ ] 감싸진 버튼 간 최소 8px 간격
- [ ] 터치 대상 >= 44px 높이
- [ ] 모든 모바일 너비에서 가로 스크롤 없음

---

## 교차 요구사항 인수 (Cross-Requirement Acceptance)

### AC-MOBILE-006: 데스크톱 회귀 없음

**주어진 상황 (Given)** 사용자가 데스크톱 장치 (>= 768px)에서 애플리케이션을 볼 때
**작업 (When)** 업데이트된 UI를 원본과 비교할 때
**결과 (Then)** 시각적 차이가 없어야 한다
**그리고 (And)** 모든 데스크톱 기능이 변경되지 않아야 한다
**그리고 (And)** 데스크톱 레이아웃이 원본 디자인과 일치해야 한다

**테스트 시나리오 (Test Scenarios)**:

| Scenario | Screen Width | Expected Behavior |
|----------|--------------|-------------------|
| 태블릿 세로 | 768px | 데스크톱 레이아웃 (모바일 스타일 없음) |
| 소형 노트북 | 1024px | 원본 데스크톱 레이아웃 |
| 대형 데스크톱 | 1920px | 원본 데스크톱 레이아웃 |

**품질 게이트 (Quality Gate)**:
- [ ] 768px에서 데스크톱 레이아웃 변경 없음
- [ ] 1024px에서 데스크톱 레이아웃 변경 없음
- [ ] 1920px에서 데스크톱 레이아웃 변경 없음
- [ ] 원본과 비교 시 시각적 회귀 없음

---

### AC-MOBILE-007: WCAG 2.1 Level AA 준수

**주어진 상황 (Given)** 접근성 감사관이 모바일 UI를 검토할 때
**작업 (When)** WCAG 2.1 Level AA 기준으로 테스트할 때
**결과 (Then)** 모든 적용 가능한 Success Criteria를 통과해야 한다
**그리고 (And)** 구체적으로:
- Success Criterion 1.4.4 (Resize text): 통과
- Success Criterion 1.4.10 (Reflow): 통과 (320px에서 2D 스크롤 없음)
- Success Criterion 2.5.5 (Target Size): 통과 (44px 최소)

**테스트 시나리오 (Test Scenarios)**:

| Criterion | Test Method | Expected Result |
|-----------|-------------|-----------------|
| 1.4.4 Resize text | 200% 확대 시도 | 가로 스크롤 없음 |
| 1.4.10 Reflow | 320px 너비로 보기 | 2D 스크롤링 불필요 |
| 2.5.5 Target Size | 터치 대상 측정 | 모두 >= 44x44px |

**품질 게이트 (Quality Gate)**:
- [ ] WCAG 1.4.4 (Resize text) 검증 완료
- [ ] WCAG 1.4.10 (Reflow) 검증 완료
- [ ] WCAG 2.5.5 (Target Size) 검증 완료
- [ ] 접근성 감사 완료

---

## 완료 정의 (Definition of Done)

요구사항은 다음 조건이 충족될 때 완료로 간주됩니다:

- [ ] 모든 인수 조건 시나리오 통과
- [ ] 최소 2개 모바일 브라우저에서 수동 테스트 완료
- [ ] WCAG 2.1 Level AA 준수 검증 완료
- [ ] 데스크톱 UI 회귀 감지되지 않음
- [ ] 코드 리뷰 승인 완료
- [ ] 모든 품질 게이트 통과

---

## 테스트 실행 요약 (Test Execution Summary)

### 수동 테스트 필수

| Test Category | Devices/Browsers | Status |
|---------------|------------------|--------|
| Viewport 확대 | iOS Safari, Chrome Mobile | 대기 중 |
| 반응형 레이아웃 | 320px, 375px, 414px, 768px | 대기 중 |
| 터치 대상 | 모든 대화형 요소 | 대기 중 |
| 데스크톱 회귀 | 768px, 1024px, 1920px | 대기 중 |
| WCAG 준수 | 접근성 감사 | 대기 중 |

### 브라우저 테스트 매트릭스

| Device | OS | Browser | Viewport | Header | Items | Buttons |
|--------|-------|---------|----------|--------|-------|---------|
| iPhone 12 | iOS 15+ | Safari | | | | |
| Pixel 5 | Android 12+ | Chrome | | | | |
| Galaxy S21 | Android 12+ | Samsung Internet | | | | |

---

## Traceability Tags

**SPEC 참고 (Reference)**: SPEC-MOBILE-001

**요구사항 커버리지 (Requirements Coverage)**:
- AC-MOBILE-001은 REQ-MOBILE-001 (Viewport)를 포괄
- AC-MOBILE-002는 REQ-MOBILE-002 (Container)를 포괄
- AC-MOBILE-003는 REQ-MOBILE-003 (Header)를 포괄
- AC-MOBILE-004는 REQ-MOBILE-004 (TodoItem)를 포괄
- AC-MOBILE-005는 REQ-MOBILE-005 (Buttons)를 포괄
- AC-MOBILE-006는 데스크톱 회귀를 포괄
- AC-MOBILE-007는 WCAG 준수를 포괄

**관련 아티팩트 (Related Artifacts)**:
- 테스트 케이스: `/moai:2-run SPEC-MOBILE-001`
- 문서화: `/moai:3-sync SPEC-MOBILE-001`
