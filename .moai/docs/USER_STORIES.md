# Todo App 사용자 스토리 문서

**버전:** 0.2.0
**작성일:** 2026-01-18
**최종 수정:** 2026-01-28
**프로젝트:** Todo App
**기술 스택:** Next.js 16.1.2, React 19.2.3, TypeScript 5, Tailwind CSS v4, shadcn/ui, Zustand 5.0.10, Firebase 12.8.0, Serwist 9.5.0

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

## 6. Epic 4: 인증 시스템

### Story 4.1: 이메일/비밀번호 로그인

**As:** 사용자 (Student Sarah, Office Worker Olivia)
**I want:** 이메일과 비밀번호로 로그인하고 싶다
**So that:** 내 할 일 데이터를 안전하게 클라우드에 저장하고 어디서든 접근할 수 있다

**Acceptance Criteria:**
- **Given:** 로그인 페이지에 접속하고
- **When:** 유효한 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭하면
- **Then:** Firebase Authentication을 통해 인증이 수행된다
- **And:** 성공 시 메인 페이지로 이동한다
- **And:** 실패 시 에러 메시지가 표시된다

**Edge Cases:**
- 잘못된 이메일 형식 입력 시 유효성 검증 에러
- 비밀번호 6자 미만 입력 시 유효성 검증 에러
- 네트워크 오류 시 재시도 안내

**Story Points:** 5
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-022

---

### Story 4.2: 회원가입

**As:** 새로운 사용자 (Student Sarah)
**I want:** 새로운 계정을 생성하고 싶다
**So that:** 앱을 사용하기 시작할 수 있다

**Acceptance Criteria:**
- **Given:** 회원가입 폼에 접근하고
- **When:** 이메일과 비밀번호를 입력하고 회원가입 버튼을 클릭하면
- **Then:** Firebase에 새로운 계정이 생성된다
- **And:** 자동으로 로그인되어 메인 페이지로 이동한다

**Edge Cases:**
- 이미 존재하는 이메일 사용 시 에러 메시지
- 비밀번호 규칙 미충족 시 안내 메시지

**Story Points:** 3
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-023

---

### Story 4.3: Google OAuth 로그인

**As:** 사용자 (Developer Dan)
**I want:** Google 계정으로 간편하게 로그인하고 싶다
**So that:** 별도의 비밀번호 없이 빠르게 접근할 수 있다

**Acceptance Criteria:**
- **Given:** 로그인 페이지에 접속하고
- **When:** Google 로그인 버튼을 클릭하면
- **Then:** Google OAuth 팝업이 표시된다
- **And:** 인증 완료 시 자동으로 로그인되어 메인 페이지로 이동한다

**Edge Cases:**
- 팝업 차단 시 안내 메시지
- OAuth 취소 시 에러 처리

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-024

---

### Story 4.4: 로그아웃

**As:** 사용자 (Office Worker Olivia)
**I want:** 안전하게 로그아웃하고 싶다
**So that:** 공용 컴퓨터에서 내 계정을 보호할 수 있다

**Acceptance Criteria:**
- **Given:** 로그인 상태이고
- **When:** 로그아웃 버튼을 클릭하면
- **Then:** Firebase 세션이 종료된다
- **And:** 로그인 페이지로 이동한다

**Story Points:** 1
**Priority:** High (P0)
**Related Requirements:** REQ-FUNC-025

---

## 7. Epic 5: 팀 협업

### Story 5.1: 팀 생성

**As:** 사용자 (Office Worker Olivia)
**I want:** 팀 워크스페이스를 생성하고 싶다
**So that:** 팀원들과 할 일을 공유하고 협업할 수 있다

**Acceptance Criteria:**
- **Given:** 인증된 사용자가 팀 생성 화면에 접근하고
- **When:** 팀 이름(최대 100자)을 입력하고 생성 버튼을 클릭하면
- **Then:** 새로운 팀이 Firestore에 생성된다
- **And:** 사용자가 owner 역할로 팀에 추가된다
- **And:** 팀 목록에 새 팀이 표시된다

**Edge Cases:**
- 빈 팀 이름 입력 시 유효성 검증 에러
- 네트워크 오류 시 재시도 안내

**Story Points:** 5
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-026

---

### Story 5.2: 팀 전환

**As:** 사용자 (Developer Dan)
**I want:** 여러 팀 간에 쉽게 전환하고 싶다
**So that:** 다른 프로젝트의 할 일을 관리할 수 있다

**Acceptance Criteria:**
- **Given:** 여러 팀에 소속되어 있고
- **When:** 팀 선택 드롭다운에서 다른 팀을 선택하면
- **Then:** 해당 팀의 할 일 목록이 표시된다
- **And:** 선택한 팀이 현재 활성 팀으로 저장된다

**Story Points:** 2
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-027

---

### Story 5.3: 멤버 초대 (이메일)

**As:** 팀 관리자 (Office Worker Olivia)
**I want:** 이메일로 팀에 멤버를 초대하고 싶다
**So that:** 새로운 팀원을 쉽게 추가할 수 있다

**Acceptance Criteria:**
- **Given:** admin 이상의 역할로 팀에 접근하고
- **When:** 이메일 주소를 입력하고 초대 버튼을 클릭하면
- **Then:** Cloud Function을 통해 초대 이메일이 발송된다
- **And:** 초대 상태가 pending으로 저장된다
- **And:** 7일 후 만료된다

**Edge Cases:**
- 이미 팀에 있는 멤버 초대 시 경고
- 유효하지 않은 이메일 형식 검증

**Story Points:** 5
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-030

---

### Story 5.4: 멤버 초대 (링크)

**As:** 팀 관리자 (Developer Dan)
**I want:** 초대 링크를 생성하고 싶다
**So that:** 여러 사람을 한 번에 초대할 수 있다

**Acceptance Criteria:**
- **Given:** admin 이상의 역할로 팀에 접근하고
- **When:** 초대 링크 생성 버튼을 클릭하면
- **Then:** 고유한 초대 링크가 생성된다
- **And:** 링크를 클립보드에 복사할 수 있다
- **And:** 최대 사용 횟수와 만료일을 설정할 수 있다

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-031

---

### Story 5.5: 초대 수락

**As:** 초대받은 사용자 (Student Sarah)
**I want:** 초대를 수락하고 팀에 참여하고 싶다
**So that:** 팀의 할 일을 함께 관리할 수 있다

**Acceptance Criteria:**
- **Given:** 유효한 초대 링크를 클릭하고
- **When:** 로그인 또는 회원가입을 완료하면
- **Then:** 자동으로 해당 팀에 추가된다
- **And:** 초대 상태가 accepted로 변경된다
- **And:** 팀 목록에 새 팀이 표시된다

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-032

---

### Story 5.6: 역할 관리

**As:** 팀 소유자 (Office Worker Olivia)
**I want:** 팀 멤버의 역할을 관리하고 싶다
**So that:** 적절한 권한을 부여할 수 있다

**Acceptance Criteria:**
- **Given:** owner 또는 admin 역할이고
- **When:** 멤버의 역할 변경을 요청하면
- **Then:** 해당 멤버의 역할이 변경된다
- **And:** 역할: owner, admin, editor, viewer 중 선택 가능

**Edge Cases:**
- owner 역할은 변경 불가
- admin은 editor/viewer만 변경 가능

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-033, REQ-FUNC-034

---

## 8. Epic 6: 고급 기능

### Story 6.1: 우선순위 설정

**As:** 사용자 (Developer Dan)
**I want:** 할 일에 우선순위를 설정하고 싶다
**So that:** 중요한 작업을 쉽게 식별할 수 있다

**Acceptance Criteria:**
- **Given:** 할 일 생성 또는 편집 화면에서
- **When:** 우선순위(high/medium/low)를 선택하면
- **Then:** 해당 우선순위가 저장된다
- **And:** 목록에서 시각적으로 구분된다 (색상/아이콘)

**Story Points:** 2
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-035

---

### Story 6.2: 날짜 범위 설정

**As:** 사용자 (Office Worker Olivia)
**I want:** 할 일에 시작일과 종료일을 설정하고 싶다
**So that:** 일정을 효과적으로 관리할 수 있다

**Acceptance Criteria:**
- **Given:** 할 일 생성 또는 편집 화면에서
- **When:** 시작일과/또는 종료일을 선택하면
- **Then:** 해당 날짜가 저장된다
- **And:** 캘린더 뷰에서 확인할 수 있다

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-036

---

### Story 6.3: 정렬 기능

**As:** 사용자 (Student Sarah)
**I want:** 할 일을 다양한 기준으로 정렬하고 싶다
**So that:** 원하는 순서로 할 일을 확인할 수 있다

**Acceptance Criteria:**
- **Given:** 할 일 목록이 있고
- **When:** 정렬 옵션(생성일/우선순위/시작일/종료일)을 선택하면
- **Then:** 해당 기준과 방향(오름차순/내림차순)으로 목록이 정렬된다

**Story Points:** 2
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-037

---

### Story 6.4: 캘린더 뷰

**As:** 사용자 (Office Worker Olivia)
**I want:** 캘린더 형식으로 할 일을 보고 싶다
**So that:** 날짜별 일정을 한눈에 파악할 수 있다

**Acceptance Criteria:**
- **Given:** 캘린더 뷰 모드를 선택하고
- **When:** 캘린더가 표시되면
- **Then:** 시작일/종료일이 있는 할 일이 날짜에 표시된다
- **And:** 날짜를 클릭하면 해당 날짜의 할 일 목록이 표시된다

**Story Points:** 5
**Priority:** Low (P2)
**Related Requirements:** REQ-FUNC-038

---

### Story 6.5: 프리셋 기능

**As:** 사용자 (Developer Dan)
**I want:** 자주 사용하는 할 일을 템플릿으로 저장하고 싶다
**So that:** 반복적인 할 일을 빠르게 추가할 수 있다

**Acceptance Criteria:**
- **Given:** 할 일 목록에서
- **When:** 프리셋으로 저장 버튼을 클릭하면
- **Then:** 할 일 정보가 템플릿으로 저장된다
- **And:** 프리셋 목록에서 선택하여 새 할 일을 생성할 수 있다

**Story Points:** 3
**Priority:** Low (P2)
**Related Requirements:** REQ-FUNC-039, REQ-FUNC-040, REQ-FUNC-041

---

### Story 6.6: PWA 설치

**As:** 사용자 (Student Sarah)
**I want:** 앱을 홈 화면에 추가하고 싶다
**So that:** 네이티브 앱처럼 빠르게 접근할 수 있다

**Acceptance Criteria:**
- **Given:** PWA 지원 브라우저에서 앱에 접속하고
- **When:** 앱 설치를 요청하면
- **Then:** 앱이 홈 화면에 추가된다
- **And:** 오프라인에서도 기본 기능이 작동한다

**Story Points:** 3
**Priority:** Medium (P1)
**Related Requirements:** REQ-FUNC-044, REQ-FUNC-045

---

## 9. 스토리 포인트 산정 기준

### 9.1 포인트 복잡도 기준

| 포인트 | 복잡도 | 예상 작업 시간 | 특징 |
|--------|--------|---------------|------|
| 1 | 매우 낮음 | 2-4시간 | 단순한 UI 변경, 데이터 표시 |
| 2 | 낮음 | 4-8시간 | 기본 CRUD, 간단한 상태 관리 |
| 3 | 중간 | 1-2일 | localStorage 연동, 애니메이션, 검증 |
| 5 | 높음 | 2-3일 | 반응형 레이아웃, 복잡한 상태 관리 |
| 8 | 매우 높음 | 3-5일 | 여러 기능 통합, 복잡한 비즈니스 로직 |

### 9.2 총 스토리 포인트

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
| Epic 4: 인증 시스템 | Story 4.1: 이메일/비밀번호 로그인 | 5 | P0 |
| | Story 4.2: 회원가입 | 3 | P0 |
| | Story 4.3: Google OAuth 로그인 | 3 | P1 |
| | Story 4.4: 로그아웃 | 1 | P0 |
| **Epic 4 소계** | | **12** | |
| Epic 5: 팀 협업 | Story 5.1: 팀 생성 | 5 | P1 |
| | Story 5.2: 팀 전환 | 2 | P1 |
| | Story 5.3: 멤버 초대 (이메일) | 5 | P1 |
| | Story 5.4: 멤버 초대 (링크) | 3 | P1 |
| | Story 5.5: 초대 수락 | 3 | P1 |
| | Story 5.6: 역할 관리 | 3 | P1 |
| **Epic 5 소계** | | **21** | |
| Epic 6: 고급 기능 | Story 6.1: 우선순위 설정 | 2 | P1 |
| | Story 6.2: 날짜 범위 설정 | 3 | P1 |
| | Story 6.3: 정렬 기능 | 2 | P1 |
| | Story 6.4: 캘린더 뷰 | 5 | P2 |
| | Story 6.5: 프리셋 기능 | 3 | P2 |
| | Story 6.6: PWA 설치 | 3 | P1 |
| **Epic 6 소계** | | **18** | |
| **총계** | | **80** | |

---

## 10. 우선순위별 스프린트 계획

### 10.1 Sprint 1: MVP 핵심 기능 + 인증 (25포인트) - 완료

**목표:** 기본 할 일 관리 + 사용자 인증 기능 구현

**포함 스토리:**
- Story 1.1: 할 일 추가하기 (3포인트) - 완료
- Story 1.2: 할 일 완료하기 (2포인트) - 완료
- Story 1.3: 할 일 삭제하기 (3포인트) - 완료
- Story 1.5: 데이터 영속화 (3포인트) - 완료
- Story 2.2: 반응형 레이아웃 (5포인트) - 완료
- Story 4.1: 이메일/비밀번호 로그인 (5포인트) - 완료
- Story 4.2: 회원가입 (3포인트) - 완료
- Story 4.4: 로그아웃 (1포인트) - 완료

**Definition of Done:**
- 모든 인수 조건 충족
- E2E 테스트 통과 (커버리지 80%+)
- Lighthouse 성능 점수 90+ (P0 항목)
- WCAG 2.1 Level AA 준수 (P0 항목)

### 10.2 Sprint 2: 사용자 경험 + 팀 기반 (35포인트) - 완료

**목표:** 필터링, UI/UX 개선 및 팀 협업 기능

**포함 스토리:**
- Story 1.4: 할 일 필터링하기 (2포인트) - 완료
- Story 2.1: 다크 모드 전환 (3포인트) - 완료
- Story 2.3: 애니메이션 (3포인트) - 완료
- Story 4.3: Google OAuth 로그인 (3포인트) - 완료
- Story 5.1: 팀 생성 (5포인트) - 완료
- Story 5.2: 팀 전환 (2포인트) - 완료
- Story 5.3: 멤버 초대 (이메일) (5포인트) - 완료
- Story 5.4: 멤버 초대 (링크) (3포인트) - 완료
- Story 5.5: 초대 수락 (3포인트) - 완료
- Story 5.6: 역할 관리 (3포인트) - 완료
- Story 6.6: PWA 설치 (3포인트) - 완료

**Definition of Done:**
- 모든 인수 조건 충족
- 60fps 애니메이션 유지
- 테마 전환 시 깜빡임 없음
- 팀 협업 실시간 동기화

### 10.3 Sprint 3: 고급 기능 (20포인트) - 진행 중

**목표:** 고급 할 일 관리 기능

**포함 스토리:**
- Story 3.1: 데이터 내보내기 (2포인트) - 예정
- Story 3.2: 데이터 가져오기 (3포인트) - 예정
- Story 6.1: 우선순위 설정 (2포인트) - 완료
- Story 6.2: 날짜 범위 설정 (3포인트) - 완료
- Story 6.3: 정렬 기능 (2포인트) - 완료
- Story 6.4: 캘린더 뷰 (5포인트) - 완료
- Story 6.5: 프리셋 기능 (3포인트) - 완료

**Definition of Done:**
- 모든 인수 조건 충족
- 스키마 검증 완료
- 병합 전략 테스트 통과
- 대용량 데이터(1000개) 처리 테스트 통과

---

## 11. 인수 조건 체크리스트

### 11.1 기능적 인수 조건

- [ ] AC-001: 할 일 추가 (Story 1.1)
- [ ] AC-002: 할 일 완료 (Story 1.2)
- [ ] AC-003: 할 일 삭제 (Story 1.3)
- [ ] AC-004: 할 일 편집 (Story 1.3의 일부로 구현 가능)
- [ ] AC-005: 데이터 영속화 (Story 1.5)

### 11.2 비기능적 인수 조건

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

### 11.3 UI/UX 인수 조건

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

## 12. 리스크 및 의존성

### 12.1 기술적 리스크

| 리스크 | 영향 스토리 | 완화 계획 |
|--------|------------|-----------|
| localStorage 용량 제한 | Story 1.5 | 1000개 제한 구현, quota 초과 알림 |
| 애니메이션 성능 저하 | Story 2.3 | GPU 가속, prefers-reduced-motion 지원 |
| 브라우저 호환성 | Story 2.2 | Browserslist 명시, Polyfill 검토 |

### 12.2 스토리 간 의존성

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

## 13. 성공 지표

### 13.1 스프린트 성공 기준

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

### 13.2 제품 출시 기준

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

## 14. 비기능적 요구사항 매핑

### 14.1 성능 요구사항

| 요구사항 | 관련 스토리 | 인수 조건 |
|---------|-----------|----------|
| FCP < 1.5초 | Story 2.2 | AC-006 |
| 인터랙션 반응성 100ms | Story 2.3 | 60fps 유지 |
| TTI < 3.5초 | Story 2.2 | AC-006 |
| 대용량 데이터 500ms | Story 1.5, 3.2 | 1000개 처리 테스트 |

### 14.2 접근성 요구사항

| 요구사항 | 관련 스토리 | 인수 조건 |
|---------|-----------|----------|
| 키보드 접근성 | Story 2.2 | AC-008 |
| 포커스 관리 | Story 2.2 | AC-008 |
| 스크린 리더 지원 | Story 2.2 | AC-008 |
| WCAG 2.1 Level AA | 전체 | 모든 AC |

### 14.3 보안 요구사항

| 요구사항 | 관련 스토리 | 구현 방법 |
|---------|-----------|----------|
| XSS 방지 | Story 1.1, 3.2 | React 자동 이스케이프 |
| 데이터 검증 | Story 3.2 | Zod 스키마 검증 |
| CSP 헤더 | 전체 | Next.js 설정 |

---

## 15. 다음 단계

### 15.1 스토리 구체화

각 스토리에 대해 다음 작업 수행:
1. 상세 기술 설계 작성
2. 컴포넌트 구조 정의
3. Zustand store 인터페이스 설계
4. 테스트 시나리오 작성

### 15.2 개발 계획

1. **Sprint 1 시작:** Story 1.1 → 1.5 순서로 구현
2. **테스트 주도 개발:** 각 스토리에 대해 TDD 적용
3. **코드 리뷰:** PR마다 INVEST 원칙 준수 확인
4. **사용자 테스트:** MVP 완료 후 페르소나별 테스트

### 15.3 문서 업데이트

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
| 0.2.0 | 2026-01-28 | Epic 4 (인증), Epic 5 (팀 협업), Epic 6 (고급 기능) 추가. 스프린트 계획 업데이트. | AI Assistant |
