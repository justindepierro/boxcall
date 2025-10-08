/**
 * Unified Coordinate System for Football Diagram
 * 
 * Everything uses YARD coordinates as the single source of truth.
 * Pixi handles screen-to-world conversion automatically via transforms.
 */

export interface YardCoordinate {
  x: number; // 0 to FIELD_WIDTH (53.333 yards)
  y: number; // 0 to visible field length (usually 35-40 yards)
}

export interface FieldDimensions {
  width: number;  // Field width in yards (53.333 for NFL)
  height: number; // Visible field height in yards (configurable slice)
  pixelsPerYard: number; // Scale factor for rendering
}

export class CoordinateSystem {
  public readonly fieldWidth: number;
  public readonly fieldHeight: number;
  public readonly pixelsPerYard: number;

  constructor(dimensions: FieldDimensions) {
    this.fieldWidth = dimensions.width;
    this.fieldHeight = dimensions.height;
    this.pixelsPerYard = dimensions.pixelsPerYard;
  }

  /**
   * Convert yard coordinates to pixel coordinates
   */
  yardsToPixels(yards: YardCoordinate): { x: number; y: number } {
    return {
      x: yards.x * this.pixelsPerYard,
      y: yards.y * this.pixelsPerYard,
    };
  }

  /**
   * Convert pixel coordinates to yard coordinates
   */
  pixelsToYards(pixels: { x: number; y: number }): YardCoordinate {
    return {
      x: pixels.x / this.pixelsPerYard,
      y: pixels.y / this.pixelsPerYard,
    };
  }

  /**
   * Convert percentage (0-100) to yard coordinates
   * Used for migrating old data
   */
  percentToYards(percent: { x: number; y: number }): YardCoordinate {
    return {
      x: (percent.x / 100) * this.fieldWidth,
      y: (percent.y / 100) * this.fieldHeight,
    };
  }

  /**
   * Convert yard coordinates to percentage (0-100)
   * Used for storing data in old format
   */
  yardsToPercent(yards: YardCoordinate): { x: number; y: number } {
    return {
      x: (yards.x / this.fieldWidth) * 100,
      y: (yards.y / this.fieldHeight) * 100,
    };
  }

  /**
   * Clamp coordinates to field bounds
   */
  clampToField(yards: YardCoordinate): YardCoordinate {
    return {
      x: Math.max(0, Math.min(this.fieldWidth, yards.x)),
      y: Math.max(0, Math.min(this.fieldHeight, yards.y)),
    };
  }

  /**
   * Check if a point is within field bounds
   */
  isInBounds(yards: YardCoordinate, padding: number = 0): boolean {
    return (
      yards.x >= -padding &&
      yards.x <= this.fieldWidth + padding &&
      yards.y >= -padding &&
      yards.y <= this.fieldHeight + padding
    );
  }

  /**
   * Get field center in yards
   */
  getCenter(): YardCoordinate {
    return {
      x: this.fieldWidth / 2,
      y: this.fieldHeight / 2,
    };
  }

  /**
   * Calculate distance between two points in yards
   */
  distance(a: YardCoordinate, b: YardCoordinate): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
