# SPEC-OBSERVABILITY-001: Sentry Error Tracking Integration

---

spec_id: SPEC-OBSERVABILITY-001
title: Sentry Error Tracking Integration
created: 2026-03-17
status: In Progress
priority: High
assigned: expert-frontend
lifecycle_level: spec-anchored
parent_spec: SPEC-DEPLOY-STABILITY-001

---

## Overview

Sentry를 통합하여 실시간 에러 추적 및 모니터링 시스템을 구축합니다. Vercel Pro 플랜이 필요한 기능(Feature Flags, Multi-Region)은 제외하고, 무료로 사용 가능한 Sentry 통합에 집중합니다.

## Scope

**In-Scope:**

- Sentry 클라이언트/서버/엣지 설정
- 자동 에러 캡처링
- Source Maps 업로드 (선택)
- 에러 알림 설정

**Out-of-Scope:**

- Feature Flags (Vercel Pro 필요)
- Multi-Region Deployment (Vercel Pro 필요)
- Database Migration Safety (별도 SPEC)

---

## ⚠️ 수동 작업 체크리스트 (사용자 필수)

이 작업들은 **사용자가 직접 수행**해야 합니다. AI가 자동으로 처리할 수 없습니다.

### 1. Sentry 계정 생성

- [ ] **sentry.io** 접속: https://sentry.io
- [ ] **무료 계정 생성** (GitHub/Google/Email 로그인)
- [ ] **Organization 생성** (없는 경우)

### 2. 프로젝트 생성

- [ ] Sentry Dashboard → **Projects** → **Create Project**
- [ ] 플랫폼 선택: **Next.js**
- [ ] 프로젝트 이름: `todo-app` (또는 원하는 이름)
- [ ] 알림 설정: 이메일 알림 활성화 (권장)

### 3. DSN (Data Source Name) 복사

프로젝트 생성 후 표시되는 DSN을 복사합니다:

```
형식: https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o0.ingest.sentry.io/xxxxxxxx
```

- [ ] **Client Key (DSN)** 복사 완료

### 4. Vercel 환경 변수 설정

Vercel Dashboard → todo-app → Settings → Environment Variables

**추가할 변수:**

| 변수명                   | 값                                    | 환경                |
| ------------------------ | ------------------------------------- | ------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@o0.ingest.sentry.io/xxx` | Production, Preview |
| `SENTRY_ENVIRONMENT`     | `production` 또는 `preview`           | Production, Preview |

**선택 (Source Map 업로드용):**

- [ ] Sentry → Settings → Auth Tokens → Create Token
- [ ] `SENTRY_AUTH_TOKEN` 변수 추가 (Vercel)

### 5. 로컬 개발 환경 (선택)

`.env.local` 파일에 추가:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=development
```

---

## 자동 설정 파일 (AI가 생성)

### 파일 구조

```
todo-app/
├── sentry.client.config.ts   # 클라이언트 설정
├── sentry.server.config.ts   # 서버 설정
├── sentry.edge.config.ts     # Edge Runtime 설정
├── instrumentation.ts        # 서버 초기화 (선택)
└── next.config.mjs           # Sentry 통합 (수정)
```

---

## Requirements (EARS Format)

### REQ-001: 클라이언트 에러 캡처 (Ubiquitous)

시스템은 **항상** 브라우저에서 발생하는 모든 JavaScript 에러를 Sentry로 전송해야 한다.

**Acceptance Criteria:**

- [ ] `sentry.client.config.ts` 생성
- [ ] React Error Boundary 통합
- [ ] 자동 Breadcrumbs 수집

### REQ-002: 서버 에러 캡처 (Ubiquitous)

시스템은 **항상** 서버 사이드에서 발생하는 모든 에러를 Sentry로 전송해야 한다.

**Acceptance Criteria:**

- [ ] `sentry.server.config.ts` 생성
- [ ] API Route 에러 자동 캡처
- [ ] Server Actions 에러 캡처

### REQ-003: Edge Runtime 에러 캡처 (Ubiquitous)

시스템은 **항상** Edge Runtime에서 발생하는 에러를 캡처해야 한다.

**Acceptance Criteria:**

- [ ] `sentry.edge.config.ts` 생성
- [ ] Health Endpoint (`/api/health`) 에러 추적

### REQ-004: 환경 구분 (State-Driven)

**IF** `SENTRY_ENVIRONMENT`가 설정되면, **THEN** 시스템은 해당 환경으로 에러를 분류해야 한다.

**Acceptance Criteria:**

- [ ] production/preview/development 환경 구분
- [ ] 환경별 에러 필터링 가능

### REQ-005: 개인정보 보호 (Unwanted Behavior)

시스템은 **반드시** 민감한 개인정보가 Sentry로 전송되지 않도록 해야 한다.

**Acceptance Criteria:**

- [ ] PII (개인식별정보) 자동 필터링
- [ ] 사용자 이메일/이름 마스킹
- [ ] 로컬스토리지/세션스토리지 민감 정보 제외

---

## Technical Approach

### 의존성

```json
{
  "@sentry/nextjs": "^10.43.0" // 이미 설치됨 ✅
}
```

### 설정 파일 템플릿

#### sentry.client.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
});
```

#### sentry.server.config.ts

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: 0.1,
});
```

---

## Success Metrics

| Metric         | Target | Measurement               |
| -------------- | ------ | ------------------------- |
| 에러 감지율    | 100%   | 모든 unhandled error 캡처 |
| 에러 알림 지연 | < 1분  | Sentry → 이메일           |
| PII 노출       | 0건    | 수동 검증                 |

---

## 참조

- [Sentry Next.js 문서](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [SPEC-DEPLOY-STABILITY-001](../SPEC-DEPLOY-STABILITY-001/spec.md) - Parent SPEC

---

TAG: SPEC-OBSERVABILITY-001
