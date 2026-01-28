# SPEC-REFACTOR-001: Todo App 코드 품질 개선

## 메타데이터

| 항목 | 값 |
|------|-----|
| **SPEC ID** | SPEC-REFACTOR-001 |
| **제목** | Todo App 코드 품질 및 유지보수성 개선 |
| **생성일** | 2026-01-28 |
| **상태** | In Progress |
| **우선순위** | High |
| **담당 에이전트** | manager-ddd, expert-refactoring, expert-testing |
| **예상 스토리 포인트** | 25 SP |
| **라이프사이클** | spec-anchored |

## 추적성 태그

```
TAG: SPEC-REFACTOR-001
PARENT: None
CHILDREN: None
RELATED: None
```

---

## 1. 환경 (Environment)

### 1.1 현재 시스템 상태

- **프로젝트**: Todo App (할 일 관리 PWA)
- **기술 스택**: Next.js 16.1.2, React 19.2.3, TypeScript 5.x, Firebase 12.8.0, Zustand 5.0.10
- **현재 버전**: package.json에 0.1.0, 문서에 0.2.0 (불일치)
- **테스트 커버리지**: 유닛 테스트 0%, E2E 테스트만 존재 (Playwright)
- **코드 품질 도구**: ESLint (3 errors, 9 warnings 존재)

### 1.2 영향 범위

| 범주 | 영향 파일 |
|------|----------|
| 코드 중복 | authStore.ts, teamStore.ts, invitationStore.ts, page.tsx, AuthProvider.tsx |
| 유닛 테스트 | src/store/*.ts, src/lib/*.ts |
| ESLint | functions/ 디렉터리 (3 errors), 전체 프로젝트 (9 warnings) |
| 콘솔 로그 | 전체 src/ 디렉터리 (80+ console.log 문) |
| 타입 안전성 | 다수 파일에서 unsafe 패턴 사용 |

### 1.3 제약 조건

- 기존 E2E 테스트는 모두 통과 상태를 유지해야 함
- Firebase 실시간 동기화 기능에 영향을 주지 않아야 함
- PWA 오프라인 기능이 정상 동작해야 함
- 프로덕션 배포에 영향을 최소화해야 함

---

## 2. 가정 (Assumptions)

### 2.1 기술적 가정

| ID | 가정 | 신뢰도 | 근거 | 오류 시 위험 | 검증 방법 |
|----|------|--------|------|--------------|-----------|
| A1 | 중복 함수 추출 시 기존 동작 보존 가능 | High | 순수 함수들이므로 안전하게 추출 가능 | 동작 변경 가능성 | 특성화 테스트 작성 |
| A2 | Vitest가 현재 스택과 호환 | High | Next.js 16, React 19 공식 지원 | 설정 복잡성 증가 | 샘플 테스트 실행 |
| A3 | 콘솔 로그 제거가 기능에 영향 없음 | Medium | 디버깅용 로그로 추정 | 숨겨진 부작용 가능 | 단계별 제거 및 검증 |
| A4 | ESLint 오류 수정이 런타임에 영향 없음 | High | 정적 분석 오류 | 미미함 | 빌드 및 테스트 검증 |

### 2.2 비즈니스 가정

| ID | 가정 | 신뢰도 | 근거 |
|----|------|--------|------|
| B1 | 리팩토링 동안 신규 기능 개발 일시 중단 가능 | Medium | 코드 품질 우선 |
| B2 | 버전 0.2.0으로 통일하여 릴리스 | High | 문서와 일치 |

---

## 3. 요구사항 (Requirements)

### 3.1 P1 - Critical: 코드 중복 제거 (5 SP)

#### REQ-001: isE2ETestMode 함수 통합

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** E2E 테스트 모드 감지를 위해 `src/lib/utils.ts`의 단일 `isE2ETestMode()` 함수를 사용해야 한다.

**현재 상태**:
- `src/store/authStore.ts:14`
- `src/store/teamStore.ts:84`
- `src/store/invitationStore.ts:22`
- `src/app/page.tsx:18`
- `src/components/auth/AuthProvider.tsx:20`

**목표 상태**:
- `src/lib/utils.ts`에 단일 함수 정의
- 5개 파일에서 import하여 사용

#### REQ-002: convertTimestamp 함수 통합

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** Firebase Timestamp 변환을 위해 `src/lib/utils.ts`의 단일 `convertTimestamp()` 함수를 사용해야 한다.

**현재 상태**:
- 4개 store 파일에 중복 정의됨

**목표 상태**:
- `src/lib/utils.ts`에 단일 함수 정의
- 모든 store 파일에서 import하여 사용

#### REQ-003: 버전 동기화

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** package.json의 version 필드와 프로젝트 문서의 버전이 일치해야 한다.

**현재 상태**:
- package.json: 0.1.0
- product.md: 0.2.0

**목표 상태**:
- 모든 소스에서 0.2.0으로 통일

---

### 3.2 P2 - High: 테스트 커버리지 확보 (12 SP)

#### REQ-004: 유닛 테스트 프레임워크 설정

**EARS 패턴**: 이벤트 기반 (Event-Driven)

> **WHEN** 개발자가 `npm run test:unit` 명령을 실행하면 **THEN** Vitest가 src/ 디렉터리의 유닛 테스트를 실행해야 한다.

**요구 사항**:
- Vitest 설치 및 구성
- React Testing Library 통합
- 테스트 스크립트 추가 (test:unit, test:coverage)
- 기존 E2E 테스트와 분리

#### REQ-005: Store 함수 테스트

**EARS 패턴**: 상태 기반 (State-Driven)

> **IF** Zustand store의 action 함수가 호출되면 **THEN** 해당 함수의 동작이 테스트로 검증되어야 한다.

**대상 스토어**:
- `todoStore.ts`: addTodo, toggleTodo, deleteTodo, updateTodo
- `authStore.ts`: login, logout, isE2ETestMode 통합
- `teamStore.ts`: createTeam, joinTeam, leaveTeam
- `presetStore.ts`: addPreset, deletePreset

**목표 커버리지**: 80% 이상

#### REQ-006: 유틸리티 함수 테스트

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** `src/lib/utils.ts`의 모든 유틸리티 함수에 대한 유닛 테스트를 유지해야 한다.

**대상 함수**:
- `cn()`: 클래스명 병합
- `isE2ETestMode()`: E2E 모드 감지 (신규)
- `convertTimestamp()`: Timestamp 변환 (신규)

---

### 3.3 P2 - High: ESLint 오류 수정 (3 SP)

#### REQ-007: require 문 ES Module 변환

**EARS 패턴**: 금지 (Unwanted)

> 시스템은 `require()` 구문을 사용**하지 않아야 한다**. 모든 import는 ES Module 문법을 사용해야 한다.

**현재 상태**:
- functions/ 디렉터리에 3개의 require 관련 ESLint 오류

**목표 상태**:
- 모든 파일에서 ES Module import/export 사용
- ESLint 오류 0개

#### REQ-008: 미사용 변수 정리

**EARS 패턴**: 금지 (Unwanted)

> 시스템은 선언되었으나 사용되지 않는 변수를 포함**하지 않아야 한다**.

**현재 상태**:
- 9개의 미사용 변수 경고

**목표 상태**:
- 미사용 변수 제거 또는 필요 시 underscore prefix 사용
- ESLint 경고 0개

---

### 3.4 P3 - Medium: 콘솔 로그 정리 (3 SP)

#### REQ-009: 콘솔 로그 제거

**EARS 패턴**: 금지 (Unwanted)

> 프로덕션 코드는 디버깅용 `console.log` 문을 포함**하지 않아야 한다**.

**현재 상태**:
- 80개 이상의 console.log 문 존재

**목표 상태**:
- 모든 디버깅용 console.log 제거
- 필요한 경우 조건부 로깅 유틸리티 도입 고려

#### REQ-010: 조건부 로깅 시스템

**EARS 패턴**: 선택적 (Optional)

> **가능하면** 개발 환경에서만 동작하는 조건부 로깅 유틸리티를 제공한다.

**구현 예시**:
```typescript
// src/lib/logger.ts
export const logger = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', ...args);
    }
  }
};
```

---

### 3.5 P3 - Medium: 타입 안전성 개선 (2 SP)

#### REQ-011: Unsafe 타입 캐스팅 제거

**EARS 패턴**: 금지 (Unwanted)

> 시스템은 `as unknown as Type` 패턴을 사용**하지 않아야 한다**. 안전한 타입 가드를 사용해야 한다.

**현재 상태**:
- 다수 파일에서 unsafe 타입 캐스팅 사용

**목표 상태**:
- 타입 가드 함수 사용
- Zod 또는 io-ts를 통한 런타임 검증 고려

#### REQ-012: 제네릭 타입 구체화

**EARS 패턴**: 편재적 (Ubiquitous)

> 시스템은 **항상** `Record<string, unknown>` 대신 명시적인 인터페이스 또는 타입을 정의해야 한다.

---

## 4. 명세 (Specifications)

### 4.1 기술 명세

#### 4.1.1 유틸리티 함수 통합

**파일**: `src/lib/utils.ts`

```typescript
// 기존 cn 함수 유지
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 신규: E2E 테스트 모드 감지
export function isE2ETestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.search.includes('e2e=true') ||
    localStorage.getItem('e2e-test-mode') === 'true'
  );
}

// 신규: Firebase Timestamp 변환
export function convertTimestamp(timestamp: Timestamp | Date | null | undefined): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  return null;
}
```

#### 4.1.2 테스트 환경 구성

**파일**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/app/sw.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

#### 4.1.3 조건부 로깅 유틸리티

**파일**: `src/lib/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger: Logger = {
  debug: (...args) => isDevelopment && console.debug('[DEBUG]', ...args),
  info: (...args) => isDevelopment && console.info('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};
```

### 4.2 구현 우선순위

| 우선순위 | 요구사항 | 스토리 포인트 | 의존성 |
|----------|----------|---------------|--------|
| 1 | REQ-001, REQ-002 (중복 제거) | 3 SP | 없음 |
| 2 | REQ-003 (버전 동기화) | 1 SP | 없음 |
| 3 | REQ-007, REQ-008 (ESLint) | 3 SP | 없음 |
| 4 | REQ-004 (테스트 프레임워크) | 2 SP | 없음 |
| 5 | REQ-005, REQ-006 (테스트 작성) | 6 SP | REQ-001, REQ-002, REQ-004 |
| 6 | REQ-009, REQ-010 (콘솔 로그) | 3 SP | 없음 |
| 7 | REQ-011, REQ-012 (타입 안전성) | 3 SP | REQ-005 완료 후 권장 |

---

## 5. 위험 평가

### 5.1 기술적 위험

| 위험 | 발생 확률 | 영향도 | 완화 전략 |
|------|----------|--------|-----------|
| 리팩토링 중 동작 변경 | Medium | High | 특성화 테스트 선작성, 단계별 커밋 |
| 테스트 환경 설정 복잡성 | Low | Medium | Vitest 공식 문서 참조, 최소 구성으로 시작 |
| 콘솔 로그 제거 시 디버깅 어려움 | Low | Low | 조건부 로거 도입으로 완화 |
| 기존 E2E 테스트 실패 | Low | High | 각 단계 후 E2E 테스트 실행 |
| Firebase 모킹 복잡성 | Medium | Medium | Firestore 모킹 라이브러리 활용, 통합 테스트 분리 |
| Vitest + Next.js 16 호환성 | Low | Medium | 공식 가이드 참조, 최소 구성으로 시작 |

### 5.2 일정 위험

| 위험 | 발생 확률 | 영향도 | 완화 전략 |
|------|----------|--------|-----------|
| 예상보다 많은 중복 코드 발견 | Medium | Medium | 탐색적 분석 수행, 버퍼 확보 |
| 테스트 작성 시간 초과 | Medium | Medium | 핵심 로직 우선, 점진적 커버리지 확대 |

---

## 6. 품질 기준 (TRUST 5)

### 6.1 Tested (테스트됨)

- 모든 유틸리티 함수에 유닛 테스트 존재
- Store action 함수 테스트 커버리지 80% 이상
- 기존 E2E 테스트 100% 통과

### 6.2 Readable (읽기 쉬움)

- 중복 코드 제거로 단일 진실 공급원 확립
- 명확한 함수명과 주석
- 일관된 코드 스타일 (ESLint 규칙 준수)

### 6.3 Unified (통일됨)

- 버전 번호 통일 (0.2.0)
- 유틸리티 함수 중앙화
- 일관된 import 패턴

### 6.4 Secured (보안됨)

- 민감 정보 로깅 방지
- 타입 안전성 강화로 런타임 오류 감소

### 6.5 Trackable (추적 가능)

- 의미 있는 커밋 메시지
- SPEC 기반 작업 추적
- 변경 이력 문서화

---

## 7. 관련 문서

- `.moai/project/product.md`: 제품 개요
- `.moai/project/tech.md`: 기술 스택 문서
- `.moai/project/structure.md`: 프로젝트 구조

---

마지막 업데이트: 2026-01-28 (UltraThink 분석 기반 수정)
