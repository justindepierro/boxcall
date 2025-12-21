/**
 * Dashboard store actions and initial state.
 * Kept separate from store creation to reduce file size/surface area.
 */

import { useAuth } from "../../app/auth-store";
import { debug } from "../../utils/logger";
import {
  adaptWidgetsForContext,
  calculateWidgetPriorities,
  generateAdaptiveRecommendations,
  getContextualActions,
} from "./adaptiveHelpers";
import {
  createDefaultLayout,
  defaultPersonalizationSettings,
  // Future use: role-based default widgets
  getDefaultWidgetsForRole as _getDefaultWidgetsForRole,
} from "./defaults";
import type {
  ContextType,
  ContextualAction,
  DashboardLayout,
  LayoutSize,
  PersonalizationSettings,
  TimeContext,
  UserActivity,
  UserRole,
  WidgetConfig,
  WidgetPriority,
} from "./types";

// Silence lint warning for future use
void _getDefaultWidgetsForRole;

export interface DashboardState {
  currentLayout: DashboardLayout | null;
  availableLayouts: DashboardLayout[];
  personalizationSettings: PersonalizationSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isDragging: boolean;
  draggedWidget: WidgetConfig | null;
  previewLayout: DashboardLayout | null;
  currentContext: ContextType;
  timeContext: TimeContext;
  userActivity: UserActivity[];
  widgetPriorities: WidgetPriority[];
  contextualActions: ContextualAction[];
  adaptiveRecommendations: string[];
}

export interface DashboardActions {
  setCurrentLayout: (layout: DashboardLayout) => void;
  setAvailableLayouts: (layouts: DashboardLayout[]) => void;
  setPersonalizationSettings: (settings: PersonalizationSettings) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  createLayout: (
    name: string,
    baseLayout?: DashboardLayout
  ) => Promise<DashboardLayout>;
  updateLayout: (
    layoutId: string,
    updates: Partial<DashboardLayout>
  ) => Promise<void>;
  deleteLayout: (layoutId: string) => Promise<void>;
  duplicateLayout: (layoutId: string, newName: string) => Promise<DashboardLayout>;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  moveWidget: (widgetId: string, newPosition: WidgetConfig["position"]) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resizeWidget: (widgetId: string, newSize: LayoutSize) => void;
  startDragging: (widget: WidgetConfig) => void;
  stopDragging: () => void;
  updatePreviewLayout: (layout: DashboardLayout) => void;
  applyPreviewLayout: () => void;
  getRecommendedLayouts: (userRole: UserRole) => DashboardLayout[];
  optimizeLayout: () => void;
  setCurrentContext: (context: ContextType) => void;
  setTimeContext: (context: TimeContext) => void;
  trackUserActivity: (activity: UserActivity) => void;
  calculateWidgetPriorities: () => void;
  getContextualActions: () => ContextualAction[];
  updateAdaptiveRecommendations: () => void;
  adaptLayoutForContext: (context: ContextType) => void;
  getSmartWidgetOrder: () => string[];
  saveLayout: () => Promise<void>;
  loadLayouts: (userId: string) => Promise<void>;
  exportLayout: (layoutId: string) => string;
  importLayout: (layoutData: string) => Promise<DashboardLayout>;
  reset: () => void;
  clearError: () => void;
}

export const initialState: DashboardState = {
  currentLayout: null,
  availableLayouts: [],
  personalizationSettings: defaultPersonalizationSettings,
  loading: false,
  saving: false,
  error: null,
  isDragging: false,
  draggedWidget: null,
  previewLayout: null,
  currentContext: "practice-day",
  timeContext: "morning",
  userActivity: [],
  widgetPriorities: [],
  contextualActions: [],
  adaptiveRecommendations: [],
};

export function createBasicSetters(
  set: (partial: Partial<DashboardState>) => void
) {
  return {
    setCurrentLayout: (layout: DashboardLayout) => set({ currentLayout: layout }),
    setAvailableLayouts: (layouts: DashboardLayout[]) =>
      set({ availableLayouts: layouts }),
    setPersonalizationSettings: (settings: PersonalizationSettings) =>
      set({ personalizationSettings: settings }),
    setLoading: (loading: boolean) => set({ loading }),
    setSaving: (saving: boolean) => set({ saving }),
    setError: (error: string | null) => set({ error }),
  };
}

export function createLayoutManagementActions(params: {
  set: (partial: Partial<DashboardState>) => void;
  get: () => DashboardState & DashboardActions;
}) {
  const { set, get } = params;

  return {
    createLayout: async (name: string, baseLayout?: DashboardLayout) => {
      set({ loading: true, error: null });
      try {
        const state = get();
        const authState = useAuth.getState();
        const userId = baseLayout?.userId || authState.user?.id || "current-user";
        const userRole =
          baseLayout?.userRole || (authState.profile?.role as UserRole) || "player";

        const newLayout: DashboardLayout = baseLayout
          ? {
              ...baseLayout,
              id: `layout-${Date.now()}`,
              name,
              isDefault: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : { ...createDefaultLayout(userId, userRole), name };

        newLayout.id = `layout-${Date.now()}`;
        set({
          availableLayouts: [...state.availableLayouts, newLayout],
          currentLayout: newLayout,
          loading: false,
        });
        return newLayout;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create layout";
        set({ error: message, loading: false });
        throw error;
      }
    },

    updateLayout: async (layoutId: string, updates: Partial<DashboardLayout>) => {
      set({ saving: true, error: null });
      try {
        const state = get();
        const updatedLayouts = state.availableLayouts.map((layout) =>
          layout.id === layoutId
            ? { ...layout, ...updates, updatedAt: new Date().toISOString() }
            : layout
        );
        const updatedCurrentLayout =
          state.currentLayout?.id === layoutId
            ? {
                ...state.currentLayout,
                ...updates,
                updatedAt: new Date().toISOString(),
              }
            : state.currentLayout;
        set({
          availableLayouts: updatedLayouts,
          currentLayout: updatedCurrentLayout,
          saving: false,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update layout";
        set({ error: message, saving: false });
        throw error;
      }
    },

    deleteLayout: async (layoutId: string) => {
      const state = get();
      const layoutToDelete = state.availableLayouts.find((l) => l.id === layoutId);
      if (layoutToDelete?.isDefault) {
        throw new Error("Cannot delete default layout");
      }
      const updatedLayouts = state.availableLayouts.filter((l) => l.id !== layoutId);
      const newCurrentLayout =
        state.currentLayout?.id === layoutId
          ? updatedLayouts.find((l) => l.isDefault) || updatedLayouts[0] || null
          : state.currentLayout;
      set({
        availableLayouts: updatedLayouts,
        currentLayout: newCurrentLayout,
      });
    },

    duplicateLayout: async (layoutId: string, newName: string) => {
      const state = get();
      const layoutToDuplicate = state.availableLayouts.find((l) => l.id === layoutId);
      if (!layoutToDuplicate) throw new Error("Layout not found");
      return get().createLayout(newName, layoutToDuplicate);
    },
  };
}

export function createWidgetManagementActions(params: {
  set: (partial: Partial<DashboardState>) => void;
  get: () => DashboardState & DashboardActions;
}) {
  const { set, get } = params;

  return {
    updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => {
      const state = get();
      if (!state.currentLayout) return;
      const updatedWidgets = state.currentLayout.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      );
      const updatedLayout = {
        ...state.currentLayout,
        widgets: updatedWidgets,
        updatedAt: new Date().toISOString(),
      };
      set({ currentLayout: updatedLayout });
      get().updateLayout(updatedLayout.id, { widgets: updatedWidgets });
    },

    moveWidget: (widgetId: string, newPosition: WidgetConfig["position"]) => {
      get().updateWidget(widgetId, { position: newPosition });
    },

    toggleWidgetVisibility: (widgetId: string) => {
      const state = get();
      const widget = state.currentLayout?.widgets.find((w) => w.id === widgetId);
      if (widget) get().updateWidget(widgetId, { visible: !widget.visible });
    },

    resizeWidget: (widgetId: string, newSize: LayoutSize) => {
      get().updateWidget(widgetId, { size: newSize });
    },
  };
}

export function createDragAndDropActions(params: {
  set: (partial: Partial<DashboardState>) => void;
  get: () => DashboardState & DashboardActions;
}) {
  const { set, get } = params;

  return {
    startDragging: (widget: WidgetConfig) => set({ isDragging: true, draggedWidget: widget }),
    stopDragging: () =>
      set({ isDragging: false, draggedWidget: null, previewLayout: null }),
    updatePreviewLayout: (layout: DashboardLayout) => set({ previewLayout: layout }),

    applyPreviewLayout: () => {
      const state = get();
      if (state.previewLayout) {
        set({
          currentLayout: state.previewLayout,
          previewLayout: null,
          isDragging: false,
          draggedWidget: null,
        });
        get().updateLayout(state.previewLayout.id, state.previewLayout);
      }
    },
  };
}

export function createPersistenceActions(params: {
  set: (partial: Partial<DashboardState>) => void;
  get: () => DashboardState & DashboardActions;
}) {
  const { set, get } = params;

  return {
    saveLayout: async () => {
      const state = get();
      if (!state.currentLayout) return;
      await get().updateLayout(state.currentLayout.id, state.currentLayout);
    },

    loadLayouts: async (userId: string) => {
      set({ loading: true, error: null });
      try {
        const state = get();
        const authState = useAuth.getState();
        const userRole = (authState.profile?.role as UserRole) || "player";
        if (state.availableLayouts.length === 0) {
          const defaultLayout = createDefaultLayout(userId, userRole);
          set({
            availableLayouts: [defaultLayout],
            currentLayout: defaultLayout,
            loading: false,
          });
        } else {
          set({ loading: false });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load layouts";
        set({ error: message, loading: false });
      }
    },

    exportLayout: (layoutId: string) => {
      const layout = get().availableLayouts.find((l) => l.id === layoutId);
      return layout ? JSON.stringify(layout, null, 2) : "";
    },

    importLayout: async (layoutData: string) => {
      try {
        const layout: DashboardLayout = JSON.parse(layoutData);
        if (!layout.id || !layout.widgets || !Array.isArray(layout.widgets)) {
          throw new Error("Invalid layout format");
        }
        const importedLayout: DashboardLayout = {
          ...layout,
          id: `imported-${Date.now()}`,
          name: `${layout.name} (Imported)`,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const state = get();
        set({
          availableLayouts: [...state.availableLayouts, importedLayout],
          currentLayout: importedLayout,
        });
        return importedLayout;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to import layout";
        set({ error: message });
        throw new Error(message);
      }
    },
  };
}

export function createAdaptiveActions(params: {
  set: (partial: Partial<DashboardState>) => void;
  get: () => DashboardState & DashboardActions;
}) {
  const { set, get } = params;

  return {
    setCurrentContext: (context: ContextType) => {
      set({ currentContext: context });
      get().calculateWidgetPriorities();
      get().updateAdaptiveRecommendations();
    },

    setTimeContext: (context: TimeContext) => {
      set({ timeContext: context });
      get().calculateWidgetPriorities();
    },

    trackUserActivity: (activity: UserActivity) => {
      const state = get();
      const updatedActivity = [...state.userActivity, activity].slice(-100);
      set({ userActivity: updatedActivity });
      get().calculateWidgetPriorities();
    },

    calculateWidgetPriorities: () => {
      const state = get();
      const priorities = calculateWidgetPriorities(
        state.currentLayout,
        state.userActivity,
        state.currentContext,
        state.timeContext,
        state.personalizationSettings
      );
      set({ widgetPriorities: priorities });
    },

    getContextualActions: () => {
      const state = get();
      return getContextualActions(
        state.currentContext,
        state.personalizationSettings
      );
    },

    updateAdaptiveRecommendations: () => {
      const state = get();
      const recommendations = generateAdaptiveRecommendations(
        state.currentLayout,
        state.userActivity,
        state.currentContext
      );
      set({ adaptiveRecommendations: recommendations });
    },

    adaptLayoutForContext: (context: ContextType) => {
      const state = get();
      if (
        !state.currentLayout ||
        !state.personalizationSettings.adaptiveFeatures.enableAutoLayoutOptimization
      ) {
        return;
      }
      const adaptedWidgets = adaptWidgetsForContext(
        state.currentLayout.widgets,
        context
      );
      set({
        currentLayout: {
          ...state.currentLayout,
          widgets: adaptedWidgets,
          updatedAt: new Date().toISOString(),
        },
      });
    },

    getSmartWidgetOrder: () => {
      const state = get();
      if (!state.personalizationSettings.adaptiveFeatures.enableSmartPrioritization) {
        return state.currentLayout?.widgets.map((w) => w.id) || [];
      }
      return [...state.widgetPriorities]
        .sort((a, b) => b.priority - a.priority)
        .map((p) => p.widgetId);
    },
  };
}

export function createSimpleActions(set: (partial: Partial<DashboardState>) => void) {
  return {
    getRecommendedLayouts: (userRole: UserRole) => [
      createDefaultLayout("temp", userRole),
    ],
    optimizeLayout: () =>
      debug("[DashboardStore] Layout optimization not yet implemented"),
    reset: () => set(initialState),
    clearError: () => set({ error: null }),
  };
}
