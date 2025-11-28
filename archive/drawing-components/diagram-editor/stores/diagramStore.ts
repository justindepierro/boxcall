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
import { persist } from "zustand/middleware";
import type { Player, TeamSide } from "../types/Player";
import type { Route } from "../types/DiagramTypes";
import type { FieldColorMode } from "../layers/FieldLayer";

export type ToolType =
  | "select"
  | "add-player"
  | "draw-route"
  | "edit-waypoint"
  | "pan";

export type DiagramFieldPosition =
  | "midfield"
  | "backed-up"
  | "red-zone"
  | "free-draw";

export type RouteType = "primary" | "hot" | "check";

export interface DiagramState {
  // Players
  players: Player[];
  selectedPlayerId: string | null;

  // Routes
  routes: Route[];
  selectedRouteId: string | null;

  // Tools
  activeTool: ToolType;

  // Diagram Settings
  colorMode: FieldColorMode;
  fieldPosition: DiagramFieldPosition;
  selectedAlignment: "left" | "middle" | "right";
  selectedRouteType: RouteType;

  // UI State
  dismissedLandscapePrompt: boolean;
  showFormationPicker: boolean;

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

  // Actions - Diagram Settings
  setColorMode: (mode: FieldColorMode) => void;
  setFieldPosition: (position: DiagramFieldPosition) => void;
  setSelectedAlignment: (alignment: "left" | "middle" | "right") => void;
  setSelectedRouteType: (type: RouteType) => void;

  // Actions - UI State
  setDismissedLandscapePrompt: (dismissed: boolean) => void;
  setShowFormationPicker: (show: boolean) => void;

  // Actions - Reset
  resetDiagramState: () => void;

  // Utilities
  getPlayer: (playerId: string) => Player | undefined;
  getPlayersByTeam: (team: TeamSide) => Player[];
  getRoute: (routeId: string) => Route | undefined;
  getRoutesByPlayerId: (playerId: string) => Route[];
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      // Initial state
      players: [],
      selectedPlayerId: null,
      routes: [],
      selectedRouteId: null,
      activeTool: "select",

      // Diagram settings (persist these)
      colorMode: "jade",
      fieldPosition: "midfield",
      selectedAlignment: "middle",
      selectedRouteType: "primary",

      // UI state (don't persist these)
      dismissedLandscapePrompt: false,
      showFormationPicker: false,

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

      selectRoute: (routeId: string | null) =>
        set({ selectedRouteId: routeId }),

      clearRoutes: () =>
        set({
          routes: [],
          selectedRouteId: null,
        }),

      // Tool actions
      setActiveTool: (tool: ToolType) => set({ activeTool: tool }),

      // Diagram setting actions
      setColorMode: (mode: FieldColorMode) => set({ colorMode: mode }),
      setFieldPosition: (position: DiagramFieldPosition) =>
        set({ fieldPosition: position }),
      setSelectedAlignment: (alignment: "left" | "middle" | "right") =>
        set({ selectedAlignment: alignment }),
      setSelectedRouteType: (type: RouteType) =>
        set({ selectedRouteType: type }),

      // UI state actions
      setDismissedLandscapePrompt: (dismissed: boolean) =>
        set({ dismissedLandscapePrompt: dismissed }),
      setShowFormationPicker: (show: boolean) =>
        set({ showFormationPicker: show }),

      // Reset action
      resetDiagramState: () =>
        set({
          players: [],
          selectedPlayerId: null,
          routes: [],
          selectedRouteId: null,
          activeTool: "select",
          dismissedLandscapePrompt: false,
          showFormationPicker: false,
        }),

      // Utilities
      getPlayer: (playerId: string) =>
        get().players.find((p) => p.id === playerId),

      getPlayersByTeam: (team: TeamSide) =>
        get().players.filter((p) => p.team === team),

      getRoute: (routeId: string) => get().routes.find((r) => r.id === routeId),

      getRoutesByPlayerId: (playerId: string) =>
        get().routes.filter((r) => r.playerId === playerId),
    }),
    {
      name: "diagram-store",
      partialize: (state) => ({
        // Only persist diagram settings, not players/routes/UI state
        colorMode: state.colorMode,
        fieldPosition: state.fieldPosition,
        selectedAlignment: state.selectedAlignment,
        selectedRouteType: state.selectedRouteType,
        activeTool: state.activeTool,
      }),
    }
  )
);
