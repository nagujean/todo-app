#!/usr/bin/env node

/**
 * SPEC-DEPLOY-STABILITY-001 Phase 1: Service Worker Version Automation
 *
 * 이 스크립트는 빌드 시 Service Worker 버전을 자동으로 업데이트합니다.
 * 버전 형식: v{MAJOR}-{YYYY-MM-DD}-{BUILD_LETTER}
 *
 * 사용법:
 *   node scripts/sw-version.mjs
 *
 * 환경 변수:
 *   BUILD_LETTER: 빌드 식별자 (기본값: 'a')
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// ES Modules에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Service Worker 파일 경로
const SW_SOURCE_PATH = path.join(__dirname, "../src/app/sw.ts")

// 버전 형식: v{MAJOR}-{YYYY-MM-DD}-{BUILD_LETTER}
const MAJOR_VERSION = 3
const BUILD_LETTER = process.env.BUILD_LETTER || "a"

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getCurrentDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * 버전 문자열 생성
 */
function generateVersion() {
  const date = getCurrentDate()
  return `v${MAJOR_VERSION}-${date}-${BUILD_LETTER}`
}

/**
 * Service Worker 파일의 버전 상수 업데이트
 */
function updateServiceWorkerVersion() {
  if (!fs.existsSync(SW_SOURCE_PATH)) {
    console.error(`[SW Version] Service Worker 파일을 찾을 수 없습니다: ${SW_SOURCE_PATH}`)
    process.exit(1)
  }

  let content = fs.readFileSync(SW_SOURCE_PATH, "utf-8")
  const newVersion = generateVersion()

  // 버전 상수 패턴 찾기 및 교체
  const versionPattern = /const CACHE_VERSION = ["']v\d+-\d{4}-\d{2}-\d{2}-[a-z]["'];/
  const newVersionLine = `const CACHE_VERSION = "${newVersion}";`

  if (versionPattern.test(content)) {
    content = content.replace(versionPattern, newVersionLine)
    console.log(`[SW Version] 버전 업데이트: ${newVersion}`)
  } else {
    console.warn("[SW Version] CACHE_VERSION 상수를 찾을 수 없습니다. 파일을 확인해주세요.")
    process.exit(1)
  }

  // 파일 업데이트
  fs.writeFileSync(SW_SOURCE_PATH, content, "utf-8")
  console.log(`[SW Version] Service Worker 파일이 업데이트되었습니다.`)
}

// 메인 실행
try {
  updateServiceWorkerVersion()
} catch (error) {
  console.error("[SW Version] 오류 발생:", error.message)
  process.exit(1)
}
