# Todo App 요구사항 명세서

**버전:** 0.1.0
**작성일:** 2026-01-16
**프로젝트:** Todo App
**기술 스택:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, Zustand

---

## 1. 개요 (Overview)

본 문서는 Todo App의 기능적, 비기능적 요구사항을 EARS (Event-Condition-Action-Response) 형식으로 정의합니다.

### 1.1 요구사항 ID 체계

- **REQ-FUNC-XXX**: 기능적 요구사항 (Functional Requirements)
- **REQ-NFR-XXX**: 비기능적 요구사항 (Non-Functional Requirements)
- **REQ-UI-XXX**: UI/UX 요구사항
- **REQ-DATA-XXX**: 데이터 요구사항

### 1.2 우선순위 정의

- **P0 (Must Have)**: MVP 필수 기능
- **P1 (Should Have)**: 1단계 완료 전 포함
- **P2 (Nice to Have)**: 2단계 이후 고려

---

## 2. 기능적 요구사항 (Functional Requirements)

### 2.1 할 일 추가 (Create)

#### REQ-FUNC-001: 기본 할 일 생성
**[EARS]** WHEN 사용자가 제목 입력창에 텍스트를 입력하고 추가 버튼을 클릭하면, THE SYSTEM SHALL 유효성 검증 후 새로운 할 일을 목록 최상단에 추가하고, 입력창을 초기화하여야 한다.

**ID**: REQ-FUNC-001
**우선순위**: P0
**인수조건**: AC-001

**상세 사항:**
- 할 일 ID: UUID (v4)
- 제목: 최대 200자
- 기본 상태: 미완료 (completed: false)
- 생성 시간: ISO 8601 형식

#### REQ-FUNC-002: 빈 제목 검증
**[EARS]** WHEN 사용자가 빈 제목 또는 공백만으로 할 일 추가를 시도하면, THE SYSTEM SHALL 추가를 거부하고 시각적 피드백을 제공하여야 한다.

**ID**: REQ-FUNC-002
**우선순위**: P0

**상세 사항:**
- 입력창 테두리 빨간색으로 변경 (1초간)
- 에러 메시지 표시 (예: "할 일을 입력해주세요")
- 진동 피드백 (모바일)

#### REQ-FUNC-003: Enter 키 지원
**[EARS]** WHEN 사용자가 제목 입력창에서 Enter 키를 누르면, THE SYSTEM SHALL 추가 버튼 클릭과 동일한 동작을 수행하여야 한다.

**ID**: REQ-FUNC-003
**우선순위**: P1

#### REQ-FUNC-004: 할 일 개수 제한
**[EARS]** WHEN 사용자가 1,000개 이상의 할 일 추가를 시도하면, THE SYSTEM SHALL 추가를 거부하고 경고 메시지를 표시하여야 한다.

**ID**: REQ-FUNC-004
**우선순위**: P2

---

### 2.2 할 일 완료/미완료 토글 (Update)

#### REQ-FUNC-005: 완료 상태 토글
**[EARS]** WHEN 사용자가 할 일 항목의 체크박스를 클릭하면, THE SYSTEM SHALL 해당 항목의 완료 상태를 토글하고 시각적 구분을 적용하여야 한다.

**ID**: REQ-FUNC-005
**우선순위**: P0
**인수조건**: AC-002

**상세 사항:**
- 완료 시: 취소선, 투명도 50%, 체크 아이콘
- 미완료 시: 일반 텍스트, 빈 체크박스
- 완료 시간 기록 (completedAt)

#### REQ-FUNC-006: 완료 시각 기록
**[EARS]** WHEN 사용자가 할 일을 완료 상태로 변경하면, THE SYSTEM SHALL 현재 시간을 completedAt 필드에 기록하여야 한다.

**ID**: REQ-FUNC-006
**우선순위**: P1

#### REQ-FUNC-007: 완료 항목 자동 정렬
**[EARS]** WHEN 사용자가 완료 필터 모드가 아닐 때 할 일을 완료하면, THE SYSTEM SHALL 해당 항목을 목록 하단으로 이동시켜야 한다.

**ID**: REQ-FUNC-007
**우선순위**: P2

---

### 2.3 할 일 삭제 (Delete)

#### REQ-FUNC-008: 단일 삭제
**[EARS]** WHEN 사용자가 할 일 항목의 삭제 버튼을 클릭하면, THE SYSTEM SHALL 해당 항목을 목록에서 제거하고 localStorage에서 삭제하여야 한다.

**ID**: REQ-FUNC-008
**우선순위**: P0
**인수조건**: AC-003

**상세 사항:**
- 삭제 전 확인 다이얼로그 표시 (P2)
- 페이드아웃 애니메이션 (300ms)
- Undo 기능 (5초간, P1)

#### REQ-FUNC-009: 완료된 항목 일괄 삭제
**[EARS]** WHEN 사용자가 "완료된 항목 삭제" 버튼을 클릭하고 완료된 항목이 1개 이상 존재하면, THE SYSTEM SHALL 모든 완료된 항목을 삭제하여야 한다.

**ID**: REQ-FUNC-009
**우선순위**: P1

**상세 사항:**
- 삭제 전 확인: "완료된 N개 항목을 삭제하시겠습니까?"
- 삭제 건수 표시

#### REQ-FUNC-010: 삭제 취소 (Undo)
**[EARS]** WHEN 사용자가 할 일 삭제 후 5초 이내에 Undo 버튼을 클릭하면, THE SYSTEM SHALL 삭제된 항목을 복원하여야 한다.

**ID**: REQ-FUNC-010
**우선순위**: P1

---

### 2.4 할 일 편집 (Update)

#### REQ-FUNC-011: 제목 편집
**[EARS]** WHEN 사용자가 할 일 항목을 더블클릭하거나 편집 버튼을 클릭하면, THE SYSTEM SHALL 해당 항목을 편집 모드로 전환하여야 한다.

**ID**: REQ-FUNC-011
**우선순위**: P1
**인수조건**: AC-004

**상세 사항:**
- 텍스트를 입력창으로 변환
- 자동 포커스
- 커서를 문자열 끝으로 이동

#### REQ-FUNC-012: 편집 완료
**[EARS]** WHEN 사용자가 편집 모드에서 Enter 키를 누르거나 외부를 클릭하면, THE SYSTEM SHALL 변경사항을 저장하고 일반 모드로 복귀하여야 한다.

**ID**: REQ-FUNC-012
**우선순위**: P1

#### REQ-FUNC-013: 편집 취소
**[EARS]** WHEN 사용자가 편집 모드에서 Escape 키를 누르면, THE SYSTEM SHALL 변경사항을 저장하지 않고 일반 모드로 복귀하여야 한다.

**ID**: REQ-FUNC-013
**우선순위**: P1

---

### 2.5 할 일 필터링

#### REQ-FUNC-014: 필터 모드 제공
**[EARS]** WHEN 사용자가 필터 탭을 클릭하면, THE SYSTEM SHALL 해당 필터 모드로 목록을 전환하여야 한다.

**ID**: REQ-FUNC-014
**우선순위**: P1
**인수조건**: AC-005

**필터 모드:**
- 전체 (All): 모든 할 일 표시
- 미완료 (Active): 미완료 할 일만 표시
- 완료 (Completed): 완료된 할 일만 표시

#### REQ-FUNC-015: 필터 적용
**[EARS]** WHEN 필터 모드가 변경되면, THE SYSTEM SHALL 해당 조건에 맞는 항목만 표시하고, 나머지는 숨겨야 한다.

**ID**: REQ-FUNC-015
**우선순위**: P1

#### REQ-FUNC-016: 필터 상태 유지
**[EARS]** WHEN 사용자가 페이지를 새로고침하면, THE SYSTEM SHALL 마지막 선택한 필터 모드를 유지하여야 한다.

**ID**: REQ-FUNC-016
**우선순위**: P1

---

### 2.6 데이터 영속화

#### REQ-FUNC-017: localStorage 저장
**[EARS]** WHEN 할 일이 추가, 수정, 삭제되면, THE SYSTEM SHALL 즉시 localStorage에 변경사항을 저장하여야 한다.

**ID**: REQ-FUNC-017
**우선순위**: P0
**인수조건**: AC-005

**상세 사항:**
- 저장 키: `todo-app-data`
- 형식: JSON 배열
- 인코딩: UTF-8

#### REQ-FUNC-018: 자동 저장
**[EARS]** WHEN 할 일 목록에 변경이 발생하면, THE SYSTEM SHALL 100ms 이내에 localStorage에 저장하여야 한다.

**ID**: REQ-FUNC-018
**우선순위**: P0

#### REQ-FUNC-019: 데이터 로드
**[EARS]** WHEN 앱이 초기화되면, THE SYSTEM SHALL localStorage에서 데이터를 로드하고 목록을 렌더링하여야 한다.

**ID**: REQ-FUNC-019
**우선순위**: P0

#### REQ-FUNC-020: 데이터 내보내기
**[EARS]** WHEN 사용자가 "내보내기" 버튼을 클릭하면, THE SYSTEM SHALL 현재 할 일 목록을 JSON 파일로 다운로드하여야 한다.

**ID**: REQ-FUNC-020
**우선순위**: P1

**상세 사항:**
- 파일명 형식: `todo-app-backup-YYYY-MM-DD.json`
- 형식: JSON
- 인코딩: UTF-8

#### REQ-FUNC-021: 데이터 가져오기
**[EARS]** WHEN 사용자가 JSON 파일을 업로드하면, THE SYSTEM SHALL 스키마 검증 후 기존 데이터와 병합하여야 한다.

**ID**: REQ-FUNC-021
**우선순위**: P1

---

## 3. 비기능적 요구사항 (Non-Functional Requirements)

### 3.1 성능 요구사항

#### REQ-NFR-001: 페이지 로드 시간
**[EARS]** WHEN 사용자가 앱에 접속하면, THE SYSTEM SHALL FCP 1.5초 이내, LCP 2.5초 이내에 첫 콘텐츠를 렌더링하여야 한다.

**ID**: REQ-NFR-001
**우선순위**: P0
**인수조건**: AC-006

#### REQ-NFR-002: 인터랙션 반응성
**[EARS]** WHEN 사용자가 버튼을 클릭하면, THE SYSTEM SHALL 100ms 이내에 시각적 피드백을 제공하여야 한다.

**ID**: REQ-NFR-002
**우선순위**: P0

#### REQ-NFR-003: Time to Interactive
**[EARS]** WHEN 페이지가 로드되면, THE SYSTEM SHALL 3.5초 이내에 상호작용 가능 상태가 되어야 한다.

**ID**: REQ-NFR-003
**우선순위**: P0

#### REQ-NFR-004: 대용량 데이터 처리
**[EARS]** WHEN 사용자가 1,000개의 할 일을 가진 목록을 조회하면, THE SYSTEM SHALL 목록 렌더링을 500ms 이내에 완료하여야 한다.

**ID**: REQ-NFR-004
**우선순위**: P1

---

### 3.2 사용자 경험 요구사항

#### REQ-NFR-005: 반응형 디자인
**[EARS]** WHEN 사용자가 모바일, 태블릿, 데스크톱 중 어떤 기기로 접속하면, THE SYSTEM SHALL 해당 화면 크기에 최적화된 레이아웃을 제공하여야 한다.

**ID**: REQ-NFR-005
**우선순위**: P0
**인수조건**: AC-007

**화면 크기:**
- 모바일: 320px - 767px
- 태블릿: 768px - 1023px
- 데스크톱: 1024px 이상

#### REQ-NFR-006: 터치 타겟 크기
**[EARS]** WHEN 사용자가 모바일 기기를 사용하면, THE SYSTEM SHALL 모든 터치 타겟을 최소 44x44px로 제공하여야 한다.

**ID**: REQ-NFR-006
**우선순위**: P0

#### REQ-NFR-007: 상태 피드백
**[EARS]** WHEN 사용자가 작업을 수행하면, THE SYSTEM SHALL 즉시 시각적 피드백을 제공하여야 한다.

**ID**: REQ-NFR-007
**우선순위**: P0

---

### 3.3 접근성 요구사항

#### REQ-NFR-008: 키보드 접근성
**[EARS]** WHEN 사용자가 키보드만으로 앱을 조작하면, THE SYSTEM SHALL 모든 기능을 사용할 수 있어야 한다.

**ID**: REQ-NFR-008
**우선순위**: P0
**인수조건**: AC-008

**상세 사항:**
- Tab: 포커스 이동
- Enter: 선택/확인
- Escape: 취소
- Space: 체크박스 토글

#### REQ-NFR-009: 포커스 관리
**[EARS]** WHEN 사용자가 키보드로 탐색하면, THE SYSTEM SHALL 현재 포커스 위치를 명확하게 표시하여야 한다.

**ID**: REQ-NFR-009
**우선순위**: P0

#### REQ-NFR-010: 스크린 리더 지원
**[EARS]** WHEN 사용자가 스크린 리더를 사용하면, THE SYSTEM SHALL 모든 UI 요소의 상태를 올바르게 전달하여야 한다.

**ID**: REQ-NFR-010
**우선순위**: P0

#### REQ-NFR-011: WCAG 준수
**[EARS]** WHEN 접근성을 평가하면, THE SYSTEM SHALL WCAG 2.1 Level AA 기준을 준수하여야 한다.

**ID**: REQ-NFR-011
**우선순위**: P1

---

### 3.4 기술적 요구사항

#### REQ-NFR-012: TypeScript 타입 안정성
**[EARS]** WHEN 코드를 작성하면, THE SYSTEM SHALL TypeScript strict mode를 준수하여야 한다.

**ID**: REQ-NFR-012
**우선순위**: P0

#### REQ-NFR-013: 테스트 커버리지
**[EARS]** WHEN 테스트를 작성하면, THE SYSTEM SHALL 최소 85% 이상의 코드 커버리지를 달성하여야 한다.

**ID**: REQ-NFR-013
**우선순위**: P1

#### REQ-NFR-014: 브라우저 호환성
**[EARS]** WHEN 사용자가 최신 브라우저로 접속하면, THE SYSTEM SHALL 기능이 정상 작동하여야 한다.

**ID**: REQ-NFR-014
**우선순위**: P0

**지원 브라우저:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

### 3.5 보안 요구사항

#### REQ-NFR-015: XSS 방지
**[EARS]** WHEN 사용자가 입력한 데이터를 렌더링하면, THE SYSTEM SHALL XSS 공격을 방지하기 위해 이스케이프 처리하여야 한다.

**ID**: REQ-NFR-015
**우선순위**: P0

#### REQ-NFR-016: 데이터 검증
**[EARS]** WHEN 사용자 입력을 처리하면, THE SYSTEM SHALL 모든 입력을 클라이언트와 서버에서 검증하여야 한다.

**ID**: REQ-NFR-016
**우선순위**: P0

#### REQ-NFR-017: CSP 헤더
**[EARS]** WHEN 앱을 배포하면, THE SYSTEM SHALL Content-Security-Policy 헤더를 설정하여야 한다.

**ID**: REQ-NFR-017
**우선순위**: P1

---

## 4. UI/UX 요구사항

### 4.1 디자인 원칙

#### REQ-UI-001: 미니멀 디자인
**[EARS]** WHEN 사용자가 앱을 열면, THE SYSTEM SHALL 불필요한 요소를 제거한 미니멀한 인터페이스를 제공하여야 한다.

**ID**: REQ-UI-001
**우선순위**: P0

#### REQ-UI-002: shadcn/ui 일관성
**[EARS]** WHEN UI 컴포넌트를 사용하면, THE SYSTEM SHALL shadcn/ui 디자인 시스템을 따라야 한다.

**ID**: REQ-UI-002
**우선순위**: P0

#### REQ-UI-003: Tailwind 간격 시스템
**[EARS]** WHEN 간격을 설정하면, THE SYSTEM SHALL Tailwind의 간격 시스템 (4px 기반)을 따라야 한다.

**ID**: REQ-UI-003
**우선순위**: P0

---

### 4.2 레이아웃

#### REQ-UI-004: 중앙 정렬 컨테이너
**[EARS]** WHEN 사용자가 데스크톱으로 접속하면, THE SYSTEM SHALL 최대 너비 600px의 중앙 정렬 컨테이너를 표시하여야 한다.

**ID**: REQ-UI-004
**우선순위**: P0

#### REQ-UI-005: 입력 영역
**[EARS]** WHEN 입력 영역을 표시하면, THE SYSTEM SHALL 입력창과 추가 버튼을 수평으로 배치하여야 한다.

**ID**: REQ-UI-005
**우선순위**: P0

#### REQ-UI-006: 스크롤 가능 목록
**[EARS]** WHEN 할 일 목록이 화면을 초과하면, THE SYSTEM SHALL 수직 스크롤을 제공하여야 한다.

**ID**: REQ-UI-006
**우선순위**: P0

#### REQ-UI-007: 필터 탭
**[EARS]** WHEN 필터 탭을 표시하면, THE SYSTEM SHALL 목록 상단에 수평 탭을 배치하여야 한다.

**ID**: REQ-UI-007
**우선순위**: P1

---

### 4.3 애니메이션

#### REQ-UI-008: 슬라이드인 애니메이션
**[EARS]** WHEN 새로운 할 일이 추가되면, THE SYSTEM SHALL 상단에서 슬라이드인되는 애니메이션을 적용하여야 한다.

**ID**: REQ-UI-008
**우선순위**: P1
**인수조건**: AC-009

#### REQ-UI-009: 페이드아웃 애니메이션
**[EARS]** WHEN 할 일이 삭제되면, THE SYSTEM SHALL 페이드아웃 애니메이션을 적용하여야 한다.

**ID**: REQ-UI-009
**우선순위**: P1

#### REQ-UI-010: 상태 변경 애니메이션
**[EARS]** WHEN 할 일 상태가 변경되면, THE SYSTEM SHALL 부드러운 전환 애니메이션을 적용하여야 한다.

**ID**: REQ-UI-010
**우선순위**: P1

#### REQ-UI-011: 60fps 유지
**[EARS]** WHEN 애니메이션을 재생하면, THE SYSTEM SHALL 최소 60fps를 유지하여야 한다.

**ID**: REQ-UI-011
**우선순위**: P1

---

### 4.4 다크 모드

#### REQ-UI-012: 다크 모드 지원
**[EARS]** WHEN 사용자가 다크 모드를 활성화하면, THE SYSTEM SHALL 어두운 색상 테마를 적용하여야 한다.

**ID**: REQ-UI-012
**우선순위**: P1
**인수조건**: AC-010

#### REQ-UI-013: 자동 테마 전환
**[EARS]** WHEN 사용자의 시스템 테마가 변경되면, THE SYSTEM SHALL 자동으로 앱 테마를 전환하여야 한다.

**ID**: REQ-UI-013
**우선순위**: P1

#### REQ-UI-014: 수동 테마 전환 버튼
**[EARS]** WHEN 사용자가 테마 전환 버튼을 클릭하면, THE SYSTEM SHALL 수동으로 테마를 전환하여야 한다.

**ID**: REQ-UI-014
**우선순위**: P1

---

### 4.5 상태 표시

#### REQ-UI-015: 빈 상태
**[EARS]** WHEN 할 일 목록이 비어 있으면, THE SYSTEM SHALL 빈 상태 메시지와 일러스트레이션을 표시하여야 한다.

**ID**: REQ-UI-015
**우선순위**: P1

#### REQ-UI-016: 필터 결과 없음
**[EARS]** WHEN 필터링 결과가 없으면, THE SYSTEM SHALL "표시할 할 일이 없습니다" 메시지를 표시하여야 한다.

**ID**: REQ-UI-016
**우선순위**: P1

#### REQ-UI-017: 할 일 개수 표시
**[EARS]** WHEN 할 일 목록을 표시하면, THE SYSTEM SHALL 총 할 일 수와 완료된 수를 표시하여야 한다.

**ID**: REQ-UI-017
**우선순위**: P2

---

## 5. 데이터 요구사항

### 5.1 데이터 구조

#### REQ-DATA-001: Todo 인터페이스
**[EARS]** WHEN 할 일 데이터를 정의하면, THE SYSTEM SHALL 다음 인터페이스를 따라야 한다.

**ID**: REQ-DATA-001
**우선순위**: P0

```typescript
interface Todo {
  id: string;              // UUID v4
  title: string;           // 최대 200자
  completed: boolean;      // 완료 상태
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  completedAt: string | null;  // ISO 8601 또는 null
}
```

#### REQ-DATA-002: Zustand Store 상태
**[EARS]** WHEN 전역 상태를 정의하면, THE SYSTEM SHALL 다음 구조를 따라야 한다.

**ID**: REQ-DATA-002
**우선순위**: P0

```typescript
interface TodoStore {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  theme: 'light' | 'dark';
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, title: string) => void;
  clearCompleted: () => void;
  setFilter: (filter: Filter) => void;
  setTheme: (theme: Theme) => void;
}
```

---

### 5.2 저장 방식

#### REQ-DATA-003: localStorage 키
**[EARS]** WHEN 데이터를 저장하면, THE SYSTEM SHALL `todo-app-data` 키를 사용하여야 한다.

**ID**: REQ-DATA-003
**우선순위**: P0

#### REQ-DATA-004: JSON 직렬화
**[EARS]** WHEN 데이터를 저장하면, THE SYSTEM SHALL JSON 형식으로 직렬화하여야 한다.

**ID**: REQ-DATA-004
**우선순위**: P0

---

### 5.3 데이터 검증

#### REQ-DATA-005: 제목 길이 검증
**[EARS]** WHEN 사용자가 제목을 입력하면, THE SYSTEM SHALL 최대 200자로 제한하여야 한다.

**ID**: REQ-DATA-005
**우선순위**: P0

#### REQ-DATA-006: UUID 검증
**[EARS]** WHEN 할 일 ID를 생성하면, THE SYSTEM SHALL UUID v4 형식을 따라야 한다.

**ID**: REQ-DATA-006
**우선순위**: P0

#### REQ-DATA-007: 날짜 형식 검증
**[EARS]** WHEN 날짜를 저장하면, THE SYSTEM SHALL ISO 8601 형식을 따라야 한다.

**ID**: REQ-DATA-007
**우선순위**: P0

---

### 5.4 내보내기/가져오기

#### REQ-DATA-008: 내보내기 파일 형식
**[EARS]** WHEN 사용자가 데이터를 내보내면, THE SYSTEM SHALL JSON 파일 형식으로 제공하여야 한다.

**ID**: REQ-DATA-008
**우선순위**: P1

#### REQ-DATA-009: 파일명 형식
**[EARS]** WHEN 내보내기 파일을 생성하면, THE SYSTEM SHALL `todo-app-backup-YYYY-MM-DD.json` 형식을 사용하여야 한다.

**ID**: REQ-DATA-009
**우선순위**: P1

#### REQ-DATA-010: 스키마 검증
**[EARS]** WHEN 사용자가 파일을 가져오면, THE SYSTEM SHALL 파일 스키마를 검증하여야 한다.

**ID**: REQ-DATA-010
**우선순위**: P1

#### REQ-DATA-011: 병합 전략
**[EARS]** WHEN 가져오기 데이터가 기존 데이터와 충돌하면, THE SYSTEM SHALL ID 기반 병합을 수행하여야 한다.

**ID**: REQ-DATA-011
**우선순위**: P1

---

## 6. 인수 조건 (Acceptance Criteria)

### 6.1 기능적 인수 조건

#### AC-001: 할 일 추가
**Given:** 사용자가 메인 페이지에 접속하고
**When:** 텍스트 입력창에 "우유 사기"를 입력하고 추가 버튼을 클릭하면
**Then:** 새로운 할 일이 목록 최상단에 추가되고 입력창은 초기화된다
**And:** 추가된 할 일은 미완료 상태로 표시된다

#### AC-002: 할 일 완료
**Given:** 목록에 "우유 사기" 할 일이 있고
**When:** 해당 항목의 체크박스를 클릭하면
**Then:** 해당 항목에 취소선이 표시되고 완료 상태로 변경된다
**And:** 완료 시간이 기록된다

#### AC-003: 할 일 삭제
**Given:** 목록에 "우유 사기" 할 일이 있고
**When:** 해당 항목의 삭제 버튼을 클릭하고 확인을 선택하면
**Then:** 해당 항목이 목록에서 제거되고 localStorage에서 삭제된다
**And:** 페이드아웃 애니메이션이 적용된다

#### AC-004: 할 일 편집
**Given:** 목록에 "우유 사기" 할 일이 있고
**When:** 해당 항목을 더블클릭하고 "두유 사기"로 수정한 후 Enter를 누르면
**Then:** 제목이 "두유 사기"로 변경되고 일반 모드로 복귀한다

#### AC-005: 데이터 영속화
**Given:** 사용자가 3개의 할 일을 추가하고
**When:** 페이지를 새로고침하면
**Then:** 3개의 할 일이 그대로 표시된다

---

### 6.2 비기능적 인수 조건

#### AC-006: 성능
**Given:** 사용자가 앱에 접속하고
**When:** 페이지 로딩이 완료되면
**Then:** FCP는 1.5초 이내, LCP는 2.5초 이내여야 한다

#### AC-007: 반응형
**Given:** 사용자가 모바일(375px), 태블릿(768px), 데스크톱(1024px)로 접속하고
**When:** 각 화면 크기에서 앱을 확인하면
**Then:** 해당 화면에 최적화된 레이아웃이 표시된다

#### AC-008: 접근성
**Given:** 사용자가 키보드만으로 앱을 조작하고
**When:** Tab, Enter, Escape 키를 사용하여 모든 기능을 테스트하면
**Then:** 모든 기능이 정상 작동하고 포커스가 명확하게 표시된다

---

### 6.3 UI/UX 인수 조건

#### AC-009: 애니메이션
**Given:** 사용자가 할 일을 추가/삭제/완료하고
**When:** 각 작업을 수행하면
**Then:** 부드러운 애니메이션이 적용되고 60fps가 유지된다

#### AC-010: 다크 모드
**Given:** 사용자가 다크 모드를 활성화하고
**When:** 테마가 전환되면
**Then:** 어두운 색상 테마가 적용되고 모든 요소가 가독성 있게 표시된다

---

## 7. 기술 제약사항 (Constraints)

### 7.1 프레임워크 제약

- **Next.js**: App Router 사용, Server Components 우선
- **TypeScript**: strict mode 준수
- **React**: 19 버전 기능 활용

### 7.2 라이브러리 제약

- **상태 관리**: Zustand (Redux X)
- **UI 컴포넌트**: shadcn/ui (Material-UI X)
- **스타일링**: Tailwind CSS v4 (styled-components X)

### 7.3 개발 도구 제약

- **테스트**: Vitest (Jest X)
- **린터**: ESLint 9
- **포매터**: Prettier

---

## 8. 위험 및 완화 계획

### 8.1 기술적 위험

| 위험 | 확률 | 영향 | 완화 계획 |
|------|------|------|-----------|
| localStorage 용량 제한 | 중 | 중 | quota 초과 알림 구현 |
| 브라우저 호환성 이슈 | 낮 | 중 | Browserslist 명시, Polyfill 추가 |

### 8.2 사용자 경험 위험

| 위험 | 확률 | 영향 | 완화 계획 |
|------|------|------|-----------|
| 데이터 손실 | 낮 | 높 | 내보내기/가져오기 기능 제공 |
| 잘못된 삭제 | 중 | 중 | 삭제 확인 다이얼로그, Undo 기능 |

---

## 문서 종결

본 요구사항 명세서는 Todo App의 기능적, 비기능적 요구사항을 EARS 형식으로 정의합니다. 이 문서는 개발, 테스트, QA 과정에서 참고 자료로 활용됩니다.

**다음 단계:**
1. 사용자 스토리 작성 (INVEST 원칙)
2. MVP 마일스톤 및 DoD 정의
3. TDD 기반 개발 시작

---

**버전 관리:**

| 버전 | 날짜 | 변경 사항 | 작성자 |
|-----|------|---------|-------|
| 0.1.0 | 2026-01-16 | 초안 작성 | AI Assistant |
