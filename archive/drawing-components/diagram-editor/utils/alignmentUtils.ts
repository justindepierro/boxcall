/**
 * alignmentUtils - Utility functions for aligning and distributing players
 *
 * Provides:
 * - Align selected players (left, center, right, top, middle, bottom)
 * - Distribute players evenly (horizontal, vertical)
 */

import type { Player } from "../types/Player";

/**
 * Align selected players horizontally
 */
export function alignPlayersHorizontal(
  players: Player[],
  mode: "left" | "center" | "right"
): Player[] {
  if (players.length < 2) return players;

  let targetX: number;

  switch (mode) {
    case "left":
      // Align to leftmost player
      targetX = Math.min(...players.map((p) => p.x));
      break;
    case "center":
      // Align to average X
      targetX = players.reduce((sum, p) => sum + p.x, 0) / players.length;
      break;
    case "right":
      // Align to rightmost player
      targetX = Math.max(...players.map((p) => p.x));
      break;
  }

  return players.map((p) => ({ ...p, x: targetX }));
}

/**
 * Align selected players vertically
 */
export function alignPlayersVertical(
  players: Player[],
  mode: "top" | "middle" | "bottom"
): Player[] {
  if (players.length < 2) return players;

  let targetY: number;

  switch (mode) {
    case "top":
      // Align to topmost player (lowest Y value)
      targetY = Math.min(...players.map((p) => p.y));
      break;
    case "middle":
      // Align to average Y
      targetY = players.reduce((sum, p) => sum + p.y, 0) / players.length;
      break;
    case "bottom":
      // Align to bottommost player (highest Y value)
      targetY = Math.max(...players.map((p) => p.y));
      break;
  }

  return players.map((p) => ({ ...p, y: targetY }));
}

/**
 * Distribute players evenly horizontally
 * Spaces players equally between leftmost and rightmost
 */
export function distributePlayersHorizontal(players: Player[]): Player[] {
  if (players.length < 3) return players;

  // Sort by X position
  const sorted = [...players].sort((a, b) => a.x - b.x);

  const leftmost = sorted[0];
  const rightmost = sorted[sorted.length - 1];
  const totalWidth = rightmost.x - leftmost.x;
  const spacing = totalWidth / (sorted.length - 1);

  // Distribute evenly
  return sorted.map((p, index) => ({
    ...p,
    x: leftmost.x + spacing * index,
  }));
}

/**
 * Distribute players evenly vertically
 * Spaces players equally between topmost and bottommost
 */
export function distributePlayersVertical(players: Player[]): Player[] {
  if (players.length < 3) return players;

  // Sort by Y position
  const sorted = [...players].sort((a, b) => a.y - b.y);

  const topmost = sorted[0];
  const bottommost = sorted[sorted.length - 1];
  const totalHeight = bottommost.y - topmost.y;
  const spacing = totalHeight / (sorted.length - 1);

  // Distribute evenly
  return sorted.map((p, index) => ({
    ...p,
    y: topmost.y + spacing * index,
  }));
}

/**
 * Check if three or more players are equally spaced horizontally
 * Returns the spacing value if equal (within threshold), null otherwise
 */
export function detectEqualSpacingHorizontal(
  players: Player[],
  threshold: number = 0.5
): number | null {
  if (players.length < 3) return null;

  // Sort by X position
  const sorted = [...players].sort((a, b) => a.x - b.x);

  // Calculate spacing between consecutive pairs
  const spacings: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    spacings.push(sorted[i].x - sorted[i - 1].x);
  }

  // Check if all spacings are equal (within threshold)
  const avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
  const allEqual = spacings.every((s) => Math.abs(s - avgSpacing) <= threshold);

  return allEqual ? avgSpacing : null;
}

/**
 * Check if three or more players are equally spaced vertically
 * Returns the spacing value if equal (within threshold), null otherwise
 */
export function detectEqualSpacingVertical(
  players: Player[],
  threshold: number = 0.5
): number | null {
  if (players.length < 3) return null;

  // Sort by Y position
  const sorted = [...players].sort((a, b) => a.y - b.y);

  // Calculate spacing between consecutive pairs
  const spacings: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    spacings.push(sorted[i].y - sorted[i - 1].y);
  }

  // Check if all spacings are equal (within threshold)
  const avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
  const allEqual = spacings.every((s) => Math.abs(s - avgSpacing) <= threshold);

  return allEqual ? avgSpacing : null;
}

/**
 * Space players uniformly with a specific distance horizontally
 * Maintains the leftmost player position, spaces others to the right
 */
export function spacePlayersUniformHorizontal(
  players: Player[],
  spacing: number = 1.5 // Default 1.5 yards
): Player[] {
  if (players.length < 2) return players;

  // Sort by X position
  const sorted = [...players].sort((a, b) => a.x - b.x);

  // Start from leftmost player
  const startX = sorted[0].x;

  // Apply uniform spacing
  return sorted.map((p, index) => ({
    ...p,
    x: startX + spacing * index,
  }));
}

/**
 * Space players uniformly with a specific distance vertically
 * Maintains the topmost player position, spaces others downward
 */
export function spacePlayersUniformVertical(
  players: Player[],
  spacing: number = 1.5 // Default 1.5 yards
): Player[] {
  if (players.length < 2) return players;

  // Sort by Y position
  const sorted = [...players].sort((a, b) => a.y - b.y);

  // Start from topmost player
  const startY = sorted[0].y;

  // Apply uniform spacing
  return sorted.map((p, index) => ({
    ...p,
    y: startY + spacing * index,
  }));
}
