# SPEC-CHECKLIST-001: 인수 기준 (Acceptance Criteria)

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-CHECKLIST-001 |
| **버전** | 1.0 |
| **생성일** | 2026-03-16 |
| **상태** | Planned |

---

## 인수 테스트 개요

본 문서는 SPEC-CHECKLIST-001 (Todo Checklist Rich Text Editor)의 수용 테스트 시나리오를 Gherkin (Given-When-Then) 형식으로 정의한다.

### 테스트 범위

| 카테고리 | 시나리오 수 | 우선순위 |
|----------|-------------|----------|
| 에디터 렌더링 | 5 | High |
| 슬래시 명령어 | 8 | High |
| 체크리스트 기능 | 6 | High |
| 데이터 저장 | 4 | High |
| 호환성 | 3 | Medium |
| 접근성 | 4 | Medium |
| 성능 | 3 | Medium |

---

## Feature 1: Rich Text Editor 렌더링

### Scenario 1.1: 에디터 초기 로딩

```gherkin
Feature: Rich Text Editor 렌더링

  Scenario: 사용자가 Todo 상세를 열면 Tiptap 에디터가 표시된다
    Given 사용자가 로그인되어 있다
    And 사용자에게 "프로젝트 계획" 제목의 Todo가 있다
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then "상세 내용" 레이블이 표시된다
    And Tiptap 에디터가 렌더링된다
    And 플레이스홀더 "상세 내용을 입력하세요..."가 표시된다
    And 에디터가 포커스 가능하다
```

**검증 포인트:**
- [ ] 에디터 DOM 요소 존재 (`[data-testid="rich-text-editor"]`)
- [ ] 플레이스홀더 텍스트 표시
- [ ] `contenteditable="true"` 속성 확인
- [ ] 로딩 시간 < 100ms

---

### Scenario 1.2: 기존 description 데이터 표시

```gherkin
  Scenario: 기존 일반 텍스트 description이 있으면 paragraph로 표시된다
    Given 사용자가 로그인되어 있다
    And 사용자에게 다음 Todo가 있다:
      | title       | description        | content |
      | 기존 할일   | 이전에 작성한 내용 | null    |
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then "이전에 작성한 내용" 텍스트가 paragraph 블록으로 표시된다
    And description 필드는 content 필드가 없을 때만 표시된다
```

**검증 포인트:**
- [ ] description 텍스트가 에디터에 표시됨
- [ ] `<p>` 태그로 래핑됨
- [ ] `content` 필드 우선 표시

---

### Scenario 1.3: 다크 모드 지원

```gherkin
  Scenario: 다크 모드에서 에디터가 올바르게 표시된다
    Given 사용자가 로그인되어 있다
    And 시스템 테마가 "dark"로 설정되어 있다
    And 사용자에게 "테스트 Todo"가 있다
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then 에디터 배경색이 어둡다
    And 텍스트 색상이 밝다
    And 플레이스홀더 색상이 테마에 맞게 조정된다
```

**검증 포인트:**
- [ ] `.dark` 클래스 적용 시 스타일 변경
- [ ] Tailwind `dark:` variant 사용
- [ ] 테마 전환 시 즉시 반영

---

### Scenario 1.4: 빈 콘텐츠 저장

```gherkin
  Scenario: 빈 에디터 내용을 저장하면 content는 null로 저장된다
    Given 사용자가 로그인되어 있다
    And 사용자가 "새 할일"을 생성했다
    When 사용자가 상세 다이얼로그를 연다
    And 아무것도 입력하지 않는다
    And "저장" 버튼을 클릭한다
    Then Todo가 저장된다
    And Firestore에 content 필드가 null로 저장된다
```

**검증 포인트:**
- [ ] 빈 콘텐츠 저장 시 `content: null`
- [ ] 에러 없이 저장 완료

---

### Scenario 1.5: 읽기 전용 모드

```gherkin
  Scenario: Viewer 역할의 사용자는 에디터를 읽기 전용으로 본다
    Given 팀 "개발팀"이 있다
    And 사용자가 팀 멤버이며 "Viewer" 역할을 가진다
    And 팀에 "팀 할일" Todo가 있다
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then 에디터가 읽기 전용으로 표시된다
    And contenteditable 속성이 false다
    And 슬래시 명령어가 비활성화된다
```

**검증 포인트:**
- [ ] `editable={false}` prop 전달
- [ ] 커서가 텍스트 선택 커서로 변경
- [ ] `/` 키 입력 시 메뉴 미표시

---

## Feature 2: Slash Commands

### Scenario 2.1: 슬래시 메뉴 열기

```gherkin
Feature: Slash Commands

  Scenario: 사용자가 / 키를 입력하면 명령 메뉴가 표시된다
    Given 사용자가 로그인되어 있다
    And 사용자가 "테스트 Todo" 상세 다이얼로그를 열어놨다
    And 에디터가 포커스되어 있다
    When 사용자가 "/" 키를 입력한다
    Then 슬래시 명령 메뉴가 표시된다
    And 메뉴가 커서 위치 근처에 나타난다
    And 다음 블록 타입이 표시된다:
      | Task List       |
      | Bullet List     |
      | Ordered List    |
      | Heading 1       |
      | Heading 2       |
      | Horizontal Rule |
```

**검증 포인트:**
- [ ] 메뉴 DOM 요소 존재 (`[data-testid="slash-menu"]`)
- [ ] 6개 블록 타입 표시
- [ ] 메뉴 위치가 에디터 내부

---

### Scenario 2.2: 키보드 네비게이션

```gherkin
  Scenario: 사용자가 방향키로 메뉴 항목을 탐색한다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "ArrowDown" 키를 누른다
    Then 다음 항목이 하이라이트된다
    When 사용자가 "ArrowUp" 키를 누른다
    Then 이전 항목이 하이라이트된다
    And 첫 번째 항목에서 ArrowUp 시 마지막 항목으로 이동한다
    And 마지막 항목에서 ArrowDown 시 첫 번째 항목으로 이동한다
```

**검증 포인트:**
- [ ] `ArrowUp`, `ArrowDown` 키 이벤트 처리
- [ ] Circular navigation 지원
- [ ] 하이라이트 스타일 적용

---

### Scenario 2.3: 블록 삽입 - Task List

```gherkin
  Scenario: 사용자가 Task List 블록을 삽입한다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "Task List" 항목을 선택한다
    Then 체크리스트 블록이 에디터에 삽입된다
    And 첫 번째 체크박스가 포커스된다
    And "/" 문자는 제거된다
    And 메뉴가 닫힌다
```

**검증 포인트:**
- [ ] `<ul data-type="taskList">` 요소 생성
- [ ] `<li data-type="taskItem">` 요소 생성
- [ ] `data-checked="false"` 속성 확인

---

### Scenario 2.4: 블록 삽입 - Bullet List

```gherkin
  Scenario: 사용자가 Bullet List 블록을 삽입한다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "Bullet List" 항목을 선택한다
    Then 글머리 기호 목록이 삽입된다
    And 첫 번째 리스트 아이템이 포커스된다
```

**검증 포인트:**
- [ ] `<ul>` 요소 생성
- [ ] 글머리 기호 스타일 적용

---

### Scenario 2.5: 블록 삽입 - Ordered List

```gherkin
  Scenario: 사용자가 Ordered List 블록을 삽입한다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "Ordered List" 항목을 선택한다
    Then 번호 매기기 목록이 삽입된다
    And 첫 번째 아이템에 "1." 번호가 표시된다
```

**검증 포인트:**
- [ ] `<ol>` 요소 생성
- [ ] 자동 번호 매기기

---

### Scenario 2.6: 블록 삽입 - Heading

```gherkin
  Scenario: 사용자가 Heading 블록을 삽입한다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "Heading 1" 항목을 선택한다
    Then H1 블록이 삽입된다
    And 큰 폰트 크기로 표시된다
    When 사용자가 "Heading 2" 항목을 선택한다
    Then H2 블록이 삽입된다
    And 중간 폰트 크기로 표시된다
```

**검증 포인트:**
- [ ] `<h1>`, `<h2>` 요소 생성
- [ ] 폰트 크기 차이 확인

---

### Scenario 2.7: 메뉴 닫기

```gherkin
  Scenario: 사용자가 ESC 키로 메뉴를 닫는다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "Escape" 키를 누른다
    Then 메뉴가 닫힌다
    And "/" 문자는 그대로 유지된다
    And 에디터 포커스가 유지된다
```

**검증 포인트:**
- [ ] `Escape` 키 이벤트 처리
- [ ] 메뉴 DOM 제거
- [ ] `/` 텍스트 유지

---

### Scenario 2.8: 메뉴 필터링

```gherkin
  Scenario: 사용자가 입력한 텍스트로 메뉴를 필터링한다
    Given 사용자가 로그인되어 있다
    And 슬래시 명령 메뉴가 열려있다
    When 사용자가 "ta"를 추가로 입력한다 ("/ta")
    Then "Task List" 항목만 표시된다
    When 사용자가 "bul"를 추가로 입력한다 ("/bul")
    Then "Bullet List" 항목만 표시된다
```

**검증 포인트:**
- [ ] 필터링 로직 정상 동작
- [ ] 일치하는 항목만 표시
- [ ] 대소문자 구분 없음

---

## Feature 3: Checklist Functionality

### Scenario 3.1: 체크박스 토글

```gherkin
Feature: Checklist Functionality

  Scenario: 사용자가 체크박스를 클릭하면 상태가 토글된다
    Given 사용자가 로그인되어 있다
    And Todo "체크리스트 테스트"에 다음 content가 있다:
      """
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="false">항목 1</li>
      </ul>
      """
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    And 첫 번째 체크박스를 클릭한다
    Then 체크박스가 체크 상태로 변경된다
    And data-checked 속성이 "true"로 변경된다
    And 텍스트에 취소선이 적용된다
```

**검증 포인트:**
- [ ] `data-checked="true"` 속성 변경
- [ ] `line-through` 스타일 적용
- [ ] 클릭 이벤트 정상 처리

---

### Scenario 3.2: 체크 해제

```gherkin
  Scenario: 사용자가 체크된 항목을 다시 클릭하면 체크가 해제된다
    Given 사용자가 로그인되어 있다
    And Todo에 체크된 항목이 있다
    When 사용자가 체크된 체크박스를 클릭한다
    Then 체크박스가 언체크 상태로 변경된다
    And 취소선이 제거된다
```

**검증 포인트:**
- [ ] 토글 동작 정상
- [ ] 스타일 복원

---

### Scenario 3.3: 여러 체크리스트 항목

```gherkin
  Scenario: 사용자가 여러 체크리스트 항목을 개별적으로 토글한다
    Given 사용자가 로그인되어 있다
    And Todo에 다음 3개의 체크리스트 항목이 있다:
      | 항목    | 체크 상태 |
      | 항목 1  | false     |
      | 항목 2  | false     |
      | 항목 3  | false     |
    When 사용자가 "항목 2"를 체크한다
    Then "항목 2"만 체크 상태가 된다
    And "항목 1", "항목 3"은 그대로 유지된다
```

**검증 포인트:**
- [ ] 개별 항목 토글
- [ ] 다른 항목 영향 없음

---

### Scenario 3.4: 체크 상태 저장

```gherkin
  Scenario: 체크 상태가 Firestore에 저장된다
    Given 사용자가 로그인되어 있다
    And Todo "저장 테스트"가 있다
    When 사용자가 해당 Todo를 열어 체크리스트 항목을 추가한다
    And 첫 번째 항목을 체크한다
    And "저장" 버튼을 클릭한다
    Then Firestore에 content가 저장된다
    And content에 "checked": true가 포함된다
```

**검증 포인트:**
- [ ] Firestore 문서 업데이트
- [ ] JSONContent 형식 유지

---

### Scenario 3.5: 체크 상태 복원

```gherkin
  Scenario: 페이지 새로고침 후 체크 상태가 복원된다
    Given 사용자가 로그인되어 있다
    And Todo에 체크된 항목이 저장되어 있다
    When 사용자가 페이지를 새로고침한다
    And 해당 Todo의 상세 다이얼로그를 연다
    Then 이전 체크 상태가 그대로 표시된다
    And 취소선 스타일이 유지된다
```

**검증 포인트:**
- [ ] Firestore에서 content 로드
- [ ] 체크 상태 렌더링

---

### Scenario 3.6: 새 체크리스트 항목 추가

```gherkin
  Scenario: 사용자가 Enter 키로 새 체크리스트 항목을 추가한다
    Given 사용자가 로그인되어 있다
    And Todo에 체크리스트가 있다
    And 마지막 항목에 포커스가 있다
    When 사용자가 "Enter" 키를 누른다
    Then 새로운 빈 체크리스트 항목이 추가된다
    And 새 항목에 포커스가 이동한다
```

**검증 포인트:**
- [ ] Enter 키 이벤트 처리
- [ ] 새 taskItem 생성

---

## Feature 4: Data Persistence

### Scenario 4.1: JSON 형식 저장

```gherkin
Feature: Data Persistence

  Scenario: 에디터 콘텐츠가 JSON 형식으로 Firestore에 저장된다
    Given 사용자가 로그인되어 있다
    And Todo "JSON 저장 테스트"가 있다
    When 사용자가 해당 Todo를 열어 다음 내용을 입력한다:
      | 블록 타입    | 내용              |
      | Paragraph   | 첫 번째 문단입니다 |
      | Task List   | 체크리스트 항목    |
      | Heading 1   | 제목입니다        |
    And "저장" 버튼을 클릭한다
    Then Firestore에 content 필드가 저장된다
    And content는 JSONContent 형식이다
    And content.type이 "doc"이다
```

**검증 포인트:**
- [ ] `content` 필드 존재
- [ ] `type: "doc"` 구조
- [ ] `content` 배열 포함

---

### Scenario 4.2: 큰 콘텐츠 저장

```gherkin
  Scenario: 큰 콘텐츠도 정상적으로 저장된다
    Given 사용자가 로그인되어 있다
    And Todo "큰 콘텐츠 테스트"가 있다
    When 사용자가 1000자 이상의 텍스트를 입력한다
    And "저장" 버튼을 클릭한다
    Then 저장이 성공한다
    And 에러 메시지가 표시되지 않는다
```

**검증 포인트:**
- [ ] Firestore 1MB 제한 내 저장
- [ ] 에러 처리

---

### Scenario 4.3: 자동 저장 없음

```gherkin
  Scenario: 사용자가 저장 버튼을 클릭하지 않으면 변경사항이 저장되지 않는다
    Given 사용자가 로그인되어 있다
    And Todo "자동 저장 테스트"가 있다
    When 사용자가 해당 Todo를 열어 텍스트를 입력한다
    And 저장하지 않고 다이얼로그를 닫는다
    Then Firestore에 변경사항이 저장되지 않는다
    And 다시 열면 이전 콘텐츠가 표시된다
```

**검증 포인트:**
- [ ] 명시적 저장만 반영
- [ ] 취소 시 변경사항 폐기

---

### Scenario 4.4: 동시 편집 충돌

```gherkin
  Scenario: 두 사용자가 동시에 편집하면 마지막 저장이 우선한다
    Given 사용자 A와 사용자 B가 같은 팀에 있다
    And 팀 Todo "동시 편집 테스트"가 있다
    When 사용자 A가 Todo를 열어 "A의 내용"을 입력하고 저장한다
    And 동시에 사용자 B가 Todo를 열어 "B의 내용"을 입력하고 저장한다
    Then 마지막 저장한 사용자의 콘텐츠가 유지된다
    And 데이터 손실이 발생하지 않는다
```

**검증 포인트:**
- [ ] Firestore 자동 병합
- [ ] 충돌 시 마지막 쓰기 우선

---

## Feature 5: Backward Compatibility

### Scenario 5.1: 기존 description 표시

```gherkin
Feature: Backward Compatibility

  Scenario: content가 없고 description만 있는 Todo를 정상 표시한다
    Given 사용자가 로그인되어 있다
    And 다음 Todo가 있다:
      | title         | description     | content |
      | 레거시 Todo   | 이전 내용       | null    |
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then "이전 내용"이 paragraph로 표시된다
    And 에디터가 정상 작동한다
```

**검증 포인트:**
- [ ] description → paragraph 변환
- [ ] 에디터 편집 가능

---

### Scenario 5.2: description에서 content로 마이그레이션

```gherkin
  Scenario: 레거시 Todo를 저장하면 content 필드가 생성된다
    Given 사용자가 로그인되어 있다
    And 다음 Todo가 있다:
      | title         | description     | content |
      | 마이그레이션  | 이전 내용       | null    |
    When 사용자가 해당 Todo를 열어 "추가 내용"을 입력한다
    And "저장" 버튼을 클릭한다
    Then content 필드가 Firestore에 저장된다
    And description 필드는 그대로 유지된다
```

**검증 포인트:**
- [ ] content 필드 생성
- [ ] description 필드 보존

---

### Scenario 5.3: 혼합 데이터 처리

```gherkin
  Scenario: content와 description이 모두 있는 경우 content가 우선한다
    Given 사용자가 로그인되어 있다
    And 다음 Todo가 있다:
      | title    | description   | content              |
      | 혼합     | 이전 설명     | {"type":"doc",...}   |
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then content가 표시된다
    And description은 무시된다
```

**검증 포인트:**
- [ ] content 우선 로직
- [ ] description 무시

---

## Feature 6: Accessibility

### Scenario 6.1: 키보드 접근성

```gherkin
Feature: Accessibility

  Scenario: 모든 기능을 키보드로 조작할 수 있다
    Given 사용자가 로그인되어 있다
    And Todo "접근성 테스트"가 있다
    When 사용자가 Tab 키로 에디터에 포커스를 이동한다
    Then 에디터가 포커스된다
    When 사용자가 "/" 키를 입력한다
    Then 슬래시 메뉴가 열린다
    When 사용자가 ArrowDown으로 "Task List"를 선택하고 Enter를 누른다
    Then 체크리스트가 삽입된다
    And 메뉴가 닫힌다
```

**검증 포인트:**
- [ ] Tab 포커스 이동
- [ ] 키보드만으로 전체 플로우 수행 가능

---

### Scenario 6.2: 스크린 리더 지원

```gherkin
  Scenario: 스크린 리더가 에디터 콘텐츠를 읽을 수 있다
    Given 사용자가 스크린 리더를 사용한다
    And Todo "스크린 리더 테스트"가 있다
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then "상세 내용" 레이블이 읽힌다
    And 에디터 영역이 "Rich Text Editor"로 안내된다
    And 체크리스트 항목이 "체크박스, 체크되지 않음, 항목 내용"으로 읽힌다
```

**검증 포인트:**
- [ ] `aria-label` 속성
- [ ] `role="textbox"` 적용
- [ ] 체크박스 `aria-checked`

---

### Scenario 6.3: 색상 대비

```gherkin
  Scenario: 충분한 색상 대비를 제공한다
    Given 사용자가 Todo 상세 다이얼로그를 열어놨다
    When Lighthouse 접근성 감사를 실행한다
    Then "색상 대비" 항목이 통과한다
    And 전경색과 배경색의 대비율이 4.5:1 이상이다
```

**검증 포인트:**
- [ ] WCAG 2.1 AA 준수
- [ ] 다크 모드에서도 대비 유지

---

### Scenario 6.4: 포커스 표시

```gherkin
  Scenario: 포커스된 요소가 명확하게 표시된다
    Given 사용자가 로그인되어 있다
    And Todo 상세 다이얼로그를 열어놨다
    When 사용자가 Tab 키로 에디터에 포커스를 이동한다
    Then 에디터에 명확한 포커스 링이 표시된다
    And 포커스 링 색상이 테마에 맞게 조정된다
```

**검증 포인트:**
- [ ] `focus:ring` 스타일 적용
- [ ] 포커스 표시 명확성

---

## Feature 7: Performance

### Scenario 7.1: 에디터 로딩 성능

```gherkin
Feature: Performance

  Scenario: 에디터가 100ms 이내에 로드된다
    Given 사용자가 로그인되어 있다
    And Todo "성능 테스트"가 있다
    When 사용자가 해당 Todo의 상세 다이얼로그를 연다
    Then 에디터가 100ms 이내에 렌더링된다
    And 사용자가 즉시 입력할 수 있다
```

**검증 포인트:**
- [ ] Performance.mark/measure 사용
- [ ] 로딩 시간 < 100ms

---

### Scenario 7.2: 슬래시 메뉴 응답성

```gherkin
  Scenario: 슬래시 메뉴가 즉시 표시된다
    Given 사용자가 로그인되어 있다
    And Todo 상세 다이얼로그를 열어놨다
    And 에디터가 포커스되어 있다
    When 사용자가 "/" 키를 입력한다
    Then 메뉴가 50ms 이내에 표시된다
```

**검증 포인트:**
- [ ] 이벤트 처리 시간 < 50ms
- [ ] 렌더링 지연 없음

---

### Scenario 7.3: 번들 사이즈

```gherkin
  Scenario: Tiptap 추가로 인한 번들 사이즈 증가가 60KB를 초과하지 않는다
    Given 프로젝트가 빌드되어 있다
    When 번들 사이즈를 분석한다
    Then Tiptap 관련 청크 총 크기가 60KB gzip 이하다
```

**검증 포인트:**
- [ ] `ANALYZE=true npm run build` 실행
- [ ] tiptap 청크 크기 확인

---

## 품질 게이트

### 테스트 커버리지

| 카테고리 | 목표 | 측정 도구 |
|----------|------|----------|
| 단위 테스트 | 85%+ | Vitest |
| 통합 테스트 | 80%+ | Vitest |
| E2E 테스트 | 주요 시나리오 100% | Playwright |

### 자동화된 검증

```bash
# 검증 스크립트
echo "=== SPEC-CHECKLIST-001 검증 시작 ==="

# 1. 타입 검사
echo "1. TypeScript 타입 검사..."
npx tsc --noEmit

# 2. 린트 검사
echo "2. ESLint 검사..."
npm run lint

# 3. 단위 테스트
echo "3. 단위 테스트 실행..."
npm run test:unit -- --coverage

# 4. E2E 테스트
echo "4. E2E 테스트 실행..."
npm run test -- --grep "checklist"

# 5. 번들 사이즈
echo "5. 번들 사이즈 확인..."
ANALYZE=true npm run build

echo "=== SPEC-CHECKLIST-001 검증 완료 ==="
```

---

## Definition of Done (DoD)

SPEC-CHECKLIST-001이 완료로 간시되려면 다음 조건을 모두 충족해야 합니다:

### 기능적 DoD

- [ ] 모든 Feature 1-7 시나리오 통과
- [ ] 슬래시 명령어 6개 블록 타입 지원
- [ ] 체크리스트 토글 기능 정상
- [ ] 다크 모드 지원
- [ ] 기존 데이터 호환성 유지

### 품질 DoD

- [ ] 단위 테스트 커버리지 85%+
- [ ] E2E 테스트 100% 통과
- [ ] TypeScript strict mode 0 errors
- [ ] ESLint 0 warnings, 0 errors
- [ ] Lighthouse 접근성 100/100

### 성능 DoD

- [ ] 에디터 로딩 < 100ms
- [ ] 번들 사이즈 증가 < 60KB gzip
- [ ] 슬래시 메뉴 응답 < 50ms

### 문서 DoD

- [ ] 컴포넌트 JSDoc 작성
- [ ] README 업데이트
- [ ] CHANGELOG 항목 추가

---

## 다음 단계

- **구현 시작**: `/moai:2-run SPEC-CHECKLIST-001`
- **테스트 실행**: `npm run test:unit && npm run test`
- **완료 후**: `/moai:3-sync SPEC-CHECKLIST-001`

---

TAG: SPEC-CHECKLIST-001
