/**
 * Player Management System
 *
 * Handles drag-drop player positioning, visual labels, and position constraints
 * Integrates with the canvas abstraction layer for smooth interactions
 */

// Local types (will be imported from diagram types)
type FieldPosition = { x: number; y: number };
type PlayerPosition = 'QB' | 'RB' | 'FB' | 'TB' | 'TE' | 'LT' | 'LG' | 'C' | 'RG' | 'RT' | 'WR' | 'SLOT' | 'SE' | 'FL' | 'X' | 'Y' | 'Z' | 'H' | 'OTHER';

interface FormationPlayer {
  id: string;
  playerPosition: PlayerPosition;
  role: string;
  fieldPosition: FieldPosition;
  label: string;
}

interface IDiagramCanvas {
  addPlayer(player: FormationPlayer): string;
  updatePlayer(id: string, updates: Partial<FormationPlayer>): void;
  removePlayer(id: string): void;
  selectPlayer(id: string | null): void;
  onPlayerMove(callback: (id: string, position: FieldPosition) => void): void;
  onPlayerSelect(callback: (id: string | null) => void): void;
  onPlayerDragStart(callback: (id: string) => void): void;
  onPlayerDragEnd(callback: (id: string) => void): void;
  onCanvasClick(callback: (position: FieldPosition) => void): void;
}

// ============================================================================
// PLAYER CONSTRAINTS & VALIDATION
// ============================================================================

/** Position constraints for different player types */
export const PLAYER_CONSTRAINTS: Record<string, any> = {
  QB: {
    minY: 1,    // Can't be at LOS (would be in defensive territory)
    maxY: 15,   // Can't be too far back
    snapToGrid: true,
    formationOnly: true, // QB position determined by formation
  },
  RB: {
    minY: 5,    // Behind LOS
    maxY: 25,   // Reasonable depth
    snapToGrid: true,
    allowMotion: true,
  },
  FB: {
    minY: 3,    // Can be closer to LOS
    maxY: 20,
    snapToGrid: true,
    allowMotion: true,
  },
  TB: { // Tailback (same as RB)
    minY: 5,
    maxY: 25,
    snapToGrid: true,
    allowMotion: true,
  },
  WR: {
    minY: 0,    // Can be at LOS
    maxY: 30,   // Deep positioning allowed
    snapToGrid: true,
    allowMotion: true,
  },
  SLOT: {
    minY: 0,
    maxY: 25,
    snapToGrid: true,
    allowMotion: true,
  },
  SE: { // Split end (same as WR)
    minY: 0,
    maxY: 30,
    snapToGrid: true,
    allowMotion: true,
  },
  FL: { // Flanker (same as WR)
    minY: 0,
    maxY: 30,
    snapToGrid: true,
    allowMotion: true,
  },
  TE: {
    minY: 0,    // Can be at LOS (inline)
    maxY: 20,
    snapToGrid: true,
    allowMotion: false, // Usually static
  },
  // Offensive Line - fixed positions
  LT: { fixed: true, formationOnly: true },
  LG: { fixed: true, formationOnly: true },
  C: { fixed: true, formationOnly: true },
  RG: { fixed: true, formationOnly: true },
  RT: { fixed: true, formationOnly: true },
} as const;

/** Player label assignments (NFL standard) */
export const PLAYER_LABELS: Record<string, readonly string[]> = {
  QB: ['Q'],
  RB: ['H', 'T'], // Tailback
  FB: ['F'],
  TB: ['T'], // Tailback
  TE: ['Y', 'X'], // Y is primary, X is secondary
  WR: ['X', 'Z', 'W', 'A', 'B'], // X and Z are split ends, W is flanker
  SLOT: ['S', 'H'], // Slot and H-back
  SE: ['X', 'Z'], // Split end
  FL: ['W'], // Flanker
} as const;

// ============================================================================
// PLAYER MANAGER CLASS
// ============================================================================

/** Manages player positioning and interactions */
export class PlayerManager {
  private canvas: IDiagramCanvas;
  private players: Map<string, FormationPlayer> = new Map();
  private draggedPlayer: string | null = null;
  private dragStartPos: FieldPosition | null = null;

  // Callbacks
  private onPlayerMove?: (playerId: string, position: FieldPosition) => void;
  private onPlayerSelect?: (playerId: string | null) => void;
  private _onValidationError?: (error: string) => void;

  constructor(canvas: IDiagramCanvas) {
    this.canvas = canvas;
    this.setupCanvasCallbacks();
  }

  /** Set canvas reference (for delayed initialization) */
  setCanvas(canvas: IDiagramCanvas): void {
    this.canvas = canvas;
    this.setupCanvasCallbacks();
  }

  // ============================================================================
  // PLAYER CRUD OPERATIONS
  // ============================================================================

  /** Add a player to the canvas */
  addPlayer(player: FormationPlayer): void {
    this.players.set(player.id, player);
    this.canvas.addPlayer(player);
  }

  /** Update player data */
  updatePlayer(id: string, updates: Partial<FormationPlayer>): void {
    const existing = this.players.get(id);
    if (!existing) return;

    const updated = { ...existing, ...updates };
    this.players.set(id, updated);
    this.canvas.updatePlayer(id, updates);
  }

  /** Remove a player from the canvas */
  removePlayer(id: string): void {
    this.players.delete(id);
    this.canvas.removePlayer(id);
  }

  /** Get player by ID */
  getPlayer(id: string): FormationPlayer | undefined {
    return this.players.get(id);
  }

  /** Get all players */
  getAllPlayers(): FormationPlayer[] {
    return Array.from(this.players.values());
  }

  /** Clear all players */
  clearPlayers(): void {
    for (const id of this.players.keys()) {
      this.canvas.removePlayer(id);
    }
    this.players.clear();
  }

  // ============================================================================
  // POSITIONING & CONSTRAINTS
  // ============================================================================

  /** Move player to new position (with validation) */
  movePlayer(playerId: string, newPosition: FieldPosition): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    // Validate the move
    const validation = this.validatePlayerMove(player, newPosition);
    if (!validation.valid) {
      const error = validation.error;
      if (error) {
        this._onValidationError?.(error);
      }
      return false;
    }

    // Apply snap-to-grid if required
    const snappedPosition = this.snapToGrid(player.playerPosition, newPosition);

    // Update player data
    const updatedPlayer = {
      ...player,
      fieldPosition: snappedPosition
    };

    this.players.set(playerId, updatedPlayer);
    this.canvas.updatePlayer(playerId, { fieldPosition: snappedPosition });

    // Notify listeners
    this.onPlayerMove?.(playerId, snappedPosition);

    return true;
  }

  /** Validate if a player move is allowed */
  validatePlayerMove(player: FormationPlayer, newPosition: FieldPosition): {
    valid: boolean;
    error?: string;
  } {
    const constraints = PLAYER_CONSTRAINTS[player.playerPosition];
    if (!constraints) {
      return { valid: true }; // No constraints = allow
    }

    // Check if position is fixed (formation only)
    if (constraints.fixed || constraints.formationOnly) {
      return {
        valid: false,
        error: `${player.playerPosition} position is determined by formation`
      };
    }

    // Check Y bounds
    if (newPosition.y < constraints.minY || newPosition.y > constraints.maxY) {
      return {
        valid: false,
        error: `${player.playerPosition} must be between ${constraints.minY}-${constraints.maxY} yards`
      };
    }

    // Check field bounds
    if (newPosition.x < 0 || newPosition.x > 53.3) {
      return {
        valid: false,
        error: 'Player must stay within field boundaries'
      };
    }

    // Check for collisions with other players
    const collision = this.checkPlayerCollision(player.id, newPosition);
    if (collision) {
      return {
        valid: false,
        error: 'Player would collide with another player'
      };
    }

    return { valid: true };
  }

  /** Snap position to grid if required */
  private snapToGrid(position: PlayerPosition, pos: FieldPosition): FieldPosition {
    const constraints = PLAYER_CONSTRAINTS[position];
    if (!constraints?.snapToGrid) {
      return pos;
    }

    // Snap to 1-yard grid
    return {
      x: Math.round(pos.x),
      y: Math.round(pos.y)
    };
  }

  /** Check for collisions with other players */
  private checkPlayerCollision(excludeId: string, position: FieldPosition, radius: number = 1.5): boolean {
    for (const [id, player] of this.players) {
      if (id === excludeId) continue;

      const distance = Math.sqrt(
        Math.pow(player.fieldPosition.x - position.x, 2) +
        Math.pow(player.fieldPosition.y - position.y, 2)
      );

      if (distance < radius) {
        return true;
      }
    }
    return false;
  }

  // ============================================================================
  // DRAG & DROP HANDLING
  // ============================================================================

  /** Start dragging a player */
  startDrag(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.draggedPlayer = playerId;
    this.dragStartPos = { ...player.fieldPosition };
  }

  /** Update drag position */
  updateDrag(position: FieldPosition): void {
    if (!this.draggedPlayer) return;

    // For smooth dragging, allow temporary invalid positions
    // Validation happens on drop
    this.canvas.updatePlayer(this.draggedPlayer, { fieldPosition: position });
  }

  /** Finish dragging (validate and commit) */
  endDrag(): void {
    if (!this.draggedPlayer || !this.dragStartPos) return;

    const player = this.players.get(this.draggedPlayer);
    if (!player) return;

    const currentPos = player.fieldPosition;

    // Validate the final position
    const validation = this.validatePlayerMove(player, currentPos);
    if (!validation.valid) {
      // Revert to start position
      this.movePlayer(this.draggedPlayer, this.dragStartPos);
      const error = validation.error;
      if (error) {
        this._onValidationError?.(error);
      }
    }

    this.draggedPlayer = null;
    this.dragStartPos = null;
  }

  /** Cancel drag (revert to original position) */
  cancelDrag(): void {
    if (!this.draggedPlayer || !this.dragStartPos) return;

    this.movePlayer(this.draggedPlayer, this.dragStartPos);
    this.draggedPlayer = null;
    this.dragStartPos = null;
  }

  // ============================================================================
  // LABEL MANAGEMENT
  // ============================================================================

  /** Auto-assign labels based on NFL standards */
  autoAssignLabels(): void {
    const playersByPosition = new Map<PlayerPosition, FormationPlayer[]>();

    // Group players by position
    for (const player of this.players.values()) {
      const list = playersByPosition.get(player.playerPosition) || [];
      list.push(player);
      playersByPosition.set(player.playerPosition, list);
    }

    // Assign labels for each position group
    for (const [position, players] of playersByPosition) {
      const labels = PLAYER_LABELS[position] || [];
      players.forEach((player, index) => {
        const label = labels[index] || `${position}${index + 1}`;
        this.updatePlayer(player.id, { label });
      });
    }
  }

  /** Update player label */
  setPlayerLabel(playerId: string, label: string): void {
    this.updatePlayer(playerId, { label });
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  /** Setup canvas event callbacks */
  private setupCanvasCallbacks(): void {
    this.canvas.onPlayerMove((id, position) => {
      if (this.draggedPlayer) {
        this.updateDrag(position);
      } else {
        this.movePlayer(id, position);
      }
    });

    this.canvas.onPlayerDragStart((id) => {
      this.startDrag(id);
    });

    this.canvas.onPlayerDragEnd((id) => {
      if (this.draggedPlayer === id) {
        this.endDrag();
      }
    });

    this.canvas.onPlayerSelect((id) => {
      this.onPlayerSelect?.(id);
    });

    this.canvas.onCanvasClick((_position) => {
      // Deselect player when clicking empty space
      this.canvas.selectPlayer(null);
      this.onPlayerSelect?.(null);
    });
  }

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  onPlayerMoved(callback: (playerId: string, position: FieldPosition) => void): void {
    this.onPlayerMove = callback;
  }

  onPlayerSelected(callback: (playerId: string | null) => void): void {
    this.onPlayerSelect = callback;
  }

  onValidationError(callback: (error: string) => void): void {
    this._onValidationError = callback;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Create a new player with default positioning */
export function createPlayer(
  position: PlayerPosition,
  basePosition: FieldPosition,
  label?: string
): Omit<FormationPlayer, 'id'> {
  const defaultLabel = label || getDefaultLabel(position);

  return {
    playerPosition: position,
    role: getDefaultRole(position),
    fieldPosition: basePosition,
    label: defaultLabel,
  };
}

/** Get default label for position */
function getDefaultLabel(position: PlayerPosition): string {
  const labels = PLAYER_LABELS[position];
  return labels ? labels[0] : position;
}

/** Get default role for position */
function getDefaultRole(position: PlayerPosition): string {
  switch (position) {
    case 'QB': return 'quarterback';
    case 'RB': case 'FB': return 'running_back';
    case 'TE': return 'tight_end';
    case 'WR': case 'SLOT': return 'wide_receiver';
    case 'LT': case 'LG': case 'C': case 'RG': case 'RT': return 'offensive_line';
    default: return 'other';
  }
}

/** Check if position allows motion */
export function allowsMotion(position: PlayerPosition): boolean {
  const constraints = PLAYER_CONSTRAINTS[position];
  return constraints?.allowMotion ?? false;
}

/** Check if position is fixed in formation */
export function isFixedPosition(position: PlayerPosition): boolean {
  const constraints = PLAYER_CONSTRAINTS[position];
  return constraints?.fixed ?? false;
}