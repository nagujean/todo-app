/**
 * Sentry Utility Functions Tests
 *
 * @MX:SPEC SPEC-OBSERVABILITY-001
 * @MX:NOTE Tests verify error capture utilities work correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  setUser: vi.fn(),
  withScope: vi.fn((callback) => {
    const mockScope = {
      setTag: vi.fn(),
      setContext: vi.fn(),
      setExtra: vi.fn(),
      setLevel: vi.fn(),
    };
    callback(mockScope);
  }),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  startSpan: vi.fn((_, callback) => callback()),
}));

describe("Sentry Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initializeUserContext", () => {
    it("sets user context when user is provided", async () => {
      const { initializeUserContext } = await import("../sentry");

      initializeUserContext({
        uid: "test-user-123",
        email: "test@example.com",
        displayName: "Test User",
      });

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: "test-user-123",
        email: "test@example.com",
        username: "Test User",
      });
    });

    it("clears user context when user is null", async () => {
      const { initializeUserContext } = await import("../sentry");

      initializeUserContext(null);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it("handles user without optional fields", async () => {
      const { initializeUserContext } = await import("../sentry");

      initializeUserContext({
        uid: "test-user-456",
      });

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: "test-user-456",
        email: undefined,
        username: undefined,
      });
    });
  });

  describe("captureError", () => {
    it("captures Error object with tags and context", async () => {
      const { captureError } = await import("../sentry");

      const error = new Error("Test error");
      captureError(error, { type: "test" }, { key: "value" });

      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it("captures string error by converting to Error", async () => {
      const { captureError } = await import("../sentry");

      captureError("String error message");

      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "String error message",
        })
      );
    });

    it("captures error without tags or context", async () => {
      const { captureError } = await import("../sentry");

      const error = new Error("Simple error");
      captureError(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe("captureErrorWithLevel", () => {
    it("captures error with warning level", async () => {
      const { captureErrorWithLevel } = await import("../sentry");

      const error = new Error("Warning level error");
      captureErrorWithLevel("warning", error, { context: "data" });

      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("captures error with fatal level", async () => {
      const { captureErrorWithLevel } = await import("../sentry");

      captureErrorWithLevel("fatal", "Critical error");

      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  describe("captureMessage", () => {
    it("captures message with default info level", async () => {
      const { captureMessage } = await import("../sentry");

      captureMessage("Test message");

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Test message", "info");
    });

    it("captures message with error level", async () => {
      const { captureMessage } = await import("../sentry");

      captureMessage("Error message", "error");

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Error message", "error");
    });
  });

  describe("addBreadcrumb", () => {
    it("adds breadcrumb with default category and level", async () => {
      const { addBreadcrumb } = await import("../sentry");

      addBreadcrumb("User clicked button");

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User clicked button",
          category: "custom",
          level: "info",
        })
      );
    });

    it("adds breadcrumb with custom category", async () => {
      const { addBreadcrumb } = await import("../sentry");

      addBreadcrumb("API call started", "http", "debug");

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "API call started",
          category: "http",
          level: "debug",
        })
      );
    });
  });

  describe("trackFeatureFlag", () => {
    it("tracks enabled feature flag", async () => {
      const { trackFeatureFlag } = await import("../sentry");

      trackFeatureFlag("new_ui", true, "user-123");

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Feature flag: new_ui = true", "info");
    });

    it("tracks disabled feature flag", async () => {
      const { trackFeatureFlag } = await import("../sentry");

      trackFeatureFlag("beta_feature", false);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        "Feature flag: beta_feature = false",
        "info"
      );
    });
  });

  describe("trackMetric", () => {
    it("tracks metric with tags", async () => {
      const { trackMetric } = await import("../sentry");

      trackMetric("api_latency", 150, { endpoint: "/api/health" });

      expect(Sentry.captureMessage).toHaveBeenCalledWith("Metric: api_latency = 150", "info");
    });
  });

  describe("handleApiRouteError", () => {
    it("captures API route error with request context", async () => {
      const { handleApiRouteError } = await import("../sentry");

      const error = new Error("API failed");
      const req = {
        method: "POST",
        url: "/api/todos",
      } as Request;

      handleApiRouteError(error, req, "/api/todos");

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe("handleFirebaseError", () => {
    it("captures Firebase error with operation context", async () => {
      const { handleFirebaseError } = await import("../sentry");

      const error = new Error("Permission denied") as Error & { code: string };
      (error as { code: string }).code = "permission-denied";

      handleFirebaseError(error, "firestore getDoc");

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  describe("measurePerformance", () => {
    it("measures successful execution", async () => {
      const { measurePerformance } = await import("../sentry");

      const result = await measurePerformance("test-operation", async () => {
        return "success";
      });

      expect(result).toBe("success");
    });

    it("captures error from failed execution", async () => {
      const { measurePerformance } = await import("../sentry");

      await expect(
        measurePerformance("failing-operation", async () => {
          throw new Error("Operation failed");
        })
      ).rejects.toThrow("Operation failed");
    });
  });
});
