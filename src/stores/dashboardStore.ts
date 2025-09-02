import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Dashboard Personalization Store
 * Phase 2A: Smart Dashboard Personalization
 *
 * Manages user dashboard layout preferences, widget configurations,
 * and intelligent personalization features.
 */

export type WidgetType =
  | "profile"
  | "calendar"
  | "trophy-shelf"
  | "team-feeds"
  | "quick-actions"
  | "performance-stats"
  | "announcements"
  | "practice-plans"
  | "game-schedule";

export type LayoutSize = "small" | "medium" | "large";
export type UserRole = "coach" | "player" | "family" | "admin";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  position: {
    row: number;
    column: number;
    order: number;
  };
  size: LayoutSize;
  preferences: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  userRole: UserRole;
  isDefault: boolean;
  widgets: WidgetConfig[];
  gridConfig: {
    columns: number;
    gap: number;
    padding: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizationSettings {
  theme: "light" | "dark" | "auto";
  compactMode: boolean;
  showWelcomeMessages: boolean;
  enableNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  preferredLanguage: string;
}

interface DashboardState {
  // Current state
  currentLayout: DashboardLayout | null;
  availableLayouts: DashboardLayout[];
  personalizationSettings: PersonalizationSettings;

  // Loading states
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Widget interaction state
  isDragging: boolean;
  draggedWidget: WidgetConfig | null;
  previewLayout: DashboardLayout | null;

  // Actions
  setCurrentLayout: (layout: DashboardLayout) => void;
  setAvailableLayouts: (layouts: DashboardLayout[]) => void;
  setPersonalizationSettings: (settings: PersonalizationSettings) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;

  // Layout management
  createLayout: (
    name: string,
    baseLayout?: DashboardLayout
  ) => Promise<DashboardLayout>;
  updateLayout: (
    layoutId: string,
    updates: Partial<DashboardLayout>
  ) => Promise<void>;
  deleteLayout: (layoutId: string) => Promise<void>;
  duplicateLayout: (
    layoutId: string,
    newName: string
  ) => Promise<DashboardLayout>;

  // Widget management
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  moveWidget: (widgetId: string, newPosition: WidgetConfig["position"]) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  resizeWidget: (widgetId: string, newSize: LayoutSize) => void;

  // Drag and drop
  startDragging: (widget: WidgetConfig) => void;
  stopDragging: () => void;
  updatePreviewLayout: (layout: DashboardLayout) => void;
  applyPreviewLayout: () => void;

  // Smart recommendations
  getRecommendedLayouts: (userRole: UserRole) => DashboardLayout[];
  optimizeLayout: () => void;

  // Persistence
  saveLayout: () => Promise<void>;
  loadLayouts: (userId: string) => Promise<void>;
  exportLayout: (layoutId: string) => string;
  importLayout: (layoutData: string) => Promise<DashboardLayout>;

  // Utilities
  reset: () => void;
  clearError: () => void;
}

// Default personalization settings
const defaultPersonalizationSettings: PersonalizationSettings = {
  theme: "auto",
  compactMode: false,
  showWelcomeMessages: true,
  enableNotifications: true,
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
  preferredLanguage: "en",
};

// Default widget configurations for different roles
export const getDefaultWidgetsForRole = (role: UserRole): WidgetConfig[] => {
  const commonWidgets: WidgetConfig[] = [
    {
      id: "profile",
      type: "profile",
      title: "Profile",
      visible: true,
      position: { row: 0, column: 0, order: 0 },
      size: "medium",
      preferences: {},
    },
    {
      id: "calendar",
      type: "calendar",
      title: "Calendar",
      visible: true,
      position: { row: 1, column: 0, order: 3 },
      size: "large",
      preferences: { view: "week" },
    },
  ];

  const roleSpecificWidgets: Record<UserRole, WidgetConfig[]> = {
    coach: [
      ...commonWidgets,
      {
        id: "team-feeds",
        type: "team-feeds",
        title: "Team Updates",
        visible: true,
        position: { row: 0, column: 1, order: 1 },
        size: "medium",
        preferences: { showAll: true },
      },
      {
        id: "practice-plans",
        type: "practice-plans",
        title: "Practice Plans",
        visible: true,
        position: { row: 0, column: 2, order: 2 },
        size: "medium",
        preferences: { upcoming: 3 },
      },
    ],
    player: [
      ...commonWidgets,
      {
        id: "trophy-shelf",
        type: "trophy-shelf",
        title: "Achievements",
        visible: true,
        position: { row: 0, column: 1, order: 1 },
        size: "medium",
        preferences: { showRecent: 5 },
      },
      {
        id: "performance-stats",
        type: "performance-stats",
        title: "Performance",
        visible: true,
        position: { row: 0, column: 2, order: 2 },
        size: "medium",
        preferences: { period: "month" },
      },
    ],
    family: [
      ...commonWidgets,
      {
        id: "announcements",
        type: "announcements",
        title: "Announcements",
        visible: true,
        position: { row: 0, column: 1, order: 1 },
        size: "medium",
        preferences: { priority: "high" },
      },
      {
        id: "game-schedule",
        type: "game-schedule",
        title: "Games",
        visible: true,
        position: { row: 0, column: 2, order: 2 },
        size: "medium",
        preferences: { upcoming: 5 },
      },
    ],
    admin: [
      ...commonWidgets,
      {
        id: "team-feeds",
        type: "team-feeds",
        title: "All Teams",
        visible: true,
        position: { row: 0, column: 1, order: 1 },
        size: "large",
        preferences: { showAll: true },
      },
    ],
  };

  return roleSpecificWidgets[role] || commonWidgets;
};

// Create default layout for a user role
export const createDefaultLayout = (
  userId: string,
  userRole: UserRole
): DashboardLayout => {
  const now = new Date().toISOString();

  return {
    id: `default-${userRole}-${userId}`,
    name: `Default ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Layout`,
    userId,
    userRole,
    isDefault: true,
    widgets: getDefaultWidgetsForRole(userRole),
    gridConfig: {
      columns: 3,
      gap: 24,
      padding: 16,
    },
    createdAt: now,
    updatedAt: now,
  };
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLayout: null,
      availableLayouts: [],
      personalizationSettings: defaultPersonalizationSettings,
      loading: false,
      saving: false,
      error: null,
      isDragging: false,
      draggedWidget: null,
      previewLayout: null,

      // Basic setters
      setCurrentLayout: (layout) => set({ currentLayout: layout }),
      setAvailableLayouts: (layouts) => set({ availableLayouts: layouts }),
      setPersonalizationSettings: (settings) =>
        set({ personalizationSettings: settings }),
      setLoading: (loading) => set({ loading }),
      setSaving: (saving) => set({ saving }),
      setError: (error) => set({ error }),

      // Layout management
      createLayout: async (name, baseLayout) => {
        set({ loading: true, error: null });

        try {
          const state = get();
          const userId = baseLayout?.userId || "current-user"; // TODO: Get from auth
          const userRole = baseLayout?.userRole || "player"; // TODO: Get from auth

          const newLayout: DashboardLayout = baseLayout
            ? {
                ...baseLayout,
                id: `layout-${Date.now()}`,
                name,
                isDefault: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : createDefaultLayout(userId, userRole);

          newLayout.id = `layout-${Date.now()}`;
          newLayout.name = name;

          const updatedLayouts = [...state.availableLayouts, newLayout];
          set({
            availableLayouts: updatedLayouts,
            currentLayout: newLayout,
            loading: false,
          });

          return newLayout;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create layout",
            loading: false,
          });
          throw error;
        }
      },

      updateLayout: async (layoutId, updates) => {
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
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update layout",
            saving: false,
          });
          throw error;
        }
      },

      deleteLayout: async (layoutId) => {
        const state = get();
        const layoutToDelete = state.availableLayouts.find(
          (l) => l.id === layoutId
        );

        if (layoutToDelete?.isDefault) {
          throw new Error("Cannot delete default layout");
        }

        const updatedLayouts = state.availableLayouts.filter(
          (l) => l.id !== layoutId
        );
        const newCurrentLayout =
          state.currentLayout?.id === layoutId
            ? updatedLayouts.find((l) => l.isDefault) ||
              updatedLayouts[0] ||
              null
            : state.currentLayout;

        set({
          availableLayouts: updatedLayouts,
          currentLayout: newCurrentLayout,
        });
      },

      duplicateLayout: async (layoutId, newName) => {
        const state = get();
        const layoutToDuplicate = state.availableLayouts.find(
          (l) => l.id === layoutId
        );

        if (!layoutToDuplicate) {
          throw new Error("Layout not found");
        }

        return get().createLayout(newName, layoutToDuplicate);
      },

      // Widget management
      updateWidget: (widgetId, updates) => {
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

        // Auto-save after widget update
        get().updateLayout(updatedLayout.id, { widgets: updatedWidgets });
      },

      moveWidget: (widgetId, newPosition) => {
        get().updateWidget(widgetId, { position: newPosition });
      },

      toggleWidgetVisibility: (widgetId) => {
        const state = get();
        const widget = state.currentLayout?.widgets.find(
          (w) => w.id === widgetId
        );
        if (widget) {
          get().updateWidget(widgetId, { visible: !widget.visible });
        }
      },

      resizeWidget: (widgetId, newSize) => {
        get().updateWidget(widgetId, { size: newSize });
      },

      // Drag and drop
      startDragging: (widget) => {
        set({ isDragging: true, draggedWidget: widget });
      },

      stopDragging: () => {
        set({ isDragging: false, draggedWidget: null, previewLayout: null });
      },

      updatePreviewLayout: (layout) => {
        set({ previewLayout: layout });
      },

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

      // Smart recommendations
      getRecommendedLayouts: (userRole) => {
        // TODO: Implement ML-based recommendations
        const defaultLayout = createDefaultLayout("temp", userRole);
        return [defaultLayout];
      },

      optimizeLayout: () => {
        // TODO: Implement layout optimization based on usage patterns
        console.log("Layout optimization not yet implemented");
      },

      // Persistence
      saveLayout: async () => {
        const state = get();
        if (!state.currentLayout) return;

        await get().updateLayout(state.currentLayout.id, state.currentLayout);
      },

      loadLayouts: async (userId) => {
        set({ loading: true, error: null });

        try {
          // TODO: Implement actual API call to load layouts
          // For now, create default layout if none exists
          const state = get();
          if (state.availableLayouts.length === 0) {
            const defaultLayout = createDefaultLayout(userId, "player"); // TODO: Get role from auth
            set({
              availableLayouts: [defaultLayout],
              currentLayout: defaultLayout,
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load layouts",
            loading: false,
          });
        }
      },

      exportLayout: (layoutId) => {
        const state = get();
        const layout = state.availableLayouts.find((l) => l.id === layoutId);
        return layout ? JSON.stringify(layout, null, 2) : "";
      },

      importLayout: async (layoutData) => {
        try {
          const layout: DashboardLayout = JSON.parse(layoutData);

          // Validate layout structure
          if (!layout.id || !layout.widgets || !Array.isArray(layout.widgets)) {
            throw new Error("Invalid layout format");
          }

          // Generate new ID and update timestamps
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
          const errorMessage =
            error instanceof Error ? error.message : "Failed to import layout";
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      // Utilities
      reset: () => {
        set({
          currentLayout: null,
          availableLayouts: [],
          personalizationSettings: defaultPersonalizationSettings,
          loading: false,
          saving: false,
          error: null,
          isDragging: false,
          draggedWidget: null,
          previewLayout: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "dashboard-store",
      partialize: (state) => ({
        availableLayouts: state.availableLayouts,
        personalizationSettings: state.personalizationSettings,
        currentLayout: state.currentLayout,
      }),
    }
  )
);
