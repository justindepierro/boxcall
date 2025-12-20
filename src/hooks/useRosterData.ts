/**
 * useRosterData Hook
 *
 * Shared roster data hook (not page-owned).
 *
 * Previously lived under src/pages/RosterPage/hooks. It is used by
 * non-page UI (e.g. playbook modals), so it must live in a shared layer.
 */

import { useState, useCallback, useEffect } from "react";

import { useRosterQuery } from "./useRosterQueries";
import type { RosterPlayerView } from "../services/rosterService";
import { getActiveTeamId } from "../utils/activeTeam";
import { useToast } from "./useToast";
import { info, error as logError } from "../utils/logger";

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

  const {
    data: queryPlayers,
    isLoading,
    error,
    refetch,
  } = useRosterQuery(teamId);

  const [localPlayers, setLocalPlayers] = useState<RosterPlayerView[]>([]);

  useEffect(() => {
    if (queryPlayers) {
      setLocalPlayers(queryPlayers);
      info("[useRosterData] Synced", queryPlayers.length, "players from cache");
    }
  }, [queryPlayers]);

  useEffect(() => {
    if (error) {
      logError("[useRosterData] Failed to load roster:", error);
      toast.error("Failed to load roster. Please try again.");
    }
  }, [error, toast]);

  const loadRoster = useCallback(async () => {
    if (!teamId) return;

    info("[useRosterData] Refetching roster for team:", teamId);
    try {
      await refetch();
    } catch (err) {
      logError("[useRosterData] Refetch failed:", err);
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
