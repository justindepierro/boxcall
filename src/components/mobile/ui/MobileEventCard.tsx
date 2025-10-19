import React from "react";
import { useNavigate } from "react-router-dom";
import { Typography } from "../../design-system";
import { Icon } from "../../ui/Icon/Icon";
import { format, isToday, isTomorrow } from "date-fns";

export interface CalendarEvent {
  id: string;
  type: "practice" | "game" | "meeting";
  date: Date;
  title: string;
  location?: string;
  attendanceCount?: number;
  totalRoster?: number;
}

export interface MobileEventCardProps {
  events: CalendarEvent[];
  maxEvents?: number;
  onViewCalendar?: () => void;
  userId?: string;
}

/**
 * MobileEventCard - Preview upcoming practices/games for Dashboard
 *
 * Shows next 2-3 events without opening calendar. Each event displays:
 * - Type icon (📅 Practice, 🏈 Game, 📋 Meeting)
 * - Date/time formatted
 * - Location (truncated if long)
 * - Attendance count (X/Y format)
 *
 * Design:
 * - Height: ~80px per event
 * - Max shown: 3 events (default)
 * - Total height: ~280px (3 × 80 + header + footer)
 * - Empty state: "No upcoming events"
 * - Link to full calendar at bottom
 *
 * Responsive:
 * - Mobile (<768px): Full width, 3 events max
 * - Desktop (≥1024px): Embedded in dashboard grid
 */
export const MobileEventCard: React.FC<MobileEventCardProps> = ({
  events,
  maxEvents = 3,
  onViewCalendar,
}) => {
  const navigate = useNavigate();

  const handleViewCalendar = () => {
    if (onViewCalendar) {
      onViewCalendar();
    } else {
      navigate("/calendar");
    }
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "practice":
        return "calendar";
      case "game":
        return "trophy";
      case "meeting":
        return "users";
      default:
        return "calendar";
    }
  };

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "practice":
        return "text-brand-primary";
      case "game":
        return "text-success";
      case "meeting":
        return "text-info";
      default:
        return "text-text-secondary";
    }
  };

  const formatEventDate = (date: Date) => {
    if (isToday(date)) {
      return `Today • ${format(date, "h:mm a")}`;
    }
    if (isTomorrow(date)) {
      return `Tomorrow • ${format(date, "h:mm a")}`;
    }
    return `${format(date, "MMM d")} • ${format(date, "h:mm a")}`;
  };

  const displayedEvents = events.slice(0, maxEvents);

  return (
    <div className="rounded-xl bg-surface-card border border-border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-sm"
          className="text-text-primary font-semibold"
        >
          Upcoming Events
        </Typography>
        <Icon name="calendar" className="w-5 h-5 text-text-secondary" />
      </div>

      {/* Events List */}
      {displayedEvents.length > 0 ? (
        <div className="space-y-3">
          {displayedEvents.map((event, index) => (
            <div key={event.id}>
              <div className="flex items-start gap-3 py-2">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <Icon
                    name={getEventIcon(event.type)}
                    className={`w-5 h-5 ${getEventColor(event.type)}`}
                  />
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  {/* Date/Time */}
                  <Typography
                    variant="body-sm"
                    className="text-text-secondary font-medium mb-0.5"
                  >
                    {formatEventDate(event.date)}
                  </Typography>

                  {/* Title */}
                  <Typography
                    variant="body-md"
                    className="text-text-primary font-semibold truncate"
                  >
                    {event.title}
                  </Typography>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <Icon
                        name="map-pin"
                        className="w-3 h-3 text-text-muted flex-shrink-0"
                      />
                      <Typography
                        variant="body-xs"
                        className="text-text-muted truncate"
                      >
                        {event.location}
                      </Typography>
                    </div>
                  )}

                  {/* Attendance */}
                  {event.attendanceCount !== undefined &&
                    event.totalRoster !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <Icon
                          name="users"
                          className="w-3 h-3 text-text-muted flex-shrink-0"
                        />
                        <Typography
                          variant="body-xs"
                          className="text-text-muted"
                        >
                          {event.attendanceCount}/{event.totalRoster} attending
                        </Typography>
                      </div>
                    )}
                </div>
              </div>

              {/* Divider (except for last item) */}
              {index < displayedEvents.length - 1 && (
                <div className="border-t border-border my-2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-8">
          <Icon
            name="calendar"
            className="w-12 h-12 text-text-muted mx-auto mb-2"
          />
          <Typography variant="body-md" className="text-text-secondary mb-1">
            No upcoming events
          </Typography>
          <Typography variant="body-sm" className="text-text-muted">
            Your schedule is clear
          </Typography>
        </div>
      )}

      {/* View Calendar Link */}
      <button
        onClick={handleViewCalendar}
        className="w-full mt-4 py-2 text-center text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors flex items-center justify-center gap-1 rounded-lg hover:bg-brand-primary/5"
        aria-label="View full calendar"
      >
        <span>View Full Calendar</span>
        <Icon name="chevron-right" className="w-4 h-4" />
      </button>

      {/* Hidden event count indicator */}
      {events.length > maxEvents && (
        <Typography
          variant="body-xs"
          className="text-text-muted text-center mt-2"
        >
          + {events.length - maxEvents} more event
          {events.length - maxEvents !== 1 ? "s" : ""}
        </Typography>
      )}
    </div>
  );
};

export default MobileEventCard;
