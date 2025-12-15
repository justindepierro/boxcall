/**
 * Game Urgency Calculator
 * Phase 14: Score/Time/Timeout Awareness for AI Recommendations
 *
 * Calculates game urgency levels based on:
 * - Score differential
 * - Time remaining
 * - Timeouts available
 * - Field position
 */

import type { GameSituation, GameUrgency } from "../types/session";

// ================================================
// HELPER: Parse time remaining string
// ================================================

/**
 * Convert "MM:SS" string to total seconds
 */
export function parseTimeRemaining(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(":").map(Number);
  return (minutes || 0) * 60 + (seconds || 0);
}

/**
 * Get total seconds remaining in game
 * Accounts for current quarter
 */
export function getTotalSecondsRemaining(situation: GameSituation): number {
  const quarterSeconds = parseTimeRemaining(situation.timeRemaining);
  const remainingQuarters = Math.max(0, 4 - situation.quarter);
  return quarterSeconds + remainingQuarters * 15 * 60; // 15 min quarters
}

// ================================================
// CORE: Calculate Game Urgency
// ================================================

/**
 * Calculate the current game urgency level
 * This drives play-calling recommendations
 */
export function calculateGameUrgency(situation: GameSituation): GameUrgency {
  const scoreDiff = situation.teamScore - situation.opponentScore;
  const totalSeconds = getTotalSecondsRemaining(situation);
  const isLateGame = situation.quarter >= 4 || totalSeconds <= 5 * 60; // Last 5 min
  const isTwoMinute = parseTimeRemaining(situation.timeRemaining) <= 120; // 2:00 or less
  const isEndOfHalf =
    (situation.quarter === 2 && isTwoMinute) ||
    (situation.quarter >= 4 && isTwoMinute);

  // ICE THE GAME: Up by 2+ scores with <5 min, have the ball
  if (scoreDiff >= 14 && isLateGame) {
    return "ice_the_game";
  }

  // PROTECT LEAD: Up by 1-13 points late, run the clock
  if (scoreDiff >= 1 && scoreDiff <= 13 && isLateGame) {
    return "protect_lead";
  }

  // DESPERATION: Down by 2+ TDs in 4th quarter
  if (scoreDiff <= -14 && situation.quarter >= 4) {
    return "desperation";
  }

  // MUST SCORE: Down by 1-8 points with <5 min
  if (scoreDiff <= -1 && scoreDiff >= -8 && isLateGame) {
    return "must_score";
  }

  // TWO MINUTE DRILL: End of half/game, need to move fast
  if (isEndOfHalf && scoreDiff <= 7) {
    return "two_minute";
  }

  // NORMAL: Everything else
  return "normal";
}

// ================================================
// SPECIAL SITUATIONS
// ================================================

/**
 * Should we go for 2-point conversion?
 * Based on score differential and game situation
 */
export function shouldGoForTwo(
  situation: GameSituation,
  justScored: "touchdown" | "field_goal" = "touchdown"
): { should: boolean; reason: string } {
  if (justScored !== "touchdown") {
    return { should: false, reason: "Can only go for 2 after touchdown" };
  }

  // Score AFTER the touchdown (assuming PAT not yet attempted)
  const teamScoreAfterTD = situation.teamScore;
  const diff = teamScoreAfterTD - situation.opponentScore;
  const isLateGame = situation.quarter >= 4;

  // DOWN BY 2: Go for 2 to tie
  if (diff === -2) {
    return { should: true, reason: "Go for 2 to tie the game" };
  }

  // DOWN BY 5: Go for 2 to make it a FG game
  if (diff === -5) {
    return { should: true, reason: "Go for 2 - FG ties it" };
  }

  // DOWN BY 8: Must go for 2
  if (diff === -8) {
    return { should: true, reason: "Must go for 2 to tie" };
  }

  // DOWN BY 9: Go for 2 to make it 1-score game
  if (diff === -9 && isLateGame) {
    return { should: true, reason: "Go for 2 - need to get within 8" };
  }

  // UP BY 1: Go for 2 to go up by 3 (FG lead)
  if (diff === 1 && isLateGame) {
    return { should: true, reason: "Go for 2 to go up by FG" };
  }

  // UP BY 4: Go for 2 to go up by 6 (two-score lead)
  if (diff === 4 && isLateGame) {
    return { should: true, reason: "Go for 2 to make it 2-score game" };
  }

  return { should: false, reason: "PAT recommended" };
}

/**
 * Should we be in hurry-up/no-huddle mode?
 */
export function shouldBeInHurryUp(situation: GameSituation): boolean {
  const timeRemaining = parseTimeRemaining(situation.timeRemaining);
  const scoreDiff = situation.teamScore - situation.opponentScore;

  // Always hurry up in 2-minute drill when trailing
  if (timeRemaining <= 120 && scoreDiff < 0) {
    return true;
  }

  // End of half, need points
  if (
    situation.quarter === 2 &&
    timeRemaining <= 180 &&
    situation.yardLine >= 40
  ) {
    return true;
  }

  // No huddle can keep defense off balance
  return situation.isHurryUp || false;
}

/**
 * Calculate "must score" threshold
 * Returns how many points we need on this drive
 */
export function getMustScoreTarget(situation: GameSituation): {
  target: "touchdown" | "field_goal" | "any_points" | "none";
  reason: string;
} {
  const scoreDiff = situation.teamScore - situation.opponentScore;
  const totalSeconds = getTotalSecondsRemaining(situation);

  // If we're winning comfortably, no pressure
  if (scoreDiff >= 8) {
    return { target: "none", reason: "Comfortable lead" };
  }

  // Down by more than 8 late = need TD
  if (scoreDiff <= -9 && totalSeconds <= 300) {
    return { target: "touchdown", reason: "Must have TD to stay alive" };
  }

  // Down by 4-8 late = TD preferred but FG keeps it close
  if (scoreDiff <= -4 && scoreDiff >= -8 && totalSeconds <= 300) {
    return { target: "touchdown", reason: "TD to tie/take lead" };
  }

  // Down by 1-3 = FG ties or wins
  if (scoreDiff <= -1 && scoreDiff >= -3 && totalSeconds <= 300) {
    return { target: "field_goal", reason: "FG range wins/ties" };
  }

  return { target: "any_points", reason: "Build the lead" };
}

// ================================================
// TIMEOUT STRATEGY
// ================================================

/**
 * Recommend timeout usage
 */
export function shouldUseTimeout(
  situation: GameSituation,
  context: "offense" | "defense"
): { should: boolean; reason: string } {
  const timeRemaining = parseTimeRemaining(situation.timeRemaining);
  const teamTimeouts = situation.teamTimeouts;

  // No timeouts = can't use one
  if (teamTimeouts <= 0) {
    return { should: false, reason: "No timeouts remaining" };
  }

  // Defense in 2-minute drill - use timeouts to preserve time
  if (
    context === "defense" &&
    timeRemaining <= 120 &&
    situation.quarter >= 4
  ) {
    return { should: true, reason: "Stop the clock - 2-minute defense" };
  }

  // Offense about to run a bad play - timeout to regroup
  // (This would need additional context in real usage)

  return { should: false, reason: "Preserve timeouts" };
}

// ================================================
// PLAY TYPE RECOMMENDATIONS
// ================================================

export type PlayTypeRecommendation = {
  type: "run" | "pass" | "balanced";
  aggressiveness: "conservative" | "normal" | "aggressive" | "desperate";
  reason: string;
};

/**
 * Get recommended play type based on game situation
 */
export function getPlayTypeRecommendation(
  situation: GameSituation
): PlayTypeRecommendation {
  const urgency = calculateGameUrgency(situation);
  const scoreDiff = situation.teamScore - situation.opponentScore;
  // Time parsing available for future granular decisions
  const _timeRemaining = parseTimeRemaining(situation.timeRemaining);
  void _timeRemaining; // Silence unused warning until Phase 15 enhancements

  switch (urgency) {
    case "ice_the_game":
      return {
        type: "run",
        aggressiveness: "conservative",
        reason: "Run the clock, protect the ball",
      };

    case "protect_lead":
      return {
        type: "balanced",
        aggressiveness: "conservative",
        reason: "Manage the clock, don't turn it over",
      };

    case "desperation":
      return {
        type: "pass",
        aggressiveness: "desperate",
        reason: "Need big plays, take shots",
      };

    case "must_score":
      return {
        type: "pass",
        aggressiveness: "aggressive",
        reason: "Need points, attack downfield",
      };

    case "two_minute":
      return {
        type: "pass",
        aggressiveness: scoreDiff < 0 ? "aggressive" : "normal",
        reason: "Clock management, sideline routes",
      };

    default:
      return {
        type: "balanced",
        aggressiveness: "normal",
        reason: "Normal game flow",
      };
  }
}

// ================================================
// DEFAULT SITUATION
// ================================================

/**
 * Create a default game situation (start of game)
 */
export function createDefaultGameSituation(): GameSituation {
  return {
    quarter: 1,
    timeRemaining: "15:00",
    down: 1,
    distance: 10,
    yardLine: 25, // After touchback
    hashMark: "middle",
    teamScore: 0,
    opponentScore: 0,
    teamTimeouts: 3,
    opponentTimeouts: 3,
    gameUrgency: "normal",
    isHurryUp: false,
    isPossessionStart: true,
  };
}
