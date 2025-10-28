/**
 * Copy/Paste Hook
 *
 * Handles copy/paste/duplicate operations for players:
 * - Ctrl/Cmd+C: Copy selected players
 * - Ctrl/Cmd+V: Paste at cursor position
 * - Ctrl/Cmd+D: Duplicate in place with offset
 */

import { useEffect, useRef } from "react";
import type { PixiDiagramCanvas } from "../../../../services/canvas/DiagramCanvas";
import type { FormationPlayer } from "../../../../types/diagram";

export interface UseCopyPasteOptions {
  app: PixiDiagramCanvas | null;
  enabled?: boolean;
}

// Clipboard state (module-level for persistence across renders)
let clipboard: FormationPlayer[] = [];

export function useCopyPaste({ app, enabled = true }: UseCopyPasteOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!app || !enabled) return;

    // Track mouse position over canvas
    const handleMouseMove = (event: MouseEvent) => {
      const canvas = app.getCanvasElement();
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      lastMousePosRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const canvas = app.getCanvasElement();
    if (canvas) {
      canvasRef.current = canvas;
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      let handled = false;

      switch (event.key.toLowerCase()) {
        case "c": {
          // Copy selected players
          const selectedIds = app.getSelectedPlayerIds();
          if (selectedIds.length === 0) break;

          clipboard = selectedIds
            .map((id) => app.getPlayer(id))
            .filter((p): p is FormationPlayer => p !== null);

          console.log(`📋 Copied ${clipboard.length} players`);
          handled = true;
          break;
        }

        case "v": {
          // Paste at cursor position
          if (clipboard.length === 0) break;

          // Convert mouse position to field coordinates
          const mouseFieldPos = app.canvasToField(lastMousePosRef.current);

          // Calculate centroid of copied players
          const centroidX =
            clipboard.reduce((sum, p) => sum + p.fieldPosition.x, 0) / clipboard.length;
          const centroidY =
            clipboard.reduce((sum, p) => sum + p.fieldPosition.y, 0) / clipboard.length;

          // Clear current selection
          app.clearSelection();

          // Paste with offset to cursor position
          const newPlayerIds: string[] = [];
          clipboard.forEach((player, index) => {
            const offsetX = player.fieldPosition.x - centroidX;
            const offsetY = player.fieldPosition.y - centroidY;

            const newFieldPos = {
              x: Math.max(0, Math.min(53.3, mouseFieldPos.x + offsetX)), // FIELD_WIDTH_YARDS
              y: Math.max(0, Math.min(120, mouseFieldPos.y + offsetY)), // FIELD_LENGTH_YARDS
            };

            const newPlayer: FormationPlayer = {
              id: `pasted-${Date.now()}-${index}`,
              playerPosition: player.playerPosition,
              role: player.role,
              fieldPosition: newFieldPos,
              label: player.label,
              color: player.color,
            };

            const playerId = app.addPlayer(newPlayer);
            newPlayerIds.push(playerId);
          });

          // Select the newly pasted players
          newPlayerIds.forEach((id) => app.selectPlayer(id));

          console.log(
            `📌 Pasted ${newPlayerIds.length} players at (${mouseFieldPos.x.toFixed(1)}, ${mouseFieldPos.y.toFixed(1)})`
          );
          handled = true;
          break;
        }

        case "d": {
          // Duplicate in place with small offset
          const selectedIds = app.getSelectedPlayerIds();
          if (selectedIds.length === 0) break;

          const selectedPlayers = selectedIds
            .map((id) => app.getPlayer(id))
            .filter((p): p is FormationPlayer => p !== null);

          // Clear current selection
          app.clearSelection();

          // Duplicate with 2-yard offset to the right
          const newPlayerIds: string[] = [];
          selectedPlayers.forEach((player, index) => {
            const newFieldPos = {
              x: Math.min(53.3, player.fieldPosition.x + 2.0), // 2 yards to the right
              y: player.fieldPosition.y, // Keep same Y position
            };

            const newPlayer: FormationPlayer = {
              id: `duplicated-${Date.now()}-${index}`,
              playerPosition: player.playerPosition,
              role: player.role,
              fieldPosition: newFieldPos,
              label: player.label,
              color: player.color,
            };

            const playerId = app.addPlayer(newPlayer);
            newPlayerIds.push(playerId);
          });

          // Select the duplicated players
          newPlayerIds.forEach((id) => app.selectPlayer(id));

          console.log(
            `📋 Duplicated ${newPlayerIds.length} players with offset`
          );
          handled = true;
          break;
        }
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [app, enabled]);
}
