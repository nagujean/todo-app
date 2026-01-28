# SPEC-REFACTOR-001: 구현 계획

## 추적성 태그

```
TAG: SPEC-REFACTOR-001-PLAN
PARENT: SPEC-REFACTOR-001
```

---

## 1. 마일스톤 개요

### 마일스톤 구조

```
SPEC-REFACTOR-001 (25 SP) [Updated: 2026-01-28]
├── M1: 코드 중복 제거 (5 SP) - Primary Goal
│   ├── T1.1: isE2ETestMode 통합 (2 SP)
│   ├── T1.2: convertTimestamp 통합 (2 SP)
│   └── T1.3: 버전 동기화 (1 SP)
│
├── M2: ESLint 오류 수정 (3 SP) - Primary Goal
│   ├── T2.1: require → ES Module 변환 (2 SP)
│   └── T2.2: 미사용 변수 정리 (1 SP)
│
├── M3: 테스트 환경 구축 (12 SP) - Secondary Goal [Revised: +4 SP]
│   ├── T3.1: Vitest 설정 (2 SP)
│   ├── T3.2: Firebase 모킹 설정 (3 SP) [New]
│   ├── T3.3: 유틸리티 함수 테스트 (2 SP)
│   └── T3.4: Store 함수 테스트 (5 SP) [Revised: +1 SP]
│
├── M4: 콘솔 로그 정리 (3 SP) - Tertiary Goal
│   ├── T4.1: 로거 유틸리티 생성 (1 SP)
│   └── T4.2: console.log 제거/교체 (2 SP)
│
└── M5: 타입 안전성 개선 (2 SP) - Optional Goal
    ├── T5.1: unsafe 캐스팅 제거 (1 SP)
    └── T5.2: 명시적 타입 정의 (1 SP)
```

---

## 2. 마일스톤 상세

### M1: 코드 중복 제거 (Primary Goal)

**목표**: 중복 함수를 단일 소스로 통합하여 유지보수성 향상

**우선순위**: Primary Goal
**스토리 포인트**: 5 SP
**의존성**: 없음

#### T1.1: isE2ETestMode 함수 통합 (2 SP)

**작업 내용**:

1. `src/lib/utils.ts`에 `isE2ETestMode()` 함수 추가
2. 기존 5개 파일의 로컬 함수를 import로 교체:
   - `src/store/authStore.ts:14`
   - `src/store/teamStore.ts:84`
   - `src/store/invitationStore.ts:22`
   - `src/app/page.tsx:18`
   - `src/components/auth/AuthProvider.tsx:20`
3. 각 파일에서 로컬 함수 정의 삭제

**기술적 접근**:

```typescript
// src/lib/utils.ts에 추가
export function isE2ETestMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.search.includes('e2e=true') ||
    localStorage.getItem('e2e-test-mode') === 'true'
  );
}
```

**검증 방법**:
- `npm run lint` 통과
- `npm run build` 성공
- `npm run test` (E2E) 통과

#### T1.2: convertTimestamp 함수 통합 (2 SP)

**작업 내용**:

1. `src/lib/utils.ts`에 `convertTimestamp()` 함수 추가
2. 4개 store 파일에서 로컬 함수를 import로 교체:
   - `src/store/todoStore.ts`
   - `src/store/teamStore.ts`
   - `src/store/presetStore.ts`
   - `src/store/invitationStore.ts`
3. 각 파일에서 로컬 함수 정의 삭제

**기술적 접근**:

```typescript
// src/lib/utils.ts에 추가
import { Timestamp } from "firebase/firestore";

export function convertTimestamp(
  timestamp: Timestamp | Date | null | undefined
): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  return null;
}
```

**검증 방법**:
- Firebase 연동 기능 정상 동작 확인
- E2E 테스트 통과

#### T1.3: 버전 동기화 (1 SP)

**작업 내용**:

1. `package.json`의 `version` 필드를 `0.2.0`으로 업데이트
2. (선택) 다른 버전 참조가 있는 경우 함께 업데이트

**수정 파일**:
- `package.json`: version 필드

---

### M2: ESLint 오류 수정 (Primary Goal)

**목표**: 모든 ESLint 오류 및 경고 해결

**우선순위**: Primary Goal
**스토리 포인트**: 3 SP
**의존성**: 없음

#### T2.1: require 문 ES Module 변환 (2 SP)

**작업 내용**:

1. `functions/` 디렉터리 분석
2. `require()` 문을 ES Module `import` 문으로 변환
3. 필요 시 `package.json`에 `"type": "module"` 추가

**예시 변환**:

```javascript
// Before
const admin = require('firebase-admin');

// After
import * as admin from 'firebase-admin';
```

**검증 방법**:
- `npm run lint` 오류 0개

#### T2.2: 미사용 변수 정리 (1 SP)

**작업 내용**:

1. ESLint 경고 분석으로 미사용 변수 목록 수집
2. 각 변수에 대해:
   - 불필요한 경우: 삭제
   - 의도적 미사용 (예: 구조 분해): underscore prefix 적용

**예시**:

```typescript
// Before
const { id, name, unused } = data;

// After (옵션 1: 삭제)
const { id, name } = data;

// After (옵션 2: 의도적 미사용)
const { id, name, _unused } = data;
```

**검증 방법**:
- `npm run lint` 경고 0개

---

### M3: 테스트 환경 구축 (Secondary Goal)

**목표**: Vitest 기반 유닛 테스트 환경 구축 및 80% 커버리지 달성

**우선순위**: Secondary Goal
**스토리 포인트**: 8 SP
**의존성**: M1 완료 권장 (테스트 대상 코드 안정화)

#### T3.1: Vitest 설정 (2 SP)

**작업 내용**:

1. 의존성 설치:
   ```bash
   npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
   ```

2. `vitest.config.ts` 생성

3. `vitest.setup.ts` 생성

4. `package.json` 스크립트 추가:
   ```json
   {
     "scripts": {
       "test:unit": "vitest",
       "test:unit:ui": "vitest --ui",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

5. `.gitignore`에 coverage 디렉터리 추가

**검증 방법**:
- `npm run test:unit` 실행 가능

#### T3.2: Firebase 모킹 설정 (3 SP) [New]

**작업 내용**:

1. Firebase 모킹 유틸리티 생성:
   ```typescript
   // src/__mocks__/firebase.ts
   import { vi } from 'vitest';

   export const mockFirestore = {
     collection: vi.fn(),
     doc: vi.fn(),
     onSnapshot: vi.fn(),
     addDoc: vi.fn(),
     updateDoc: vi.fn(),
     deleteDoc: vi.fn(),
   };

   export const mockAuth = {
     currentUser: null,
     onAuthStateChanged: vi.fn((callback) => {
       callback(null);
       return vi.fn(); // unsubscribe
     }),
     signInWithEmailAndPassword: vi.fn(),
     signOut: vi.fn(),
   };
   ```

2. `vitest.setup.ts`에 모킹 설정:
   ```typescript
   vi.mock('@/lib/firebase', () => ({
     db: mockFirestore,
     auth: mockAuth,
   }));
   ```

3. 실시간 리스너 테스트 헬퍼 생성:
   ```typescript
   // src/__test-utils__/firestore-helpers.ts
   export function simulateSnapshot<T>(data: T[]) {
     return {
       docs: data.map((item, index) => ({
         id: `doc-${index}`,
         data: () => item,
       })),
     };
   }
   ```

**검증 방법**:
- 모킹 설정으로 유닛 테스트가 Firebase 없이 실행 가능
- E2E 테스트는 실제 Firebase 에뮬레이터 사용 유지

#### T3.3: 유틸리티 함수 테스트 (2 SP)

**작업 내용**:

1. `src/lib/utils.test.ts` 생성
2. 다음 함수에 대한 테스트 작성:
   - `cn()`: 다양한 클래스 조합 테스트
   - `isE2ETestMode()`: window 객체 모킹, localStorage 모킹
   - `convertTimestamp()`: null, Date, Timestamp 각 케이스

**테스트 예시**:

```typescript
// src/lib/utils.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, isE2ETestMode, convertTimestamp } from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle Tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });
});

describe('isE2ETestMode', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null) });
  });

  it('should return false by default', () => {
    expect(isE2ETestMode()).toBe(false);
  });

  it('should return true when e2e=true in URL', () => {
    vi.stubGlobal('window', { location: { search: '?e2e=true' } });
    expect(isE2ETestMode()).toBe(true);
  });
});

describe('convertTimestamp', () => {
  it('should return null for null input', () => {
    expect(convertTimestamp(null)).toBeNull();
  });

  it('should return Date as-is', () => {
    const date = new Date();
    expect(convertTimestamp(date)).toBe(date);
  });
});
```

**검증 방법**:
- 유틸리티 함수 100% 커버리지

#### T3.4: Store 함수 테스트 (5 SP) [Revised]

**작업 내용**:

1. 각 스토어에 대한 테스트 파일 생성:
   - `src/store/todoStore.test.ts`
   - `src/store/authStore.test.ts`
   - `src/store/teamStore.test.ts`
   - `src/store/presetStore.test.ts`

2. Firebase 모킹 설정:
   ```typescript
   // vitest.setup.ts에 추가
   vi.mock('@/lib/firebase', () => ({
     db: {},
     auth: {},
   }));
   ```

3. 핵심 action 함수 테스트:
   - `todoStore`: addTodo, toggleTodo, deleteTodo
   - `authStore`: login, logout
   - `teamStore`: createTeam, switchTeam
   - `presetStore`: addPreset, deletePreset

**검증 방법**:
- `npm run test:coverage` 80% 이상

---

### M4: 콘솔 로그 정리 (Tertiary Goal)

**목표**: 프로덕션 코드에서 console.log 제거

**우선순위**: Tertiary Goal
**스토리 포인트**: 3 SP
**의존성**: 없음 (병렬 진행 가능)

#### T4.1: 로거 유틸리티 생성 (1 SP)

**작업 내용**:

1. `src/lib/logger.ts` 생성
2. 환경별 조건부 로깅 구현
3. 테스트 파일 `src/lib/logger.test.ts` 작성

**코드**:

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) console.debug('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};
```

#### T4.2: console.log 제거/교체 (2 SP)

**작업 내용**:

1. 모든 console.log 문 검색:
   ```bash
   grep -rn "console.log" src/
   ```

2. 각 console.log 분석 및 처리:
   - 불필요한 디버깅 로그: 삭제
   - 유용한 개발 정보: `logger.debug()` 로 교체
   - 경고/오류 정보: `logger.warn()` 또는 `logger.error()` 로 교체

3. ESLint 규칙 추가 (선택):
   ```javascript
   // eslint.config.mjs
   {
     rules: {
       'no-console': ['warn', { allow: ['warn', 'error'] }]
     }
   }
   ```

**검증 방법**:
- `grep "console.log" src/` 결과 0건
- 개발 환경에서 필요한 로그 정상 출력

---

### M5: 타입 안전성 개선 (Optional Goal)

**목표**: unsafe 타입 패턴 제거 및 명시적 타입 정의

**우선순위**: Optional Goal
**스토리 포인트**: 2 SP
**의존성**: M3 완료 후 권장 (테스트로 변경 검증)

#### T5.1: unsafe 캐스팅 제거 (1 SP)

**작업 내용**:

1. `as unknown as` 패턴 검색:
   ```bash
   grep -rn "as unknown as" src/
   ```

2. 각 케이스에 대해 타입 가드 또는 안전한 변환 적용

**예시**:

```typescript
// Before
const user = data as unknown as User;

// After (타입 가드)
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}

const user = isUser(data) ? data : null;
```

#### T5.2: 명시적 타입 정의 (1 SP)

**작업 내용**:

1. `Record<string, unknown>` 사용 위치 검색
2. 각 케이스에 대해 명시적 인터페이스 정의

**예시**:

```typescript
// Before
const settings: Record<string, unknown> = { theme: 'dark', lang: 'ko' };

// After
interface Settings {
  theme: 'dark' | 'light';
  lang: string;
}
const settings: Settings = { theme: 'dark', lang: 'ko' };
```

---

## 3. 기술적 접근 방식

### 3.1 DDD 사이클 적용

각 마일스톤에 ANALYZE-PRESERVE-IMPROVE 사이클 적용:

**ANALYZE**:
- 현재 코드 분석 및 영향 범위 파악
- 기존 동작 문서화

**PRESERVE**:
- 특성화 테스트 작성 (변경 전 동작 캡처)
- E2E 테스트 실행으로 기존 동작 확인

**IMPROVE**:
- 리팩토링 적용
- 유닛 테스트 추가
- E2E 테스트로 동작 보존 확인

### 3.2 롤백 전략

각 마일스톤 완료 시점에 Git 태그를 생성하여 롤백 지점을 확보합니다:

```bash
# 마일스톤 완료 시 태그 생성
git tag -a SPEC-REFACTOR-001-M1 -m "M1: 코드 중복 제거 완료"
git tag -a SPEC-REFACTOR-001-M2 -m "M2: ESLint 오류 수정 완료"
git tag -a SPEC-REFACTOR-001-M3 -m "M3: 테스트 환경 구축 완료"
git tag -a SPEC-REFACTOR-001-M4 -m "M4: 콘솔 로그 정리 완료"
git tag -a SPEC-REFACTOR-001-M5 -m "M5: 타입 안전성 개선 완료"

# 롤백 필요 시
git checkout SPEC-REFACTOR-001-M1  # M1 완료 시점으로 롤백
```

**롤백 조건**:
- E2E 테스트 실패 시 이전 마일스톤으로 롤백
- 프로덕션 빌드 실패 시 즉시 롤백
- 성능 저하 감지 시 원인 분석 후 선택적 롤백

### 3.3 Git 전략

**브랜치**:
```
main
└── refactor/SPEC-REFACTOR-001
    ├── refactor/code-dedup       (M1)
    ├── refactor/eslint-fixes     (M2)
    ├── feat/vitest-setup         (M3)
    ├── refactor/console-cleanup  (M4)
    └── refactor/type-safety      (M5)
```

**커밋 컨벤션**:
```
refactor(utils): extract isE2ETestMode to shared utils
feat(test): add Vitest configuration
fix(lint): convert require to ES modules
```

---

## 4. 검증 체크리스트

### 각 마일스톤 완료 시 확인 사항

- [ ] `npm run lint` 통과 (오류 0, 경고 0)
- [ ] `npm run build` 성공
- [ ] `npm run test` (E2E) 통과
- [ ] `npm run test:unit` 통과 (M3 이후)
- [ ] 코드 리뷰 완료

### 전체 SPEC 완료 시 확인 사항

- [ ] 모든 마일스톤 완료
- [ ] 테스트 커버리지 80% 이상
- [ ] ESLint 오류/경고 0개
- [ ] console.log 0개 (프로덕션 코드)
- [ ] 버전 0.2.0으로 통일
- [ ] 문서 업데이트 완료

---

## 5. 리소스 및 참조

### 의존성 추가 목록

```json
{
  "devDependencies": {
    "vitest": "3.0.5",
    "@vitejs/plugin-react": "4.3.4",
    "jsdom": "26.0.0",
    "@testing-library/react": "16.2.0",
    "@testing-library/jest-dom": "6.6.3",
    "@vitest/coverage-v8": "3.0.5",
    "@vitest/ui": "3.0.5"
  }
}
```

> **Note**: 버전은 2026-01-28 기준 안정 릴리스입니다. 설치 전 `npm info <package> versions`로 최신 버전을 확인하세요.

### 참조 문서

- [Vitest 공식 문서](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Zustand Testing 가이드](https://zustand.docs.pmnd.rs/guides/testing)
- [Next.js 테스팅](https://nextjs.org/docs/app/building-your-application/testing/vitest)

---

마지막 업데이트: 2026-01-28 (UltraThink 분석 기반 수정)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-01-28 | 1.0.0 | 초기 SPEC 생성 |
| 2026-01-28 | 1.1.0 | UltraThink 분석 반영: M3 SP 조정 (8→12), 롤백 전략 추가, Firebase 모킹 태스크 추가, 의존성 버전 확정 |
