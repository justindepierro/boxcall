import { supabase } from "../lib/supabase";

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

export async function getSeasonStats(teamId: string): Promise<SeasonStats | null> {
  if (!teamId) return null;
  const { data, error } = await supabase
    .from("season_stats")
    .select(STATS_COLUMNS)
    .eq("team_id", teamId)
    .order("season_year", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
