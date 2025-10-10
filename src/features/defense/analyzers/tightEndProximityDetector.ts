/**
 * Tight End Proximity Detector
 * 
 * Analyzes tight end positions relative to offensive line to determine
 * if they're "in the box" (within 2 yards of tackle) or split out.
 * 
 * This affects run strength calculation and defensive adjustments.
 */

import type { Player } from '@components/playbook/diagram-editor/types/Player';
import type { TightEndPosition, TightEndAnalysis } from '../types';

/**
 * Distance threshold for "in the box" determination (yards)
 * TEs within this distance of a tackle count as blockers, not receivers
 */
const BOX_THRESHOLD_YARDS = 2;

/**
 * Detect if a tight end is positioned "in the box" (close to offensive line).
 * 
 * A TE is considered "in the box" if they're within 2 yards of either tackle.
 * Box TEs are treated as blockers for run strength calculation.
 * 
 * @param te - Tight end player to analyze
 * @param leftTackle - Left tackle player
 * @param rightTackle - Right tackle player
 * @returns True if TE is within box threshold
 * 
 * @example
 * ```typescript
 * const inBox = isTightEndInBox(tePlayer, ltPlayer, rtPlayer);
 * if (inBox) {
 *   console.log('TE will help with run blocking');
 * }
 * ```
 */
export function isTightEndInBox(
  te: Player,
  leftTackle: Player,
  rightTackle: Player
): boolean {
  const distanceFromLT = Math.abs(te.x - leftTackle.x);
  const distanceFromRT = Math.abs(te.x - rightTackle.x);

  const closestDistance = Math.min(distanceFromLT, distanceFromRT);

  return closestDistance <= BOX_THRESHOLD_YARDS;
}

/**
 * Get distance from tight end to nearest tackle.
 * 
 * @param te - Tight end player
 * @param leftTackle - Left tackle player
 * @param rightTackle - Right tackle player
 * @returns Distance in yards to nearest tackle
 */
export function getDistanceToNearestTackle(
  te: Player,
  leftTackle: Player,
  rightTackle: Player
): number {
  const distanceFromLT = Math.abs(te.x - leftTackle.x);
  const distanceFromRT = Math.abs(te.x - rightTackle.x);

  return Math.min(distanceFromLT, distanceFromRT);
}

/**
 * Analyze all tight ends in the formation.
 * 
 * Returns detailed position information for each TE including:
 * - Side of formation (left/right of center)
 * - Whether they're in the box (within 2 yards of OL)
 * - Exact distance from nearest tackle
 * 
 * @param players - All players on field
 * @param centerX - X coordinate of field center
 * @returns Complete tight end analysis
 * 
 * @example
 * ```typescript
 * const teAnalysis = analyzeTightEnds(players, 26.666);
 * console.log(`${teAnalysis.count} TEs total`);
 * console.log(`${teAnalysis.boxTECount} in the box`);
 * console.log(`${teAnalysis.splitTECount} split out`);
 * ```
 */
export function analyzeTightEnds(
  players: Player[],
  centerX: number
): TightEndAnalysis {
  // Find all tight ends (jerseyNumber === 'TE')
  const tightEnds = players.filter(
    (p) => p.team === 'offense' && p.jerseyNumber === 'TE'
  );

  // Find offensive tackles for proximity calculation
  const leftTackle = players.find(
    (p) => p.team === 'offense' && p.jerseyNumber === 'LT'
  );
  const rightTackle = players.find(
    (p) => p.team === 'offense' && p.jerseyNumber === 'RT'
  );

  // If no tackles found, can't determine box position
  if (!leftTackle || !rightTackle) {
    return {
      count: tightEnds.length,
      positions: [],
      boxTECount: 0,
      splitTECount: tightEnds.length,
    };
  }

  // Analyze each tight end
  const positions: TightEndPosition[] = tightEnds.map((te) => {
    const inBox = isTightEndInBox(te, leftTackle, rightTackle);
    const distanceFromTackle = getDistanceToNearestTackle(te, leftTackle, rightTackle);

    return {
      playerId: te.id,
      side: te.x < centerX ? 'left' : 'right',
      inBox,
      distanceFromTackle,
      x: te.x,
      y: te.y,
    };
  });

  // Count box vs split TEs
  const boxTECount = positions.filter((p) => p.inBox).length;
  const splitTECount = positions.filter((p) => !p.inBox).length;

  return {
    count: tightEnds.length,
    positions,
    boxTECount,
    splitTECount,
  };
}

/**
 * Check if formation has multiple tight ends (2 TE, 3 TE sets).
 * 
 * @param players - All players on field
 * @returns True if 2 or more tight ends present
 */
export function hasMultipleTightEnds(players: Player[]): boolean {
  const teCount = players.filter(
    (p) => p.team === 'offense' && p.jerseyNumber === 'TE'
  ).length;

  return teCount >= 2;
}
