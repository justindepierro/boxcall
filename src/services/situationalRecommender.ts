/**
 * Situational Recommender Service
 * Phase 13.1: "What should I call right now?" engine
 * Phase 13.2: Added coverage-based recommendations
 * Phase 14: Added score/time/timeout awareness (game urgency)
 *
 * Analyzes current game situation and recommends best plays based on:
 * - Confidence scores (from Phase 11)
 * - Situational match (down, distance, field zone)
 * - Historical success in similar situations
 * - Practice-to-game transfer rates
 * - Current momentum (streaks)
 * - Coverage-specific success rates (Phase 13.2)
 * - Score differential, time remaining, timeouts (Phase 14)
 */

import { PlayConfidenceService } from "./playConfidenceService";
import { ExecutionTrackingService } from "./executionTrackingService";
import type { GameSituation, GameUrgency } from "../types/session";
import type { Play } from "../types/database";
import { logError } from "../utils/logger";
import {
  calculateGameUrgency,
  getPlayTypeRecommendation,
  parseTimeRemaining,
} from "../utils/gameUrgencyCalculator";

// ==============================================
// HELPER FUNCTIONS (Extracted to reduce complexity)
// ==============================================

/** Calculate bonus/penalty based on down */
function getDownBonus(
  down: number,
  playType: string | null | undefined,
  concept: string | null | undefined,
  confidenceScore: number
): number {
  if (down === 1) {
    let bonus = 0;
    if (playType === "run") bonus += 10;
    if (playType === "pass" && concept?.includes("quick")) bonus += 5;
    return bonus;
  }
  if (down === 2) return 5;
  if (down === 3) {
    let bonus = 0;
    if (playType === "pass") bonus += 15;
    return bonus;
  }
  if (down === 4) {
    return confidenceScore >= 80 ? 10 : -20;
  }
  return 0;
}

/** Calculate bonus/penalty based on distance */
function getDistanceBonus(
  distance: number,
  playType: string | null | undefined,
  formation: string | null | undefined,
  concept: string | null | undefined
): number {
  if (distance <= 3) {
    let bonus = 0;
    if (playType === "run") bonus += 10;
    if (formation?.includes("I-Form") || formation?.includes("Heavy"))
      bonus += 5;
    return bonus;
  }
  if (distance <= 7) {
    if (concept?.includes("stick") || concept?.includes("mesh")) return 10;
    return 0;
  }
  // Long yardage (8+)
  let bonus = 0;
  if (playType === "pass") bonus += 15;
  if (concept?.includes("vertical") || concept?.includes("deep")) bonus += 10;
  return bonus;
}

/** Calculate bonus/penalty based on field zone */
function getFieldZoneBonus(
  yardLine: number,
  playType: string | null | undefined,
  concept: string | null | undefined,
  distance: number,
  confidenceScore: number
): number {
  if (yardLine <= 20) {
    let bonus = 0;
    if (concept?.includes("fade") || concept?.includes("corner")) bonus += 15;
    if (playType === "run" && distance <= 3) bonus += 10;
    return bonus;
  }
  if (yardLine <= 50) {
    let bonus = 0;
    if (playType === "run") bonus += 5;
    if (confidenceScore >= 75) bonus += 5;
    return bonus;
  }
  // Opponent territory
  return playType === "pass" ? 5 : 0;
}

/** Calculate bonus/penalty based on streak and practice-to-game */
function getStreakAndPracticeBonus(confidence: {
  streak?: { isHot?: boolean; isCold?: boolean };
  practiceToGame?: { needsMorePractice?: boolean; transferRate?: number };
}): number {
  let bonus = 0;
  if (confidence.streak?.isHot) bonus += 15;
  else if (confidence.streak?.isCold) bonus -= 10;
  if (confidence.practiceToGame?.needsMorePractice) bonus -= 15;
  else if (
    confidence.practiceToGame &&
    confidence.practiceToGame.transferRate >= 10
  )
    bonus += 10;
  return bonus;
}

/** Calculate bonus/penalty based on coverage stats */
function getCoverageBonus(
  coverageStats: { successRate: number; executionCount: number } | null
): number {
  if (!coverageStats || coverageStats.executionCount < 3) return 0;
  if (coverageStats.successRate >= 90) return 25;
  if (coverageStats.successRate >= 75) return 15;
  if (coverageStats.successRate >= 60) return 5;
  if (coverageStats.successRate < 40) return -15;
  return 0;
}

/** Calculate bonus/penalty based on hash preference */
function getHashBonus(
  hashStats: {
    bestHash?: "left" | "middle" | "right";
    left: { successRate: number; executionCount: number };
    middle: { successRate: number; executionCount: number };
    right: { successRate: number; executionCount: number };
  } | null,
  currentHash: "left" | "middle" | "right"
): number {
  if (!hashStats?.bestHash) return 0;
  const currentHashStats = hashStats[currentHash];
  const bestHashStats = hashStats[hashStats.bestHash];
  if (
    currentHash === hashStats.bestHash &&
    bestHashStats.executionCount >= 3 &&
    bestHashStats.successRate >= 70
  ) {
    return 10;
  }
  if (
    currentHash !== hashStats.bestHash &&
    currentHashStats.executionCount >= 3 &&
    bestHashStats.executionCount >= 3 &&
    bestHashStats.successRate - currentHashStats.successRate >= 20
  ) {
    return -10;
  }
  return 0;
}

/**
 * Calculate bonus based on coach-defined preferences
 * This is the PRIMARY factor - if the coach said this play is designed for a situation,
 * it should get a significant bonus when that situation occurs.
 *
 * Preference fields from the plays table:
 * - pref_down: "1st", "2nd", "3rd", "4th"
 * - pref_dis: "Short", "Medium", "Long"
 * - pref_hash: "Left", "Middle", "Right"
 * - pref_field_pos: Coach-defined (e.g., "Red Zone", "Goal Line", "Plus Territory")
 * - pref_situation: Coach-defined (e.g., "2-Minute", "Backed Up", "Must Have")
 * - pref_cov: Coach-defined (e.g., "Man", "Zone", "Cover 2")
 */
function getCoachPreferenceBonus(
  play: {
    pref_down?: string | null;
    pref_dis?: string | null;
    pref_hash?: string | null;
    pref_field_pos?: string | null;
    pref_situation?: string | null;
    pref_cov?: string | null;
  },
  situation: {
    down: number;
    distance: number;
    yardLine: number;
    hashMark?: "left" | "middle" | "right";
    opponentCoverage?: string;
  }
): { bonus: number; reasons: string[] } {
  let bonus = 0;
  const reasons: string[] = [];

  // Down match (+20 points - this is what the coach designed it for!)
  if (play.pref_down) {
    const prefDown = play.pref_down.toLowerCase().replace(/[^\d]/g, ""); // Extract number
    if (prefDown === String(situation.down)) {
      bonus += 20;
      reasons.push(`✓ Coach's ${play.pref_down} down play`);
    }
  }

  // Distance match (+15 points)
  if (play.pref_dis) {
    const prefDis = play.pref_dis.toLowerCase();
    const isShort = situation.distance <= 3;
    const isMedium = situation.distance >= 4 && situation.distance <= 7;
    const isLong = situation.distance >= 8;

    if (
      (prefDis.includes("short") && isShort) ||
      (prefDis.includes("medium") && isMedium) ||
      (prefDis.includes("long") && isLong)
    ) {
      bonus += 15;
      reasons.push(`✓ Designed for ${play.pref_dis} distance`);
    }
  }

  // Hash match (+10 points)
  if (play.pref_hash && situation.hashMark) {
    const prefHash = play.pref_hash.toLowerCase();
    if (prefHash === situation.hashMark.toLowerCase()) {
      bonus += 10;
      reasons.push(`✓ Best from ${play.pref_hash} hash`);
    }
  }

  // Field position match (+15 points) - coach-defined terms
  if (play.pref_field_pos) {
    const prefFieldPos = play.pref_field_pos.toLowerCase();
    const yardLine = situation.yardLine;

    // Map common field position terms to yard line ranges
    const isRedZone = yardLine <= 20;
    const isGoalLine = yardLine <= 5;
    const isPlusTerritory = yardLine <= 50 && yardLine > 20;
    const isMidfield = yardLine > 40 && yardLine <= 60;
    const isBackedUp = yardLine >= 90; // Own 10 or worse

    if (
      (prefFieldPos.includes("red") && isRedZone) ||
      (prefFieldPos.includes("goal") && isGoalLine) ||
      (prefFieldPos.includes("plus") && isPlusTerritory) ||
      (prefFieldPos.includes("mid") && isMidfield) ||
      (prefFieldPos.includes("backed") && isBackedUp)
    ) {
      bonus += 15;
      reasons.push(`✓ ${play.pref_field_pos} play`);
    }
  }

  // Coverage match (+12 points) - if opponent coverage matches what play is designed against
  if (play.pref_cov && situation.opponentCoverage) {
    const prefCov = play.pref_cov.toLowerCase();
    const oppCov = situation.opponentCoverage.toLowerCase();

    // Flexible matching for coverage terms
    if (
      prefCov.includes(oppCov) ||
      oppCov.includes(prefCov) ||
      (prefCov.includes("man") && oppCov.includes("man")) ||
      (prefCov.includes("zone") && oppCov.includes("zone"))
    ) {
      bonus += 12;
      reasons.push(`✓ Designed vs ${play.pref_cov}`);
    }
  }

  // Custom situation is informational - shown in reasoning but no automatic bonus
  // (since we can't automatically detect "2-Minute" or "Must Have" situations)
  if (play.pref_situation) {
    reasons.push(`📋 Tagged: ${play.pref_situation}`);
  }

  return { bonus, reasons };
}

/**
 * Phase 14: Calculate bonus based on game urgency (score/time/timeouts)
 *
 * This adjusts recommendations based on:
 * - Score differential (leading/trailing)
 * - Time remaining (2-minute drill, end of game)
 * - Game urgency level (must_score, protect_lead, etc.)
 * - Play type match (run vs pass based on situation)
 */
function getGameUrgencyBonus(
  play: {
    play_type?: string | null;
    concept?: string | null;
    pref_situation?: string | null;
  },
  situation: GameSituation
): { bonus: number; reasons: string[] } {
  let bonus = 0;
  const reasons: string[] = [];

  // Need score and time data to calculate urgency
  if (situation.teamScore === undefined || situation.opponentScore === undefined) {
    return { bonus, reasons };
  }

  const urgency = calculateGameUrgency(situation);
  const playTypeRec = getPlayTypeRecommendation(situation);
  const playType = play.play_type?.toLowerCase();
  const concept = play.concept?.toLowerCase() || "";
  const scoreDiff = situation.teamScore - situation.opponentScore;
  const timeRemaining = parseTimeRemaining(situation.timeRemaining);

  // Match play type to recommendation
  if (playTypeRec.type === "run" && playType === "run") {
    bonus += 15;
    reasons.push(`✓ Run game fits (${playTypeRec.reason})`);
  } else if (playTypeRec.type === "pass" && playType === "pass") {
    bonus += 15;
    reasons.push(`✓ Pass game fits (${playTypeRec.reason})`);
  } else if (playTypeRec.type === "balanced") {
    bonus += 5; // Small bonus for any play in balanced mode
  }

  // Urgency-specific bonuses
  switch (urgency) {
    case "two_minute":
      // Boost plays that get out of bounds or are quick-hitting
      if (concept.includes("out") || concept.includes("sideline") || concept.includes("quick")) {
        bonus += 20;
        reasons.push("⏱️ Good 2-minute drill play (stops clock)");
      }
      // Coach tagged as 2-minute play
      if (play.pref_situation?.toLowerCase().includes("2-minute") ||
          play.pref_situation?.toLowerCase().includes("two minute")) {
        bonus += 25;
        reasons.push("⏱️ Coach's 2-minute play");
      }
      break;

    case "must_score":
      // Boost aggressive plays
      if (playType === "pass") bonus += 10;
      if (concept.includes("deep") || concept.includes("vertical") || concept.includes("shot")) {
        bonus += 15;
        reasons.push("🎯 Aggressive shot play (must score)");
      }
      break;

    case "protect_lead":
      // Boost safe, clock-eating plays
      if (playType === "run") bonus += 15;
      if (concept.includes("power") || concept.includes("iso") || concept.includes("dive")) {
        bonus += 10;
        reasons.push("🔒 Clock management play");
      }
      // Penalize risky plays
      if (concept.includes("deep") || concept.includes("shot")) {
        bonus -= 15;
        reasons.push("⚠️ Risky with lead");
      }
      break;

    case "desperation":
      // Big play or bust
      if (concept.includes("hail mary") || concept.includes("deep") || concept.includes("trick")) {
        bonus += 25;
        reasons.push("🚨 Desperation play");
      }
      break;

    case "ice_the_game":
      // Run the ball, protect it
      if (playType === "run") {
        bonus += 20;
        reasons.push("❄️ Run to ice the game");
      }
      if (playType === "pass") {
        bonus -= 10; // Slight penalty for passing
      }
      break;
  }

  // Time-specific bonuses
  if (timeRemaining <= 30 && scoreDiff < 0 && playType === "pass") {
    bonus += 10;
    reasons.push("⏰ Under 30 seconds, need to pass");
  }

  // Trailing late = aggressive boost
  if (scoreDiff < 0 && situation.quarter >= 4 && timeRemaining <= 300) {
    if (playType === "pass" && (concept.includes("deep") || concept.includes("vertical"))) {
      bonus += 10;
      reasons.push("📈 Trailing in 4th - go deep");
    }
  }

  return { bonus, reasons };
}

// ==============================================
// REASONING HELPER FUNCTIONS
// ==============================================

type ConfidenceData = {
  overallScore: number;
  executionCount?: number;
  streak?: { isHot?: boolean; isCold?: boolean; current?: number };
  practiceToGame?: { needsMorePractice?: boolean; transferRate?: number };
};

/** Get confidence-related reasoning */
function getConfidenceReasons(
  confidence: ConfidenceData,
  matchScore: number
): string[] {
  const reasons: string[] = [];
  if (confidence.overallScore >= 80) reasons.push("High AI confidence (80%+)");
  else if (confidence.overallScore >= 60) reasons.push("Good AI confidence");
  if (matchScore >= 80) reasons.push("Perfect fit for this situation");
  else if (matchScore >= 60) reasons.push("Good match for down/distance");
  return reasons;
}

/** Get down-specific reasoning */
function getDownReasons(situation: GameSituation, play: Play): string[] {
  const reasons: string[] = [];
  if (situation.down === 3 && situation.distance <= 3) {
    if (play.play_type === "run")
      reasons.push("Strong 3rd & short conversion play");
    else if (play.concept?.includes("quick"))
      reasons.push("Quick-hitting 3rd down concept");
  } else if (
    situation.down === 3 &&
    situation.distance >= 8 &&
    play.play_type === "pass"
  ) {
    reasons.push("Designed for 3rd & long");
  }
  return reasons;
}

/** Get field zone reasoning */
function getFieldZoneReasons(situation: GameSituation): string[] {
  if (situation.yardLine <= 20 && situation.yardLine >= 5)
    return ["Red zone tested"];
  if (situation.yardLine <= 5) return ["Goal line package"];
  return [];
}

/** Get streak and practice-to-game reasoning */
function getStreakReasons(confidence: ConfidenceData): string[] {
  const reasons: string[] = [];
  if (confidence.streak?.isHot)
    reasons.push(`🔥 Hot streak (${confidence.streak.current} in a row)`);
  if (
    confidence.practiceToGame?.transferRate &&
    confidence.practiceToGame.transferRate >= 10
  ) {
    reasons.push("Proven in game situations");
  } else if (confidence.practiceToGame?.needsMorePractice) {
    reasons.push("⚠️ Needs more practice");
  }
  if (confidence.executionCount && confidence.executionCount >= 20)
    reasons.push("Well-practiced play");
  else if (
    confidence.executionCount !== undefined &&
    confidence.executionCount < 5
  )
    reasons.push("Limited execution history");
  return reasons;
}

/** Get coverage-specific reasoning */
function getCoverageReasons(
  coverageStats: { successRate: number; executionCount: number } | null,
  coverage: string
): string[] {
  if (!coverageStats) return [];
  if (coverageStats.executionCount >= 3) {
    if (coverageStats.successRate >= 90) {
      return [
        `🎯 Excellent vs ${coverage} (${coverageStats.successRate.toFixed(0)}%, ${coverageStats.executionCount} plays)`,
      ];
    }
    if (coverageStats.successRate >= 75) {
      return [
        `✓ Proven vs ${coverage} (${coverageStats.successRate.toFixed(0)}%)`,
      ];
    }
    if (coverageStats.successRate < 40) {
      return [
        `⚠️ Struggles vs ${coverage} (${coverageStats.successRate.toFixed(0)}%)`,
      ];
    }
  } else if (coverageStats.executionCount > 0) {
    return [
      `Limited data vs ${coverage} (${coverageStats.executionCount} plays)`,
    ];
  }
  return [];
}

/** Get hash preference reasoning */
function getHashReasons(
  hashStats: {
    bestHash?: "left" | "middle" | "right";
    left: { successRate: number; executionCount: number };
    middle: { successRate: number; executionCount: number };
    right: { successRate: number; executionCount: number };
  } | null,
  currentHash: "left" | "middle" | "right"
): string[] {
  if (!hashStats?.bestHash) return [];
  const currentHashStats = hashStats[currentHash];
  const bestHashStats = hashStats[hashStats.bestHash];
  if (
    currentHash === hashStats.bestHash &&
    bestHashStats.executionCount >= 3 &&
    bestHashStats.successRate >= 75
  ) {
    return [
      `📍 Best from ${hashStats.bestHash} hash (${bestHashStats.successRate.toFixed(0)}%)`,
    ];
  }
  if (
    hashStats.bestHash &&
    currentHashStats.executionCount >= 3 &&
    bestHashStats.executionCount >= 3
  ) {
    const diff = bestHashStats.successRate - currentHashStats.successRate;
    if (diff >= 20) {
      return [
        `⚠️ Better from ${hashStats.bestHash} hash (${bestHashStats.successRate.toFixed(0)}% vs ${currentHashStats.successRate.toFixed(0)}% here)`,
      ];
    }
  }
  return [];
}

// ==============================================
// TYPES
// ==============================================

export interface PlayRecommendation {
  play: Play;
  overallScore: number; // 0-100 (weighted: 70% confidence, 30% situation match)
  confidenceScore: number; // 0-100 (from PlayConfidenceService)
  situationMatchScore: number; // 0-100 (how well it fits current situation)
  reasoning: string[]; // Human-readable reasons for recommendation
  stats?: {
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
  };
  coverageStats?: {
    // Phase 13.2: Coverage-specific performance
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
    coverage: string; // e.g., "Cover 2"
  };
  hashStats?: {
    // Phase 13.3: Hash preference analysis
    left: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    middle: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    right: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    bestHash?: "left" | "middle" | "right";
    currentHash?: "left" | "middle" | "right";
  };
}

export interface RecommendationOptions {
  maxResults?: number; // Default: 5
  minConfidence?: number; // Filter out low-confidence plays (default: 40)
  includeStats?: boolean; // Include detailed stats (default: true)
}

// ==============================================
// SITUATIONAL RECOMMENDER
// ==============================================

export class SituationalRecommender {
  /**
   * Get top play recommendations for current situation
   */
  static async getRecommendations(
    plays: Play[],
    teamId: string,
    situation: GameSituation,
    options: RecommendationOptions = {}
  ): Promise<PlayRecommendation[]> {
    const { maxResults = 5, minConfidence = 40, includeStats = true } = options;

    // Calculate confidence scores for all plays
    const confidenceMap = await PlayConfidenceService.getBatchConfidence(
      plays.map((p) => p.id),
      teamId,
      situation
    );

    // Build recommendations
    const recommendations: PlayRecommendation[] = [];

    for (const play of plays) {
      const confidence = confidenceMap.get(play.id);
      if (!confidence || confidence.overallScore < minConfidence) {
        continue; // Skip low-confidence plays
      }

      // Calculate situation match score
      const situationMatchScore = await this.calculateSituationMatch(
        play,
        situation,
        confidence,
        teamId
      );

      // Calculate overall score (70% confidence, 30% situation match)
      const overallScore = Math.round(
        confidence.overallScore * 0.7 + situationMatchScore * 0.3
      );

      // Build reasoning
      const reasoning = await this.buildReasoning(
        play,
        situation,
        confidence,
        situationMatchScore,
        teamId
      );

      // Optional: Include stats
      const stats = includeStats
        ? await this.getPlayStats(play.id, teamId, situation)
        : undefined;

      // Phase 13.2: Get coverage-specific stats if opponent coverage is known
      const coverageStats =
        includeStats &&
        situation.opponentCoverage &&
        situation.opponentCoverage !== "Unknown"
          ? await this.getCoverageStats(
              play.id,
              teamId,
              situation.opponentCoverage
            )
          : undefined;

      // Phase 13.3: Get hash preference stats
      const hashStatsData = includeStats
        ? await this.getHashStats(play.id, teamId)
        : undefined;

      const hashStats = hashStatsData
        ? {
            ...hashStatsData,
            currentHash: situation.hashMark,
          }
        : undefined;

      recommendations.push({
        play,
        overallScore,
        confidenceScore: confidence.overallScore,
        situationMatchScore,
        reasoning,
        stats,
        coverageStats,
        hashStats,
      });
    }

    // Sort by overall score (descending)
    recommendations.sort((a, b) => b.overallScore - a.overallScore);

    return recommendations.slice(0, maxResults);
  }

  /**
   * Calculate how well a play matches the current situation
   * Returns 0-100 score
   */
  private static async calculateSituationMatch(
    play: Play,
    situation: GameSituation,
    confidence: {
      overallScore: number;
      streak?: { isHot?: boolean; isCold?: boolean };
      practiceToGame?: { needsMorePractice?: boolean; transferRate?: number };
    },
    teamId: string
  ): Promise<number> {
    let score = 50; // Baseline

    // FIRST: Apply coach-defined preferences (highest priority!)
    // If the coach specifically tagged this play for this situation, give it a big boost
    const { bonus: coachBonus } = getCoachPreferenceBonus(play, situation);
    score += coachBonus;

    // Phase 14: Apply game urgency bonus (score/time awareness)
    const { bonus: urgencyBonus } = getGameUrgencyBonus(play, situation);
    score += urgencyBonus;

    // Add down bonus (additional algorithmic bonus)
    score += getDownBonus(
      situation.down,
      play.play_type,
      play.concept,
      confidence.overallScore
    );

    // Add distance bonus
    score += getDistanceBonus(
      situation.distance,
      play.play_type,
      play.formation,
      play.concept
    );

    // Add field zone bonus
    score += getFieldZoneBonus(
      situation.yardLine,
      play.play_type,
      play.concept,
      situation.distance,
      confidence.overallScore
    );

    // Add streak and practice-to-game bonus
    score += getStreakAndPracticeBonus(confidence);

    // Coverage-based bonus
    if (
      situation.opponentCoverage &&
      situation.opponentCoverage !== "Unknown"
    ) {
      const coverageStats = await this.getCoverageStats(
        play.id,
        teamId,
        situation.opponentCoverage
      );
      score += getCoverageBonus(coverageStats);
    }

    // Hash preference bonus
    const hashStats = await this.getHashStats(play.id, teamId);
    score += getHashBonus(hashStats, situation.hashMark);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Build human-readable reasoning for recommendation
   */
  private static async buildReasoning(
    play: Play,
    situation: GameSituation,
    confidence: ConfidenceData,
    matchScore: number,
    teamId: string
  ): Promise<string[]> {
    // Start with coach-defined preference reasons (show these first!)
    const { reasons: coachReasons } = getCoachPreferenceBonus(play, situation);

    // Phase 14: Get game urgency reasons
    const { reasons: urgencyReasons } = getGameUrgencyBonus(play, situation);

    const reasons: string[] = [
      ...coachReasons,
      ...urgencyReasons,
      ...getConfidenceReasons(confidence, matchScore),
      ...getDownReasons(situation, play),
      ...getFieldZoneReasons(situation),
      ...getStreakReasons(confidence),
    ];

    // Coverage-specific reasoning
    if (
      situation.opponentCoverage &&
      situation.opponentCoverage !== "Unknown"
    ) {
      const coverageStats = await this.getCoverageStats(
        play.id,
        teamId,
        situation.opponentCoverage
      );
      reasons.push(
        ...getCoverageReasons(coverageStats, situation.opponentCoverage)
      );
    }

    // Hash preference reasoning
    const hashStats = await this.getHashStats(play.id, teamId);
    reasons.push(...getHashReasons(hashStats, situation.hashMark));

    return reasons;
  }

  /**
   * Get play statistics for the situation
   */
  private static async getPlayStats(
    playId: string,
    teamId: string,
    _situation: GameSituation
  ): Promise<{
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
  }> {
    try {
      const stats = await ExecutionTrackingService.getPlayStats(playId, teamId);
      return {
        successRate: stats.successRate,
        avgYardsGained: stats.avgYardsGained,
        executionCount: stats.executionCount,
      };
    } catch (error) {
      logError("Error fetching play stats:", error);
      return {
        successRate: 0,
        avgYardsGained: 0,
        executionCount: 0,
      };
    }
  }

  /**
   * Phase 13.2: Get coverage-specific statistics
   */
  private static async getCoverageStats(
    playId: string,
    teamId: string,
    coverage: string
  ): Promise<{
    successRate: number;
    avgYardsGained: number;
    executionCount: number;
    coverage: string;
  } | null> {
    try {
      const stats = await ExecutionTrackingService.getCoverageStats(
        playId,
        teamId,
        coverage
      );

      // Only return if we have meaningful data
      if (stats.executionCount === 0) {
        return null;
      }

      return {
        successRate: stats.successRate,
        avgYardsGained: stats.avgYardsGained,
        executionCount: stats.executionCount,
        coverage,
      };
    } catch (error) {
      logError("Error fetching coverage stats:", error);
      return null;
    }
  }

  /**
   * Phase 13.3: Get hash-specific statistics
   */
  private static async getHashStats(
    playId: string,
    teamId: string
  ): Promise<{
    left: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    middle: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    right: {
      successRate: number;
      avgYardsGained: number;
      executionCount: number;
    };
    bestHash?: "left" | "middle" | "right";
  } | null> {
    try {
      const stats = await ExecutionTrackingService.getHashStats(playId, teamId);

      // Only return if we have some hash data
      const totalExecutions =
        stats.left.executionCount +
        stats.middle.executionCount +
        stats.right.executionCount;
      if (totalExecutions === 0) {
        return null;
      }

      return stats;
    } catch (error) {
      logError("Error fetching hash stats:", error);
      return null;
    }
  }
}
