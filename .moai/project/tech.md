# Todo App - 기술 스택

## 개요

이 문서는 Todo App 프로젝트의 기술 선택, 의존성, 기술 아키텍처를 설명합니다.

---

## 핵심 기술 스택

| 레이어 | 기술 | 버전 |
|--------|------|------|
| **프레임워크** | Next.js | 16.1.2 |
| **UI 라이브러리** | React | 19.2.3 |
| **언어** | TypeScript | 5.x |
| **스타일링** | Tailwind CSS | 4.x |
| **상태 관리** | Zustand | 5.0.10 |
| **백엔드** | Firebase | 12.8.0 |
| **테스팅** | Playwright | 1.57.0 |

---

## 프론트엔드 스택

### Next.js 16 (App Router)

**선택 이유**: Next.js는 내장 라우팅, 서버 사이드 렌더링 기능, 최적화된 프로덕션 빌드를 제공하는 강력한 React 프레임워크입니다.

**사용 방식**:
- 파일 기반 라우팅을 위한 App Router
- 레이아웃 구성을 위한 라우트 그룹 `(auth)`
- `"use client"` 지시어를 사용한 클라이언트 컴포넌트
- 최적화된 이미지 및 폰트 처리

### React 19

**선택 이유**: 향상된 성능과 동시성 기능을 갖춘 최신 React 버전입니다.

**사용 방식**:
- 전체적으로 함수형 컴포넌트 사용
- 상태 및 이펙트를 위한 훅
- 인터랙티브 UI를 위한 클라이언트 사이드 렌더링

### TypeScript 5

**선택 이유**: 타입 안전성은 런타임 오류를 줄이고 더 나은 IDE 지원으로 개발자 경험을 향상시킵니다.

**설정**:
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## 스타일링

### Tailwind CSS 4

**선택 이유**: 일관된 디자인 토큰으로 빠른 UI 개발을 가능하게 하는 유틸리티 우선 CSS 프레임워크입니다.

**사용 기능**:
- `dark:` 접두사를 통한 다크 모드
- 반응형 브레이크포인트 (`sm:`, `md:`, `lg:`)
- 커스텀 색상 팔레트
- PostCSS 통합

### Radix UI

**선택 이유**: Tailwind와 잘 통합되는 스타일이 없는 접근성 컴포넌트 기본 요소입니다.

**컴포넌트**:
| 패키지 | 목적 |
|--------|------|
| `@radix-ui/react-dialog` | 모달 다이얼로그 |
| `@radix-ui/react-checkbox` | 접근성 있는 체크박스 |
| `@radix-ui/react-slot` | 컴포넌트 합성 |

### 지원 라이브러리

| 라이브러리 | 목적 |
|------------|------|
| `clsx` | 조건부 클래스명 구성 |
| `tailwind-merge` | 지능적인 Tailwind 클래스 병합 |
| `class-variance-authority` | 컴포넌트 변형 패턴 |
| `lucide-react` | SVG 아이콘 라이브러리 |

---

## 상태 관리

### Zustand 5

**선택 이유**: Redux에 비해 최소한의 보일러플레이트로 가벼운 TypeScript 친화적인 상태 관리입니다.

**스토어**:

| 스토어 | 목적 | 지속성 |
|--------|------|--------|
| `authStore` | 사용자 인증 상태 | Firebase 세션 |
| `todoStore` | 할 일 데이터 및 작업 | localStorage + Firestore |
| `presetStore` | 프리셋 템플릿 | localStorage |
| `themeStore` | 테마 설정 | localStorage |
| `teamStore` | 팀 관리, 멤버 관리, 팀 전환 | Firestore 실시간 구독 |
| `invitationStore` | 이메일/링크 초대 시스템 | Firestore 실시간 구독 |

**패턴**:
```typescript
const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      addTodo: (todo) => set((state) => ({
        todos: [...state.todos, todo]
      })),
    }),
    { name: 'todo-storage' }
  )
)
```

---

## PWA (Progressive Web App)

### Serwist

**선택 이유**: Next.js와 원활하게 통합되는 Service Worker 라이브러리입니다.

**기능**:
| 기능 | 설명 |
|------|------|
| 오프라인 캐싱 | `defaultCache` 전략으로 자동 캐싱 |
| 앱 설치 | 홈 화면에 앱으로 설치 가능 |
| 백그라운드 동기화 | 오프라인 상태에서 작업 후 동기화 |

**설정 파일**:
- `src/app/sw.ts` - Service Worker 설정
- `src/app/manifest.ts` - Web App Manifest
- `public/icon.svg` - PWA 아이콘

**빌드 명령어**:
```bash
npm run build  # --webpack 플래그 필요 (Turbopack 미지원)
```

---

## 백엔드 서비스

### Firebase 12

**선택 이유**: 서버 인프라 관리 없이 인증과 실시간 데이터베이스를 제공합니다.

#### 인증
- 이메일/비밀번호 로그인
- Google OAuth 프로바이더
- 세션 지속성
- 보호된 라우트 처리

#### Firestore
- NoSQL 문서 데이터베이스
- 실시간 리스너 (`onSnapshot`)
- 사용자별 데이터 격리
- 오프라인 지속성

**데이터 구조**:
```
users/
  {userId}/
    todos/
      {todoId}: { title, completed, priority, ... }
    presets/
      {presetId}: { title }
    teamMemberships/
      {teamId}: { teamName, role, joinedAt }

teams/
  {teamId}/
    name, description, ownerId, memberCount, createdAt, settings
    members/
      {userId}: { role, displayName, email, joinedAt }
    todos/
      {todoId}: { title, completed, createdBy, assignedTo, ... }

invitations/
  {invitationId}: { teamId, type, email, token, role, status, expiresAt }
```

---

## 개발 환경

### 필수 도구

| 도구 | 최소 버전 | 목적 |
|------|-----------|------|
| Node.js | 18.x | JavaScript 런타임 |
| npm | 9.x | 패키지 관리자 |
| Git | 2.x | 버전 관리 |

### 권장 IDE 확장

- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- ESLint
- Prettier

### 환경 변수

Firebase 설정을 위해 `.env.local` 생성:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 빌드 및 배포

### NPM 스크립트

| 스크립트 | 명령어 | 목적 |
|----------|--------|------|
| `dev` | `next dev` | 개발 서버 시작 |
| `build` | `next build` | 프로덕션 빌드 생성 |
| `start` | `next start` | 프로덕션 서버 실행 |
| `lint` | `eslint` | 코드 린팅 실행 |
| `test` | `playwright test` | E2E 테스트 실행 |
| `test:ui` | `playwright test --ui` | 인터랙티브 테스트 러너 |

### 빌드 출력

Next.js는 다음을 포함한 최적화된 프로덕션 빌드를 생성합니다:
- 자동 코드 분할
- 정적 에셋 최적화
- 해당되는 경우 서버 사이드 렌더링

### 프로덕션 배포

| 항목 | 값 |
|------|-----|
| **플랫폼** | Vercel |
| **프로젝트명** | `todo-app-2` |
| **URL** | https://todo-app-2-tan.vercel.app |
| **브랜치** | `master` |
| **자동 배포** | GitHub 푸시 시 자동 배포 |

### 환경 변수 (Vercel)

프로덕션 배포 시 Vercel Dashboard에서 다음 환경 변수 설정 필요:

| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API 키 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 스토리지 버킷 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 발신자 ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 앱 ID |

### Firebase 설정

| 항목 | 값 |
|------|-----|
| **프로젝트** | `todo-app-291be` |
| **인증 도메인** | `todo-app-2-tan.vercel.app` (Authorized domains에 추가 필요)

### 기타 배포 옵션

| 플랫폼 | 설정 |
|--------|------|
| Netlify | `next build` 출력 |
| Docker | Node.js 컨테이너 |

---

## 테스팅

### Playwright E2E

**선택 이유**: 우수한 TypeScript 지원과 디버깅 도구를 갖춘 크로스 브라우저 E2E 테스팅입니다.

**설정**:
```typescript
// playwright.config.ts
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  reporter: 'html',
  use: {
    browserName: 'chromium'
  }
}
```

**테스트 구성**:
- 스토리 기반 명명 규칙
- 사용자 플로우 커버리지
- 데이터 지속성 검증

---

## 코드 품질

### ESLint 9

- Next.js 권장 규칙
- TypeScript 통합
- 임포트 순서 정리

### TypeScript Strict 모드

- `strict: true` 활성화
- 암묵적 any 금지
- 엄격한 null 체크

---

## 아키텍처 결정

### 클라이언트 사이드 렌더링
**결정**: 인터랙티브 기능에 클라이언트 컴포넌트 사용
**근거**: 실시간 업데이트와 반응형 UI는 클라이언트 사이드 상태가 필요함

### 하이브리드 지속성
**결정**: Firestore와 localStorage 폴백 결합
**근거**: 인터넷 연결 없이도 기능 보장

### 컴포넌트 라이브러리 선택
**결정**: 완전한 컴포넌트 라이브러리 대신 Radix UI 기본 요소 사용
**근거**: 접근성을 유지하면서 최대한의 스타일링 유연성 확보

### 상태 관리
**결정**: Redux/Context 대신 Zustand 선택
**근거**: 더 간단한 API, 적은 보일러플레이트, 애플리케이션 규모에 적합

### 팀 협업 아키텍처
**결정**: 실시간 Firestore 구독을 사용한 팀 데이터 동기화
**근거**: 팀 멤버 간 즉각적인 데이터 동기화 필요

**컴포넌트 구조**:
| 컴포넌트 | 경로 | 역할 |
|----------|------|------|
| `TeamSwitcher` | `src/components/team/` | 개인/팀 워크스페이스 전환 |
| `CreateTeamDialog` | `src/components/team/` | 새 팀 생성 모달 |
| `TeamMembers` | `src/components/team/` | 멤버 목록 및 역할 관리 |
| `InviteDialog` | `src/components/team/` | 이메일/링크 초대 |

**역할 기반 접근 제어**:
| 역할 | 권한 |
|------|------|
| `owner` | 팀 삭제, 모든 권한 |
| `admin` | 멤버 관리, 할 일 관리 |
| `editor` | 할 일 생성/수정 |
| `viewer` | 읽기 전용 |

---

*Todo App 기술 문서*
