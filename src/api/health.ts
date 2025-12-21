/**
 * Health Check API
 *
 * Provides endpoints for monitoring application health and readiness.
 * Used by load balancers, monitoring systems, and deployment pipelines.
 */

import { supabase } from "../lib/supabase";
import { table } from "../data/supabase/db";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    storage: ServiceHealth;
    auth: ServiceHealth;
  };
}

export interface ServiceHealth {
  status: "operational" | "degraded" | "down";
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

export interface ReadinessCheck {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    requiredServices: boolean;
  };
}

/**
 * Check database connectivity and performance
 */
async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Simple query to check database connectivity
    const { error } = await table("profiles").select("id").limit(1).single();

    const responseTime = Date.now() - startTime;

    if (error) {
      // Check if it's just "no rows" which is still a valid connection
      if (error.code === "PGRST116") {
        return {
          status: "operational",
          responseTime,
          lastChecked: new Date().toISOString(),
          message: "Database connected (empty table)",
        };
      }

      return {
        status: "down",
        responseTime,
        lastChecked: new Date().toISOString(),
        message: error.message,
      };
    }

    return {
      status: responseTime < 1000 ? "operational" : "degraded",
      responseTime,
      lastChecked: new Date().toISOString(),
      message: responseTime > 1000 ? "Slow response time" : undefined,
    };
  } catch (err) {
    return {
      status: "down",
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check storage service health
 */
async function checkStorageHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // List buckets to verify storage access
    const { error } = await supabase.storage.listBuckets();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: "down",
        responseTime,
        lastChecked: new Date().toISOString(),
        message: error.message,
      };
    }

    return {
      status: "operational",
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: "down",
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check auth service health
 */
async function checkAuthHealth(): Promise<ServiceHealth> {
  const startTime = Date.now();

  try {
    // Check if we can get session (even if null, means auth is responsive)
    const { error } = await supabase.auth.getSession();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        status: "down",
        responseTime,
        lastChecked: new Date().toISOString(),
        message: error.message,
      };
    }

    return {
      status: "operational",
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: "down",
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Comprehensive health check
 * Use for monitoring dashboards and detailed diagnostics
 */
export async function healthCheck(): Promise<HealthStatus> {
  const startTime = performance.now();

  // Check all services in parallel
  const [database, storage, auth] = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkAuthHealth(),
  ]);

  // Determine overall health status
  const allOperational = [database, storage, auth].every(
    (s) => s.status === "operational"
  );
  const anyDown = [database, storage, auth].some((s) => s.status === "down");

  const status: HealthStatus["status"] = (() => {
    if (anyDown) return "unhealthy";
    if (allOperational) return "healthy";
    return "degraded";
  })();

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: performance.now() - startTime,
    version: import.meta.env.VITE_APP_VERSION || "unknown",
    services: {
      database,
      storage,
      auth,
    },
  };
}

/**
 * Simple readiness check
 * Use for load balancer health checks and deployment readiness
 * Returns quickly - only checks critical services
 */
export async function readinessCheck(): Promise<ReadinessCheck> {
  try {
    // Only check database - the critical dependency
    const dbHealth = await checkDatabaseHealth();
    const databaseReady = dbHealth.status !== "down";

    return {
      ready: databaseReady,
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseReady,
        requiredServices: databaseReady, // Add more required services here
      },
    };
  } catch {
    return {
      ready: false,
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        requiredServices: false,
      },
    };
  }
}

/**
 * Liveness check
 * Most basic check - just returns 200 if the app is running
 */
export function livenessCheck(): { alive: boolean; timestamp: string } {
  return {
    alive: true,
    timestamp: new Date().toISOString(),
  };
}
