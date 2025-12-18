import { useState, useEffect, useCallback, useRef } from "react";

import { useAuth } from "../app/auth-store";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { supabase } from "../lib/supabase";
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

const PAGE_SIZE = 50;
const TEAM_FIELDS =
  "id, name, school_name, mascot, season_year, created_at, updated_at";
const PLAYBOOK_FIELDS =
  "id, team_id, name, description, is_active, play_count, created_at, updated_at";
const PLAY_SELECT_FIELDS =
  "id, playbook_id, formation, play_name, one_word_play, p_type, personnel, f_type, f_dir, p_dir, protection, r_str, p_str, pref_down, pref_dis, pref_hash, pref_cov, pref_front, ftag1, ftag2, p_tag1, p_tag2, back_align, back_left_of_qb, back_right_of_qb, shift, motion, key_player1, key_player2, check_into, notes, diagram_url, diagram_image_url, wristband_number, confidence_base, times_called, times_successful, created_at, updated_at";

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
        debug("[useTeamsData] Updating play:", { playId, updates });
        const { data, error } = await supabase
          .from("plays")
          .update(updates)
          .eq("id", playId)
          .select()
          .maybeSingle(); // Use maybeSingle() to avoid 406 error when RLS blocks or row missing

        if (error) {
          logError("[useTeamsData] Error updating play:", error);
          throw new Error(`Failed to update play: ${error.message}`);
        }

        // If no data returned, the play doesn't exist or RLS blocked it
        if (!data) {
          logError("[useTeamsData] Play not found or access denied:", playId);
          throw new Error(
            "Play not found or you don't have permission to update it"
          );
        }

        debug("[useTeamsData] Database returned:", data);
        setPlays((prevPlays) =>
          prevPlays.map((play) =>
            play.id === playId ? (data as DatabasePlay) : play
          )
        );
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

    const teamIdForQuery: string = teamId;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        debug("[useTeamsData] Starting fetchData for teamId:", teamId);

        // Step 1: Fetch teams and playbooks in parallel
        const [teamsResult, playbooksResult] = await Promise.all([
          supabase
            .from("teams")
            .select(TEAM_FIELDS)
            .eq("id", teamIdForQuery)
            .order("created_at", { ascending: false }),
          supabase
            .from("playbooks")
            .select(PLAYBOOK_FIELDS)
            .eq("team_id", teamIdForQuery)
            .order("created_at", { ascending: false }),
        ]);

        if (!isMounted || controller.signal.aborted) return;

        if (teamsResult.error) {
          logError("[useTeamsData] Error fetching teams:", teamsResult.error);
          setError(`Failed to fetch teams: ${teamsResult.error.message}`);
          setLoading(false);
          return;
        }
        setTeams(
          (teamsResult.data || []).map((t) => ({
            id: String((t as any).id),
            name: String((t as any).name),
            school_name: (t as any).school_name ?? undefined,
            mascot: (t as any).mascot ?? undefined,
            season_year: (t as any).season_year ?? undefined,
            created_at: String((t as any).created_at ?? ""),
            updated_at: String((t as any).updated_at ?? ""),
          }))
        );

        let scopedPlaybooks: any[] = [];
        if (playbooksResult.error) {
          warn("Playbooks table not available:", playbooksResult.error.message);
          setPlaybooks([]);
        } else {
          scopedPlaybooks = (playbooksResult.data || []).map((pb: any) => ({
            ...pb,
            play_count: 0,
          }));
          setPlaybooks(scopedPlaybooks);
        }

        const playbookIds = scopedPlaybooks.map((pb) => pb.id);
        if (playbookIds.length === 0) {
          debug("[useTeamsData] No playbooks found");
          setFormations([]);
          setPlays([]);
          setTotalPlaysCount(0);
          setHasMorePlays(false);
          setPlaysPage(0);
          setLoading(false);
          return;
        }

        // Step 2: Fetch formations and plays in parallel
        const [formationsResult, playsResult] = await Promise.all([
          supabase
            .from("formations")
            .select("*")
            .in("playbook_id", playbookIds)
            .order("created_at", { ascending: false }),
          supabase
            .from("plays")
            .select(PLAY_SELECT_FIELDS)
            .in("playbook_id", playbookIds)
            .order("created_at", { ascending: false })
            .limit(PAGE_SIZE),
        ]);

        if (!isMounted || controller.signal.aborted) return;

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
          debug("[useTeamsData] Loaded", playsData.length, "plays");
          setHasMorePlays(playsData.length === PAGE_SIZE);
          setPlays(playsData);
          setTotalPlaysCount(playsData.length);
        }

        setPlaysPage(0);
        setLoading(false);
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
      const { data, error } = await NetworkResilience.retryWithBackoff(
        async () =>
          (await supabase
            .from("plays")
            .select(PLAY_SELECT_FIELDS)
            .in("playbook_id", playbookIds)
            .order("created_at", { ascending: false })
            .range(from, to)) as any
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
