import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../app/auth-store";
import { supabase } from "../lib/supabase";
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

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [plays, setPlays] = useState<DatabasePlay[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user: _user } = useAuth(); // DEMO MODE: Not used during demo

  // Pagination state for plays
  const [playsPage, setPlaysPage] = useState(0);
  const [hasMorePlays, setHasMorePlays] = useState(true);
  const [loadingMorePlays, setLoadingMorePlays] = useState(false);
  const [totalPlaysCount, setTotalPlaysCount] = useState<number | null>(null);

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
        console.log("[useTeamsData] Updating play:", {
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
          console.error("[useTeamsData] Error updating play:", error);
          throw new Error(`Failed to update play: ${error.message}`);
        }

        console.log("[useTeamsData] Database returned:", data);
        console.log(
          "[useTeamsData] Database returned f_dir:",
          (data as any)?.f_dir
        );
        console.log(
          "[useTeamsData] Database returned p_dir:",
          (data as any)?.p_dir
        );

        // Update local state with the data returned from database
        // Use 'data' instead of 'updates' to ensure we have the actual database values
        setPlays((prevPlays) => {
          const updated = prevPlays.map((play) =>
            play.id === playId ? (data as DatabasePlay) : play
          );
          const updatedPlay = updated.find((p) => p.id === playId);
          console.log(
            "[useTeamsData] Updated local state for play:",
            updatedPlay
          );
          console.log("[useTeamsData] Updated play f_dir:", updatedPlay?.f_dir);
          console.log("[useTeamsData] Updated play p_dir:", updatedPlay?.p_dir);
          return updated;
        });

        return data;
      } catch (err) {
        console.error("[useTeamsData] Error in updatePlay:", err);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    async function fetchData() {
      // DEMO MODE: Skip auth check to allow data fetching without user
      // if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // 🐛 MOBILE DEBUG: Log fetch start
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          console.log("📱 [Mobile Debug - useTeamsData] Starting data fetch", {
            timestamp: new Date().toISOString(),
            hasSupabaseUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
          });
        }

        // 🚀 PERFORMANCE: Fetch all data in PARALLEL instead of sequentially
        // This reduces total load time from ~2s to ~500ms
        const startTime = performance.now();

        const [
          teamsResult,
          playbooksResult,
          formationsResult,
          playsCountResult,
          playsResult,
        ] = await Promise.all([
          // Fetch teams
          supabase
            .from("teams")
            .select("*")
            .order("created_at", { ascending: false }),

          // Fetch playbooks with play count
          supabase
            .from("playbooks")
            .select(`*, plays:plays(count)`)
            .order("created_at", { ascending: false }),

          // Fetch formations
          supabase
            .from("formations")
            .select("*")
            .order("created_at", { ascending: false }),

          // Fetch total play count (fast, head-only query)
          supabase
            .from("plays")
            .select("*", { count: "exact", head: true }),

          // Fetch first page of plays - only essential fields for faster load
          supabase
            .from("plays")
            .select("id, playbook_id, formation, play_name, one_word_play, p_type, personnel, f_type, f_dir, p_dir, diagram_url, diagram_image_url, wristband_number, confidence_base, times_called, times_successful, created_at, updated_at")
            .order("created_at", { ascending: false })
            .range(0, PAGE_SIZE - 1),
        ]);

        const fetchTime = performance.now() - startTime;
        if (isMobile) {
          console.log(`📱 [Mobile Debug] Parallel fetch completed in ${fetchTime.toFixed(0)}ms`);
        }

        // Process teams
        if (teamsResult.error) {
          console.error("Error fetching teams:", teamsResult.error);
          setError(`Failed to fetch teams: ${teamsResult.error.message}`);
          return;
        }
        setTeams(teamsResult.data || []);

        // Process playbooks
        if (playbooksResult.error) {
          console.warn("Playbooks table not available:", playbooksResult.error.message);
        } else {
          const playbooksData = (playbooksResult.data || []).map((pb: any) => ({
            ...pb,
            play_count: pb.plays?.[0]?.count || 0,
            plays: undefined,
          }));
          setPlaybooks(playbooksData);
        }

        // Process formations
        if (formationsResult.error) {
          console.warn("Formations table not available:", formationsResult.error.message);
        } else {
          setFormations((formationsResult.data || []) as Formation[]);
        }

        // Process play count
        if (playsCountResult.error) {
          console.warn("Error fetching play count:", playsCountResult.error.message);
        } else {
          setTotalPlaysCount(playsCountResult.count ?? 0);
        }

        // Process plays
        if (playsResult.error) {
          console.warn("Plays table not available:", playsResult.error.message);
          if (isMobile) {
            console.log("📱 [Mobile Debug - useTeamsData] Plays fetch error:", {
              error: playsResult.error.message,
              code: playsResult.error.code,
              hint: playsResult.error.hint,
            });
          }
        } else {
          const playsData = playsResult.data || [];
          setHasMorePlays(playsData.length === PAGE_SIZE);
          setPlays(playsData as DatabasePlay[]);
          
          if (isMobile) {
            console.log("📱 [Mobile Debug - useTeamsData] Plays fetched:", {
              count: playsData.length,
              hasMore: playsData.length === PAGE_SIZE,
            });
          }
        }

        setPlaysPage(0);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error in fetchData:", err);
        setError("An unexpected error occurred while fetching data");
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshTrigger]);

  // Function to load more plays (for infinite scroll)
  const loadMorePlays = useCallback(async () => {
    if (loadingMorePlays || !hasMorePlays) {
      return;
    }

    try {
      setLoadingMorePlays(true);
      const nextPage = playsPage + 1;
      const from = nextPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Query only essential fields for faster loading
      const { data, error } = await supabase
        .from("plays")
        .select("id, playbook_id, formation, play_name, one_word_play, p_type, personnel, f_type, f_dir, p_dir, diagram_url, diagram_image_url, wristband_number, confidence_base, times_called, times_successful, created_at, updated_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error loading more plays:", error);
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
      console.error("Error in loadMorePlays:", err);
      setError("Failed to load more plays");
    } finally {
      setLoadingMorePlays(false);
    }
  }, [loadingMorePlays, hasMorePlays, playsPage]);

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
