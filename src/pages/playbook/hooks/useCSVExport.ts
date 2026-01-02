/**
 * useCSVExport Hook
 * Extracted from PlaybookPage.tsx - Handles playbook CSV export logic
 */

import { useCallback } from "react";
import { PlaysService } from "../../../services/playsService";
import { exportPlays } from "../../../services/exportService";
import { useToast } from "../../../hooks/useToast";
import { logError } from "../../../utils/logger";

export function useCSVExport(
  activePlaybookId: string | null,
  teamPlaybooks: any[]
) {
  const toast = useToast();

  const handleExportCSV = useCallback(async () => {
    if (!activePlaybookId) {
      toast.warning("Select a playbook first");
      return;
    }

    try {
      const plays = await PlaysService.getPlaysByPlaybook(activePlaybookId);
      if (plays.length === 0) {
        toast.info("No plays to export");
        return;
      }

      const playbookName =
        teamPlaybooks?.find((p) => p?.id === activePlaybookId)?.name ||
        "playbook";
      const safeName = String(playbookName)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
      const date = new Date().toISOString().split("T")[0];

      exportPlays(plays, {
        format: "csv",
        filename: `boxcall-${safeName || "playbook"}-${date}.csv`,
        includeMetadata: true,
      });
      toast.success(`Exported ${plays.length} plays to CSV`);
    } catch (err) {
      logError("Playbook CSV export failed:", err);
      toast.error("Failed to export CSV");
    }
  }, [activePlaybookId, teamPlaybooks, toast]);

  return { handleExportCSV };
}
