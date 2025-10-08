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
      const lineWidth = (yard % 10 === 0) ? 2 : 1;
      
      // Draw as a thin rectangle using v7 API
      this.fieldGraphics.beginFill(this.config.lineColor);
      this.fieldGraphics.drawRect(0, yPixels - lineWidth / 2, fieldWidthPixels, lineWidth);
      this.fieldGraphics.endFill();
    }
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
    const hashLengthPixels = 0.5 * pixelsPerYard; // 6 inches
    const hashWidth = 1;
    
    // Draw hash marks every yard using v7 API
    for (let yard = 1; yard < this.config.height; yard++) {
      const yPixels = yard * pixelsPerYard;
      
      // Left hash
      this.fieldGraphics.beginFill(this.config.hashColor);
      this.fieldGraphics.drawRect(
        leftHashPixels - hashLengthPixels / 2,
        yPixels - hashWidth / 2,
        hashLengthPixels,
        hashWidth
      );
      this.fieldGraphics.endFill();
      
      // Right hash
      this.fieldGraphics.beginFill(this.config.hashColor);
      this.fieldGraphics.drawRect(
        rightHashPixels - hashLengthPixels / 2,
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
      const leftText = new Text(number, textStyle);
      leftText.anchor.set(0.5);
      leftText.position.set(fieldWidthPixels * 0.15, yPixels);
      this.addChild(leftText);
      
      // Right side number
      const rightText = new Text(number, textStyle);
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
    const borderWidth = 3;
    
    // Draw border as 4 rectangles (top, right, bottom, left) to avoid stroke shader
    // Top
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(0, 0, fieldWidthPixels, borderWidth);
    this.fieldGraphics.endFill();
    
    // Right
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(fieldWidthPixels - borderWidth, 0, borderWidth, fieldHeightPixels);
    this.fieldGraphics.endFill();
    
    // Bottom
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(0, fieldHeightPixels - borderWidth, fieldWidthPixels, borderWidth);
    this.fieldGraphics.endFill();
    
    // Left
    this.fieldGraphics.beginFill(this.config.lineColor);
    this.fieldGraphics.drawRect(0, 0, borderWidth, fieldHeightPixels);
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
}
