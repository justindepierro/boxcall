/**
 * Smart Snap Utilities
 *
 * Provides intelligent snapping when dragging formations:
 * 1. X-axis alignment: If players are roughly aligned vertically, snap them to same X with equal spacing
 * 2. Y-axis alignment: If a player is behind the formation (like QB), snap to back row Y position
 */

import type { Player } from "../types/Player";

export interface SmartSnapResult {
  snapped: boolean;
  adjustments: Map<string, { x: number; y: number }>; // Player ID -> adjusted position
  snapType: "x-axis" | "y-axis" | "both" | "none";
}

/**
 * Apply smart snap to a group of players being dragged
 *
 * @param players - Array of players being dragged
 * @param xTolerance - How close X positions must be to trigger X-axis snap (yards)
 * @param yTolerance - How close Y positions must be to trigger Y-axis snap (yards)
 */
export function applySmartSnap(
  players: Player[],
  xTolerance: number = 1.0,
  yTolerance: number = 1.5
): SmartSnapResult {
  if (players.length < 2) {
    return {
      snapped: false,
      adjustments: new Map(),
      snapType: "none",
    };
  }

  const adjustments = new Map<string, { x: number; y: number }>();
  let snapType: "x-axis" | "y-axis" | "both" | "none" = "none";

  // Try X-axis alignment first (horizontal line snap)
  const xSnapResult = tryXAxisSnap(players, xTolerance);
  if (xSnapResult.snapped) {
    xSnapResult.adjustments.forEach((pos, id) => {
      adjustments.set(id, pos);
    });
    snapType = "x-axis";
  }

  // Try Y-axis alignment (QB behind center snap)
  const ySnapResult = tryYAxisSnap(players, yTolerance);
  if (ySnapResult.snapped) {
    ySnapResult.adjustments.forEach((pos, id) => {
      const existing = adjustments.get(id);
      if (existing) {
        // Merge X and Y adjustments
        adjustments.set(id, { x: existing.x, y: pos.y });
        snapType = "both";
      } else {
        adjustments.set(id, pos);
        snapType = snapType === "x-axis" ? "both" : "y-axis";
      }
    });
  }

  return {
    snapped: adjustments.size > 0,
    adjustments,
    snapType,
  };
}

/**
 * Try to snap players to same X coordinate with equal spacing
 * Detects if most players form a horizontal line
 */
function tryXAxisSnap(players: Player[], tolerance: number): SmartSnapResult {
  // Sort players by Y position to find rows
  const sortedByY = [...players].sort((a, b) => a.y - b.y);

  // Find the largest group of players within Y tolerance
  const rows: Player[][] = [];
  let currentRow: Player[] = [sortedByY[0]];

  for (let i = 1; i < sortedByY.length; i++) {
    const player = sortedByY[i];
    const prevPlayer = sortedByY[i - 1];

    if (Math.abs(player.y - prevPlayer.y) <= tolerance) {
      currentRow.push(player);
    } else {
      if (currentRow.length >= 2) {
        rows.push(currentRow);
      }
      currentRow = [player];
    }
  }

  if (currentRow.length >= 2) {
    rows.push(currentRow);
  }

  // Find the largest row (most players on same horizontal line)
  if (rows.length === 0) {
    return {
      snapped: false,
      adjustments: new Map(),
      snapType: "none",
    };
  }

  const largestRow = rows.reduce((max, row) =>
    row.length > max.length ? row : max
  );

  // Only snap if we have at least 3 players in a row
  if (largestRow.length < 3) {
    return {
      snapped: false,
      adjustments: new Map(),
      snapType: "none",
    };
  }

  // Calculate average Y position for the row
  const avgY = largestRow.reduce((sum, p) => sum + p.y, 0) / largestRow.length;

  // Sort row players by X position (left to right)
  const sortedByX = [...largestRow].sort((a, b) => a.x - b.x);

  // Calculate equal spacing
  const leftMost = sortedByX[0].x;
  const rightMost = sortedByX[sortedByX.length - 1].x;
  const totalWidth = rightMost - leftMost;
  const spacing = totalWidth / (sortedByX.length - 1);

  // Create adjustments for each player in the row
  const adjustments = new Map<string, { x: number; y: number }>();
  sortedByX.forEach((player, index) => {
    adjustments.set(player.id, {
      x: leftMost + spacing * index,
      y: avgY,
    });
  });

  return {
    snapped: true,
    adjustments,
    snapType: "x-axis",
  };
}

/**
 * Try to snap single player behind the formation (QB behind center)
 * Looks for one player significantly behind others and aligns their Y
 */
function tryYAxisSnap(players: Player[], tolerance: number): SmartSnapResult {
  // Find players sorted by Y (front to back on field)
  const sortedByY = [...players].sort((a, b) => a.y - b.y);

  // Check if we have a QB pattern: most players in front, 1-2 behind
  if (sortedByY.length < 3) {
    return {
      snapped: false,
      adjustments: new Map(),
      snapType: "none",
    };
  }

  // Find potential "back row" - players significantly behind the front line
  const frontY = sortedByY[0].y;
  const backPlayers: Player[] = [];
  const frontPlayers: Player[] = [];

  sortedByY.forEach((player) => {
    const distanceFromFront = player.y - frontY;
    if (distanceFromFront > tolerance * 2) {
      backPlayers.push(player);
    } else {
      frontPlayers.push(player);
    }
  });

  // Only snap if we have 1-2 back players and 3+ front players (QB/RB pattern)
  if (
    backPlayers.length === 0 ||
    backPlayers.length > 2 ||
    frontPlayers.length < 3
  ) {
    return {
      snapped: false,
      adjustments: new Map(),
      snapType: "none",
    };
  }

  // Calculate average Y of back players
  const avgBackY =
    backPlayers.reduce((sum, p) => sum + p.y, 0) / backPlayers.length;

  // Create adjustments to align back players on same Y
  const adjustments = new Map<string, { x: number; y: number }>();
  backPlayers.forEach((player) => {
    adjustments.set(player.id, {
      x: player.x, // Keep X position
      y: avgBackY, // Snap Y to average
    });
  });

  return {
    snapped: true,
    adjustments,
    snapType: "y-axis",
  };
}
