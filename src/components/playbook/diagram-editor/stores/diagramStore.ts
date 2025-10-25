/**
 * Diagram State Store using Zustand
 *
 * Central state management for the diagram editor:
 * - Player list and current positions
 * - Selected player
 * - Active tool
 * - Undo/redo history (Phase 6)
 */

import { create } from "zustand";
import type { Player, TeamSide } from "../types/Player";
import type { Route } from "../types/DiagramTypes";

export type ToolType =
  | "select"
  | "add-player"
  | "draw-route"
  | "edit-waypoint"
  | "pan";

export interface DiagramState {
  // Players
  players: Player[];
  selectedPlayerId: string | null;

  // Routes
  routes: Route[];
  selectedRouteId: string | null;

  // Tools
  activeTool: ToolType;

  // Actions - Players
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  selectPlayer: (playerId: string | null) => void;
  clearPlayers: () => void;

  // Actions - Routes
  addRoute: (route: Route) => void;
  updateRoute: (routeId: string, updates: Partial<Route>) => void;
  removeRoute: (routeId: string) => void;
  selectRoute: (routeId: string | null) => void;
  clearRoutes: () => void;

  // Actions - Tools
  setActiveTool: (tool: ToolType) => void;

  // Utilities
  getPlayer: (playerId: string) => Player | undefined;
  getPlayersByTeam: (team: TeamSide) => Player[];
  getRoute: (routeId: string) => Route | undefined;
  getRoutesByPlayerId: (playerId: string) => Route[];
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  // Initial state
  players: [],
  selectedPlayerId: null,
  routes: [],
  selectedRouteId: null,
  activeTool: "select",

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
      selectedPlayerId:
        state.selectedPlayerId === playerId ? null : state.selectedPlayerId,
      // Remove all routes for this player
      routes: state.routes.filter((r) => r.playerId !== playerId),
    })),

  selectPlayer: (playerId: string | null) =>
    set({ selectedPlayerId: playerId }),

  clearPlayers: () =>
    set({
      players: [],
      selectedPlayerId: null,
      routes: [], // Clear routes when clearing players
    }),

  // Route actions
  addRoute: (route: Route) =>
    set((state) => ({
      routes: [...state.routes, route],
    })),

  updateRoute: (routeId: string, updates: Partial<Route>) =>
    set((state) => ({
      routes: state.routes.map((r) =>
        r.id === routeId ? { ...r, ...updates } : r
      ),
    })),

  removeRoute: (routeId: string) =>
    set((state) => ({
      routes: state.routes.filter((r) => r.id !== routeId),
      selectedRouteId:
        state.selectedRouteId === routeId ? null : state.selectedRouteId,
    })),

  selectRoute: (routeId: string | null) => set({ selectedRouteId: routeId }),

  clearRoutes: () =>
    set({
      routes: [],
      selectedRouteId: null,
    }),

  // Tool actions
  setActiveTool: (tool: ToolType) => set({ activeTool: tool }),

  // Utilities
  getPlayer: (playerId: string) => get().players.find((p) => p.id === playerId),

  getPlayersByTeam: (team: TeamSide) =>
    get().players.filter((p) => p.team === team),

  getRoute: (routeId: string) => get().routes.find((r) => r.id === routeId),

  getRoutesByPlayerId: (playerId: string) =>
    get().routes.filter((r) => r.playerId === playerId),
}));
