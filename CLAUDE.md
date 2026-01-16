# Todo App - Claude Code 프로젝트 설정

## 프로젝트 개요
미니멀 스타일의 할일 관리 앱입니다.

## 기술 스택
- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4
- **UI 컴포넌트**: shadcn/ui
- **상태관리**: Zustand (localStorage 영속화)
- **패키지매니저**: npm

## 프로젝트 구조
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 전역 스타일
├── components/
│   ├── todo/              # Todo 관련 컴포넌트
│   │   ├── TodoInput.tsx  # 입력 컴포넌트
│   │   ├── TodoItem.tsx   # 개별 항목 컴포넌트
│   │   └── TodoList.tsx   # 목록 컴포넌트
│   └── ui/                # shadcn/ui 컴포넌트
├── store/
│   └── todoStore.ts       # Zustand 스토어
└── lib/
    └── utils.ts           # 유틸리티 함수
mocks/
└── todos.json             # 테스트용 목업 데이터
```

## 개발 명령어
```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
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
- Zustand 스토어는 persist 미들웨어로 localStorage에 저장됨
