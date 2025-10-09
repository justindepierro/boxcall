/**
 * useUndoRedo - Hook for undo/redo functionality in diagram editor
 * 
 * Implements command pattern with history stack:
 * - Ctrl+Z / Cmd+Z: Undo last operation
 * - Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y: Redo
 * - Tracks player movements, additions, deletions
 * - Maximum 50 operations in history
 * 
 * Command types:
 * - MoveCommand: Track player position changes
 * - AddCommand: Track player additions
 * - DeleteCommand: Track player deletions
 */

import { useEffect, useRef } from 'react';
import type { DiagramPixiApp } from '../core/PixiApp';
import type { Player } from '../types/Player';

interface UndoRedoProps {
  app: DiagramPixiApp | null;
  enabled?: boolean;
}

/**
 * Base command interface
 */
interface Command {
  execute(): void;
  undo(): void;
  type: 'move' | 'add' | 'delete';
}

/**
 * Move command - tracks player position changes
 */
class MoveCommand implements Command {
  type: 'move' = 'move';
  
  constructor(
    private playersLayer: any,
    private oldPositions: Map<string, { x: number; y: number }>,
    private newPositions: Map<string, { x: number; y: number }>
  ) {}

  execute(): void {
    // Apply new positions
    this.newPositions.forEach((pos, playerId) => {
      this.playersLayer.updatePlayer(playerId, pos);
    });
  }

  undo(): void {
    // Restore old positions
    this.oldPositions.forEach((pos, playerId) => {
      this.playersLayer.updatePlayer(playerId, pos);
    });
  }
}

/**
 * Add command - tracks player additions (for future use)
 */
// @ts-expect-error - Reserved for future undo/redo functionality
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AddCommand implements Command {
  type: 'add' = 'add';
  
  constructor(
    private playersLayer: any,
    private players: Player[]
  ) {}

  execute(): void {
    // Add players
    this.players.forEach(player => {
      this.playersLayer.addPlayer(player);
    });
  }

  undo(): void {
    // Remove players
    this.players.forEach(player => {
      this.playersLayer.removePlayer(player.id);
    });
  }
}

/**
 * Delete command - tracks player deletions (for future use)
 */
// @ts-expect-error - Reserved for future undo/redo functionality
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class DeleteCommand implements Command {
  type: 'delete' = 'delete';
  
  constructor(
    private playersLayer: any,
    private players: Player[]
  ) {}

  execute(): void {
    // Delete players
    this.players.forEach(player => {
      this.playersLayer.removePlayer(player.id);
    });
  }

  undo(): void {
    // Re-add players
    this.players.forEach(player => {
      this.playersLayer.addPlayer(player);
    });
  }
}

/**
 * History manager
 */
class CommandHistory {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private readonly maxHistory: number = 50;

  /**
   * Execute a command and add to history
   */
  executeCommand(command: Command): void {
    // Remove any commands after current index (clear redo history)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Execute the command
    command.execute();

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Enforce max history limit
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`📝 Command executed: ${command.type} (history: ${this.currentIndex + 1}/${this.history.length})`);
  }

  /**
   * Undo last command
   */
  undo(): boolean {
    if (this.currentIndex < 0) {
      console.log('⚠️ Nothing to undo');
      return false;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;

    console.log(`↩️ Undo: ${command.type} (history: ${this.currentIndex + 1}/${this.history.length})`);
    return true;
  }

  /**
   * Redo last undone command
   */
  redo(): boolean {
    if (this.currentIndex >= this.history.length - 1) {
      console.log('⚠️ Nothing to redo');
      return false;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();

    console.log(`↪️ Redo: ${command.type} (history: ${this.currentIndex + 1}/${this.history.length})`);
    return true;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get current history state
   */
  getState(): { canUndo: boolean; canRedo: boolean; historySize: number } {
    return {
      canUndo: this.currentIndex >= 0,
      canRedo: this.currentIndex < this.history.length - 1,
      historySize: this.history.length,
    };
  }
}

// Module-level history (persists across renders)
const commandHistory = new CommandHistory();

export function useUndoRedo({ app, enabled = true }: UndoRedoProps): void {
  const dragStartPositionsRef = useRef<Map<string, { x: number; y: number }> | null>(null);

  useEffect(() => {
    if (!app || !enabled) return;

    const playersLayer = app.playersLayer;
    if (!playersLayer) return;

    /**
     * Track drag start to create move command on drag end
     */
    const handleDragStart = (): void => {
      const selectedIds = playersLayer.getSelectedPlayerIds();
      if (selectedIds.length === 0) return;

      // Capture current positions
      const startPositions = new Map<string, { x: number; y: number }>();
      selectedIds.forEach((id: string) => {
        const sprite = playersLayer.getPlayer(id);
        if (sprite) {
          const player = sprite.getPlayer();
          startPositions.set(id, { x: player.x, y: player.y });
        }
      });

      dragStartPositionsRef.current = startPositions;
    };

    /**
     * Create move command on drag end if positions changed
     */
    const handleDragEnd = (): void => {
      if (!dragStartPositionsRef.current) return;

      const selectedIds = playersLayer.getSelectedPlayerIds();
      const endPositions = new Map<string, { x: number; y: number }>();
      let positionsChanged = false;

      selectedIds.forEach((id: string) => {
        const sprite = playersLayer.getPlayer(id);
        if (sprite) {
          const player = sprite.getPlayer();
          const startPos = dragStartPositionsRef.current!.get(id);
          
          endPositions.set(id, { x: player.x, y: player.y });

          // Check if position actually changed
          if (startPos && (startPos.x !== player.x || startPos.y !== player.y)) {
            positionsChanged = true;
          }
        }
      });

      // Only create command if positions actually changed
      if (positionsChanged && dragStartPositionsRef.current.size > 0) {
        const moveCommand = new MoveCommand(
          playersLayer,
          dragStartPositionsRef.current,
          endPositions
        );
        commandHistory.executeCommand(moveCommand);
      }

      dragStartPositionsRef.current = null;
    };

    /**
     * Keyboard handler for undo/redo
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Skip if typing in input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (!modifierKey) return;

      // Ctrl/Cmd+Z: Undo
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        commandHistory.undo();
      }
      // Ctrl/Cmd+Shift+Z or Ctrl+Y: Redo
      else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
        event.preventDefault();
        commandHistory.redo();
      }
    };

    // Listen to drag events (we need to hook into PlayersLayer's drag lifecycle)
    // For now, we'll use keyboard events and manual tracking
    // TODO: PlayersLayer could emit drag events for cleaner integration
    
    document.addEventListener('keydown', handleKeyDown);

    // HACK: Monitor mouse events on canvas to detect drags
    // This is a workaround until PlayersLayer exposes drag events
    const canvas = app.app?.view as HTMLCanvasElement | undefined;
    
    // Guard: canvas must exist
    if (!canvas) {
      // This is expected during initialization - just return early
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    
    let isDragging = false;

    const handleMouseDown = (): void => {
      const selectedIds = playersLayer.getSelectedPlayerIds();
      if (selectedIds.length > 0) {
        handleDragStart();
        isDragging = true;
      }
    };

    const handleMouseUp = (): void => {
      if (isDragging) {
        handleDragEnd();
        isDragging = false;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [app, enabled]);
}

// Export command history for external access (e.g., UI buttons)
export { commandHistory };
