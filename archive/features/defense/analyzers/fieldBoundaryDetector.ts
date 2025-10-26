/**
 * Field Boundary Detector
 *
 * Calculates field (wide) side vs boundary (short) side based on hash alignment.
 * This information is critical for defensive adjustments and coverage calls.
 *
 * Standard NCAA field dimensions:
 * - Total width: 53.333 yards (160 feet)
 * - Center: 26.666 yards
 * - Left hash: ~20.5 yards (center - 6.17)
 * - Right hash: ~32.8 yards (center + 6.17)
 * - Left numbers: ~8 yards
 * - Right numbers: ~45.3 yards
 */

import type { HashAlignment, FieldBoundaryInfo } from "../types";

/**
 * Standard field width in yards
 */
const FIELD_WIDTH_YARDS = 53.333;

/**
 * Field center position
 */
const FIELD_CENTER_X = FIELD_WIDTH_YARDS / 2; // 26.666 yards

/**
 * Left sideline X coordinate
 */
const LEFT_SIDELINE_X = 0;

/**
 * Right sideline X coordinate
 */
const RIGHT_SIDELINE_X = FIELD_WIDTH_YARDS;

/**
 * Hash mark offset from center (NCAA standard)
 */
const HASH_OFFSET = 6.17;

/**
 * Minimum width difference to be considered field vs boundary (yards)
 * Below this threshold, sides are considered "balanced"
 */
const BALANCE_THRESHOLD = 3;

/**
 * Get center X position for a given hash alignment.
 *
 * @param hash - Hash alignment (left, middle, right)
 * @returns X coordinate of center based on hash
 */
export function getCenterXForHash(hash: HashAlignment): number {
  switch (hash) {
    case "left":
      return FIELD_CENTER_X - HASH_OFFSET; // ~20.5 yards
    case "middle":
      return FIELD_CENTER_X; // 26.666 yards
    case "right":
      return FIELD_CENTER_X + HASH_OFFSET; // ~32.8 yards
  }
}

/**
 * Detect field (wide side) and boundary (short side) based on hash alignment.
 *
 * Field side = wider side of field relative to ball position
 * Boundary side = shorter side (closer to sideline)
 *
 * @param hash - Current hash alignment
 * @param fieldWidth - Optional custom field width (defaults to NCAA 53.333 yards)
 * @returns Complete field boundary information
 *
 * @example
 * ```typescript
 * const boundaryInfo = detectFieldBoundary('left');
 * console.log(boundaryInfo.fieldSide); // 'right'
 * console.log(boundaryInfo.fieldWidth); // ~32.8 yards
 * console.log(boundaryInfo.boundaryWidth); // ~20.5 yards
 * ```
 */
export function detectFieldBoundary(
  hash: HashAlignment,
  _fieldWidth: number = FIELD_WIDTH_YARDS
): FieldBoundaryInfo {
  const centerX = getCenterXForHash(hash);

  // Calculate distance to each sideline
  const distanceToLeftSideline = centerX - LEFT_SIDELINE_X;
  const distanceToRightSideline = RIGHT_SIDELINE_X - centerX;

  // Determine which side is field (wider) vs boundary (shorter)
  const widthDifference = Math.abs(
    distanceToLeftSideline - distanceToRightSideline
  );

  let fieldSide: "left" | "right" | "balanced";
  let boundarySide: "left" | "right" | "balanced";

  if (widthDifference < BALANCE_THRESHOLD) {
    // Hash is near middle, sides are balanced
    fieldSide = "balanced";
    boundarySide = "balanced";
  } else if (distanceToRightSideline > distanceToLeftSideline) {
    // Right side is wider (field)
    fieldSide = "right";
    boundarySide = "left";
  } else {
    // Left side is wider (field)
    fieldSide = "left";
    boundarySide = "right";
  }

  return {
    hash,
    fieldSide,
    boundarySide,
    fieldWidth: Math.max(distanceToLeftSideline, distanceToRightSideline),
    boundaryWidth: Math.min(distanceToLeftSideline, distanceToRightSideline),
    centerX,
  };
}

/**
 * Determine if hash is on left side of field.
 *
 * @param hash - Hash alignment
 * @returns True if left hash
 */
export function isLeftHash(hash: HashAlignment): boolean {
  return hash === "left";
}

/**
 * Determine if hash is on right side of field.
 *
 * @param hash - Hash alignment
 * @returns True if right hash
 */
export function isRightHash(hash: HashAlignment): boolean {
  return hash === "right";
}

/**
 * Determine if hash is in middle (balanced field).
 *
 * @param hash - Hash alignment
 * @returns True if middle hash
 */
export function isMiddleHash(hash: HashAlignment): boolean {
  return hash === "middle";
}

/**
 * Get opposite hash alignment.
 *
 * @param hash - Current hash
 * @returns Opposite hash (left ↔ right, middle stays middle)
 */
export function getOppositeHash(hash: HashAlignment): HashAlignment {
  switch (hash) {
    case "left":
      return "right";
    case "right":
      return "left";
    case "middle":
      return "middle";
  }
}

/**
 * Calculate field position as percentage (0-100).
 *
 * Useful for determining how "wide" a formation is relative to sideline.
 * - 0% = left sideline
 * - 50% = middle
 * - 100% = right sideline
 *
 * @param hash - Hash alignment
 * @returns Percentage from left sideline (0-100)
 */
export function getFieldPositionPercentage(hash: HashAlignment): number {
  const centerX = getCenterXForHash(hash);
  return (centerX / FIELD_WIDTH_YARDS) * 100;
}
