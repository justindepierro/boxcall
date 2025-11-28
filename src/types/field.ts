/**
 * Football Field Constants & Dimensions
 *
 * Standard NFL/NCAA field specifications for diagram rendering
 * All measurements in yards, with canvas scaling factors
 */

// ============================================================================
// FIELD DIMENSIONS (NFL Standard)
// ============================================================================

/** Standard NFL field width (sideline to sideline) */
export const FIELD_WIDTH_YARDS = 53.3;

/** Standard NFL field length (goal line to goal line, including end zones) */
export const FIELD_LENGTH_YARDS = 120;

/** End zone depth */
export const END_ZONE_DEPTH = 10;

/** Field of play length (between goal lines) */
export const FIELD_OF_PLAY_LENGTH = 100;

/** Hash mark width (distance between hash marks) */
export const HASH_WIDTH = 18.5;

/** Distance from sideline to near hash */
export const HASH_OFFSET = 12;

// ============================================================================
// LINE OF SCRIMMAGE & YARD LINES
// ============================================================================

/** Standard line of scrimmage Y position (from defensive goal line) */
export const LINE_OF_SCRIMMAGE_Y = 20;

/** Goal line Y position (defensive side) */
export const GOAL_LINE_Y = 10;

/** Defensive goal line (where defense starts) */
export const DEFENSIVE_GOAL_LINE = 10;

/** Offensive goal line (where offense scores) */
export const OFFENSIVE_GOAL_LINE = 110;

/** Field center Y position */
export const FIELD_CENTER_Y = 60;

/** Field center X position (sideline to sideline) */
export const FIELD_CENTER_X = FIELD_WIDTH_YARDS / 2;

// ============================================================================
// PROFESSIONAL POSITIONING STANDARDS (NFL/NCAA)
// ============================================================================

/** Professional depth standards (yards behind line of scrimmage) */
export const POSITION_DEPTHS = {
  QB: 7, // Shotgun depth (most common)
  QB_UNDER: 1, // Under center (traditional)
  RB: 8, // I-formation depth
  FB: 6, // H-back/fullback depth
  SLOT: 1, // 1 yard off LOS (eligible receivers)
  SPLIT_END: 0, // On LOS (traditional split ends)
  TE: 0, // On LOS (inline tight ends)
  DEFAULT: 5, // Default depth for unknown positions
} as const;

/** Offensive line positioning (relative to QB) */
export const OFFENSIVE_LINE_POSITIONS = {
  LT: -2.5, // Left tackle (2.5 yards left of center)
  LG: -1.5, // Left guard
  C: 0, // Center
  RG: 1.5, // Right guard
  RT: 2.5, // Right tackle
} as const;

/** Standard player spacing */
export const PLAYER_SPACING = {
  RECEIVER_SPLIT: 8, // Yards between split receivers
  SLOT_INSET: 2, // Yards slot receivers inset from split ends
  MOTION_DEPTH: 3, // Yards for motion players
} as const;

// ============================================================================
// CANVAS SCALING & RENDERING
// ============================================================================

/** Standard canvas width (pixels) for field rendering */
export const CANVAS_WIDTH = 1200;

/** Standard canvas height (pixels) for field rendering */
export const CANVAS_HEIGHT = 600;

/** Yards per pixel scaling factor */
export const YARDS_PER_PIXEL = FIELD_WIDTH_YARDS / CANVAS_WIDTH;

/** Pixels per yard scaling factor */
export const PIXELS_PER_YARD = CANVAS_WIDTH / FIELD_WIDTH_YARDS;

/** Player icon radius (yards) */
export const PLAYER_RADIUS_YARDS = 0.8;

/** Player icon radius (pixels) */
export const PLAYER_RADIUS_PIXELS = PLAYER_RADIUS_YARDS * PIXELS_PER_YARD;

// ============================================================================
// ROUTE DRAWING CONSTANTS
// ============================================================================

/** Route snap-to-grid interval (yards) */
export const ROUTE_GRID_SIZE = 1;

/** Route control point spacing (yards) */
export const ROUTE_CONTROL_SPACING = 2;

/** Route distance markers (yard intervals) */
export const ROUTE_DISTANCE_MARKERS = [5, 10, 15, 20];

/** Route types and their visual properties */
export const ROUTE_STYLES = {
  primary: {
    color: "#2563eb", // Blue for primary routes
    width: 2,
    style: "solid" as const,
  },
  hot: {
    color: "#dc2626", // Red for hot routes
    width: 2,
    style: "dashed" as const,
  },
  check: {
    color: "#16a34a", // Green for check routes
    width: 1,
    style: "dotted" as const,
  },
} as const;

// ============================================================================
// FIELD MARKINGS & VISUAL CONSTANTS
// ============================================================================

/** Field line width (pixels) */
export const FIELD_LINE_WIDTH = 2;

/** Yard line interval (every 5 yards gets a number) */
export const YARD_LINE_INTERVAL = 5;

/** Hash mark length (yards) */
export const HASH_LENGTH = 0.5;

/** Sideline width (pixels) */
export const SIDELINE_WIDTH = 3;

/** Goal line width (pixels) */
export const GOAL_LINE_WIDTH = 4;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Field coordinate system (yards) */
export interface FieldPosition {
  x: number; // 0 to FIELD_WIDTH_YARDS
  y: number; // 0 to FIELD_LENGTH_YARDS
}

/** Canvas coordinate system (pixels) */
export interface CanvasPosition {
  x: number; // 0 to CANVAS_WIDTH
  y: number; // 0 to CANVAS_HEIGHT
}

/** Route type classification */
export type RouteType = keyof typeof ROUTE_STYLES;

/** Position depth category */
export type PositionDepth = keyof typeof POSITION_DEPTHS;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert field yards to canvas pixels
 */
export function yardsToPixels(yards: number): number {
  return yards * PIXELS_PER_YARD;
}

/**
 * Convert canvas pixels to field yards
 */
export function pixelsToYards(pixels: number): number {
  return pixels * YARDS_PER_PIXEL;
}

/**
 * Convert field position to canvas position
 */
export function fieldToCanvas(fieldPos: FieldPosition): CanvasPosition {
  return {
    x: yardsToPixels(fieldPos.x),
    y: yardsToPixels(fieldPos.y),
  };
}

/**
 * Convert canvas position to field position
 */
export function canvasToField(canvasPos: CanvasPosition): FieldPosition {
  return {
    x: pixelsToYards(canvasPos.x),
    y: pixelsToYards(canvasPos.y),
  };
}

/**
 * Check if position is within field bounds
 */
export function isValidFieldPosition(pos: FieldPosition): boolean {
  return (
    pos.x >= 0 &&
    pos.x <= FIELD_WIDTH_YARDS &&
    pos.y >= 0 &&
    pos.y <= FIELD_LENGTH_YARDS
  );
}

/**
 * Get professional depth for a position
 */
export function getPositionDepth(position: string): number {
  const upperPosition = position.toUpperCase();

  // Direct matches
  if (upperPosition in POSITION_DEPTHS) {
    return POSITION_DEPTHS[upperPosition as PositionDepth];
  }

  // Pattern matching
  if (upperPosition.includes("QB")) {
    return upperPosition.includes("UNDER")
      ? POSITION_DEPTHS.QB_UNDER
      : POSITION_DEPTHS.QB;
  }

  if (upperPosition.includes("RB") || upperPosition.includes("HB")) {
    return POSITION_DEPTHS.RB;
  }

  if (upperPosition.includes("FB")) {
    return POSITION_DEPTHS.FB;
  }

  if (
    upperPosition.includes("SLOT") ||
    upperPosition.includes("X") ||
    upperPosition.includes("Z")
  ) {
    return POSITION_DEPTHS.SLOT;
  }

  if (upperPosition.includes("TE")) {
    return POSITION_DEPTHS.TE;
  }

  return POSITION_DEPTHS.DEFAULT;
}
