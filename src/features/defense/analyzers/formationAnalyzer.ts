/**
 * Formation Analyzer
 *
 * Core intelligence module that analyzes offensive formations and provides
 * structured data about receiver distribution, formation type, strength, and box count.
 *
 * This is the foundation for all smart defensive adjustments.
 */

import type { Player } from "@components/playbook/diagram-editor/types/Player";
import type {
  FormationAnalysis,
  FormationType,
  RBPosition,
  FormationStrength,
  HashAlignment,
} from "../types";
import {
  getEligibleReceivers,
  countWideReceiversLeft,
  countWideReceiversRight,
} from "../utils/eligibleReceiverFilter";
import { analyzeTightEnds } from "./tightEndProximityDetector";
import { getCenterXForHash } from "./fieldBoundaryDetector";

/**
 * Standard offensive line count
 */
const O_LINE_COUNT = 5; // LT, LG, C, RG, RT

/**
 * Standard quarterback count
 */
const QB_COUNT = 1;

/**
 * Detect running back position relative to QB.
 *
 * @param players - All players
 * @param centerX - Field center X coordinate
 * @returns RB position classification
 */
function detectRBPosition(players: Player[], centerX: number): RBPosition {
  // Find QB position
  const qb = players.find(
    (p) => p.team === "offense" && p.jerseyNumber === "QB"
  );

  // Find RB (or multiple RBs)
  const rbs = players.filter(
    (p) =>
      p.team === "offense" &&
      (p.jerseyNumber === "RB" ||
        p.jerseyNumber === "FB" ||
        p.jerseyNumber === "HB")
  );

  if (rbs.length === 0) {
    return "none"; // Empty formation
  }

  // Use first RB if multiple
  const rb = rbs[0];

  if (!qb) {
    // Wildcat or no QB scenario
    return rb.x < centerX ? "left" : "right";
  }

  // Determine RB position relative to QB
  const xDiff = Math.abs(rb.x - qb.x);
  const yDiff = Math.abs(rb.y - qb.y);

  // Pistol: RB directly behind QB (small X difference, large Y difference)
  if (xDiff < 1 && yDiff > 3) {
    return "pistol";
  }

  // Offset pistol: RB slightly offset
  if (xDiff < 2 && yDiff > 3) {
    return rb.x < qb.x ? "offset-left" : "offset-right";
  }

  // Standard offset: RB to left or right of QB
  if (rb.x < qb.x - 1) {
    return "left";
  } else if (rb.x > qb.x + 1) {
    return "right";
  }

  // Default to pistol if can't determine
  return "pistol";
}

/**
 * Classify formation type based on receiver distribution.
 *
 * @param receiversLeft - Count of eligible receivers left of center
 * @param receiversRight - Count of eligible receivers right of center
 * @param totalReceivers - Total eligible receivers
 * @param rbPosition - Running back position (to detect Empty)
 * @returns Formation type classification
 */
function classifyFormationType(
  receiversLeft: number,
  receiversRight: number,
  totalReceivers: number,
  rbPosition: RBPosition
): FormationType {
  // Empty formation: 5+ WR/TE receivers, no RB
  if (totalReceivers >= 5 && rbPosition === "none") {
    return "empty";
  }

  // Quads: 4 receivers on one side
  if (receiversLeft === 4 || receiversRight === 4) {
    return "quads";
  }

  // 3x1 formations (check BEFORE trips - more specific)
  if (receiversLeft === 3 && receiversRight === 1) {
    return "3x1-left";
  }
  if (receiversRight === 3 && receiversLeft === 1) {
    return "3x1-right";
  }

  // 2x2 balanced (check BEFORE trips - more specific)
  if (receiversLeft === 2 && receiversRight === 2) {
    return "2x2";
  }

  // Trips: 3 receivers on same side (can be with 2 on other side)
  // This catches 3x2, 3x0, etc.
  if (receiversLeft === 3 || receiversRight === 3) {
    return "trips";
  }

  // Doubles: 2 TEs + 2 WRs (special case, check later if needed)
  if (totalReceivers === 4) {
    return "doubles";
  }

  // Default fallback
  return "2x2";
}

/**
 * Calculate formation strength side.
 *
 * Strength is determined by:
 * 1. Eligible receiver count per side
 * 2. Tight ends in the box (add to strong side)
 * 3. RB position
 *
 * @param receiversLeft - Eligible receivers on left
 * @param receiversRight - Eligible receivers on right
 * @param boxTEsLeft - TEs in box on left side
 * @param boxTEsRight - TEs in box on right side
 * @param rbPosition - RB position
 * @returns Formation strength side
 */
function calculateStrength(
  receiversLeft: number,
  receiversRight: number,
  boxTEsLeft: number,
  boxTEsRight: number,
  rbPosition: RBPosition
): FormationStrength {
  // Calculate strength score for each side
  let leftScore = receiversLeft + boxTEsLeft;
  let rightScore = receiversRight + boxTEsRight;

  // Add RB to appropriate side
  if (rbPosition === "left" || rbPosition === "offset-left") {
    leftScore += 1;
  } else if (rbPosition === "right" || rbPosition === "offset-right") {
    rightScore += 1;
  }
  // Pistol RB doesn't affect strength

  // Determine strength
  if (leftScore > rightScore) {
    return "left";
  } else if (rightScore > leftScore) {
    return "right";
  } else {
    return "balanced";
  }
}

/**
 * Calculate total players in the box.
 *
 * Box count = O-Line (5) + QB (1) + TEs in box + RBs
 *
 * @param boxTECount - Number of TEs in the box
 * @param rbCount - Number of running backs
 * @returns Total players in box
 */
function calculateBoxCount(boxTECount: number, rbCount: number): number {
  return O_LINE_COUNT + QB_COUNT + boxTECount + rbCount;
}

/**
 * Analyze offensive formation and return complete analysis.
 *
 * This is the main entry point for formation intelligence.
 * Call this function whenever you need to understand the offensive setup.
 *
 * @param players - All players on field
 * @param hash - Current hash alignment
 * @returns Complete formation analysis
 *
 * @example
 * ```typescript
 * const analysis = analyzeFormation(players, 'left');
 * console.log(`Formation: ${analysis.type}`);
 * console.log(`Strength: ${analysis.strengthSide}`);
 * console.log(`Box count: ${analysis.boxCount}`);
 * ```
 */
export function analyzeFormation(
  players: Player[],
  hash: HashAlignment
): FormationAnalysis {
  const centerX = getCenterXForHash(hash);

  // Get eligible receivers (all WR, TE, RB, FB)
  const eligibleReceivers = getEligibleReceivers(players);

  // Count "wide" receivers (WR + TE only) for formation classification
  // RBs are excluded because they're in the backfield, not "wide"
  const wideReceiversLeft = countWideReceiversLeft(players, centerX);
  const wideReceiversRight = countWideReceiversRight(players, centerX);

  // Analyze tight ends
  const teAnalysis = analyzeTightEnds(players, centerX);

  // Count box TEs per side
  const boxTEsLeft = teAnalysis.positions.filter(
    (te) => te.side === "left" && te.inBox
  ).length;
  const boxTEsRight = teAnalysis.positions.filter(
    (te) => te.side === "right" && te.inBox
  ).length;

  // Detect RB position
  const rbPosition = detectRBPosition(players, centerX);

  // Count RBs
  const rbCount = players.filter(
    (p) =>
      p.team === "offense" &&
      (p.jerseyNumber === "RB" ||
        p.jerseyNumber === "FB" ||
        p.jerseyNumber === "HB")
  ).length;

  // Classify formation type (using WR/TE counts, not including RBs)
  const formationType = classifyFormationType(
    wideReceiversLeft,
    wideReceiversRight,
    eligibleReceivers.length,
    rbPosition
  );

  // Calculate strength (using WR/TE counts for strength calculation)
  const strengthSide = calculateStrength(
    wideReceiversLeft,
    wideReceiversRight,
    boxTEsLeft,
    boxTEsRight,
    rbPosition
  );

  // Calculate box count
  const boxCount = calculateBoxCount(teAnalysis.boxTECount, rbCount);

  // Check if line is balanced (5 OL in standard positions)
  const oLineCount = players.filter(
    (p) =>
      p.team === "offense" &&
      (p.jerseyNumber === "LT" ||
        p.jerseyNumber === "LG" ||
        p.jerseyNumber === "C" ||
        p.jerseyNumber === "RG" ||
        p.jerseyNumber === "RT" ||
        p.position === "center")
  ).length;
  const balancedLine = oLineCount === O_LINE_COUNT;

  return {
    type: formationType,
    receiversLeft: wideReceiversLeft,
    receiversRight: wideReceiversRight,
    totalEligibleReceivers: eligibleReceivers.length,
    rbPosition,
    strengthSide,
    tightEndPresent: teAnalysis.count > 0,
    tightEndAnalysis: teAnalysis.count > 0 ? teAnalysis : undefined,
    hash,
    boxCount,
    balancedLine,
    analyzedAt: Date.now(),
  };
}
