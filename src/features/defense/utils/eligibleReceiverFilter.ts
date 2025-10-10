/**
 * Eligible Receiver Filter Utility
 * 
 * Identifies eligible receivers by excluding offensive linemen and quarterback.
 * Per football rules, eligible receivers include: WR, TE, RB, FB, H-Back, and Wildcat QB.
 */

import type { Player } from '@components/playbook/diagram-editor/types/Player';

/**
 * Offensive line position designations (ineligible)
 */
const INELIGIBLE_POSITIONS = [
  'LT',  // Left Tackle
  'LG',  // Left Guard
  'C',   // Center
  'RG',  // Right Guard
  'RT',  // Right Tackle
  'QB',  // Quarterback (standard)
] as const;

/**
 * Get all eligible receivers from offensive players.
 * 
 * Eligible receivers are all offensive players EXCEPT:
 * - Offensive line (LT, LG, C, RG, RT)
 * - Quarterback (unless Wildcat formation)
 * 
 * @param players - Array of all players
 * @returns Array of eligible offensive receivers
 * 
 * @example
 * ```typescript
 * const eligibleReceivers = getEligibleReceivers(allPlayers);
 * console.log(`${eligibleReceivers.length} eligible receivers`);
 * ```
 */
export function getEligibleReceivers(players: Player[]): Player[] {
  return players.filter((player) => {
    // Must be on offense
    if (player.team !== 'offense') {
      return false;
    }

    // Exclude center position (squares are always center/OL)
    if (player.position === 'center') {
      return false;
    }

    // Exclude offensive line and QB by jersey number
    if (INELIGIBLE_POSITIONS.includes(player.jerseyNumber as typeof INELIGIBLE_POSITIONS[number])) {
      return false;
    }

    // All other offensive players are eligible
    return true;
  });
}

/**
 * Count eligible receivers on left side of center.
 * 
 * @param players - Array of all players
 * @param centerX - X coordinate of field center
 * @returns Number of eligible receivers left of center
 */
export function countReceiversLeft(players: Player[], centerX: number): number {
  const eligible = getEligibleReceivers(players);
  return eligible.filter((p) => p.x < centerX).length;
}

/**
 * Count eligible receivers on right side of center.
 * 
 * @param players - Array of all players
 * @param centerX - X coordinate of field center
 * @returns Number of eligible receivers right of center
 */
export function countReceiversRight(players: Player[], centerX: number): number {
  const eligible = getEligibleReceivers(players);
  return eligible.filter((p) => p.x >= centerX).length;
}

/**
 * Check if a player is an eligible receiver.
 * 
 * @param player - Player to check
 * @returns True if player is eligible receiver
 */
export function isEligibleReceiver(player: Player): boolean {
  return (
    player.team === 'offense' &&
    player.position !== 'center' &&
    !INELIGIBLE_POSITIONS.includes(player.jerseyNumber as typeof INELIGIBLE_POSITIONS[number])
  );
}

/**
 * Get "wide" receivers (WR and TE only, excludes RBs).
 * 
 * This is used for formation classification (2x2, 3x1, etc.)
 * because RBs are in the backfield, not "wide".
 * 
 * @param players - Array of all players
 * @returns Array of WR and TE players only
 */
export function getWideReceivers(players: Player[]): Player[] {
  return players.filter((player) => {
    if (player.team !== 'offense') {
      return false;
    }

    // Include only WR and TE
    return player.jerseyNumber === 'WR' || player.jerseyNumber === 'TE';
  });
}

/**
 * Count wide receivers (WR/TE) on left side of center.
 * 
 * @param players - Array of all players
 * @param centerX - X coordinate of field center
 * @returns Number of WR/TE left of center
 */
export function countWideReceiversLeft(players: Player[], centerX: number): number {
  const wideReceivers = getWideReceivers(players);
  return wideReceivers.filter((p) => p.x < centerX).length;
}

/**
 * Count wide receivers (WR/TE) on right side of center.
 * 
 * @param players - Array of all players
 * @param centerX - X coordinate of field center
 * @returns Number of WR/TE right of center
 */
export function countWideReceiversRight(players: Player[], centerX: number): number {
  const wideReceivers = getWideReceivers(players);
  return wideReceivers.filter((p) => p.x >= centerX).length;
}
