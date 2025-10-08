/**
 * Alignment Guides Layer
 * 
 * Renders pink/magenta alignment guides during player drag operations.
 * Shows when players align to each other's snap points.
 */

import { Container, Graphics } from 'pixi.js';
import type { CoordinateSystem } from '../core/CoordinateSystem';
import type { AlignmentGuide } from '../utils/alignmentGuides';

export class AlignmentGuidesLayer extends Container {
  private coords: CoordinateSystem;
  private graphics: Graphics;
  private currentGuides: AlignmentGuide[] = [];

  // Visual constants
  private readonly GUIDE_COLOR = 0xFF00FF; // Magenta
  private readonly GUIDE_ALPHA = 0.5; // More subtle/transparent
  private readonly GUIDE_WIDTH_YARDS = 0.05; // Thin lines

  constructor(coords: CoordinateSystem) {
    super();
    this.coords = coords;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
  }

  /**
   * Show alignment guides
   */
  showGuides(guides: AlignmentGuide[]): void {
    this.currentGuides = guides;
    this.renderGuides();
  }

  /**
   * Hide all guides
   */
  hideGuides(): void {
    this.currentGuides = [];
    this.renderGuides();
  }

  /**
   * Render the current guides
   */
  private renderGuides(): void {
    this.graphics.clear();

    if (this.currentGuides.length === 0) return;

    const lineWidth = this.GUIDE_WIDTH_YARDS * this.coords.pixelsPerYard;
    const fieldWidthPixels = this.coords.fieldWidth * this.coords.pixelsPerYard;
    const fieldHeightPixels = this.coords.fieldHeight * this.coords.pixelsPerYard;

    // Group guides by color for batching
    const guidesByColor = new Map<number, AlignmentGuide[]>();
    for (const guide of this.currentGuides) {
      const color = guide.color || this.GUIDE_COLOR;
      if (!guidesByColor.has(color)) {
        guidesByColor.set(color, []);
      }
      guidesByColor.get(color)!.push(guide);
    }

    // Draw each color group
    guidesByColor.forEach((guides, color) => {
      this.graphics.lineStyle(lineWidth, color, this.GUIDE_ALPHA);

      for (const guide of guides) {
        if (guide.type === 'vertical') {
          // Vertical line (spans full height)
          const xPixels = guide.position * this.coords.pixelsPerYard;
          this.graphics.moveTo(xPixels, 0);
          this.graphics.lineTo(xPixels, fieldHeightPixels);
        } else {
          // Horizontal line (spans full width)
          const yPixels = guide.position * this.coords.pixelsPerYard;
          this.graphics.moveTo(0, yPixels);
          this.graphics.lineTo(fieldWidthPixels, yPixels);
        }
      }
    });
  }

  /**
   * Get current guide count (for debugging)
   */
  getGuideCount(): number {
    return this.currentGuides.length;
  }

  /**
   * Clear and destroy
   */
  destroy(): void {
    this.graphics.clear();
    super.destroy({ children: true });
  }
}
