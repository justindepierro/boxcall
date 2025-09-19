/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
} from "react";
import type { ServerPlaybookViewPreset } from "../types/playbookViewPreset";
import type { PersonnelSettings } from "../types/personnel";
import { PersonnelSettingsService } from "@services";

// Default personnel settings
const createDefaultPersonnelSettings = (): PersonnelSettings => {
  const now = new Date();
  return {
    groupings: [
      {
        id: "default",
        name: "Default",
        positions: [
          { id: "qb", label: "QB", position: "Quarterback", isLocked: true },
          {
            id: "lot",
            label: "LOT",
            position: "Left Offensive Tackle",
            isLocked: true,
          },
          {
            id: "log",
            label: "LOG",
            position: "Left Offensive Guard",
            isLocked: true,
          },
          { id: "c", label: "C", position: "Center", isLocked: true },
          {
            id: "rog",
            label: "ROG",
            position: "Right Offensive Guard",
            isLocked: true,
          },
          {
            id: "rot",
            label: "ROT",
            position: "Right Offensive Tackle",
            isLocked: true,
          },
          { id: "rb", label: "RB", position: "Running Back" },
          { id: "te1", label: "TE 1", position: "Tight End" },
          { id: "wr1", label: "WR 1", position: "Wide Receiver" },
          { id: "wr2", label: "WR 2", position: "Wide Receiver" },
          { id: "wr3", label: "WR 3", position: "Wide Receiver" },
        ],
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    activeGroupingId: "default",
  };
};

export type CoachingView = "playbook" | "practice-script" | "game-plan";

export interface PlaybookFiltersState {
  searchQuery: string;
  selectedFilters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
  selectedCategory?: string;
  selectedSubcategory?: string;
  advancedFilters: Array<{
    id: string;
    field: string;
    operator: "equals" | "contains" | "in";
    value: string | string[];
    label: string;
  }>;
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
  showBuilder: boolean;
  showImport: boolean;
  showMobileFilters: boolean;
  showMobileGlossary: boolean;
  importedLocalPresets: boolean;
  refreshTrigger: number;
  showCelebration: boolean;
  recentAchievement: string | null;
  showConfettiOverlay: boolean;
  showPersonnelSettings: boolean;
  personnelSettings: PersonnelSettings;
}

export interface PlaybookState
  extends PlaybookFiltersState,
    PlaybookSelectionState,
    PlaybookPresetState,
    PlaybookMetricsState,
    PlaybookUIState {}

const initialState: PlaybookState = {
  searchQuery: "",
  selectedFilters: {},
  selectedCategory: undefined,
  selectedSubcategory: undefined,
  advancedFilters: [],
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
  showBuilder: false,
  showImport: false,
  showMobileFilters: false,
  showMobileGlossary: false,
  importedLocalPresets: false,
  refreshTrigger: 0,
  showCelebration: false,
  recentAchievement: null,
  showConfettiOverlay: false,
  showPersonnelSettings: false,
  personnelSettings: createDefaultPersonnelSettings(),
};

// ACTION TYPES
export type PlaybookAction =
  | { type: "SET_SEARCH"; query: string }
  | {
      type: "SET_SELECTED_FILTERS";
      filters: PlaybookFiltersState["selectedFilters"];
    }
  | { type: "SET_CATEGORY"; category?: string; subcategory?: string }
  | {
      type: "SET_ADVANCED_FILTERS";
      filters: PlaybookFiltersState["advancedFilters"];
    }
  | { type: "TOGGLE_BULK" }
  | { type: "SET_SELECTION"; selection: Set<string> }
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
  | { type: "SET_IMPORTED_LOCAL_PRESETS"; value: boolean }
  | { type: "SET_PERSONNEL_SETTINGS"; settings: PersonnelSettings }
  | { type: "SHOW_PERSONNEL_SETTINGS" }
  | { type: "HIDE_PERSONNEL_SETTINGS" }
  | { type: "LOAD_PERSONNEL_SETTINGS_FROM_SERVER" };

function reducer(state: PlaybookState, action: PlaybookAction): PlaybookState {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_SELECTED_FILTERS":
      return { ...state, selectedFilters: action.filters };
    case "SET_CATEGORY":
      return {
        ...state,
        selectedCategory: action.category,
        selectedSubcategory: action.subcategory,
      };
    case "SET_ADVANCED_FILTERS":
      return { ...state, advancedFilters: action.filters };
    case "TOGGLE_BULK":
      return {
        ...state,
        enableBulkOperations: !state.enableBulkOperations,
        selectedPlayIds: new Set(),
      };
    case "SET_SELECTION":
      return { ...state, selectedPlayIds: action.selection };
    case "CLEAR_SELECTION":
      return { ...state, selectedPlayIds: new Set() };
    case "SET_PRESETS":
      return { ...state, filterPresets: action.presets };
    case "SET_SERVER_PRESETS":
      return { ...state, serverPresets: action.presets };
    case "SET_SERVER_PRESETS_LOADING":
      return { ...state, serverPresetsLoading: action.loading };
    case "SET_SERVER_PRESETS_ERROR":
      return { ...state, serverPresetsError: action.error };
    case "SET_ACTIVE_PRESET":
      return {
        ...state,
        activePresetId: action.id,
        activeServerPresetId: undefined,
      };
    case "SET_ACTIVE_SERVER_PRESET":
      return {
        ...state,
        activeServerPresetId: action.id,
        activePresetId: undefined,
      };
    case "ADD_RECENT_VIEW": {
      const existing = state.recentViews.filter((v) => v.id !== action.id);
      const next = [{ id: action.id, scope: action.scope }, ...existing].slice(
        0,
        5
      );
      return { ...state, recentViews: next };
    }
    case "REMOVE_RECENT_VIEW": {
      return {
        ...state,
        recentViews: state.recentViews.filter((v) => v.id !== action.id),
      };
    }
    case "SET_VIEW":
      return { ...state, currentView: action.view };
    case "SET_SHOW_BUILDER":
      return { ...state, showBuilder: action.value };
    case "SET_SHOW_IMPORT":
      return { ...state, showImport: action.value };
    case "SET_MOBILE_FILTERS":
      return { ...state, showMobileFilters: action.value };
    case "SET_MOBILE_GLOSSARY":
      return { ...state, showMobileGlossary: action.value };
    case "INCREMENT_REFRESH":
      return { ...state, refreshTrigger: state.refreshTrigger + 1 };
    case "SET_PLAYS_CREATED":
      return { ...state, playsCreated: action.count };
    case "SET_DIAGRAM_COVERAGE":
      return { ...state, diagramCoverage: action.coverage };
    case "SET_STREAK_DAYS":
      return { ...state, streakDays: action.days };
    case "TRIGGER_CELEBRATION":
      return {
        ...state,
        recentAchievement: action.achievement,
        showCelebration: true,
      };
    case "HIDE_CELEBRATION":
      return { ...state, showCelebration: false };
    case "SHOW_CONFETTI_OVERLAY":
      return { ...state, showConfettiOverlay: true };
    case "HIDE_CONFETTI_OVERLAY":
      return { ...state, showConfettiOverlay: false };
    case "SET_IMPORTED_LOCAL_PRESETS":
      return { ...state, importedLocalPresets: action.value };
    case "SET_PERSONNEL_SETTINGS":
      return { ...state, personnelSettings: action.settings };
    case "SHOW_PERSONNEL_SETTINGS":
      return { ...state, showPersonnelSettings: true };
    case "HIDE_PERSONNEL_SETTINGS":
      return { ...state, showPersonnelSettings: false };
    case "LOAD_PERSONNEL_SETTINGS_FROM_SERVER":
      // This will be handled asynchronously by the component
      return state;
    default:
      return state;
  }
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

  // Load personnel settings from server on mount
  useEffect(() => {
    const loadPersonnelSettings = async () => {
      try {
        const serverSettings = await PersonnelSettingsService.loadSettings();
        if (serverSettings) {
          dispatch({
            type: "SET_PERSONNEL_SETTINGS",
            settings: serverSettings,
          });
        }
      } catch (error) {
        console.error("Failed to load personnel settings from server:", error);
        // Fall back to default settings (already set in initialState)
      }
    };

    loadPersonnelSettings();
  }, []);

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
