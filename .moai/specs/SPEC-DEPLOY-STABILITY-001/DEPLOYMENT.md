# 배포 안정성 가이드

이 문서는 Todo 애플리케이션의 안정적인 배포를 위한 절차, 체크리스트, 문제 해결 방법을 설명합니다.

---

## 목차

1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [환경 변수 설정](#환경-변수-설정)
3. [배포 절차](#배포-절차)
4. [롤백 절차](#롤백-절차)
5. [피처 플래그 사용](#피처-플래그-사용)
6. [모니터링 및 알림](#모니터링-및-알림)
7. [문제 해결](#문제-해결)

---

## 배포 전 체크리스트

### 코드 품질

- [ ] 모든 테스트 통과 (`npm test`)
- [ ] Lint 오류 없음 (`npm run lint`)
- [ ] TypeScript 타입 검사 통과 (`npm run type-check`)
- [ ] 빌드 성공 (`npm run build`)

### 환경 설정

- [ ] `.env.example`에 모든 필수 환경 변수 포함
- [ ] Vercel 프로젝트 설정에 환경 변수 구성됨
- [ ] Firebase 프로젝트 설정 확인됨
- [ ] Sentry DSN 설정됨 (프로덕션)

### 데이터베이스

- [ ] 마이그레이션 스크립트 준비됨
- [ ] 마이그레이션 테스트 완료됨
- [ ] 백업 계획 확인됨

### 보안

- [ ] 민감 정보가 코드에 노출되지 않음
- [ ] API 키가 환경 변수로 관리됨
- [ ] CORS 설정 올바름
- [ ] 보안 헤더 설정 확인됨

### 문서

- [ ] CHANGELOG.md 업데이트됨
- [ ] 배포 노트 작성됨
- [ ] 롤백 절차 확인됨

---

## 환경 변수 설정

### 필수 환경 변수

```bash
# Firebase (필수)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Sentry (프로덕션 권장)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Vercel 환경 변수 설정

1. Vercel 프로젝트 대시보드 접속
2. Settings → Environment Variables
3. 각 변수 추가하고 적절한 환경 선택 (Production, Preview, Development)

### 환경 변수 유효성 검사

앱 시작 시 `src/lib/env.ts`가 자동으로 환경 변수를 검증합니다.

```typescript
// 개발 환경: 누락된 변수를 경고로 표시
// 프로덕션 환경: 누락된 변수가 있으면 시작 차단
```

---

## 배포 절차

### 1. 사전 배포 준비

```bash
# 1. 최신 상태 확인
git pull origin main

# 2. 테스트 실행
npm test

# 3. 빌드 테스트
npm run build

# 4. Lint 검사
npm run lint
```

### 2. Vercel에 배포

#### GitHub 통합 배포 (권장)

```bash
# 1. 변경 사항 커밋
git add .
git commit -m "chore: release v1.0.0"

# 2. GitHub에 푸시
git push origin main

# 3. Vercel에서 자동 배포 진행됨
# 4. 배포 상태 확인: https://vercel.com/dashboard
```

#### CLI 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod

# 배포 상태 확인
vercel ls
```

### 3. 배포 후 검증

```bash
# 1. 배포된 URL 접속
# 2. 주요 기능 테스트
# 3. Firebase 연결 확인
# 4. Sentry 에러 확인
# 5. 성능 모니터링 확인
```

---

## 롤백 절차

### 롤백 결정 기준

다음 경우에 롤백 고려:

- 치명적인 버그 발견
- 데이터 손실 발생
- 보안 취약점 발견
- 성능 심각 저하

### Vercel 롤백 방법

#### 방법 1: 대시보드에서 롤백

1. Vercel 프로젝트 대시보드 접속
2. Deployments 탭 클릭
3. 이전 성공한 배포 선택
4. "Promote to Production" 클릭

#### 방법 2: CLI 롤백

```bash
# 최근 배포 목록 확인
vercel ls

# 특정 배프롤 프로덕션으로 승격
vercel promote <deployment-url> --scope <team>

# 또는 Git을 통한 롤백
git revert HEAD
git push origin main
```

#### 방법 3: Git 태그 롤백

```bash
# 이전 태그로 체크아웃
git checkout v1.0.0

# 새 브랜치 생성 및 푸시
git checkout -b rollback-to-v1.0.0
git push origin rollback-to-v1.0.0

# Vercel에서 자동 배포됨
```

### 데이터베이스 롤백

```typescript
// 마이그레이션 롤백 실행
import { getMigrationRunner } from "@/lib/migrations";

const runner = getMigrationRunner();
await runner.rollback("20250101_initial_schema");
```

---

## 피처 플래그 사용

### Firebase Remote Config

피처 플래그를 통해 기능을 안전하게 롤아웃하세요.

#### 설정 방법

```typescript
// Remote Config 초기화
import { getRemoteConfig } from "firebase/remote-config";

const remoteConfig = getRemoteConfig();
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1시간
  fetchTimeoutMillis: 60000,
};

// 피처 플래그 확인
async function isFeatureEnabled(featureName: string): Promise<boolean> {
  await remoteConfig.fetchAndActivate();
  return remoteConfig.getValue(featureName).asBoolean();
}
```

#### 사용 예시

```typescript
// 새로운 에디터 기능 롤아웃
const isNewEditorEnabled = await isFeatureEnabled('new_editor_enabled')

if (isNewEditorEnabled) {
  return <NewEditor />
} else {
  return <LegacyEditor />
}
```

### 점진적 롤아웃 전략

1. **내부 테스트**: 5% 사용자 대상
2. **베타 테스트**: 25% 사용자 대상
3. **전체 롤아웃**: 100% 사용자 대상

---

## 모니터링 및 알림

### Sentry 에러 추적

```typescript
// Sentry 초기화 (sentry.client.config.ts)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Vercel Analytics

```typescript
// Vercel Speed Insights
import { Analytics } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Slack 알림 설정

```typescript
// 배포 성공 알림
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "✅ 배포 성공: v1.0.0",
    attachments: [
      {
        title: "배포 상세",
        fields: [
          { title: "버전", value: "v1.0.0", short: true },
          { title: "환경", value: "production", short: true },
        ],
      },
    ],
  }),
});
```

---

## 문제 해결

### 빌드 실패

**증상**: Vercel에서 빌드 실패

**원인**:

- 의존성 충돌
- 환경 변수 누락
- TypeScript 오류

**해결**:

```bash
# 로컬에서 빌드 재현
npm run build

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 오류 확인
npm run type-check
```

### 환경 변수 오류

**증상**: 앱 시작 후 환경 변수 관련 오류

**원인**:

- 필수 환경 변수 누락
- 타입 불일치

**해결**:

```bash
# .env.example으로 .env.local 생성
cp .env.example .env.local

# Vercel 환경 변수 확인
vercel env pull .env.local
```

### Firebase 연결 오류

**증상**: Firebase 인증/데이터베이스 오류

**원인**:

- Firebase 설정 오류
- 인증 만료
- CORS 문제

**해결**:

```typescript
// Firebase 설정 확인
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Firebase 콘솔에서 인증 설정 확인
```

### Sentry가 오류를 수집하지 않음

**증상**: Sentry 대시보드에 오류 표시 안 됨

**원인**:

- DSN 설정 오류
- 필터링 규칙
- 네트워크 문제

**해결**:

```typescript
// Sentry 초기화 확인
console.log("Sentry DSN:", process.env.NEXT_PUBLIC_SENTRY_DSN);

// 테스트 오류 발생
Sentry.captureException(new Error("Sentry test"));
```

---

## 참고 자료

- [Vercel 문서](https://vercel.com/docs)
- [Firebase 문서](https://firebase.google.com/docs)
- [Sentry 문서](https://docs.sentry.io)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

---

**최종 업데이트**: 2026-03-16
**버전**: 1.0.0
