import { supabase } from "../lib/supabase";

export interface GameResultListItem {
  id: string;
  team_id: string;
  game_date: string;
  opponent: string;
  site: string;
  points_for: number;
  points_against: number;
  created_at: string | null;
}

const GAME_RESULT_COLUMNS =
  "id, team_id, game_date, opponent, site, points_for, points_against, created_at" as const;

export async function listGameResults(
  teamId: string
): Promise<GameResultListItem[]> {
  if (!teamId) return [];
  const { data, error } = await supabase
    .from("game_results")
    .select(GAME_RESULT_COLUMNS)
    .eq("team_id", teamId)
    .order("game_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface LogGameResultInput {
  teamId: string;
  gameDate: string; // YYYY-MM-DD
  opponent: string;
  site: string; // enum value
  pointsFor: number;
  pointsAgainst: number;
  notes?: string;
}

export async function logGameResult(input: LogGameResultInput) {
  const { teamId, gameDate, opponent, site, pointsFor, pointsAgainst, notes } =
    input;
  const { data, error } = await supabase
    .from("game_results")
    .insert({
      team_id: teamId,
      game_date: gameDate,
      opponent,
      site,
      points_for: pointsFor,
      points_against: pointsAgainst,
      notes,
    })
    .select(GAME_RESULT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
