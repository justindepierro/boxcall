/**
 * Copy/Paste Hook
 * 
 * Handles copy/paste/duplicate operations for players:
 * - Ctrl/Cmd+C: Copy selected players
 * - Ctrl/Cmd+V: Paste at cursor position
 * - Ctrl/Cmd+D: Duplicate in place with offset
 */

import { useEffect, useRef } from 'react';
import type { DiagramPixiApp } from '../core/PixiApp';
import type { Player } from '../types/Player';

export interface UseCopyPasteOptions {
  app: DiagramPixiApp | null;
  enabled?: boolean;
}

// Clipboard state (module-level for persistence across renders)
let clipboard: Player[] = [];

export function useCopyPaste({ app, enabled = true }: UseCopyPasteOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!app || !enabled) return;

    // Track mouse position over canvas
    const handleMouseMove = (event: MouseEvent) => {
      const canvas = app.app.view as HTMLCanvasElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      lastMousePosRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const canvas = app.app.view as HTMLCanvasElement;
    if (canvas) {
      canvasRef.current = canvas;
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const playersLayer = app.playersLayer;
      if (!playersLayer) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (!modifierKey) return;

      let handled = false;

      switch (event.key.toLowerCase()) {
        case 'c': {
          // Copy selected players
          const selectedIds = playersLayer.getSelectedPlayerIds();
          if (selectedIds.length === 0) break;

          clipboard = selectedIds
            .map(id => {
              const sprite = playersLayer.getPlayer(id);
              return sprite ? sprite.getPlayer() : null;
            })
            .filter((p): p is Player => p !== null);

          console.log(`📋 Copied ${clipboard.length} players`);
          handled = true;
          break;
        }

        case 'v': {
          // Paste at cursor position
          if (clipboard.length === 0) break;

          // Get mouse position in yards
          const coords = app.coordinates;
          const mouseX = lastMousePosRef.current.x / coords.pixelsPerYard;
          const mouseY = lastMousePosRef.current.y / coords.pixelsPerYard;

          // Calculate centroid of copied players
          const centroidX = clipboard.reduce((sum, p) => sum + p.x, 0) / clipboard.length;
          const centroidY = clipboard.reduce((sum, p) => sum + p.y, 0) / clipboard.length;

          // Clear current selection
          playersLayer.clearSelection();

          // Paste with offset to cursor position
          const newPlayerIds: string[] = [];
          clipboard.forEach((player, index) => {
            const offsetX = player.x - centroidX;
            const offsetY = player.y - centroidY;

            const newPlayer: Player = {
              id: `${player.team}-${Date.now()}-${index}`,
              team: player.team,
              jerseyNumber: player.jerseyNumber,
              x: Math.max(0, Math.min(coords.fieldWidth, mouseX + offsetX)),
              y: Math.max(0, Math.min(coords.fieldHeight, mouseY + offsetY)),
            };

            playersLayer.addPlayer(newPlayer);
            newPlayerIds.push(newPlayer.id);
          });

          // Select the newly pasted players
          newPlayerIds.forEach(id => playersLayer.selectPlayer(id, true));

          console.log(`📌 Pasted ${newPlayerIds.length} players at (${mouseX.toFixed(1)}, ${mouseY.toFixed(1)})`);
          handled = true;
          break;
        }

        case 'd': {
          // Duplicate in place with small offset
          const selectedIds = playersLayer.getSelectedPlayerIds();
          if (selectedIds.length === 0) break;

          const selectedPlayers = selectedIds
            .map(id => {
              const sprite = playersLayer.getPlayer(id);
              return sprite ? sprite.getPlayer() : null;
            })
            .filter((p): p is Player => p !== null);

          // Clear current selection
          playersLayer.clearSelection();

          // Duplicate with 1 yard offset down and right
          const offset = 1.0;
          const newPlayerIds: string[] = [];
          
          selectedPlayers.forEach((player, index) => {
            const newPlayer: Player = {
              id: `${player.team}-${Date.now()}-${index}`,
              team: player.team,
              jerseyNumber: player.jerseyNumber,
              x: Math.min(app.coordinates.fieldWidth, player.x + offset),
              y: Math.min(app.coordinates.fieldHeight, player.y + offset),
            };

            playersLayer.addPlayer(newPlayer);
            newPlayerIds.push(newPlayer.id);
          });

          // Select the duplicated players
          newPlayerIds.forEach(id => playersLayer.selectPlayer(id, true));

          console.log(`📋 Duplicated ${newPlayerIds.length} players with offset`);
          handled = true;
          break;
        }
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [app, enabled]);
}
