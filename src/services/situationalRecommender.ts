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
import { TeamSituationDefinitionsService } from "./teamSituationDefinitionsService";
import type { GameSituation } from "../types/session";
import type { Play } from "../types/database";
import type { SituationDefinitions } from "../types/situationDefinitions";
import { logError } from "../utils/logger";
import {
  calculateGameUrgency,
  getPlayTypeRecommendation,
  parseTimeRemaining,
} from "../utils/gameUrgencyCalculator";
import {
  bucketDistance,
  bucketFieldZoneKey,
  getFieldZoneDefinitions,
} from "../utils/situationBucketing";

// ==============================================
// HELPER FUNCTIONS (Extracted to reduce complexity)
// ==============================================

function getPlayTypeCategory(
  playType: string | null | undefined
): "run" | "pass" | "other" {
  const lower = playType?.toLowerCase() ?? "";
  if (lower.includes("run")) return "run";
  if (lower.includes("pass")) return "pass";
  if (lower.includes("rpo")) return "run";
  if (lower.includes("action") || lower.includes("pa")) return "pass";
  return "other";
}

function getPlayConceptText(play: {
  play_name?: string | null;
  tags?: string[] | null;
  p_tag1?: string | null;
  p_tag2?: string | null;
  notes?: string | null;
}): string {
  const parts: string[] = [];
  if (play.play_name) parts.push(play.play_name);
  if (Array.isArray(play.tags)) parts.push(...play.tags);
  if (play.p_tag1) parts.push(play.p_tag1);
  if (play.p_tag2) parts.push(play.p_tag2);
  if (play.notes) parts.push(play.notes);
  return parts.join(" ").toLowerCase();
}

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
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  playType: string | null | undefined,
  formation: string | null | undefined,
  concept: string | null | undefined
): number {
  const distanceBucket = bucketDistance(teamDefs, distance);

  if (distanceBucket === "Short") {
    let bonus = 0;
    if (playType === "run") bonus += 10;
    if (formation?.includes("I-Form") || formation?.includes("Heavy"))
      bonus += 5;
    return bonus;
  }
  if (distanceBucket === "Medium") {
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
  teamDefs: Partial<SituationDefinitions> | null | undefined,
  playType: string | null | undefined,
  concept: string | null | undefined,
  distance: number,
  confidenceScore: number
): number {
  const zoneKey = bucketFieldZoneKey(teamDefs, yardLine);
  const distanceBucket = bucketDistance(teamDefs, distance);

  if (zoneKey === "red_zone" || zoneKey === "goal_line") {
    let bonus = 0;
    if (concept?.includes("fade") || concept?.includes("corner")) bonus += 15;
    if (playType === "run" && distanceBucket === "Short") bonus += 10;
    return bonus;
  }
  if (zoneKey === "plus_territory") {
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
    (confidence.practiceToGame.transferRate ?? 0) >= 10
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

type BonusResult = { bonus: number; reasons: string[] };

function mergeBonusResult(into: BonusResult, from: BonusResult): void {
  into.bonus += from.bonus;
  into.reasons.push(...from.reasons);
}

function getPrefDownBonus(
  prefDownValue: string | null | undefined,
  down: number
): BonusResult {
  if (!prefDownValue) return { bonus: 0, reasons: [] };
  const prefDown = prefDownValue.toLowerCase().replace(/[^\d]/g, "");
  if (prefDown !== String(down)) return { bonus: 0, reasons: [] };
  return { bonus: 20, reasons: [`✓ Coach's ${prefDownValue} down play`] };
}

function getPrefDistanceBonus(
  prefDistanceValue: string | null | undefined,
  distance: number,
  teamDefs: Partial<SituationDefinitions> | null | undefined
): BonusResult {
  if (!prefDistanceValue) return { bonus: 0, reasons: [] };
  const prefDis = prefDistanceValue.toLowerCase();
  const bucket = bucketDistance(teamDefs, distance);
  const matches =
    (prefDis.includes("short") && bucket === "Short") ||
    (prefDis.includes("medium") && bucket === "Medium") ||
    (prefDis.includes("very") && bucket === "Very Long") ||
    (prefDis.includes("long") && (bucket === "Long" || bucket === "Very Long"));

  if (!matches) return { bonus: 0, reasons: [] };
  return {
    bonus: 15,
    reasons: [`✓ Designed for ${prefDistanceValue} distance`],
  };
}

function getPrefHashBonus(
  prefHashValue: string | null | undefined,
  hashMark: "left" | "middle" | "right" | undefined
): BonusResult {
  if (!prefHashValue || !hashMark) return { bonus: 0, reasons: [] };
  const pref = prefHashValue.toLowerCase();
  let normalizedPref = pref.trim();
  if (pref.includes("left")) normalizedPref = "left";
  else if (pref.includes("right")) normalizedPref = "right";
  else if (pref.includes("mid")) normalizedPref = "middle";

  if (normalizedPref !== hashMark.toLowerCase())
    return { bonus: 0, reasons: [] };
  return { bonus: 10, reasons: [`✓ Best from ${prefHashValue}`] };
}

function getPrefFieldPositionBonus(
  prefFieldPosValue: string | null | undefined,
  yardLine: number,
  teamDefs: Partial<SituationDefinitions> | null | undefined
): BonusResult {
  if (!prefFieldPosValue) return { bonus: 0, reasons: [] };

  const prefTrimmed = prefFieldPosValue.trim();
  const currentZoneKey = bucketFieldZoneKey(teamDefs, yardLine);

  // Canonicalize preference to a zone ID via exact label match when possible
  const zones = getFieldZoneDefinitions(teamDefs);
  const matchedZone = zones.find(
    (z) => z.label.trim().toLowerCase() === prefTrimmed.toLowerCase()
  );

  const prefZoneKey = matchedZone?.id ?? null;
  const matches = !!prefZoneKey && prefZoneKey === currentZoneKey;

  if (!matches) return { bonus: 0, reasons: [] };
  return {
    bonus: 15,
    reasons: [`✓ ${matchedZone?.label ?? prefTrimmed} play`],
  };
}

function getPrefCoverageBonus(
  prefCoverageValue: string | null | undefined,
  opponentCoverage: string | undefined
): BonusResult {
  if (!prefCoverageValue || !opponentCoverage) return { bonus: 0, reasons: [] };
  const prefCov = prefCoverageValue.toLowerCase();
  const oppCov = opponentCoverage.toLowerCase();

  const matches =
    prefCov.includes(oppCov) ||
    oppCov.includes(prefCov) ||
    (prefCov.includes("man") && oppCov.includes("man")) ||
    (prefCov.includes("zone") && oppCov.includes("zone"));

  if (!matches) return { bonus: 0, reasons: [] };
  return { bonus: 12, reasons: [`✓ Designed vs ${prefCoverageValue}`] };
}

function getPlayTypeFitBonus(
  playTypeRec: { type: "run" | "pass" | "balanced"; reason: string },
  playType: "run" | "pass" | "other"
): BonusResult {
  if (playTypeRec.type === "balanced") {
    return { bonus: 5, reasons: [] };
  }
  if (playTypeRec.type === "run" && playType === "run") {
    return { bonus: 15, reasons: [`✓ Run game fits (${playTypeRec.reason})`] };
  }
  if (playTypeRec.type === "pass" && playType === "pass") {
    return { bonus: 15, reasons: [`✓ Pass game fits (${playTypeRec.reason})`] };
  }
  return { bonus: 0, reasons: [] };
}

function getUrgencyModeBonus(params: {
  urgency: string;
  playType: "run" | "pass" | "other";
  concept: string;
  prefSituation: string | null | undefined;
}): BonusResult {
  const { urgency, playType, concept, prefSituation } = params;

  const handlers: Record<string, () => BonusResult> = {
    two_minute: () => {
      const result: BonusResult = { bonus: 0, reasons: [] };
      const clockStops =
        concept.includes("out") ||
        concept.includes("sideline") ||
        concept.includes("quick");
      if (clockStops) {
        result.bonus += 20;
        result.reasons.push("⏱️ Good 2-minute drill play (stops clock)");
      }
      const pref = prefSituation?.toLowerCase() ?? "";
      if (pref.includes("2-minute") || pref.includes("two minute")) {
        result.bonus += 25;
        result.reasons.push("⏱️ Coach's 2-minute play");
      }
      return result;
    },
    must_score: () => {
      const result: BonusResult = { bonus: 0, reasons: [] };
      if (playType === "pass") result.bonus += 10;
      const aggressive =
        concept.includes("deep") ||
        concept.includes("vertical") ||
        concept.includes("shot");
      if (aggressive) {
        result.bonus += 15;
        result.reasons.push("🎯 Aggressive shot play (must score)");
      }
      return result;
    },
    protect_lead: () => {
      const result: BonusResult = { bonus: 0, reasons: [] };
      if (playType === "run") result.bonus += 15;
      const clock =
        concept.includes("power") ||
        concept.includes("iso") ||
        concept.includes("dive");
      if (clock) {
        result.bonus += 10;
        result.reasons.push("🔒 Clock management play");
      }
      const risky = concept.includes("deep") || concept.includes("shot");
      if (risky) {
        result.bonus -= 15;
        result.reasons.push("⚠️ Risky with lead");
      }
      return result;
    },
    desperation: () => {
      const result: BonusResult = { bonus: 0, reasons: [] };
      const boomOrBust =
        concept.includes("hail mary") ||
        concept.includes("deep") ||
        concept.includes("trick");
      if (boomOrBust) {
        result.bonus += 25;
        result.reasons.push("🚨 Desperation play");
      }
      return result;
    },
    ice_the_game: () => {
      const result: BonusResult = { bonus: 0, reasons: [] };
      if (playType === "run") {
        result.bonus += 20;
        result.reasons.push("❄️ Run to ice the game");
      }
      if (playType === "pass") {
        result.bonus -= 10;
      }
      return result;
    },
  };

  return handlers[urgency]?.() ?? { bonus: 0, reasons: [] };
}

function getLateGameTimeBonuses(params: {
  timeRemainingSeconds: number;
  scoreDiff: number;
  quarter: number;
  playType: "run" | "pass" | "other";
  concept: string;
}): BonusResult {
  const { timeRemainingSeconds, scoreDiff, quarter, playType, concept } =
    params;
  const result: BonusResult = { bonus: 0, reasons: [] };

  if (timeRemainingSeconds <= 30 && scoreDiff < 0 && playType === "pass") {
    result.bonus += 10;
    result.reasons.push("⏰ Under 30 seconds, need to pass");
  }

  const trailingLate =
    scoreDiff < 0 && quarter >= 4 && timeRemainingSeconds <= 300;
  const deepPass =
    playType === "pass" &&
    (concept.includes("deep") || concept.includes("vertical"));
  if (trailingLate && deepPass) {
    result.bonus += 10;
    result.reasons.push("📈 Trailing in 4th - go deep");
  }

  return result;
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
  },
  teamDefs: Partial<SituationDefinitions> | null | undefined
): { bonus: number; reasons: string[] } {
  const result: BonusResult = { bonus: 0, reasons: [] };

  mergeBonusResult(result, getPrefDownBonus(play.pref_down, situation.down));
  mergeBonusResult(
    result,
    getPrefDistanceBonus(play.pref_dis, situation.distance, teamDefs)
  );
  mergeBonusResult(
    result,
    getPrefHashBonus(play.pref_hash, situation.hashMark)
  );
  mergeBonusResult(
    result,
    getPrefFieldPositionBonus(play.pref_field_pos, situation.yardLine, teamDefs)
  );
  mergeBonusResult(
    result,
    getPrefCoverageBonus(play.pref_cov, situation.opponentCoverage)
  );

  // Custom situation is informational - shown in reasoning but no automatic bonus
  // (since we can't automatically detect "2-Minute" or "Must Have" situations)
  if (play.pref_situation) {
    result.reasons.push(`📋 Tagged: ${play.pref_situation}`);
  }

  return result;
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
    p_type?: string | null;
    play_name?: string | null;
    tags?: string[] | null;
    p_tag1?: string | null;
    p_tag2?: string | null;
    notes?: string | null;
    pref_situation?: string | null;
  },
  situation: GameSituation
): { bonus: number; reasons: string[] } {
  const result: BonusResult = { bonus: 0, reasons: [] };

  // Need score and time data to calculate urgency
  if (
    situation.teamScore === undefined ||
    situation.opponentScore === undefined
  ) {
    return result;
  }

  const urgency = calculateGameUrgency(situation);
  const playTypeRec = getPlayTypeRecommendation(situation);
  const playType = getPlayTypeCategory(play.p_type);
  const concept = getPlayConceptText(play);
  const scoreDiff = situation.teamScore - situation.opponentScore;
  const timeRemainingSeconds = parseTimeRemaining(situation.timeRemaining);

  mergeBonusResult(result, getPlayTypeFitBonus(playTypeRec, playType));
  mergeBonusResult(
    result,
    getUrgencyModeBonus({
      urgency,
      playType,
      concept,
      prefSituation: play.pref_situation,
    })
  );
  mergeBonusResult(
    result,
    getLateGameTimeBonuses({
      timeRemainingSeconds,
      scoreDiff,
      quarter: situation.quarter,
      playType,
      concept,
    })
  );

  return result;
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
function getDownReasons(
  situation: GameSituation,
  play: Play,
  teamDefs: Partial<SituationDefinitions> | null | undefined
): string[] {
  const reasons: string[] = [];
  const playType = getPlayTypeCategory(play.p_type);
  const concept = getPlayConceptText(play);
  const distanceBucket = bucketDistance(teamDefs, situation.distance);
  if (situation.down === 3 && distanceBucket === "Short") {
    if (playType === "run") reasons.push("Strong 3rd & short conversion play");
    else if (concept.includes("quick"))
      reasons.push("Quick-hitting 3rd down concept");
  } else if (
    situation.down === 3 &&
    (distanceBucket === "Long" || distanceBucket === "Very Long") &&
    playType === "pass"
  ) {
    reasons.push("Designed for 3rd & long");
  }
  return reasons;
}

/** Get field zone reasoning */
function getFieldZoneReasons(
  situation: GameSituation,
  teamDefs: Partial<SituationDefinitions> | null | undefined
): string[] {
  const zoneKey = bucketFieldZoneKey(teamDefs, situation.yardLine);
  if (zoneKey === "goal_line") return ["Goal line package"];
  if (zoneKey === "red_zone") return ["Red zone tested"];
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

    let teamDefs: SituationDefinitions | null = null;
    try {
      teamDefs = await TeamSituationDefinitionsService.get(teamId);
    } catch (error) {
      logError("Failed to load team situation definitions", error);
      teamDefs = null;
    }

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
        teamId,
        teamDefs
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
        teamId,
        teamDefs
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
          ? ((await this.getCoverageStats(
              play.id,
              teamId,
              situation.opponentCoverage
            )) ?? undefined)
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
    teamId: string,
    teamDefs: Partial<SituationDefinitions> | null | undefined
  ): Promise<number> {
    let score = 50; // Baseline

    // FIRST: Apply coach-defined preferences (highest priority!)
    // If the coach specifically tagged this play for this situation, give it a big boost
    const { bonus: coachBonus } = getCoachPreferenceBonus(
      play,
      situation,
      teamDefs
    );
    score += coachBonus;

    // Phase 14: Apply game urgency bonus (score/time awareness)
    const { bonus: urgencyBonus } = getGameUrgencyBonus(play, situation);
    score += urgencyBonus;

    const playType = getPlayTypeCategory(play.p_type);
    const concept = getPlayConceptText(play);

    // Add down bonus (additional algorithmic bonus)
    score += getDownBonus(
      situation.down,
      playType,
      concept,
      confidence.overallScore
    );

    // Add distance bonus
    score += getDistanceBonus(
      situation.distance,
      teamDefs,
      playType,
      play.formation,
      concept
    );

    // Add field zone bonus
    score += getFieldZoneBonus(
      situation.yardLine,
      teamDefs,
      playType,
      concept,
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
    teamId: string,
    teamDefs: Partial<SituationDefinitions> | null | undefined
  ): Promise<string[]> {
    // Start with coach-defined preference reasons (show these first!)
    const { reasons: coachReasons } = getCoachPreferenceBonus(
      play,
      situation,
      teamDefs
    );

    // Phase 14: Get game urgency reasons
    const { reasons: urgencyReasons } = getGameUrgencyBonus(play, situation);

    const reasons: string[] = [
      ...coachReasons,
      ...urgencyReasons,
      ...getConfidenceReasons(confidence, matchScore),
      ...getDownReasons(situation, play, teamDefs),
      ...getFieldZoneReasons(situation, teamDefs),
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
        avgYardsGained: stats.avgYardsGained ?? 0,
        executionCount: stats.totalExecutions,
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
