import { supabase } from "../lib/supabase";

// Types
export interface GameResultListItem {
  id: string;
  team_id: string | null;
  opponent: string;
  game_date: string;
  our_score: number | null;
  opponent_score: number | null;
  result: string | null;
  venue: string | null;
  home_away: string | null;
  created_at: string | null;
  updated_at?: string | null;
  notes?: string | null;
}

export interface LogGameResultInput {
  teamId: string;
  opponent: string;
  gameDate: string;
  pointsFor: number;
  pointsAgainst: number;
  venue?: string;
  homeAway?: "home" | "away";
  notes?: string;
}

// Service functions
export async function listGameResults(
  teamId: string
): Promise<GameResultListItem[]> {
  const { data, error } = await supabase
    .from("game_results")
    .select("*")
    .eq("team_id", teamId)
    .order("game_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function logGameResult(
  input: LogGameResultInput
): Promise<GameResultListItem> {
  // Calculate result
  const result = (() => {
    if (input.pointsFor > input.pointsAgainst) return "win";
    if (input.pointsFor < input.pointsAgainst) return "loss";
    return "tie";
  })();

  const { data, error } = await supabase
    .from("game_results")
    .insert({
      team_id: input.teamId,
      opponent: input.opponent,
      game_date: input.gameDate,
      our_score: input.pointsFor,
      opponent_score: input.pointsAgainst,
      result,
      venue: input.venue || null,
      home_away: input.homeAway || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
