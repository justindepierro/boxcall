import { useState, useEffect, useCallback, useRef } from "react";

import { useAuth } from "../app/auth-store";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { supabase } from "../lib/supabase";
import { api } from "../lib/api";
import { NetworkResilience } from "../utils/networkResilience";
import { debug, warn, error as logError } from "../utils/logger";
import type { Formation } from "../types/formation";

interface Team {
  id: string;
  name: string;
  school_name?: string;
  mascot?: string;
  season_year?: number;
  created_at: string;
  updated_at: string;
}

interface Playbook {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

// Database play type (raw from Supabase)
interface DatabasePlay {
  id: string;
  playbook_id: string;
  formation: string;
  play_name: string;
  one_word_play?: string;
  p_type: string;
  personnel?: string;
  f_type?: string;
  f_dir?: string;
  protection?: string;
  p_dir?: string;
  r_str?: string;
  p_str?: string;
  pref_down?: string;
  pref_dis?: string;
  pref_hash?: string;
  pref_cov?: string;
  pref_front?: string;
  ftag1?: string;
  ftag2?: string;
  p_tag1?: string;
  p_tag2?: string;
  back_align?: string;
  shift?: string;
  motion?: string;
  key_player1?: string;
  key_player2?: string;
  check_into?: string;
  notes?: string;
  confidence_base?: number;
  times_called?: number;
  times_successful?: number;
  diagram_url?: string | null; // Matches DB schema - see src/types/supabase-schema.ts:840
  diagram_image_url?: string | null; // Uploaded diagram image URL
  diagram_data?: any | null; // JSONB field for Pixi.js diagram data
  wristband_number?: string | null;
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 50; // Reduced from 100 for faster initial load
const TEAM_FIELDS =
  "id, name, school_name, mascot, season_year, created_at, updated_at";
const PLAYBOOK_FIELDS =
  "id, team_id, name, description, is_active, play_count, created_at, updated_at";
const PLAY_SELECT_FIELDS =
  "id, playbook_id, formation, play_name, one_word_play, p_type, personnel, f_type, f_dir, p_dir, diagram_url, diagram_image_url, wristband_number, confidence_base, times_called, times_successful, created_at, updated_at";

export function useTeamsData(teamIdOverride?: string | null) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [plays, setPlays] = useState<DatabasePlay[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user: _user } = useAuth(); // DEMO MODE: Not used during demo
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const teamId = teamIdOverride ?? activeTeamId;

  // Pagination state for plays
  const [playsPage, setPlaysPage] = useState(0);
  const [hasMorePlays, setHasMorePlays] = useState(true);
  const [loadingMorePlays, setLoadingMorePlays] = useState(false);
  const [totalPlaysCount, setTotalPlaysCount] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Use main supabase client (now configured with service role key for demo)

  // Function to manually refresh data (resets pagination)
  const refreshData = useCallback(() => {
    setPlaysPage(0);
    setHasMorePlays(true);
    setPlays([]);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Function to update a play
  const updatePlay = useCallback(
    async (playId: string, updates: Partial<DatabasePlay>) => {
      try {
        debug("[useTeamsData] Updating play:", {
          playId,
          updates,
          "updates.f_dir": updates.f_dir,
          "updates.p_dir": updates.p_dir,
        });

        const { data, error } = await supabase
          .from("plays")
          // @ts-expect-error - Supabase type issue with plays table update
          .update(updates)
          .eq("id", playId)
          .select()
          .single();

        if (error) {
          logError("[useTeamsData] Error updating play:", error);
          throw new Error(`Failed to update play: ${error.message}`);
        }

        debug("[useTeamsData] Database returned:", data);
        debug("[useTeamsData] Database returned f_dir:", (data as any)?.f_dir);
        debug("[useTeamsData] Database returned p_dir:", (data as any)?.p_dir);

        // Update local state with the data returned from database
        // Use 'data' instead of 'updates' to ensure we have the actual database values
        setPlays((prevPlays) => {
          const updated = prevPlays.map((play) =>
            play.id === playId ? (data as DatabasePlay) : play
          );
          const updatedPlay = updated.find((p) => p.id === playId);
          debug("[useTeamsData] Updated local state for play:", updatedPlay);
          debug("[useTeamsData] Updated play f_dir:", updatedPlay?.f_dir);
          debug("[useTeamsData] Updated play p_dir:", updatedPlay?.p_dir);
          return updated;
        });

        return data;
      } catch (err) {
        logError("[useTeamsData] Error in updatePlay:", err);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let isMounted = true;

    const resetScopedState = () => {
      setTeams([]);
      setPlaybooks([]);
      setPlays([]);
      setFormations([]);
      setTotalPlaysCount(null);
      setHasMorePlays(false);
      setPlaysPage(0);
    };

    if (!teamId) {
      resetScopedState();
      setLoading(false);
      // Don't set an error - this is a valid state when no team is selected yet
      // The UI should show a team selection prompt instead of an error state
      setError(null);
      return () => {
        isMounted = false;
        controller.abort();
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      };
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        debug(
          "[useTeamsData] 🔍 Starting fetchData with ApiClient for teamId:",
          teamId
        );

        // Step 1: Fetch teams and playbooks in parallel using unified ApiClient
        const [teamsResult, playbooksResult] = await Promise.all([
          api("teams")
            .select(TEAM_FIELDS)
            .eq("id", teamId)
            .order("created_at", { ascending: false }),
          api("playbooks")
            .select(PLAYBOOK_FIELDS)
            .eq("team_id", teamId)
            .order("created_at", { ascending: false }),
        ]);

        if (!isMounted || controller.signal.aborted) {
          return;
        }

        debug("[useTeamsData] 📦 Teams result:", teamsResult);
        debug("[useTeamsData] 📦 Playbooks result:", playbooksResult);

        if (teamsResult.error) {
          logError("Error fetching teams:", teamsResult.error);
          setError(`Failed to fetch teams: ${teamsResult.error.message}`);
          setLoading(false);
          return;
        }
        setTeams(teamsResult.data || []);

        let scopedPlaybooks: any[] = [];
        if (playbooksResult.error) {
          warn("Playbooks table not available:", playbooksResult.error.message);
          setPlaybooks([]);
        } else {
          // For now, we'll set play_count to 0 and update later
          scopedPlaybooks = (playbooksResult.data || []).map((pb: any) => ({
            ...pb,
            play_count: 0,
          }));
          setPlaybooks(scopedPlaybooks);
        }

        const playbookIds = scopedPlaybooks.map((pb) => pb.id);
        debug("[useTeamsData] 📚 Playbook IDs:", playbookIds);

        if (playbookIds.length === 0) {
          debug("[useTeamsData] ⚠️ No playbooks found, skipping plays fetch");
          setFormations([]);
          setPlays([]);
          setTotalPlaysCount(0);
          setHasMorePlays(false);
          setPlaysPage(0);
          setLoading(false);
          return;
        }

        // Step 2: Fetch formations and plays in parallel using unified ApiClient
        const [formationsResult, playsResult] = await Promise.all([
          api("formations")
            .select("*")
            .in("playbook_id", playbookIds)
            .order("created_at", { ascending: false }),
          api("plays")
            .select(PLAY_SELECT_FIELDS)
            .in("playbook_id", playbookIds)
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE),
        ]);

        if (!isMounted || controller.signal.aborted) {
          return;
        }

        debug("[useTeamsData] 🎭 Formations result:", formationsResult);
        debug("[useTeamsData] 🏈 Plays result:", playsResult);

        if (formationsResult.error) {
          warn(
            "Formations table not available:",
            formationsResult.error.message
          );
        } else {
          setFormations((formationsResult.data || []) as Formation[]);
        }

        if (playsResult.error) {
          warn("Plays table not available:", playsResult.error.message);
        } else {
          const playsData = (playsResult.data || []) as DatabasePlay[];
          debug("[useTeamsData] ✅ Loaded", playsData.length, "plays");
          setHasMorePlays(playsData.length === PAGE_SIZE);
          setPlays(playsData);
          setTotalPlaysCount(playsData.length); // Set count from actual data
        }

        setPlaysPage(0);
        setLoading(false);
        debug("[useTeamsData] ✅ fetchData complete!");
      } catch (err) {
        if (controller.signal.aborted || !isMounted) {
          return;
        }
        logError("Unexpected error in fetchData:", err);
        setError("An unexpected error occurred while fetching data");
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    };
  }, [refreshTrigger, teamId]);

  // Function to load more plays (for infinite scroll)
  const loadMorePlays = useCallback(async () => {
    if (loadingMorePlays || !hasMorePlays || !teamId) {
      return;
    }

    const playbookIds = playbooks.map((pb) => pb.id);
    if (playbookIds.length === 0) {
      setHasMorePlays(false);
      return;
    }

    try {
      setLoadingMorePlays(true);
      const nextPage = playsPage + 1;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Query only essential fields for faster loading
      const { data, error } = await NetworkResilience.retryWithBackoff(() =>
        supabase
          .from("plays")
          .select(PLAY_SELECT_FIELDS)
          .in("playbook_id", playbookIds)
          .order("created_at", { ascending: false })
          .range(from, to)
      );

      if (error) {
        logError("Error loading more plays:", error);
        setError(`Failed to load more plays: ${error.message}`);
        return;
      }

      const newPlays = (data || []) as DatabasePlay[];

      // Append new plays to existing ones
      setPlays((prevPlays) => [...prevPlays, ...newPlays]);
      setPlaysPage(nextPage);

      // Check if there are more plays to load
      setHasMorePlays(newPlays.length === PAGE_SIZE);
    } catch (err) {
      logError("Error in loadMorePlays:", err);
      setError("Failed to load more plays");
    } finally {
      setLoadingMorePlays(false);
    }
  }, [hasMorePlays, loadingMorePlays, playbooks, playsPage, teamId]);

  return {
    teams,
    playbooks,
    plays,
    formations,
    loading,
    error,
    refreshData,
    updatePlay,
    totalCount: teams.length + playbooks.length + plays.length,
    // Pagination state and functions
    hasMorePlays,
    loadingMorePlays,
    totalPlaysCount,
    loadMorePlays,
  };
}
