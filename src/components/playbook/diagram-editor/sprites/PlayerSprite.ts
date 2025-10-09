/**
 * PlayerSprite - Interactive player sprite for diagram
 * 
 * Represents a single player on the field with:
 * - Circle graphics with team colors
 * - Jersey number text
 * - Selection highlight
 * - Click and drag interactions
 */

import { Container, Graphics, Text } from 'pixi.js';
import type { Player, PlayerColors } from '../types/Player';
import { TEAM_COLORS, SELECTION_COLOR } from '../types/Player';
import type { CoordinateSystem } from '../core/CoordinateSystem';

export class PlayerSprite extends Container {
  private player: Player;
  private coords: CoordinateSystem;
  private circle: Graphics;
  private selectionRing: Graphics;
  private dropShadow: Graphics; // NEW: Drop shadow for drag effect
  private numberText: Text;
  private _isSelected: boolean = false;
  private _isDragging: boolean = false;

  // Visual constants - reduced by 40% for better field proportions
  private readonly RADIUS_YARDS = 0.6;   // Player circle radius in yards (was 1.0)
  private readonly STROKE_WIDTH = 0.09;  // Border width in yards (was 0.15)
  private readonly SELECTION_RING_WIDTH = 0.12; // Selection ring width in yards (was 0.2)
  private readonly DRAG_SCALE = 1.05;    // NEW: Subtle scale during drag
  private readonly SHADOW_OFFSET_YARDS = 0.15; // NEW: Shadow offset in yards

  constructor(player: Player, coords: CoordinateSystem) {
    super();
    
    this.player = player;
    this.coords = coords;

    // Enable interactivity (v7.2+ uses eventMode)
    this.eventMode = 'static';
    this.cursor = 'grab'; // Changed from 'pointer' to 'grab'

    // Create graphics
    this.dropShadow = new Graphics(); // Initialize drop shadow
    this.circle = new Graphics();
    this.selectionRing = new Graphics();
    this.numberText = new Text();

    // Add to container in order (shadow first, on bottom)
    this.addChild(this.dropShadow);
    this.addChild(this.selectionRing);
    this.addChild(this.circle);
    this.addChild(this.numberText);

    // Initial render
    this.updateGraphics();
    this.updatePosition();
  }

  /**
   * Update player graphics (colors, jersey number)
   */
  private updateGraphics(): void {
    const colors = this.getColors();
    const radiusPixels = this.RADIUS_YARDS * this.coords.pixelsPerYard;
    const strokePixels = this.STROKE_WIDTH * this.coords.pixelsPerYard;

    // Draw main shape (circle for regular, square for center)
    this.circle.clear();
    this.circle.lineStyle(strokePixels, colors.stroke);
    this.circle.beginFill(colors.fill);
    
    const isCenter = this.player.position === 'center';
    if (isCenter) {
      // Draw square/rectangle for center position
      const size = radiusPixels * 1.6; // Slightly wider than circle diameter
      this.circle.drawRect(-size / 2, -size / 2, size, size);
    } else {
      // Draw circle for regular players
      this.circle.drawCircle(0, 0, radiusPixels);
    }
    
    this.circle.endFill();

    // Draw selection ring (initially hidden)
    this.updateSelectionRing();

    // Draw jersey number
    this.updateNumberText(colors);
  }

  /**
   * Update selection ring visibility and style with team color glow
   */
  private updateSelectionRing(): void {
    const radiusPixels = this.RADIUS_YARDS * this.coords.pixelsPerYard;
    const ringWidth = this.SELECTION_RING_WIDTH * this.coords.pixelsPerYard;

    this.selectionRing.clear();
    
    if (this._isSelected) {
      const colors = this.getColors();
      const isCenter = this.player.position === 'center';
      
      if (isCenter) {
        // Draw rectangular selection for center
        const size = radiusPixels * 1.6;
        const outerSize = size + ringWidth * 4;
        
        // Draw outer glow with team color (subtle)
        this.selectionRing.beginFill(colors.fill, 0.15);
        this.selectionRing.drawRect(-outerSize / 2, -outerSize / 2, outerSize, outerSize);
        this.selectionRing.endFill();
        
        // Draw selection border (bright)
        this.selectionRing.lineStyle(ringWidth, SELECTION_COLOR);
        this.selectionRing.drawRect(-size / 2 - ringWidth, -size / 2 - ringWidth, size + ringWidth * 2, size + ringWidth * 2);
      } else {
        // Draw circular selection for regular players
        // Draw outer glow with team color (subtle)
        this.selectionRing.beginFill(colors.fill, 0.15);
        this.selectionRing.drawCircle(0, 0, radiusPixels + ringWidth * 2);
        this.selectionRing.endFill();
        
        // Draw selection ring (bright)
        this.selectionRing.lineStyle(ringWidth, SELECTION_COLOR);
        this.selectionRing.drawCircle(0, 0, radiusPixels + ringWidth);
      }
    }
  }

  /**
   * Update jersey number text
   */
  private updateNumberText(colors: PlayerColors): void {
    const fontSize = this.RADIUS_YARDS * this.coords.pixelsPerYard * 0.8;

    this.numberText.text = this.player.jerseyNumber;
    this.numberText.style = {
      fontFamily: 'Arial, sans-serif',
      fontSize: fontSize,
      fontWeight: 'bold',
      fill: colors.text,
      align: 'center',
    };
    
    // Center the text
    this.numberText.anchor.set(0.5);
  }

  /**
   * Get colors for this player
   */
  private getColors(): PlayerColors {
    if (this.player.color) {
      // Custom color with automatic contrasting stroke
      return {
        fill: this.player.color,
        stroke: this.darkenColor(this.player.color, 0.3),
        text: 0xFFFFFF,
      };
    }
    return TEAM_COLORS[this.player.team];
  }

  /**
   * Darken a color by a factor (0-1)
   */
  private darkenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = color & 0xFF;
    
    const darkR = Math.floor(r * (1 - factor));
    const darkG = Math.floor(g * (1 - factor));
    const darkB = Math.floor(b * (1 - factor));
    
    return (darkR << 16) | (darkG << 8) | darkB;
  }

  /**
   * Update sprite position from player data
   */
  updatePosition(): void {
    const pos = this.coords.yardsToPixels({ x: this.player.x, y: this.player.y });
    this.position.set(pos.x, pos.y);
  }

  /**
   * Update player data
   */
  updatePlayer(player: Partial<Player>): void {
    this.player = { ...this.player, ...player };
    
    if (player.x !== undefined || player.y !== undefined) {
      this.updatePosition();
    }
    
    if (player.jerseyNumber !== undefined || player.team !== undefined || player.color !== undefined) {
      this.updateGraphics();
    }
  }

  /**
   * Set selection state
   */
  setSelected(selected: boolean): void {
    if (this._isSelected !== selected) {
      this._isSelected = selected;
      this.updateSelectionRing();
      // Update cursor: selected = grab, not selected = pointer
      this.cursor = selected ? 'grab' : 'pointer';
    }
  }

  /**
   * Set dragging state with visual feedback
   */
  setDragging(dragging: boolean): void {
    if (this._isDragging !== dragging) {
      this._isDragging = dragging;
      
      if (dragging) {
        // DRAGGING EFFECTS:
        // 1. Change cursor to grabbing
        this.cursor = 'grabbing';
        
        // 2. Subtle scale up (1.05x)
        this.scale.set(this.DRAG_SCALE);
        
        // 3. Draw drop shadow
        this.updateDropShadow(true);
        
        // 4. Slight transparency
        this.alpha = 0.9;
      } else {
        // RELEASE EFFECTS: Reset to normal
        this.cursor = this._isSelected ? 'grab' : 'pointer';
        this.scale.set(1.0);
        this.updateDropShadow(false);
        this.alpha = 1.0;
      }
    }
  }

  /**
   * Update drop shadow visibility and position
   */
  private updateDropShadow(visible: boolean): void {
    const radiusPixels = this.RADIUS_YARDS * this.coords.pixelsPerYard;
    const shadowOffset = this.SHADOW_OFFSET_YARDS * this.coords.pixelsPerYard;

    this.dropShadow.clear();
    
    if (visible) {
      // Draw shadow as a semi-transparent dark circle, offset down-right
      this.dropShadow.beginFill(0x000000, 0.25);
      this.dropShadow.drawCircle(shadowOffset, shadowOffset, radiusPixels);
      this.dropShadow.endFill();
    }
  }

  /**
   * Get player data
   */
  getPlayer(): Player {
    return { ...this.player };
  }

  /**
   * Get player ID
   */
  getId(): string {
    return this.player.id;
  }

  /**
   * Check if selected
   */
  isSelected(): boolean {
    return this._isSelected;
  }

  /**
   * Check if dragging
   */
  isDragging(): boolean {
    return this._isDragging;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.dropShadow.destroy();
    this.circle.destroy();
    this.selectionRing.destroy();
    this.numberText.destroy();
    super.destroy();
  }
}
