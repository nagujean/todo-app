/**
 * Sentry Edge Configuration
 *
 * REQ-003: 시스템은 항상 에러 발생 시 자동으로 에러 추적 시스템에 로그를 기록해야 한다.
 *
 * This configures Sentry for Edge Runtime error tracking
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "production";

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: SENTRY_ENVIRONMENT,

  // Release version
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,

  // Tracing for edge functions (lower sample rate due to volume)
  tracesSampleRate: 0.05,

  // Filter for edge runtime
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Edge-specific filtering
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
      }
    }

    return event;
  },

  // Initial scope with edge context
  initialScope: {
    tags: {
      runtime: "edge",
    },
  },

  // Before send transaction for edge filtering
  beforeSendTransaction(event) {
    // Filter out health check transactions
    if (event.transaction?.includes("/api/health")) {
      return null;
    }

    return event;
  },
});
