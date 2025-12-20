/**
 * usePlaybookSelection - Hook for managing playbook selection and persistence
 *
 * Handles:
 * - Loading saved playbook preference from localStorage
 * - Defaulting to first playbook with plays
 * - Persisting selection changes
 * - Providing active playbook ID
 */

import { useState, useEffect, useCallback } from "react";
import type { Database } from "../../types/database";
import {
  readLocalString,
  storageKeys,
  writeLocalString,
} from "../../utils/storage";

type Playbook = Database["public"]["Tables"]["playbooks"]["Row"];

interface UsePlaybookSelectionOptions {
  playbooks: Playbook[];
  activeTeamId: string;
}

export function usePlaybookSelection({
  playbooks,
  activeTeamId,
}: UsePlaybookSelectionOptions) {
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");

  // Initialize selected playbook from preferences or default to first playbook with data
  useEffect(() => {
    if (playbooks.length === 0) return;

    // Try to load from preferences
    const savedPlaybookId = readLocalString(
      storageKeys.playbook.activePlaybookForTeam(activeTeamId)
    );

    if (savedPlaybookId && playbooks.some((pb) => pb.id === savedPlaybookId)) {
      // Use saved preference if it's valid
      setSelectedPlaybookId(savedPlaybookId);
    } else {
      // Default to first playbook with plays, or first playbook
      const playbookWithPlays = playbooks.find(
        (pb) => (pb.play_count || 0) > 0
      );
      const defaultPlaybook = playbookWithPlays || playbooks[0];
      setSelectedPlaybookId(defaultPlaybook.id);
    }
  }, [activeTeamId, playbooks]);

  // Save preference when playbook changes
  const handlePlaybookChange = useCallback(
    (playbookId: string) => {
      setSelectedPlaybookId(playbookId);
      writeLocalString(
        storageKeys.playbook.activePlaybookForTeam(activeTeamId),
        playbookId
      );
    },
    [activeTeamId]
  );

  const activePlaybookId = selectedPlaybookId || activeTeamId || ""; // Fallback to team_id

  return {
    selectedPlaybookId,
    activePlaybookId,
    handlePlaybookChange,
  };
}
