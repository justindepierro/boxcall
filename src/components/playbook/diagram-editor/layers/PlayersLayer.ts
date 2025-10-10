/**
 * PlayersLayer - Manages all player sprites on the field
 *
 * Responsibilities:
 * - Add/remove/update player sprites
 * - Handle player selection (single select)
 * - Handle player dragging
 * - Maintain player z-order (selected on top)
 */

import { Container, FederatedPointerEvent, Rectangle } from "pixi.js";
import { PlayerSprite } from "../sprites/PlayerSprite";
import type { Player } from "../types/Player";
import type { CoordinateSystem } from "../core/CoordinateSystem";
import { validatePlayerId, validatePlayerPosition } from "../utils/validation";
import { findAlignmentGuides } from "../utils/alignmentGuides";
import { applySnapToFeatures } from "../utils/snapToFeatures";
import { applySmartSnap } from "../utils/smartSnap";
import type { AlignmentGuidesLayer } from "./AlignmentGuidesLayer";

export interface PlayersLayerEvents {
  onPlayerSelected?: (playerId: string | null) => void;
  onPlayerMoved?: (playerId: string, x: number, y: number) => void;
  onPlayerClicked?: (playerId: string) => void;
}

export class PlayersLayer extends Container {
  private coords: CoordinateSystem;
  private sprites: Map<string, PlayerSprite> = new Map();
  private selectedPlayerIds: Set<string> = new Set(); // Changed from single ID to Set
  private dragState: {
    playerIds: string[]; // Support dragging multiple players
    startPositions: Map<string, { x: number; y: number }>; // Track each player's start position
  } | null = null;

  // Event callbacks
  private events: PlayersLayerEvents;

  // Alignment guides layer reference (optional, set by PixiApp)
  private alignmentGuidesLayer: AlignmentGuidesLayer | null = null;

  // Performance: throttle drag updates with requestAnimationFrame
  private dragUpdateScheduled: boolean = false;
  private pendingDragEvent: {
    sprite: PlayerSprite;
    event: FederatedPointerEvent;
  } | null = null;

  // Bounds feedback: track when player hits boundary
  private boundsHitTimeout: ReturnType<typeof setTimeout> | null = null;

  // Track last dropped player position for smart placement
  private lastDroppedPosition: { x: number; y: number } | null = null;

  constructor(coords: CoordinateSystem, events: PlayersLayerEvents = {}) {
    super();
    this.coords = coords;
    this.events = events;

    // Make layer interactive and cover the entire field area for drag events
    // Use 'dynamic' to capture all pointer events even when cursor is outside children
    this.eventMode = "dynamic";
    this.hitArea = new Rectangle(
      0,
      0,
      coords.fieldWidth * coords.pixelsPerYard,
      coords.fieldHeight * coords.pixelsPerYard
    );
    // Note: v7 doesn't have .label property
  }

  /**
   * Set the alignment guides layer reference
   */
  setAlignmentGuidesLayer(layer: AlignmentGuidesLayer): void {
    this.alignmentGuidesLayer = layer;
  }

  /**
   * Add a player to the layer
   */
  addPlayer(player: Player): PlayerSprite {
    // Validate player data
    validatePlayerId(player.id);
    validatePlayerPosition(player.x, player.y);

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
    // Validate player ID
    validatePlayerId(playerId);

    const sprite = this.sprites.get(playerId);
    if (sprite) {
      // Clear selection if this player was selected
      if (this.selectedPlayerIds.has(playerId)) {
        this.deselectPlayer(playerId);
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
    // Validate player ID
    validatePlayerId(playerId);

    // Validate position if being updated
    if (updates.x !== undefined || updates.y !== undefined) {
      const sprite = this.sprites.get(playerId);
      if (sprite) {
        const currentPlayer = sprite.getPlayer();
        const x = updates.x ?? currentPlayer.x;
        const y = updates.y ?? currentPlayer.y;
        validatePlayerPosition(x, y);
      }
    }

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
   * Select a player (supports multi-select with addToSelection parameter)
   */
  selectPlayer(playerId: string, addToSelection: boolean = false): void {
    // Validate player ID
    validatePlayerId(playerId);

    // Clear previous selection if not adding
    if (!addToSelection) {
      this.clearSelection();
    }

    // Add to selection
    this.selectedPlayerIds.add(playerId);
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
   * Deselect a specific player
   */
  deselectPlayer(playerId: string): void {
    if (this.selectedPlayerIds.has(playerId)) {
      const sprite = this.sprites.get(playerId);
      if (sprite) {
        sprite.setSelected(false);
      }
      this.selectedPlayerIds.delete(playerId);
    }
  }

  /**
   * Select all offensive players at once
   */
  selectAllOffensivePlayers(): void {
    this.clearSelection();

    let count = 0;
    this.sprites.forEach((sprite) => {
      const player = sprite.getPlayer();
      if (player.team === "offense") {
        this.selectPlayer(player.id, true); // Add to selection
        count++;
      }
    });

    console.log(`✅ Selected all ${count} offensive players`);
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedPlayerIds.forEach((playerId) => {
      const sprite = this.sprites.get(playerId);
      if (sprite) {
        sprite.setSelected(false);
      }
    });
    this.selectedPlayerIds.clear();

    // Notify
    if (this.events.onPlayerSelected) {
      this.events.onPlayerSelected(null);
    }
  }

  /**
   * Get all selected player IDs
   */
  getSelectedPlayerIds(): string[] {
    return Array.from(this.selectedPlayerIds);
  }

  /**
   * Check if a player is selected
   */
  isPlayerSelected(playerId: string): boolean {
    return this.selectedPlayerIds.has(playerId);
  }

  /**
   * Setup event handlers for a sprite
   */
  private setupSpriteEvents(sprite: PlayerSprite): void {
    // Make sprite interactive for pointer events
    sprite.eventMode = "static";
    sprite.cursor = "pointer";

    // Track double-click for center players
    let lastClickTime = 0;
    const DOUBLE_CLICK_THRESHOLD = 300; // milliseconds

    // Click to select and start drag
    sprite.on("pointerdown", (event: FederatedPointerEvent) => {
      event.stopPropagation();

      const playerId = sprite.getId();
      const player = sprite.getPlayer();
      const isShiftHeld = event.shiftKey;
      const isAlreadySelected = this.selectedPlayerIds.has(playerId);

      // Check for double-click on center
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;
      lastClickTime = currentTime;

      if (
        player.position === "center" &&
        player.team === "offense" &&
        timeSinceLastClick < DOUBLE_CLICK_THRESHOLD
      ) {
        // Double-click detected on center - select all offensive players!
        console.log(
          "🎯 Double-click detected on center! Selecting all offensive players..."
        );
        event.stopPropagation();
        this.selectAllOffensivePlayers();
        return; // Skip normal click handling
      }

      // Multi-select with Shift, or toggle selection if already selected
      if (isShiftHeld) {
        if (isAlreadySelected) {
          this.deselectPlayer(playerId);
        } else {
          this.selectPlayer(playerId, true); // Add to selection
        }
      } else {
        // If clicking on a player that's already part of a multi-selection,
        // keep the group selected to enable group dragging
        if (!isAlreadySelected || this.selectedPlayerIds.size === 1) {
          // Clear selection and select only this player
          this.selectPlayer(playerId, false);
        }
        // Otherwise, keep the existing selection (player is already selected)
      }

      // Start drag for all selected players
      this.startDrag(sprite, event);

      // Notify click
      if (this.events.onPlayerClicked) {
        this.events.onPlayerClicked(playerId);
      }
    });
  }

  /**
   * Clean up event handlers for a sprite
   */
  private cleanupSpriteEvents(sprite: PlayerSprite): void {
    sprite.off("pointerdown");
  }

  /**
   * Global drag move handler - listens on the entire layer
   */
  private onDragMove = (event: FederatedPointerEvent): void => {
    if (!this.dragState) return;

    // Get the main dragged sprite
    const draggedSprite = this.sprites.get(this.dragState.playerIds[0]);
    if (!draggedSprite) return;

    // Store the latest event
    this.pendingDragEvent = { sprite: draggedSprite, event };

    // Schedule update if not already scheduled
    if (!this.dragUpdateScheduled) {
      this.dragUpdateScheduled = true;
      requestAnimationFrame(() => {
        if (this.pendingDragEvent) {
          this.updateDrag(
            this.pendingDragEvent.sprite,
            this.pendingDragEvent.event
          );
          this.pendingDragEvent = null;
        }
        this.dragUpdateScheduled = false;
      });
    }
  };

  /**
   * Global drag end handler - listens on the entire layer
   */
  private onDragEnd = (): void => {
    if (!this.dragState) return;

    const draggedSprite = this.sprites.get(this.dragState.playerIds[0]);
    if (draggedSprite) {
      this.endDrag(draggedSprite);
    }
  };

  /**
   * Start dragging player(s)
   */
  private startDrag(sprite: PlayerSprite, _event: FederatedPointerEvent): void {
    // Get all selected players (or just this one if not selected)
    const playerIds =
      this.selectedPlayerIds.size > 0
        ? Array.from(this.selectedPlayerIds)
        : [sprite.getId()];

    // Store start positions for all players being dragged
    const startPositions = new Map<string, { x: number; y: number }>();
    playerIds.forEach((id) => {
      const s = this.sprites.get(id);
      if (s) {
        const player = s.getPlayer();
        startPositions.set(id, { x: player.x, y: player.y });
        s.setDragging(true);
      }
    });

    this.dragState = {
      playerIds,
      startPositions,
    };

    // Attach global drag event listeners to this layer
    // This ensures drag continues even when cursor moves off the sprite
    this.on("pointermove", this.onDragMove);
    this.on("pointerup", this.onDragEnd);
    this.on("pointerupoutside", this.onDragEnd);
  }

  /**
   * Update drag position - moves all selected players together with alignment guides
   */
  private updateDrag(
    draggedSprite: PlayerSprite,
    event: FederatedPointerEvent
  ): void {
    if (!this.dragState) return;

    const draggedPlayerId = draggedSprite.getId();
    const startPos = this.dragState.startPositions.get(draggedPlayerId);
    if (!startPos) return;

    // Get local position (pixels in this layer's space, accounting for camera transform)
    const localPos = event.getLocalPosition(this);

    // Convert to yards
    const yardPos = this.coords.pixelsToYards(localPos);

    // Calculate desired position
    let targetX = yardPos.x;
    let targetY = yardPos.y;

    // Check if Alt/Option key is held for snap-to-features
    const snapToFeaturesEnabled = event.altKey;

    // Apply snap-to-features first (yard lines, hash marks)
    if (snapToFeaturesEnabled) {
      const snapResult = applySnapToFeatures(
        targetX,
        targetY,
        this.coords.fieldWidth,
        this.coords.fieldHeight,
        true
      );
      targetX = snapResult.x;
      targetY = snapResult.y;

      if (snapResult.snapped) {
        console.log(
          `🎯 Snapped to: ${snapResult.targets.map((t) => t.label).join(", ")}`
        );
      }
    }

    // Apply alignment snapping if guides layer is available (takes precedence over snap-to-features)
    if (this.alignmentGuidesLayer) {
      // Get all other players for alignment checking
      const otherPlayers = Array.from(this.sprites.values())
        .filter((s) => s.getId() !== draggedPlayerId)
        .map((s) => {
          const player = s.getPlayer();
          return {
            id: player.id,
            x: player.x,
            y: player.y,
            radius: 0.6, // Match PlayerSprite RADIUS_YARDS
          };
        });

      // Find alignment guides and snap position
      const snapResult = findAlignmentGuides(
        draggedPlayerId,
        targetX,
        targetY,
        0.6, // Match PlayerSprite RADIUS_YARDS
        otherPlayers,
        0.05 // 0.05 yard snap threshold (very small for minimal stickiness)
      );

      // Show guides
      this.alignmentGuidesLayer.showGuides(snapResult.guides);

      // Apply snapping (alignment guides override snap-to-features)
      targetX = snapResult.x;
      targetY = snapResult.y;
    }

    // Calculate delta from start position (using potentially snapped target)
    const deltaX = targetX - startPos.x;
    const deltaY = targetY - startPos.y;

    // Get current positions of all players being dragged
    const draggedPlayers = this.dragState.playerIds
      .map((id) => {
        const sprite = this.sprites.get(id);
        const playerStartPos = this.dragState!.startPositions.get(id);
        if (!sprite || !playerStartPos) return null;

        return {
          ...sprite.getPlayer(),
          x: playerStartPos.x + deltaX,
          y: playerStartPos.y + deltaY,
        };
      })
      .filter((p): p is Player => p !== null);

    // Apply smart snap if dragging multiple players AND holding Shift key
    // Shift+Drag = Auto-align formation with equal spacing
    const smartSnapResult =
      draggedPlayers.length >= 3 && event.shiftKey
        ? applySmartSnap(draggedPlayers, 1.0, 1.5)
        : { snapped: false, adjustments: new Map(), snapType: "none" as const };

    if (smartSnapResult.snapped) {
      console.log(`✨ Smart snap applied: ${smartSnapResult.snapType}`);
    }

    // Move all selected players by the same delta (with smart snap adjustments)
    let anyHitBounds = false;
    this.dragState.playerIds.forEach((playerId) => {
      const sprite = this.sprites.get(playerId);
      const playerStartPos = this.dragState!.startPositions.get(playerId);
      if (!sprite || !playerStartPos) return;

      // Calculate new position
      let newX = playerStartPos.x + deltaX;
      let newY = playerStartPos.y + deltaY;

      // Apply smart snap adjustment if available
      const snapAdjustment = smartSnapResult.adjustments.get(playerId);
      if (snapAdjustment) {
        newX = snapAdjustment.x;
        newY = snapAdjustment.y;
      }

      // Clamp to field bounds
      const clampedX = Math.max(0, Math.min(this.coords.fieldWidth, newX));
      const clampedY = Math.max(0, Math.min(this.coords.fieldHeight, newY));

      // Check if clamping occurred
      if (clampedX !== newX || clampedY !== newY) {
        anyHitBounds = true;
      }

      // Validate position before updating
      validatePlayerPosition(clampedX, clampedY);

      // Update sprite position
      sprite.updatePlayer({ x: clampedX, y: clampedY });
    });

    // Show feedback if any player hit bounds
    if (anyHitBounds) {
      this.showBoundsFeedback(draggedSprite);
    }
  }

  /**
   * Show visual feedback when player hits field bounds
   */
  private showBoundsFeedback(sprite: PlayerSprite): void {
    // Clear any existing timeout
    if (this.boundsHitTimeout) {
      clearTimeout(this.boundsHitTimeout);
    }

    // Add subtle red tint to indicate bounds hit
    sprite.alpha = 0.7;

    // Reset after brief delay
    this.boundsHitTimeout = setTimeout(() => {
      sprite.alpha = 1.0;
      this.boundsHitTimeout = null;
    }, 150);
  }

  /**
   * End dragging - finalize all selected players' movements
   */
  private endDrag(_sprite: PlayerSprite): void {
    if (!this.dragState) return;

    // Hide alignment guides
    this.alignmentGuidesLayer?.hideGuides();

    // Remove global drag event listeners
    this.off("pointermove", this.onDragMove);
    this.off("pointerup", this.onDragEnd);
    this.off("pointerupoutside", this.onDragEnd);

    // End drag state for all players and notify of changes
    this.dragState.playerIds.forEach((playerId) => {
      const playerSprite = this.sprites.get(playerId);
      if (!playerSprite) return;

      playerSprite.setDragging(false);

      const player = playerSprite.getPlayer();
      const startPos = this.dragState!.startPositions.get(playerId);

      // Notify if this player's position changed
      if (startPos && (player.x !== startPos.x || player.y !== startPos.y)) {
        if (this.events.onPlayerMoved) {
          this.events.onPlayerMoved(player.id, player.x, player.y);
        }
      }
    });

    // Store the last dropped position (use the first player's position)
    if (this.dragState.playerIds.length > 0) {
      const firstPlayerId = this.dragState.playerIds[0];
      const firstSprite = this.sprites.get(firstPlayerId);
      if (firstSprite) {
        const player = firstSprite.getPlayer();
        this.lastDroppedPosition = { x: player.x, y: player.y };
      }
    }

    this.dragState = null;
  }

  /**
   * Get the last dropped player position (for smart placement)
   */
  getLastDroppedPosition(): { x: number; y: number } | null {
    return this.lastDroppedPosition;
  }

  /**
   * Clear all players
   */
  clear(): void {
    this.sprites.forEach((sprite) => {
      this.cleanupSpriteEvents(sprite);
      sprite.destroy();
    });
    this.sprites.clear();
    this.selectedPlayerIds.clear();
    this.dragState = null;
    this.removeChildren();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clear bounds feedback timeout
    if (this.boundsHitTimeout) {
      clearTimeout(this.boundsHitTimeout);
      this.boundsHitTimeout = null;
    }

    this.clear();
    super.destroy();
  }
}
