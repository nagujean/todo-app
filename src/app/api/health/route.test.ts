/**
 * Health Check Endpoint Tests
 *
 * @MX:TEST: SPEC-GITHUB-WORKFLOW-FIX-001
 * Tests verify:
 * 1. All checks return ok when env vars are set (healthy)
 * 2. Auth check returns degraded when NEXT_PUBLIC_FIREBASE_API_KEY is missing
 * 3. All checks return error when multiple env vars are missing (unhealthy)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import type { DocumentSnapshot } from "firebase/firestore";

// Mock Firebase modules
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({
    // Mock Firestore instance
  })),
  doc: vi.fn(() => ({
    // Mock document reference
  })),
  getDoc: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({
    // Mock Firebase app instance
  })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({
    // Mock app instance
  })),
}));

describe("Health Check Endpoint", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  describe("Healthy State", () => {
    it("should return healthy status when all environment variables are set", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
        data: () => ({}),
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: "healthy",
        checks: {
          database: "ok",
          auth: "ok",
          storage: "ok",
        },
      });
      expect(data.timestamp).toBeDefined();
      expect(data.responseTime).toBeGreaterThanOrEqual(0);
      expect(data.details).toBeUndefined();
    });

    it("should include response time in healthy state", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.responseTime).toBeGreaterThanOrEqual(0);
      expect(data.responseTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it("should return 200 HTTP status for healthy state", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe("Degraded State", () => {
    it("should return degraded status when only NEXT_PUBLIC_FIREBASE_API_KEY is missing", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: "degraded",
        checks: {
          database: "ok",
          auth: "error",
          storage: "ok",
        },
        details: {
          missingEnvVars: ["NEXT_PUBLIC_FIREBASE_API_KEY"],
        },
      });
    });

    it("should return unhealthy status when NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing (affects auth and storage)", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.checks.auth).toBe("error");
      expect(data.checks.storage).toBe("error");
    });

    it("should return 200 HTTP status for degraded state", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(200);
    });

    it("should list all missing auth environment variables", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.details?.missingEnvVars).toContain("NEXT_PUBLIC_FIREBASE_API_KEY");
      expect(data.details?.missingEnvVars).toContain("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    });
  });

  describe("Unhealthy State", () => {
    it("should return unhealthy status when multiple checks fail", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockRejectedValue(new Error("Database connection failed"));

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(503);
      expect(data).toMatchObject({
        status: "unhealthy",
        checks: {
          database: "error",
          auth: "error",
          storage: "error",
        },
      });
    });

    it("should return 503 HTTP status for unhealthy state", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockRejectedValue(new Error("Database connection failed"));

      // Act
      const response = await GET();

      // Assert
      expect(response.status).toBe(503);
    });

    it("should return unhealthy when database check fails and auth vars missing", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockRejectedValue(new Error("Firestore unavailable"));

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.status).toBe("unhealthy");
      expect(data.checks.database).toBe("error");
      expect(data.checks.auth).toBe("error");
    });
  });

  describe("Database Check", () => {
    it("should return database ok when Firestore connection succeeds", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.checks.database).toBe("ok");
    });

    it("should return database error when Firestore connection fails", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockRejectedValue(new Error("Network error"));

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.checks.database).toBe("error");
    });

    it("should treat non-existent document as successful connection", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.checks.database).toBe("ok");
    });
  });

  describe("Storage Check", () => {
    it("should return storage ok when project ID is set", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.checks.storage).toBe("ok");
    });

    it("should return storage error when project ID is missing", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.checks.storage).toBe("error");
    });
  });

  describe("Response Format", () => {
    it("should return JSON response with correct structure", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("checks");
      expect(data).toHaveProperty("responseTime");
      expect(data.checks).toHaveProperty("database");
      expect(data.checks).toHaveProperty("auth");
      expect(data.checks).toHaveProperty("storage");
    });

    it("should include ISO 8601 timestamp", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should include details only when there are missing env vars", async () => {
      // Arrange - All vars set
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.details).toBeUndefined();
    });
  });

  describe("Edge Runtime", () => {
    it("should have edge runtime configured", async () => {
      // Arrange
      const { runtime } = await import("./route");

      // Assert
      expect(runtime).toBe("edge");
    });
  });

  describe("Branch Coverage", () => {
    it("should handle 0 errors (healthy)", async () => {
      // Arrange
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.status).toBe("healthy");
    });

    it("should handle 1 error (degraded)", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false,
      } as unknown as DocumentSnapshot);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.status).toBe("degraded");
    });

    it("should handle 2+ errors (unhealthy)", async () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      const { getDoc } = await import("firebase/firestore");
      vi.mocked(getDoc).mockRejectedValue(new Error("DB failed"));

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(data.status).toBe("unhealthy");
    });
  });
});
