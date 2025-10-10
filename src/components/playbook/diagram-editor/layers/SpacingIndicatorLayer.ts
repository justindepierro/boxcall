/**
 * Spacing Indicator Layer
 * 
 * Displays a draggable horizontal line that shows uniform spacing between players
 * on the X-axis. When players are aligned on the same Y-coordinate, sh    // Draw handles on both ends of the line
    const handleSize = this.HANDLE_SIZE_YARDS * this.coords.pixelsPerYard;
    this.graphics.beginFill(this.HANDLE_COLOR);
    this.graphics.drawRect(-handleSize / 2, lineY - handleSize / 2, handleSize, handleSize);
    this.graphics.drawRect(fieldWidthPixels - handleSize / 2, lineY - handleSize / 2, handleSize, handleSize);
    this.graphics.endFill();

    // Calculate and display spacings
    const spacingData = this.calculateSpacing();
    if (!spacingData) {
      // No aligned players - show helper text
      const helperText = new Text('← Drag line to measure player spacing →', {
        fontSize: this.TEXT_SIZE_YARDS * this.coords.pixelsPerYard,
        fill: this.TEXT_COLOR,
        fontFamily: 'Arial',
      });cing distance between them.
 */

import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import type { CoordinateSystem } from '../core/CoordinateSystem';
import type { Player } from '../types/Player';
import { UI_ELEMENTS, getClampedFontSize } from '../../../../design-tokens/field-dimensions';

export class SpacingIndicatorLayer extends Container {
  private coords: CoordinateSystem;
  private graphics: Graphics;
  private indicatorY: number = 17.5; // Default Y position in yards (middle of field)
  private isDragging: boolean = false;
  private isVisible: boolean = false;
  private players: Player[] = [];
  
  // UI elements
  private spacingTexts: Text[] = [];
  
  // Visual constants - Imported from design tokens for consistency
  private readonly LINE_COLOR = 0x4A90E2; // Blue
  private readonly LINE_ALPHA = 0.8;
  private readonly LINE_WIDTH_YARDS = UI_ELEMENTS.SPACING_LINE_YARDS;
  private readonly HANDLE_SIZE_YARDS = UI_ELEMENTS.SPACING_HANDLE_YARDS;
  private readonly HANDLE_COLOR = 0x4A90E2;
  private readonly TEXT_COLOR = 0x333333;
  private readonly TEXT_BACKGROUND = 0xFFFFFF;
  private readonly TEXT_SIZE_YARDS = 0.35; // Base size for getClampedFontSize
  private readonly TEXT_SIZE_SMALL_YARDS = 0.3; // Base size for small text
  private readonly TOLERANCE_YARDS = 2.0; // Players within 2 yards on Y-axis are considered "on the line"

  constructor(coords: CoordinateSystem) {
    super();
    this.coords = coords;
    this.graphics = new Graphics();
    this.addChild(this.graphics);
    
    // Make layer interactive for dragging
    this.eventMode = 'static';
    this.cursor = 'ns-resize';
    
    this.setupEvents();
  }

  /**
   * Setup drag events for the indicator line
   */
  private setupEvents(): void {
    this.on('pointerdown', (event: FederatedPointerEvent) => {
      if (!this.isVisible) return;
      
      const localPos = event.getLocalPosition(this.parent);
      const localY = localPos.y;
      const lineY = this.indicatorY * this.coords.pixelsPerYard;
      
      // Check if click is near the line (within 20 pixels)
      if (Math.abs(localY - lineY) < 20) {
        this.isDragging = true;
        event.stopPropagation();
      }
    });

    this.on('pointermove', (event: FederatedPointerEvent) => {
      if (!this.isDragging) return;
      
      const localPos = event.getLocalPosition(this.parent);
      const localY = localPos.y;
      this.indicatorY = Math.max(0, Math.min(this.coords.fieldHeight, localY / this.coords.pixelsPerYard));
      this.renderIndicator();
      event.stopPropagation();
    });

    this.on('pointerup', () => {
      this.isDragging = false;
    });

    this.on('pointerupoutside', () => {
      this.isDragging = false;
    });
  }

  /**
   * Set the Y position of the indicator line
   */
  setIndicatorY(y: number): void {
    this.indicatorY = Math.max(0, Math.min(this.coords.fieldHeight, y));
    this.renderIndicator();
  }

  /**
   * Update the player list for spacing calculations
   */
  updatePlayers(players: Player[]): void {
    this.players = players;
    if (this.isVisible) {
      this.renderIndicator();
    }
  }

  /**
   * Show the spacing indicator
   */
  show(): void {
    this.isVisible = true;
    this.renderIndicator();
  }

  /**
   * Hide the spacing indicator
   */
  hide(): void {
    this.isVisible = false;
    this.graphics.clear();
    this.clearTexts();
  }

  /**
   * Toggle visibility
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Check if the indicator is visible
   */
  isShowing(): boolean {
    return this.isVisible;
  }

  /**
   * Clear all text labels
   */
  private clearTexts(): void {
    this.spacingTexts.forEach(text => text.destroy());
    this.spacingTexts = [];
  }

  /**
   * Calculate spacing between players aligned on the X-axis near the indicator line
   */
  private calculateSpacing(): { players: Player[]; spacings: number[] } | null {
    // Find players near the indicator line (within tolerance)
    const alignedPlayers = this.players.filter(
      p => Math.abs(p.y - this.indicatorY) <= this.TOLERANCE_YARDS
    );

    if (alignedPlayers.length < 2) {
      return null;
    }

    // Sort players by X position (left to right)
    const sorted = [...alignedPlayers].sort((a, b) => a.x - b.x);

    // Calculate spacings between consecutive players
    const spacings: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      spacings.push(sorted[i + 1].x - sorted[i].x);
    }

    return { players: sorted, spacings };
  }

  /**
   * Render the spacing indicator and measurements
   */
  private renderIndicator(): void {
    this.graphics.clear();
    this.clearTexts();

    if (!this.isVisible) return;

    const lineY = this.indicatorY * this.coords.pixelsPerYard;
    const lineWidth = this.LINE_WIDTH_YARDS * this.coords.pixelsPerYard;
    const fieldWidthPixels = this.coords.fieldWidth * this.coords.pixelsPerYard;
    const handleSize = this.HANDLE_SIZE_YARDS * this.coords.pixelsPerYard;

    // Draw the main horizontal line
    this.graphics.lineStyle(lineWidth, this.LINE_COLOR, this.LINE_ALPHA);
    this.graphics.moveTo(0, lineY);
    this.graphics.lineTo(fieldWidthPixels, lineY);

    // Draw drag handles at the ends
    this.graphics.beginFill(this.HANDLE_COLOR, 1.0);
    this.graphics.drawRect(-handleSize / 2, lineY - handleSize / 2, handleSize, handleSize);
    this.graphics.drawRect(fieldWidthPixels - handleSize / 2, lineY - handleSize / 2, handleSize, handleSize);
    this.graphics.endFill();

    // Calculate and display spacings
    const spacingData = this.calculateSpacing();
    if (!spacingData) {
      // No aligned players - show helper text
      const helperText = new Text('← Drag line to measure player spacing →', {
        fontSize: getClampedFontSize(this.TEXT_SIZE_YARDS, this.coords.pixelsPerYard),
        fill: this.TEXT_COLOR,
        fontFamily: 'Arial',
      });
      helperText.x = fieldWidthPixels / 2 - helperText.width / 2;
      helperText.y = lineY + 10;
      this.addChild(helperText);
      this.spacingTexts.push(helperText);
      return;
    }

    const { players: sorted, spacings } = spacingData;

    // Check if spacing is uniform
    const avgSpacing = spacings.reduce((sum, s) => sum + s, 0) / spacings.length;
    const isUniform = spacings.every(s => Math.abs(s - avgSpacing) < 0.5);

    // Draw spacing measurements between each pair of players
    spacings.forEach((spacing, index) => {
      const player1 = sorted[index];
      const player2 = sorted[index + 1];
      
      const x1 = player1.x * this.coords.pixelsPerYard;
      const x2 = player2.x * this.coords.pixelsPerYard;
      const midX = (x1 + x2) / 2;

      // Draw connector lines from players to the indicator line
      const connectorWidth = 0.025 * this.coords.pixelsPerYard; // Scale connector line width
      this.graphics.lineStyle(connectorWidth, this.LINE_COLOR, 0.4);
      this.graphics.moveTo(x1, player1.y * this.coords.pixelsPerYard);
      this.graphics.lineTo(x1, lineY);
      this.graphics.moveTo(x2, player2.y * this.coords.pixelsPerYard);
      this.graphics.lineTo(x2, lineY);

      // Draw measurement ticks
      const tickHeight = 0.2 * this.coords.pixelsPerYard; // Scale tick height
      const tickWidth = 0.05 * this.coords.pixelsPerYard; // Scale tick width
      this.graphics.lineStyle(tickWidth, this.LINE_COLOR, 0.8);
      this.graphics.moveTo(x1, lineY - tickHeight);
      this.graphics.lineTo(x1, lineY + tickHeight);
      this.graphics.moveTo(x2, lineY - tickHeight);
      this.graphics.lineTo(x2, lineY + tickHeight);

      // Create spacing text label
      const spacingText = new Text(`${spacing.toFixed(1)} yd`, {
        fontSize: getClampedFontSize(this.TEXT_SIZE_SMALL_YARDS, this.coords.pixelsPerYard),
        fill: isUniform ? 0x00AA00 : this.TEXT_COLOR, // Green if uniform
        fontFamily: 'Arial',
        fontWeight: isUniform ? 'bold' : 'normal',
      });

      // Background for text
      const padding = 4;
      const bgWidth = spacingText.width + padding * 2;
      const bgHeight = spacingText.height + padding * 2;
      this.graphics.beginFill(this.TEXT_BACKGROUND, 0.9);
      this.graphics.drawRoundedRect(
        midX - bgWidth / 2,
        lineY - bgHeight - 5,
        bgWidth,
        bgHeight,
        4
      );
      this.graphics.endFill();

      spacingText.x = midX - spacingText.width / 2;
      spacingText.y = lineY - bgHeight - 3;
      this.addChild(spacingText);
      this.spacingTexts.push(spacingText);
    });

    // Show overall status
    if (isUniform && spacings.length > 0) {
      const statusText = new Text(`✓ Uniform spacing: ${avgSpacing.toFixed(1)} yards`, {
        fontSize: getClampedFontSize(this.TEXT_SIZE_YARDS, this.coords.pixelsPerYard),
        fill: 0x00AA00,
        fontFamily: 'Arial',
        fontWeight: 'bold',
      });
      const statusBgWidth = statusText.width + 16;
      const statusBgHeight = statusText.height + 8;
      this.graphics.beginFill(0xFFFFFF, 0.95);
      this.graphics.drawRoundedRect(
        fieldWidthPixels / 2 - statusBgWidth / 2,
        lineY + 20,
        statusBgWidth,
        statusBgHeight,
        6
      );
      this.graphics.endFill();

      statusText.x = fieldWidthPixels / 2 - statusText.width / 2;
      statusText.y = lineY + 24;
      this.addChild(statusText);
      this.spacingTexts.push(statusText);
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.graphics.clear();
    this.clearTexts();
    super.destroy({ children: true });
  }
}
