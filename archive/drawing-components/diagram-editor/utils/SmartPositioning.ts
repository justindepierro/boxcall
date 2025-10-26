/**
 * Smart Positioning Engine - Intelligent player placement system
 * 
 * Provides formation-aware positioning logic that considers:
 * - Existing players on field
 * - Formation legality (7 on LOS, eligible receivers)
 * - Professional spacing standards
 * - Position-specific alignment rules
 */

import type { Player } from "../types/Player";
import {
  LOS_Y,
  CENTER_X,
  LEFT_NUMBERS_X,
  RIGHT_NUMBERS_X,
  SLOT_LEFT_X,
  SLOT_RIGHT_X,
  SLOT_OFF_LOS_Y,
  OL_POSITIONS,
  QB_SHOTGUN_Y,
  QB_UNDER_CENTER_Y,
  RB_OFFSET_Y,
  RB_I_FORM_Y,
  FB_DEPTH_Y,
  TE_INLINE_LEFT_X,
  TE_INLINE_RIGHT_X,
  isOnLOS,
  MIN_PLAYERS_ON_LOS,
} from "./FieldConstants";

export interface PositionSuggestion {
  x: number;
  y: number;
  reasoning: string; // Why this position was chosen
  isLegal: boolean; // Does this maintain formation legality?
}

/**
 * Get optimal position for a Wide Receiver
 * Considers existing WRs and auto-spaces them intelligently
 */
export function getOptimalWRPosition(
  existingPlayers: Player[]
): PositionSuggestion {
  const existingWRs = existingPlayers.filter((p) => p.role === "WR");
  const wrCount = existingWRs.length;

  // Count players on LOS to maintain legality
  const playersOnLOS = existingPlayers.filter((p) => isOnLOS(p.y)).length;
  const needMoreOnLOS = playersOnLOS < MIN_PLAYERS_ON_LOS;

  // WR position priority: X (left), Y (slot left), Z (right), H (slot right)
  const wrPositions: PositionSuggestion[] = [
    {
      x: LEFT_NUMBERS_X,
      y: LOS_Y,
      reasoning: "X receiver - wide left on LOS",
      isLegal: true,
    },
    {
      x: SLOT_LEFT_X,
      y: needMoreOnLOS ? LOS_Y : SLOT_OFF_LOS_Y,
      reasoning: needMoreOnLOS
        ? "Y receiver - slot left ON LOS (need 7 on line)"
        : "Y receiver - slot left OFF LOS (1yd back for legality)",
      isLegal: true,
    },
    {
      x: RIGHT_NUMBERS_X,
      y: LOS_Y,
      reasoning: "Z receiver - wide right on LOS",
      isLegal: true,
    },
    {
      x: SLOT_RIGHT_X,
      y: needMoreOnLOS ? LOS_Y : SLOT_OFF_LOS_Y,
      reasoning: needMoreOnLOS
        ? "H receiver - slot right ON LOS (need 7 on line)"
        : "H receiver - slot right OFF LOS (1yd back for legality)",
      isLegal: true,
    },
  ];

  // Check if position already occupied (within 2 yards)
  const isOccupied = (pos: PositionSuggestion): boolean => {
    return existingWRs.some(
      (wr) => Math.abs(wr.x - pos.x) < 2 && Math.abs(wr.y - pos.y) < 2
    );
  };

  // Find first available position
  const availablePosition = wrPositions.find((pos) => !isOccupied(pos));

  // If all standard positions taken, spread wider
  if (!availablePosition) {
    return {
      x: wrCount % 2 === 0 ? LEFT_NUMBERS_X - 5 : RIGHT_NUMBERS_X + 5,
      y: SLOT_OFF_LOS_Y,
      reasoning: `WR${wrCount + 1} - extra receiver spread wide`,
      isLegal: playersOnLOS >= MIN_PLAYERS_ON_LOS,
    };
  }

  return availablePosition;
}

/**
 * Get optimal position for a Running Back
 * Considers QB position and formation style (I-form, offset, pistol)
 */
export function getOptimalRBPosition(
  existingPlayers: Player[]
): PositionSuggestion {
  const existingRBs = existingPlayers.filter((p) => p.role === "RB");
  const rbCount = existingRBs.length;
  const qb = existingPlayers.find((p) => p.role === "QB");

  // If no QB, default to offset position
  if (!qb) {
    return {
      x: CENTER_X + 4,
      y: RB_OFFSET_Y,
      reasoning: "RB offset right (no QB on field yet)",
      isLegal: true,
    };
  }

  // Determine formation style based on QB depth
  const qbDepth = qb.y - LOS_Y;
  const isUnderCenter = qbDepth < 2; // Within 2 yards of LOS
  const isPistol = qbDepth >= 3 && qbDepth <= 5;
  const isShotgun = qbDepth > 5;

  // Under center: I-formation (RB directly behind QB)
  if (isUnderCenter && rbCount === 0) {
    return {
      x: qb.x,
      y: RB_I_FORM_Y,
      reasoning: "I-formation - RB directly behind QB (7yds deep)",
      isLegal: true,
    };
  }

  // Pistol: RB behind QB at 3 yards
  if (isPistol && rbCount === 0) {
    return {
      x: qb.x,
      y: qb.y - 1, // 1 yard in front of QB
      reasoning: "Pistol formation - RB in front of QB",
      isLegal: true,
    };
  }

  // Shotgun: Offset positions
  if (isShotgun) {
    const rbPositions: PositionSuggestion[] = [
      {
        x: qb.x + 4,
        y: RB_OFFSET_Y,
        reasoning: "Shotgun - RB offset right",
        isLegal: true,
      },
      {
        x: qb.x - 4,
        y: RB_OFFSET_Y,
        reasoning: "Shotgun - RB offset left (2nd RB)",
        isLegal: true,
      },
    ];

    const isOccupied = (pos: PositionSuggestion): boolean => {
      return existingRBs.some(
        (rb) => Math.abs(rb.x - pos.x) < 2 && Math.abs(rb.y - pos.y) < 2
      );
    };

    const availablePosition = rbPositions.find((pos) => !isOccupied(pos));
    if (availablePosition) return availablePosition;
  }

  // Default: offset right
  return {
    x: CENTER_X + 4,
    y: RB_OFFSET_Y,
    reasoning: `RB${rbCount + 1} offset position`,
    isLegal: true,
  };
}

/**
 * Get optimal position for a Quarterback
 * Prefers shotgun depth unless formation suggests under center
 */
export function getOptimalQBPosition(
  existingPlayers: Player[]
): PositionSuggestion {
  const existingQBs = existingPlayers.filter((p) => p.role === "QB");
  if (existingQBs.length > 0) {
    // Already have a QB
    return {
      x: CENTER_X - 5,
      y: QB_SHOTGUN_Y,
      reasoning: "2nd QB (wildcat/trick play position)",
      isLegal: true,
    };
  }

  // Check for TEs or FBs (suggests power/I-formation = under center)
  const hasTightEnd = existingPlayers.some((p) => p.role === "TE");
  const hasFullback = existingPlayers.some((p) => p.role === "FB");

  if ((hasTightEnd && hasFullback) || hasFullback) {
    return {
      x: CENTER_X,
      y: QB_UNDER_CENTER_Y,
      reasoning: "Under center - power formation (TE/FB on field)",
      isLegal: true,
    };
  }

  // Default: shotgun (modern spread offense)
  return {
    x: CENTER_X,
    y: QB_SHOTGUN_Y,
    reasoning: "Shotgun depth - modern spread offense",
    isLegal: true,
  };
}

/**
 * Get optimal position for a Tight End
 * Prefers inline with OL, can flex to slot
 */
export function getOptimalTEPosition(
  existingPlayers: Player[]
): PositionSuggestion {
  const existingTEs = existingPlayers.filter((p) => p.role === "TE");
  const teCount = existingTEs.length;

  // Count players on LOS
  const playersOnLOS = existingPlayers.filter((p) => isOnLOS(p.y)).length;
  const needMoreOnLOS = playersOnLOS < MIN_PLAYERS_ON_LOS;

  // TE position priority: inline left, inline right, slot left, slot right
  const tePositions: PositionSuggestion[] = [
    {
      x: TE_INLINE_LEFT_X,
      y: LOS_Y,
      reasoning: "TE inline left - next to LT",
      isLegal: true,
    },
    {
      x: TE_INLINE_RIGHT_X,
      y: LOS_Y,
      reasoning: "TE inline right - next to RT",
      isLegal: true,
    },
    {
      x: SLOT_LEFT_X,
      y: needMoreOnLOS ? LOS_Y : SLOT_OFF_LOS_Y,
      reasoning: needMoreOnLOS
        ? "TE slot left ON LOS"
        : "TE slot left OFF LOS (flex TE)",
      isLegal: true,
    },
    {
      x: SLOT_RIGHT_X,
      y: needMoreOnLOS ? LOS_Y : SLOT_OFF_LOS_Y,
      reasoning: needMoreOnLOS
        ? "TE slot right ON LOS"
        : "TE slot right OFF LOS (flex TE)",
      isLegal: true,
    },
  ];

  const isOccupied = (pos: PositionSuggestion): boolean => {
    return existingTEs.some(
      (te) => Math.abs(te.x - pos.x) < 2 && Math.abs(te.y - pos.y) < 2
    );
  };

  const availablePosition = tePositions.find((pos) => !isOccupied(pos));

  if (!availablePosition) {
    return {
      x: teCount % 2 === 0 ? TE_INLINE_LEFT_X - 3 : TE_INLINE_RIGHT_X + 3,
      y: LOS_Y,
      reasoning: `TE${teCount + 1} - extra TE spread wider`,
      isLegal: playersOnLOS >= MIN_PLAYERS_ON_LOS,
    };
  }

  return availablePosition;
}

/**
 * Get optimal position for a Fullback
 * Typically 4 yards behind LOS, behind QB
 */
export function getOptimalFBPosition(
  existingPlayers: Player[]
): PositionSuggestion {
  const qb = existingPlayers.find((p) => p.role === "QB");
  const centerX = qb?.x || CENTER_X;

  return {
    x: centerX,
    y: FB_DEPTH_Y,
    reasoning: "Fullback - 4 yards behind LOS, lead blocker position",
    isLegal: true,
  };
}

/**
 * Get optimal position for Offensive Line positions
 */
export function getOptimalOLPosition(
  role: "C" | "LG" | "RG" | "LT" | "RT"
): PositionSuggestion {
  return {
    x: OL_POSITIONS[role],
    y: LOS_Y,
    reasoning: `${role} - standard offensive line position`,
    isLegal: true,
  };
}

/**
 * Get optimal position for any player based on role
 * Main entry point for smart positioning
 */
export function getOptimalPosition(
  role: string,
  existingPlayers: Player[]
): PositionSuggestion {
  switch (role) {
    case "QB":
      return getOptimalQBPosition(existingPlayers);
    case "RB":
      return getOptimalRBPosition(existingPlayers);
    case "FB":
      return getOptimalFBPosition(existingPlayers);
    case "WR":
      return getOptimalWRPosition(existingPlayers);
    case "TE":
      return getOptimalTEPosition(existingPlayers);
    case "C":
    case "LG":
    case "RG":
    case "LT":
    case "RT":
      return getOptimalOLPosition(role as "C" | "LG" | "RG" | "LT" | "RT");
    default:
      // Unknown role, default to backfield
      return {
        x: CENTER_X,
        y: RB_OFFSET_Y,
        reasoning: `Unknown position ${role} - default backfield position`,
        isLegal: true,
      };
  }
}

/**
 * Check if formation is legal (7 on LOS, max 11 players)
 */
export interface FormationLegality {
  isLegal: boolean;
  playersOnLOS: number;
  totalPlayers: number;
  issues: string[];
  warnings: string[];
}

export function checkFormationLegality(
  players: Player[]
): FormationLegality {
  const playersOnLOS = players.filter((p) => isOnLOS(p.y)).length;
  const totalPlayers = players.length;

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check minimum on LOS
  if (playersOnLOS < MIN_PLAYERS_ON_LOS) {
    issues.push(`Only ${playersOnLOS} players on LOS (need 7 minimum)`);
  }

  // Check maximum players
  if (totalPlayers > 11) {
    issues.push(`${totalPlayers} players on field (max 11 allowed)`);
  }

  // Check if exactly 7 on LOS (more is legal but unusual)
  if (playersOnLOS > 7) {
    warnings.push(`${playersOnLOS} players on LOS (7 is standard, more is legal but unusual)`);
  }

  // Check eligible receivers (should have at least 5)
  const eligibleReceivers = players.filter(
    (p) => p.role && ["QB", "RB", "FB", "WR", "TE"].includes(p.role)
  );
  if (eligibleReceivers.length < 5) {
    warnings.push(`Only ${eligibleReceivers.length} eligible receivers (5 is standard)`);
  }

  return {
    isLegal: issues.length === 0,
    playersOnLOS,
    totalPlayers,
    issues,
    warnings,
  };
}
