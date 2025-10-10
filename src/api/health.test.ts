/**
 * Health Check API Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase - all mocks must be defined inside the factory
vi.mock("../lib/supabase", () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      storage: {
        listBuckets: vi.fn(),
      },
      auth: {
        getSession: vi.fn(),
      },
    },
  };
});

import { healthCheck, readinessCheck, livenessCheck } from "./health";
import { supabase } from "../lib/supabase";

describe("Health Check API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("livenessCheck", () => {
    it("should always return alive true", () => {
      const result = livenessCheck();

      expect(result.alive).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe("readinessCheck", () => {
    it("should return ready when database is operational", async () => {
      const mockChain = {
        single: vi.fn().mockResolvedValue({
          data: { id: "test" },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue(mockChain),
        }),
      } as any);

      const result = await readinessCheck();

      expect(result.ready).toBe(true);
      expect(result.checks.database).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    it("should return not ready when database is down", async () => {
      const mockChain = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection failed" },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue(mockChain),
        }),
      } as any);

      const result = await readinessCheck();

      expect(result.ready).toBe(false);
      expect(result.checks.database).toBe(false);
    });
  });

  describe("healthCheck", () => {
    it("should return healthy status when all services are operational", async () => {
      // Mock database
      const mockChain = {
        single: vi.fn().mockResolvedValue({
          data: { id: "test" },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue(mockChain),
        }),
      } as any);

      // Mock storage
      vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      // Mock auth
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await healthCheck();

      expect(result.status).toBe("healthy");
      expect(result.services.database.status).toBe("operational");
      expect(result.services.storage.status).toBe("operational");
      expect(result.services.auth.status).toBe("operational");
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it("should return degraded status when some services are slow", async () => {
      // Mock slow database response
      const mockChain = {
        single: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => {
                resolve({ data: { id: "test" }, error: null });
              }, 1100); // Over 1 second
            })
        ),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue(mockChain),
        }),
      } as any);

      // Mock storage
      vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      // Mock auth
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await healthCheck();

      expect(result.status).toBe("degraded");
      expect(result.services.database.status).toBe("degraded");
    });

    it("should return unhealthy status when a service is down", async () => {
      // Mock database error
      const mockChain = {
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection failed", code: "ECONNREFUSED" },
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue(mockChain),
        }),
      } as any);

      // Mock storage
      vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      // Mock auth
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await healthCheck();

      expect(result.status).toBe("unhealthy");
      expect(result.services.database.status).toBe("down");
    });

    it("should include response times for all services", async () => {
      // Mock database
      const mockChain = {
        single: vi.fn().mockResolvedValue({
          data: { id: "test" },
          error: null,
        }),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue(mockChain),
        }),
      } as any);

      // Mock storage
      vi.mocked(supabase.storage.listBuckets).mockResolvedValue({
        data: [],
        error: null,
      } as any);

      // Mock auth
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      } as any);

      const result = await healthCheck();

      expect(result.services.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.services.storage.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.services.auth.responseTime).toBeGreaterThanOrEqual(0);
    });
  });
});
