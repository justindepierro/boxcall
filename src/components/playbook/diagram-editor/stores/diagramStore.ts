/**
 * Diagram State Store using Zustand
 * 
 * Central state management for the diagram editor:
 * - Player list and current positions
 * - Selected player
 * - Active tool
 * - Undo/redo history (Phase 6)
 */

import { create } from 'zustand';
import type { Player, TeamSide } from '../types/Player';

export type ToolType = 'select' | 'add-player' | 'draw-route' | 'pan';

export interface DiagramState {
  // Players
  players: Player[];
  selectedPlayerId: string | null;

  // Tools
  activeTool: ToolType;

  // Actions - Players
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  selectPlayer: (playerId: string | null) => void;
  clearPlayers: () => void;

  // Actions - Tools
  setActiveTool: (tool: ToolType) => void;

  // Utilities
  getPlayer: (playerId: string) => Player | undefined;
  getPlayersByTeam: (team: TeamSide) => Player[];
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  // Initial state
  players: [],
  selectedPlayerId: null,
  activeTool: 'select',

  // Player actions
  addPlayer: (player: Player) =>
    set((state) => ({
      players: [...state.players, player],
    })),

  updatePlayer: (playerId: string, updates: Partial<Player>) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, ...updates } : p
      ),
    })),

  removePlayer: (playerId: string) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
      selectedPlayerId: state.selectedPlayerId === playerId ? null : state.selectedPlayerId,
    })),

  selectPlayer: (playerId: string | null) =>
    set({ selectedPlayerId: playerId }),

  clearPlayers: () =>
    set({
      players: [],
      selectedPlayerId: null,
    }),

  // Tool actions
  setActiveTool: (tool: ToolType) =>
    set({ activeTool: tool }),

  // Utilities
  getPlayer: (playerId: string) =>
    get().players.find((p) => p.id === playerId),

  getPlayersByTeam: (team: TeamSide) =>
    get().players.filter((p) => p.team === team),
}));
