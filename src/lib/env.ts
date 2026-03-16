import { z } from "zod";

/**
 * 환경 변수 유효성 검사 스키마
 * Zod를 사용하여 타입 안전한 환경 변수 접근 제공
 */

const envSchema = z.object({
  // Firebase 공개 설정 (필수)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "Firebase API Key는 필수입니다"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "Firebase Auth Domain은 필수입니다"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "Firebase Project ID는 필수입니다"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1, "Firebase Storage Bucket은 필수입니다"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, "Firebase Messaging Sender ID는 필수입니다"),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1, "Firebase App ID는 필수입니다"),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),

  // Sentry (선택적 - 프로덕션 환경 권장)
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // 앱 환경
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * 유효성 검사된 환경 변수
 * 개발 환경에서는 누락된 변수를 명확히 표시
 * 프로덕션 환경에서는 엄격하게 검증
 */
function validateEnv(): Env {
  const parsed = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    return envSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join(".")).join(", ");

      if (parsed.NODE_ENV === "production") {
        throw new Error(
          `필수 환경 변수가 누락되었습니다: ${missingVars}. ` +
            "배포를 진행하기 전에 모든 필수 변수를 설정해주세요."
        );
      }

      // 개발 환경에서는 경고만 표시
      console.warn(
        `[Env Warning] 일부 환경 변수가 누락되었습니다: ${missingVars}. ` +
          ".env 파일을 확인해주세요."
      );
    }

    throw error;
  }
}

// 전역 싱글톤 인스턴스
let cachedEnv: Env | null = null;

/**
 * 유효성 검사된 환경 변수 가져오기
 * 첫 호출 시 유효성 검사 수행, 이후에는 캐시된 값 반환
 */
export function getEnv(): Env {
  if (cachedEnv === null) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * 환경 변수 재검증 (테스트 또는 환경 변경 시 사용)
 */
export function revalidateEnv(): Env {
  cachedEnv = null;
  return getEnv();
}

/**
 * 개발 환경 확인 헬퍼
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

/**
 * 프로덕션 환경 확인 헬퍼
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

/**
 * 테스트 환경 확인 헬퍼
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === "test";
}

/**
 * Sentry 활성화 여부 확인
 */
export function isSentryEnabled(): boolean {
  const env = getEnv();
  return !!(env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN);
}
