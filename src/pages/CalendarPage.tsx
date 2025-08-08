import React, { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../app/auth-store";
import type { BoxCallCalendarRef } from "../components/calendar/BoxCallCalendar";
import { BoxCallCalendar } from "../components/calendar/BoxCallCalendar";
import "../components/calendar/BoxCallCalendar.css";
import { Typography } from "../components/design-system";
import { PracticePlannerModal } from "../components/practice/PracticePlannerModal";
import { Button, Card, Input } from "../components/ui";
import Icon from "../components/ui/Icon/Icon";
import { useCalendar } from "../hooks/useCalendar";
import type {
  CalendarEvent,
  CalendarFilters,
} from "../services/calendarService";
import { CalendarService } from "../services/calendarService";
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
  // Use calendar hook with filters
  const { events, loading, error } = useCalendar(user?.id || "");
  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await CalendarService.searchEvents(searchQuery, filters);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="calendar" size="xl" className="text-navy-600" />
              <div>
                <Typography
                  variant="headline-xl"
                  className="text-gray-900 dark:text-white"
                >
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
                <Icon name="search" size="lg" color="navy" />
                <Typography
                  variant="headline-md"
                  className="text-gray-900 dark:text-white"
                >
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
                <Icon name="filter" size="lg" color="navy" />
                <Typography
                  variant="headline-md"
                  className="text-gray-900 dark:text-white"
                >
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
                <Icon name="bar-chart" size="lg" color="navy" />
                <Typography
                  variant="headline-md"
                  className="text-gray-900 dark:text-white"
                >
                  Stats
                </Typography>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Events</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold">
                    {
                      events.filter((e) => {
                        const eventDate = new Date(e.start);
                        const now = new Date();
                        return (
                          eventDate.getMonth() === now.getMonth() &&
                          eventDate.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Games</span>
                  <span className="font-semibold">
                    {events.filter((e) => e.type === "game").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Practices</span>
                  <span className="font-semibold">
                    {events.filter((e) => e.type === "practice").length}
                  </span>
                </div>
              </div>
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
                  <button
                    onClick={() => handleViewChange("dayGridMonth")}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentView === "dayGridMonth"
                        ? "bg-white text-navy-900 shadow-sm"
                        : "text-gray-600 hover:text-navy-900"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleViewChange("timeGridWeek")}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentView === "timeGridWeek"
                        ? "bg-white text-navy-900 shadow-sm"
                        : "text-gray-600 hover:text-navy-900"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleViewChange("timeGridDay")}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      currentView === "timeGridDay"
                        ? "bg-white text-navy-900 shadow-sm"
                        : "text-gray-600 hover:text-navy-900"
                    }`}
                  >
                    Day
                  </button>
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
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon
                    name={isCreatingEvent ? "plus" : "calendar"}
                    size="lg"
                    color="navy"
                  />
                  <Typography variant="headline-md" className="text-navy-900">
                    {isCreatingEvent ? "Create Event" : "Event Details"}
                  </Typography>
                </div>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                    setIsCreatingEvent(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Icon name="close" size="lg" />
                </button>
              </div>
              {isCreatingEvent ? (
                /* Event Creation Form */
                <div className="space-y-4">
                  <Input
                    label="Event Title"
                    value={selectedEvent.title}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        title: e.target.value,
                      })
                    }
                    placeholder="Practice, Game vs. Team Name, etc."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="datetime-local"
                      value={selectedEvent.start?.slice(0, 16)}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          start: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="End Date"
                      type="datetime-local"
                      value={selectedEvent.end?.slice(0, 16) || ""}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          end: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Event Type
                      </label>
                      <select
                        value={selectedEvent.type}
                        onChange={(e) =>
                          setSelectedEvent({
                            ...selectedEvent,
                            type: e.target.value as CalendarEvent["type"],
                          })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="practice">Practice</option>
                        <option value="game">Game</option>
                        <option value="meeting">Meeting</option>
                        <option value="film">Film Session</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Input
                      label="Location"
                      value={selectedEvent.location || ""}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          location: e.target.value,
                        })
                      }
                      placeholder="Field, Stadium, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedEvent.description || ""}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          description: e.target.value,
                        })
                      }
                      placeholder="Event details, notes, etc."
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={async () => {
                        try {
                          await CalendarService.createEvent({
                            title: selectedEvent.title,
                            start: selectedEvent.start,
                            end: selectedEvent.end,
                            type: selectedEvent.type,
                            location: selectedEvent.location,
                            description: selectedEvent.description,
                          });
                          setShowEventModal(false);
                          setIsCreatingEvent(false);
                          // Refresh events
                          window.location.reload();
                        } catch (error) {
                          console.error("Failed to create event:", error);
                        }
                      }}
                    >
                      Create Event
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowEventModal(false);
                        setIsCreatingEvent(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Event Display */
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedEvent.type === "game"
                          ? "bg-red-100 text-red-800"
                          : selectedEvent.type === "practice"
                            ? "bg-blue-100 text-blue-800"
                            : selectedEvent.type === "meeting"
                              ? "bg-amber-100 text-amber-800"
                              : selectedEvent.type === "film"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedEvent.type}
                    </span>
                    {selectedEvent.is_home && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-jade-100 text-jade-800">
                        HOME
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Icon
                        name="calendar"
                        size="sm"
                        color="secondary"
                        className="mr-2"
                      />
                      {new Date(selectedEvent.start).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">⏰</span>
                      {new Date(selectedEvent.start).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}
                      {selectedEvent.end && (
                        <>
                          {" "}
                          -{" "}
                          {new Date(selectedEvent.end).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </>
                      )}
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center">
                        <Icon
                          name="location"
                          size="sm"
                          color="secondary"
                          className="mr-2"
                        />
                        {selectedEvent.location}
                      </div>
                    )}
                    {selectedEvent.team_name && (
                      <div className="flex items-center">
                        <Icon
                          name="users"
                          size="sm"
                          color="secondary"
                          className="mr-2"
                        />
                        {selectedEvent.team_name}
                      </div>
                    )}
                    {selectedEvent.opponent && (
                      <div className="flex items-center">
                        <Icon
                          name="target"
                          size="sm"
                          color="secondary"
                          className="mr-2"
                        />
                        vs. {selectedEvent.opponent}
                      </div>
                    )}
                  </div>
                  {selectedEvent.description && (
                    <div className="pt-3 border-t border-gray-200">
                      <Typography variant="body-md" className="text-gray-700">
                        {selectedEvent.description}
                      </Typography>
                    </div>
                  )}
                  <div className="flex space-x-3 pt-4">
                    {/* Practice Planning Button - Only for practice events and coaches */}
                    {selectedEvent.type === "practice" &&
                      (profile?.role === "coach" ||
                        profile?.role === "admin") && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setShowPracticePlanner(true);
                            setShowEventModal(false);
                          }}
                        >
                          <Icon name="file" size="sm" className="mr-1" />
                          Plan Practice
                        </Button>
                      )}
                    {selectedEvent.rsvp_required && (
                      <Button variant="primary" size="sm">
                        RSVP
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Add to Personal Calendar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
