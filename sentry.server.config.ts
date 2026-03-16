/**
 * Sentry Server Configuration
 *
 * REQ-003: 시스템은 항상 에러 발생 시 자동으로 에러 추적 시스템에 로그를 기록해야 한다.
 *
 * This configures Sentry for server-side error tracking in Next.js
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || "production";

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: SENTRY_ENVIRONMENT,

  // Release version for source map mapping
  release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,

  // Tracing sample rate (10% of server transactions)
  tracesSampleRate: 0.1,

  // Filter out localhost errors in development
  beforeSend(event, _hint) {
    if (process.env.NODE_ENV === "development") {
      // Don't send events in development
      return null;
    }

    // Filter out sensitive data
    if (event.request) {
      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-api-key"];
      }
    }

    return event;
  },

  // Integrations (Sentry v8+ uses function-based integrations)
  integrations: [
    // HTTP request tracing
    Sentry.httpIntegration(),

    // Express/Next.js middleware tracing
    Sentry.onUncaughtExceptionIntegration(),
    Sentry.onUnhandledRejectionIntegration(),
  ],

  // Initial scope with server context
  initialScope: {
    tags: {
      runtime: "nodejs",
      node_version: process.version,
    },
  },

  // Ignore specific errors
  ignoreErrors: [
    // Timeout errors
    /ETIMEDOUT/,
    /ECONNRESET/,
    // Client aborted errors
    /ECONNABORTED/,
  ],

  // Before send transaction for performance filtering
  beforeSendTransaction(event) {
    // Filter out health check transactions
    if (event.transaction?.includes("/api/health")) {
      return null;
    }

    // Filter out static asset requests
    if (event.transaction?.includes("/_next/static")) {
      return null;
    }

    return event;
  },
});

/**
 * Helper to capture server errors with request context
 */
export function captureServerError(
  error: Error,
  context: {
    request?: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
    };
    user?: {
      id?: string;
      email?: string;
    };
    extra?: Record<string, unknown>;
  }
) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "server_error");

    if (context.request) {
      scope.setContext("request", {
        method: context.request.method,
        url: context.request.url,
      });
    }

    if (context.user) {
      scope.setUser({
        id: context.user.id,
        email: context.user.email,
      });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureException(error);
  });
}

/**
 * Helper to capture database errors
 */
export function captureDatabaseError(operation: string, error: Error, collection?: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "database_error");
    scope.setContext("database_operation", {
      operation,
      collection,
    });
    Sentry.captureException(error);
  });
}

/**
 * Helper to capture authentication errors
 */
export function captureAuthError(operation: string, error: Error) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "auth_error");
    scope.setContext("auth_operation", {
      operation,
    });
    Sentry.captureException(error);
  });
}
