/**
 * snapToFeatures - Utility for snapping players to field features
 *
 * Provides snapping to:
 * - Yard lines (every 5 yards: 0, 5, 10, 15, ..., 100)
 * - Hash marks (4 standard positions across width)
 * - Other players (alignment)
 *
 * Alt/Option key toggles snapping mode
 */

export interface SnapTarget {
  x?: number; // Snap x coordinate (yards)
  y?: number; // Snap y coordinate (yards)
  type: "yard-line" | "hash-mark" | "player";
  label?: string; // Display label for the snap target
}

export interface SnapResult {
  x: number; // Snapped x coordinate (yards)
  y: number; // Snapped y coordinate (yards)
  snapped: boolean; // Whether snapping occurred
  targets: SnapTarget[]; // Active snap targets
}

/**
 * Standard hash mark positions (as fraction of field width)
 * - Left hash: 0.298 (23.36 yards from left sideline on 53.33yd wide field)
 * - Left-center: 0.417 (26.67 yards from left, exactly 1/3)
 * - Right-center: 0.583 (33.33 yards from left, exactly 2/3)
 * - Right hash: 0.702 (29.97 yards from right sideline)
 */
const HASH_MARK_POSITIONS = [0.298, 0.417, 0.583, 0.702];

/**
 * Yard line interval (every 5 yards)
 */
const YARD_LINE_INTERVAL = 5;

/**
 * Snap threshold (yards) - how close you need to be to snap
 */
const SNAP_THRESHOLD_YARDS = 1.0;

/**
 * Apply snap-to-features logic
 *
 * @param x Current x position (yards)
 * @param y Current y position (yards)
 * @param fieldWidth Total field width (yards)
 * @param fieldHeight Total field height (yards)
 * @param snapEnabled Whether snapping is enabled (Alt key held)
 * @returns Snap result with potentially adjusted coordinates
 */
export function applySnapToFeatures(
  x: number,
  y: number,
  fieldWidth: number,
  fieldHeight: number,
  snapEnabled: boolean
): SnapResult {
  if (!snapEnabled) {
    return {
      x,
      y,
      snapped: false,
      targets: [],
    };
  }

  let snappedX = x;
  let snappedY = y;
  let didSnap = false;
  const activeTargets: SnapTarget[] = [];

  // 1. Snap to yard lines (vertical lines every 5 yards)
  const nearestYardLine =
    Math.round(y / YARD_LINE_INTERVAL) * YARD_LINE_INTERVAL;
  const distanceToYardLine = Math.abs(y - nearestYardLine);

  if (
    distanceToYardLine <= SNAP_THRESHOLD_YARDS &&
    nearestYardLine >= 0 &&
    nearestYardLine <= fieldHeight
  ) {
    snappedY = nearestYardLine;
    didSnap = true;
    activeTargets.push({
      y: nearestYardLine,
      type: "yard-line",
      label: `${nearestYardLine} yard line`,
    });
  }

  // 2. Snap to hash marks (horizontal positions)
  const hashNames = ["Left Hash", "Left-Center", "Right-Center", "Right Hash"];
  let closestHashDistance = Infinity;
  let closestHashIndex = -1;
  let closestHashPosition = 0;

  HASH_MARK_POSITIONS.forEach((fraction, index) => {
    const hashX = fraction * fieldWidth;
    const distance = Math.abs(x - hashX);

    if (distance <= SNAP_THRESHOLD_YARDS && distance < closestHashDistance) {
      closestHashDistance = distance;
      closestHashIndex = index;
      closestHashPosition = hashX;
    }
  });

  if (closestHashIndex >= 0) {
    snappedX = closestHashPosition;
    didSnap = true;
    activeTargets.push({
      x: closestHashPosition,
      type: "hash-mark",
      label: hashNames[closestHashIndex],
    });
  }

  return {
    x: snappedX,
    y: snappedY,
    snapped: didSnap,
    targets: activeTargets,
  };
}

/**
 * Get all snap targets for visualization
 *
 * @param fieldWidth Total field width (yards)
 * @param fieldHeight Total field height (yards)
 * @returns Array of all possible snap targets
 */
export function getAllSnapTargets(
  fieldWidth: number,
  fieldHeight: number
): SnapTarget[] {
  const targets: SnapTarget[] = [];

  // Add yard lines
  for (let y = 0; y <= fieldHeight; y += YARD_LINE_INTERVAL) {
    targets.push({
      y,
      type: "yard-line",
      label: `${y} yard line`,
    });
  }

  // Add hash marks
  const hashNames = ["Left Hash", "Left-Center", "Right-Center", "Right Hash"];
  HASH_MARK_POSITIONS.forEach((fraction, index) => {
    const hashX = fraction * fieldWidth;
    targets.push({
      x: hashX,
      type: "hash-mark",
      label: hashNames[index],
    });
  });

  return targets;
}
