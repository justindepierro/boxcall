/**
 * Hook to fetch unique values from existing plays for autocomplete suggestions.
 * Helps coaches reuse consistent terminology across plays for better stats/filtering.
 */

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useActiveTeamStore } from "../stores/activeTeamStore";

export interface PlayFieldSuggestions {
  coverages: string[];
  fronts: string[];
  fieldPositions: string[];
  situations: string[];
  protections: string[];
  motions: string[];
  shifts: string[];
  loading: boolean;
}

/**
 * Fetches unique values for text fields from existing plays in the team's playbooks.
 * Results are cached and normalized (trimmed, deduplicated).
 */
export function usePlayFieldSuggestions(): PlayFieldSuggestions {
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const [rawData, setRawData] = useState<{
    coverages: string[];
    fronts: string[];
    fieldPositions: string[];
    situations: string[];
    protections: string[];
    motions: string[];
    shifts: string[];
  }>({
    coverages: [],
    fronts: [],
    fieldPositions: [],
    situations: [],
    protections: [],
    motions: [],
    shifts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeTeamId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSuggestions() {
      try {
        // First get playbook IDs for this team
        const { data: playbooks, error: playbookError } = await supabase
          .from("playbooks")
          .select("id")
          .eq("team_id", activeTeamId);

        if (playbookError || !playbooks?.length) {
          setLoading(false);
          return;
        }

        const playbookIds = playbooks.map((pb) => pb.id);

        // Fetch unique values for each field
        const { data: plays, error: playsError } = await supabase
          .from("plays")
          .select(
            "pref_cov, pref_front, pref_field_pos, pref_situation, protection, motion, shift"
          )
          .in("playbook_id", playbookIds);

        if (playsError || cancelled) {
          setLoading(false);
          return;
        }

        // Extract and deduplicate values
        const coverages = new Set<string>();
        const fronts = new Set<string>();
        const fieldPositions = new Set<string>();
        const situations = new Set<string>();
        const protections = new Set<string>();
        const motions = new Set<string>();
        const shifts = new Set<string>();

        plays?.forEach((play) => {
          if (play.pref_cov?.trim()) coverages.add(play.pref_cov.trim());
          if (play.pref_front?.trim()) fronts.add(play.pref_front.trim());
          if (play.pref_field_pos?.trim())
            fieldPositions.add(play.pref_field_pos.trim());
          if (play.pref_situation?.trim())
            situations.add(play.pref_situation.trim());
          if (play.protection?.trim()) protections.add(play.protection.trim());
          if (play.motion?.trim()) motions.add(play.motion.trim());
          if (play.shift?.trim()) shifts.add(play.shift.trim());
        });

        if (!cancelled) {
          setRawData({
            coverages: Array.from(coverages).sort(),
            fronts: Array.from(fronts).sort(),
            fieldPositions: Array.from(fieldPositions).sort(),
            situations: Array.from(situations).sort(),
            protections: Array.from(protections).sort(),
            motions: Array.from(motions).sort(),
            shifts: Array.from(shifts).sort(),
          });
        }
      } catch (error) {
        console.error("[usePlayFieldSuggestions] Error fetching:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSuggestions();

    return () => {
      cancelled = true;
    };
  }, [activeTeamId]);

  return useMemo(
    () => ({
      ...rawData,
      loading,
    }),
    [rawData, loading]
  );
}
