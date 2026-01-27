# Todo App - 프로젝트 구조

## 디렉터리 트리

```
todo-app/
├── .moai/                      # MoAI 프로젝트 설정
│   ├── config/                 # 설정 파일
│   ├── memory/                 # 세션 상태
│   └── project/                # 프로젝트 문서
│       ├── product.md          # 제품 개요
│       ├── structure.md        # 프로젝트 구조 (현재 문서)
│       └── tech.md             # 기술 문서
│
├── e2e/                        # E2E 테스트 (Playwright)
│   ├── story-1-1-add-todo.spec.ts
│   ├── story-1-2-complete-todo.spec.ts
│   ├── story-1-3-delete-todo.spec.ts
│   ├── story-1-4-filter-todo.spec.ts
│   ├── story-1-5-persistence.spec.ts
│   ├── team-collaboration.spec.ts
│   └── todo.spec.ts
│
├── public/                     # 정적 리소스
│   ├── icon.svg               # 앱 아이콘 (SVG)
│   ├── icon-192.png           # 앱 아이콘 (192x192)
│   ├── icon-512.png           # 앱 아이콘 (512x512)
│   ├── icon-maskable-512.png  # 마스커블 아이콘
│   └── sw.js                  # 서비스 워커
│
├── src/                        # 소스 코드
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # 인증 라우트 그룹
│   │   │   ├── login/        # 로그인 페이지
│   │   │   │   └── page.tsx
│   │   │   ├── signup/       # 회원가입 페이지
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx    # 인증 레이아웃
│   │   ├── favicon.ico       # 파비콘
│   │   ├── globals.css       # 전역 스타일
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── manifest.ts       # PWA 매니페스트
│   │   ├── page.tsx          # 메인 페이지
│   │   └── sw.ts             # 서비스 워커 등록
│   │
│   ├── components/            # React 컴포넌트
│   │   ├── auth/             # 인증 관련
│   │   │   ├── AuthProvider.tsx  # 인증 컨텍스트
│   │   │   ├── LoginForm.tsx     # 로그인 폼
│   │   │   ├── SignupForm.tsx    # 회원가입 폼
│   │   │   └── UserMenu.tsx      # 사용자 메뉴
│   │   │
│   │   ├── calendar/         # 캘린더 관련
│   │   │   └── CalendarView.tsx  # 캘린더 뷰
│   │   │
│   │   ├── preset/           # 프리셋 관련
│   │   │   └── PresetList.tsx    # 프리셋 목록
│   │   │
│   │   ├── team/             # 팀 협업 관련
│   │   │   ├── CreateTeamDialog.tsx  # 팀 생성 다이얼로그
│   │   │   ├── index.ts              # 배럴 파일
│   │   │   ├── InviteDialog.tsx      # 초대 다이얼로그
│   │   │   ├── TeamMembers.tsx       # 팀원 목록
│   │   │   └── TeamSwitcher.tsx      # 팀 전환기
│   │   │
│   │   ├── todo/             # 할 일 관련
│   │   │   ├── index.ts      # 배럴 파일
│   │   │   ├── TodoDetail.tsx    # 할 일 상세
│   │   │   ├── TodoInput.tsx     # 할 일 입력
│   │   │   ├── TodoItem.tsx      # 할 일 항목
│   │   │   └── TodoList.tsx      # 할 일 목록
│   │   │
│   │   ├── ui/               # UI 컴포넌트 (Radix 기반)
│   │   │   ├── button.tsx    # 버튼
│   │   │   ├── card.tsx      # 카드
│   │   │   ├── checkbox.tsx  # 체크박스
│   │   │   ├── dialog.tsx    # 다이얼로그
│   │   │   ├── input.tsx     # 입력 필드
│   │   │   └── textarea.tsx  # 텍스트영역
│   │   │
│   │   ├── ThemeToggle.tsx   # 테마 전환
│   │   └── ViewToggle.tsx    # 뷰 모드 전환
│   │
│   ├── lib/                   # 유틸리티
│   │   ├── firebase.ts       # Firebase 설정
│   │   └── utils.ts          # 공통 유틸리티
│   │
│   └── store/                 # Zustand 스토어
│       ├── authStore.ts      # 인증 상태
│       ├── invitationStore.ts    # 초대 상태
│       ├── presetStore.ts    # 프리셋 상태
│       ├── teamStore.ts      # 팀 상태
│       ├── themeStore.ts     # 테마 상태
│       └── todoStore.ts      # 할 일 상태
│
├── .gitignore                 # Git 제외 파일
├── CLAUDE.md                  # AI 어시스턴트 지침
├── next.config.ts             # Next.js 설정
├── package.json               # 프로젝트 메타데이터
├── playwright.config.ts       # Playwright 설정
├── postcss.config.mjs         # PostCSS 설정
├── tailwind.config.ts         # Tailwind 설정
└── tsconfig.json              # TypeScript 설정
```

## 주요 디렉터리 설명

### src/app/ - Next.js App Router

Next.js 16의 App Router를 사용하는 페이지 디렉터리입니다.

| 경로 | 설명 |
|------|------|
| `(auth)/` | 인증 관련 페이지를 그룹화하는 라우트 그룹 |
| `(auth)/login/` | 로그인 페이지 (`/login`) |
| `(auth)/signup/` | 회원가입 페이지 (`/signup`) |
| `layout.tsx` | 루트 레이아웃 (HTML, 폰트, 프로바이더) |
| `page.tsx` | 메인 페이지 (`/`) |
| `manifest.ts` | PWA 웹 앱 매니페스트 동적 생성 |

### src/components/ - React 컴포넌트

기능별로 구조화된 React 컴포넌트 디렉터리입니다.

| 디렉터리 | 설명 | 주요 파일 |
|----------|------|----------|
| `auth/` | 인증 UI | LoginForm, SignupForm, AuthProvider |
| `calendar/` | 캘린더 뷰 | CalendarView |
| `preset/` | 프리셋 기능 | PresetList |
| `team/` | 팀 협업 기능 | TeamSwitcher, InviteDialog, TeamMembers |
| `todo/` | 할 일 관리 | TodoList, TodoItem, TodoInput, TodoDetail |
| `ui/` | 재사용 UI | button, input, dialog, checkbox, card |

### src/store/ - Zustand 상태 관리

Zustand를 사용한 전역 상태 관리 스토어입니다.

| 스토어 | 역할 | 주요 상태 |
|--------|------|----------|
| `todoStore.ts` | 할 일 관리 | todos, sortType, viewMode, filterMode |
| `authStore.ts` | 인증 상태 | user, isLoading |
| `teamStore.ts` | 팀 관리 | teams, currentTeam, members |
| `themeStore.ts` | 테마 설정 | theme (dark/light) |
| `presetStore.ts` | 프리셋 관리 | presets |
| `invitationStore.ts` | 초대 관리 | invitations |

### src/lib/ - 유틸리티

공유 유틸리티 및 설정 파일입니다.

| 파일 | 설명 |
|------|------|
| `firebase.ts` | Firebase 앱 초기화 및 Firestore/Auth 인스턴스 |
| `utils.ts` | 클래스명 병합 등 공통 유틸리티 함수 |

### e2e/ - E2E 테스트

Playwright 기반 End-to-End 테스트입니다.

| 테스트 파일 | 테스트 범위 |
|------------|------------|
| `story-1-1-add-todo.spec.ts` | 할 일 추가 기능 |
| `story-1-2-complete-todo.spec.ts` | 할 일 완료 기능 |
| `story-1-3-delete-todo.spec.ts` | 할 일 삭제 기능 |
| `story-1-4-filter-todo.spec.ts` | 필터링 기능 |
| `story-1-5-persistence.spec.ts` | 데이터 영속성 |
| `team-collaboration.spec.ts` | 팀 협업 기능 |

## 모듈 구성

### 컴포넌트 의존성

```
App (layout.tsx)
├── AuthProvider
│   └── 인증 상태 관리
├── ThemeProvider
│   └── 테마 컨텍스트
└── Page (page.tsx)
    ├── ThemeToggle
    ├── UserMenu
    ├── TeamSwitcher
    ├── ViewToggle
    ├── TodoInput
    │   └── PresetList
    ├── TodoList (리스트 뷰)
    │   └── TodoItem[]
    │       └── TodoDetail
    └── CalendarView (캘린더 뷰)
```

### 상태 흐름

```
Firebase Firestore
    ↓
Zustand Store (실시간 구독)
    ↓
React Components (상태 소비)
    ↓
User Actions
    ↓
Store Actions
    ↓
Firebase Firestore (업데이트)
```

### 라우팅 구조

| URL 경로 | 컴포넌트 | 설명 |
|----------|----------|------|
| `/` | `app/page.tsx` | 메인 할 일 관리 페이지 |
| `/login` | `app/(auth)/login/page.tsx` | 로그인 페이지 |
| `/signup` | `app/(auth)/signup/page.tsx` | 회원가입 페이지 |

---

마지막 업데이트: 2026-01-25
