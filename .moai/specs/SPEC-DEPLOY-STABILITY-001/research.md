# Research Document: SPEC-DEPLOY-STABILITY-001

---

spec_id: SPEC-DEPLOY-STABILITY-001
title: Deployment Stability Enhancement - Research Summary
created: 2026-03-16
research_type: Codebase Exploration

---

## Executive Summary

이 문서는 SPEC-DEPLOY-STABILITY-001의 탐색 결과를 요약합니다. 배포 안정성 향상을 위한 현재 시스템 분석과 개선 방안을 포함합니다.

## Current State Analysis

### 1. Deployment Architecture

**Current Configuration**:

- Platform: Vercel
- Region: iad1 (US East) only
- Branch: master → Production
- Preview: Enabled for PRs

**Issues Identified**:

1. Single region deployment creates SPOF (Single Point of Failure)
2. No automated rollback mechanism
3. Manual cache management for Service Worker
4. No feature flag system

### 2. CI/CD Pipeline Status

**Existing Automation**:

- Firebase Functions: Automated deployment via GitHub Actions
- Main Next.js App: Direct Vercel integration (no quality gates)

**Missing Components**:

- Pre-commit hooks
- Automated testing in pipeline
- Security scanning
- Coverage enforcement
- Preview environment testing

### 3. Test Coverage Analysis

**Current Metrics**:

- Overall Coverage: 64.76%
- Target Coverage: 85%
- Gap: 20.24 percentage points

**Coverage by Category**:
| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Unit Tests | 64.76% | 85% | -20.24% |
| Integration Tests | Limited | Required | N/A |
| E2E Tests | Playwright | Expanded | N/A |

### 4. Monitoring Status

**Current State**:

- Error Tracking: None
- Health Checks: None
- Alerting: None
- Performance Monitoring: None

**Recommended Solution**:

- Sentry for error tracking
- Custom health check endpoint
- Vercel Analytics for performance
- Slack/Email alerts

### 5. Feature Flag System

**Current State**: Not implemented

**Recommended Approach**:

- Vercel Edge Config for feature flags
- Simple boolean flags for gradual rollout
- Percentage-based rollout support
- Kill switch capability

## Technology Recommendations

### Pre-commit Hooks

**Recommended Stack**:

- Husky v9 - Git hooks management
- lint-staged v15 - Run linters on staged files
- commitlint (optional) - Conventional commits enforcement

**Configuration Example**:

```json
{
  "hooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "commitlint --edit $1"
  }
}
```

### CI/CD Pipeline

**Recommended 4-Stage Pipeline**:

**Stage 1: Quality Gates**

- Pre-commit validation
- Lint check (ESLint)
- Type check (TypeScript)
- Unit tests with coverage (85%+)
- E2E tests (critical flows)
- Security scan (npm audit)

**Stage 2: Preview Deployment**

- Build Next.js application
- Deploy to Vercel Preview
- Run smoke tests
- Update staging database (if needed)

**Stage 3: Gradual Rollout**

- Feature flags check
- Canary deployment (10% → 50% → 100%)
- Monitor error rates
- Auto-promote or rollback

**Stage 4: Production Safety**

- Health monitoring
- Error tracking
- Alerting
- Quick rollback (<1 min)

### Monitoring Stack

**Error Tracking - Sentry**:

- Capture all unhandled exceptions
- Performance monitoring
- Release tracking
- Source maps for debugging

**Health Checks**:

- Custom `/api/health` endpoint
- Database connectivity check
- External service status
- Vercel Cron for periodic checks

**Alerting**:

- Error rate > 5%
- Response time P95 > 3s
- Health check failures
- Deployment status

### Feature Flags

**Vercel Edge Config**:

- Sub-second propagation
- No database required
- Native Vercel integration
- TypeScript support

**Implementation Pattern**:

```typescript
// lib/feature-flags.ts
import { get } from "@vercel/edge-config";

export async function isFeatureEnabled(feature: string, userId?: string): Promise<boolean> {
  const config = await get(feature);
  // Support boolean or percentage-based
  return typeof config === "boolean" ? config : checkPercentage(config, userId);
}
```

## Risk Assessment

### High Priority Risks

1. **CI/CD Pipeline Failure**
   - Risk: New pipeline breaks existing deployment flow
   - Mitigation: Keep manual deployment as fallback

2. **Feature Flag Misconfiguration**
   - Risk: Features accidentally enabled/disabled
   - Mitigation: Kill switch and audit logging

3. **Rollback Failure**
   - Risk: Cannot recover from bad deployment
   - Mitigation: Multiple rollback methods, automated testing

4. **Sentry Over-alerting**
   - Risk: Alert fatigue from noisy notifications
   - Mitigation: Tune alert thresholds, grouping rules

### Medium Priority Risks

5. **Coverage Enforcement Too Strict**
   - Risk: Blocks valid PRs for edge cases
   - Mitigation: Allow exemptions with justification

6. **Database Migration Conflicts**
   - Risk: Schema changes break existing code
   - Mitigation: Backward-compatible migrations

## Implementation Dependencies

### Phase 1 Dependencies

| Dependency      | Version | Purpose                           |
| --------------- | ------- | --------------------------------- |
| husky           | ^9.0.0  | Git hooks                         |
| lint-staged     | ^15.0.0 | Staged file linting               |
| @commitlint/cli | ^18.0.0 | Commit message linting (optional) |

### Phase 2 Dependencies

| Dependency          | Version | Purpose        |
| ------------------- | ------- | -------------- |
| @sentry/nextjs      | ^8.0.0  | Error tracking |
| @vercel/edge-config | ^1.0.0  | Feature flags  |
| @playwright/test    | ^1.40.0 | E2E testing    |

### Phase 3 Dependencies

| Dependency | Version | Purpose          |
| ---------- | ------- | ---------------- |
| sentry-cli | ^2.0.0  | Sentry releases  |
| vercel     | ^33.0.0 | CLI for rollback |

## Cost Estimation

### Free Tier Limits

| Service        | Free Tier         | Expected Usage  | Upgrade Needed? |
| -------------- | ----------------- | --------------- | --------------- |
| GitHub Actions | 2000 min/month    | ~500 min/month  | No              |
| Vercel         | 100GB bandwidth   | ~10GB/month     | No              |
| Sentry         | 5K errors/month   | ~1K/month       | No              |
| Playwright     | N/A (self-hosted) | CI minutes only | No              |

### Estimated Monthly Costs

With free tiers:

- GitHub Actions: $0
- Vercel: $0 (Pro if multi-region: $20)
- Sentry: $0
- **Total: $0**

With upgrades:

- Multi-region: +$20/month
- Sentry Team: +$26/month
- **Total: $46/month**

## Timeline Estimation

| Phase   | Duration  | Milestones                         |
| ------- | --------- | ---------------------------------- |
| Phase 1 | Week 1    | Pre-commit hooks, coverage gate    |
| Phase 2 | Weeks 2-4 | CI/CD pipeline, Preview deployment |
| Phase 3 | Month 2   | Monitoring, alerts, rollback       |
| Phase 4 | Month 3+  | Multi-region, advanced features    |

## Success Criteria

### Phase 1 Success Criteria

- [ ] Pre-commit hooks block lint errors
- [ ] Test coverage enforced at 85%
- [ ] Security scan runs on every PR

### Phase 2 Success Criteria

- [ ] Full CI/CD pipeline operational
- [ ] Preview deployments auto-generated
- [ ] Feature flags implemented

### Phase 3 Success Criteria

- [ ] Error tracking active (Sentry)
- [ ] Health checks operational
- [ ] Rollback < 1 minute

### Phase 4 Success Criteria

- [ ] Multi-region deployment (optional)
- [ ] Database migration automation (optional)
- [ ] Full observability stack

## References

### Documentation

- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Edge Config](https://vercel.com/docs/storage/edge-config)

### Best Practices

- [Google DORA Metrics](https://dora.dev/)
- [The Twelve-Factor App](https://12factor.net/)
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)

## Appendix: Current Configuration Files

### package.json (relevant scripts)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### Current Test Coverage Report

```
Coverage: 64.76%
Statements: 64.76%
Branches: 58.32%
Functions: 61.45%
Lines: 65.01%
```

### Vercel Configuration (inferred)

- Framework: Next.js 16.1.2
- Build Command: npm run build
- Output Directory: .next
- Install Command: npm install
