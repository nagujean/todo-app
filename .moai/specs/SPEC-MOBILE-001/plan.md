# 구현 계획: SPEC-MOBILE-001

**SPEC ID**: SPEC-MOBILE-001
**Title**: 모바일 UI 반응형 디자인 수정
**Status**: Planned
**Last Updated**: 2025-02-01

---

## 마일스톤 (우선순위 기반)

### 1차 목표 (최우선 요구사항)

**마일스톤 1: 접근성 준수**
- REQ-MOBILE-001: WCAG 준수를 위한 viewport 메타 태그 수정
- REQ-MOBILE-002: 반응형 컨테이너 너비 구현

**의존성**: 없음 (독립적인 변경)

### 2차 목표 (높은 우선순위 요구사항)

**마일스톤 2: 모바일 레이아웃 최적화**
- REQ-MOBILE-003: 반응형 헤더 레이아웃
- REQ-MOBILE-004: 모바일 최적화 TodoItem 간격
- REQ-MOBILE-005: 오버플로우 안전 필터/정렬 버튼

**의존성**: 마일스톤 1이 먼저 완료되어야 함 (반응형 기반 설정)

---

## Technical Approach

### 1단계: 중요 수정사항 (마일스톤 1)

**Step 1.1: Viewport 메타 태그 수정**
- 파일: `src/app/layout.tsx` (lines 29-35)
- 작업: 제한적인 viewport 속성 제거
- 변경 전:
  ```tsx
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1" />
  ```
- 변경 후:
  ```tsx
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ```
- 검증: iOS Safari 및 Chrome Mobile에서 pinch-to-zoom 테스트

**Step 1.2: 반응형 컨테이너 너비**
- 파일: `src/app/page.tsx` (lines 60-61)
- 작업: 반응형 breakpoint 클래스 추가
- 변경 전: `className="max-w-xl mx-auto"`
- 변경 후: `className="max-w-full px-4 md:max-w-xl md:px-0 mx-auto"`
- 검증: 320px, 375px, 414px, 768px 너비에서 테스트

### 2단계: 높은 우선순위 수정사항 (마일스톤 2)

**Step 2.1: 반응형 헤더 레이아웃**
- 파일: `src/app/page.tsx` (lines 63-76)
- 작업: flex-direction 반응형 클래스 추가
- 추가: `flex flex-col md:flex-row gap-2 md:gap-4`
- 검증: 모바일 장치에서 요소 겹침 없음 확인

**Step 2.2: 모바일 최적화 TodoItem 간격**
- 파일: `src/components/todo/TodoItem.tsx` (lines 48-52)
- 작업: 반응형 패딩 및 간격 클래스 추가
- 모바일: `py-2 px-3 gap-2`
- 데스크톱: `md:py-3 md:px-4 md:gap-3`
- 검증: 터치 대상 크기 측정 (최소 44px)

**Step 2.3: 오버플로우 안전 버튼 컨테이너**
- 파일: `src/components/todo/TodoList.tsx` (lines 73-76)
- 작업: 버튼 컨테이너에 `flex-wrap` 추가
- 추가: `flex-wrap gap-2`
- 검증: 320px 너비에서 여러 버튼으로 테스트

---

## Architecture Design

### 반응형 Breakpoint 전략

Tailwind CSS v4 기본 breakpoint 준수:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| sm | 640px | Large phones (가로 모드) |
| md | 768px | Tablets (세로 모드) |
| lg | 1024px | Tablets (가로 모드), small laptops |

**모바일 우선 접근법**:
- 기본 스타일: 모바일 (< 768px)
- `md:` 접두사: 데스크톱 (>= 768px)

### 파일 수정 요약

| File | Lines | Changes | Risk Level |
|------|-------|---------|------------|
| src/app/layout.tsx | 29-35 | Viewport 메타 태그 | Low |
| src/app/page.tsx | 60-61, 63-76 | 컨테이너 + 헤더 | Low |
| src/components/todo/TodoItem.tsx | 48-52 | 간격 (Spacing) | Low |
| src/components/todo/TodoList.tsx | 73-76 | 버튼 flex wrap | Low |

**위험도 평가**: 모든 변경사항은 로직 수정 없이 CSS 클래스만 추가하므로 낮은 위험도입니다.

---

## Testing Strategy

### 수동 테스트 체크리스트

**Viewport 접근성**:
- [ ] iOS Safari에서 pinch-to-zoom 작동
- [ ] Chrome Mobile에서 pinch-to-zoom 작동
- [ ] 200% 확대 시 콘텐츠 잘림 없음
- [ ] WCAG 2.1 Level AA 준수 검증 완료

**반응형 레이아웃**:
- [ ] 320px 너비에서 가로 스크롤 없음
- [ ] 375px 너비에서 가로 스크롤 없음
- [ ] 414px 너비에서 가로 스크롤 없음
- [ ] 768px+ 너비에서 콘텐츠 중앙 정렬
- [ ] 모바일에서 헤더 요소 수직 누적
- [ ] 데스크톱에서 헤더 요소 수평 정렬
- [ ] 모바일에서 할 일 항목 적절한 간격
- [ ] 필터/정렬 버튼 오버플로우 없이 감싸짐

**터치 대상**:
- [ ] 모든 대화형 요소 >= 44px 높이
- [ ] 터치 대상 간 최소 8px 간격
- [ ] 대화형 요소 간 겹침 없음

### 브라우저 테스트 매트릭스

| Device/Browser | Viewport | Header | TodoItem | Buttons |
|----------------|----------|--------|----------|---------|
| iOS Safari | | | | |
| Chrome Mobile | | | | |
| Samsung Internet | | | | |
| Firefox Mobile | | | | |

---

## Quality Gates

### 커밋 전 검증

- [ ] 모든 수정 파일이 ESLint 통과
- [ ] 모든 수정 파일이 TypeScript 타입 검사 통과
- [ ] 브라우저 콘솔에 콘솔 오류 없음
- [ ] 최소 2개 모바일 브라우저에서 수동 테스트 완료

### 완료 정의 (Definition of Done)

- [ ] 모든 Critical (REQ-MOBILE-001, REQ-MOBILE-002) 요구사항 충족
- [ ] 모든 High (REQ-MOBILE-003, REQ-MOBILE-004, REQ-MOBILE-005) 요구사항 충족
- [ ] WCAG 2.1 Level AA 접근성 검증 완료
- [ ] 데스크톱 UI (768px+) 회귀 없음
- [ ] 수동 테스트 완료 및 문서화

---

## Rollback Plan

배포 후 문제 발생 시:

1. **즉시 롤백**: SPEC-MOBILE-001 커밋 되돌리기
2. **영향 받는 파일**: 최소 변경의 4개 파일 (롤백 용이)
3. **데이터 마이그레이션**: 없음 (데이터 구조 변경 없음)
4. **사용자 영향**: 없음 (UI 전용 변경)

**롤백 명령어**:
```bash
git revert <commit-hash>
```

---

## 위험 및 완화 (Risks and Mitigation)

| Risk | 확률 (Probability) | 영향 (Impact) | 완화 방안 (Mitigation) |
|------|---------------------|---------------|------------------------|
| 확대 시 레이아웃 깨짐 | Low | Medium | 다양한 장치에서 200% 확대 테스트 |
| 데스크톱 UI 회귀 | Low | Low | 데스크톱 레이아웃 변경 없음 확인 (768px+) |
| 브라우저 호환성 | Low | Low | 최신 브라우저만 테스트 (CSS Grid/Flexbox 지원 가정) |
| 터치 대상 너무 작음 | Medium | Medium | 모든 대화형 요소의 44px 최소 측정 및 검증 |

---

## 다음 단계 (Next Steps)

1. **실행 단계**: 구현 시작을 위해 `/moai:2-run SPEC-MOBILE-001` 실행
2. **테스트**: 자동화된 모바일 viewport 테스트를 위해 expert-testing 에이전트 사용
3. **문서화**: 완료 후 `/moai:3-sync SPEC-MOBILE-001` 실행하여 문서 업데이트

---

## Traceability Tags

**관련 SPECs**: 없음 (독립적인 수정)

**의존성**:
- 없음 (독립적인 모바일 UI 수정)

**차단됨 (Blocked By)**: 없음

**차단 중 (Blocking)**: 없음
