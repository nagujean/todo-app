## SPEC-OBSERVABILITY-001 Progress

---

created: 2026-03-17
status: In Progress (수동 작업 대기)
updated: 2026-03-17

---

## 자동화 완료 항목

| 항목                      | 상태           | 비고             |
| ------------------------- | -------------- | ---------------- |
| `sentry.client.config.ts` | ✅ 기존 구현됨 | 155줄            |
| `sentry.server.config.ts` | ✅ 기존 구현됨 | 160줄            |
| `sentry.edge.config.ts`   | ✅ 기존 구현됨 | 61줄             |
| `src/lib/sentry.ts`       | ✅ 기존 구현됨 | 240줄            |
| 단위 테스트               | ✅ 작성 완료   | 19개 테스트 통과 |

## 테스트 결과 (2026-03-17)

```
 ✓ src/lib/__tests__/sentry.test.ts (19 tests)

 Test Files  1 passed ✅
 Tests       19 passed ✅
 Duration    1.95s
```

### 테스트 커버리지

| 함수                  | 테스트 수 |
| --------------------- | --------- |
| initializeUserContext | 3         |
| captureError          | 3         |
| captureErrorWithLevel | 2         |
| captureMessage        | 2         |
| addBreadcrumb         | 2         |
| trackFeatureFlag      | 2         |
| trackMetric           | 1         |
| handleApiRouteError   | 1         |
| handleFirebaseError   | 1         |
| measurePerformance    | 2         |

---

## ⚠️ 사용자 수동 작업 체크리스트 (필수)

### 1. Sentry 계정 및 프로젝트 생성

- [ ] **sentry.io** 접속: https://sentry.io
- [ ] **무료 계정 생성** (GitHub/Google/Email 로그인)
- [ ] **Organization 생성** (없는 경우)
- [ ] **New Project** → **Next.js** 선택
- [ ] 프로젝트 이름: `todo-app`

### 2. DSN (Data Source Name) 복사

프로젝트 생성 후 표시되는 DSN을 복사:

```
형식: https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0.ingest.sentry.io/xxxxxxxx
```

- [ ] **Client Key (DSN)** 복사 완료

### 3. Vercel 환경 변수 설정

**경로:** Vercel Dashboard → todo-app → Settings → Environment Variables

**추가할 변수:**

| 변수명                           | 값                                    | 환경                |
| -------------------------------- | ------------------------------------- | ------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`         | `https://xxx@o0.ingest.sentry.io/xxx` | Production, Preview |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `production`                          | Production          |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `preview`                             | Preview             |

- [ ] Vercel 환경 변수 추가 완료

### 4. 로컬 개발 환경 (선택)

`.env.local` 파일에 추가:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

- [ ] 로컬 환경 변수 설정 (선택)

---

## 완료 확인 방법

환경 변수 설정 후 다음 명령어로 확인:

```bash
# 로컬에서 테스트
npm run build && npm run start

# 브라우저 콘솔에서 에러 발생
throw new Error("Sentry Test");

# Sentry 대시보드에서 에러 확인
```

---

## 수동 작업 완료 후

모든 체크리스트 완료 후 SPEC 상태를 **Completed**로 업데이트합니다.
