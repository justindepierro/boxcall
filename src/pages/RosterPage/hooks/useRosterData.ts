/**
 * useRosterData Hook
 * 
 * Manages roster data fetching and state
 * - Loads players from the API
 * - Handles loading states
 * - Manages team ID
 * - Provides refresh functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { rosterService } from '../../../services';
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
  const [players, setPlayers] = useState<RosterPlayerView[]>([]);
  const [loading, setLoading] = useState(true);
  const teamId = getActiveTeamId();

  // Load roster data
  const loadRoster = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      info('[useRosterData] Loading roster for team:', teamId);
      const rosterData = await rosterService.listByTeam(teamId);
      setPlayers(rosterData);
      info('[useRosterData] Loaded', rosterData.length, 'players');
    } catch (error) {
      logError('[useRosterData] Failed to load roster:', error);
      toast.error('Failed to load roster. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  // Load on mount
  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  return {
    players,
    setPlayers,
    loading,
    teamId,
    loadRoster,
  };
};
