import { supabase } from "../lib/supabase";

import type { PostgrestError } from "@supabase/supabase-js";
import { logError } from "../utils/logger";

export interface SeasonStats {
  team_id: string;
  season_year: number;
  games_played: number;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  win_pct: number | null;
}

// Calculate team stats from game_results instead of using season_stats view
export async function getSeasonStats(
  teamId: string
): Promise<SeasonStats | null> {
  if (!teamId) return null;

  try {
    // Get all game results for the team
    const { data: games, error } = await supabase
      .from("game_results")
      .select("our_score, opponent_score, result, game_date")
      .eq("team_id", teamId);

    if (error) {
      const pgErr = error as PostgrestError;
      if (pgErr?.code === "42P01") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "game_results table not found (likely migrations pending) – returning null"
          );
        }
        return null;
      }
      throw error;
    }

    if (!games || games.length === 0) {
      // Return default stats if no games
      const currentYear = new Date().getFullYear();
      return {
        team_id: teamId,
        season_year: currentYear,
        games_played: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        points_for: 0,
        points_against: 0,
        win_pct: null,
      };
    }

    // Calculate stats from game results
    const stats = games.reduce(
      (acc, game) => {
        acc.games_played++;
        acc.points_for += game.our_score || 0;
        acc.points_against += game.opponent_score || 0;

        if (game.result === "win") acc.wins++;
        else if (game.result === "loss") acc.losses++;
        else if (game.result === "tie") acc.ties++;

        return acc;
      },
      {
        games_played: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        points_for: 0,
        points_against: 0,
      }
    );

    const win_pct =
      stats.games_played > 0 ? stats.wins / stats.games_played : null;
    const currentYear = new Date().getFullYear();

    return {
      team_id: teamId,
      season_year: currentYear,
      ...stats,
      win_pct,
    };
  } catch (unexpectedError) {
    logError("❌ Unexpected error in getSeasonStats:", unexpectedError);
    return null;
  }
}
