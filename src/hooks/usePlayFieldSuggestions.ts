/**
 * Hook to fetch unique values from existing plays for autocomplete suggestions.
 * Helps coaches reuse consistent terminology across plays for better stats/filtering.
 */

import { useEffect, useState, useMemo } from "react";
import { table } from "../data/supabase/db";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import { TeamSituationDefinitionsService } from "../services/teamSituationDefinitionsService";
import { logError } from "../utils/logger";
import { getFieldZoneDefinitions } from "../utils/situationBucketing";

export interface PlayFieldSuggestions {
  coverages: string[];
  fronts: string[];
  fieldPositions: string[];
  situations: string[];
  teamFieldPositions: string[];
  teamSituations: string[];
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
    teamFieldPositions: string[];
    teamSituations: string[];
    protections: string[];
    motions: string[];
    shifts: string[];
  }>({
    coverages: [],
    fronts: [],
    fieldPositions: [],
    situations: [],
    teamFieldPositions: [],
    teamSituations: [],
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

    const teamId = activeTeamId;

    let cancelled = false;

    async function fetchSuggestions() {
      try {
        const teamFieldPositionsSet = new Set<string>();
        const teamSituationsSet = new Set<string>();

        try {
          const defs = await TeamSituationDefinitionsService.get(teamId);

          // Always derive zones via bucketing util so defaults apply
          const zones = getFieldZoneDefinitions(defs);
          zones.forEach((z) => {
            const label = z?.label?.trim();
            if (label) teamFieldPositionsSet.add(label);
          });

          if (Array.isArray((defs as any)?.custom_situations)) {
            (defs as any).custom_situations.forEach((s: any) => {
              const label = s?.label?.trim();
              if (label) teamSituationsSet.add(label);
            });
          }
        } catch {
          // If we can't read team settings (RLS / offline / etc), still provide
          // sensible default field position suggestions so the UI isn't empty.
          const zones = getFieldZoneDefinitions(null);
          zones.forEach((z) => {
            const label = z?.label?.trim();
            if (label) teamFieldPositionsSet.add(label);
          });
        }

        // First get playbook IDs for this team
        const { data: playbooks, error: playbookError } = await table(
          "playbooks"
        )
          .select("id")
          .eq("team_id", teamId);

        if (playbookError || !playbooks?.length) {
          if (!cancelled) {
            // Even without playbooks access, keep team-derived defaults available.
            setRawData((prev) => ({
              ...prev,
              teamFieldPositions: Array.from(teamFieldPositionsSet).sort(),
              teamSituations: Array.from(teamSituationsSet).sort(),
              fieldPositions: Array.from(teamFieldPositionsSet).sort(),
              situations: Array.from(teamSituationsSet).sort(),
            }));
          }
          setLoading(false);
          return;
        }

        const playbookIds = playbooks.map((pb) => pb.id);

        // Fetch unique values for each field
        const { data: plays, error: playsError } = await table("plays")
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

        // Prefer team-defined taxonomy as canonical suggestions
        teamFieldPositionsSet.forEach((v) => fieldPositions.add(v));
        teamSituationsSet.forEach((v) => situations.add(v));

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
            // Preserve zone order (already sorted by yard line upstream)
            teamFieldPositions: Array.from(teamFieldPositionsSet),
            teamSituations: Array.from(teamSituationsSet).sort(),
            protections: Array.from(protections).sort(),
            motions: Array.from(motions).sort(),
            shifts: Array.from(shifts).sort(),
          });
        }
      } catch (error) {
        logError("[usePlayFieldSuggestions] Error fetching:", error);
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
