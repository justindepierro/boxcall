/**
 * usePlaySimilarity Hook
 *
 * Intelligent play similarity detection that calculates weighted similarity
 * across multiple dimensions (formation, play name, personnel, type, motion, etc.)
 *
 * Unlike simple duplicate detection, this allows plays with the same name
 * in different formations, with different motions, etc.
 *
 * Similarity Weights:
 * - Play Name: 40% (most important - same concept)
 * - Formation: 25% (same alignment)
 * - Personnel: 15% (same grouping)
 * - Play Type: 10% (same category)
 * - Motion/Shift: 5% each (additional differentiators)
 *
 * A play is considered:
 * - Exact duplicate: 95%+ similarity (blocks creation)
 * - Very similar: 70-94% (strong warning)
 * - Similar: 50-69% (mild warning)
 * - Related: 30-49% (informational)
 * - Unique: <30% (no warning)
 */

import { useMemo } from "react";
import type { Play } from "../../../types/play";

// =============================================================================
// TYPES
// =============================================================================

export interface SimilarPlay {
  play: Play;
  similarity: number; // 0-100
  matchDetails: MatchDetails;
}

export interface MatchDetails {
  nameMatch: number; // 0-100
  formationMatch: number; // 0-100
  personnelMatch: number; // 0-100
  playTypeMatch: number; // 0-100
  motionMatch: number; // 0-100
  shiftMatch: number; // 0-100
}

export type SimilarityLevel =
  | "exact_duplicate" // 95%+ - same formation + play name + key fields
  | "very_similar" // 70-94% - nearly identical
  | "similar" // 50-69% - many shared attributes
  | "related" // 30-49% - some shared attributes
  | "unique"; // <30% - sufficiently different

export interface PlaySimilarityResult {
  /** Highest similarity found */
  maxSimilarity: number;
  /** Category of similarity */
  level: SimilarityLevel;
  /** Top similar plays (sorted by similarity desc) */
  similarPlays: SimilarPlay[];
  /** Whether this is a true duplicate (same formation + play name) */
  isExactDuplicate: boolean;
  /** Recommendation for the user */
  recommendation: SimilarityRecommendation | null;
  /** Whether to show the similarity indicator */
  showIndicator: boolean;
}

export interface SimilarityRecommendation {
  type: "block" | "warn" | "suggest" | "info";
  title: string;
  message: string;
  actions?: RecommendationAction[];
}

export interface RecommendationAction {
  label: string;
  action:
    | "view_play"
    | "add_motion"
    | "add_shift"
    | "change_formation"
    | "change_personnel"
    | "proceed";
  playId?: string;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const SIMILARITY_WEIGHTS = {
  playName: 0.4,
  formation: 0.25,
  personnel: 0.15,
  playType: 0.1,
  motion: 0.05,
  shift: 0.05,
} as const;

const SIMILARITY_THRESHOLDS = {
  exact_duplicate: 95,
  very_similar: 70,
  similar: 50,
  related: 30,
} as const;

// =============================================================================
// STRING SIMILARITY HELPERS
// =============================================================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate string similarity (0-100) using Levenshtein distance
 */
function stringSimilarity(
  a: string | undefined | null,
  b: string | undefined | null
): number {
  const strA = (a || "").toLowerCase().trim();
  const strB = (b || "").toLowerCase().trim();

  if (!strA && !strB) return 100; // Both empty = match
  if (!strA || !strB) return 0; // One empty = no match
  if (strA === strB) return 100; // Exact match

  const maxLen = Math.max(strA.length, strB.length);
  const distance = levenshteinDistance(strA, strB);
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Check for exact match (case-insensitive)
 */
function exactMatch(
  a: string | undefined | null,
  b: string | undefined | null
): boolean {
  const strA = (a || "").toLowerCase().trim();
  const strB = (b || "").toLowerCase().trim();
  return strA === strB && strA !== "";
}

// =============================================================================
// SIMILARITY CALCULATION
// =============================================================================

interface CurrentPlayData {
  play_name?: string;
  formation?: string;
  personnel?: string;
  p_type?: string;
  motion?: string;
  shift?: string;
}

function calculateMatchDetails(
  current: CurrentPlayData,
  existing: Play
): MatchDetails {
  return {
    nameMatch: stringSimilarity(current.play_name, existing.play_name),
    formationMatch: stringSimilarity(current.formation, existing.formation),
    personnelMatch: stringSimilarity(current.personnel, existing.personnel),
    playTypeMatch: exactMatch(current.p_type, existing.p_type) ? 100 : 0,
    motionMatch: stringSimilarity(current.motion, existing.motion),
    shiftMatch: stringSimilarity(current.shift, existing.shift),
  };
}

function calculateWeightedSimilarity(details: MatchDetails): number {
  const weighted =
    details.nameMatch * SIMILARITY_WEIGHTS.playName +
    details.formationMatch * SIMILARITY_WEIGHTS.formation +
    details.personnelMatch * SIMILARITY_WEIGHTS.personnel +
    details.playTypeMatch * SIMILARITY_WEIGHTS.playType +
    details.motionMatch * SIMILARITY_WEIGHTS.motion +
    details.shiftMatch * SIMILARITY_WEIGHTS.shift;

  return Math.round(weighted);
}

function getSimilarityLevel(similarity: number): SimilarityLevel {
  if (similarity >= SIMILARITY_THRESHOLDS.exact_duplicate)
    return "exact_duplicate";
  if (similarity >= SIMILARITY_THRESHOLDS.very_similar) return "very_similar";
  if (similarity >= SIMILARITY_THRESHOLDS.similar) return "similar";
  if (similarity >= SIMILARITY_THRESHOLDS.related) return "related";
  return "unique";
}

function isExactDuplicate(current: CurrentPlayData, existing: Play): boolean {
  return (
    exactMatch(current.play_name, existing.play_name) &&
    exactMatch(current.formation, existing.formation)
  );
}

// =============================================================================
// RECOMMENDATION GENERATION
// =============================================================================

function generateRecommendation(
  level: SimilarityLevel,
  similarPlays: SimilarPlay[],
  current: CurrentPlayData
): SimilarityRecommendation | null {
  if (level === "unique" || similarPlays.length === 0) return null;

  const topMatch = similarPlays[0];
  const matchedPlay = topMatch.play;

  if (level === "exact_duplicate") {
    return {
      type: "block",
      title: "Exact Duplicate",
      message: `"${matchedPlay.play_name}" in "${matchedPlay.formation}" already exists. Consider adding motion, shift, or a different direction to differentiate.`,
      actions: [
        { label: "View Existing", action: "view_play", playId: matchedPlay.id },
        { label: "Add Motion", action: "add_motion" },
        { label: "Add Shift", action: "add_shift" },
      ],
    };
  }

  if (level === "very_similar") {
    const details = topMatch.matchDetails;
    const suggestions: string[] = [];

    if (details.formationMatch === 100 && details.nameMatch >= 90) {
      suggestions.push("different personnel");
    }
    if (details.motionMatch === 100 || !current.motion) {
      suggestions.push("add motion");
    }
    if (details.shiftMatch === 100 || !current.shift) {
      suggestions.push("add shift");
    }

    return {
      type: "warn",
      title: `${topMatch.similarity}% Similar`,
      message: `Very similar to "${matchedPlay.play_name}" (${matchedPlay.formation}). To differentiate, try: ${suggestions.join(", ") || "different attributes"}.`,
      actions: [
        { label: "View Similar", action: "view_play", playId: matchedPlay.id },
        { label: "Create Anyway", action: "proceed" },
      ],
    };
  }

  if (level === "similar") {
    return {
      type: "suggest",
      title: `${topMatch.similarity}% Similar`,
      message: `Related to "${matchedPlay.play_name}" (${matchedPlay.formation}). Creating this will add a variation to your playbook.`,
      actions: [
        { label: "View Related", action: "view_play", playId: matchedPlay.id },
        { label: "Continue", action: "proceed" },
      ],
    };
  }

  // Related level - just informational
  return {
    type: "info",
    title: `${similarPlays.length} Related Play${similarPlays.length > 1 ? "s" : ""}`,
    message: `Found ${similarPlays.length} play${similarPlays.length > 1 ? "s" : ""} with similar concepts.`,
    actions: [{ label: "View", action: "view_play", playId: matchedPlay.id }],
  };
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function usePlaySimilarity(
  existingPlays: Play[],
  currentPlay: CurrentPlayData
): PlaySimilarityResult {
  return useMemo(() => {
    // Don't calculate if no play name entered
    if (!currentPlay.play_name?.trim()) {
      return {
        maxSimilarity: 0,
        level: "unique" as SimilarityLevel,
        similarPlays: [],
        isExactDuplicate: false,
        recommendation: null,
        showIndicator: false,
      };
    }

    // Calculate similarity for all existing plays
    const similarPlays: SimilarPlay[] = existingPlays
      .map((play) => {
        const matchDetails = calculateMatchDetails(currentPlay, play);
        const similarity = calculateWeightedSimilarity(matchDetails);
        return { play, similarity, matchDetails };
      })
      .filter((sp) => sp.similarity >= SIMILARITY_THRESHOLDS.related) // Only include related+
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity desc
      .slice(0, 5); // Top 5 matches

    const maxSimilarity =
      similarPlays.length > 0 ? similarPlays[0].similarity : 0;
    const level = getSimilarityLevel(maxSimilarity);

    // Check for exact duplicate (same formation + play name)
    const exactDup = existingPlays.some((play) =>
      isExactDuplicate(currentPlay, play)
    );

    // Generate recommendation
    const recommendation = generateRecommendation(
      level,
      similarPlays,
      currentPlay
    );

    return {
      maxSimilarity,
      level,
      similarPlays,
      isExactDuplicate: exactDup,
      recommendation,
      showIndicator: level !== "unique",
    };
  }, [existingPlays, currentPlay]);
}

export { SIMILARITY_THRESHOLDS };
