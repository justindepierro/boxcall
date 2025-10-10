/**
 * Formation Analysis Types
 *
 * Types and interfaces for analyzing offensive formations.
 * Used by formation analyzers to return structured data about offensive setups.
 */

/**
 * Formation type classification
 */
export type FormationType =
  | "2x2" // Balanced 2 receivers each side
  | "3x1-left" // 3 receivers left, 1 right
  | "3x1-right" // 3 receivers right, 1 left
  | "empty" // 5 receivers, no RB
  | "doubles" // 2 TEs + 2 WRs
  | "trips" // 3 receivers same side (can overlap with 3x1)
  | "quads" // 4 receivers one side
  | "bunch" // 3+ receivers bunched tight
  | "unbalanced" // Unbalanced offensive line
  | "wildcat"; // Direct snap to RB/WR

/**
 * Running back position relative to QB
 */
export type RBPosition =
  | "left" // Left of QB
  | "right" // Right of QB
  | "pistol" // Directly behind QB
  | "offset-left" // Offset pistol to left
  | "offset-right" // Offset pistol to right
  | "none"; // No RB (Empty formation)

/**
 * Formation strength/side designation
 */
export type FormationStrength = "left" | "right" | "balanced";

/**
 * Hash alignment position
 */
export type HashAlignment = "left" | "middle" | "right";

/**
 * Tight end position analysis
 */
export interface TightEndPosition {
  /** Unique player ID */
  playerId: string;

  /** Which side of center */
  side: "left" | "right";

  /** Is TE within 2 yards of offensive tackle (counts as "in the box") */
  inBox: boolean;

  /** Distance in yards from nearest tackle */
  distanceFromTackle: number;

  /** X coordinate on field */
  x: number;

  /** Y coordinate on field */
  y: number;
}

/**
 * Tight end analysis result
 */
export interface TightEndAnalysis {
  /** Total number of tight ends in formation */
  count: number;

  /** Detailed position info for each TE */
  positions: TightEndPosition[];

  /** Number of TEs "in the box" (within 2 yards of OL) */
  boxTECount: number;

  /** Number of TEs split out (3+ yards from OL) */
  splitTECount: number;
}

/**
 * Complete offensive formation analysis
 */
export interface FormationAnalysis {
  /** Classified formation type */
  type: FormationType;

  /** Number of eligible receivers left of center (excludes O-Line & QB) */
  receiversLeft: number;

  /** Number of eligible receivers right of center (excludes O-Line & QB) */
  receiversRight: number;

  /** Total eligible receivers */
  totalEligibleReceivers: number;

  /** Running back position */
  rbPosition: RBPosition;

  /** Formation strength side (based on eligible receivers + TEs in box) */
  strengthSide: FormationStrength;

  /** Are tight ends present? */
  tightEndPresent: boolean;

  /** Detailed tight end analysis */
  tightEndAnalysis?: TightEndAnalysis;

  /** Current hash alignment */
  hash: HashAlignment;

  /** Total players in the box (OL + QB + TEs in box + RBs) */
  boxCount: number;

  /** Is offensive line balanced? */
  balancedLine: boolean;

  /** Timestamp of analysis */
  analyzedAt: number;
}
