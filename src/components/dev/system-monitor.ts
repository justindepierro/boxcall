/**
 * System Monitor - Track app performance and status
 */

import { supabase } from "../../lib/supabase";
import type { SystemStatus } from "../../types/dev";
import { devLogger } from "./dev-logger";

class SystemMonitor {
  private lastUpdate = new Date();

  async getSystemStatus(): Promise<SystemStatus> {
    const status: SystemStatus = {
      database: "disconnected",
      auth: "anonymous",
      dataCount: { teams: 0, playbooks: 0, plays: 0 },
      performance: { renderTime: 0, memoryUsage: 0 },
    };

    try {
      // Test database connection
      const { error: dbError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      status.database = dbError ? "error" : "connected";

      // Check auth status
      const {
        data: { user },
      } = await supabase.auth.getUser();
      status.auth = user ? "authenticated" : "anonymous";

      // Get data counts
      const [teamsResult, playbooksResult, playsResult] = await Promise.all([
        supabase.from("teams").select("count", { count: "exact", head: true }),
        supabase
          .from("playbooks")
          .select("count", { count: "exact", head: true }),
        supabase.from("plays").select("count", { count: "exact", head: true }),
      ]);

      status.dataCount = {
        teams: teamsResult.count || 0,
        playbooks: playbooksResult.count || 0,
        plays: playsResult.count || 0,
      };

      // Performance metrics
      status.performance = {
        renderTime: performance.now() % 100,
        memoryUsage:
          (
            performance as Performance & {
              memory?: { usedJSHeapSize: number };
            }
          ).memory?.usedJSHeapSize || 0,
      };

      this.lastUpdate = new Date();
      devLogger.info("System status updated", "monitor");
    } catch (error) {
      devLogger.error("Failed to get system status", "monitor", error);
      status.database = "error";
    }

    return status;
  }

  async testDatabaseConnection(): Promise<boolean> {
    try {
      devLogger.info("Testing database connection...", "monitor");

      const { error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        devLogger.error("Database connection failed", "monitor", error.message);
        return false;
      }

      devLogger.success("Database connection successful", "monitor");
      return true;
    } catch (error) {
      devLogger.error("Database connection error", "monitor", error);
      return false;
    }
  }

  getLastUpdateTime(): Date {
    return this.lastUpdate;
  }
}

export const systemMonitor = new SystemMonitor();
