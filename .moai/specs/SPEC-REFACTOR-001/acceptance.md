# SPEC-REFACTOR-001: 인수 조건

## 추적성 태그

```
TAG: SPEC-REFACTOR-001-ACC
PARENT: SPEC-REFACTOR-001
```

---

## 1. 인수 조건 개요

### 1.1 품질 게이트 요약

| 기준 | 목표 | 검증 방법 |
|------|------|-----------|
| 유닛 테스트 커버리지 | 80% 이상 | `npm run test:coverage` |
| ESLint 오류 | 0개 | `npm run lint` |
| ESLint 경고 | 0개 | `npm run lint` |
| E2E 테스트 | 100% 통과 | `npm run test` |
| 빌드 성공 | 오류 없음 | `npm run build` |
| console.log | 0개 | `grep "console.log" src/` |
| 버전 일치 | 0.2.0 | package.json 및 문서 확인 |

---

## 2. 기능별 인수 조건

### 2.1 AC-001: isE2ETestMode 함수 통합

**Given-When-Then 시나리오**:

#### 시나리오 1: URL 파라미터를 통한 E2E 모드 감지

```gherkin
Given 사용자가 URL에 "?e2e=true" 파라미터를 포함하여 앱에 접속했을 때
When isE2ETestMode() 함수가 호출되면
Then true를 반환해야 한다
```

#### 시나리오 2: localStorage를 통한 E2E 모드 감지

```gherkin
Given localStorage에 "e2e-test-mode" 키가 "true" 값으로 설정되어 있을 때
When isE2ETestMode() 함수가 호출되면
Then true를 반환해야 한다
```

#### 시나리오 3: 일반 모드

```gherkin
Given URL 파라미터와 localStorage 모두 E2E 모드 설정이 없을 때
When isE2ETestMode() 함수가 호출되면
Then false를 반환해야 한다
```

#### 시나리오 4: 서버 사이드 렌더링

```gherkin
Given 코드가 서버 사이드에서 실행될 때 (window === undefined)
When isE2ETestMode() 함수가 호출되면
Then false를 반환해야 한다
```

**검증 체크리스트**:

- [ ] `src/lib/utils.ts`에 `isE2ETestMode` 함수가 정의됨
- [ ] 기존 5개 파일에서 로컬 함수 정의가 삭제됨
- [ ] 모든 파일에서 `import { isE2ETestMode } from '@/lib/utils'` 사용
- [ ] 유닛 테스트 4개 시나리오 모두 통과
- [ ] 기존 E2E 테스트 모두 통과

---

### 2.2 AC-002: convertTimestamp 함수 통합

**Given-When-Then 시나리오**:

#### 시나리오 1: null 입력 처리

```gherkin
Given timestamp 값이 null 또는 undefined일 때
When convertTimestamp() 함수가 호출되면
Then null을 반환해야 한다
```

#### 시나리오 2: Date 객체 처리

```gherkin
Given timestamp 값이 JavaScript Date 객체일 때
When convertTimestamp() 함수가 호출되면
Then 동일한 Date 객체를 반환해야 한다
```

#### 시나리오 3: Firebase Timestamp 처리

```gherkin
Given timestamp 값이 Firebase Timestamp 객체일 때
When convertTimestamp() 함수가 호출되면
Then toDate() 메서드를 호출하여 Date 객체를 반환해야 한다
```

**검증 체크리스트**:

- [ ] `src/lib/utils.ts`에 `convertTimestamp` 함수가 정의됨
- [ ] 4개 store 파일에서 로컬 함수 정의가 삭제됨
- [ ] Firebase Timestamp import가 utils.ts에만 존재
- [ ] 유닛 테스트 3개 시나리오 모두 통과
- [ ] 할 일 생성/수정 시 날짜 표시 정상 동작

---

### 2.3 AC-003: 버전 동기화

**Given-When-Then 시나리오**:

#### 시나리오 1: package.json 버전 확인

```gherkin
Given package.json 파일을 열었을 때
When "version" 필드를 확인하면
Then "0.2.0" 값이어야 한다
```

#### 시나리오 2: 문서 버전 확인

```gherkin
Given .moai/project/product.md 파일을 열었을 때
When 버전 정보를 확인하면
Then "0.2.0" 값이어야 한다
```

**검증 체크리스트**:

- [ ] `package.json`의 version이 "0.2.0"
- [ ] 문서의 버전 정보가 일치

---

### 2.4 AC-004: 유닛 테스트 프레임워크 설정

**Given-When-Then 시나리오**:

#### 시나리오 1: 테스트 실행

```gherkin
Given Vitest가 설치되고 설정되었을 때
When `npm run test:unit` 명령을 실행하면
Then Vitest가 src/ 디렉터리의 *.test.ts(x) 파일을 실행해야 한다
```

#### 시나리오 2: 커버리지 리포트

```gherkin
Given 유닛 테스트가 존재할 때
When `npm run test:coverage` 명령을 실행하면
Then HTML 및 텍스트 형식의 커버리지 리포트가 생성되어야 한다
```

#### 시나리오 3: E2E 테스트와 분리

```gherkin
Given 유닛 테스트와 E2E 테스트가 모두 존재할 때
When `npm run test` 명령을 실행하면
Then Playwright E2E 테스트만 실행되어야 한다
And `npm run test:unit` 명령을 실행하면
Then Vitest 유닛 테스트만 실행되어야 한다
```

**검증 체크리스트**:

- [ ] `vitest.config.ts` 파일이 존재
- [ ] `vitest.setup.ts` 파일이 존재
- [ ] `package.json`에 `test:unit`, `test:coverage` 스크립트 추가
- [ ] jsdom 환경에서 React 컴포넌트 테스트 가능
- [ ] coverage 디렉터리가 `.gitignore`에 포함

---

### 2.5 AC-005: Store 함수 테스트

**Given-When-Then 시나리오**:

#### 시나리오 1: todoStore addTodo

```gherkin
Given 빈 todo 목록이 있을 때
When addTodo({ title: "새 할 일", priority: "medium" })를 호출하면
Then todos 배열에 새 할 일이 추가되어야 한다
And 할 일의 completed 상태는 false여야 한다
```

#### 시나리오 2: todoStore toggleTodo

```gherkin
Given completed가 false인 할 일이 존재할 때
When toggleTodo(todoId)를 호출하면
Then 해당 할 일의 completed 상태가 true로 변경되어야 한다
```

#### 시나리오 3: authStore login

```gherkin
Given 사용자가 로그아웃 상태일 때
When login(user) 함수가 호출되면
Then user 상태가 해당 사용자 정보로 설정되어야 한다
And isLoading 상태가 false여야 한다
```

#### 시나리오 4: teamStore switchTeam

```gherkin
Given 여러 팀에 속한 사용자가 있을 때
When switchTeam(teamId)를 호출하면
Then currentTeam이 해당 팀으로 변경되어야 한다
```

**검증 체크리스트**:

- [ ] `src/store/todoStore.test.ts` 존재 및 통과
- [ ] `src/store/authStore.test.ts` 존재 및 통과
- [ ] `src/store/teamStore.test.ts` 존재 및 통과
- [ ] `src/store/presetStore.test.ts` 존재 및 통과
- [ ] 전체 테스트 커버리지 80% 이상

---

### 2.6 AC-006: 유틸리티 함수 테스트

**Given-When-Then 시나리오**:

#### 시나리오 1: cn 함수 - 기본 병합

```gherkin
Given 두 개의 클래스명 "foo"와 "bar"가 있을 때
When cn("foo", "bar")를 호출하면
Then "foo bar"를 반환해야 한다
```

#### 시나리오 2: cn 함수 - Tailwind 충돌 해결

```gherkin
Given 충돌하는 Tailwind 클래스 "p-4"와 "p-2"가 있을 때
When cn("p-4", "p-2")를 호출하면
Then 나중에 지정된 "p-2"만 반환해야 한다
```

#### 시나리오 3: cn 함수 - 조건부 클래스

```gherkin
Given 조건부 클래스가 있을 때
When cn("base", condition && "active")를 호출하면
Then condition이 true면 "base active"를, false면 "base"를 반환해야 한다
```

**검증 체크리스트**:

- [ ] `src/lib/utils.test.ts` 존재
- [ ] cn, isE2ETestMode, convertTimestamp 모두 테스트됨
- [ ] 유틸리티 함수 커버리지 100%

---

### 2.7 AC-007: ESLint require 문 변환

**Given-When-Then 시나리오**:

#### 시나리오 1: ES Module 변환

```gherkin
Given functions/ 디렉터리에 require() 문이 있을 때
When ES Module import 문으로 변환하면
Then `npm run lint` 실행 시 해당 오류가 발생하지 않아야 한다
```

**검증 체크리스트**:

- [ ] functions/ 디렉터리에 require() 문 없음
- [ ] 모든 import가 ES Module 문법 사용
- [ ] `npm run lint` 오류 0개

---

### 2.8 AC-008: 미사용 변수 정리

**Given-When-Then 시나리오**:

#### 시나리오 1: 미사용 변수 제거

```gherkin
Given 선언되었으나 사용되지 않는 변수가 있을 때
When 해당 변수를 제거하거나 underscore prefix를 적용하면
Then `npm run lint` 실행 시 경고가 발생하지 않아야 한다
```

**검증 체크리스트**:

- [ ] `npm run lint` 경고 0개
- [ ] 의도적 미사용 변수는 `_` prefix 사용

---

### 2.9 AC-009: 콘솔 로그 제거

**Given-When-Then 시나리오**:

#### 시나리오 1: 프로덕션 코드 정리

```gherkin
Given src/ 디렉터리에 console.log 문이 있을 때
When 모든 console.log를 제거하거나 logger로 교체하면
Then `grep "console.log" src/` 실행 시 결과가 0건이어야 한다
And 테스트 파일 (*.test.ts)은 예외로 허용한다
```

**검증 체크리스트**:

- [ ] 프로덕션 코드에 console.log 0개
- [ ] 개발 환경에서 logger 정상 동작
- [ ] 프로덕션 빌드 시 debug 로그 출력 안됨

---

### 2.10 AC-010: 조건부 로깅 시스템

**Given-When-Then 시나리오**:

#### 시나리오 1: 개발 환경 로깅

```gherkin
Given NODE_ENV가 "development"일 때
When logger.debug("메시지")를 호출하면
Then 콘솔에 "[DEBUG] 메시지"가 출력되어야 한다
```

#### 시나리오 2: 프로덕션 환경 로깅

```gherkin
Given NODE_ENV가 "production"일 때
When logger.debug("메시지")를 호출하면
Then 콘솔에 아무것도 출력되지 않아야 한다
And logger.error("오류")를 호출하면
Then 콘솔에 "[ERROR] 오류"가 출력되어야 한다
```

**검증 체크리스트**:

- [ ] `src/lib/logger.ts` 존재
- [ ] debug, info는 개발 환경에서만 출력
- [ ] warn, error는 모든 환경에서 출력
- [ ] 유닛 테스트 존재

---

### 2.11 AC-011: Unsafe 타입 캐스팅 제거

**Given-When-Then 시나리오**:

#### 시나리오 1: 타입 가드 적용

```gherkin
Given `as unknown as Type` 패턴이 사용된 코드가 있을 때
When 타입 가드 함수로 대체하면
Then 런타임에 타입 검증이 수행되어야 한다
And 잘못된 타입이 전달되면 적절히 처리되어야 한다
```

**검증 체크리스트**:

- [ ] `as unknown as` 패턴 0개
- [ ] 타입 가드 함수 존재 (필요 시)
- [ ] 타입 오류 없이 빌드 성공

---

### 2.12 AC-012: 제네릭 타입 구체화

**Given-When-Then 시나리오**:

#### 시나리오 1: 명시적 인터페이스 정의

```gherkin
Given Record<string, unknown> 타입이 사용된 코드가 있을 때
When 명시적 인터페이스로 대체하면
Then IDE에서 자동 완성이 지원되어야 한다
And 타입 체크가 더 엄격하게 수행되어야 한다
```

**검증 체크리스트**:

- [ ] `Record<string, unknown>` 사용 최소화
- [ ] 도메인별 명시적 타입/인터페이스 정의
- [ ] 타입 오류 없이 빌드 성공

---

## 3. 통합 검증

### 3.1 전체 검증 스크립트

```bash
#!/bin/bash
# SPEC-REFACTOR-001 검증 스크립트

echo "=== SPEC-REFACTOR-001 검증 시작 ==="

# 1. 린트 검사
echo "[1/7] ESLint 검사..."
npm run lint
if [ $? -ne 0 ]; then echo "FAIL: ESLint 오류"; exit 1; fi

# 2. 타입 체크
echo "[2/7] TypeScript 타입 검사..."
npx tsc --noEmit
if [ $? -ne 0 ]; then echo "FAIL: 타입 오류"; exit 1; fi

# 3. 빌드
echo "[3/7] 프로덕션 빌드..."
npm run build
if [ $? -ne 0 ]; then echo "FAIL: 빌드 실패"; exit 1; fi

# 4. 유닛 테스트
echo "[4/7] 유닛 테스트..."
npm run test:unit -- --run
if [ $? -ne 0 ]; then echo "FAIL: 유닛 테스트 실패"; exit 1; fi

# 5. 커버리지 확인
echo "[5/7] 테스트 커버리지 확인..."
npm run test:coverage -- --run
# 커버리지 임계값은 vitest.config.ts에서 설정

# 6. E2E 테스트
echo "[6/7] E2E 테스트..."
npm run test
if [ $? -ne 0 ]; then echo "FAIL: E2E 테스트 실패"; exit 1; fi

# 7. console.log 검사
echo "[7/7] console.log 검사..."
CONSOLE_COUNT=$(grep -r "console.log" src/ --include="*.ts" --include="*.tsx" | grep -v ".test." | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
  echo "WARN: $CONSOLE_COUNT console.log 문 발견"
fi

echo "=== 검증 완료 ==="
```

### 3.2 Definition of Done

SPEC-REFACTOR-001이 완료로 간주되려면 다음 조건을 모두 충족해야 합니다:

**필수 조건**:

- [ ] 모든 AC 시나리오 통과
- [ ] `npm run lint` 오류/경고 0개
- [ ] `npm run build` 성공
- [ ] `npm run test` (E2E) 100% 통과
- [ ] `npm run test:unit` 모두 통과
- [ ] 테스트 커버리지 80% 이상
- [ ] package.json 버전 0.2.0
- [ ] 코드 리뷰 승인

**권장 조건**:

- [ ] console.log 0개 (테스트 파일 제외)
- [ ] unsafe 타입 캐스팅 0개
- [ ] 문서 업데이트 완료
- [ ] CHANGELOG 항목 추가

---

## 4. 회귀 테스트

### 4.1 기존 기능 보존 확인

리팩토링 후 다음 기능이 정상 동작해야 합니다:

| 기능 | 검증 방법 | E2E 테스트 |
|------|----------|------------|
| 할 일 추가 | 수동 테스트 + E2E | story-1-1-add-todo.spec.ts |
| 할 일 완료 | 수동 테스트 + E2E | story-1-2-complete-todo.spec.ts |
| 할 일 삭제 | 수동 테스트 + E2E | story-1-3-delete-todo.spec.ts |
| 필터링 | 수동 테스트 + E2E | story-1-4-filter-todo.spec.ts |
| 데이터 영속성 | 수동 테스트 + E2E | story-1-5-persistence.spec.ts |
| 팀 협업 | 수동 테스트 + E2E | team-collaboration.spec.ts |
| 인증 | 수동 테스트 | 로그인/로그아웃 시나리오 |
| PWA 설치 | 수동 테스트 | 모바일 브라우저에서 설치 확인 |
| 오프라인 모드 | 수동 테스트 | 네트워크 끊김 시 동작 확인 |

---

마지막 업데이트: 2026-01-28
