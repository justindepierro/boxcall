/**
 * usePlaySelection Hook
 *
 * Manages multi-select state for plays in the playbook
 * Provides selection toggle, select all, clear, and filter-aware operations
 *
 * Phase 3: Multi-Select & Play Collections
 */

import { useCallback, useMemo } from "react";
import type { Play } from "../types/play";

export interface UsePlaySelectionOptions {
  selectedPlayIds: Set<string>;
  onSelectionChange: (selection: Set<string>) => void;
  allPlayIds?: string[]; // All available play IDs (for select all)
}

export interface UsePlaySelectionReturn {
  selectedPlayIds: Set<string>;
  selectedCount: number;
  isSelected: (playId: string) => boolean;
  toggleSelection: (playId: string) => void;
  selectAll: (playIds: string[]) => void;
  clearSelection: () => void;
  selectMultiple: (playIds: string[]) => void;
  deselectMultiple: (playIds: string[]) => void;
  isAllSelected: (playIds: string[]) => boolean;
  isSomeSelected: (playIds: string[]) => boolean;
}

/**
 * Hook for managing play selection state
 */
export function usePlaySelection({
  selectedPlayIds,
  onSelectionChange,
}: UsePlaySelectionOptions): UsePlaySelectionReturn {
  const selectedCount = selectedPlayIds.size;

  // Check if a play is selected
  const isSelected = useCallback(
    (playId: string): boolean => {
      return selectedPlayIds.has(playId);
    },
    [selectedPlayIds]
  );

  // Toggle a single play's selection
  const toggleSelection = useCallback(
    (playId: string) => {
      const newSelection = new Set(selectedPlayIds);
      if (newSelection.has(playId)) {
        newSelection.delete(playId);
      } else {
        newSelection.add(playId);
      }
      onSelectionChange(newSelection);
    },
    [selectedPlayIds, onSelectionChange]
  );

  // Select all plays
  const selectAll = useCallback(
    (playIds: string[]) => {
      const newSelection = new Set(playIds);
      onSelectionChange(newSelection);
    },
    [onSelectionChange]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  // Select multiple plays
  const selectMultiple = useCallback(
    (playIds: string[]) => {
      const newSelection = new Set(selectedPlayIds);
      playIds.forEach((id) => newSelection.add(id));
      onSelectionChange(newSelection);
    },
    [selectedPlayIds, onSelectionChange]
  );

  // Deselect multiple plays
  const deselectMultiple = useCallback(
    (playIds: string[]) => {
      const newSelection = new Set(selectedPlayIds);
      playIds.forEach((id) => newSelection.delete(id));
      onSelectionChange(newSelection);
    },
    [selectedPlayIds, onSelectionChange]
  );

  // Check if all plays in list are selected
  const isAllSelected = useCallback(
    (playIds: string[]): boolean => {
      if (playIds.length === 0) return false;
      return playIds.every((id) => selectedPlayIds.has(id));
    },
    [selectedPlayIds]
  );

  // Check if some (but not all) plays in list are selected
  const isSomeSelected = useCallback(
    (playIds: string[]): boolean => {
      if (playIds.length === 0) return false;
      const selectedInList = playIds.filter((id) => selectedPlayIds.has(id));
      return (
        selectedInList.length > 0 && selectedInList.length < playIds.length
      );
    },
    [selectedPlayIds]
  );

  return useMemo(
    () => ({
      selectedPlayIds,
      selectedCount,
      isSelected,
      toggleSelection,
      selectAll,
      clearSelection,
      selectMultiple,
      deselectMultiple,
      isAllSelected,
      isSomeSelected,
    }),
    [
      selectedPlayIds,
      selectedCount,
      isSelected,
      toggleSelection,
      selectAll,
      clearSelection,
      selectMultiple,
      deselectMultiple,
      isAllSelected,
      isSomeSelected,
    ]
  );
}

/**
 * Get selected plays from selection state
 */
export function getSelectedPlays(
  plays: Play[],
  selectedPlayIds: Set<string>
): Play[] {
  return plays.filter((play) => selectedPlayIds.has(play.id));
}

/**
 * Filter selection to only valid play IDs
 */
export function filterValidSelection(
  selection: Set<string>,
  validPlayIds: string[]
): Set<string> {
  const validSet = new Set(validPlayIds);
  const filtered = new Set<string>();
  selection.forEach((id) => {
    if (validSet.has(id)) {
      filtered.add(id);
    }
  });
  return filtered;
}
