/**
 * Field Dimension Design Tokens
 * 
 * Single source of truth for all field-related measurements and constraints.
 * All spatial dimensions are defined in YARDS for consistency with the
 * coordinate system. Pixel-based constraints are used only for minimum
 * accessibility requirements (touch targets, font sizes).
 * 
 * Philosophy:
 * - Define in yards → Scale with pixelsPerYard
 * - Maintain proportions across all screen sizes
 * - Enforce accessibility minimums (44px touch targets, 10px fonts)
 * - Support future field types (CFL, high school, etc.)
 */

/**
 * NFL regulation field dimensions
 */
export const NFL_FIELD = {
  /** Field width in yards (160 feet = 53.333 yards) */
  WIDTH_YARDS: 53.333,
  
  /** Visible field height in yards (typically 35-40 for diagram view) */
  HEIGHT_YARDS: 35,
  
  /** Standard aspect ratio for layout calculations */
  ASPECT_RATIO: 53.333 / 35, // ~1.524
  
  /** Hash mark positions (from center) */
  HASH_OFFSET_YARDS: 6.17, // 18.5 feet = 6.17 yards
} as const;

/**
 * Player sprite visual constants (in yards)
 * These scale proportionally with pixelsPerYard
 */
export const PLAYER_SIZING = {
  /** Standard player circle radius in yards */
  RADIUS_YARDS: 0.6,
  
  /** Player circle border thickness in yards */
  STROKE_YARDS: 0.06,
  
  /** Selection highlight ring width in yards */
  SELECTION_RING_YARDS: 0.08,
  
  /** Drop shadow offset during drag in yards */
  SHADOW_OFFSET_YARDS: 0.12,
  
  /** Drag scale multiplier (dimensionless) */
  DRAG_SCALE: 1.05,
  
  /** Minimum touch target diameter in pixels (WCAG 2.1 Level AAA) */
  MIN_TOUCH_TARGET_PX: 44,
  
  /** Target range for player radius in pixels */
  IDEAL_RADIUS_RANGE_PX: { min: 20, max: 30 },
} as const;

/**
 * Field line rendering constants (in yards)
 */
export const FIELD_LINES = {
  /** Yard line thickness */
  YARD_LINE_YARDS: 0.05,
  
  /** Hash mark thickness */
  HASH_MARK_YARDS: 0.025,
  
  /** Hash mark length */
  HASH_LENGTH_YARDS: 0.5, // 6 inches
  
  /** Sideline border thickness */
  SIDELINE_YARDS: 0.6,
  
  /** Line of scrimmage indicator thickness */
  LINE_OF_SCRIMMAGE_YARDS: 0.1,
  
  /** Yard line interval (draw every 5 yards) */
  YARD_LINE_INTERVAL: 5,
  
  /** Number placement interval (every 10 yards) */
  NUMBER_INTERVAL: 10,
} as const;

/**
 * Typography sizing (in yards for scaling, with pixel constraints)
 */
export const TYPOGRAPHY = {
  /** Field yard numbers height in yards */
  FIELD_NUMBER_HEIGHT_YARDS: 2.5,
  
  /** Standard label text height in yards */
  LABEL_TEXT_YARDS: 0.35,
  
  /** Small text height in yards */
  SMALL_TEXT_YARDS: 0.3,
  
  /** Digit spacing for multi-digit numbers */
  DIGIT_SPACING_YARDS: 1.2,
  
  /** Triangle indicator size */
  TRIANGLE_SIZE_YARDS: 0.6,
  
  /** Triangle offset from number */
  TRIANGLE_OFFSET_YARDS: 0.6,
  
  /** Minimum font size in pixels (readability) */
  MIN_FONT_SIZE_PX: 10,
  
  /** Maximum font size in pixels (avoid giant text) */
  MAX_FONT_SIZE_PX: 32,
  
  /** Field number minimum size in pixels */
  MIN_FIELD_NUMBER_PX: 20,
  
  /** Field number maximum size in pixels */
  MAX_FIELD_NUMBER_PX: 48,
} as const;

/**
 * Responsive scaling constraints
 */
export const RESPONSIVE_SCALING = {
  /** Minimum pixels per yard (maintains readability) */
  MIN_PIXELS_PER_YARD: 10,
  
  /** Maximum pixels per yard (maintains performance, touch targets) */
  MAX_PIXELS_PER_YARD: 25,
  
  /** Ideal range for desktop viewing */
  DESKTOP_IDEAL_PPY: { min: 12, max: 18 },
  
  /** Ideal range for tablet viewing */
  TABLET_IDEAL_PPY: { min: 15, max: 20 },
  
  /** Ideal range for mobile viewing */
  MOBILE_IDEAL_PPY: { min: 18, max: 25 },
  
  /** Viewport padding in pixels (breathing room) */
  VIEWPORT_PADDING_PX: 20,
  
  /** Resize debounce delay in milliseconds */
  RESIZE_DEBOUNCE_MS: 100,
} as const;

/**
 * UI element sizing (in yards for consistency)
 */
export const UI_ELEMENTS = {
  /** Spacing indicator handle size */
  SPACING_HANDLE_YARDS: 0.3,
  
  /** Spacing indicator line width */
  SPACING_LINE_YARDS: 0.15,
  
  /** Alignment guide line width */
  ALIGNMENT_GUIDE_YARDS: 0.05,
  
  /** Selection box border width */
  SELECTION_BORDER_YARDS: 0.05,
  
  /** Selection box corner handle size */
  SELECTION_HANDLE_YARDS: 0.15,
  
  /** Minimum UI element size in pixels */
  MIN_UI_ELEMENT_PX: 6,
  
  /** Maximum UI element size in pixels */
  MAX_UI_ELEMENT_PX: 20,
} as const;

/**
 * Accessibility constraints (WCAG 2.1 Level AAA)
 */
export const ACCESSIBILITY = {
  /** Minimum touch target size (width/height) */
  MIN_TOUCH_TARGET_PX: 44,
  
  /** Minimum spacing between touch targets */
  MIN_TOUCH_SPACING_PX: 8,
  
  /** Minimum text size for readability */
  MIN_TEXT_SIZE_PX: 10,
  
  /** Minimum contrast ratio for text */
  MIN_CONTRAST_RATIO: 4.5, // WCAG AA
  
  /** Enhanced contrast ratio for large text */
  ENHANCED_CONTRAST_RATIO: 7.0, // WCAG AAA
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE = {
  /** Maximum players before performance degradation warning */
  MAX_PLAYERS_WARNING: 50,
  
  /** Maximum players absolute limit */
  MAX_PLAYERS_LIMIT: 100,
  
  /** Target frame rate */
  TARGET_FPS: 60,
  
  /** Minimum acceptable frame rate */
  MIN_FPS: 30,
} as const;

/**
 * Helper: Calculate pixel size from yard size with clamping
 */
export function yardsToPixelsClamped(
  yards: number,
  pixelsPerYard: number,
  minPx?: number,
  maxPx?: number
): number {
  const calculated = yards * pixelsPerYard;
  
  if (minPx !== undefined && maxPx !== undefined) {
    return Math.max(minPx, Math.min(maxPx, calculated));
  }
  if (minPx !== undefined) {
    return Math.max(minPx, calculated);
  }
  if (maxPx !== undefined) {
    return Math.min(maxPx, calculated);
  }
  
  return calculated;
}

/**
 * Helper: Ensure minimum touch target size
 */
export function ensureTouchTarget(
  radiusYards: number,
  pixelsPerYard: number,
  minDiameterPx: number = ACCESSIBILITY.MIN_TOUCH_TARGET_PX
): number {
  const currentDiameter = radiusYards * pixelsPerYard * 2;
  
  if (currentDiameter < minDiameterPx) {
    // Scale up radius to meet minimum diameter
    return (minDiameterPx / 2) / pixelsPerYard;
  }
  
  return radiusYards;
}

/**
 * Helper: Get clamped font size
 */
export function getClampedFontSize(
  sizeYards: number,
  pixelsPerYard: number,
  minPx: number = TYPOGRAPHY.MIN_FONT_SIZE_PX,
  maxPx: number = TYPOGRAPHY.MAX_FONT_SIZE_PX
): number {
  return yardsToPixelsClamped(sizeYards, pixelsPerYard, minPx, maxPx);
}

/**
 * Helper: Validate aspect ratio
 */
export function validateAspectRatio(
  width: number,
  height: number,
  expectedRatio: number = NFL_FIELD.ASPECT_RATIO,
  tolerance: number = 0.01
): boolean {
  const actualRatio = width / height;
  const diff = Math.abs(actualRatio - expectedRatio);
  
  if (diff > tolerance) {
    console.warn(
      `Field aspect ratio ${actualRatio.toFixed(3)} differs from expected ${expectedRatio.toFixed(3)} by ${diff.toFixed(3)}`
    );
    return false;
  }
  
  return true;
}

/**
 * Type-safe access to all tokens
 */
export const FIELD_TOKENS = {
  FIELD: NFL_FIELD,
  PLAYER: PLAYER_SIZING,
  LINES: FIELD_LINES,
  TEXT: TYPOGRAPHY,
  SCALING: RESPONSIVE_SCALING,
  UI: UI_ELEMENTS,
  A11Y: ACCESSIBILITY,
  PERF: PERFORMANCE,
} as const;

// Export type for TypeScript consumers
export type FieldTokens = typeof FIELD_TOKENS;
