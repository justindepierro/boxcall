/**
 * usePlaySelection Hook
 * Manages play selection for bulk operations
 */

import { useCallback } from "react";
import type { Play } from "../../../../types/play";

interface UsePlaySelectionProps {
  selectedPlayIds: Set<string>;
  onPlaySelectionChange?: (playIds: Set<string>) => void;
  displayPlays: Play[];
}

export function usePlaySelection({
  selectedPlayIds,
  onPlaySelectionChange,
  displayPlays,
}: UsePlaySelectionProps) {
  const handlePlaySelect = useCallback(
    (playId: string, selected: boolean) => {
      if (!onPlaySelectionChange) return;
      const newSelection = new Set(selectedPlayIds);
      if (selected) newSelection.add(playId);
      else newSelection.delete(playId);
      onPlaySelectionChange(newSelection);
    },
    [onPlaySelectionChange, selectedPlayIds]
  );

  const handleSelectAll = useCallback(() => {
    if (!onPlaySelectionChange) return;
    const currentIds = new Set(displayPlays.map((p) => p.id));
    const allVisibleSelected = displayPlays.every((p) =>
      selectedPlayIds.has(p.id)
    );

    if (allVisibleSelected) {
      // Deselect all visible plays
      const newSelection = new Set(selectedPlayIds);
      displayPlays.forEach((p) => newSelection.delete(p.id));
      onPlaySelectionChange(newSelection);
    } else {
      // Select all visible plays
      onPlaySelectionChange(
        new Set([...Array.from(selectedPlayIds), ...Array.from(currentIds)])
      );
    }
  }, [onPlaySelectionChange, displayPlays, selectedPlayIds]);

  return {
    handlePlaySelect,
    handleSelectAll,
  };
}
