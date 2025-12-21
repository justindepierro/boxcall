import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createAdaptiveActions,
  createBasicSetters,
  createDragAndDropActions,
  createLayoutManagementActions,
  createPersistenceActions,
  createSimpleActions,
  createWidgetManagementActions,
  initialState,
  type DashboardActions,
  type DashboardState,
} from "./actions";

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...createBasicSetters(set),
      ...createLayoutManagementActions({ set, get }),
      ...createWidgetManagementActions({ set, get }),
      ...createDragAndDropActions({ set, get }),
      ...createPersistenceActions({ set, get }),
      ...createAdaptiveActions({ set, get }),
      ...createSimpleActions(set),
    }),
    {
      name: "dashboard-store",
      partialize: (state) => ({
        availableLayouts: state.availableLayouts,
        personalizationSettings: state.personalizationSettings,
        currentLayout: state.currentLayout,
        currentContext: state.currentContext,
        timeContext: state.timeContext,
        userActivity: state.userActivity.slice(-50),
        widgetPriorities: state.widgetPriorities,
      }),
    }
  )
);
