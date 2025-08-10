import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../../app/auth-store";
import { useDevMode } from "../../app/dev-mode-hooks";
import {
  useSearchEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "../../state/calendar/hooks";
import type { CalendarEvent, CalendarFilters } from "../../domain/calendar/types";
import { CalendarStats } from "./CalendarStats";
import { CalendarFiltersPanel } from "./CalendarFiltersPanel";
import { CalendarToolbar } from "./CalendarToolbar";
import { BoxCallCalendar, type BoxCallCalendarRef } from "./BoxCallCalendar";
import { EventModal } from "./EventModal";
import { Card, Button } from "../ui"; // adjust relative path if needed
import Icon from "../ui/Icon/Icon";
import { CalendarPageSkeleton, CalendarErrorSkeleton } from "./CalendarSkeletons";
import { useCalendarUrlState, mapQueryViewToInternal, mapInternalViewToQuery } from "./hooks/useCalendarUrlState";

// NOTE: This shell intentionally mirrors logic from legacy CalendarPage; once stable we will remove duplicated code there.
export const CalendarShell: React.FC = () => {
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
  const [currentView, setCurrentView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
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

  const {
    data: events = [],
    isLoading: loading,
    isError,
    error: eventsError,
  } = useSearchEvents(searchQuery, baseQueryParams);
  const error = isError
    ? eventsError instanceof Error
      ? eventsError.message
      : "Failed to load calendar events"
    : null;

  const createEventMutation = useCreateEvent(user?.id || "", devMode, baseQueryParams.filters);
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  // URL sync
  const { setState: setUrlState } = useCalendarUrlState({
    onChange: (s) => {
      // incoming view param
      if (s.view) {
        const internal = mapQueryViewToInternal(s.view);
        if (internal && internal !== currentView) {
          setCurrentView(internal as "dayGridMonth" | "timeGridWeek" | "timeGridDay");
          calendarRef.current?.changeView(internal);
        }
      }
      // incoming date param: if provided and calendar API available, navigate there
      if (s.date) {
        const api = calendarRef.current?.getApi();
        if (api) {
          const currentDate = api.getDate();
            const desired = new Date(s.date + "T00:00:00");
            if (Math.abs(desired.getTime() - currentDate.getTime()) > 1000 * 60 * 60 * 6) {
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

  const handleViewChange = (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    setCurrentView(view);
    calendarRef.current?.changeView(view);
  };
  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  setUrlState({ event: event.id });
  };
  const handleDateSelect = (selectInfo: { startStr: string; endStr: string }) => {
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
  const handleExportCalendar = () => {
    // placeholder
    alert("Calendar export coming soon");
  };

  if (loading) return <CalendarPageSkeleton />;
  if (error) return <CalendarErrorSkeleton message={error} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="calendar" size="xl" className="text-navy-600" />
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Master Calendar (Shell)</h2>
            <p className="text-sm text-text-secondary mt-1">Experimental shell – feature flag enabled</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportCalendar}>
            <Icon name="download" size="sm" className="mr-1" /> Export
          </Button>
          {(profile?.role === "coach" || profile?.role === "admin") && (
            <Button
              variant="primary"
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <CalendarFiltersPanel
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={() => Promise.resolve()}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Icon name="bar-chart" size="lg" className="text-navy-600" />
              <h3 className="font-semibold text-text-primary">Stats</h3>
            </div>
            <CalendarStats events={events} />
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="p-6">
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
                onEventClick={handleEventClick}
                // FullCalendar DateSelectArg includes additional fields; we only need start/end ISO strings.
                onDateSelect={(arg) =>
                  handleDateSelect({ startStr: arg.startStr, endStr: arg.endStr })
                }
                editable={profile?.role === "coach" || profile?.role === "admin"}
                selectable={profile?.role === "coach" || profile?.role === "admin"}
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
        onOpenPracticePlanner={() => {/* future practice planner integration */}}
      />
    </div>
  );
};

export default CalendarShell;
