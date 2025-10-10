/**
 * Coverage Adjustment Engine
 * 
 * Intelligently adjusts defensive secondary alignment based on offensive formation analysis.
 * 
 * Key adjustments:
 * - NCB aligns to RB side in 2x2
 * - Safeties rotate to strength in 3x1
 * - Corners adjust depth based on WR splits
 * - Handles Empty with dime package logic
 */

import type { FormationAnalysis } from "../types/formationTypes";
import type { Player } from "../../../components/playbook/diagram-editor/types/Player";

/**
 * Coverage adjustment parameters
 */
export interface CoverageAdjustmentParams {
  /** Offensive formation analysis */
  formationAnalysis: FormationAnalysis;
  
  /** Current defensive players on field */
  defensivePlayers: Player[];
  
  /** Center X position (based on hash) */
  centerX: number;
  
  /** Line of scrimmage Y coordinate */
  losY: number;
  
  /** Field width (53.333 yards) */
  fieldWidth: number;
}

/**
 * Adjusted player position
 */
export interface PlayerAdjustment {
  /** Player ID to update */
  playerId: string;
  
  /** New X position */
  newX: number;
  
  /** New Y position (optional - depth adjustment) */
  newY?: number;
  
  /** Reason for adjustment (for debugging/logging) */
  reason: string;
}

/**
 * Coverage adjustment result
 */
export interface CoverageAdjustmentResult {
  /** Player adjustments to apply */
  adjustments: PlayerAdjustment[];
  
  /** Coverage call recommendation */
  recommendedCoverage: string;
  
  /** Adjustment summary for logging */
  summary: string;
}

/**
 * Adjust Nickel CB position based on RB location
 * 
 * Rule: NCB aligns to RB side to help with run support and slot receiver
 * 
 * @param ncb - Nickel cornerback player
 * @param formationAnalysis - Offensive formation data
 * @param centerX - Center X position
 * @param losY - Line of scrimmage Y coordinate
 * @returns Adjustment for NCB position
 */
function adjustNickelCB(
  ncb: Player,
  formationAnalysis: FormationAnalysis,
  centerX: number,
  losY: number
): PlayerAdjustment | null {
  const { rbPosition } = formationAnalysis;

  // No RB = Empty formation, NCB stays in default position
  if (rbPosition === 'none') {
    return null;
  }

  // Determine target side based on RB position
  let targetSide: 'left' | 'right' = 'left'; // Default to left

  if (rbPosition === 'right' || rbPosition === 'offset-right') {
    targetSide = 'right';
  } else if (rbPosition === 'left' || rbPosition === 'offset-left' || rbPosition === 'pistol') {
    targetSide = 'left';
  }

  // Calculate target X position
  // Left side: Split between LT and left slot (centerX-3 + 12) / 2
  // Right side: Split between RT and right slot (centerX+3 + (fieldWidth-12)) / 2
  const leftSlotX = 12;
  const rightSlotX = 53.333 - 12; // fieldWidth - 12
  const leftTackleX = centerX - 3;
  const rightTackleX = centerX + 3;

  const targetX = targetSide === 'left'
    ? (leftTackleX + leftSlotX) / 2
    : (rightTackleX + rightSlotX) / 2;

  // Only adjust if significant change (> 2 yards)
  const xDiff = Math.abs(ncb.x - targetX);
  if (xDiff < 2) {
    return null;
  }

  return {
    playerId: ncb.id,
    newX: targetX,
    newY: losY - 5, // NCB depth: 5 yards
    reason: `Align NCB to ${targetSide} (RB side: ${rbPosition})`,
  };
}

/**
 * Adjust safeties based on formation strength
 * 
 * Rules:
 * - 2x2: Balanced coverage, safeties aligned inside #2 receivers
 * - 3x1: Rotate to strength (3-receiver side), strong safety moves closer
 * - Empty: Safeties stay deep, balanced
 * 
 * @param safeties - Array of safety players (FS, SS)
 * @param formationAnalysis - Offensive formation data
 * @param losY - Line of scrimmage Y coordinate
 * @param fieldWidth - Field width
 * @returns Array of safety adjustments
 */
function adjustSafeties(
  safeties: Player[],
  formationAnalysis: FormationAnalysis,
  losY: number,
  fieldWidth: number
): PlayerAdjustment[] {
  const adjustments: PlayerAdjustment[] = [];
  const { type, strengthSide } = formationAnalysis;

  // Sort safeties by X position (left to right)
  const sortedSafeties = [...safeties].sort((a, b) => a.x - b.x);
  const leftSafety = sortedSafeties[0];
  const rightSafety = sortedSafeties[1];

  if (!leftSafety || !rightSafety) {
    return adjustments;
  }

  // 3x1 formations: Rotate to strength
  if (type.startsWith('3x1')) {
    const strengthLeft = strengthSide === 'left';
    
    // Strong safety moves to strength side
    // Free safety stays middle-deep
    if (strengthLeft) {
      // 3 receivers left
      const targetLeftX = 11; // Closer to left side
      const targetRightX = fieldWidth / 2 + 4; // Middle-right
      
      adjustments.push({
        playerId: leftSafety.id,
        newX: targetLeftX,
        newY: losY - 10,
        reason: '3x1 left: Strong safety to strength',
      });
      
      adjustments.push({
        playerId: rightSafety.id,
        newX: targetRightX,
        newY: losY - 12,
        reason: '3x1 left: Free safety middle-deep',
      });
    } else {
      // 3 receivers right
      const targetLeftX = fieldWidth / 2 - 4; // Middle-left
      const targetRightX = fieldWidth - 11; // Closer to right side
      
      adjustments.push({
        playerId: leftSafety.id,
        newX: targetLeftX,
        newY: losY - 12,
        reason: '3x1 right: Free safety middle-deep',
      });
      
      adjustments.push({
        playerId: rightSafety.id,
        newX: targetRightX,
        newY: losY - 10,
        reason: '3x1 right: Strong safety to strength',
      });
    }
  }

  // 2x2: Balanced coverage
  else if (type === '2x2') {
    const leftSlotX = 12;
    const rightSlotX = fieldWidth - 12;
    
    // Safeties inside #2 receivers (slot)
    adjustments.push({
      playerId: leftSafety.id,
      newX: leftSlotX + 1,
      newY: losY - 10,
      reason: '2x2: Left safety inside slot',
    });
    
    adjustments.push({
      playerId: rightSafety.id,
      newX: rightSlotX - 1,
      newY: losY - 10,
      reason: '2x2: Right safety inside slot',
    });
  }

  // Empty: Safeties stay deep and balanced
  else if (type === 'empty') {
    const centerX = fieldWidth / 2;
    
    adjustments.push({
      playerId: leftSafety.id,
      newX: centerX - 8,
      newY: losY - 12,
      reason: 'Empty: Deep balanced left',
    });
    
    adjustments.push({
      playerId: rightSafety.id,
      newX: centerX + 8,
      newY: losY - 12,
      reason: 'Empty: Deep balanced right',
    });
  }

  return adjustments;
}

/**
 * Adjust corners based on WR splits
 * 
 * Rules:
 * - Wider WR splits: Corners play slightly tighter (reduce cushion)
 * - Compressed splits: Corners can play deeper
 * 
 * @param corners - Array of corner players (CB)
 * @param formationAnalysis - Offensive formation data
 * @param losY - Line of scrimmage Y coordinate
 * @param fieldWidth - Field width
 * @returns Array of corner adjustments
 */
function adjustCorners(
  corners: Player[],
  formationAnalysis: FormationAnalysis,
  losY: number,
  fieldWidth: number
): PlayerAdjustment[] {
  const adjustments: PlayerAdjustment[] = [];

  // Sort corners by X position (left to right)
  const sortedCorners = [...corners].sort((a, b) => a.x - b.x);
  
  // Typical WR positions
  const leftOutsideWRX = 6;
  const rightOutsideWRX = fieldWidth - 6;

  sortedCorners.forEach((corner) => {
    const isLeftCorner = corner.x < fieldWidth / 2;
    
    // Default depth: 6 yards
    // Tighter vs wider splits: 5 yards
    let targetDepth = 6;
    
    // Check if this is a wide formation (Empty, Quads)
    if (formationAnalysis.type === 'empty' || formationAnalysis.type === 'quads') {
      targetDepth = 5; // Press coverage vs spread
    }
    
    const targetX = isLeftCorner 
      ? leftOutsideWRX + 1  // 1 yard inside left outside WR
      : rightOutsideWRX - 1; // 1 yard inside right outside WR
    
    adjustments.push({
      playerId: corner.id,
      newX: targetX,
      newY: losY - targetDepth,
      reason: `Corner ${isLeftCorner ? 'left' : 'right'}: ${targetDepth}yd depth vs ${formationAnalysis.type}`,
    });
  });

  return adjustments;
}

/**
 * Main coverage adjustment function
 * 
 * Analyzes offensive formation and generates defensive adjustments
 * 
 * @param params - Coverage adjustment parameters
 * @returns Coverage adjustment result with player updates
 */
export function adjustCoverage(
  params: CoverageAdjustmentParams
): CoverageAdjustmentResult {
  const { formationAnalysis, defensivePlayers, centerX, losY, fieldWidth } = params;
  
  const adjustments: PlayerAdjustment[] = [];
  
  // Find defensive backs by position
  const ncb = defensivePlayers.find((p) => p.jerseyNumber === 'NCB');
  const safeties = defensivePlayers.filter((p) => p.jerseyNumber === 'S' || p.jerseyNumber === 'SS' || p.jerseyNumber === 'FS');
  const corners = defensivePlayers.filter((p) => p.jerseyNumber === 'CB');
  
  // Adjust NCB to RB side
  if (ncb) {
    const ncbAdjustment = adjustNickelCB(ncb, formationAnalysis, centerX, losY);
    if (ncbAdjustment) {
      adjustments.push(ncbAdjustment);
    }
  }
  
  // Adjust safeties based on formation strength
  if (safeties.length >= 2) {
    const safetyAdjustments = adjustSafeties(safeties, formationAnalysis, losY, fieldWidth);
    adjustments.push(...safetyAdjustments);
  }
  
  // Adjust corners based on WR splits
  if (corners.length >= 2) {
    const cornerAdjustments = adjustCorners(corners, formationAnalysis, losY, fieldWidth);
    adjustments.push(...cornerAdjustments);
  }
  
  // Generate coverage recommendation
  const recommendedCoverage = getCoverageRecommendation(formationAnalysis);
  
  // Generate summary
  const summary = `Adjusted ${adjustments.length} players for ${formationAnalysis.type} formation (${recommendedCoverage})`;
  
  return {
    adjustments,
    recommendedCoverage,
    summary,
  };
}

/**
 * Recommend coverage based on formation
 * 
 * @param formationAnalysis - Offensive formation data
 * @returns Coverage call string
 */
function getCoverageRecommendation(formationAnalysis: FormationAnalysis): string {
  const { type, strengthSide, tightEndPresent } = formationAnalysis;
  
  if (type === 'empty') {
    return 'Cover 2 Man / Quarter';
  }
  
  if (type.startsWith('3x1')) {
    return tightEndPresent 
      ? `Cover 3 Sky (${strengthSide})`  // Safety over TE
      : `Cover 3 Cloud (${strengthSide})`; // Safety over #2
  }
  
  if (type === '2x2') {
    return 'Cover 2 / Cover 4';
  }
  
  if (type === 'trips') {
    return `Cover 3 to ${strengthSide}`;
  }
  
  return 'Cover 3';
}
