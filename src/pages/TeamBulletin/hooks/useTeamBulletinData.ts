/**
 * useTeamBulletinData Hook
 * Handles team data fetching and state management for TeamBulletin
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { table } from "../../../data/supabase/db";
import { colorTokens } from "../../../design-system/tokens";
import { warn } from "../../../utils/logger";

export interface TeamData {
  id: string;
  name: string;
  season: string;
  colors: { primary: string; secondary: string };
  logo: string;
  record: { wins: number; losses: number };
  nextGame: string;
  memberCount: number;
  mascot?: string | null;
  school_name?: string | null;
  logo_url?: string | null;
}

interface UseTeamBulletinDataProps {
  teamId: string | undefined;
  devMode: string | null;
}

interface UseTeamBulletinDataResult {
  teamData: TeamData | null;
  isTeamDataLoading: boolean;
}

export function useTeamBulletinData({
  teamId,
  devMode,
}: UseTeamBulletinDataProps): UseTeamBulletinDataResult {
  const computeAcademicYearDisplay = useCallback((baseYear?: number) => {
    if (typeof baseYear === "number" && !isNaN(baseYear)) {
      return `${baseYear}-${baseYear + 1}`;
    }
    const now = new Date();
    const startYear =
      now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${startYear + 1}`;
  }, []);

  const [teamData, setTeamData] = useState<TeamData | null>(() => {
    if (devMode === "blank_slate") return null;
    return {
      id: teamId || "unknown",
      name: "BoxCall Dev Team",
      season: "2025-2026",
      colors: {
        primary: "colorTokens.jade[500]",
        secondary: colorTokens.blue[900],
      },
      logo: "eagle",
      record: { wins: 8, losses: 2 },
      nextGame: "Friday vs. Central Lions",
      memberCount: 35,
    };
  });

  const [isTeamDataLoading, setIsTeamDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!teamId) {
        setIsTeamDataLoading(false);
        return;
      }

      setIsTeamDataLoading(true);

      try {
        type TeamRow = {
          id: string;
          name: string;
          season_year: number | string | null;
          school_name: string | null;
          mascot: string | null;
        };
        const { data, error } = await table("teams")
          .select("id, name, season_year, school_name, mascot")
          .eq("id", teamId)
          .single<TeamRow>();
        if (error) {
          warn("team.fetch.error", error);
          setIsTeamDataLoading(false);
          return;
        }
        let memberCount = 0;
        try {
          const { count } = await table("team_members")
            .select("id", { head: true, count: "exact" })
            .eq("team_id", teamId);
          memberCount = count || 0;
        } catch {
          // ignore member count fetch failure
        }
        if (!cancelled && data) {
          const syRaw = data.season_year;
          const seasonBase = (() => {
            if (typeof syRaw === "number") return syRaw;
            if (syRaw) return parseInt(syRaw, 10);
            return undefined;
          })();
          const seasonDisplay = computeAcademicYearDisplay(seasonBase);
          setTeamData({
            id: data.id,
            name: data.name,
            season: seasonDisplay,
            colors: {
              primary: "colorTokens.jade[500]",
              secondary: colorTokens.blue[900],
            },
            logo: "generic",
            record: { wins: 0, losses: 0 },
            nextGame: "TBD",
            memberCount,
            mascot: data.mascot,
            school_name: data.school_name,
          });
        }
      } catch {
        // ignore team fetch failure
      } finally {
        if (!cancelled) {
          setIsTeamDataLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId, computeAcademicYearDisplay]);

  return useMemo(
    () => ({ teamData, isTeamDataLoading }),
    [teamData, isTeamDataLoading]
  );
}
