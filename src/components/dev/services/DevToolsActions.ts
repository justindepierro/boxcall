/**
 * DevTools Actions Service
 * Centralized actions for DevTools functionality
 */
import { supabase } from "../../../lib/supabase";
import type { DevLog } from "../types";

export class DevToolsActions {
  constructor(
    private addLog: (
      level: DevLog["level"],
      message: string,
      source?: string
    ) => void,
    private showToast: (
      level: DevLog["level"],
      message: string,
      title?: string
    ) => void
  ) {}

  async testDatabaseConnection() {
    try {
      this.addLog("info", "Testing database connection...", "database");
      this.showToast(
        "info",
        "Testing database connection...",
        "Running connection test"
      );

      const { data: _data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        this.addLog("error", `Database error: ${error.message}`, "database");
        this.showToast(
          "error",
          `Database connection failed: ${error.message}`,
          "Connection Error"
        );
      } else {
        this.addLog("success", "Database connection successful", "database");
        this.showToast(
          "success",
          "Database connected successfully!",
          "Connection established to Supabase"
        );
      }
    } catch (err) {
      this.addLog("error", `Connection failed: ${err}`, "database");
      this.showToast(
        "error",
        `Connection test failed: ${err}`,
        "Unexpected Error"
      );
    }
  }

  exportStateSnapshot(
    user: any,
    profile: any,
    devMode: string,
    teams: any[],
    playbooks: any[],
    plays: any[]
  ) {
    const snapshot = {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile
        ? { id: profile.id, role: profile.role, full_name: profile.full_name }
        : null,
      devMode,
      dataCount: {
        teams: teams.length,
        playbooks: playbooks.length,
        plays: plays.length,
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boxcall-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.addLog("success", "State snapshot exported", "export");
    this.showToast(
      "success",
      "State snapshot downloaded",
      `Exported as boxcall-state-${Date.now()}.json`
    );
  }

  async clearAllData() {
    if (confirm("⚠️ This will clear ALL demo data. Are you sure?")) {
      try {
        this.addLog("warning", "Clearing all demo data...", "data-management");
        this.showToast(
          "warning",
          "Clearing all demo data...",
          "This may take a few seconds"
        );

        // Clear plays first (due to foreign keys)
        await supabase
          .from("plays")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        // Clear playbooks
        await supabase
          .from("playbooks")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");
        // Clear teams
        await supabase
          .from("teams")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000");

        this.addLog("success", "All demo data cleared", "data-management");
        this.showToast(
          "success",
          "All demo data cleared!",
          "Page will refresh to update UI"
        );

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        this.addLog(
          "error",
          `Failed to clear data: ${error}`,
          "data-management"
        );
        this.showToast(
          "error",
          `Failed to clear data: ${error}`,
          "Clear operation failed"
        );
      }
    }
  }

  async reloadDemoData() {
    this.addLog("info", "Reloading demo data...", "data-management");
    this.showToast(
      "info",
      "Preparing to reload demo data...",
      "This will refresh the application"
    );

    if (confirm("🔄 This will reload demo data. Continue?")) {
      try {
        this.addLog(
          "info",
          "Attempting to reload demo data...",
          "data-management"
        );
        this.addLog("info", "Demo data reload initiated", "data-management");
        this.addLog(
          "warning",
          "Note: Run 'node scripts/load-demo-data.mjs' in terminal for full reload",
          "data-management"
        );

        this.showToast(
          "warning",
          "Manual step required",
          "Run 'node scripts/load-demo-data.mjs' in terminal for full reload"
        );

        setTimeout(() => {
          this.addLog(
            "info",
            "Refreshing application to show updated data...",
            "data-management"
          );
          this.showToast(
            "info",
            "Refreshing application...",
            "Loading updated data"
          );
          window.location.reload();
        }, 3000);
      } catch (error) {
        this.addLog(
          "error",
          `Failed to reload data: ${error}`,
          "data-management"
        );
        this.showToast(
          "error",
          `Failed to reload data: ${error}`,
          "Reload operation failed"
        );
      }
    } else {
      this.showToast("info", "Demo data reload cancelled", "No changes made");
    }
  }
}
