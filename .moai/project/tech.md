# Todo App - 기술 문서

## 기술 스택 개요

### 핵심 기술

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 언어 | TypeScript | 5.x | 타입 안전성 및 개발 생산성 |
| 프레임워크 | Next.js | 16.1.2 | React 프레임워크 (App Router) |
| UI 라이브러리 | React | 19.2.3 | 사용자 인터페이스 |
| 상태 관리 | Zustand | 5.0.10 | 클라이언트 상태 관리 |
| 백엔드 | Firebase | 12.8.0 | 인증 및 데이터베이스 |
| 스타일링 | Tailwind CSS | 4.x | 유틸리티 기반 CSS |
| UI 컴포넌트 | Radix UI | - | 접근성 있는 UI 프리미티브 |
| 테스트 | Playwright | 1.57.0 | E2E 테스트 |
| PWA | Serwist | 9.5.0 | 서비스 워커 및 오프라인 지원 |

## 프레임워크 및 라이브러리 선택 이유

### Next.js 16 (App Router)

**선택 이유:**
- **App Router**: 파일 기반 라우팅과 레이아웃 시스템으로 코드 구조화 용이
- **React Server Components**: 서버 사이드 렌더링 성능 최적화
- **내장 최적화**: 이미지, 폰트, 스크립트 자동 최적화
- **API Routes 불필요**: Firebase를 백엔드로 사용하여 별도 API 불필요

**주요 설정:**
```typescript
// next.config.ts
import withSerwist from "@serwist/next";

const nextConfig = {};
export default withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
})(nextConfig);
```

### React 19

**선택 이유:**
- **Concurrent Features**: 향상된 렌더링 성능
- **Automatic Batching**: 상태 업데이트 자동 배치
- **Transitions API**: 부드러운 UI 전환
- **Next.js 16 호환성**: 최신 Next.js와 완벽 호환

### Zustand 5

**선택 이유:**
- **간결한 API**: Redux 대비 보일러플레이트 최소화
- **TypeScript 친화적**: 타입 추론 우수
- **미들웨어 지원**: persist 미들웨어로 로컬 저장소 동기화
- **번들 크기**: 약 1KB로 매우 가벼움

**구현 패턴:**
```typescript
// 스토어 생성 패턴
export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      addTodo: async (params) => { /* ... */ },
      // ...
    }),
    {
      name: 'todo-storage',
      partialize: (state) => ({ /* 영속화할 상태 */ }),
    }
  )
);
```

### Firebase (Authentication + Firestore)

**선택 이유:**
- **서버리스**: 백엔드 인프라 관리 불필요
- **실시간 동기화**: Firestore 실시간 리스너로 즉각적인 UI 반영
- **인증 통합**: 다양한 인증 제공자 (이메일, Google) 지원
- **확장성**: 사용량에 따른 자동 스케일링
- **오프라인 지원**: Firestore 오프라인 캐싱

**데이터 구조:**
```
Firestore Database
├── users/
│   └── {userId}/
│       ├── todos/
│       │   └── {todoId}/
│       │       ├── title: string
│       │       ├── description: string?
│       │       ├── completed: boolean
│       │       ├── priority: 'high' | 'medium' | 'low'
│       │       ├── startDate: timestamp?
│       │       ├── endDate: timestamp?
│       │       ├── createdAt: timestamp
│       │       └── updatedAt: timestamp
│       ├── presets/
│       │   └── {presetId}/
│       │       ├── title: string
│       │       └── createdAt: timestamp
│       └── teamMemberships/
│           └── {teamId}/
│               ├── teamName: string
│               ├── role: TeamRole
│               └── joinedAt: timestamp
│
└── teams/
    └── {teamId}/
        ├── name: string
        ├── description: string?
        ├── ownerId: string
        ├── memberCount: number
        ├── settings: TeamSettings
        ├── createdAt: timestamp
        └── members/
            └── {userId}/
                ├── role: TeamRole
                ├── displayName: string
                ├── email: string
                └── joinedAt: timestamp
```

### Tailwind CSS 4

**선택 이유:**
- **유틸리티 우선**: 빠른 스타일링과 일관된 디자인 시스템
- **JIT 컴파일**: 필요한 스타일만 생성하여 번들 최소화
- **다크 모드**: `dark:` 프리픽스로 간편한 다크 모드 구현
- **반응형**: `sm:`, `md:`, `lg:` 프리픽스로 손쉬운 반응형 디자인

### Radix UI

**선택 이유:**
- **접근성**: WCAG 표준 준수 UI 컴포넌트
- **헤드리스**: 스타일 커스터마이징 자유도 높음
- **구성 요소**: Dialog, Checkbox, Slot 등 필수 컴포넌트 제공

**사용 컴포넌트:**
- `@radix-ui/react-checkbox`: 체크박스
- `@radix-ui/react-dialog`: 모달/다이얼로그
- `@radix-ui/react-slot`: 컴포넌트 합성

### Playwright

**선택 이유:**
- **크로스 브라우저**: Chromium, Firefox, WebKit 지원
- **자동 대기**: 요소 로딩 자동 대기
- **병렬 실행**: 테스트 병렬 실행으로 빠른 피드백
- **디버깅 도구**: UI 모드, 트레이스 뷰어

### Serwist (PWA)

**선택 이유:**
- **Next.js 통합**: `@serwist/next`로 간편한 PWA 설정
- **서비스 워커**: 오프라인 지원 및 캐싱 전략
- **자동 업데이트**: 새 버전 자동 감지 및 업데이트

## 개발 환경 요구사항

### 필수 도구

| 도구 | 최소 버전 | 권장 버전 |
|------|----------|----------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.x | 최신 |

### 권장 IDE/에디터

- **Visual Studio Code** 권장
- 필수 확장:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Playwright Test for VSCode

### 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정합니다:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 빌드 및 배포

### 개발 서버

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev
```

### 프로덕션 빌드

```bash
# 프로덕션 빌드 (Webpack 사용)
npm run build

# 프로덕션 서버 실행
npm run start
```

### 테스트 실행

```bash
# E2E 테스트 실행
npm run test

# UI 모드로 테스트 실행
npm run test:ui

# 테스트 리포트 확인
npm run test:report
```

### 배포 설정

**Vercel 배포 (권장):**
1. GitHub 저장소 연결
2. 프레임워크 프리셋: Next.js 자동 감지
3. 환경 변수 설정: Firebase 키 입력
4. 빌드 설정: 기본값 사용

**Firebase 호스팅:**
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인 및 초기화
firebase login
firebase init hosting

# 배포
npm run build
firebase deploy --only hosting
```

## PWA 설정

### Web App Manifest

`src/app/manifest.ts`에서 PWA 매니페스트를 동적으로 생성합니다:

```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Todo App - 할 일 관리',
    short_name: 'Todo',
    description: '할 일을 관리하세요',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    // ...
  }
}
```

### 서비스 워커

`src/app/sw.ts`에서 서비스 워커를 정의하고, `@serwist/next`가 `public/sw.js`로 컴파일합니다.

### 앱 설치

- **모바일**: "홈 화면에 추가" 프롬프트
- **데스크톱**: 주소창 설치 아이콘

## 코드 품질

### ESLint 설정

`eslint.config.mjs`에서 Next.js 권장 규칙을 사용합니다.

```bash
# 린트 실행
npm run lint
```

### TypeScript 설정

`tsconfig.json`에서 엄격한 타입 검사를 적용합니다:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 성능 최적화

### 적용된 최적화

1. **코드 분할**: Next.js 자동 코드 스플리팅
2. **이미지 최적화**: Next.js Image 컴포넌트
3. **폰트 최적화**: `next/font` 로컬 폰트
4. **상태 분리**: Zustand 스토어별 독립적 구독
5. **캐싱**: 서비스 워커 캐싱 전략

### 번들 크기

- **Zustand**: ~1KB (gzip)
- **Firebase**: 선택적 import로 최소화
- **Radix UI**: 사용 컴포넌트만 번들링

---

마지막 업데이트: 2026-01-25
