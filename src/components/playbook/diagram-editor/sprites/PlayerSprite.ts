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
  private numberText: Text;
  private _isSelected: boolean = false;
  private _isDragging: boolean = false;

  // Visual constants
  private readonly RADIUS_YARDS = 1.0;  // Player circle radius in yards
  private readonly STROKE_WIDTH = 0.15; // Border width in yards
  private readonly SELECTION_RING_WIDTH = 0.2; // Selection ring width in yards

  constructor(player: Player, coords: CoordinateSystem) {
    super();
    
    this.player = player;
    this.coords = coords;

    // Enable interactivity
    this.eventMode = 'static';
    this.cursor = 'pointer';

    // Create graphics
    this.circle = new Graphics();
    this.selectionRing = new Graphics();
    this.numberText = new Text();

    // Add to container in order
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

    // Draw main circle
    this.circle.clear();
    this.circle.circle(0, 0, radiusPixels);
    this.circle.fill({ color: colors.fill });
    this.circle.stroke({ color: colors.stroke, width: strokePixels });

    // Draw selection ring (initially hidden)
    this.updateSelectionRing();

    // Draw jersey number
    this.updateNumberText(colors);
  }

  /**
   * Update selection ring visibility and style
   */
  private updateSelectionRing(): void {
    const radiusPixels = this.RADIUS_YARDS * this.coords.pixelsPerYard;
    const ringWidth = this.SELECTION_RING_WIDTH * this.coords.pixelsPerYard;

    this.selectionRing.clear();
    
    if (this._isSelected) {
      this.selectionRing.circle(0, 0, radiusPixels + ringWidth);
      this.selectionRing.stroke({ color: SELECTION_COLOR, width: ringWidth });
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
      this.cursor = selected ? 'move' : 'pointer';
    }
  }

  /**
   * Set dragging state
   */
  setDragging(dragging: boolean): void {
    this._isDragging = dragging;
    this.alpha = dragging ? 0.7 : 1.0;
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
    this.circle.destroy();
    this.selectionRing.destroy();
    this.numberText.destroy();
    super.destroy();
  }
}
