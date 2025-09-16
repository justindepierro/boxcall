/**
 * Collaborative Calendar Component
 * Phase 2B Sprint 6: Collaborative Planning Tools
 *
 * Features:
 * - Shared team calendar with conflict detection
 * - Real-time event updates and suggestions
 * - Role-based event creation permissions
 * - Practice and game scheduling coordination
 */

import React, { useState, useCallback } from "react";
import { CollaborativeWidget } from "./CollaborativeWidget";
import { Button, Card } from "../ui";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon/Icon";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: "practice" | "game" | "meeting" | "other";
  startTime: string;
  endTime: string;
  location?: string;
  createdBy: string;
  attendees: string[];
  conflicts?: ConflictInfo[];
  status: "scheduled" | "tentative" | "cancelled" | "completed";
  recurring?: {
    pattern: "weekly" | "biweekly" | "monthly";
    endDate: string;
  };
}

interface ConflictInfo {
  type: "overlap" | "resource" | "availability";
  message: string;
  severity: "high" | "medium" | "low";
  affectedUsers?: string[];
}

export interface CollaborativeCalendarProps {
  /**
   * Widget ID for collaboration
   */
  widgetId: string;

  /**
   * Current user's role
   */
  userRole: "coach" | "player" | "family";

  /**
   * Current user ID
   */
  userId: string;

  /**
   * Current user's name
   */
  userName: string;

  /**
   * Whether user can create events
   */
  canCreateEvents?: boolean;

  /**
   * Initial events data
   */
  events?: CalendarEvent[];

  /**
   * Current date for calendar view
   */
  currentDate?: string;

  /**
   * Callback when events are updated
   */
  onEventsUpdate?: (events: CalendarEvent[]) => void;

  /**
   * Mock collaboration data
   */
  mockCollaboration?: {
    participants: Array<{ id: string; name: string; avatar?: string }>;
    cursors: Array<{
      userId: string;
      userName: string;
      x: number;
      y: number;
      action: "hover" | "click" | "typing";
      color: string;
    }>;
    isConnected: boolean;
  };
}

export const CollaborativeCalendar: React.FC<CollaborativeCalendarProps> = ({
  widgetId,
  userRole,
  userId,
  userName: _userName,
  canCreateEvents = false,
  events = [],
  currentDate = new Date().toISOString().split("T")[0],
  onEventsUpdate,
  mockCollaboration,
}) => {
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(events);
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const [_viewMode, _setViewMode] = useState<"week" | "month">("week");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  /**
   * Handle collaborative data changes
   */
  const handleCollaborativeDataChange = useCallback(
    (newData: Record<string, unknown>) => {
      if (newData.events) {
        const updatedEvents = newData.events as CalendarEvent[];
        setLocalEvents(updatedEvents);
        onEventsUpdate?.(updatedEvents);
      }
    },
    [onEventsUpdate]
  );

  /**
   * Detect conflicts for an event
   */
  const detectConflicts = useCallback(
    (
      newEvent: CalendarEvent,
      existingEvents: CalendarEvent[]
    ): ConflictInfo[] => {
      const conflicts: ConflictInfo[] = [];
      const newStart = new Date(newEvent.startTime);
      const newEnd = new Date(newEvent.endTime);

      existingEvents.forEach((event) => {
        if (event.id === newEvent.id) return;

        const existingStart = new Date(event.startTime);
        const existingEnd = new Date(event.endTime);

        // Check for time overlap
        const hasOverlap =
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd);

        if (hasOverlap) {
          conflicts.push({
            type: "overlap",
            message: `Overlaps with ${event.title}`,
            severity: event.type === "game" ? "high" : "medium",
            affectedUsers: event.attendees,
          });
        }

        // Check for location conflict
        if (
          hasOverlap &&
          newEvent.location &&
          event.location &&
          newEvent.location === event.location
        ) {
          conflicts.push({
            type: "resource",
            message: `Location conflict: ${event.location} is already booked`,
            severity: "high",
          });
        }
      });

      return conflicts;
    },
    []
  );

  /**
   * Create a new event
   */
  const handleCreateEvent = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(16, 0, 0, 0); // 4 PM tomorrow

    const endTime = new Date(tomorrow);
    endTime.setHours(18, 0, 0, 0); // 6 PM

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: "Team Practice",
      description: "Regular team practice session",
      type: "practice",
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      location: "Main Field",
      createdBy: userId,
      attendees: [userId],
      conflicts: [],
      status: "scheduled",
    };

    // Check for conflicts
    const conflicts = detectConflicts(newEvent, localEvents);
    if (conflicts.length > 0) {
      newEvent.conflicts = conflicts;
      newEvent.status = "tentative";
    }

    const updatedEvents = [...localEvents, newEvent];
    setLocalEvents(updatedEvents);
    onEventsUpdate?.(updatedEvents);
    setIsCreatingEvent(false);
  }, [localEvents, userId, onEventsUpdate, detectConflicts]);

  /**
   * Toggle event attendance
   */
  const handleToggleAttendance = useCallback(
    (eventId: string) => {
      const updatedEvents = localEvents.map((event) => {
        if (event.id !== eventId) return event;

        const isAttending = event.attendees.includes(userId);
        return {
          ...event,
          attendees: isAttending
            ? event.attendees.filter((id) => id !== userId)
            : [...event.attendees, userId],
        };
      });

      setLocalEvents(updatedEvents);
      onEventsUpdate?.(updatedEvents);
    },
    [localEvents, userId, onEventsUpdate]
  );

  /**
   * Get events for current view
   */
  const getEventsForView = useCallback(() => {
    const startOfWeek = new Date(viewDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return localEvents.filter((event) => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  }, [viewDate, localEvents]);

  /**
   * Get events for a specific day
   */
  const getEventsForDay = useCallback(
    (date: Date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      return localEvents.filter((event) => {
        const eventStart = new Date(event.startTime);
        return eventStart >= dayStart && eventStart <= dayEnd;
      });
    },
    [localEvents]
  );

  /**
   * Navigate calendar
   */
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    setViewDate((current) => {
      const newDate = new Date(current);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  }, []);

  /**
   * Get event type color
   */
  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "practice":
        return "bg-primary/10 text-primary border-primary/20";
      case "game":
        return "bg-success/10 text-success border-success/20";
      case "meeting":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-text-muted/10 text-text-muted border-border-secondary";
    }
  };

  const weekEvents = getEventsForView();
  const weekStart = new Date(viewDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  return (
    <CollaborativeWidget
      widgetId={widgetId}
      onDataChange={handleCollaborativeDataChange}
      className="collaborative-calendar"
      mockCollaboration={mockCollaboration}
    >
      <Card className="h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Typography variant="headline-sm" as="h3">
              Team Calendar
            </Typography>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigateWeek("prev")}
              >
                <Icon name="chevron-left" size="xs" />
              </Button>
              <Typography variant="body-sm" className="min-w-32 text-center">
                Week of {weekStart.toLocaleDateString()}
              </Typography>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigateWeek("next")}
              >
                <Icon name="chevron-right" size="xs" />
              </Button>
            </div>
          </div>

          {canCreateEvents && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreatingEvent(true)}
            >
              <Icon name="plus" size="xs" />
              Add Event
            </Button>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="space-y-3">
          {/* Week View */}
          {Array.from({ length: 7 }, (_, index) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + index);
            const dayEvents = getEventsForDay(dayDate);
            const isToday =
              dayDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  isToday
                    ? "bg-primary/5 border-primary/20"
                    : "bg-surface-secondary border-border-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Typography
                    variant="body-sm"
                    className={`font-medium ${
                      isToday ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {dayDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-text-muted">
                      {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {dayEvents.length === 0 ? (
                  <Typography variant="caption" color="muted">
                    No events scheduled
                  </Typography>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((event) => {
                      const isAttending = event.attendees.includes(userId);
                      const hasConflicts = (event.conflicts?.length || 0) > 0;

                      return (
                        <div
                          key={event.id}
                          className={`p-2 rounded border ${getEventTypeColor(
                            event.type
                          )} ${hasConflicts ? "border-l-4 border-l-danger" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <Typography
                                variant="caption"
                                className="font-medium"
                              >
                                {event.title}
                              </Typography>
                              <div className="flex items-center gap-2 mt-1">
                                <Typography variant="caption" color="muted">
                                  {new Date(event.startTime).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    }
                                  )}
                                </Typography>
                                {event.location && (
                                  <>
                                    <span className="text-text-muted">•</span>
                                    <Typography variant="caption" color="muted">
                                      {event.location}
                                    </Typography>
                                  </>
                                )}
                              </div>

                              {hasConflicts && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Icon
                                    name="alert-triangle"
                                    size="xs"
                                    className="text-danger"
                                  />
                                  <Typography
                                    variant="caption"
                                    className="text-danger"
                                  >
                                    {event.conflicts?.[0]?.message}
                                  </Typography>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              {userRole === "player" && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() =>
                                    handleToggleAttendance(event.id)
                                  }
                                  className={
                                    isAttending
                                      ? "text-success"
                                      : "text-text-muted"
                                  }
                                >
                                  <Icon
                                    name={isAttending ? "check" : "plus"}
                                    size="xs"
                                  />
                                </Button>
                              )}

                              {event.attendees.length > 0 && (
                                <Typography variant="caption" color="muted">
                                  {event.attendees.length}
                                </Typography>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-text-muted mt-4 pt-3 border-t border-border-secondary">
          <span>{weekEvents.length} events this week</span>
          <span>
            {weekEvents.filter((e) => e.attendees.includes(userId)).length}{" "}
            attending
          </span>
        </div>

        {/* Create Event Modal */}
        {isCreatingEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md w-full mx-4">
              <Typography variant="headline-sm" className="mb-4">
                Add Team Event
              </Typography>
              <Typography variant="body-sm" color="muted" className="mb-4">
                This will create a sample practice event with conflict
                detection.
              </Typography>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCreateEvent}>
                  Create Sample Event
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsCreatingEvent(false)}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </CollaborativeWidget>
  );
};
