/**
 * Formation Utilities
 * Helper functions for formation positioning and calculations
 */

import type {
  Alignment,
  ReceiverPositions,
  ReceiverPositions3x1,
} from "../types";

/**
 * Calculate center X position based on alignment (hash marks)
 */
export function getCenterXForAlignment(
  alignment: Alignment,
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
 * Calculate receiver positions based on alignment and tackle positions
 * For 2x2 formations (2 receivers on each side)
 */
export function getReceiverPositions(
  alignment: Alignment,
  fieldWidth: number,
  leftTackleX: number,
  rightTackleX: number
): ReceiverPositions {
  const leftSideline = 0;
  const rightSideline = fieldWidth;
  const leftNumbers = fieldWidth * 0.15; // ~8 yards from left
  const rightNumbers = fieldWidth * 0.85; // ~45.3 yards from left

  if (alignment === "middle") {
    // Balanced - use current positions
    return {
      leftOutside: 6,
      leftSlot: 12,
      rightSlot: fieldWidth - 12,
      rightOutside: fieldWidth - 6,
    };
  } else if (alignment === "left") {
    // On left hash - right side is wide, left side is boundary
    return {
      // Boundary side (left) - tighter splits
      leftOutside: (leftSideline + leftNumbers) / 2, // Split sideline and numbers (~4 yards)
      leftSlot: (leftTackleX + (leftSideline + leftNumbers) / 2) / 2, // Split between LT and outside WR

      // Wide side (right) - wider splits
      rightOutside: rightNumbers, // Top of numbers (~45.3 yards)
      rightSlot: (rightTackleX + rightNumbers) / 2, // Split between RT and top of numbers
    };
  } else {
    // On right hash - left side is wide, right side is boundary
    return {
      // Wide side (left) - wider splits
      leftOutside: leftNumbers, // Top of numbers (~8 yards)
      leftSlot: (leftTackleX + leftNumbers) / 2, // Split between LT and top of numbers

      // Boundary side (right) - tighter splits
      rightSlot: (rightTackleX + (rightSideline + rightNumbers) / 2) / 2, // Split between RT and outside WR
      rightOutside: (rightSideline + rightNumbers) / 2, // Split sideline and numbers (~49 yards)
    };
  }
}

/**
 * Calculate 3x1 receiver positions based on alignment and whether 3 is to field or boundary
 * For trips formations (3 receivers on one side, 1 on the other)
 */
export function get3x1ReceiverPositions(
  alignment: Alignment,
  fieldWidth: number,
  leftTackleX: number,
  rightTackleX: number,
  threeToLeft: boolean // true if 3 receivers are on left, false if on right
): ReceiverPositions3x1 {
  const leftNumbers = fieldWidth * 0.15; // ~8 yards from left
  const rightNumbers = fieldWidth * 0.85; // ~45.3 yards from left
  const leftSidelineHash = 1; // 1 yard from left sideline
  const rightSidelineHash = fieldWidth - 1; // 1 yard from right sideline
  const rightHash = fieldWidth / 2 + 6.17; // ~32.8 yards

  if (alignment === "middle") {
    // Middle - balanced splits
    if (threeToLeft) {
      // 3 left, 1 right
      const spacing = (leftNumbers - leftTackleX) / 3;
      return {
        left1: leftNumbers, // Outside
        left2: leftNumbers - spacing, // Slot
        left3: leftNumbers - spacing * 2, // Inside slot
        single: fieldWidth - 6, // Single on right
      };
    } else {
      // 3 right, 1 left
      const spacing = (rightNumbers - rightTackleX) / 3;
      return {
        single: 6, // Single on left
        right3: rightTackleX + spacing, // Inside slot
        right2: rightTackleX + spacing * 2, // Slot
        right1: rightNumbers, // Outside
      };
    }
  } else if (alignment === "left") {
    // Left hash - right is wide side, left is boundary
    if (threeToLeft) {
      // 3 to BOUNDARY (left/short side)
      const outsideX = leftSidelineHash + 1; // 1 yard outside sideline hash = ~2 yards
      const spacing = (outsideX - leftTackleX) / 3;
      return {
        left1: outsideX, // Widest - 1 yard outside sideline hash
        left2: leftTackleX + spacing * 2, // Evenly spaced
        left3: leftTackleX + spacing, // Inside, evenly spaced
        single: rightNumbers, // Single to field: at the numbers (wider)
      };
    } else {
      // 3 to FIELD (right/wide side) - This is Trips Right
      const spacing = (rightNumbers - rightTackleX) / 3;
      return {
        single: leftNumbers, // Single to boundary (LEFT): at the numbers (~8 yards)
        right3: rightTackleX + spacing, // Inside slot, evenly spaced
        right2: rightTackleX + spacing * 2, // Slot, evenly spaced
        right1: rightNumbers, // Widest - top of numbers
      };
    }
  } else {
    // Right hash - left is wide side, right is boundary
    if (threeToLeft) {
      // 3 to FIELD (left/wide side)
      const spacing = (leftNumbers - leftTackleX) / 3;
      return {
        left1: leftNumbers, // Widest - top of numbers
        left2: leftTackleX + spacing * 2, // Slot, evenly spaced
        left3: leftTackleX + spacing, // Inside slot, evenly spaced
        single: rightHash - 3, // Single to boundary: 3 yards inside from numbers (between numbers and hash)
      };
    } else {
      // 3 to BOUNDARY (right/short side)
      const outsideX = rightSidelineHash - 1; // 1 yard outside sideline hash = ~52 yards
      const spacing = (outsideX - rightTackleX) / 3;
      return {
        single: leftNumbers, // Single to field: bottom of numbers
        right3: rightTackleX + spacing, // Inside, evenly spaced
        right2: rightTackleX + spacing * 2, // Evenly spaced
        right1: outsideX, // Widest - 1 yard outside sideline hash
      };
    }
  }
}
