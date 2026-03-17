# SPEC: GitHub Actions Workflow Fix

**SPEC-ID**: SPEC-GITHUB-WORKFLOW-FIX-001
**Status**: Draft
**Created**: 2026-03-17
**Priority**: High
**Related**: REQ-002, REQ-011

---

## Problem Statement

GitHub Actions 워크플로우 `Deployment Alerts and Monitoring`의 `Health Check Monitoring` Job이 지속적으로 실패함.

**Error Context**:
- Workflow: `.github/workflows/alerts.yml`
- Failed Job: `Health Check Monitoring`
- Failure Time: 4 seconds

---

## Root Cause Analysis

### Issue 1: Client-Side Method in Server Context

**Location**: `src/app/api/health/route.ts:57`

```typescript
await auth.authStateReady();  // CLIENT-SIDE ONLY METHOD
```

**Problem**: `authStateReady()`는 Firebase Client SDK의 클라이언트 전용 메서드입니다. Edge Runtime에서 실행되면 다음과 같은 오류가 발생합니다:

```
TypeError: auth.authStateReady is not a function
```

### Issue 2: Edge Runtime Firebase Limitations

**Location**: `src/app/api/health/route.ts:141`

```typescript
export const runtime = "edge";
```

**Problem**: Firebase Client SDK는 Edge Runtime에서 완전히 지원되지 않습니다. 특히:
- `getAuth()` 클라이언트 메서드는 브라우저 환경에서만 완전히 동작
- `authStateReady()`는 Auth 인스턴스가 초기화된 후에만 사용 가능

### Issue 3: Workflow URL Fallback

**Location**: `.github/workflows/alerts.yml:32`

```yaml
VERCEL_URL: ${{ github.event.deployment_status.target_url || 'https://todo-app.vercel.app' }}
```

**Problem**: 실제 프로덕션 URL이 다를 경우 헬스 체크가 잘못된 URL로 요청됨.

---

## Requirements (EARS Format)

### REQ-001: Server-Side Auth Health Check
**WHEN** 헬스 체크 엔드포인트가 호출되면,
**THEN** 시스템은 Firebase Auth 상태를 서버 컨텍스트에서 검증 가능한 방식으로 확인해야 한다.

**Acceptance Criteria**:
- [ ] `authStateReady()` 메서드 제거
- [ ] 서버 사이드 Auth 검증 로직으로 대체
- [ ] Edge Runtime 호환 방식 사용

### REQ-002: Environment Variable Validation
**WHEN** Firebase 설정이 누락되면,
**THEN** 시스템은 명확한 오류 메시지와 함께 `degraded` 상태를 반환해야 한다.

**Acceptance Criteria**:
- [ ] 필수 환경 변수 존재 여부 확인
- [ ] 누락 시 `degraded` 상태 반환
- [ ] 로그에 구체적인 누락 변수명 기록

### REQ-003: Simplified Health Check
**WHEN** 외부 서비스(Firebase) 의존성이 높으면,
**THEN** 시스템은 기본적인 앱 상태 확인을 먼저 수행하고, 외부 서비스는 선택적으로 확인해야 한다.

**Acceptance Criteria**:
- [ ] 기본 앱 상태 (HTTP 200) 우선 확인
- [ ] Firebase 연결은 보조 체크로 수행
- [ ] 연결 실패 시에도 기본 상태는 반환

### REQ-004: Workflow Reliability
**WHEN** 헬스 체크 워크플로우가 실행되면,
**THEN** 모든 Job이 안정적으로 완료되거나 명확한 실패 이유를 제공해야 한다.

**Acceptance Criteria**:
- [ ] `Health Check Monitoring` Job 성공
- [ ] `Verify PR Deployment` Job 정상 실행
- [ ] `Monitor Deployment Status` Job 정상 실행

---

## Technical Approach

### Phase 1: Fix Health Endpoint (Priority: Critical)

**File**: `src/app/api/health/route.ts`

**Changes**:
1. `authStateReady()` 제거 → 환경 변수 검증으로 대체
2. Edge Runtime 호환 Firestore 체크 유지
3. 에러 핸들링 강화

**New Implementation**:
```typescript
// Replace authStateReady() with env-based check
async function checkAuth(): Promise<"ok" | "error"> {
  try {
    // Server-side: verify auth config exists
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      return "error";
    }
    return "ok";
  } catch (error) {
    return "error";
  }
}
```

### Phase 2: Workflow Verification (Priority: High)

**File**: `.github/workflows/alerts.yml`

**Changes**:
1. VERCEL_URL 검증 로직 추가
2. 실패 시 재시도 메커니즘 추가
3. 타임아웃 설정 최적화

### Phase 3: Testing (Priority: Medium)

**Tests Required**:
1. Unit test for health endpoint
2. Integration test with Firebase mock
3. E2E test for workflow execution

---

## Implementation Plan

| Step | Task | File | Priority |
|------|------|------|----------|
| 1 | Fix checkAuth() method | `src/app/api/health/route.ts` | Critical |
| 2 | Add error handling | `src/app/api/health/route.ts` | Critical |
| 3 | Add workflow retry logic | `.github/workflows/alerts.yml` | High |
| 4 | Add unit tests | `src/app/api/health/route.test.ts` | Medium |
| 5 | Verify workflow execution | GitHub Actions | Medium |

---

## Success Criteria

1. **Health Check Job**: 3회 연속 성공
2. **All Workflow Jobs**: 정상 완료 (Success/Skipped 아님)
3. **Health Endpoint**: HTTP 200 응답, `status: "healthy"` 반환
4. **No Regressions**: 기존 기능 정상 동작

---

## Rollback Plan

수정 후 문제 발생 시:
1. `route.ts`를 기존 구현으로 복원
2. 워크플로우 수동 트리거로 검증
3. Firebase 콘솔에서 서비스 상태 확인

---

## References

- Firebase Auth Server-Side: https://firebase.google.com/docs/auth/admin
- Next.js Edge Runtime: https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes
- GitHub Actions Workflows: https://docs.github.com/en/actions/using-workflows
