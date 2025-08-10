import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import type { BoxCallCalendarRef } from "../components/calendar/BoxCallCalendar";
import { BoxCallCalendar } from "../components/calendar/BoxCallCalendar";
import "../components/calendar/BoxCallCalendar.css";
import { Typography } from "../components/design-system/Typography";
import { PracticePlannerModal } from "../components/practice/PracticePlannerModal";
import { Button, Card, Input } from "../components/ui";
import Icon from "../components/ui/Icon/Icon";
import { EventModal } from "../components/calendar/EventModal";
import CalendarStats from "../components/calendar/CalendarStats";

// Calendar hooks (React Query)
import { useEvents } from "../state/calendar/hooks";
import { useCreateEvent } from "../state/calendar/hooks";
import { useDeleteEvent } from "../state/calendar/hooks";
import { useUpdateEvent } from "../state/calendar/hooks";
import { useDevMode } from "../app/dev-mode-hooks";
import type { CalendarFilters } from "../services/calendarService";
import type { CalendarEvent } from "../domain/calendar/types";
import { CalendarService } from "../services/calendarService"; // legacy search only (to be migrated)
interface CalendarPageState {
  userTeamsFilter?: string[];
  teamFilter?: string;
  defaultView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay";
}
/**
 * Master Calendar Page - Comprehensive calendar management interface
 *
 * Features:
 * - Full FullCalendar integration
 * - Universal search across all calendars
 * - Advanced filtering and views
 * - Event creation and management
 * - Cross-team event aggregation
 * - Export capabilities
 *
 * Referenced by:
 * - PersonalCalendar.tsx (View Full Calendar)
 * - TeamCalendar.tsx (View Team Calendar)
 * - Navigation menu
 */
export const CalendarPage: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuth();
  const calendarRef = useRef<BoxCallCalendarRef>(null);
  // Get state from navigation
  const state = location.state as CalendarPageState;
  // State management
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showPracticePlanner, setShowPracticePlanner] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [currentView, setCurrentView] = useState(
    state?.defaultView || "dayGridMonth"
  );
  const [filters, setFilters] = useState<CalendarFilters>({
    teamIds: state?.teamFilter
      ? [state.teamFilter]
      : state?.userTeamsFilter || [],
    eventTypes: [],
    dateRange: {
      start: new Date().toISOString().split("T")[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });
  // Phase 3: replace legacy useCalendar read path with React Query useEvents
  const { devMode } = useDevMode();
  // Phase 3 mutation hook integration (create/delete)
  const createEventMutation = useCreateEvent(user?.id || "", devMode, {
    teamIds: filters.teamIds,
    eventTypes: filters.eventTypes,
    dateRange: filters.dateRange,
  });
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();
  const {
    data: events = [],
    isLoading: loading,
    isError,
    error: eventsError,
  } = useEvents({
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
  });
  const error = isError
    ? eventsError instanceof Error
      ? eventsError.message
      : "Failed to load calendar events"
    : null;
  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
  // TODO (Phase 3+): incorporate filters into search when infra supports it
  await CalendarService.searchEvents(searchQuery);
        // TODO: Update events with search results
      } catch (error) {
        console.error("Search failed:", error);
      }
    }
  };
  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  // Handle date selection for creating events
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
  // Handle view change
  const handleViewChange = (
    view: "dayGridMonth" | "timeGridWeek" | "timeGridDay"
  ) => {
    setCurrentView(view);
    calendarRef.current?.changeView(view);
  };
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<CalendarFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };
  // Export calendar functionality
  const handleExportCalendar = async () => {
    try {
      // TODO: Implement calendar export
      alert("Calendar export functionality coming soon!");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
          <Typography variant="body-lg" className="text-gray-600">
            Loading your calendar...
          </Typography>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="warning" size="xl" className="text-red-600" />
            <Typography variant="headline-lg" className="text-red-600">
              Calendar Error
            </Typography>
          </div>
          <Typography variant="body-md" className="text-gray-600 mb-6">
            {error}
          </Typography>
          <Button onClick={() => window.location.reload()}>
            Reload Calendar
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen surface-app">
      {/* Header */}
      <div className="surface-header border-b border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="calendar" size="xl" className="text-navy-600" />
              <div>
                <Typography variant="headline-xl" className="text-text-primary">
                  Master Calendar
                </Typography>
                <Typography variant="body-lg" color="muted" className="mt-1">
                  Your comprehensive schedule across all teams
                </Typography>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleExportCalendar}>
                <Icon name="download" size="sm" className="mr-1" />
                Export
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
                  <Icon name="plus" size="sm" className="mr-1" />
                  Add Event
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Search & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Universal Search */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="search" size="lg" className="text-navy-600" />
                <Typography variant="headline-md" className="text-text-primary">
                  Universal Search
                </Typography>
              </div>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Search events, teams, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSearch}
                  className="w-full"
                >
                  Search
                </Button>
              </div>
            </Card>
            {/* Advanced Filters */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="filter" size="lg" className="text-navy-600" />
                <Typography variant="headline-md" className="text-text-primary">
                  Filters
                </Typography>
              </div>
              <div className="space-y-4">
                {/* Event Type Filter */}
                <div>
                  <Typography variant="body-sm" className="font-semibold mb-2">
                    Event Types
                  </Typography>
                  <div className="space-y-2">
                    {["game", "practice", "meeting", "film", "other"].map(
                      (type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-jade-600 focus:ring-jade-500"
                            checked={
                              filters.eventTypes?.includes(type) || false
                            }
                            onChange={(e) => {
                              const newTypes = e.target.checked
                                ? [...(filters.eventTypes || []), type]
                                : (filters.eventTypes || []).filter(
                                    (t: string) => t !== type
                                  );
                              handleFilterChange({ eventTypes: newTypes });
                            }}
                          />
                          <span className="ml-2 text-sm capitalize">
                            {type}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                {/* Date Range Filter */}
                <div>
                  <Typography variant="body-sm" className="font-semibold mb-2">
                    Date Range
                  </Typography>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.dateRange?.start || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          dateRange: {
                            start: e.target.value,
                            end: filters.dateRange?.end || e.target.value,
                          },
                        })
                      }
                    />
                    <Input
                      type="date"
                      value={filters.dateRange?.end || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          dateRange: {
                            start: filters.dateRange?.start || e.target.value,
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                {/* Quick Filters */}
                <div>
                  <Typography variant="body-sm" className="font-semibold mb-2">
                    Quick Filters
                  </Typography>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleFilterChange({ eventTypes: ["game"] })
                      }
                    >
                      Games Only
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleFilterChange({ eventTypes: ["practice"] })
                      }
                    >
                      Practices
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange({ eventTypes: [] })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            {/* Calendar Stats */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="bar-chart" size="lg" className="text-navy-600" />
                <Typography variant="headline-md" className="text-text-primary">
                  Stats
                </Typography>
              </div>
              <CalendarStats events={events} />
            </Card>
          </div>
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Calendar Header Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => calendarRef.current?.today()}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => calendarRef.current?.prev()}
                  >
                    ‹ Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => calendarRef.current?.next()}
                  >
                    Next ›
                  </Button>
                </div>
                {/* View Switcher */}
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <Button
                    variant={
                      currentView === "dayGridMonth" ? "primary" : "ghost"
                    }
                    size="xs"
                    onClick={() => handleViewChange("dayGridMonth")}
                    className={
                      currentView === "dayGridMonth"
                        ? "bg-white text-navy-900"
                        : "text-gray-600"
                    }
                  >
                    Month
                  </Button>
                  <Button
                    variant={
                      currentView === "timeGridWeek" ? "primary" : "ghost"
                    }
                    size="xs"
                    onClick={() => handleViewChange("timeGridWeek")}
                    className={
                      currentView === "timeGridWeek"
                        ? "bg-white text-navy-900"
                        : "text-gray-600"
                    }
                  >
                    Week
                  </Button>
                  <Button
                    variant={
                      currentView === "timeGridDay" ? "primary" : "ghost"
                    }
                    size="xs"
                    onClick={() => handleViewChange("timeGridDay")}
                    className={
                      currentView === "timeGridDay"
                        ? "bg-white text-navy-900"
                        : "text-gray-600"
                    }
                  >
                    Day
                  </Button>
                </div>
              </div>
              {/* FullCalendar Component */}
              <div className="h-[600px]">
                <BoxCallCalendar
                  ref={calendarRef}
                  events={events}
                  onEventClick={handleEventClick}
                  onDateSelect={handleDateSelect}
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
      </div>
      {/* Event Detail/Edit Modal */}
      <EventModal
        isOpen={showEventModal && !!selectedEvent}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setIsCreatingEvent(false);
          setIsEditingEvent(false);
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
        onOpenPracticePlanner={() => setShowPracticePlanner(true)}
      />
      {/* Practice Planner Modal */}
      {showPracticePlanner &&
        selectedEvent &&
        selectedEvent.type === "practice" && (
          <PracticePlannerModal
            event={selectedEvent}
            onClose={() => setShowPracticePlanner(false)}
          />
        )}
    </div>
  );
};
export default CalendarPage;

// Debug: ensure parser reads end of file correctly
export const __CALENDAR_PAGE_LOADED = true;
