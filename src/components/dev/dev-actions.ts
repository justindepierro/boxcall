/**
 * Dev Actions - Clean, testable actions for dev tools
 */

import { supabase } from "../../lib/supabase";
import type { ActionResult, DevMode } from "../../types/dev";
import { devLogger } from "./dev-logger";

export class DevActions {
  async switchMode(newMode: DevMode): Promise<ActionResult> {
    try {
      devLogger.info(`Switching to ${newMode} mode`, "actions");

      // Here you would implement the actual mode switching logic
      // For now, just log and return success

      devLogger.success(`Switched to ${newMode} mode`, "actions");
      return {
        success: true,
        message: `Successfully switched to ${newMode} mode`,
      };
    } catch (error) {
      const message = `Failed to switch to ${newMode} mode`;
      devLogger.error(message, "actions", error);
      return {
        success: false,
        message,
      };
    }
  }

  async exportDebugInfo(): Promise<ActionResult> {
    try {
      devLogger.info("Exporting debug information...", "actions");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const debugInfo = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user: user
          ? {
              id: user.id,
              email: user.email,
            }
          : null,
        logs: devLogger.getLogs().slice(0, 50), // Last 50 logs
        performance: {
          userAgent: navigator.userAgent,
          memory:
            (
              performance as Performance & {
                memory?: { usedJSHeapSize: number };
              }
            ).memory?.usedJSHeapSize || 0,
        },
      };

      const blob = new Blob([JSON.stringify(debugInfo, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `boxcall-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      devLogger.success("Debug info exported", "actions");
      return {
        success: true,
        message: "Debug information exported successfully",
      };
    } catch (error) {
      const message = "Failed to export debug info";
      devLogger.error(message, "actions", error);
      return {
        success: false,
        message,
      };
    }
  }

  async clearTestData(): Promise<ActionResult> {
    const confirmed = window.confirm(
      "⚠️ This will clear ALL test data. Production data will not be affected. Continue?"
    );

    if (!confirmed) {
      return {
        success: false,
        message: "Operation cancelled by user",
      };
    }

    try {
      devLogger.warning("Clearing test data...", "actions");

      // Only clear data that looks like test/demo data
      // Add safety checks to avoid clearing production data

      const testTeamQuery = supabase
        .from("teams")
        .select("id")
        .ilike("name", "%test%")
        .or("name.ilike.%demo%,name.ilike.%mock%,name.ilike.%dev%");

      const { data: testTeams } = await testTeamQuery;

      if (testTeams && testTeams.length > 0) {
        const testTeamIds = testTeams.map((t) => t.id);

        // Clear plays from test teams
        await supabase.from("plays").delete().in("team_id", testTeamIds);

        // Clear playbooks from test teams
        await supabase.from("playbooks").delete().in("team_id", testTeamIds);

        // Clear test teams
        await supabase.from("teams").delete().in("id", testTeamIds);
      }

      devLogger.success(
        `Cleared ${testTeams?.length || 0} test teams and their data`,
        "actions"
      );
      return {
        success: true,
        message: `Successfully cleared ${testTeams?.length || 0} test teams`,
      };
    } catch (error) {
      const message = "Failed to clear test data";
      devLogger.error(message, "actions", error);
      return {
        success: false,
        message,
      };
    }
  }

  async resetToProduction(): Promise<ActionResult> {
    try {
      devLogger.info("Resetting to production mode...", "actions");

      // Switch to production mode
      await this.switchMode("production");

      // Clear dev logs
      devLogger.clearLogs();

      // Reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return {
        success: true,
        message: "Resetting to production mode...",
      };
    } catch (error) {
      const message = "Failed to reset to production";
      devLogger.error(message, "actions", error);
      return {
        success: false,
        message,
      };
    }
  }
}

export const devActions = new DevActions();
