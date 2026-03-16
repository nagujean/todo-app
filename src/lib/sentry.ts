/**
 * Sentry Utility Functions
 *
 * REQ-003: 시스템은 항상 에러 발생 시 자동으로 에러 추적 시스템에 로그를 기록해야 한다.
 *
 * Centralized error tracking utilities for client and server
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Initialize user context from Firebase Auth user
 *
 * Call this when user signs in or out
 */
export function initializeUserContext(
  user: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  } | null
) {
  if (user) {
    Sentry.setUser({
      id: user.uid,
      email: user.email || undefined,
      username: user.displayName || undefined,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture error with custom tags and context
 *
 * @param error - Error object or message
 * @param tags - Custom tags for filtering
 * @param context - Additional context data
 */
export function captureError(
  error: Error | string,
  tags?: Record<string, string>,
  context?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    // Add custom tags
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    // Add custom context
    if (context) {
      scope.setContext("custom", context);
    }

    // Capture error
    if (typeof error === "string") {
      Sentry.captureException(new Error(error));
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Capture error with level
 *
 * @param level - Error level (fatal, error, warning, info, debug)
 * @param error - Error object or message
 * @param context - Additional context data
 */
export function captureErrorWithLevel(
  level: "fatal" | "error" | "warning" | "info" | "debug",
  error: Error | string,
  context?: Record<string, unknown>
) {
  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (typeof error === "string") {
      Sentry.captureException(new Error(error));
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Capture message (not an error, but notable event)
 *
 * @param message - Message to log
 * @param level - Message level
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 *
 * Breadcrumbs show the trail of events leading to an error
 *
 * @param message - Breadcrumb message
 * @param category - Breadcrumb category (default: 'custom')
 * @param level - Breadcrumb level (default: 'info')
 */
export function addBreadcrumb(
  message: string,
  category: string = "custom",
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Performance monitoring: Start a span (Sentry v8+)
 *
 * @param name - Span name
 * @param operation - Operation type (e.g., 'http', 'db', 'task')
 */
export function startSpan<T>(name: string, operation: string, callback: () => T): T {
  return Sentry.startSpan({ name, op: operation }, callback);
}

/**
 * Feature flag tracking
 *
 * @param featureName - Name of the feature
 * @param enabled - Whether the feature is enabled
 * @param userId - User ID (optional)
 */
export function trackFeatureFlag(featureName: string, enabled: boolean, userId?: string) {
  Sentry.withScope((scope) => {
    scope.setTag("feature_flag", featureName);
    scope.setExtra("flag_enabled", enabled);
    scope.setExtra("user_id", userId);

    Sentry.captureMessage(`Feature flag: ${featureName} = ${enabled}`, "info");
  });
}

/**
 * Track custom metrics
 *
 * @param metricName - Name of the metric
 * @param value - Metric value
 * @param tags - Metric tags for grouping
 */
export function trackMetric(metricName: string, value: number, tags?: Record<string, string>) {
  Sentry.withScope((scope) => {
    scope.setTag("metric", metricName);

    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    scope.setExtra("metric_value", value);

    Sentry.captureMessage(`Metric: ${metricName} = ${value}`, "info");
  });
}

/**
 * Handle Next.js API route errors
 *
 * @param error - Error object
 * @param req - Next.js request object
 * @param route - API route path
 */
export function handleApiRouteError(error: Error, req: Request, route: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "api_route");
    scope.setTag("route", route);
    scope.setContext("request", {
      method: req.method,
      url: req.url,
    });

    Sentry.captureException(error);
  });
}

/**
 * Handle Firebase errors
 *
 * @param error - Firebase error
 * @param operation - Operation that failed (e.g., 'auth signIn', 'firestore getDoc')
 */
export function handleFirebaseError(error: Error, operation: string) {
  Sentry.withScope((scope) => {
    scope.setTag("error_type", "firebase");
    scope.setTag("firebase_operation", operation);
    scope.setContext("firebase_error", {
      code: (error as { code?: string })?.code || "unknown",
      message: error.message,
    });

    Sentry.captureException(error);
  });
}

/**
 * Performance: Measure execution time (Sentry v8+)
 *
 * @param name - Measurement name
 * @param fn - Function to measure
 * @returns Result of the function
 */
export async function measurePerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name, op: "performance" }, async () => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, { performance_measurement: name });
      }
      throw error;
    }
  });
}
