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

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [plays, setPlays] = useState<DatabasePlay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user: _user } = useAuth(); // DEMO MODE: Not used during demo

  // Use main supabase client (now configured with service role key for demo)

  // Function to manually refresh data
  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Function to update a play
  const updatePlay = useCallback(
    async (playId: string, updates: Partial<DatabasePlay>) => {
      try {
        const { data, error } = await supabase
          .from("plays")
          .update(updates)
          .eq("id", playId)
          .select()
          .single();

        if (error) {
          console.error("Error updating play:", error);
          throw new Error(`Failed to update play: ${error.message}`);
        }

        // Update local state
        setPlays((prevPlays) =>
          prevPlays.map((play) =>
            play.id === playId ? { ...play, ...updates } : play
          )
        );

        return data;
      } catch (err) {
        console.error("Error in updatePlay:", err);
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
        let playbooksData = [];
        try {
          const { data, error: playbooksError } = await supabase
            .from("playbooks")
            .select("*")
            .order("created_at", { ascending: false });

          if (playbooksError) {
            console.warn(
              "Playbooks table not available:",
              playbooksError.message
            );
            // Continue without playbooks data
          } else {
            playbooksData = data || [];
          }
        } catch (err) {
          console.warn("Error fetching playbooks:", err);
          // Continue without playbooks data
        }

        setPlaybooks(playbooksData);

        // Fetch plays
        let playsData = [];
        try {
          const { data, error: playsError } = await supabase
            .from("plays")
            .select("*")
            .order("created_at", { ascending: false });

          if (playsError) {
            console.warn("Plays table not available:", playsError.message);
            // Continue without plays data
          } else {
            playsData = data || [];
          }
        } catch (err) {
          console.warn("Error fetching plays:", err);
          // Continue without plays data
        }

        setPlays(playsData);

        setLoading(false);
      } catch (err) {
        console.error("Unexpected error in fetchData:", err);
        setError("An unexpected error occurred while fetching data");
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshTrigger]);

  return {
    teams,
    playbooks,
    plays,
    loading,
    error,
    refreshData,
    updatePlay,
    totalCount: teams.length + playbooks.length + plays.length,
  };
}
