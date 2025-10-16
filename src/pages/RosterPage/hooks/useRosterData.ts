/**
 * useRosterData Hook
 * 
 * Manages roster data with React Query caching
 * - Automatic caching and refetching
 * - Stale-while-revalidate pattern
 * - Multi-tab synchronization
 * - Background refetch on focus
 * 
 * @version 2.0.0 - React Query integration
 */

import { useState, useCallback, useEffect } from 'react';
import { useRosterQuery } from '../../../hooks/useRosterQueries';
import type { RosterPlayerView } from '../../../services/rosterService';
import { getActiveTeamId } from '../../../utils/activeTeam';
import { useToast } from '../../../hooks/useToast';
import { info, error as logError } from '../../../utils/logger';

export interface UseRosterDataReturn {
  players: RosterPlayerView[];
  setPlayers: React.Dispatch<React.SetStateAction<RosterPlayerView[]>>;
  loading: boolean;
  teamId: string | null;
  loadRoster: () => Promise<void>;
}

export const useRosterData = (): UseRosterDataReturn => {
  const toast = useToast();
  const teamId = getActiveTeamId();

  // Use React Query for data fetching with caching
  const { data: queryPlayers, isLoading, error, refetch } = useRosterQuery(teamId);

  // Local state for optimistic updates (maintains backward compatibility)
  const [localPlayers, setLocalPlayers] = useState<RosterPlayerView[]>([]);

  // Sync query data to local state
  useEffect(() => {
    if (queryPlayers) {
      setLocalPlayers(queryPlayers);
      info('[useRosterData] Synced', queryPlayers.length, 'players from cache');
    }
  }, [queryPlayers]);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      logError('[useRosterData] Failed to load roster:', error);
      toast.error('Failed to load roster. Please try again.');
    }
  }, [error, toast]);

  // Refetch function (maintains backward compatibility with loadRoster)
  const loadRoster = useCallback(async () => {
    if (!teamId) return;
    
    info('[useRosterData] Refetching roster for team:', teamId);
    try {
      await refetch();
    } catch (err) {
      logError('[useRosterData] Refetch failed:', err);
      // Error toast already shown by useEffect above
    }
  }, [teamId, refetch]);

  return {
    players: localPlayers,
    setPlayers: setLocalPlayers,
    loading: isLoading,
    teamId,
    loadRoster,
  };
};
