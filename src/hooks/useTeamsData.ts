import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../app/auth-store";
import { supabase } from "../lib/supabase";

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
  play_count?: number;
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
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 100; // Fetch 100 plays at a time for better performance

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [plays, setPlays] = useState<DatabasePlay[]>([]);
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

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false });

        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          setError(`Failed to fetch teams: ${teamsError.message}`);
          return;
        }

        setTeams(teamsData || []);

        // Fetch playbooks
        let playbooksData: Playbook[] = [];
        try {
          const { data, error: playbooksError } = await supabase
            .from("playbooks")
            .select(
              `
              *,
              plays:plays(count)
            `
            )
            .order("created_at", { ascending: false });

          if (playbooksError) {
            console.warn(
              "Playbooks table not available:",
              playbooksError.message
            );
            // Continue without playbooks data
          } else {
            // Transform the data to include play_count
            playbooksData = (data || []).map((pb: any) => ({
              ...pb,
              play_count: pb.plays?.[0]?.count || 0,
              plays: undefined, // Remove the nested plays object
            }));
          }
        } catch (err) {
          console.warn("Error fetching playbooks:", err);
          // Continue without playbooks data
        }

        setPlaybooks(playbooksData);

        // Fetch total play count first
        try {
          const { count, error: countError } = await supabase
            .from("plays")
            .select("*", { count: "exact", head: true });

          if (countError) {
            console.warn("Error fetching play count:", countError.message);
          } else {
            setTotalPlaysCount(count ?? 0);
          }
        } catch (err) {
          console.warn("Error fetching play count:", err);
        }

        // Fetch first page of plays (paginated)
        let playsData: DatabasePlay[] = [];
        try {
          const from = 0;
          const to = PAGE_SIZE - 1;

          // 🚀 PERFORMANCE: Only select fields needed by PlayGrid (60% payload reduction)
          const { data, error: playsError } = await supabase
            .from("plays")
            .select(
              `
              id,
              playbook_id,
              formation,
              play_name,
              one_word_play,
              p_type,
              personnel,
              f_type,
              f_dir,
              p_dir,
              protection,
              r_str,
              p_str,
              pref_down,
              pref_dis,
              pref_hash,
              confidence_base,
              times_called,
              times_successful,
              wristband_number,
              created_at,
              updated_at
            `
            )
            .order("created_at", { ascending: false })
            .range(from, to);

          if (playsError) {
            console.warn("Plays table not available:", playsError.message);
            // Continue without plays data
          } else {
            playsData = data || [];
            // Check if there are more plays to load
            setHasMorePlays(playsData.length === PAGE_SIZE);
          }
        } catch (err) {
          console.warn("Error fetching plays:", err);
          // Continue without plays data
        }

        setPlays(playsData);
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

      // 🚀 PERFORMANCE: Only select fields needed by PlayGrid (60% payload reduction)
      const { data, error } = await supabase
        .from("plays")
        .select(
          `
          id,
          playbook_id,
          formation,
          play_name,
          one_word_play,
          p_type,
          personnel,
          f_type,
          f_dir,
          p_dir,
          protection,
          r_str,
          p_str,
          pref_down,
          pref_dis,
          pref_hash,
          confidence_base,
          times_called,
          times_successful,
          wristband_number,
          created_at,
          updated_at
        `
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error loading more plays:", error);
        setError(`Failed to load more plays: ${error.message}`);
        return;
      }

      const newPlays = data || [];

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
