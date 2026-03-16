/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// @MX:NOTE: 강제 캐시 무효화 - auth/unauthorized-domain 오류 해결
// 버전 업데이트 시 기존 캐시 자동 삭제
const CACHE_VERSION = "v3-2026-03-16-b";

self.addEventListener("activate", async () => {
  // 모든 기존 캐시 삭제
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log("[SW] All caches cleared for version:", CACHE_VERSION);
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
