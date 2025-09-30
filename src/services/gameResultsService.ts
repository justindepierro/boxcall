import { supabase } from "../lib/supabase";

import type { PostgrestError } from "@supabase/supabase-js";

export interface GameResultListItem {
  id: string;
  team_id: string;
  game_date: string;
  opponent: string;
  venue: string | null;
  our_score: number;
  opponent_score: number;
  result: string | null;
  home_away: string | null;
  created_at: string | null;
}

const GAME_RESULT_COLUMNS =
  "id, team_id, game_date, opponent, venue, our_score, opponent_score, result, home_away, created_at" as const;

export async function listGameResults(
  teamId: string
): Promise<GameResultListItem[]> {
  if (!teamId) return [];
  const { data, error, status } = await supabase
    .from("game_results")
    .select(GAME_RESULT_COLUMNS)
    .eq("team_id", teamId)
    .order("game_date", { ascending: false });
  if (error) {
    const pgErr = error as PostgrestError;
    if (status === 404 || pgErr?.code === "42P01") {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "game_results relation not found (likely migrations pending) – returning empty list"
        );
      }
      return [];
    }
    throw error;
  }
  return data ?? [];
}

export interface LogGameResultInput {
  teamId: string;
  gameDate: string; // YYYY-MM-DD
  opponent: string;
  venue?: string;
  pointsFor: number;
  pointsAgainst: number;
  homeAway?: "home" | "away";
  notes?: string;
}

export async function logGameResult(input: LogGameResultInput) {
  const { teamId, gameDate, opponent, venue, pointsFor, pointsAgainst, homeAway, notes } =
    input;
  // Fetch current user for created_by (required by schema & RLS)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("No authenticated user");
  
  // Calculate result based on scores
  let result: "win" | "loss" | "tie" | null = null;
  if (pointsFor > pointsAgainst) result = "win";
  else if (pointsFor < pointsAgainst) result = "loss";
  else result = "tie";
  
  const { data, error } = await supabase
    .from("game_results")
    .insert({
      team_id: teamId,
      game_date: gameDate,
      opponent,
      venue,
      our_score: pointsFor,
      opponent_score: pointsAgainst,
      result,
      home_away: homeAway,
      notes,
    })
    .select(GAME_RESULT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
