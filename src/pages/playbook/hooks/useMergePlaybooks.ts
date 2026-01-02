/**
 * useMergePlaybooks Hook
 * Extracted from PlaybookPage.tsx - Handles playbook merging logic
 */

import { useCallback } from "react";
import { PlaysService } from "../../../services/playsService";
import { logError } from "../../../utils/logger";

export function useMergePlaybooks(
  activeTeamId: string | null,
  onRefreshData?: () => void
) {
  const handleMergePlaybooks = useCallback(
    async (
      sourcePlaybookIds: string[],
      newPlaybookName: string,
      newPlaybookDescription?: string
    ) => {
      try {
        await PlaysService.mergePlaybooks(
          sourcePlaybookIds,
          newPlaybookName,
          newPlaybookDescription,
          activeTeamId || undefined
        );
        // Refresh playbooks list after merge
        onRefreshData?.();
      } catch (error) {
        logError("Failed to merge playbooks:", error);
        throw error;
      }
    },
    [activeTeamId, onRefreshData]
  );

  return { handleMergePlaybooks };
}
