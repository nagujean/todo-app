# SPEC-DEPLOY-STABILITY-001: Deployment Stability Enhancement

---

spec_id: SPEC-DEPLOY-STABILITY-001
title: Deployment Stability Enhancement
created: 2026-03-16
status: Planned
priority: Critical
assigned: expert-devops
lifecycle_level: spec-anchored

---

## Problem Statement

### Current Situation

배포 파이프라인에 다음과 같은 문제점들이 존재합니다:

1. **단일 리전 배포 (Single Point of Failure)**
   - Vercel iad1 리전에만 배포됨
   - 해당 리전 장애 시 서비스 전체 중단

2. **수동 캐시 관리**
   - Service Worker 버전이 "v3-2026-03-16-b"로 하드코딩됨
   - 배포 시마다 수동 업데이트 필요
   - 캐시 무효화가 자동화되지 않음

3. **CI/CD 파이프라인 부재**
   - Firebase Functions만 자동 배포됨
   - 메인 Next.js 앱은 수동 배포 의존
   - 품질 게이트가 배포 전에 검증되지 않음

4. **Pre-commit Hook 미설치**
   - 커밋 전 코드 품질 검증 없음
   - 린트 에러, 타입 에러가 배포까지 전파됨

5. **테스트 커버리지 미달**
   - 현재: 64.76%
   - 목표: 85%
   - 배포를 막는 게이트 없음

6. **모니터링 시스템 부재**
   - 헬스 체크 없음
   - 에러 추적 없음 (Sentry 등)
   - 알림 시스템 없음

7. **Feature Flag 미도입**
   - 점진적 론아웃 불가능
   - 전체 배포 또는 롤백만 가능

8. **롤백 자동화 미흡**
   - 수동 개입 필요
   - 롤백 시간 > 5분

### Root Cause Analysis

| 문제              | 근본 원인                        | 영향                                 |
| ----------------- | -------------------------------- | ------------------------------------ |
| 단일 리전         | Vercel 기본 설정 사용            | SPOF로 인한 서비스 중단 위험         |
| 수동 캐시         | 자동화된 버전 관리 미도입        | 배포 후 캐시 문제로 사용자 경험 저하 |
| CI/CD 부재        | GitHub Actions 워크플로우 미구성 | 품질 검증 없는 배포로 버그 전파      |
| Pre-commit 미설치 | Husky 미도입                     | 저품질 코드가 저장소에 유입          |
| 테스트 커버리지   | Coverage 게이트 없음             | 미검증 코드의 프로덕션 배포          |
| 모니터링 부재     | Observability 도구 미도입        | 장애 감지 및 대응 지연               |
| Feature Flag      | 기능 토글 시스템 미구축          | 전략적 배포 불가능                   |
| 수동 롤백         | 자동화 스크립트 미구현           | MTTR 증가                            |

### Impact

- **MTTR (Mean Time To Recovery)**: 평균 30분 이상
- **배포 빈도**: 주 1회 이하로 제한
- **장애 감지 시간**: 사용자 신고 후 인지
- **롤백 시간**: 수동 개입으로 5-15분 소요

## Environment

### Technical Context

- **Framework**: Next.js 16.1.2 (App Router)
- **Deployment**: Vercel (iad1 리전)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Package Manager**: npm
- **Test Framework**: Vitest
- **Current Coverage**: 64.76%
- **Target Coverage**: 85%

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Current Architecture                      │
├─────────────────────────────────────────────────────────────┤
│  GitHub (master) → Vercel (iad1) → Firebase                 │
│                                                             │
│  ❌ No quality gates                                        │
│  ❌ No automated testing                                    │
│  ❌ No monitoring                                           │
│  ❌ No feature flags                                        │
│  ❌ No rollback automation                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Target Architecture                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌─────────────┐    ┌──────────────────┐   │
│  │ Pre-commit│ → │   CI/CD     │ → │  Gradual Rollout │   │
│  │  (Husky)  │    │ (GitHub     │    │  (Feature Flags) │   │
│  │           │    │  Actions)   │    │                  │   │
│  └──────────┘    └─────────────┘    └──────────────────┘   │
│        ↓                ↓                    ↓              │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────────┐   │
│  │  Lint    │    │ Unit Tests  │    │  Canary 10%      │   │
│  │  Type    │    │ E2E Tests   │    │  Canary 50%      │   │
│  │  Format  │    │ Security    │    │  Full Rollout    │   │
│  └──────────┘    └─────────────┘    └──────────────────┘   │
│                         ↓                    ↓              │
│                  ┌──────────────────────────────────────┐   │
│                  │     Monitoring & Safety Layer        │   │
│                  │  (Sentry, Health Checks, Rollback)   │   │
│                  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Stakeholders

- **개발팀**: 안정적인 배포 파이프라인 필요
- **운영팀**: 모니터링 및 장애 대응 체계 필요
- **사용자**: 서비스 안정성 및 가용성 기대

## Assumptions

| Assumption                    | Confidence | Evidence                  | Risk if Wrong       | Validation       |
| ----------------------------- | ---------- | ------------------------- | ------------------- | ---------------- |
| Vercel Pro 플랜 사용 가능     | Medium     | Pro 기능 필요 (다중 리전) | 다중 리전 배포 불가 | Vercel 계정 확인 |
| Sentry 무료 티어로 충분       | High       | 월 5K 에어 충분           | 유료 플랜 필요      | 트래픽 분석      |
| GitHub Actions 무료 티어 충분 | High       | 월 2000분 충분            | 유료 플랜 필요      | 빌드 시간 분석   |
| Husky v9 호환                 | High       | 최신 버전 안정            | 대체 도구 필요      | 로컬 테스트      |
| Feature Flag 라이브러리 무료  | High       | Flags 등 무료 옵션 존재   | 유료 도구 필요      | 라이브러리 평가  |

## Requirements (EARS Format)

### Ubiquitous Requirements

**REQ-001**: 시스템은 **항상** 모든 배포 전에 코드 품질 검증을 수행해야 한다.

**REQ-002**: 시스템은 **항상** 배포 상태를 실시간으로 모니터링하고 대시보드에 표시해야 한다.

**REQ-003**: 시스템은 **항상** 에러 발생 시 자동으로 에러 추적 시스템에 로그를 기록해야 한다.

**REQ-004**: 시스템은 **항상** Service Worker 버전을 배포 ID와 자동으로 동기화해야 한다.

### Event-Driven Requirements

**REQ-005**: **WHEN** 개발자가 코드를 커밋하려고 시도하면, **THEN** 시스템은 pre-commit hook을 통해 린트, 타입 체크, 포맷팅을 검증해야 한다.

**REQ-006**: **WHEN** 코드가 master 브랜치에 푸시되면, **THEN** 시스템은 자동으로 CI/CD 파이프라인을 시작해야 한다.

**REQ-007**: **WHEN** CI/CD 파이프라인이 시작되면, **THEN** 시스템은 다음 단계를 순차적으로 실행해야 한다:

1. 의존성 설치
2. 린트 및 타입 체크
3. 단위 테스트 (85%+ 커버리지)
4. E2E 테스트 (크리티컬 플로우)
5. 보안 스캔
6. 빌드
7. Preview 배포

**REQ-008**: **WHEN** Preview 배포가 완료되면, **THEN** 시스템은 Vercel Preview URL을 PR에 코멘트로 추가해야 한다.

**REQ-009**: **WHEN** PR이 master에 머지되면, **THEN** 시스템은 Gradual Rollout 프로세스를 시작해야 한다.

**REQ-010**: **WHEN** 에러율이 임계값(5%)을 초과하면, **THEN** 시스템은 자동으로 이전 버전으로 롤백하고 알림을 발송해야 한다.

**REQ-011**: **WHEN** 헬스 체크가 3회 연속 실패하면, **THEN** 시스템은 알림을 발송하고 인시던트를 생성해야 한다.

### State-Driven Requirements

**REQ-012**: **IF** 테스트 커버리지가 85% 미만이면, **THEN** 시스템은 배포를 차단하고 커버리지 리포트를 출력해야 한다.

**REQ-013**: **IF** 린트 에러가 존재하면, **THEN** 시스템은 커밋을 거부하고 에러 목록을 표시해야 한다.

**REQ-014**: **IF** 타입 에러가 존재하면, **THEN** 시스템은 빌드를 중단하고 타입 에러를 표시해야 한다.

**REQ-015**: **IF** Feature Flag가 활성화된 기능이면, **THEN** 시스템은 해당 기능을 지정된 사용자 비율에만 노출해야 한다.

**REQ-016**: **IF** 카나리 배포 단계에서 에러율이 정상이면, **THEN** 시스템은 다음 단계로 자동 진행해야 한다.

**REQ-017**: **IF** 롤백이 요청되면, **THEN** 시스템은 1분 이내에 이전 안정 버전으로 복구해야 한다.

### Optional Requirements

**REQ-018**: **WHERE** 가능하면, 다중 리전 배포를 통해 가용성을 높여야 한다.

**REQ-019**: **WHERE** 예산이 허용하면, Slone 통합 알림을 설정해야 한다.

**REQ-020**: **WHERE** 시간이 허용하면, 데이터베이스 마이그레이션 자동화를 구현해야 한다.

### Unwanted Behavior Requirements

**REQ-021**: 시스템은 테스트 실패 시 배포를 진행해서는 **안 된다**.

**REQ-022**: 시스템은 보안 취약점이 발견된 경우 배포를 진행해서는 **안 된다**.

**REQ-023**: 시스템은 Service Worker 캐시 버전을 수동으로 업데이트하게 해서는 **안 된다**.

**REQ-024**: 시스템은 프로덕션 환경에서 console.log를 노출해서는 **안 된다**.

**REQ-025**: 시스템은 민감한 정보(API 키, 시크릿)를 로그에 노출해서는 **안 된다**.

## Constraints

### Technical Constraints

| Constraint                          | Value | Rationale      |
| ----------------------------------- | ----- | -------------- |
| GitHub Actions 워크플로우 최대 시간 | 30분  | 무료 티어 제한 |
| Vercel 빌드 타임아웃                | 45분  | 플랫폼 제한    |
| 테스트 타임아웃                     | 10분  | 빠른 피드백    |
| E2E 테스트 최대 시간                | 5분   | CI 효율성      |
| 롤백 최대 시간                      | 1분   | MTTR 목표      |

### Security Constraints

- 모든 시크릿은 GitHub Secrets 또는 Vercel Environment Variables 사용
- 배포 로그에 민감 정보 노출 금지
- Feature Flag 권한 검증 필수
- 롤백 권한은 관리자만 보유

### Operational Constraints

- 배포는 업무 시간에 수행 (즉시 검증 가능)
- 카나리 배포는 최소 1시간 관찰 후 진행
- 긴급 롤백은 언제든 가능
- 모든 배포는 CHANGELOG 업데이트 포함

## Specification

### Phase 1: Quality Gates Foundation (Priority High)

#### 1.1 Pre-commit Hooks (Husky)

**목표**: 커밋 전 코드 품질 검증

**구현 내용**:

```yaml
# .husky/pre-commit
- lint-staged 실행
- 타입 체크 (tsc --noEmit)
- 관련 테스트 실행
```

**설정 파일**:

- `.husky/pre-commit`: pre-commit 훅 스크립트
- `.lintstagedrc.json`: 린트 스테이징 설정
- `package.json`: husky 설정

**검증 항목**:

- ESLint 에러 0개
- TypeScript 에러 0개
- Prettier 포맷팅 준수

#### 1.2 Test Coverage Gate

**목표**: 85% 테스트 커버리지 강제

**구현 내용**:

```yaml
# vitest.config.ts
coverage:
  threshold:
    global:
      branches: 85
      functions: 85
      lines: 85
      statements: 85
```

**검증 항목**:

- 커버리지 리포트 자동 생성
- 미달 시 CI 실패
- PR에 커버리지 뱃지 표시

#### 1.3 Security Scanning

**목표**: 보안 취약점 자동 감지

**구현 내용**:

- `npm audit` 자동 실행
- Dependabot 활성화
- SAST (Static Application Security Testing)

**검증 항목**:

- Critical/High 취약점 0개
- Moderate 취약점 리포트
- Deprecation 경고 확인

### Phase 2: CI/CD Pipeline Enhancement (Priority High)

#### 2.1 GitHub Actions Workflow

**목표**: 자동화된 빌드 및 배포 파이프라인

**4-Stage Pipeline 구조**:

```
┌─────────────────────────────────────────────────────────────┐
│                     Stage 1: Quality Gates                   │
├─────────────────────────────────────────────────────────────┤
│  Pre-commit ✓ → Lint → Type Check → Unit Tests (85%+) →     │
│  E2E Tests (Critical) → Security Scan                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Stage 2: Preview Deployment                │
├─────────────────────────────────────────────────────────────┤
│  Build → Vercel Preview URL → Staging DB → Smoke Tests      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Stage 3: Gradual Rollout                   │
├─────────────────────────────────────────────────────────────┤
│  Feature Flags → Canary 10% → Monitor → Canary 50% →        │
│  Monitor → Full Rollout (100%)                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Stage 4: Production Safety                 │
├─────────────────────────────────────────────────────────────┤
│  Health Monitoring → Error Tracking → Alerting →            │
│  Rollback (<1min if needed)                                 │
└─────────────────────────────────────────────────────────────┘
```

**Workflow 파일**: `.github/workflows/ci.yml`

#### 2.2 Vercel Integration

**목표**: Vercel과 GitHub Actions 연동

**구현 내용**:

- Preview 배포 자동화
- PR 코멘트에 Preview URL 추가
- 배포 상태 동기화
- 환경 변수 관리

#### 2.3 Feature Flags Implementation

**목표**: 점진적 기능 론아웃

**구현 옵션**:

| 옵션               | 장점        | 단점        | 권장  |
| ------------------ | ----------- | ----------- | ----- |
| Vercel Edge Config | Vercel 통합 | 플랫폼 종속 | ★★★★★ |
| Flags              | 무료, 강력  | 별도 계정   | ★★★★☆ |
| Unleash            | 오픈소스    | 호스팅 필요 | ★★★☆☆ |

**선택**: Vercel Edge Config (플랫폼 통합)

**구현 패턴**:

```typescript
// lib/feature-flags.ts
import { get } from "@vercel/edge-config";

export async function isFeatureEnabled(feature: string, userId?: string): Promise<boolean> {
  const config = await get(feature);
  // 카나리 배포 로직
}
```

### Phase 3: Monitoring & Safety (Priority Medium)

#### 3.1 Error Tracking (Sentry)

**목표**: 실시간 에러 추적 및 알림

**구현 내용**:

- Sentry Next.js SDK 통합
- 소스 맵 자동 업로드
- 에러 그룹핑 및 알림
- 사용자 컨텍스트 추적

**설정 파일**:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

#### 3.2 Health Checks

**목표**: 서비스 상태 모니터링

**구현 내용**:

- `/api/health` 엔드포인트
- 데이터베이스 연결 확인
- 외부 서비스 상태 확인
- Vercel Cron Job으로 주기적 체크

**헬스 체크 응답**:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-16T00:00:00Z",
  "checks": {
    "database": "ok",
    "auth": "ok",
    "storage": "ok"
  }
}
```

#### 3.3 Alerting

**목표**: 장애 신속 감지 및 알림

**구현 내용**:

- Sentry 알림 규칙
- Vercel 배포 알림
- Slack 웹훅 연동 (선택)
- 이메일 알림

**알림 조건**:

- 에러율 > 5%
- 응답 시간 P95 > 3초
- 헬스 체크 3회 연속 실패
- 배포 실패

#### 3.4 Rollback Automation

**목표**: 1분 이내 롤백

**구현 내용**:

- Vercel CLI 롤백 스크립트
- GitHub Actions 수동 트리거
- 자동 롤백 조건 설정

**롤백 스크립트**:

```bash
# scripts/rollback.sh
vercel rollback --token=$VERCEL_TOKEN --yes
```

**자동 롤백 조건**:

- 에러율 > 10% (즉시 롤백)
- 에러율 > 5% (알림 후 수동 승인)
- 헬스 체크 5회 연속 실패 (롤백)

### Phase 4: Advanced Deployment (Priority Low)

#### 4.1 Multi-Region Deployment

**목표**: 가용성 향상

**구현 내용**:

- Vercel Edge Network 활용
- 다중 리전 활성화 (iad1, sdf1)
- 지역 기반 라우팅

**제약 사항**:

- Vercel Pro 플랜 필요
- 데이터베이스 지연 고려
- 비용 증가

#### 4.2 Database Migration Safety

**목표**: 안전한 스키마 변경

**구현 내용**:

- Firebase Firestore 규칙 버전 관리
- 마이그레이션 스크립트
- 롤백 가능한 변경
- 백업 자동화

#### 4.3 Environment Consistency

**목표**: 환경 간 일관성 보장

**구현 내용**:

- 환경 변수 검증
- 환경 설정 문서화
- 로컬 개발 환경 표준화

## Technical Approach

### Recommended Tools

| 카테고리      | 도구               | 버전    | 용도               |
| ------------- | ------------------ | ------- | ------------------ |
| Pre-commit    | Husky              | ^9.0.0  | Git hooks 관리     |
| Pre-commit    | lint-staged        | ^15.0.0 | 스테이징 파일 린트 |
| CI/CD         | GitHub Actions     | N/A     | 워크플로우 자동화  |
| Feature Flags | Vercel Edge Config | ^1.0.0  | 기능 토글          |
| Monitoring    | Sentry             | ^8.0.0  | 에러 추적          |
| Testing       | Vitest             | ^2.0.0  | 단위 테스트        |
| E2E           | Playwright         | ^1.40.0 | E2E 테스트         |
| Security      | npm audit          | N/A     | 취약점 스캔        |

### File Structure

```
todo-app/
├── .husky/
│   ├── pre-commit          # Pre-commit 훅
│   └── commit-msg          # 커밋 메시지 검증 (선택)
├── .github/
│   └── workflows/
│       ├── ci.yml          # 메인 CI/CD 파이프라인
│       ├── preview.yml     # Preview 배포
│       └── rollback.yml    # 수동 롤백
├── lib/
│   ├── feature-flags.ts    # Feature Flag 유틸리티
│   ├── sentry.ts           # Sentry 설정
│   └── health.ts           # 헬스 체크 유틸리티
├── app/
│   └── api/
│       └── health/
│           └── route.ts    # 헬스 체크 엔드포인트
├── scripts/
│   ├── rollback.sh         # 롤백 스크립트
│   └── sw-version.js       # SW 버전 자동 업데이트
├── sentry.client.config.ts # Sentry 클라이언트 설정
├── sentry.server.config.ts # Sentry 서버 설정
├── sentry.edge.config.ts   # Sentry 엣지 설정
├── .lintstagedrc.json      # lint-staged 설정
└── vercel.json             # Vercel 설정 (롤백 등)
```

## Risk Mitigation

### High Risk Areas

| Risk                  | Probability | Impact   | Mitigation            |
| --------------------- | ----------- | -------- | --------------------- |
| CI/CD 파이프라인 실패 | Medium      | High     | 수동 배포 백업 유지   |
| Feature Flag 오작동   | Low         | High     | Kill switch 구현      |
| Sentry 과도한 알림    | Medium      | Medium   | 알림 규칙 튜닝        |
| 롤백 실패             | Low         | Critical | 다중 롤백 방법 준비   |
| DB 마이그레이션 실패  | Medium      | High     | 백업 및 롤백 스크립트 |

### Rollback Procedures

#### Scenario 1: 자동 롤백 (에러율 > 10%)

1. Sentry가 에러율 급증 감지
2. 자동으로 Vercel 롤백 트리거
3. Slack/이메일 알림 발송
4. 인시던트 티켓 자동 생성

#### Scenario 2: 수동 롤백 (운영자 판단)

1. GitHub Actions에서 rollback 워크플로우 실행
2. 또는 `scripts/rollback.sh` 실행
3. 롤백 완료 확인
4. 포스트모템 진행

#### Scenario 3: Feature Flag 비활성화

1. Vercel Edge Config에서 플래그 비활성화
2. 즉시 전파 (Edge Config는 전파 시간 < 1초)
3. 사용자 영향 최소화

## Traceability

| Tag                           | Document      | Purpose     |
| ----------------------------- | ------------- | ----------- |
| SPEC-DEPLOY-STABILITY-001     | This document | 메인 명세서 |
| RESEARCH-DEPLOY-STABILITY-001 | research.md   | 탐색 결과   |
| PROGRESS-DEPLOY-STABILITY-001 | progress.md   | 진행 상황   |

## Related Documents

- [Research Document](research.md) - 탐색 결과 요약
- [Progress Tracking](progress.md) - 구현 진행 상황
- [SPEC-DEPLOY-001](../SPEC-DEPLOY-001/spec.md) - 기존 배포 설정
- [SPEC-TEST-001](../SPEC-TEST-001/spec.md) - 테스트 인프라
- [SPEC-TEST-002](../SPEC-TEST-002/spec.md) - E2E 테스트

## Success Metrics

| Metric          | Current     | Target  | Measurement      |
| --------------- | ----------- | ------- | ---------------- |
| MTTR            | 30+ min     | < 5 min | 평균 복구 시간   |
| 배포 빈도       | Weekly      | Daily   | 주당 배포 횟수   |
| 변경 실패율     | Unknown     | < 5%    | 실패한 배포 비율 |
| 테스트 커버리지 | 64.76%      | 85%+    | 커버리지 리포트  |
| 에러 감지 시간  | User report | < 1 min | Sentry 알림      |
| 롤백 시간       | 15+ min     | < 1 min | 복구 시간        |

## Next Steps

1. **Phase 1 시작**: Husky 및 pre-commit hooks 설치
2. **테스트 커버리지 향상**: 현재 64.76% → 85% 목표
3. **GitHub Actions 워크플로우 구성**: CI/CD 파이프라인 구축
4. **Sentry 통합**: 에러 추적 시스템 도입
5. **Feature Flags 구현**: Vercel Edge Config 활용
