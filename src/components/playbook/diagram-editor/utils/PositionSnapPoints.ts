/**
 * Position Snap Points - Intelligent snap-to-grid for player dragging
 * 
 * Provides visual guides and snapping behavior when coaches drag players.
 * Snaps to common alignment positions (hash marks, numbers, sidelines, QB depths).
 */

import {
  LOS_Y,
  LEFT_HASH_X,
  CENTER_X,
  RIGHT_HASH_X,
  LEFT_NUMBERS_X,
  RIGHT_NUMBERS_X,
  LEFT_SIDELINE_X,
  RIGHT_SIDELINE_X,
  SLOT_LEFT_X,
  SLOT_RIGHT_X,
  QB_UNDER_CENTER_Y,
  QB_PISTOL_Y,
  QB_SHOTGUN_Y,
  QB_DEEP_SHOTGUN_Y,
  RB_PISTOL_Y,
  RB_OFFSET_Y,
  RB_I_FORM_Y,
  OL_POSITIONS,
  SNAP_THRESHOLD_YARDS,
  SNAP_VISUAL_GUIDE_DISTANCE,
} from "./FieldConstants";

export interface SnapPoint {
  x: number;
  y: number;
  label: string;
  type: "hash" | "number" | "sideline" | "depth" | "slot" | "ol";
  priority: number; // Higher = more important (snap to first)
}

/**
 * Get all snap points on the field
 * Organized by type for intelligent snapping
 */
export function getAllSnapPoints(): SnapPoint[] {
  // Hash marks (horizontal snapping) - highest priority
  const hashMarks: SnapPoint[] = [
    { x: LEFT_HASH_X, y: LOS_Y, label: "Left Hash", type: "hash", priority: 10 },
    { x: CENTER_X, y: LOS_Y, label: "Center", type: "hash", priority: 10 },
    { x: RIGHT_HASH_X, y: LOS_Y, label: "Right Hash", type: "hash", priority: 10 },
  ];

  // Numbers (WR alignment) - high priority
  const numbers: SnapPoint[] = [
    { x: LEFT_NUMBERS_X, y: LOS_Y, label: "Left Numbers (X)", type: "number", priority: 9 },
    { x: RIGHT_NUMBERS_X, y: LOS_Y, label: "Right Numbers (Z)", type: "number", priority: 9 },
  ];

  // Sidelines - medium priority
  const sidelines: SnapPoint[] = [
    { x: LEFT_SIDELINE_X, y: LOS_Y, label: "Left Sideline", type: "sideline", priority: 7 },
    { x: RIGHT_SIDELINE_X, y: LOS_Y, label: "Right Sideline", type: "sideline", priority: 7 },
  ];

  // Slot positions - high priority
  const slots: SnapPoint[] = [
    { x: SLOT_LEFT_X, y: LOS_Y, label: "Slot Left", type: "slot", priority: 9 },
    { x: SLOT_LEFT_X, y: LOS_Y + 1, label: "Slot Left (off LOS)", type: "slot", priority: 9 },
    { x: SLOT_RIGHT_X, y: LOS_Y, label: "Slot Right", type: "slot", priority: 9 },
    { x: SLOT_RIGHT_X, y: LOS_Y + 1, label: "Slot Right (off LOS)", type: "slot", priority: 9 },
  ];

  // Offensive line positions - highest priority
  const olPositions: SnapPoint[] = Object.entries(OL_POSITIONS).map(([pos, x]) => ({
    x,
    y: LOS_Y,
    label: pos,
    type: "ol" as const,
    priority: 11,
  }));

  // QB depths - medium priority
  const qbDepths: SnapPoint[] = [
    { x: CENTER_X, y: QB_UNDER_CENTER_Y, label: "Under Center", type: "depth", priority: 8 },
    { x: CENTER_X, y: QB_PISTOL_Y, label: "Pistol", type: "depth", priority: 8 },
    { x: CENTER_X, y: QB_SHOTGUN_Y, label: "Shotgun", type: "depth", priority: 8 },
    { x: CENTER_X, y: QB_DEEP_SHOTGUN_Y, label: "Deep Shotgun", type: "depth", priority: 8 },
  ];

  // RB depths - medium priority
  const rbDepths: SnapPoint[] = [
    { x: CENTER_X, y: RB_PISTOL_Y, label: "RB Pistol", type: "depth", priority: 7 },
    { x: CENTER_X + 4, y: RB_OFFSET_Y, label: "RB Offset Right", type: "depth", priority: 7 },
    { x: CENTER_X - 4, y: RB_OFFSET_Y, label: "RB Offset Left", type: "depth", priority: 7 },
    { x: CENTER_X, y: RB_I_FORM_Y, label: "RB I-Form", type: "depth", priority: 7 },
  ];

  return [
    ...olPositions,
    ...hashMarks,
    ...numbers,
    ...slots,
    ...qbDepths,
    ...rbDepths,
    ...sidelines,
  ];
}

/**
 * Find nearest snap point to given coordinates
 * Returns null if too far from any snap point
 */
export function getNearestSnapPoint(
  x: number,
  y: number,
  role?: string
): SnapPoint | null {
  const allSnapPoints = getAllSnapPoints();

  // Filter snap points by role (QB should snap to QB depths, not sidelines)
  const relevantPoints = filterSnapPointsByRole(allSnapPoints, role);

  // Calculate distances
  const distances = relevantPoints.map((point) => ({
    point,
    distance: Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)),
  }));

  // Sort by priority first, then distance
  distances.sort((a, b) => {
    // If priorities differ, higher priority wins
    if (a.point.priority !== b.point.priority) {
      return b.point.priority - a.point.priority;
    }
    // Same priority, sort by distance
    return a.distance - b.distance;
  });

  const nearest = distances[0];

  // Only snap if within threshold
  if (nearest && nearest.distance <= SNAP_THRESHOLD_YARDS) {
    return nearest.point;
  }

  return null;
}

/**
 * Filter snap points by player role for intelligent snapping
 */
function filterSnapPointsByRole(
  snapPoints: SnapPoint[],
  role?: string
): SnapPoint[] {
  if (!role) return snapPoints;

  switch (role) {
    case "QB":
      // QBs care about center hash and depth markers
      return snapPoints.filter(
        (p) => p.type === "hash" || p.type === "depth" || p.x === CENTER_X
      );

    case "RB":
    case "FB":
      // RBs care about depths and hash marks
      return snapPoints.filter((p) => p.type === "depth" || p.type === "hash");

    case "C":
    case "LG":
    case "RG":
    case "LT":
    case "RT":
      // O-line ONLY snaps to OL positions
      return snapPoints.filter((p) => p.type === "ol");

    case "WR":
      // WRs care about numbers, sidelines, slots
      return snapPoints.filter(
        (p) => p.type === "number" || p.type === "sideline" || p.type === "slot"
      );

    case "TE":
      // TEs care about slots and OL positions (inline TE)
      return snapPoints.filter(
        (p) => p.type === "slot" || p.type === "ol" || p.type === "hash"
      );

    default:
      return snapPoints;
  }
}

/**
 * Get snap points near a position (for visual guides)
 * Returns all points within visual guide distance
 */
export function getNearbySnapPoints(
  x: number,
  y: number,
  role?: string
): SnapPoint[] {
  const allSnapPoints = getAllSnapPoints();
  const relevantPoints = filterSnapPointsByRole(allSnapPoints, role);

  return relevantPoints.filter((point) => {
    const distance = Math.sqrt(
      Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
    );
    return distance <= SNAP_VISUAL_GUIDE_DISTANCE;
  });
}

/**
 * Snap coordinates to nearest point
 * Returns snapped coordinates or original if no snap
 */
export function snapToNearest(
  x: number,
  y: number,
  role?: string
): { x: number; y: number; snapped: boolean; snapPoint?: SnapPoint } {
  const snapPoint = getNearestSnapPoint(x, y, role);

  if (snapPoint) {
    return {
      x: snapPoint.x,
      y: snapPoint.y,
      snapped: true,
      snapPoint,
    };
  }

  return { x, y, snapped: false };
}

/**
 * Get vertical snap lines for visual feedback
 * Returns X coordinates where vertical guides should be drawn
 */
export function getVerticalSnapLines(role?: string): number[] {
  const lines: number[] = [
    LEFT_SIDELINE_X,
    LEFT_NUMBERS_X,
    SLOT_LEFT_X,
    LEFT_HASH_X,
    ...Object.values(OL_POSITIONS),
    CENTER_X,
    RIGHT_HASH_X,
    SLOT_RIGHT_X,
    RIGHT_NUMBERS_X,
    RIGHT_SIDELINE_X,
  ];

  // Filter based on role
  if (role === "QB") {
    return [CENTER_X, LEFT_HASH_X, RIGHT_HASH_X];
  }

  if (["C", "LG", "RG", "LT", "RT"].includes(role || "")) {
    return Object.values(OL_POSITIONS);
  }

  return lines;
}

/**
 * Get horizontal snap lines for visual feedback
 * Returns Y coordinates where horizontal guides should be drawn
 */
export function getHorizontalSnapLines(role?: string): number[] {
  const lines: number[] = [
    LOS_Y,
    LOS_Y + 1, // Off LOS (slot positions)
    QB_UNDER_CENTER_Y,
    RB_PISTOL_Y,
    QB_PISTOL_Y,
    QB_SHOTGUN_Y,
    RB_OFFSET_Y,
    QB_DEEP_SHOTGUN_Y,
    RB_I_FORM_Y,
  ];

  // LOS is always important
  const baselines = [LOS_Y, LOS_Y + 1];

  // Filter based on role
  if (role === "QB") {
    return [...baselines, QB_UNDER_CENTER_Y, QB_PISTOL_Y, QB_SHOTGUN_Y, QB_DEEP_SHOTGUN_Y];
  }

  if (["RB", "FB"].includes(role || "")) {
    return [...baselines, RB_PISTOL_Y, RB_OFFSET_Y, RB_I_FORM_Y];
  }

  if (["C", "LG", "RG", "LT", "RT"].includes(role || "")) {
    return [LOS_Y]; // O-line only on LOS
  }

  return lines;
}
