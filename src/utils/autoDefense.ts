/**
 * Auto-Defense Utility
 *
 * Automatically recommends defensive schemes based on offensive formation analysis.
 * Provides intelligent defaults to speed up diagram creation.
 */

export type FormationAnalysis = {
  type:
    | "2x2"
    | "3x1-left"
    | "3x1-right"
    | "empty"
    | "doubles"
    | "trips"
    | "quads"
    | "bunch"
    | "unbalanced"
    | "wildcat";
  totalEligibleReceivers: number;
  boxCount: number;
  strengthSide: "left" | "right" | "balanced";
};

export interface DefenseRecommendation {
  /** Recommended defense scheme ID */
  schemeId: string;

  /** Human-readable scheme name */
  schemeName: string;

  /** Why this scheme was recommended */
  reason: string;

  /** Confidence level (0-1) */
  confidence: number;
}

/**
 * Analyze offensive formation and recommend defensive scheme.
 *
 * Recommendation Logic:
 * - Empty/5 WR → Dime (6 DBs)
 * - 4 WR (Quads/Trips) → Nickel (5 DBs)
 * - 3 WR (3x1, Spread) → 4-2-5 Nickel
 * - 2 WR Balanced → 4-3 Base
 * - Heavy TE/Multiple RB → 4-3 or 3-4 to match power
 * - Unbalanced line → Stack the strong side
 *
 * @param analysis - Formation analysis from analyzeFormation()
 * @returns Recommended defensive scheme
 */
export function recommendDefense(
  analysis: FormationAnalysis
): DefenseRecommendation {
  const { type, totalEligibleReceivers, boxCount, strengthSide } = analysis;

  // Empty formation → Dime (6 DBs)
  if (type === "empty" || totalEligibleReceivers >= 5) {
    return {
      schemeId: "dime",
      schemeName: "Dime (2-3-6)",
      reason: "Empty formation detected - need 6 DBs to cover 5 receivers",
      confidence: 0.95,
    };
  }

  // Quads → Nickel with safety help
  if (type === "quads") {
    return {
      schemeId: "nickel",
      schemeName: "Nickel (4-2-5)",
      reason: "Quads formation - 5 DBs with safety rotation to 4-receiver side",
      confidence: 0.9,
    };
  }

  // Trips → Nickel
  if (type === "trips") {
    return {
      schemeId: "nickel",
      schemeName: "Nickel (4-2-5)",
      reason: "Trips formation - 5 DBs to match 3-receiver side",
      confidence: 0.9,
    };
  }

  // 3x1 Spread → 4-2-5 Nickel
  if (type === "3x1-left" || type === "3x1-right") {
    return {
      schemeId: "nickel",
      schemeName: "Nickel (4-2-5)",
      reason: "3x1 spread - 5 DBs with slot corner to match trips side",
      confidence: 0.85,
    };
  }

  // 2x2 Balanced → 4-3 Base (most common matchup)
  if (type === "2x2") {
    // If heavy box (8+), consider goal line defense
    if (boxCount >= 8) {
      return {
        schemeId: "goalLine",
        schemeName: "Goal Line (6-2-3)",
        reason: "Heavy box count - goal line defense to stop power run",
        confidence: 0.8,
      };
    }

    return {
      schemeId: "base43",
      schemeName: "4-3 Base",
      reason: "Balanced 2x2 formation - standard 4-3 coverage",
      confidence: 0.85,
    };
  }

  // Doubles (2 TE, 2 WR) → 4-3 or 3-4 to match physicality
  if (type === "doubles") {
    return {
      schemeId: "base43",
      schemeName: "4-3 Base",
      reason: "Doubles formation - 4-3 to match tight ends in box",
      confidence: 0.8,
    };
  }

  // Unbalanced line → Stack strong side
  if (type === "unbalanced") {
    return {
      schemeId: "base43",
      schemeName: "4-3 Strong",
      reason: `Unbalanced line - stack ${strengthSide} side to match strength`,
      confidence: 0.75,
    };
  }

  // Wildcat → Base defense, box integrity
  if (type === "wildcat") {
    return {
      schemeId: "base43",
      schemeName: "4-3 Base",
      reason: "Wildcat - maintain gap integrity with base defense",
      confidence: 0.8,
    };
  }

  // Default fallback → 4-3 Base (safest option)
  return {
    schemeId: "base43",
    schemeName: "4-3 Base",
    reason: "Default base defense",
    confidence: 0.7,
  };
}

/**
 * Get user-friendly description of recommended defense vs offense.
 *
 * @param analysis - Formation analysis
 * @param recommendation - Defense recommendation
 * @returns Formatted string for toast/UI display
 */
export function formatDefenseRecommendation(
  analysis: FormationAnalysis,
  recommendation: DefenseRecommendation
): string {
  const formationName = getFormationDisplayName(analysis.type);
  return `${recommendation.schemeName} vs ${formationName}`;
}

/**
 * Get human-readable formation name for display.
 *
 * @param type - Formation type
 * @returns Display name
 */
function getFormationDisplayName(type: FormationAnalysis["type"]): string {
  const names: Record<FormationAnalysis["type"], string> = {
    "2x2": "Spread 2x2",
    "3x1-left": "3x1 Left",
    "3x1-right": "3x1 Right",
    empty: "Empty",
    doubles: "Doubles",
    trips: "Trips",
    quads: "Quads",
    bunch: "Bunch",
    unbalanced: "Unbalanced",
    wildcat: "Wildcat",
  };

  return names[type] || type;
}
