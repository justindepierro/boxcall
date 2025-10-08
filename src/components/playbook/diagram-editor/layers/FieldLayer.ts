/**
 * Football Field Rendering Layer
 * 
 * Renders the football field using Pixi Graphics with WebGL acceleration.
 * Includes yard lines, hash marks, numbers, and field markings.
 */

import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { CoordinateSystem } from '../core/CoordinateSystem';

export interface FieldConfig {
  width: number;          // Field width in yards (53.333 for NFL)
  height: number;         // Visible height in yards
  backgroundColor: number; // Field color
  lineColor: number;      // Yard line color
  hashColor: number;      // Hash mark color
  numbersColor: number;   // Number color
  showNumbers: boolean;   // Show yard numbers
  showHashes: boolean;    // Show hash marks
}

export class FieldLayer extends Container {
  private config: FieldConfig;
  private coordinates: CoordinateSystem;
  private fieldGraphics: Graphics;
  
  constructor(coordinates: CoordinateSystem, config: Partial<FieldConfig> = {}) {
    super();
    
    this.coordinates = coordinates;
    this.config = {
      width: coordinates.fieldWidth,
      height: coordinates.fieldHeight,
      backgroundColor: 0x82C91E, // Green
      lineColor: 0xFFFFFF,       // White
      hashColor: 0xFFFFFF,       // White
      numbersColor: 0xFFFFFF,    // White
      showNumbers: true,
      showHashes: true,
      ...config,
    };
    
    this.fieldGraphics = new Graphics();
    this.addChild(this.fieldGraphics);
    
    this.renderField();
  }

  /**
   * Render the complete football field
   */
  private renderField(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;
    const fieldHeightPixels = this.config.height * pixelsPerYard;
    
    // Clear previous graphics
    this.fieldGraphics.clear();
    
    // Draw field background
    this.fieldGraphics
      .rect(0, 0, fieldWidthPixels, fieldHeightPixels)
      .fill(this.config.backgroundColor);
    
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
  }

  /**
   * Draw yard lines every 5 yards
   */
  private drawYardLines(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;
    
    // Draw all lines in one stroke call for better performance
    this.fieldGraphics.setStrokeStyle({
      width: 1,
      color: this.config.lineColor,
    });
    
    // Draw line every 5 yards
    for (let yard = 0; yard <= this.config.height; yard += 5) {
      const yPixels = yard * pixelsPerYard;
      const lineWidth = (yard % 10 === 0) ? 2 : 1;
      
      this.fieldGraphics
        .setStrokeStyle({ width: lineWidth, color: this.config.lineColor })
        .moveTo(0, yPixels)
        .lineTo(fieldWidthPixels, yPixels);
    }
    
    this.fieldGraphics.stroke();
  }

  /**
   * Draw hash marks (NFL style)
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
    const hashLengthPixels = 0.5 * pixelsPerYard; // 6 inches = 0.5 feet = ~0.17 yards
    
    // Set stroke style once
    this.fieldGraphics.setStrokeStyle({ width: 1, color: this.config.hashColor });
    
    // Draw hash marks every yard
    for (let yard = 1; yard < this.config.height; yard++) {
      const yPixels = yard * pixelsPerYard;
      
      // Left hash
      this.fieldGraphics
        .moveTo(leftHashPixels - hashLengthPixels / 2, yPixels)
        .lineTo(leftHashPixels + hashLengthPixels / 2, yPixels);
      
      // Right hash
      this.fieldGraphics
        .moveTo(rightHashPixels - hashLengthPixels / 2, yPixels)
        .lineTo(rightHashPixels + hashLengthPixels / 2, yPixels);
    }
    
    // Single stroke call for all hash marks
    this.fieldGraphics.stroke();
  }

  /**
   * Draw yard numbers
   */
  private drawYardNumbers(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    
    const textStyle = new TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: 3 * pixelsPerYard, // 3 yards tall
      fill: this.config.numbersColor,
      fontWeight: 'bold',
      align: 'center',
    });
    
    // Draw numbers every 10 yards
    for (let yard = 10; yard < this.config.height; yard += 10) {
      const yPixels = yard * pixelsPerYard;
      const number = yard.toString();
      const fieldWidthPixels = this.config.width * pixelsPerYard;
      
      // Left side number
      const leftText = new Text({ text: number, style: textStyle });
      leftText.anchor.set(0.5);
      leftText.position.set(fieldWidthPixels * 0.15, yPixels);
      this.addChild(leftText);
      
      // Right side number
      const rightText = new Text({ text: number, style: textStyle });
      rightText.anchor.set(0.5);
      rightText.position.set(fieldWidthPixels * 0.85, yPixels);
      this.addChild(rightText);
    }
  }

  /**
   * Draw field sidelines
   */
  private drawSidelines(): void {
    const pixelsPerYard = this.coordinates.pixelsPerYard;
    const fieldWidthPixels = this.config.width * pixelsPerYard;
    const fieldHeightPixels = this.config.height * pixelsPerYard;
    
    // Draw border around field
    this.fieldGraphics
      .rect(0, 0, fieldWidthPixels, fieldHeightPixels)
      .stroke({ width: 3, color: this.config.lineColor });
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
}
