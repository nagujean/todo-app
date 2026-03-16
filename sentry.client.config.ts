/**
 * Sentry Client Configuration
 *
 * REQ-003: 시스템은 항상 에러 발생 시 자동으로 에러 추적 시스템에 로그를 기록해야 한다.
 *
 * This configures Sentry for client-side error tracking in the browser
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "production";

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: SENTRY_ENVIRONMENT,

  // Release version for source map mapping
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined,

  // Tracing sample rate (10% of transactions for performance monitoring)
  tracesSampleRate: 0.1,

  // Session replay sample rate (1% of sessions for debugging)
  replaysSessionSampleRate: 0.01,

  // Replay on error sample rate (100% of error sessions)
  replaysOnErrorSampleRate: 1.0,

  // Filter out localhost errors in development
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      // Don't send events in development
      return null;
    }

    // Filter out debugging errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out common browser extension errors
        if (error.message.includes("Chrome extension")) {
          return null;
        }
      }
    }

    return event;
  },

  // Integrations (Sentry v8+ uses automatic browser tracing)
  integrations: [
    // Capture console errors
    Sentry.captureConsoleIntegration({
      levels: ["error"],
    }),
  ],

  // Trace propagation targets for browser tracing
  tracePropagationTargets: ["localhost", "https://todo-app.vercel.app"],

  // User context (will be enriched from auth state)
  initialScope: {
    tags: {
      runtime: "browser",
    },
  },

  // Before send transaction for performance filtering
  beforeSendTransaction(event) {
    // Filter out health check transactions
    if (event.transaction?.includes("/api/health")) {
      return null;
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Random browser extensions errors
    /top\.GLOBAL_DEBUG/,
    /chrome-extension/,
    /moz-extension/,
    // Network errors that are not actionable
    /NetworkError/,
    /Failed to fetch/,
    // Facebook related errors
    /_fbq/,
  ],

  // Deny URLs for privacy and noise reduction
  denyUrls: [
    // Chrome extensions
    "chrome-extension://",
    "moz-extension://",
    // Browser plugins
    "safari-extension://",
    "ms-browser-extension://",
  ],
});

/**
 * Helper to set user context from auth state
 *
 * Call this when user authentication state changes
 */
export function setUserContext(user: { id: string; email?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Helper to add custom context for debugging
 */
export function addCustomContext(key: string, value: Record<string, unknown>) {
  Sentry.setContext(key, value);
}

/**
 * Helper to capture business logic errors
 */
export function captureBusinessError(error: Error, context: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "business_logic");
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
}

/**
 * Helper to capture API errors
 */
export function captureApiError(endpoint: string, error: Error, statusCode?: number) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "api_error");
    scope.setContext("api_call", {
      endpoint,
      status_code: statusCode,
      method: endpoint.split("/").pop() || "unknown",
    });
    Sentry.captureException(error);
  });
}
