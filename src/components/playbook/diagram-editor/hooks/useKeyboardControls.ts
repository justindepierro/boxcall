/**
 * Keyboard Controls Hook
 * 
 * Handles keyboard shortcuts for diagram editor:
 * - Arrow keys: Nudge selected players (0.5 yard)
 * - Shift + Arrow keys: Large nudge (1 yard)
 * - Delete/Backspace: Remove selected players
 * - Escape: Deselect all players
 */

import { useEffect } from 'react';
import type { DiagramPixiApp } from '../core/PixiApp';

export interface UseKeyboardControlsOptions {
  app: DiagramPixiApp | null;
  enabled?: boolean;
}

export function useKeyboardControls({ app, enabled = true }: UseKeyboardControlsOptions) {
  useEffect(() => {
    if (!app || !enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle if user is typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const playersLayer = app.playersLayer;
      if (!playersLayer) return;

      const selectedPlayerIds = playersLayer.getSelectedPlayerIds();
      if (selectedPlayerIds.length === 0 && !['Escape'].includes(event.key)) {
        return; // No players selected and not escape key
      }

      // Determine nudge amount (0.5 yards or 1 yard with shift)
      const nudgeAmount = event.shiftKey ? 1.0 : 0.5;
      let handled = false;

      switch (event.key) {
        case 'ArrowUp':
          // Nudge up (decrease Y)
          selectedPlayerIds.forEach((id: string) => {
            const sprite = playersLayer.getPlayer(id);
            if (sprite) {
              const player = sprite.getPlayer();
              const newY = Math.max(0, player.y - nudgeAmount);
              sprite.updatePlayer({ y: newY });
            }
          });
          handled = true;
          break;

        case 'ArrowDown':
          // Nudge down (increase Y)
          selectedPlayerIds.forEach((id: string) => {
            const sprite = playersLayer.getPlayer(id);
            if (sprite) {
              const player = sprite.getPlayer();
              const newY = Math.min(app.coordinates.fieldHeight, player.y + nudgeAmount);
              sprite.updatePlayer({ y: newY });
            }
          });
          handled = true;
          break;

        case 'ArrowLeft':
          // Nudge left (decrease X)
          selectedPlayerIds.forEach((id: string) => {
            const sprite = playersLayer.getPlayer(id);
            if (sprite) {
              const player = sprite.getPlayer();
              const newX = Math.max(0, player.x - nudgeAmount);
              sprite.updatePlayer({ x: newX });
            }
          });
          handled = true;
          break;

        case 'ArrowRight':
          // Nudge right (increase X)
          selectedPlayerIds.forEach((id: string) => {
            const sprite = playersLayer.getPlayer(id);
            if (sprite) {
              const player = sprite.getPlayer();
              const newX = Math.min(app.coordinates.fieldWidth, player.x + nudgeAmount);
              sprite.updatePlayer({ x: newX });
            }
          });
          handled = true;
          break;

        case 'Delete':
        case 'Backspace':
          // Remove selected players
          selectedPlayerIds.forEach((id: string) => {
            playersLayer.removePlayer(id);
          });
          handled = true;
          break;

        case 'Escape':
          // Deselect all
          playersLayer.clearSelection();
          handled = true;
          break;
      }

      // Prevent default browser behavior if we handled the key
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    // Attach keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [app, enabled]);
}
