# Todo App - 기술 스택 문서

## 기술 스택 개요

Todo App은 최신 웹 기술 스택을 기반으로 구축된 프로그레시브 웹 애플리케이션(PWA)입니다.

## 핵심 기술 스택

### 프론트엔드 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| **Next.js** | 16.1.2 | React 프레임워크 (App Router) |
| **React** | 19.2.3 | UI 라이브러리 |
| **TypeScript** | 5.x | 정적 타이핑 |

### 상태 관리

| 기술 | 버전 | 용도 |
|------|------|------|
| **Zustand** | 5.0.10 | 경량 상태 관리 라이브러리 |

### 백엔드 및 BaaS

| 기술 | 버전 | 용도 |
|------|------|------|
| **Firebase** | 12.8.0 | 백엔드 서비스 (Authentication + Firestore) |
| **Firebase Authentication** | - | 사용자 인증 (Email/Password, Google OAuth) |
| **Firebase Firestore** | - | NoSQL 문서 데이터베이스 |

### 스타일링

| 기술 | 버전 | 용도 |
|------|------|------|
| **Tailwind CSS** | 4.x | 유틸리티 퍼스트 CSS 프레임워크 |
| **Radix UI** | - | 접근 가능한 UI 컴포넌트 라이브러리 |
| **lucide-react** | 0.562.0 | 아이콘 라이브러리 |

### PWA 및 오프라인 지원

| 기술 | 버전 | 용도 |
|------|------|------|
| **Serwist** | 9.5.0 | Service Worker 및 캐싱 전략 |
| **@serwist/next** | 9.5.0 | Next.js 전용 Serwist 통합 |

### 테스트 프레임워크

| 기술 | 버전 | 용도 |
|------|------|------|
| **Vitest** | 4.0.18 | 단위 테스트 프레임워크 |
| **@testing-library/react** | 16.3.2 | React 컴포넌트 테스트 유틸리티 |
| **@testing-library/user-event** | 14.6.1 | 사용자 상호작용 시뮬레이션 |
| **Playwright** | 1.57.0 | E2E 테스트 프레임워크 |
| **@vitest/coverage-v8** | 4.0.18 | 코드 커버리지 도구 |

### 개발 도구

| 기술 | 버전 | 용도 |
|------|------|------|
| **ESLint** | 9.x | 린팅 도구 |
| **dotenv-cli** | 11.0.0 | 환경 변수 관리 |
| **firebase-tools** | 15.7.0 | Firebase CLI 도구 |

## 라이브러리 상세 정보

### UI 컴포넌트 라이브러리

**Radix UI 컴포넌트:**
- `@radix-ui/react-checkbox` (v1.3.3): 체크박스 컴포넌트
- `@radix-ui/react-dialog` (v1.1.15): 다이얼로그/모달 컴포넌트
- `@radix-ui/react-slot` (v1.2.4): 슬롯/컴포지션 패턴 지원

**스타일링 유틸리티:**
- `class-variance-authority` (v0.7.1): CVA 패턴으로 컴포넌트 변형 관리
- `clsx` (v2.1.1): 조건부 클래스명 유틸리티
- `tailwind-merge` (v3.4.0): Tailwind 클래스 병합 유틸리티

## 개발 환경 설정

### 필수 조건

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **Firebase 프로젝트**: Firebase Console에서 프로젝트 생성 필요

### 설치 단계

```bash
# 저장소 복제
git clone https://github.com/yourusername/todo-app.git
cd todo-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 Firebase 설정 정보 입력

# 개발 서버 시작
npm run dev
```

### 환경 변수

```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 빌드 및 배포 환경

### 빌드 도구

- **Webpack**: Next.js 내장 빌드 도구
- **PostCSS**: Tailwind CSS 처리
- **Terser**: JavaScript 코드 축소

### 배포 대상

**주요 배포 대상: Vercel**
- GitHub 연동 자동 배포 (SPEC-DEPLOY-001)
- Edge Network 지원으로 글로벌 성능 최적화
- 무료 티어로 소규모 프로젝트 운영 가능

**대안 배포 대상:**
- Firebase Hosting
- Netlify
- AWS Amplify

### CI/CD 파이프라인

**GitHub Actions → Vercel 자동 배포:**
1. main 브랜치에 푸시
2. GitHub Actions 워크플로우 트리거
3. Playwright E2E 테스트 실행
4. 테스트 통과 시 Vercel에 자동 배포

## 테스트 전략

### 단위 테스트 (Vitest)

**테스트 커버리지 (현재 67.6%):**

| 카테고리 | 커버리지 | 테스트 수 |
|----------|----------|-----------|
| Store Tests | 71.42% - 100% | 6개 스토어 |
| UI Components | 95%+ | 6개 컴포넌트 |
| Todo Components | 84%+ | 4개 컴포넌트 |
| Auth Components | 88%+ | 4개 컴포넌트 |
| Team Components | 67%+ | 4개 컴포넌트 |

**테스트 명령어:**
```bash
# 단위 테스트 실행
npm run test:unit

# 커버리지 리포트 생성
npm run test:coverage
```

### E2E 테스트 (Playwright)

**테스트 범위:**
- Todo CRUD 작업
- 필터링 및 정렬
- 데이터 지속성
- 팀 협업 기능
- 인증 플로우
- 초대 관리
- 테마 전환

**테스트 명령어:**
```bash
# E2E 테스트 실행
npm run test

# UI 모드로 테스트
npm run test:ui

# 리포트 조회
npm run test:report
```

## 성능 및 보안 요구사항

### 성능 목표

**Core Web Vitals:**
- **LCP** (Largest Contentful Paint): ≤ 2.5초
- **FID** (First Input Delay): ≤ 100ms
- **CLS** (Cumulative Layout Shift): ≤ 0.1

**번들 최적화:**
- 번들 사이즈: 500KB 이하 (gzip)
- 코드 스플리팅: 라우트 기반 분할
- 트리 쉐이킹: 미사용 코드 제거

### 보안 요구사항

**OWASP Top 10 준수:**
- **A01 Injection**: 파라미터화된 쿼리 사용 (Firestore 자동 보호)
- **A02 Broken Authentication**: Firebase Auth로 인증 관리
- **A03 Data Exposure**: HTTPS 강제, 민감 데이터 암호화
- **A04 XML/JSON**: Firestore 보안 규칙으로 데이터 접근 제어
- **A05 Broken Access Control**: 역할 기반 액세스 제어 (RBAC)
- **A06 Security Misconfiguration**: 환경 변수로 비밀 관리
- **A07 XSS**: React 자동 이스케이프로 방지
- **A08 Insecure Deserialization**: 해당 사항 없음 (데이터 직렬화 미사용)
- **A09 Vulnerable Components**: 정기적 의존성 업데이트
- **A10 Logging**: 구조화된 로깅 (logger.ts)

**Firebase Security Rules:**
```javascript
// 예: Todo 컬렉션 보안 규칙
match /users/{userId}/todos/{todoId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## 기술적 제약 사항

### 브라우저 지원

**데스크톱:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

**모바일:**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### PWA 제한 사항

**iOS 제한:**
- 푸시 알림 미지원
- 배지 API 제한적 지원
- 설치 환경이 데스크톱과 상이

**Android:**
- 전체 PWA 기능 지원
- 푸시 알림 가능 (Firebase Cloud Messaging)

## 운영 및 모니터링

### Firebase Emulator (로컬 개발)

```bash
# Firebase Emulator 시작
npm run emulators

# 데이터 내보내기
npm run emulators:export

# 데이터 가져오기
npm run emulators:import
```

### 로깅 전략

**개발 환경:**
- 콘솔 로그 활성화
- 상세한 에러 메시지

**프로덕션 환경:**
- 조건부 로깅 (logger.ts)
- 에러 추적 (추후 Sentry 도입 예정)
- 사용자 행동 추적 (추후 Google Analytics 도입 예정)

### 성능 모니터링

**현재:**
- Firebase Performance Monitoring (고려 중)
- Vercel Analytics (배포 대상에 따라)

**계획:**
- Core Web Vitals 모니터링
- 사용자 세션 추적
- 에러율 모니터링

## 향후 기술 로드맵

### 단기 (3개월)
- [ ] Sentry 도입으로 에러 추적
- [ ] Google Analytics 도입으로 사용자 행동 분석
- [ ] Playwright 커버리지 80% 이상 향상

### 중기 (6개월)
- [ ] Firebase Performance Monitoring 도입
- [ ] 번들 사이즈 30% 감소
- [ ] 이미지 최적화 (next/image 도입)

### 장기 (12개월 이상)
- [ ] 마이크로프론트엔드 아키텍처 검토
- [ ] GraphQL 도입 검토 (Apollo Client)
- [ ] 상태 관리 재검토 (Recoil vs Zustand)

## 기술 부채 및 리팩토링 계획

### 현재 기술 부채

1. **테스트 커버리지**: 67.6% → 80% 목표
2. **타입 안전성**: Firebase 데이터 타입 검증 강화 필요
3. **에러 핸들링**: 글로벌 에러 바운더리 도입 필요
4. **로그 시스템**: 구조화된 로깅 강화 필요

### 리팩토링 우선순위

1. **높음**: E2E 테스트 커버리 확대
2. **높음**: 에러 핸들링 시스템 도입
3. **중간**: Firebase 보안 규칙 개선
4. **중간**: 번들 사이즈 최적화
5. **낮음**: 상태 관리 라이브러리 재검토

## 의존성 관리

### 정기 업데이트 주기
- **주간**: npm check로 취약점 확인
- **월간**: 패치 버전 업데이트
- **분기별**: 마이너 버전 업데이트 검토
- **연간**: 메이저 버전 업데이트 계획

### 보안 취약점 대응
- `npm audit`로 정기적 검사
- 취약점 발견 시 즉시 업데이트
- 보안 권고 모니터링

---

Last Updated: 2026-03-16
