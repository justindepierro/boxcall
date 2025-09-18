import { supabase } from "../lib/supabase";

import type { PostgrestError } from "@supabase/supabase-js";

export interface GameResultListItem {
  id: string;
  team_id: string;
  created_by: string;
  game_date: string;
  opponent: string;
  site: string;
  points_for: number;
  points_against: number;
  created_at: string | null;
}

const GAME_RESULT_COLUMNS =
  "id, team_id, created_by, game_date, opponent, site, points_for, points_against, created_at" as const;

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
  site: string; // enum value
  pointsFor: number;
  pointsAgainst: number;
  notes?: string;
}

export async function logGameResult(input: LogGameResultInput) {
  const { teamId, gameDate, opponent, site, pointsFor, pointsAgainst, notes } =
    input;
  // Fetch current user for created_by (required by schema & RLS)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("No authenticated user");
  const { data, error } = await supabase
    .from("game_results")
    .insert({
      team_id: teamId,
      created_by: user.id,
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
