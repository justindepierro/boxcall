/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { ServerPlaybookViewPreset } from "../types/playbookViewPreset";
import { debug } from "../utils/logger";
import type { PlaybookFilters, ContextAdvancedFilter } from "../types/filters";
import { EMPTY_FILTERS, filtersToLegacy } from "../types/filters";

export type CoachingView =
  | "playbook"
  | "practice-script"
  | "game-plan"
  | "analytics";

export interface PlaybookFiltersState {
  searchQuery: string;
  selectedCategory?: string;
  selectedSubcategory?: string;
  advancedFilters: ContextAdvancedFilter[];
  /** Unified filters object (Phase 3 - replaces above legacy state) */
  filters: PlaybookFilters;
}

export interface PlaybookSelectionState {
  enableBulkOperations: boolean;
  selectedPlayIds: Set<string>;
}

export interface PlaybookPresetState {
  filterPresets: { id: string; name: string; filters: unknown }[];
  serverPresets: ServerPlaybookViewPreset[];
  serverPresetsLoading: boolean;
  serverPresetsError?: string | null;
  activePresetId?: string;
  activeServerPresetId?: string;
  recentViews: { id: string; scope: "server" | "local" }[]; // MRU applied presets (server or local)
}

export interface PlaybookMetricsState {
  playsCreated: number;
  diagramCoverage: number;
  streakDays: number;
}

export interface PlaybookUIState {
  currentView: CoachingView;
  currentTeamType: "offense" | "defense" | "special-teams";
  showBuilder: boolean;
  showImport: boolean;
  showMobileFilters: boolean;
  showMobileGlossary: boolean;
  importedLocalPresets: boolean;
  refreshTrigger: number;
  showCelebration: boolean;
  recentAchievement: string | null;
  showConfettiOverlay: boolean;
}

export interface PlaybookState
  extends PlaybookFiltersState,
    PlaybookSelectionState,
    PlaybookPresetState,
    PlaybookMetricsState,
    PlaybookUIState {}

const initialState: PlaybookState = {
  searchQuery: "",
  selectedCategory: undefined,
  selectedSubcategory: undefined,
  advancedFilters: [],
  filters: EMPTY_FILTERS,
  enableBulkOperations: false,
  selectedPlayIds: new Set(),
  filterPresets: [],
  serverPresets: [],
  serverPresetsLoading: true,
  serverPresetsError: null,
  activePresetId: undefined,
  activeServerPresetId: undefined,
  recentViews: [],
  playsCreated: 0,
  diagramCoverage: 0,
  streakDays: 0,
  currentView: "playbook",
  currentTeamType: "offense",
  showBuilder: false,
  showImport: false,
  showMobileFilters: false,
  showMobileGlossary: false,
  importedLocalPresets: false,
  refreshTrigger: 0,
  showCelebration: false,
  recentAchievement: null,
  showConfettiOverlay: false,
};

// ACTION TYPES
export type PlaybookAction =
  | { type: "SET_SEARCH"; query: string }
  | { type: "SET_CATEGORY"; category?: string; subcategory?: string }
  | { type: "SET_FILTERS"; filters: PlaybookFilters }
  | {
      type: "SET_ADVANCED_FILTERS";
      filters: PlaybookFiltersState["advancedFilters"];
    }
  | { type: "TOGGLE_BULK" }
  | { type: "SET_SELECTION"; selection: Set<string> }
  | { type: "TOGGLE_PLAY_SELECTION"; playId: string }
  | { type: "SELECT_ALL_PLAYS"; playIds: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_PRESETS"; presets: PlaybookPresetState["filterPresets"] }
  | { type: "SET_SERVER_PRESETS"; presets: ServerPlaybookViewPreset[] }
  | { type: "SET_SERVER_PRESETS_LOADING"; loading: boolean }
  | { type: "SET_SERVER_PRESETS_ERROR"; error?: string | null }
  | { type: "SET_ACTIVE_PRESET"; id?: string }
  | { type: "SET_ACTIVE_SERVER_PRESET"; id?: string }
  | { type: "ADD_RECENT_VIEW"; id: string; scope: "server" | "local" }
  | { type: "REMOVE_RECENT_VIEW"; id: string }
  | { type: "SET_VIEW"; view: CoachingView }
  | { type: "SET_TEAM_TYPE"; teamType: "offense" | "defense" | "special-teams" }
  | { type: "SET_SHOW_BUILDER"; value: boolean }
  | { type: "SET_SHOW_IMPORT"; value: boolean }
  | { type: "SET_MOBILE_FILTERS"; value: boolean }
  | { type: "SET_MOBILE_GLOSSARY"; value: boolean }
  | { type: "INCREMENT_REFRESH" }
  | { type: "SET_PLAYS_CREATED"; count: number }
  | { type: "SET_DIAGRAM_COVERAGE"; coverage: number }
  | { type: "SET_STREAK_DAYS"; days: number }
  | { type: "TRIGGER_CELEBRATION"; achievement: string }
  | { type: "HIDE_CELEBRATION" }
  | { type: "SHOW_CONFETTI_OVERLAY" }
  | { type: "HIDE_CONFETTI_OVERLAY" }
  | { type: "SET_IMPORTED_LOCAL_PRESETS"; value: boolean };

type PlaybookActionHandler = (
  state: PlaybookState,
  action: any
) => PlaybookState;

const playbookActionHandlers: Partial<
  Record<PlaybookAction["type"], PlaybookActionHandler>
> = {
  SET_SEARCH: (state, action: { query: string }) => ({
    ...state,
    searchQuery: action.query,
    // Also update unified filters for consistency
    filters: { ...state.filters, search: action.query },
  }),
  SET_CATEGORY: (
    state,
    action: {
      category: PlaybookState["selectedCategory"];
      subcategory?: PlaybookState["selectedSubcategory"];
    }
  ) => ({
    ...state,
    selectedCategory: action.category,
    selectedSubcategory: action.subcategory,
  }),
  SET_FILTERS: (state, action: { filters: PlaybookFilters }) => ({
    ...state,
    filters: action.filters,
    // Keep legacy state in sync for backward compatibility
    searchQuery: action.filters.search,
    advancedFilters: filtersToLegacy(action.filters),
    selectedCategory: action.filters.favoritesOnly
      ? "favorites"
      : action.filters.mostUsedOnly
        ? "most-used"
        : (action.filters.playType ?? undefined),
  }),
  SET_ADVANCED_FILTERS: (
    state,
    action: { filters: PlaybookState["advancedFilters"] }
  ) => ({
    ...state,
    advancedFilters: action.filters,
  }),
  TOGGLE_BULK: (state) => {
    debug("[PlaybookContext] TOGGLE_BULK:", {
      currentState: state.enableBulkOperations,
      newState: !state.enableBulkOperations,
    });
    return {
      ...state,
      enableBulkOperations: !state.enableBulkOperations,
      selectedPlayIds: new Set(),
    };
  },
  SET_SELECTION: (state, action: { selection: Set<string> }) => {
    debug("[PlaybookContext] SET_SELECTION:", {
      oldSize: state.selectedPlayIds?.size,
      newSize: action.selection.size,
    });
    return { ...state, selectedPlayIds: action.selection };
  },
  TOGGLE_PLAY_SELECTION: (state, action: { playId: string }) => {
    const newSelection = new Set(state.selectedPlayIds);
    if (newSelection.has(action.playId)) {
      newSelection.delete(action.playId);
    } else {
      newSelection.add(action.playId);
    }
    return { ...state, selectedPlayIds: newSelection };
  },
  SELECT_ALL_PLAYS: (state, action: { playIds: string[] }) => ({
    ...state,
    selectedPlayIds: new Set(action.playIds),
  }),
  CLEAR_SELECTION: (state) => ({ ...state, selectedPlayIds: new Set() }),
  SET_PRESETS: (
    state,
    action: { presets: PlaybookPresetState["filterPresets"] }
  ) => ({
    ...state,
    filterPresets: action.presets,
  }),
  SET_SERVER_PRESETS: (
    state,
    action: { presets: ServerPlaybookViewPreset[] }
  ) => ({
    ...state,
    serverPresets: action.presets,
  }),
  SET_SERVER_PRESETS_LOADING: (state, action: { loading: boolean }) => ({
    ...state,
    serverPresetsLoading: action.loading,
  }),
  SET_SERVER_PRESETS_ERROR: (state, action: { error?: string | null }) => ({
    ...state,
    serverPresetsError: action.error,
  }),
  SET_ACTIVE_PRESET: (state, action: { id?: string }) => ({
    ...state,
    activePresetId: action.id,
    activeServerPresetId: undefined,
  }),
  SET_ACTIVE_SERVER_PRESET: (state, action: { id?: string }) => ({
    ...state,
    activeServerPresetId: action.id,
    activePresetId: undefined,
  }),
  ADD_RECENT_VIEW: (
    state,
    action: { id: string; scope: "server" | "local" }
  ) => {
    const existing = state.recentViews.filter((v) => v.id !== action.id);
    const next = [{ id: action.id, scope: action.scope }, ...existing].slice(
      0,
      5
    );
    return { ...state, recentViews: next };
  },
  REMOVE_RECENT_VIEW: (state, action: { id: string }) => ({
    ...state,
    recentViews: state.recentViews.filter((v) => v.id !== action.id),
  }),
  SET_VIEW: (state, action: { view: CoachingView }) => ({
    ...state,
    currentView: action.view,
  }),
  SET_TEAM_TYPE: (
    state,
    action: { teamType: "offense" | "defense" | "special-teams" }
  ) => ({
    ...state,
    currentTeamType: action.teamType,
  }),
  SET_SHOW_BUILDER: (state, action: { value: boolean }) => ({
    ...state,
    showBuilder: action.value,
  }),
  SET_SHOW_IMPORT: (state, action: { value: boolean }) => ({
    ...state,
    showImport: action.value,
  }),
  SET_MOBILE_FILTERS: (state, action: { value: boolean }) => ({
    ...state,
    showMobileFilters: action.value,
  }),
  SET_MOBILE_GLOSSARY: (state, action: { value: boolean }) => ({
    ...state,
    showMobileGlossary: action.value,
  }),
  INCREMENT_REFRESH: (state) => ({
    ...state,
    refreshTrigger: state.refreshTrigger + 1,
  }),
  SET_PLAYS_CREATED: (state, action: { count: number }) => ({
    ...state,
    playsCreated: action.count,
  }),
  SET_DIAGRAM_COVERAGE: (state, action: { coverage: number }) => ({
    ...state,
    diagramCoverage: action.coverage,
  }),
  SET_STREAK_DAYS: (state, action: { days: number }) => ({
    ...state,
    streakDays: action.days,
  }),
  TRIGGER_CELEBRATION: (state, action: { achievement: string }) => ({
    ...state,
    recentAchievement: action.achievement,
    showCelebration: true,
  }),
  HIDE_CELEBRATION: (state) => ({ ...state, showCelebration: false }),
  SHOW_CONFETTI_OVERLAY: (state) => ({ ...state, showConfettiOverlay: true }),
  HIDE_CONFETTI_OVERLAY: (state) => ({ ...state, showConfettiOverlay: false }),
  SET_IMPORTED_LOCAL_PRESETS: (state, action: { value: boolean }) => ({
    ...state,
    importedLocalPresets: action.value,
  }),
};

function reducer(state: PlaybookState, action: PlaybookAction): PlaybookState {
  const handler = playbookActionHandlers[action.type];
  return handler ? handler(state, action) : state;
}

interface PlaybookContextValue {
  state: PlaybookState;
  dispatch: React.Dispatch<PlaybookAction>;
}

const PlaybookContext = createContext<PlaybookContextValue | undefined>(
  undefined
);

export const PlaybookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <PlaybookContext.Provider value={value}>
      {children}
    </PlaybookContext.Provider>
  );
};

// Hook accessor
export const usePlaybook = () => {
  const ctx = useContext(PlaybookContext);
  if (!ctx) throw new Error("usePlaybook must be used within PlaybookProvider");
  return ctx;
};
