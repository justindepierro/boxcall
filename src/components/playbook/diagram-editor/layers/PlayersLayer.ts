/**
 * PlayersLayer - Manages all player sprites on the field
 * 
 * Responsibilities:
 * - Add/remove/update player sprites
 * - Handle player selection (single select)
 * - Handle player dragging
 * - Maintain player z-order (selected on top)
 */

import { Container, FederatedPointerEvent } from 'pixi.js';
import { PlayerSprite } from '../sprites/PlayerSprite';
import type { Player } from '../types/Player';
import type { CoordinateSystem } from '../core/CoordinateSystem';

export interface PlayersLayerEvents {
  onPlayerSelected?: (playerId: string | null) => void;
  onPlayerMoved?: (playerId: string, x: number, y: number) => void;
  onPlayerClicked?: (playerId: string) => void;
}

export class PlayersLayer extends Container {
  private coords: CoordinateSystem;
  private sprites: Map<string, PlayerSprite> = new Map();
  private selectedPlayerId: string | null = null;
  private dragState: {
    playerId: string;
    startX: number;
    startY: number;
  } | null = null;

  // Event callbacks
  private events: PlayersLayerEvents;

  constructor(coords: CoordinateSystem, events: PlayersLayerEvents = {}) {
    super();
    this.coords = coords;
    this.events = events;
    this.label = 'PlayersLayer';
  }

  /**
   * Add a player to the layer
   */
  addPlayer(player: Player): PlayerSprite {
    // Remove existing sprite if updating
    if (this.sprites.has(player.id)) {
      this.removePlayer(player.id);
    }

    // Create new sprite
    const sprite = new PlayerSprite(player, this.coords);
    
    // Setup event handlers
    this.setupSpriteEvents(sprite);
    
    // Add to container and map
    this.addChild(sprite);
    this.sprites.set(player.id, sprite);

    return sprite;
  }

  /**
   * Remove a player from the layer
   */
  removePlayer(playerId: string): void {
    const sprite = this.sprites.get(playerId);
    if (sprite) {
      // Clear selection if this player was selected
      if (this.selectedPlayerId === playerId) {
        this.clearSelection();
      }

      // Clean up event listeners
      this.cleanupSpriteEvents(sprite);

      // Remove from container and map
      this.removeChild(sprite);
      sprite.destroy();
      this.sprites.delete(playerId);
    }
  }

  /**
   * Update a player's data
   */
  updatePlayer(playerId: string, updates: Partial<Player>): void {
    const sprite = this.sprites.get(playerId);
    if (sprite) {
      sprite.updatePlayer(updates);
    }
  }

  /**
   * Get a player sprite by ID
   */
  getPlayer(playerId: string): PlayerSprite | undefined {
    return this.sprites.get(playerId);
  }

  /**
   * Get all player sprites
   */
  getAllPlayers(): PlayerSprite[] {
    return Array.from(this.sprites.values());
  }

  /**
   * Select a player
   */
  selectPlayer(playerId: string): void {
    // Clear previous selection
    if (this.selectedPlayerId) {
      const prevSprite = this.sprites.get(this.selectedPlayerId);
      if (prevSprite) {
        prevSprite.setSelected(false);
      }
    }

    // Set new selection
    this.selectedPlayerId = playerId;
    const sprite = this.sprites.get(playerId);
    if (sprite) {
      sprite.setSelected(true);
      // Move selected player to top
      this.setChildIndex(sprite, this.children.length - 1);
    }

    // Notify
    if (this.events.onPlayerSelected) {
      this.events.onPlayerSelected(playerId);
    }
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    if (this.selectedPlayerId) {
      const sprite = this.sprites.get(this.selectedPlayerId);
      if (sprite) {
        sprite.setSelected(false);
      }
      this.selectedPlayerId = null;

      // Notify
      if (this.events.onPlayerSelected) {
        this.events.onPlayerSelected(null);
      }
    }
  }

  /**
   * Get selected player ID
   */
  getSelectedPlayerId(): string | null {
    return this.selectedPlayerId;
  }

  /**
   * Setup event handlers for a sprite
   */
  private setupSpriteEvents(sprite: PlayerSprite): void {
    // Click to select
    sprite.on('pointerdown', (event: FederatedPointerEvent) => {
      event.stopPropagation();
      
      const playerId = sprite.getId();
      
      // Select the player
      this.selectPlayer(playerId);
      
      // Start drag
      this.startDrag(sprite, event);

      // Notify click
      if (this.events.onPlayerClicked) {
        this.events.onPlayerClicked(playerId);
      }
    });

    // Enable drag
    sprite.on('pointermove', (event: FederatedPointerEvent) => {
      if (this.dragState && this.dragState.playerId === sprite.getId()) {
        this.updateDrag(sprite, event);
      }
    });

    sprite.on('pointerup', () => {
      if (this.dragState && this.dragState.playerId === sprite.getId()) {
        this.endDrag(sprite);
      }
    });

    sprite.on('pointerupoutside', () => {
      if (this.dragState && this.dragState.playerId === sprite.getId()) {
        this.endDrag(sprite);
      }
    });
  }

  /**
   * Clean up event handlers for a sprite
   */
  private cleanupSpriteEvents(sprite: PlayerSprite): void {
    sprite.off('pointerdown');
    sprite.off('pointermove');
    sprite.off('pointerup');
    sprite.off('pointerupoutside');
  }

  /**
   * Start dragging a player
   */
  private startDrag(sprite: PlayerSprite, _event: FederatedPointerEvent): void {
    const player = sprite.getPlayer();
    this.dragState = {
      playerId: player.id,
      startX: player.x,
      startY: player.y,
    };
    sprite.setDragging(true);
  }

  /**
   * Update drag position
   */
  private updateDrag(sprite: PlayerSprite, event: FederatedPointerEvent): void {
    if (!this.dragState) return;

    // DEBUG: Log all coordinate transformations
    console.group('🎯 Drag Coordinate Debug');
    
    // 1. Global position (CSS pixels from browser)
    console.log('1. Global (CSS pixels):', { x: event.global.x, y: event.global.y });
    
    // 2. Local position (pixels in this layer's space, accounting for camera transform)
    const localPos = event.getLocalPosition(this);
    console.log('2. Local (layer pixels):', { x: localPos.x, y: localPos.y });
    
    // 3. Convert to yards
    const yardPos = this.coords.pixelsToYards(localPos);
    console.log('3. Yards:', { x: yardPos.x, y: yardPos.y });

    // 4. Clamp to field bounds
    const clampedX = Math.max(0, Math.min(this.coords.fieldWidth, yardPos.x));
    const clampedY = Math.max(0, Math.min(this.coords.fieldHeight, yardPos.y));
    console.log('4. Clamped (yards):', { x: clampedX, y: clampedY });
    
    // 5. Log parent hierarchy for verification
    console.log('5. Parent chain:', this.parent?.label || this.parent?.constructor.name);
    
    console.groupEnd();

    // Update sprite position
    sprite.updatePlayer({ x: clampedX, y: clampedY });
  }

  /**
   * End dragging
   */
  private endDrag(sprite: PlayerSprite): void {
    if (!this.dragState) return;

    sprite.setDragging(false);
    
    const player = sprite.getPlayer();
    
    // Notify if position changed
    if (player.x !== this.dragState.startX || player.y !== this.dragState.startY) {
      if (this.events.onPlayerMoved) {
        this.events.onPlayerMoved(player.id, player.x, player.y);
      }
    }

    this.dragState = null;
  }

  /**
   * Clear all players
   */
  clear(): void {
    this.sprites.forEach(sprite => {
      this.cleanupSpriteEvents(sprite);
      sprite.destroy();
    });
    this.sprites.clear();
    this.selectedPlayerId = null;
    this.dragState = null;
    this.removeChildren();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clear();
    super.destroy();
  }
}
