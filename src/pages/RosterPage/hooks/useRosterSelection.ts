/**
 * useRosterSelection Hook
 * 
 * Manages player selection state for bulk operations
 * - Track selected player IDs
 * - Toggle individual selection
 * - Select all filtered players
 * - Clear selection
 */

import { useState } from 'react';
import type { RosterPlayerView } from '../../../services/rosterService';

export interface UseRosterSelectionReturn {
  selectedPlayerIds: Set<string>;
  togglePlayerSelection: (playerId: string) => void;
  selectAll: (filteredPlayers: RosterPlayerView[]) => void;
  clearSelection: () => void;
  isAllSelected: (filteredPlayers: RosterPlayerView[]) => boolean;
}

export const useRosterSelection = (): UseRosterSelectionReturn => {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const selectAll = (filteredPlayers: RosterPlayerView[]) => {
    setSelectedPlayerIds(new Set(filteredPlayers.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedPlayerIds(new Set());
  };

  const isAllSelected = (filteredPlayers: RosterPlayerView[]) => {
    return filteredPlayers.length > 0 && selectedPlayerIds.size === filteredPlayers.length;
  };

  return {
    selectedPlayerIds,
    togglePlayerSelection,
    selectAll,
    clearSelection,
    isAllSelected,
  };
};
