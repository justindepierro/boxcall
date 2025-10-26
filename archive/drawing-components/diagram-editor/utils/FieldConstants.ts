/**
 * Field Constants - Single source of truth for all field dimensions and positioning
 * 
 * Centralize magic numbers to prevent duplication and conflicts.
 * Based on standard American football field dimensions.
 */

// ============================================================================
// FIELD POSITION TYPE
// ============================================================================

/**
 * Field position coordinates (x, y) in yards
 * Updated for magnetic grid system
 */
export interface FieldPosition {
  x: number; // Horizontal position (0 = left sideline, 53.33 = right sideline)
  y: number; // Vertical position (0 = back of end zone, 50 = midfield, 100 = opposite end zone)
}

// ============================================================================
// FIELD DIMENSIONS (in yards)
// ============================================================================
export const FIELD_WIDTH = 53.33; // 160 feet = 53.33 yards
export const FIELD_HEIGHT = 100; // 100 yards (excluding end zones)
export const END_ZONE_DEPTH = 10; // yards

// ============================================================================
// LINE OF SCRIMMAGE
// ============================================================================
export const LOS_Y = 20; // 40-yard line (attacking upward)

// ============================================================================
// HASH MARKS (horizontal positioning)
// ============================================================================
// Hash marks divide field into thirds (NFL/College rules differ slightly)
export const LEFT_HASH_X = 17.5; // ~18.5 feet from left sideline
export const CENTER_X = 26.67; // Middle of field
export const RIGHT_HASH_X = 35.83; // ~18.5 feet from right sideline

// ============================================================================
// SIDELINE POSITIONS
// ============================================================================
export const LEFT_SIDELINE_X = 5; // Near left boundary
export const RIGHT_SIDELINE_X = 48; // Near right boundary

// ============================================================================
// NUMBERS (WR alignment points)
// ============================================================================
export const LEFT_NUMBERS_X = 10; // Where "X" receiver typically lines up
export const RIGHT_NUMBERS_X = 43; // Where "Z" receiver typically lines up

// ============================================================================
// OFFENSIVE LINE SPACING
// ============================================================================
export const OL_SPACING = 2.67; // ~3 yards between O-linemen
export const OL_POSITIONS = {
  LT: CENTER_X - OL_SPACING * 2,  // 21.33
  LG: CENTER_X - OL_SPACING,      // 24
  C: CENTER_X,                     // 26.67
  RG: CENTER_X + OL_SPACING,      // 29.33
  RT: CENTER_X + OL_SPACING * 2,  // 32
} as const;

// ============================================================================
// QUARTERBACK DEPTHS (behind LOS)
// ============================================================================
export const QB_UNDER_CENTER_Y = LOS_Y + 1; // 1 yard behind LOS
export const QB_PISTOL_Y = LOS_Y + 4;       // 4 yards behind LOS
export const QB_SHOTGUN_Y = LOS_Y + 5;      // 5 yards behind LOS
export const QB_DEEP_SHOTGUN_Y = LOS_Y + 7; // 7 yards behind LOS

// ============================================================================
// RUNNING BACK DEPTHS
// ============================================================================
export const RB_I_FORM_Y = LOS_Y + 7;       // 7 yards behind LOS (I-formation)
export const RB_OFFSET_Y = LOS_Y + 6;       // 6 yards behind LOS (offset)
export const RB_PISTOL_Y = LOS_Y + 3;       // 3 yards behind LOS (pistol)
export const FB_DEPTH_Y = LOS_Y + 4;        // 4 yards behind LOS (fullback)

// ============================================================================
// RECEIVER SPLITS (WR spacing)
// ============================================================================
export const WR_TIGHT_SPLIT = 5;  // 5 yards from OL (trips, bunch)
export const WR_NORMAL_SPLIT = 10; // 10-12 yards from OL (standard)
export const WR_WIDE_SPLIT = 15;   // 15+ yards from OL (wide splits)

// ============================================================================
// SLOT POSITIONS (off LOS)
// ============================================================================
export const SLOT_LEFT_X = 18;  // Inside slot on left
export const SLOT_RIGHT_X = 35; // Inside slot on right
export const SLOT_OFF_LOS_Y = LOS_Y + 1; // 1 yard behind LOS

// ============================================================================
// TIGHT END POSITIONS
// ============================================================================
export const TE_INLINE_LEFT_X = OL_POSITIONS.LT - 2; // ~19
export const TE_INLINE_RIGHT_X = OL_POSITIONS.RT + 2; // ~34
export const TE_WING_OFFSET = 3; // 3 yards outside OL
export const TE_SLOT_Y = SLOT_OFF_LOS_Y; // Can line up off LOS in slot

// ============================================================================
// FORMATION LEGALITY RULES (NFL)
// ============================================================================
export const MIN_PLAYERS_ON_LOS = 7; // Minimum 7 players on line of scrimmage
export const MAX_OFFENSE_PLAYERS = 11; // Maximum 11 offensive players
export const MIN_ELIGIBLE_RECEIVERS = 5; // At least 5 eligible receivers

// ============================================================================
// SNAP-TO THRESHOLDS (for drag snapping)
// ============================================================================
export const SNAP_THRESHOLD_YARDS = 1.5; // Snap if within 1.5 yards
export const SNAP_VISUAL_GUIDE_DISTANCE = 3; // Show guide if within 3 yards

// ============================================================================
// DEFENSIVE ALIGNMENT (for future use)
// ============================================================================
export const DEFENSIVE_LOS_Y = LOS_Y - 1; // 1 yard in front of offensive LOS
export const DB_DEPTH_Y = LOS_Y - 8; // ~8 yards off LOS (coverage depth)
export const SAFETY_DEPTH_Y = LOS_Y - 12; // ~12 yards off LOS

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if Y-coordinate is on line of scrimmage
 */
export function isOnLOS(y: number): boolean {
  return Math.abs(y - LOS_Y) < 0.5; // Within 0.5 yards = on LOS
}

/**
 * Check if Y-coordinate is in backfield (behind LOS)
 */
export function isInBackfield(y: number): boolean {
  return y > LOS_Y + 0.5; // More than 0.5 yards behind = backfield
}

/**
 * Check if position is eligible receiver (not on interior of line)
 */
export function isEligibleReceiver(x: number, y: number, role?: string): boolean {
  // QBs, RBs, WRs, TEs are always eligible
  if (["QB", "RB", "FB", "WR", "TE"].includes(role || "")) {
    return true;
  }

  // O-line positions are ineligible
  if (["C", "LG", "RG", "LT", "RT"].includes(role || "")) {
    return false;
  }

  // If on LOS, must be on end of line (outside OL) to be eligible
  if (isOnLOS(y)) {
    return x < OL_POSITIONS.LT || x > OL_POSITIONS.RT;
  }

  // If in backfield, eligible
  return isInBackfield(y);
}

/**
 * Get nearest hash mark
 */
export function getNearestHash(x: number): number {
  const distances = [
    { x: LEFT_HASH_X, distance: Math.abs(x - LEFT_HASH_X) },
    { x: CENTER_X, distance: Math.abs(x - CENTER_X) },
    { x: RIGHT_HASH_X, distance: Math.abs(x - RIGHT_HASH_X) },
  ];

  return distances.sort((a, b) => a.distance - b.distance)[0].x;
}
