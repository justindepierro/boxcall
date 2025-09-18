import { useRef } from "react";

import { useAuth } from "../../../app/auth-store";
import { useDevMode } from "../../../app/dev-mode-hooks";

// Data + mutations now handled via useCalendarData
import { useCalendarActions } from "./useCalendarActions";
import { useCalendarData } from "./useCalendarData";
import { useCalendarFilters } from "./useCalendarFilters";
import { useCalendarNavigation } from "./useCalendarNavigation";
import { useCalendarPrefetch } from "./useCalendarPrefetch";
import { useCalendarSelection } from "./useCalendarSelection";
import {
  useCalendarUrlState,
  mapQueryViewToInternal,
} from "./useCalendarUrlState";

// Event creation moved to actions hook
import type { BoxCallCalendarRef } from "../BoxCallCalendar";

/**
 * useCalendarShellController
 * Centralized orchestration for CalendarShell (data, navigation, selection, URL sync, prefetch, filters).
 * Shrinks shell component to pure layout/composition.
 */
export function useCalendarShellController() {
  const { user, profile } = useAuth();
  const { devMode } = useDevMode();
  const calendarRef = useRef<BoxCallCalendarRef | null>(null);

  // Filters + search
  const {
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    debouncedSearch,
  } = useCalendarFilters();

  // Selection / modal state
  const selection = useCalendarSelection();
  const {
    selectedEvent,
    setSelectedEvent,
    showEventModal,
    setShowEventModal,
    isCreatingEvent,
    setIsCreatingEvent,
    isEditingEvent,
    setIsEditingEvent,
    resetSelection,
  } = selection;

  // Data + mutations
  const {
    events,
    loading,
    error,
    createEventMutation,
    deleteEventMutation,
    updateEventMutation,
  } = useCalendarData({
    userId: user?.id || "",
    devMode,
    filters: {
      teamIds: filters.teamIds,
      eventTypes: filters.eventTypes,
      dateRange: filters.dateRange,
    },
    debouncedSearch,
  });

  // URL state + incoming sync
  const { setState: setUrlState } = useCalendarUrlState({
    onChange: (s) => {
      // view sync
      if (s.view) {
        const internal = mapQueryViewToInternal(s.view);
        if (
          internal &&
          internal !== navigation.currentView &&
          ["dayGridMonth", "timeGridWeek", "timeGridDay"].includes(internal)
        ) {
          navigation.setCurrentView(
            internal as "dayGridMonth" | "timeGridWeek" | "timeGridDay"
          );
          calendarRef.current?.changeView(internal);
        }
      }
      // date sync
      if (s.date) {
        const api = calendarRef.current?.getApi();
        if (api) {
          const currentDate = api.getDate();
          const desired = new Date(s.date + "T00:00:00");
          if (
            Math.abs(desired.getTime() - currentDate.getTime()) >
            1000 * 60 * 60 * 6
          ) {
            api.gotoDate(desired);
          }
        }
      }
      // event deep link
      if (s.event && events.length) {
        const match = events.find(
          (e) =>
            typeof (e as { id?: unknown }).id === "string" &&
            (e as { id: string }).id === s.event
        );
        if (match) {
          setSelectedEvent(match);
          setShowEventModal(true);
        }
      }
    },
  });

  // URL patch adapter (narrow view values)
  type CalendarView = "month" | "week" | "day";
  interface CalendarUrlPatch {
    view?: CalendarView;
    event?: string;
    date?: string;
  }
  const adaptUrlState = (
    patch: { view?: string; event?: string; date?: string },
    replace?: boolean
  ) => {
    const allowedViews: readonly CalendarView[] = ["month", "week", "day"];
    const nextPatch: CalendarUrlPatch = {
      event: patch.event,
      date: patch.date,
    };
    if (patch.view && allowedViews.includes(patch.view as CalendarView)) {
      nextPatch.view = patch.view as CalendarView;
    }
    setUrlState(nextPatch, replace);
  };

  // Navigation abstraction
  const navigation = useCalendarNavigation({
    calendarRef,
    setUrlState: adaptUrlState,
    events,
    profile,
    setSelectedEvent,
    setShowEventModal,
    setIsCreatingEvent,
    setIsEditingEvent,
  });

  // Prefetch + date URL sync
  useCalendarPrefetch({
    calendarRef,
    currentView: navigation.currentView,
    filters,
    userId: user?.id || "",
    devMode,
    setUrlState: (p) => adaptUrlState(p),
    events,
  });

  // Actions + permissions
  const { canAddEvent, handleAddEvent, handleExportCalendar } =
    useCalendarActions({
      profile,
      setIsCreatingEvent,
      setSelectedEvent,
      setShowEventModal,
    });

  return {
    // state
    calendarRef,
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    debouncedSearch,
    events,
    loading,
    error,
    // selection
    selectedEvent,
    showEventModal,
    isCreatingEvent,
    isEditingEvent,
    setSelectedEvent,
    setShowEventModal,
    setIsCreatingEvent,
    setIsEditingEvent,
    resetSelection,
    // navigation
    navigation,
    // permissions
    canAddEvent,
    // actions
    handleAddEvent,
    handleExportCalendar,
    // mutations
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    // url
    setUrlState,
    profile,
    user,
  };
}
