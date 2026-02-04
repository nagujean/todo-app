# SPEC-MOBILE-001: Mobile UI Responsive Design Fixes

## TAG BLOCK

```yaml
SPEC_ID: SPEC-MOBILE-001
TITLE: 모바일 UI 반응형 디자인 수정
STATUS: in_progress
PRIORITY: High
DOMAIN: Frontend
CREATED: 2025-02-01
UPDATED: 2026-02-04
ASSIGNED: TBD
LIFECYCLE: spec-first
```

## Environment

- **Target Platform**: 모바일 웹 브라우저 (iOS Safari, Chrome Mobile, Samsung Internet)
- **Supported Devices**: 화면 너비 320px - 768px의 스마트폰
- **Browser Support**: CSS Grid와 Flexbox를 지원하는 최신 브라우저
- **Framework Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5.9+

## Assumptions

- 데스크톱 UI (768px+)는 현재 정상 작동 중이며 변경 불필요
- Tailwind CSS v4 반응형 유틸리티 (`sm:`, `md:`, `lg:`) 사용 가능
- 접근성을 위해 WCAG 2.1 Level AA 준수 필요
- 시각 장애인 사용자를 위해 확대 기능 필요

## 요구사항 (Requirements)

### 최우선순위 요구사항 (Critical Priority Requirements)

#### REQ-MOBILE-001: Viewport 접근성 준수

**WHEN** 사용자가 모바일 장치에서 애플리케이션을 볼 때,
**THEN** 시스템은 접근성을 위해 사용자 제어 확대 (pinch-to-zoom)를 허용해야 한다.

**Rationale**: `userScalable: false`와 `maximumScale: 1`은 WCAG 2.1 Success Criterion 1.4.4 (Resize text)를 위반합니다.

**인수 조건 (Acceptance Criteria)**:
- Viewport 메타 태그가 `user-scalable=yes`를 허용
- 5.0 미만의 `maximum-scale` 제한 없음
- 사용자가 최소 200%까지 pinch-to-zoom 가능
- WCAG 2.1 Level AA 준수 검증 완료

**File**: `src/app/layout.tsx` (lines 29-35)

---

#### REQ-MOBILE-002: 반응형 컨테이너 너비

**WHEN** 사용자가 모바일 장치 (320px - 768px)에서 애플리케이션을 볼 때,
**THEN** 시스템은 화면 크기에 적응하는 유연한 너비로 콘텐츠를 표시해야 한다.

**Rationale**: 고정된 `max-w-xl` (576px)은 작은 화면에서 가로 스크롤이나 콘텐츠 잘림을 유발합니다.

**인수 조건 (Acceptance Criteria)**:
- 컨테이너 너비가 반응형 breakpoint 사용: 모바일에서 `max-w-full`, 데스크톱에서 `max-w-xl`
- 320px - 767px 장치에서 가로 스크롤 없음
- 모바일에서 16px 최소 수평 패딩 유지
- 더 큰 화면 (768px+)에서 콘텐츠 중앙 정렬

**File**: `src/app/page.tsx` (lines 60-61)

---

### 높은 우선순위 요구사항 (High Priority Requirements)

#### REQ-MOBILE-003: 반응형 헤더 레이아웃

**WHEN** 사용자가 모바일 장치 (< 768px)에서 헤더를 볼 때,
**THEN** 시스템은 헤더 요소를 수직 (누적) 레이아웃으로 표시해야 한다.

**WHEN** 사용자가 데스크톱 장치 (>= 768px)에서 헤더를 볼 때,
**THEN** 시스템은 헤더 요소를 수평 (행) 레이아웃으로 표시해야 한다.

**Rationale**: 수평 헤더는 작은 화면에서 요소 겹침을 유발합니다.

**인수 조건 (Acceptance Criteria)**:
- 헤더가 모바일에서 `flex-col`, 데스크톱에서 `flex-row` 사용
- 모바일에서 누적된 요소 간 최소 8px 수직 간격
- 모든 헤더 요소가 겹침 없이 완전히 표시
- 터치 대상이 최소 44x44px 크기 요구사항 충족

**File**: `src/app/page.tsx` (lines 63-76)

---

#### REQ-MOBILE-004: 모바일 최적화 TodoItem 간격

**WHEN** 사용자가 모바일 장치에서 할 일 항목을 볼 때,
**THEN** 시스템은 터치 상호작용에 적합한 간격으로 항목을 표시해야 한다.

**Rationale**: 과도한 간격은 화면 공간을 낭비하고, 불충분한 간격은 터치 오류를 유발합니다.

**인수 조건 (Acceptance Criteria)**:
- TodoItem 패딩: `py-2 px-3` (모바일) vs `py-3 px-4` (데스크톱)
- 항목 간 간격: `gap-2` (모바일) vs `gap-3` (데스크톱)
- 대화형 요소의 최소 터치 대상: 44px 높이
- 최소 16px 글꼴 크기로 텍스트 가독성 유지

**File**: `src/components/todo/TodoItem.tsx` (lines 48-52)

---

#### REQ-MOBILE-005: 오버플로우 안전 필터/정렬 버튼

**WHEN** 사용자가 모바일 장치에서 필터 및 정렬 버튼을 볼 때,
**THEN** 시스템은 컨테이너 너비 초과 시 버튼을 여러 줄로 감싸야 한다.

**Rationale**: 고정된 수평 레이아웃은 좁은 장치에서 버튼 오버플로우를 유발합니다.

**인수 조건 (Acceptance Criteria)**:
- 버튼 컨테이너가 자동 감싸기를 위해 `flex-wrap` 사용
- 감싸진 버튼 간 최소 8px 간격
- 터치 대상을 위해 버튼이 최소 44px 높이 유지
- 320px 너비 장치에서 가로 스크롤 없음

**File**: `src/components/todo/TodoList.tsx` (lines 73-76)

---

## Specifications

### Technical Approach

1. **Viewport Configuration** (Critical)
   - viewport 메타 태그에서 `userScalable="no"`와 `maximumScale="1"` 제거
   - 사용자 확대를 허용하는 기본 viewport 구성 사용

2. **Responsive Container** (Critical)
   - `max-w-xl`을 `max-w-full md:max-w-xl`로 변경
   - 수평 패딩 추가: 모바일용 `px-4`

3. **Header Flex Direction** (High)
   - 반응형 클래스 추가: `flex flex-col md:flex-row`
   - 간격 추가: `gap-2 md:gap-4`

4. **TodoItem Spacing** (High)
   - 모바일: `py-2 px-3 gap-2`
   - 데스크톱: `md:py-3 md:px-4 md:gap-3`

5. **Button Flex Wrap** (High)
   - 버튼 컨테이너에 `flex-wrap` 추가
   - WCAG 요구사항 충족하는 터치 대상 크기 확인

### Constraints

- **Accessibility**: WCAG 2.1 Level AA 준수 필수
- **Performance**: First Contentful Paint (FCP)에 영향 없음
- **Backward Compatibility**: 데스크톱 UI 변경 없음 유지
- **Browser Support**: CSS Grid/Flexbox 지원 최신 브라우저

### Non-Functional Requirements

- **Responsive Breakpoints**:
  - 모바일: < 768px (sm, md breakpoints)
  - 데스크톱: >= 768px (lg breakpoint)
- **Touch Target Size**: 최소 44x44px (WCAG 2.5.5)
- **Minimum Font Size**: 본문 텍스트 16px (iOS에서 원치 않는 확대 방지)

## Traceability

| REQ ID | File | Component | 우선순위 (Priority) |
|--------|------|-----------|---------------------|
| REQ-MOBILE-001 | src/app/layout.tsx | Viewport meta tag | Critical |
| REQ-MOBILE-002 | src/app/page.tsx | Main container | Critical |
| REQ-MOBILE-003 | src/app/page.tsx | Header layout | High |
| REQ-MOBILE-004 | src/components/todo/TodoItem.tsx | Todo item spacing | High |
| REQ-MOBILE-005 | src/components/todo/TodoList.tsx | Button container | High |

---

## References

- [WCAG 2.1 Success Criterion 1.4.4 - Resize text](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)
- [WCAG 2.1 Success Criterion 2.5.5 - Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
