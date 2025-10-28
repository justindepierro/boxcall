/**
 * useDragBoxSelection - Hook for drag box selection in diagram editor
 *
 * Enables clicking and dragging on empty canvas to select multiple players:
 * - Click on empty field area and drag to create selection rectangle
 * - All players within rectangle become selected
 * - Shift+drag adds to existing selection (additive mode)
 * - Visual feedback with dashed border
 * - Ignores drag start on existing players (lets normal drag work)
 */

import { useEffect, useRef } from "react";
import { Graphics } from "pixi.js";
import type { PixiDiagramCanvas } from "../../../../services/canvas/DiagramCanvas";

interface DragBoxSelectionProps {
  app: PixiDiagramCanvas | null;
  enabled?: boolean;
}

interface DragBoxState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  additive: boolean; // Shift key held = additive selection
}

export function useDragBoxSelection({
  app,
  enabled = true,
}: DragBoxSelectionProps): void {
  const dragBoxRef = useRef<DragBoxState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    additive: false,
  });
  const selectionBoxRef = useRef<Graphics | null>(null);

  useEffect(() => {
    if (!app || !enabled) return;

    const canvas = app.app.canvas;
    const playersLayer = app.playersLayer;

    // Guard: playersLayer must exist
    if (!playersLayer) return;

    // Guard: stage must exist
    if (!app.app.stage) {
      // This can happen during initialization - not an error
      console.log("⏸️  useDragBoxSelection: Waiting for stage...");
      return;
    }

    // Create selection box graphics
    const selectionBox = new Graphics();
    selectionBox.zIndex = 1000; // Above everything
    app.app.stage.addChild(selectionBox);
    selectionBoxRef.current = selectionBox;

    /**
     * Check if mouse position is over any player sprite
     */
    const isOverPlayer = (x: number, y: number): boolean => {
      const allPlayers = playersLayer.getAllPlayers();
      return allPlayers.some((sprite: PlayerSprite) => {
        const bounds = sprite.getBounds();
        return (
          x >= bounds.x &&
          x <= bounds.x + bounds.width &&
          y >= bounds.y &&
          y <= bounds.y + bounds.height
        );
      });
    };

    /**
     * Get mouse position relative to canvas
     */
    const getCanvasPosition = (event: MouseEvent): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    /**
     * Mouse down - start drag box if not over player
     */
    const handleMouseDown = (event: MouseEvent): void => {
      // Only left mouse button
      if (event.button !== 0) return;

      const pos = getCanvasPosition(event);

      // Don't start drag box if over a player (let player drag work)
      if (isOverPlayer(pos.x, pos.y)) return;

      dragBoxRef.current = {
        active: true,
        startX: pos.x,
        startY: pos.y,
        currentX: pos.x,
        currentY: pos.y,
        additive: event.shiftKey, // Shift = add to selection (but not required)
      };

      // Always clear selection when starting box drag (box drag = new selection)
      playersLayer.clearSelection();
    };

    /**
     * Mouse move - update drag box visualization
     */
    const handleMouseMove = (event: MouseEvent): void => {
      if (!dragBoxRef.current.active) return;

      const pos = getCanvasPosition(event);
      dragBoxRef.current.currentX = pos.x;
      dragBoxRef.current.currentY = pos.y;

      // Draw selection box
      drawSelectionBox();
    };

    /**
     * Mouse up - finalize selection and hide box
     */
    const handleMouseUp = (): void => {
      if (!dragBoxRef.current.active) return;

      // Select players within box
      selectPlayersInBox();

      // Clear drag state
      dragBoxRef.current.active = false;
      selectionBox.clear();
    };

    /**
     * Draw the selection box rectangle
     */
    const drawSelectionBox = (): void => {
      const { startX, startY, currentX, currentY } = dragBoxRef.current;

      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      selectionBox.clear();

      // Scale border and handles with pixelsPerYard for consistency
      const borderWidth = 0.05 * app.coordinates.pixelsPerYard; // ~2px at 15 ppy, ~1px at 20 ppy
      const handleSize = 0.15 * app.coordinates.pixelsPerYard; // ~6px at 15 ppy, ~3px at 20 ppy

      // Draw dashed border with semi-transparent fill
      selectionBox.lineStyle(borderWidth, 0x00bfff, 1); // Bright blue border
      selectionBox.beginFill(0x00bfff, 0.1); // Subtle blue fill
      selectionBox.drawRect(x, y, width, height);
      selectionBox.endFill();

      // Draw corner handles (small squares)
      selectionBox.beginFill(0x00bfff, 1);
      selectionBox.drawRect(
        x - handleSize / 2,
        y - handleSize / 2,
        handleSize,
        handleSize
      ); // Top-left
      selectionBox.drawRect(
        x + width - handleSize / 2,
        y - handleSize / 2,
        handleSize,
        handleSize
      ); // Top-right
      selectionBox.drawRect(
        x - handleSize / 2,
        y + height - handleSize / 2,
        handleSize,
        handleSize
      ); // Bottom-left
      selectionBox.drawRect(
        x + width - handleSize / 2,
        y + height - handleSize / 2,
        handleSize,
        handleSize
      ); // Bottom-right
      selectionBox.endFill();
    };

    /**
     * Select all players whose centers are within the drag box
     */
    const selectPlayersInBox = (): void => {
      const { startX, startY, currentX, currentY } = dragBoxRef.current;

      const minX = Math.min(startX, currentX);
      const maxX = Math.max(startX, currentX);
      const minY = Math.min(startY, currentY);
      const maxY = Math.max(startY, currentY);

      const allPlayers = playersLayer.getAllPlayers();
      const selectedIds: string[] = [];

      allPlayers.forEach((sprite: PlayerSprite) => {
        const bounds = sprite.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;

        // Check if center is within box
        if (
          centerX >= minX &&
          centerX <= maxX &&
          centerY >= minY &&
          centerY <= maxY
        ) {
          selectedIds.push(sprite.getId());
        }
      });

      // Select players
      if (selectedIds.length > 0) {
        // Box selection always selects all players in the box
        // (selection was already cleared in mousedown)
        selectedIds.forEach((id) => playersLayer.selectPlayer(id, true));

        console.log(`📦 Box selected ${selectedIds.length} players`);
      }
    };

    // Add event listeners to canvas
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    // Also handle mouse leaving canvas
    canvas.addEventListener("mouseleave", handleMouseUp);

    // Cleanup
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);

      if (selectionBoxRef.current) {
        selectionBoxRef.current.destroy();
        selectionBoxRef.current = null;
      }
    };
  }, [app, enabled]);
}
