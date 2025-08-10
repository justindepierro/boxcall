import React, { useRef, useState, useEffect } from "react";
import "./CalendarShell.css";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import {
  useSearchEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../state/calendar/hooks";
import type {
  CalendarEvent,
  CalendarFilters,
} from "../../domain/calendar/types";
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
  mapInternalViewToQuery,
} from "./hooks/useCalendarUrlState";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { CalendarAPI } from "../../infra/calendar/api";
import { useQueryClient } from "@tanstack/react-query";
import { calendarKeys } from "../../state/calendar/queryKeys";

// NOTE: This shell intentionally mirrors logic from legacy CalendarPage; once stable we will remove duplicated code there.
export const CalendarShell: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { devMode } = useDevMode();
  const calendarRef = useRef<BoxCallCalendarRef>(null);
  // State
  const [filters, setFilters] = useState<CalendarFilters>({
    teamIds: [],
    eventTypes: [],
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  >("dayGridMonth");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);

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

  const debouncedSearch = useDebouncedValue(searchQuery, 350);
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

  // URL sync
  const { setState: setUrlState } = useCalendarUrlState({
    onChange: (s) => {
      // incoming view param
      if (s.view) {
        const internal = mapQueryViewToInternal(s.view);
        if (internal && internal !== currentView) {
          setCurrentView(
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

  // Push view changes to URL
  useEffect(() => {
    const viewParam = mapInternalViewToQuery(currentView);
    setUrlState({ view: viewParam }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  const handleViewChange = (
    view: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => {
    setCurrentView(view);
    calendarRef.current?.changeView(view);
    // sync view immediately (effect also does replace, but ensure responsiveness)
    const mapped = mapInternalViewToQuery(view);
    setUrlState({ view: mapped }, true);
  };
  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setUrlState({ event: event.id });
  };
  const handleDateSelect = (selectInfo: {
    startStr: string;
    endStr: string;
  }) => {
    if (profile?.role === "coach" || profile?.role === "admin") {
      setIsCreatingEvent(true);
      setSelectedEvent({
        id: "",
        title: "",
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        type: "practice",
        created_at: new Date().toISOString(),
      } as CalendarEvent);
      setShowEventModal(true);
    }
  };
  // Sync current visible date (center) into URL on navigation (prev/next/today) with throttling
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const handler = () => {
      const date = api.getDate();
      const iso = date.toISOString().split("T")[0];
      setUrlState({ date: iso });
      // Prefetch adjacent month ranges (month view only for now)
      if (currentView === "dayGridMonth") {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startPrev = new Date(year, month - 1, 1);
        const startNext = new Date(year, month + 1, 1);
        const endPrev = new Date(year, month, 0); // last day prev
        const endNext = new Date(year, month + 2, 0);
        const toISO = (d: Date) => d.toISOString().split("T")[0];
        const rangePrev = { start: toISO(startPrev), end: toISO(endPrev) };
        const rangeNext = { start: toISO(startNext), end: toISO(endNext) };
        // Fire and forget prefetch (reuse existing query fn via search events key for now)
        const paramsBase = {
          userId: user?.id || "",
          devMode,
          filters: {
            teamIds: filters.teamIds,
            eventTypes: filters.eventTypes,
            dateRange: filters.dateRange,
          },
        };
        [rangePrev, rangeNext].forEach((r) => {
          queryClient.prefetchQuery({
            queryKey: calendarKeys.events(
              {
                ...paramsBase.filters,
                dateRange: { start: r.start, end: r.end },
              },
              r,
              devMode ? "1" : undefined
            ),
            queryFn: () =>
              CalendarAPI.listUserEvents(user?.id || "", devMode, {
                ...paramsBase.filters,
                dateRange: { start: r.start, end: r.end },
              }),
            staleTime: 60_000,
          });
        });
      }
    };
    handler(); // initial sync
    // FullCalendar emits events we could listen to; simpler polling on view change for now.
    const id = setInterval(() => {
      handler();
    }, 5000);
    return () => clearInterval(id);
  }, [
    currentView,
    filters.teamIds,
    filters.eventTypes,
    filters.dateRange,
    user?.id,
    devMode,
    setUrlState,
    queryClient,
    events,
  ]);
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
          <Button variant="secondary" size="sm" onClick={handleExportCalendar}>
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
              currentView={currentView}
              onViewChange={handleViewChange}
              onToday={() => calendarRef.current?.today()}
              onPrev={() => calendarRef.current?.prev()}
              onNext={() => calendarRef.current?.next()}
            />
            <div className="h-[600px]">
              <BoxCallCalendar
                ref={calendarRef}
                events={events}
                highlightQuery={searchQuery}
                onEventClick={handleEventClick}
                // FullCalendar DateSelectArg includes additional fields; we only need start/end ISO strings.
                onDateSelect={(arg) =>
                  handleDateSelect({
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
                initialView={currentView}
                className="h-full"
              />
            </div>
          </Card>
        </div>
      </div>
      <EventModal
        isOpen={showEventModal && !!selectedEvent}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setIsCreatingEvent(false);
          setIsEditingEvent(false);
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
