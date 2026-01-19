# Todo App - Claude Code 프로젝트 설정

## 프로젝트 개요
미니멀 스타일의 할일 관리 앱입니다. Firebase Authentication과 Firestore를 통해 사용자별 데이터 관리를 지원합니다.

## 기술 스택
- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4
- **UI 컴포넌트**: shadcn/ui
- **상태관리**: Zustand (Firebase 연동 시 Firestore, 미연동 시 localStorage)
- **인증**: Firebase Authentication (이메일/비밀번호, Google 소셜 로그인)
- **데이터베이스**: Cloud Firestore
- **패키지매니저**: npm

## 프로젝트 구조
```
src/
├── app/
│   ├── (auth)/              # 인증 관련 페이지 그룹
│   │   ├── layout.tsx       # 인증 레이아웃
│   │   ├── login/page.tsx   # 로그인 페이지
│   │   └── signup/page.tsx  # 회원가입 페이지
│   ├── page.tsx             # 메인 페이지
│   ├── layout.tsx           # 루트 레이아웃 (AuthProvider 포함)
│   └── globals.css          # 전역 스타일
├── components/
│   ├── auth/                # 인증 관련 컴포넌트
│   │   ├── AuthProvider.tsx # 인증 상태 관리 프로바이더
│   │   ├── LoginForm.tsx    # 로그인 폼
│   │   ├── SignupForm.tsx   # 회원가입 폼
│   │   └── UserMenu.tsx     # 사용자 메뉴 (로그아웃)
│   ├── todo/                # Todo 관련 컴포넌트
│   │   ├── TodoInput.tsx    # 입력 컴포넌트
│   │   ├── TodoItem.tsx     # 개별 항목 컴포넌트
│   │   ├── TodoDetail.tsx   # 상세 보기 컴포넌트
│   │   └── TodoList.tsx     # 목록 컴포넌트
│   ├── calendar/            # 캘린더 뷰 컴포넌트
│   ├── preset/              # 프리셋 컴포넌트
│   └── ui/                  # shadcn/ui 컴포넌트
├── store/
│   ├── authStore.ts         # 인증 상태 스토어
│   ├── todoStore.ts         # Todo 스토어 (Firestore 연동)
│   ├── presetStore.ts       # 프리셋 스토어 (Firestore 연동)
│   └── themeStore.ts        # 테마 스토어
└── lib/
    ├── firebase.ts          # Firebase 설정
    └── utils.ts             # 유틸리티 함수
```

## Firebase 설정

### 1. Firebase 프로젝트 생성
1. https://console.firebase.google.com 접속
2. "프로젝트 추가" 클릭
3. Authentication > 로그인 제공업체 > "이메일/비밀번호", "Google" 활성화
4. Firestore Database > 데이터베이스 만들기 > 위치 선택 (asia-northeast3 = 서울)

### 2. 환경 변수 설정
`.env.local.example`을 `.env.local`로 복사하고 Firebase 설정값 입력:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firestore 보안 규칙
Firebase Console에서 `firestore.rules` 파일의 내용을 적용:
```
users/{userId}/todos/{todoId}  - 사용자별 할일 데이터
users/{userId}/presets/{presetId}  - 사용자별 프리셋 데이터
```

## 개발 명령어
```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
npm run test     # Playwright 테스트 실행
```

## 코드 컨벤션
- 컴포넌트: PascalCase (예: `TodoItem.tsx`)
- 파일: camelCase (예: `todoStore.ts`)
- CSS: Tailwind 유틸리티 클래스 사용
- 상태관리: Zustand 훅 패턴 사용

## UI 컴포넌트 추가
```bash
npx shadcn@latest add [component-name]
```

## 주의사항
- 클라이언트 컴포넌트에는 `'use client'` 지시어 필수
- Firebase 미설정 시 localStorage 폴백으로 동작
- 인증 상태는 AuthProvider에서 전역 관리
- Firestore 데이터는 사용자별로 분리 저장됨

## 인증 흐름
1. 앱 로드 → AuthProvider에서 onAuthStateChanged 리스닝
2. 미인증 → /login 페이지로 리다이렉트
3. 인증됨 → 메인 페이지 표시, Firestore에서 데이터 로드
4. 로그아웃 → /login 페이지로 리다이렉트
