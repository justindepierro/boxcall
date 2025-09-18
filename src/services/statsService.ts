import { supabase } from "../lib/supabase";

import type { PostgrestError } from "@supabase/supabase-js";

export interface SeasonStats {
  team_id: string;
  season_year: number;
  games_played: number;
  wins: number;
  losses: number;
  pf_total: number;
  pa_total: number;
  win_pct: number | null;
}

const STATS_COLUMNS =
  "team_id, season_year, games_played, wins, losses, pf_total, pa_total, win_pct" as const;

export async function getSeasonStats(
  teamId: string
): Promise<SeasonStats | null> {
  if (!teamId) return null;
  const { data, error, status } = await supabase
    .from("season_stats")
    .select(STATS_COLUMNS)
    .eq("team_id", teamId)
    .order("season_year", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    const pgErr = error as PostgrestError;
    if (status === 404 || pgErr?.code === "42P01") {
      if (process.env.NODE_ENV !== "production") {
// console.warn(
          "season_stats view not found (likely migrations pending) – returning null"
        );
      }
      return null;
    }
    throw error;
  }
  return data ?? null;
}
