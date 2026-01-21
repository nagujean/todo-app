# PWA 구현 계획

## 개요

Todo App을 Progressive Web App(PWA)으로 변환하여 모바일에서 앱처럼 사용할 수 있도록 합니다.

---

## 현재 상태

- **프레임워크**: Next.js 16.1.2 + React 19
- **PWA 설정**: 없음 (manifest.json, service worker 미존재)
- **아이콘**: SVG 파일만 존재 (PWA 아이콘 필요)
- **메타데이터**: 기본 title/description만 설정됨

---

## 구현 단계

### 1단계: Serwist 패키지 설치

```bash
npm install @serwist/next
npm install -D serwist
```

**이유**: `@serwist/next`는 Next.js 13+ App Router를 공식 지원하며, `next-pwa`보다 최신 Next.js와 호환성이 좋습니다.

---

### 2단계: PWA 아이콘 생성

**생성할 파일**: `public/` 디렉토리

| 파일명 | 크기 | 용도 |
|--------|------|------|
| `icon-192.png` | 192x192 | Android 홈 화면 |
| `icon-512.png` | 512x512 | Android 스플래시 |
| `apple-touch-icon.png` | 180x180 | iOS 홈 화면 |

**디자인**: 체크박스 아이콘 + 파란색 배경

---

### 3단계: Web App Manifest 설정

**생성할 파일**: `src/app/manifest.ts`

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Todo App - 할 일 관리',
    short_name: 'Todo',
    description: '할 일을 관리하세요',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
```

---

### 4단계: Service Worker 설정

**생성할 파일**: `src/app/sw.ts`

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

---

### 5단계: Next.js 설정 수정

**수정 파일**: `next.config.ts`

```typescript
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig = {
  // 기존 설정 유지
};

export default withSerwist(nextConfig);
```

---

### 6단계: 메타데이터 확장

**수정 파일**: `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "Todo App - 할 일 관리",
  description: "할 일을 관리하세요",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Todo App",
  },
  formatDetection: {
    telephone: false,
  },
};
```

---

## 수정할 파일 목록

| 파일 | 작업 |
|------|------|
| `package.json` | Serwist 패키지 추가 |
| `next.config.ts` | Serwist 플러그인 적용 |
| `src/app/layout.tsx` | 메타데이터 확장 |
| `src/app/manifest.ts` | 신규 생성 |
| `src/app/sw.ts` | 신규 생성 |
| `public/icon-192.png` | 신규 생성 |
| `public/icon-512.png` | 신규 생성 |
| `public/apple-touch-icon.png` | 신규 생성 |
| `tsconfig.json` | Service Worker 타입 추가 |

---

## 검증 방법

### 1. 빌드 및 실행
```bash
npm run build
npm run start
```

### 2. Chrome DevTools 확인
- Application 탭 > Manifest 섹션 확인
- Application 탭 > Service Workers 확인
- Lighthouse PWA 감사 실행

### 3. 모바일 설치 테스트
- Android Chrome: 메뉴 > "홈 화면에 추가"
- iOS Safari: 공유 > "홈 화면에 추가"

### 4. 오프라인 테스트
- DevTools > Network > Offline 체크
- 앱이 캐시된 콘텐츠로 동작하는지 확인

---

## 예상 소요 시간: 약 3시간
