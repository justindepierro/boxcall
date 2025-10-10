/**
 * Football Field Rendering Layer
 *
 * Renders the football field using Pixi Graphics with WebGL acceleration.
 * Includes yard lines, hash marks, numbers, and field markings.
 */

import { Container, Graphics, Text, TextStyle } from "pixi.js";
import type { CoordinateSystem } from "../core/CoordinateSystem";
import {
  FIELD_LINES,
  getClampedFontSize,
  TYPOGRAPHY,
} from "../../../../design-tokens/field-dimensions";

export type FieldColorMode = "jade" | "blackwhite" | "darkgray";

export interface FieldConfig {
  width: number; // Field width in yards (53.333 for NFL)
  height: number; // Visible height in yards
  backgroundColor: number; // Field color
  lineColor: number; // Yard line color
  hashColor: number; // Hash mark color
  numbersColor: number; // Number color
  showNumbers: boolean; // Show yard numbers
  showHashes: boolean; // Show hash marks
  colorMode?: FieldColorMode; // Color mode for field
  showLineOfScrimmage?: boolean; // Show line of scrimmage
  lineOfScrimmageYard?: number; // Line of scrimmage position in yards
}

// Color mode presets using design tokens
const COLOR_MODES: Record<
  FieldColorMode,
  { bg: number; line: number; hash: number; numbers: number }
> = {
  jade: {
    bg: 0xecfdf5, // jade-50 - super light jade
    line: 0x6b7280, // gray-500 - medium gray for contrast
    hash: 0x6b7280, // gray-500 - medium gray for contrast
    numbers: 0x374151, // gray-700 - darker gray for readability
  },
  blackwhite: {
    bg: 0xffffff, // white
    line: 0x000000, // black
    hash: 0x000000, // black
    numbers: 0x000000, // black
  },
  darkgray: {
    bg: 0x374151, // dark gray
    line: 0xffffff, // white
    hash: 0xffffff, // white
    numbers: 0xffffff, // white
  },
};

export class FieldLayer extends Container {
  private config: FieldConfig;
  private coordinates: CoordinateSystem;
  private fieldGraphics: Graphics;
  private currentColorMode: FieldColorMode;
  private coordsObserver: () => void; // Store observer for cleanup

  // Visual constants in YARDS (imported from design tokens for consistency)
  private readonly YARD_LINE_WIDTH_YARDS = FIELD_LINES.YARD_LINE_YARDS;
  private readonly HASH_MARK_WIDTH_YARDS = FIELD_LINES.HASH_MARK_YARDS;
  private readonly LINE_OF_SCRIMMAGE_WIDTH_YARDS =
    FIELD_LINES.LINE_OF_SCRIMMAGE_YARDS;
  private readonly SIDELINE_BORDER_WIDTH_YARDS = FIELD_LINES.SIDELINE_YARDS;

  constructor(
    coordinates: CoordinateSystem,
    config: Partial<FieldConfig> = {}
  ) {
    super();

    this.coordinates = coordinates;
    this.currentColorMode = config.colorMode || "jade";

    const modeColors = COLOR_MODES[this.currentColorMode];
    this.config = {
      width: coordinates.fieldWidth,
      height: coordinates.fieldHeight,
      backgroundColor: modeColors.bg,
      lineColor: modeColors.line,
      hashColor: modeColors.hash,
      numbersColor: modeColors.numbers,
      showNumbers: true,
      showHashes: true,
      showLineOfScrimmage: true, // Show by default
      lineOfScrimmageYard: 25, // Default at 25-yard line
      colorMode: this.currentColorMode,
      ...config,
    };

    this.fieldGraphics = new Graphics();
    this.addChild(this.fieldGraphics);

    // PERFORMANCE: Subscribe to coordinate system changes
    this.coordsObserver = () => {
      this.renderField();
    };
    this.coordinates.addObserver(this.coordsObserver);

    this.renderField();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // PERFORMANCE: Unsubscribe from coordinate system changes
    this.coordinates.removeObserver(this.coordsObserver);
    super.destroy();
  }

  /**
   * Change field color mode
   */
  public setColorMode(mode: FieldColorMode): void {
    this.currentColorMode = mode;
    const modeColors = COLOR_MODES[mode];

    this.config.backgroundColor = modeColors.bg;
    this.config.lineColor = modeColors.line;
    this.config.hashColor = modeColors.hash;
    this.config.numbersColor = modeColors.numbers;
    this.config.colorMode = mode;

    // Clear all existing children (text objects)
    while (this.children.length > 1) {
      const child = this.children[1];
      this.removeChild(child);
      if (child.destroy) {
        child.destroy();
      }
    }

    // Re-render with new colors
    this.renderField();
  }

  /**
   * Get current color mode
   */
  public getColorMode(): FieldColorMode {
    return this.currentColorMode;
  }

  /**
   * Render the complete football field
   */
  private renderField(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;
    const fieldHeightPixels = this.config.height * pixelsPerYard;

    // Guard: Ensure fieldGraphics exists (might have been destroyed)
    if (!this.fieldGraphics) {
      console.warn("⚠️ FieldLayer: fieldGraphics was null, recreating...");
      this.fieldGraphics = new Graphics();
      this.addChildAt(this.fieldGraphics, 0); // Add at index 0 to keep it as background
    }

    // Clear previous graphics
    this.fieldGraphics.clear();

    // Draw field background using v7 API
    this.fieldGraphics.beginFill(this.config.backgroundColor);
    this.fieldGraphics.drawRect(0, 0, fieldWidthPixels, fieldHeightPixels);
    this.fieldGraphics.endFill();

    // Draw yard lines every 5 yards
    this.drawYardLines();

    // Draw hash marks if enabled
    if (this.config.showHashes) {
      this.drawHashMarks();
    }

    // Draw yard numbers if enabled
    if (this.config.showNumbers) {
      this.drawYardNumbers();
    }

    // Draw sidelines
    this.drawSidelines();

    // Draw line of scrimmage if enabled
    if (
      this.config.showLineOfScrimmage &&
      this.config.lineOfScrimmageYard !== undefined
    ) {
      this.drawLineOfScrimmage();
    }
  }

  /**
   * Draw yard lines every 5 yards
   */
  private drawYardLines(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;

    // Draw line every 5 yards using v7 API
    for (let yard = 0; yard <= this.config.height; yard += 5) {
      const yPixels = yard * pixelsPerYard;
      const lineWidth = this.YARD_LINE_WIDTH_YARDS * pixelsPerYard; // Scale with pixelsPerYard

      // Draw as a thin rectangle using v7 API
      this.fieldGraphics.beginFill(this.config.lineColor);
      this.fieldGraphics.drawRect(
        0,
        yPixels - lineWidth / 2,
        fieldWidthPixels,
        lineWidth
      );
      this.fieldGraphics.endFill();
    }
  }

  /**
   * Draw hash marks (NFL style + sideline hashes)
   */
  private drawHashMarks(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;

    // NFL hash mark positions (18.5 feet from center = 6.17 yards from center)
    // NFL field width is 53.333 yards, center is 26.67 yards
    const centerYards = this.config.width / 2;
    const hashOffsetYards = 6.17;
    const leftHashYards = centerYards - hashOffsetYards;
    const rightHashYards = centerYards + hashOffsetYards;

    const leftHashPixels = leftHashYards * pixelsPerYard;
    const rightHashPixels = rightHashYards * pixelsPerYard;

    // Sideline hash positions (1 yard in from each sideline)
    const sidelineInsetYards = 1;
    const leftSidelineHashPixels = sidelineInsetYards * pixelsPerYard;
    const rightSidelineHashPixels =
      (this.config.width - sidelineInsetYards) * pixelsPerYard;

    const hashLengthPixels = 0.5 * pixelsPerYard; // 6 inches
    const hashWidth = this.HASH_MARK_WIDTH_YARDS * pixelsPerYard; // Scale with pixelsPerYard

    // Draw hash marks every yard using v7 API
    for (let yard = 1; yard < this.config.height; yard++) {
      const yPixels = yard * pixelsPerYard;

      // Left sideline hash
      this.fieldGraphics.beginFill(this.config.hashColor);
      this.fieldGraphics.drawRect(
        leftSidelineHashPixels - hashLengthPixels / 2,
        yPixels - hashWidth / 2,
        hashLengthPixels,
        hashWidth
      );
      this.fieldGraphics.endFill();

      // Left hash (center)
      this.fieldGraphics.beginFill(this.config.hashColor);
      this.fieldGraphics.drawRect(
        leftHashPixels - hashLengthPixels / 2,
        yPixels - hashWidth / 2,
        hashLengthPixels,
        hashWidth
      );
      this.fieldGraphics.endFill();

      // Right hash (center)
      this.fieldGraphics.beginFill(this.config.hashColor);
      this.fieldGraphics.drawRect(
        rightHashPixels - hashLengthPixels / 2,
        yPixels - hashWidth / 2,
        hashLengthPixels,
        hashWidth
      );
      this.fieldGraphics.endFill();

      // Right sideline hash
      this.fieldGraphics.beginFill(this.config.hashColor);
      this.fieldGraphics.drawRect(
        rightSidelineHashPixels - hashLengthPixels / 2,
        yPixels - hashWidth / 2,
        hashLengthPixels,
        hashWidth
      );
      this.fieldGraphics.endFill();
    }
  }

  /**
   * Draw yard numbers
   */
  private drawYardNumbers(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;

    // Use clamped font size for field numbers (20-48px range for readability)
    const fontSize = getClampedFontSize(
      2.5, // 2.5 yards tall
      pixelsPerYard,
      TYPOGRAPHY.MIN_FIELD_NUMBER_PX,
      TYPOGRAPHY.MAX_FIELD_NUMBER_PX
    );

    const textStyle = new TextStyle({
      fontFamily: "Bebas Neue, Inter, Arial, sans-serif",
      fontSize: fontSize,
      fill: this.config.numbersColor,
      fontWeight: "400",
      align: "center",
    });

    // Draw numbers every 10 yards, split across the yard line
    for (let yard = 10; yard < this.config.height; yard += 10) {
      const yPixels = yard * pixelsPerYard;
      const number = yard.toString();
      const fieldWidthPixels = this.config.width * pixelsPerYard;

      // Split number into individual digits
      const digits = number.split("");
      const digitSpacing = 1.2 * pixelsPerYard; // Space between digits and yard line (reduced from 1.5)
      const triangleSize = 0.6 * pixelsPerYard; // Triangle size in pixels (bigger)
      const triangleOffset = 0.6 * pixelsPerYard; // Space between digit and triangle (further away)

      // Left side numbers
      for (let i = 0; i < digits.length; i++) {
        const digit = digits[i];
        const leftText = new Text(digit, textStyle);
        leftText.anchor.set(0.5);
        leftText.rotation = Math.PI / 2; // 90 degrees clockwise

        // Position: first digit above line, second digit below line
        const offset = i === 0 ? -digitSpacing : digitSpacing;
        leftText.position.set(fieldWidthPixels * 0.15, yPixels + offset);
        this.addChild(leftText);

        // Add triangle above the top digit (first digit, i === 0)
        if (i === 0) {
          const triangle = new Graphics();
          triangle.beginFill(this.config.numbersColor);
          // Draw triangle pointing up (toward endzone)
          triangle.moveTo(0, 0); // Top point
          triangle.lineTo(-triangleSize / 2, triangleSize); // Bottom left
          triangle.lineTo(triangleSize / 2, triangleSize); // Bottom right
          triangle.lineTo(0, 0); // Close path
          triangle.endFill();

          // Position triangle above the digit, use same rotation as right side (0 degrees)
          triangle.position.set(
            fieldWidthPixels * 0.15,
            yPixels + offset - digitSpacing / 2 - triangleOffset
          );
          triangle.rotation = 0; // 0 degrees - points up correctly
          this.addChild(triangle);
        }
      }

      // Right side numbers (reversed digit order so they mirror left side when facing opposite)
      for (let i = 0; i < digits.length; i++) {
        const digit = digits[digits.length - 1 - i]; // Reverse the digit order
        const rightText = new Text(digit, textStyle);
        rightText.anchor.set(0.5);
        rightText.rotation = -Math.PI / 2; // 90 degrees counter-clockwise (opposite of left side)

        // Position: first digit above line, second digit below line
        const offset = i === 0 ? -digitSpacing : digitSpacing;
        rightText.position.set(fieldWidthPixels * 0.85, yPixels + offset);
        this.addChild(rightText);

        // Add triangle above the top digit (first digit, i === 0)
        if (i === 0) {
          const triangle = new Graphics();
          triangle.beginFill(this.config.numbersColor);
          // Draw triangle pointing up (toward endzone)
          triangle.moveTo(0, 0); // Top point
          triangle.lineTo(-triangleSize / 2, triangleSize); // Bottom left
          triangle.lineTo(triangleSize / 2, triangleSize); // Bottom right
          triangle.lineTo(0, 0); // Close path
          triangle.endFill();

          // Position triangle above the digit, rotated to point up
          triangle.position.set(
            fieldWidthPixels * 0.85,
            yPixels + offset - digitSpacing / 2 - triangleOffset
          );
          triangle.rotation = 0; // 0 degrees - points up after opposite text rotation
          this.addChild(triangle);
        }
      }
    }
  }

  /**
   * Draw field sidelines
   */
  private drawSidelines(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;
    const fieldHeightPixels = this.config.height * pixelsPerYard;
    const borderWidth = this.SIDELINE_BORDER_WIDTH_YARDS * pixelsPerYard; // Scale with pixelsPerYard

    // Draw border OUTSIDE the field boundaries (expanding outward)
    // Top (extends above the field)
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(
      -borderWidth,
      -borderWidth,
      fieldWidthPixels + borderWidth * 2,
      borderWidth
    );
    this.fieldGraphics.endFill();

    // Right (extends to the right of the field)
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(
      fieldWidthPixels,
      -borderWidth,
      borderWidth,
      fieldHeightPixels + borderWidth * 2
    );
    this.fieldGraphics.endFill();

    // Bottom (extends below the field)
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(
      -borderWidth,
      fieldHeightPixels,
      fieldWidthPixels + borderWidth * 2,
      borderWidth
    );
    this.fieldGraphics.endFill();

    // Left (extends to the left of the field)
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(
      -borderWidth,
      -borderWidth,
      borderWidth,
      fieldHeightPixels + borderWidth * 2
    );
    this.fieldGraphics.endFill();
  }

  /**
   * Draw line of scrimmage
   * Marks where the ball is spotted - offense below, defense above
   */
  private drawLineOfScrimmage(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;
    const yPixels = (this.config.lineOfScrimmageYard || 25) * pixelsPerYard;
    const lineWidth = this.LINE_OF_SCRIMMAGE_WIDTH_YARDS * pixelsPerYard; // Scale with pixelsPerYard
    const lineColor = 0xf59e0b; // amber-500 token color

    // Draw line of scrimmage
    this.fieldGraphics.beginFill(lineColor);
    this.fieldGraphics.drawRect(
      0,
      yPixels - lineWidth / 2,
      fieldWidthPixels,
      lineWidth
    );
    this.fieldGraphics.endFill();
  }

  /**
   * Update field configuration
   */
  updateConfig(config: Partial<FieldConfig>): void {
    this.config = { ...this.config, ...config };
    this.renderField();
  }

  /**
   * Get field dimensions in pixels
   */
  getFieldDimensions() {
    return {
      x: 0,
      y: 0,
      width: this.config.width * this.coordinates.pixelsPerYard,
      height: this.config.height * this.coordinates.pixelsPerYard,
    };
  }

  /**
   * Set line of scrimmage position
   */
  public setLineOfScrimmage(yardLine: number, show: boolean = true): void {
    this.config.lineOfScrimmageYard = yardLine;
    this.config.showLineOfScrimmage = show;
    this.renderField();
  }

  /**
   * Get line of scrimmage position
   */
  public getLineOfScrimmage(): number | undefined {
    return this.config.lineOfScrimmageYard;
  }
}
