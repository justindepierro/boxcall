/**
 * Nickel 4-2-5 Defensive Scheme
 *
 * Base defense vs spread offenses:
 * - 4 Defensive Linemen (2 DEs, 2 DTs)
 * - 2 Linebackers
 * - 5 Defensive Backs (2 CBs, 1 NCB, 2 Safeties)
 *
 * Personnel: 4 down linemen, 2 inside linebackers, 5 DBs
 * Best vs: 2x2, 3x1, Empty spread formations
 */

import type {
  Player,
  TeamSide,
} from "../../../components/playbook/diagram-editor/types/Player";

/**
 * Nickel 4-2-5 defensive player position
 */
export interface DefensivePlayerPosition {
  /** X coordinate on field */
  x: number;

  /** Y coordinate on field (LOS-relative) */
  y: number;

  /** Position label (DE, DT, LB, CB, NCB, S) */
  jerseyNumber: string;

  /** Team side (always "defense") */
  team: TeamSide;
}

/**
 * Parameters for creating Nickel 4-2-5 formation
 */
export interface Nickel425Params {
  /** Center X position based on hash alignment */
  centerX: number;

  /** Line of scrimmage Y coordinate */
  losY: number;

  /** Field width (53.333 yards) */
  fieldWidth: number;
}

/**
 * Calculate center X position based on hash alignment
 *
 * @param alignment - Hash alignment (left, middle, right)
 * @param fieldWidth - Width of field in yards (53.333)
 * @returns X coordinate for center of formation
 */
export function getCenterXForAlignment(
  alignment: "left" | "middle" | "right",
  fieldWidth: number
): number {
  const fieldCenter = fieldWidth / 2; // 26.666 yards
  const hashOffset = 6.17; // NFL hash marks are 6.17 yards from center

  switch (alignment) {
    case "left":
      return fieldCenter - hashOffset; // Left hash: ~20.5 yards
    case "right":
      return fieldCenter + hashOffset; // Right hash: ~32.8 yards
    case "middle":
    default:
      return fieldCenter; // Center: 26.666 yards
  }
}

/**
 * Create Nickel 4-2-5 defensive formation
 *
 * Formation details:
 * - DEs: 1 yard above LOS, outside shade of tackles
 * - DTs: 1 yard above LOS, shade away from NCB
 * - LBs: 4 yards above LOS, over guards
 * - CBs: 6 yards above LOS, 1 yard inside outside WRs
 * - NCB: 5 yards above LOS, split between slot and tackle (RB side)
 * - Safeties: 10 yards above LOS, 1 yard inside slot receivers
 *
 * @param params - Formation parameters (centerX, losY, fieldWidth)
 * @returns Array of defensive player positions
 */
export function createNickel425Formation(
  params: Nickel425Params
): DefensivePlayerPosition[] {
  const { centerX, losY, fieldWidth } = params;

  return [
    // DEFENSIVE LINE (4 players) - 1 yard above LOS
    // DEs on outside shade of tackles
    // DTs shade away from NCB (right, since NCB is on left/RB side)
    {
      x: centerX - 3.5, // Outside shade of LT (LT is at centerX - 3)
      y: losY - 1,
      jerseyNumber: "DE",
      team: "defense",
    }, // Left DE
    {
      x: centerX - 1, // Right shade of LG (LG is at centerX - 1.5, shading away from NCB on left)
      y: losY - 1,
      jerseyNumber: "DT",
      team: "defense",
    }, // Left DT
    {
      x: centerX + 2, // Right shade of RG (RG is at centerX + 1.5, shading away from NCB on left)
      y: losY - 1,
      jerseyNumber: "DT",
      team: "defense",
    }, // Right DT
    {
      x: centerX + 3.5, // Outside shade of RT (RT is at centerX + 3)
      y: losY - 1,
      jerseyNumber: "DE",
      team: "defense",
    }, // Right DE

    // LINEBACKERS (2 players) - 4 yards above LOS, aligned over guards
    {
      x: centerX - 1.5, // Over LG
      y: losY - 4,
      jerseyNumber: "LB",
      team: "defense",
    }, // Left LB
    {
      x: centerX + 1.5, // Over RG
      y: losY - 4,
      jerseyNumber: "LB",
      team: "defense",
    }, // Right LB

    // SECONDARY (5 players) - Nickel package
    // Corners (2) - 6 yards above LOS, 1 yard inside of widest receivers
    // For 2x2 middle: outside WRs at 6 and fieldWidth-6, so CBs at 7 and fieldWidth-7
    {
      x: 7, // 1 yard inside left outside WR (WR at 6)
      y: losY - 6,
      jerseyNumber: "CB",
      team: "defense",
    }, // Left Corner
    {
      x: fieldWidth - 7, // 1 yard inside right outside WR (WR at fieldWidth-6)
      y: losY - 6,
      jerseyNumber: "CB",
      team: "defense",
    }, // Right Corner

    // Nickel CB - 5 yards above LOS, split between #2 receiver (slot) and LT
    // Aligns to RB side (left) in 2x2 formation
    // For 2x2 middle: LT at centerX-3, left slot at 12
    // NCB splits: (centerX-3 + 12) / 2
    {
      x: (centerX - 3 + 12) / 2, // Split between LT and left slot (RB side)
      y: losY - 5,
      jerseyNumber: "NCB",
      team: "defense",
    }, // Nickel (slot left, RB side)

    // Safeties (2) - 10 yards above LOS, 1 yard inside #2 receivers (slots)
    // For 2x2 middle: left slot at 12, right slot at fieldWidth-12
    {
      x: 13, // 1 yard inside left slot (slot at 12)
      y: losY - 10,
      jerseyNumber: "S",
      team: "defense",
    }, // Free Safety
    {
      x: fieldWidth - 13, // 1 yard inside right slot (slot at fieldWidth-12)
      y: losY - 10,
      jerseyNumber: "S",
      team: "defense",
    }, // Strong Safety
  ];
}

/**
 * Convert defensive positions to full Player objects with IDs
 *
 * @param positions - Array of defensive player positions
 * @returns Array of Player objects ready to be added to the field
 */
export function convertToPlayers(
  positions: DefensivePlayerPosition[]
): Player[] {
  return positions.map((pos, index) => ({
    ...pos,
    id: `defense-formation-${Date.now()}-${index}`,
  }));
}
