/**
 * Database Teams Hook
 *
 * Fetches teams data from Supabase database
 */
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../app/auth-store";

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

interface Play {
  id: string;
  playbook_id: string;
  formation: string;
  play_name: string;
  p_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useTeamsData() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: _user } = useAuth(); // DEMO MODE: Not used during demo

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
        const { data: playbooksData, error: playbooksError } = await supabase
          .from("playbooks")
          .select("*")
          .order("created_at", { ascending: false });

        if (playbooksError) {
          console.error("Error fetching playbooks:", playbooksError);
          setError(`Failed to fetch playbooks: ${playbooksError.message}`);
          return;
        }

        setPlaybooks(playbooksData || []);

        // Fetch plays
        const { data: playsData, error: playsError } = await supabase
          .from("plays")
          .select("*")
          .order("created_at", { ascending: false });

        if (playsError) {
          console.error("Error fetching plays:", playsError);
          setError(`Failed to fetch plays: ${playsError.message}`);
          return;
        }

        setPlays(playsData || []);
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
        setError(
          `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []); // DEMO MODE: Remove user dependency to fetch data without auth

  return {
    teams,
    playbooks,
    plays,
    loading,
    error,
    totalCount: teams.length + playbooks.length + plays.length,
  };
}
