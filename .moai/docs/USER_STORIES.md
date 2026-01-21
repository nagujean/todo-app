# Todo App 사용자 스토리 문서

**버전:** 0.1.0
**작성일:** 2026-01-18
**프로젝트:** Todo App
**기술 스택:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, Zustand

---

## 1. INVEST 원칙 개요

본 문서의 모든 사용자 스토리는 INVEST 원칙을 따라 작성되었습니다.

### INVEST 원칙 정의

- **I**ndependent (독립성): 다른 스토리와의 의존성 최소화
- **N**egotiable (협상 가능성): 구현 방식에 대한 유연성 확보
- **V**aluable (가치 제공): 사용자에게 명확한 가치 전달
- **E**stimable (추정 가능): 개발 노력 추정 가능
- **S**mall (적절한 크기): 하나의 스프린트에서 완료 가능
- **T**estable (테스트 가능): 명확한 인수 조건 정의

### 사용자 스토리 형식

```
As: [역할]
I want: [원하는 기능]
So that: [목적/가치]

Acceptance Criteria:
- Given: [사전 조건]
- When: [행동]
- Then: [결과]

Story Points: [추정]
Priority: [우선순위]
Related Requirements: [관련 요구사항 ID]
```

---

## 2. 사용자 페르소나 요약

### 2.1 Student Sarah (바쁜 학생)
- **특성**: 22세 대학생, 디자인 전공, 기술 친화적
- **니즈**: 간단한 과제/일정 관리, 즉시 실행, 계정 불필요
- **패인포인트**: 복잡한 도구, 로그인 과정

### 2.2 Developer Dan (프리랜서 개발자)
- **특성**: 29세 5년차 개발자, 프라이버시 중시, 키보드 선호
- **니즈**: 빠른 입력, 프로젝트 분류, 로컬 저장
- **패인포인트**: 무거운 도구, 클라우드 강제

### 2.3 Office Worker Olivia (일반 직장인)
- **특성**: 32세 7년차 마케팅, 앱 배움 꺼려림
- **니즈**: 업무/개인 일정 관리, 모바일 확인
- **패인포인트**: 복잡한 기업용 도구, 반복 입력

---

## 3. Epic 1: 할 일 관리 (MVP)

### Story 1.1: 할 일 추가하기

**As:** 사용자 (Student Sarah, Developer Dan, Office Worker Olivia)
**I want:** 빠르게 할 일을 추가하고 싶다
**So that:** 떠오른 생각이나 과제를 즉시 기록할 수 있다

**Acceptance Criteria:**
- **Given:** 메인 페이지에 접속하고
- **When:** 텍스트 입력창에 "과제 제출하기"를 입력하고 추가 버튼을 클릭하면
- **Then:** 새로운 할 일이 목록 최상단에 추가되고 입력창은 초기화된다
- **And:** 추가된 할 일은 미완료 상태로 표시된다
- **And:** 할 일 추가 시 슬라이드인 애니메이션이 적용된다

**Edge Cases:**
- 빈 제목 또는 공백만 입력 시 에러 메시지 표시
- 200자 초과 입력 시 자동 잘림
- Enter 키로도 추가 가능

**Story Points:** 3
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-001, REQ-FUNC-002, REQ-FUNC-003, REQ-UI-008

---

### Story 1.2: 할 일 완료하기

**As:** 사용자 (Student Sarah)
**I want:** 할 일을 완료 표시하고 싶다
**So that:** 내 성취를 시각적으로 확인하고 동기부여를 얻을 수 있다

**Acceptance Criteria:**
- **Given:** 목록에 "과제 제출하기" 할 일이 있고
- **When:** 해당 항목의 체크박스를 클릭하면
- **Then:** 해당 항목에 취소선이 표시되고 완료 상태로 변경된다
- **And:** 완료 시간이 기록된다
- **And:** 완료된 항목은 목록 하단으로 이동한다 (필터 모드가 아닐 때)
- **And:** 부드러운 상태 변경 애니메이션이 적용된다

**Edge Cases:**
- 체크박스를 다시 클릭하면 미완료 상태로 복귀
- 완료된 항목의 completedAt 시간이 ISO 8601 형식으로 저장됨

**Story Points:** 2
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-005, REQ-FUNC-006, REQ-FUNC-007, REQ-UI-010

---

### Story 1.3: 할 일 삭제하기

**As:** 사용자 (Developer Dan)
**I want:** 완료된 할 일을 삭제하고 싶다
**So that:** 목록을 깔끔하게 유지하고 중요한 할 일에 집중할 수 있다

**Acceptance Criteria:**
- **Given:** 목록에 "과제 제출하기" 할 일이 있고
- **When:** 해당 항목의 삭제 버튼을 클릭하면
- **Then:** 확인 다이얼로그가 표시된다
- **And:** 확인을 선택하면 해당 항목이 목록에서 제거되고 localStorage에서 삭제된다
- **And:** 페이드아웃 애니메이션이 적용된다
- **And:** 5초 동안 Undo 버튼이 표시된다

**Edge Cases:**
- Undo 버튼 클릭 시 삭제된 항목 복원
- 완료된 항목이 없을 때 일괄 삭제 버튼 비활성화
- 삭제 취소 시 원래 위치로 복원

**Story Points:** 3
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-008, REQ-FUNC-009, REQ-FUNC-010, REQ-UI-009

---

### Story 1.4: 할 일 필터링하기

**As:** 사용자 (Office Worker Olivia)
**I want:** 미완료/완료 할 일만 필터링해서 보고 싶다
**So that:** 현재 해야 할 일에 집중하고 완료한 작업을 확인할 수 있다

**Acceptance Criteria:**
- **Given:** 목록에 10개의 할 일이 있고 (5개 완료, 5개 미완료)
- **When:** "미완료" 필터 탭을 클릭하면
- **Then:** 미완료 할 일 5개만 표시된다
- **And:** 필터 상태가 localStorage에 저장된다
- **And:** 페이지 새로고침 후에도 필터 상태가 유지된다

**Edge Cases:**
- 필터링 결과가 없을 때 "표시할 할 일이 없습니다" 메시지 표시
- 필터 탭 간 전환 시 부드러운 애니메이션 적용

**Story Points:** 2
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-014, REQ-FUNC-015, REQ-FUNC-016, REQ-UI-007

---

### Story 1.5: 데이터 영속화

**As:** 사용자 (Student Sarah)
**I want:** 페이지를 새로고침해도 내 할 일이 남아있기를 바란다
**So that:** 실수로 창을 닫아도 데이터를 잃지 않을 수 있다

**Acceptance Criteria:**
- **Given:** 사용자가 3개의 할 일을 추가하고
- **When:** 페이지를 새로고침하면
- **Then:** 3개의 할 일이 그대로 표시된다
- **And:** 각 할 일의 상태(완료/미완료)도 유지된다
- **And:** 완료 시간 정보도 보존된다

**Technical Details:**
- localStorage 키: `todo-app-data`
- 저장 형식: JSON 배열
- 저장 타이밍: 변경 발생 시 100ms 이내 (디바운스)
- UTF-8 인코딩

**Story Points:** 3
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-017, REQ-FUNC-018, REQ-FUNC-019, REQ-DATA-003, REQ-DATA-004

---

## 4. Epic 2: 사용자 경험

### Story 2.1: 다크 모드 전환

**As:** 사용자 (Developer Dan)
**I want:** 다크 모드를 사용하고 싶다
**So that:** 밤이나 어두운 환경에서 눈의 피로를 줄일 수 있다

**Acceptance Criteria:**
- **Given:** 라이트 모드로 앱을 사용하고 있고
- **When:** 테마 전환 버튼을 클릭하면
- **Then:** 다크 모드가 적용되고 모든 요소가 가독성 있게 표시된다
- **And:** 테마 설정이 localStorage에 저장된다
- **And:** 시스템 테마 설정과 자동으로 동기화된다

**Edge Cases:**
- 시스템 테마 변경 시 앱 테마도 자동 전환
- 수동 전환 후 시스템 테마 자동 동기화 비활성화
- 페이지 새로고침 후 테마 유지

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-UI-012, REQ-UI-013, REQ-UI-014

---

### Story 2.2: 반응형 레이아웃

**As:** 사용자 (Office Worker Olivia)
**I want:** 모바일, 태블릿, 데스크톱 어디서든 편하게 사용하고 싶다
**So that:** 출퇴근 길에도 업무 일정을 확인하고 관리할 수 있다

**Acceptance Criteria:**
- **Given:** 모바일(375px), 태블릿(768px), 데스크톱(1024px)로 접속하고
- **When:** 각 화면 크기에서 앱을 확인하면
- **Then:** 해당 화면에 최적화된 레이아웃이 표시된다
- **And:** 모든 터치 타겟은 최소 44x44px 크기를 유지한다
- **And:** 텍스트와 버튼이 가독성 있게 표시된다

**Screen-Specific Requirements:**
- **모바일 (320px-767px):** 전체 너비 활용, 단일 열 레이아웃
- **태블릿 (768px-1023px):** 중앙 정렬 컨테이너 (최대 600px)
- **데스크톱 (1024px+):** 중앙 정렬 컨테이너 (최대 600px), 여백 증가

**Story Points:** 5
**Priority:** High (P0)
**Related Requirements:** REQ-NFR-005, REQ-NFR-006, REQ-UI-004, REQ-UI-005, REQ-UI-006

---

### Story 2.3: 애니메이션

**As:** 사용자 (Student Sarah)
**I want:** 부드러운 애니메이션으로 자연스러운 사용 경험을 원한다
**So that:** 앱 사용이 즐겁고 반응성이 좋게 느껴진다

**Acceptance Criteria:**
- **Given:** 앱이 정상적으로 로드되고
- **When:** 할 일을 추가/삭제/완료하면
- **Then:** 각 작업에 적절한 애니메이션이 적용된다
- **And:** 모든 애니메이션은 60fps를 유지한다
- **And:** 애니메이션 지속 시간은 200-300ms이다

**Animation Types:**
- **추가:** 상단에서 슬라이드인 (slide-in from top)
- **삭제:** 페이드아웃 + 축소 (fade-out + scale-down)
- **완료:** 취소선 + 투명도 변경 (strikethrough + opacity)
- **필터:** 목록 아이템 페이드 인/아웃 (fade-in/out)

**Performance Requirements:**
- CSS transform 및 opacity 활용 (GPU 가속)
- will-change 속성으로 최적화
- prefers-reduced-motion 미디어 쿼리 지원

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-UI-008, REQ-UI-009, REQ-UI-010, REQ-UI-011, REQ-NFR-002

---

## 5. Epic 3: 데이터 관리

### Story 3.1: 데이터 내보내기

**As:** 사용자 (Developer Dan)
**I want:** 내 할 일 데이터를 JSON 파일로 백업하고 싶다
**So that:** 데이터 손실 위험에 대비하고 다른 기기에서도 복원할 수 있다

**Acceptance Criteria:**
- **Given:** 앱에 10개의 할 일이 저장되어 있고
- **When:** "내보내기" 버튼을 클릭하면
- **Then:** JSON 파일이 다운로드된다
- **And:** 파일명은 "todo-app-backup-YYYY-MM-DD.json" 형식이다
- **And:** 모든 할 일 데이터가 포함된다

**Data Format:**
```json
{
  "version": "0.1.0",
  "exportedAt": "2026-01-18T10:30:00.000Z",
  "todos": [
    {
      "id": "uuid",
      "title": "할 일 제목",
      "completed": false,
      "createdAt": "2026-01-18T10:00:00.000Z",
      "updatedAt": "2026-01-18T10:00:00.000Z",
      "completedAt": null
    }
  ]
}
```

**Edge Cases:**
- 할 일이 0개일 때도 빈 배열로 내보내기
- 대용량 데이터(1000개 이상) 처리 시 성능 저하 방지

**Story Points:** 2
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-020, REQ-DATA-008, REQ-DATA-009

---

### Story 3.2: 데이터 가져오기

**As:** 사용자 (Office Worker Olivia)
**I want:** 백업한 JSON 파일을 가져와서 복원하고 싶다
**So that:** 새로운 기기나 브라우저에서도 내 할 일을 계속 사용할 수 있다

**Acceptance Criteria:**
- **Given:** 백업 JSON 파일이 있고
- **When:** 파일을 업로드하면
- **Then:** 스키마 검증이 수행된다
- **And:** 기존 데이터와 ID 기반으로 병합된다
- **And:** 가져오기 성공 메시지가 표시된다

**Merge Strategy:**
- 동일 ID: 기존 데이터 유지 (덮어쓰기 X)
- 새 ID: 기존 목록에 추가
- 완료 시간이 최신인 항목 우선

**Validation Rules:**
- 파일 형식: JSON
- 필수 필드: id, title, completed, createdAt, updatedAt
- ID 형식: UUID v4
- 날짜 형식: ISO 8601
- 제목 길이: 최대 200자

**Error Handling:**
- 잘못된 파일 형식: "지원하지 않는 파일 형식입니다"
- 스키마 불일치: "파일 형식이 올바르지 않습니다"
- 손상된 데이터: "일부 항목을 가져오지 못했습니다 (N개 실패)"

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-021, REQ-DATA-010, REQ-DATA-011

---

## 6. 스토리 포인트 산정 기준

### 6.1 포인트 복잡도 기준

| 포인트 | 복잡도 | 예상 작업 시간 | 특징 |
|--------|--------|---------------|------|
| 1 | 매우 낮음 | 2-4시간 | 단순한 UI 변경, 데이터 표시 |
| 2 | 낮음 | 4-8시간 | 기본 CRUD, 간단한 상태 관리 |
| 3 | 중간 | 1-2일 | localStorage 연동, 애니메이션, 검증 |
| 5 | 높음 | 2-3일 | 반응형 레이아웃, 복잡한 상태 관리 |
| 8 | 매우 높음 | 3-5일 | 여러 기능 통합, 복잡한 비즈니스 로직 |

### 6.2 총 스토리 포인트

| Epic | Story | 포인트 | 우선순위 |
|------|-------|--------|----------|
| Epic 1: 할 일 관리 | Story 1.1: 할 일 추가하기 | 3 | P0 |
| | Story 1.2: 할 일 완료하기 | 2 | P0 |
| | Story 1.3: 할 일 삭제하기 | 3 | P0 |
| | Story 1.4: 할 일 필터링하기 | 2 | P1 |
| | Story 1.5: 데이터 영속화 | 3 | P0 |
| **Epic 1 소계** | | **13** | |
| Epic 2: 사용자 경험 | Story 2.1: 다크 모드 전환 | 3 | P1 |
| | Story 2.2: 반응형 레이아웃 | 5 | P0 |
| | Story 2.3: 애니메이션 | 3 | P1 |
| **Epic 2 소계** | | **11** | |
| Epic 3: 데이터 관리 | Story 3.1: 데이터 내보내기 | 2 | P1 |
| | Story 3.2: 데이터 가져오기 | 3 | P1 |
| **Epic 3 소계** | | **5** | |
| **총계** | | **29** | |

---

## 7. 우선순위별 스프린트 계획

### 7.1 Sprint 1: MVP 핵심 기능 (13포인트)

**목표:** 기본 할 일 관리 기능 구현

**포함 스토리:**
- Story 1.1: 할 일 추가하기 (3포인트)
- Story 1.2: 할 일 완료하기 (2포인트)
- Story 1.3: 할 일 삭제하기 (3포인트)
- Story 1.5: 데이터 영속화 (3포인트)
- Story 2.2: 반응형 레이아웃 (2포인트, MVP 버전)

**Definition of Done:**
- 모든 인수 조건 충족
- E2E 테스트 통과 (커버리지 80%+)
- Lighthouse 성능 점수 90+ (P0 항목)
- WCAG 2.1 Level AA 준수 (P0 항목)

### 7.2 Sprint 2: 사용자 경험 개선 (6포인트)

**목표:** 필터링 및 UI/UX 개선

**포함 스토리:**
- Story 1.4: 할 일 필터링하기 (2포인트)
- Story 2.1: 다크 모드 전환 (3포인트)
- Story 2.3: 애니메이션 (1포인트, 핵심 애니메이션만)

**Definition of Done:**
- 모든 인수 조건 충족
- 60fps 애니메이션 유지
- 테마 전환 시 깜빡임 없음

### 7.3 Sprint 3: 데이터 관리 기능 (5포인트)

**목표:** 데이터 백업 및 복원

**포함 스토리:**
- Story 3.1: 데이터 내보내기 (2포인트)
- Story 3.2: 데이터 가져오기 (3포인트)
- Story 2.3: 애니메이션 (나머지 2포인트)

**Definition of Done:**
- 모든 인수 조건 충족
- 스키마 검증 완료
- 병합 전략 테스트 통과
- 대용량 데이터(1000개) 처리 테스트 통과

---

## 8. 인수 조건 체크리스트

### 8.1 기능적 인수 조건

- [ ] AC-001: 할 일 추가 (Story 1.1)
- [ ] AC-002: 할 일 완료 (Story 1.2)
- [ ] AC-003: 할 일 삭제 (Story 1.3)
- [ ] AC-004: 할 일 편집 (Story 1.3의 일부로 구현 가능)
- [ ] AC-005: 데이터 영속화 (Story 1.5)

### 8.2 비기능적 인수 조건

- [ ] AC-006: 성능 (Story 2.2)
  - FCP < 1.5초
  - LCP < 2.5초
  - TTI < 3.5초
- [ ] AC-007: 반응형 (Story 2.2)
  - 모바일 (375px)
  - 태블릿 (768px)
  - 데스크톱 (1024px)
- [ ] AC-008: 접근성 (Story 2.2)
  - 키보드 네비게이션
  - 포커스 표시
  - 스크린 리더 지원

### 8.3 UI/UX 인수 조건

- [ ] AC-009: 애니메이션 (Story 2.3)
  - 슬라이드인 (추가)
  - 페이드아웃 (삭제)
  - 상태 변경 (완료)
  - 60fps 유지
- [ ] AC-010: 다크 모드 (Story 2.1)
  - 라이트/다크 테마 전환
  - 시스템 테마 동기화
  - 가독성 확보

---

## 9. 리스크 및 의존성

### 9.1 기술적 리스크

| 리스크 | 영향 스토리 | 완화 계획 |
|--------|------------|-----------|
| localStorage 용량 제한 | Story 1.5 | 1000개 제한 구현, quota 초과 알림 |
| 애니메이션 성능 저하 | Story 2.3 | GPU 가속, prefers-reduced-motion 지원 |
| 브라우저 호환성 | Story 2.2 | Browserslist 명시, Polyfill 검토 |

### 9.2 스토리 간 의존성

```
Story 1.5 (데이터 영속화)
    ├── 의존: Story 1.1, 1.2, 1.3
    └── 이유: 데이터 구조가 먼저 정의되어야 함

Story 1.4 (필터링)
    ├── 의존: Story 1.2 (완료 상태)
    └── 이유: 완료/미완료 상태 구분 필요

Story 2.2 (반응형 레이아웃)
    ├── 선행: Story 1.1 (기본 UI)
    └── 이유: UI 구조가 먼저 정의되어야 함

Story 3.1, 3.2 (내보내기/가져오기)
    ├── 의존: Story 1.5 (데이터 영속화)
    └── 이유: 데이터 스키마가 확정되어야 함
```

---

## 10. 성공 지표

### 10.1 스프린트 성공 기준

**Sprint 1 (MVP):**
- 모든 P0 스토리 완료
- E2E 테스트 커버리지 80%+
- Lighthouse 성능 점수 90+
- 사용자가 할 일 추가/완료/삭제 가능

**Sprint 2 (UX 개선):**
- 모든 P1 스토리 완료
- 다크 모드 정상 작동
- 60fps 애니메이션 유지
- 필터링 기능 정상 작동

**Sprint 3 (데이터 관리):**
- 내보내기/가져오기 기능 완료
- 대용량 데이터(1000개) 처리
- 스키마 검증 완료

### 10.2 제품 출시 기준

**MVP (1단계):**
- [ ] Story 1.1, 1.2, 1.3, 1.5 완료
- [ ] Story 2.2 (기본 반응형) 완료
- [ ] E2E 테스트 커버리지 80%+
- [ ] Lighthouse 성능 점수 90+
- [ ] WCAG 2.1 Level AA 준수

**1단계 완료 (Sprint 1-2):**
- [ ] 모든 Epic 1, Epic 2 스토리 완료
- [ ] Story 3.1, 3.2 완료
- [ ] 사용자 피드백 수집
- [ ] 버그 수정 및 안정화

---

## 11. 비기능적 요구사항 매핑

### 11.1 성능 요구사항

| 요구사항 | 관련 스토리 | 인수 조건 |
|---------|-----------|----------|
| FCP < 1.5초 | Story 2.2 | AC-006 |
| 인터랙션 반응성 100ms | Story 2.3 | 60fps 유지 |
| TTI < 3.5초 | Story 2.2 | AC-006 |
| 대용량 데이터 500ms | Story 1.5, 3.2 | 1000개 처리 테스트 |

### 11.2 접근성 요구사항

| 요구사항 | 관련 스토리 | 인수 조건 |
|---------|-----------|----------|
| 키보드 접근성 | Story 2.2 | AC-008 |
| 포커스 관리 | Story 2.2 | AC-008 |
| 스크린 리더 지원 | Story 2.2 | AC-008 |
| WCAG 2.1 Level AA | 전체 | 모든 AC |

### 11.3 보안 요구사항

| 요구사항 | 관련 스토리 | 구현 방법 |
|---------|-----------|----------|
| XSS 방지 | Story 1.1, 3.2 | React 자동 이스케이프 |
| 데이터 검증 | Story 3.2 | Zod 스키마 검증 |
| CSP 헤더 | 전체 | Next.js 설정 |

---

## 12. 다음 단계

### 12.1 스토리 구체화

각 스토리에 대해 다음 작업 수행:
1. 상세 기술 설계 작성
2. 컴포넌트 구조 정의
3. Zustand store 인터페이스 설계
4. 테스트 시나리오 작성

### 12.2 개발 계획

1. **Sprint 1 시작:** Story 1.1 → 1.5 순서로 구현
2. **테스트 주도 개발:** 각 스토리에 대해 TDD 적용
3. **코드 리뷰:** PR마다 INVEST 원칙 준수 확인
4. **사용자 테스트:** MVP 완료 후 페르소나별 테스트

### 12.3 문서 업데이트

본 사용자 스토리 문서는 다음 경우에 업데이트됩니다:
- 새로운 Epic이 추가될 때
- 스토리 우선순위가 변경될 때
- 인수 조건이 수정될 때
- 스프린트 완료 후 학습 내용 반영

---

## 문서 종결

본 사용자 스토리 문서는 Todo App의 기능적 요구사항을 INVEST 원칙에 따라 정의합니다. 각 스토리는 독립적으로 개발 가능하며, 명확한 인수 조건과 추정치를 제공합니다.

**연관 문서:**
- 제품 비전: `.moai/docs/PRODUCT_VISION.md`
- 요구사항 명세: `.moai/docs/REQUIREMENTS.md`

**다음 단계:**
1. 각 스토리에 대한 상세 기술 설계
2. 컴포넌트 구조 및 Zustand store 설계
3. TDD 기반 구현 시작

---

**버전 관리:**

| 버전 | 날짜 | 변경 사항 | 작성자 |
|-----|------|---------|-------|
| 0.1.0 | 2026-01-18 | 초안 작성 | AI Assistant |
