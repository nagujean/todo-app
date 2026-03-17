/**
 * Health Check Endpoint
 *
 * REQ-002: 시스템은 항상 배포 상태를 실시간으로 모니터링하고 대시보드에 표시해야 한다.
 * REQ-011: WHEN 헬스 체크가 3회 연속 실패하면, THEN 시스템은 알림을 발송하고 인시던트를 생성해야 한다.
 *
 * @MX:NOTE: Edge Runtime 호환성을 위해 Firebase Auth 클라이언트 제거
 * @MX:SPEC: SPEC-GITHUB-WORKFLOW-FIX-001
 */

import { NextResponse } from "next/server";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase initialization
const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: "ok" | "error";
    auth: "ok" | "error";
    storage: "ok" | "error";
  };
  responseTime: number;
  details?: {
    missingEnvVars?: string[];
  };
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<"ok" | "error"> {
  try {
    // Simple Firestore read operation to verify connectivity (modular SDK)
    const _testDoc = await getDoc(doc(db, "_health", "check"));

    // If doc doesn't exist, that's still OK - we connected successfully
    return "ok";
  } catch (error) {
    console.error("Database health check failed:", error);
    return "error";
  }
}

/**
 * Check authentication service configuration
 * @MX:NOTE: Edge Runtime에서는 Firebase Auth 클라이언트 메서드 사용 불가
 *           환경 변수 검증으로 대체하여 서버 사이드 호환성 확보
 */
async function checkAuth(): Promise<{ status: "ok" | "error"; missingVars: string[] }> {
  const missingVars: string[] = [];

  // 서버 사이드: 필수 Auth 환경 변수 검증
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }

  return {
    status: missingVars.length === 0 ? "ok" : "error",
    missingVars
  };
}

/**
 * Check storage/service availability
 */
async function checkStorage(): Promise<"ok" | "error"> {
  try {
    // Verify environment variables are set
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return "error";
    }

    return "ok";
  } catch (error) {
    console.error("Storage health check failed:", error);
    return "error";
  }
}

/**
 * GET /api/health
 *
 * Returns service health status with checks for:
 * - Database (Firebase Firestore)
 * - Authentication (Firebase Auth config)
 * - Storage/Environment
 *
 * Response time is measured for performance monitoring
 */
export async function GET() {
  const startTime = Date.now();

  // Run all health checks in parallel for faster response
  const [dbStatus, authResult, storageStatus] = await Promise.all([
    checkDatabase(),
    checkAuth(),
    checkStorage(),
  ]);

  const responseTime = Date.now() - startTime;

  // Determine overall health status
  const allChecks = [dbStatus, authResult.status, storageStatus];
  const errorCount = allChecks.filter((status) => status === "error").length;

  let status: "healthy" | "degraded" | "unhealthy";

  if (errorCount === 0) {
    status = "healthy";
  } else if (errorCount === 1) {
    status = "degraded";
  } else {
    status = "unhealthy";
  }

  const healthResult: HealthCheckResult = {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
      auth: authResult.status,
      storage: storageStatus,
    },
    responseTime,
  };

  // Add details if there are missing environment variables
  if (authResult.missingVars.length > 0) {
    healthResult.details = {
      missingEnvVars: authResult.missingVars
    };
  }

  // Return appropriate HTTP status code
  const httpStatus = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

  return NextResponse.json(healthResult, { status: httpStatus });
}

/**
 * Edge Runtime Configuration
 *
 * This endpoint should be fast and lightweight
 */
export const runtime = "edge";
