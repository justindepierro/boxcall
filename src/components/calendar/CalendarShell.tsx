import React, { useRef } from "react";
import "./CalendarShell.css";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import {
  useSearchEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../state/calendar/hooks";
import type { CalendarEvent } from "../../domain/calendar/types";
import { CalendarStats } from "./CalendarStats";
import { CalendarFiltersPanel } from "./CalendarFiltersPanel";
import { CalendarToolbar } from "./CalendarToolbar";
import { BoxCallCalendar, type BoxCallCalendarRef } from "./BoxCallCalendar";
import { EventModal } from "./EventModal";
import { Card, Button } from "../ui"; // adjust relative path if needed
import Icon from "../ui/Icon/Icon";
import {
  CalendarPageSkeleton,
  CalendarErrorSkeleton,
} from "./CalendarSkeletons";
import {
  useCalendarUrlState,
  mapQueryViewToInternal,
} from "./hooks/useCalendarUrlState";
import { useCalendarPrefetch } from "./hooks/useCalendarPrefetch";
import { useCalendarSelection } from "./hooks/useCalendarSelection";
import { useCalendarFilters } from "./hooks/useCalendarFilters";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";

// Final CalendarShell: legacy CalendarPage removed.
export const CalendarShell: React.FC = () => {
  const { user, profile } = useAuth();
  const { devMode } = useDevMode();
  const calendarRef = useRef<BoxCallCalendarRef | null>(null);
  const {
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    debouncedSearch,
  } = useCalendarFilters();
  const {
    selectedEvent,
    showEventModal,
    isCreatingEvent,
    isEditingEvent,
    setSelectedEvent,
    setShowEventModal,
    setIsCreatingEvent,
    setIsEditingEvent,
    resetSelection,
  } = useCalendarSelection();

  const baseQueryParams = {
    userId: user?.id || "",
    devMode,
    filters: {
      teamIds: filters.teamIds,
      eventTypes: filters.eventTypes,
      dateRange: filters.dateRange,
    },
    range: filters.dateRange
      ? { start: filters.dateRange.start, end: filters.dateRange.end }
      : undefined,
  };

  const {
    data: events = [],
    isLoading: loading,
    isError,
    error: eventsError,
  } = useSearchEvents(debouncedSearch, baseQueryParams);
  const error = isError
    ? eventsError instanceof Error
      ? eventsError.message
      : "Failed to load calendar events"
    : null;

  const createEventMutation = useCreateEvent(
    user?.id || "",
    devMode,
    baseQueryParams.filters
  );
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  // URL + incoming state sync
  const { setState: setUrlState } = useCalendarUrlState({
    onChange: (s) => {
      // incoming view param
      if (s.view) {
        const internal = mapQueryViewToInternal(s.view);
        if (internal && internal !== navigation.currentView) {
          navigation.setCurrentView(
            internal as "dayGridMonth" | "timeGridWeek" | "timeGridDay"
          );
          calendarRef.current?.changeView(internal);
        }
      }
      // incoming date param: if provided and calendar API available, navigate there
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
      // incoming event param: open modal if event found in cache
      if (s.event && events.length) {
        const match = events.find((e) => e.id === s.event);
        if (match) {
          setSelectedEvent(match);
          setShowEventModal(true);
        }
      }
    },
  });

  // Navigation abstraction
  type CalendarView = "month" | "week" | "day";
  interface CalendarUrlPatch {
    view?: CalendarView;
    event?: string;
    date?: string; // ISO date string
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
  // Sync current visible date (center) into URL on navigation (prev/next/today) with throttling
  useCalendarPrefetch({
    calendarRef,
    currentView: navigation.currentView,
    filters,
    userId: user?.id || "",
    devMode,
    setUrlState: (p) => adaptUrlState(p),
    events,
  });
  const handleExportCalendar = () => {
    // placeholder
    alert("Calendar export coming soon");
  };

  if (loading) return <CalendarPageSkeleton />;
  if (error) return <CalendarErrorSkeleton message={error} />;

  return (
    <div className="calendar-shell-root space-y-6">
      {/* Header */}
      <div className="calendar-shell-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="calendar" size="xl" className="text-navy-600" />
          <div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight">
              Master Calendar
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Unified schedule & event management
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="subtle" size="sm" onClick={handleExportCalendar}>
            <Icon name="download" size="sm" className="mr-1" /> Export
          </Button>
          {(profile?.role === "coach" || profile?.role === "admin") && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsCreatingEvent(true);
                setSelectedEvent({
                  id: "",
                  title: "",
                  start: new Date().toISOString(),
                  type: "practice",
                  created_at: new Date().toISOString(),
                } as CalendarEvent);
                setShowEventModal(true);
              }}
            >
              <Icon name="plus" size="sm" className="mr-1" /> Add Event
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-5">
          <CalendarFiltersPanel
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={() => Promise.resolve()}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <Card className="calendar-card">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="bar-chart" size="lg" className="text-navy-600" />
              <h3 className="font-semibold text-text-primary">Stats</h3>
            </div>
            <CalendarStats events={events} />
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="calendar-card">
            <CalendarToolbar
              currentView={navigation.currentView}
              onViewChange={navigation.handleViewChange}
              onToday={() => calendarRef.current?.today()}
              onPrev={() => calendarRef.current?.prev()}
              onNext={() => calendarRef.current?.next()}
            />
            <div className="h-[600px]">
              <BoxCallCalendar
                ref={calendarRef}
                events={events}
                highlightQuery={searchQuery}
                onEventClick={navigation.handleEventClick}
                // FullCalendar DateSelectArg includes additional fields; we only need start/end ISO strings.
                onDateSelect={(arg) =>
                  navigation.handleDateSelect({
                    startStr: arg.startStr,
                    endStr: arg.endStr,
                  })
                }
                editable={
                  profile?.role === "coach" || profile?.role === "admin"
                }
                selectable={
                  profile?.role === "coach" || profile?.role === "admin"
                }
                height="100%"
                initialView={navigation.currentView}
                className="h-full"
              />
            </div>
          </Card>
        </div>
      </div>
      <EventModal
        isOpen={showEventModal && !!selectedEvent}
        onClose={() => {
          resetSelection();
          setUrlState({ event: undefined }, true);
        }}
        event={selectedEvent}
        setEvent={setSelectedEvent}
        isCreating={isCreatingEvent}
        setIsCreating={setIsCreatingEvent}
        isEditing={isEditingEvent}
        setIsEditing={setIsEditingEvent}
        profile={profile}
        userId={user?.id}
        createEventMutation={createEventMutation}
        updateEventMutation={updateEventMutation}
        deleteEventMutation={deleteEventMutation}
        onOpenPracticePlanner={() => {
          /* future practice planner integration */
        }}
      />
    </div>
  );
};

export default CalendarShell;
