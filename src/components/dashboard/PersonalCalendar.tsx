import { format } from "date-fns";
import { Icon as LegacyIcon } from "../ui/Icon/Icon";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../../stores/calendar/hooks";
import type { CalendarEvent } from "../../domain/calendar/types";
import { useDevMode } from "../../app/dev-mode-hooks";
import { debug } from "../../utils/logger";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Button } from "../ui/Button/Button";
import { Tooltip } from "../ui/Tooltip/Tooltip";
import { ModularIcon as Icon } from "../ui/Icon";
import { Tag, mapEventTypeToTagVariant } from "../ui/Tag";

// Extracted event card component
interface EventCardProps {
  event: CalendarEvent;
  onClick: () => void;
  formatEventTime: (start?: string, end?: string) => string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  formatEventTime,
}) => (
  <div
    onClick={onClick}
    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-secondary"
  >
    {/* Event Icon */}
    <div className="flex-shrink-0 mt-1">
      <Icon
        name={(() => {
          if (event.type === "game") return "shield";
          if (event.type === "practice") return "activity";
          return "calendar";
        })()}
        size="sm"
        className="text-jade-600"
      />
    </div>

    {/* Event Details */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center space-x-2 mb-1">
        <Typography
          variant="body-md"
          className="font-medium text-primary truncate"
        >
          {event.title}
        </Typography>
        <Tag variant={mapEventTypeToTagVariant(event.type)} size="sm">
          {event.type}
        </Tag>
      </div>

      <Typography variant="body-sm" className="text-secondary mb-1">
        {format(new Date(event.start), "EEE, MMM d")} •{" "}
        {formatEventTime(event.start, event.end)}
      </Typography>

      {event.location && (
        <Typography variant="body-xs" className="text-muted truncate">
          <LegacyIcon
            name="map-pin"
            size="sm"
            className="inline align-middle"
          />{" "}
          {event.location}
        </Typography>
      )}
    </div>
  </div>
);

// Extracted event detail modal
interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  formatEventTime: (start?: string, end?: string) => string;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  formatEventTime,
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-text-primary bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Typography variant="headline-md" className="text-primary pr-4">
              {event.title}
            </Typography>
            <Tooltip content="Close event details (Esc)">
              <Button
                variant="ghost"
                size="xs"
                onClick={onClose}
                aria-label="Close"
                className="text-muted hover:text-secondary"
                icon={<Icon name="close" size="sm" />}
                iconPosition="only"
              />
            </Tooltip>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag variant={mapEventTypeToTagVariant(event.type)} size="sm">
                {event.type}
              </Tag>
              {event.is_home && (
                <Tag variant="success" size="sm">
                  Home
                </Tag>
              )}
            </div>

            <div className="flex items-center space-x-2 text-secondary">
              <Icon name="calendar" size="sm" />
              <Typography variant="body-sm">
                {format(new Date(event.start), "EEEE, MMMM d, yyyy")}
              </Typography>
            </div>

            <div className="flex items-center space-x-2 text-secondary">
              <Icon name="clock" size="sm" />
              <Typography variant="body-sm">
                {formatEventTime(event.start, event.end)}
              </Typography>
            </div>

            {event.location && (
              <div className="flex items-center space-x-2 text-secondary">
                <Icon name="target" size="sm" />
                <Typography variant="body-sm">{event.location}</Typography>
              </div>
            )}

            {event.team_name && (
              <div className="flex items-center space-x-2 text-secondary">
                <Icon name="users" size="sm" />
                <Typography variant="body-sm" className="font-medium">
                  {event.team_name}
                </Typography>
              </div>
            )}

            {event.opponent && (
              <div className="flex items-center space-x-2 text-secondary">
                <Icon name="shield" size="sm" />
                <Typography variant="body-sm" className="font-medium">
                  vs. {event.opponent}
                </Typography>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button variant="primary" size="sm" className="flex-1">
              RSVP Going
            </Button>
            <Button variant="secondary" size="sm" className="flex-1">
              Maybe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PersonalCalendarProps {
  userId: string;
}

/**
 * Personal Calendar - Cross-team events and schedule
 *
 * Features:
 * - Events from all teams user belongs to
 * - Upcoming games, practices, meetings
 * - Personal reminders and deadlines
 * - Quick event creation
 */
export const PersonalCalendar: React.FC<PersonalCalendarProps> = ({
  userId,
}) => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickEventTitle, setQuickEventTitle] = useState("");

  const { devMode } = useDevMode();
  // Fetch a short horizon of events (next 14 days)
  const rangeStart = new Date();
  const rangeEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useEvents({
    userId,
    devMode,
    range: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
  });

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Handle quick add event
  const handleQuickAdd = async () => {
    if (!quickEventTitle.trim()) return;

    // TODO: Implement event creation service call
    debug("[PersonalCalendar] Creating event", { title: quickEventTitle });
    setQuickEventTitle("");
    setShowQuickAdd(false);
  };

  // Deprecated legacy event badge color map replaced by Tag variants

  // Format event time
  const formatEventTime = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const startTime = format(new Date(start), "h:mm a");
    const endTime = format(new Date(end), "h:mm a");
    return `${startTime} - ${endTime}`;
  };

  if (upcomingLoading) {
    return (
      <Card
        variant="default"
        size="lg"
        className="h-full flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
        <span className="ml-3 text-secondary">Loading calendar...</span>
      </Card>
    );
  }

  return (
    <>
      <Card variant="default" size="lg" className="h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3">
          <Typography variant="headline-md" className="text-primary">
            Personal Calendar
          </Typography>
          <div className="flex items-center space-x-2">
            <Button
              variant="link"
              size="xs"
              onClick={() => navigate("/calendar")}
              className="text-jade-600 hover:text-jade-700"
            >
              View Full Calendar
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="border-muted text-jade-600 hover:text-jade-700"
            >
              + Add
            </Button>
          </div>
        </div>

        {/* Quick Add Event Form */}
        {showQuickAdd && (
          <div className="mb-4 p-3 bg-subtle rounded-lg border border-muted">
            <div className="flex space-x-2">
              <Typography variant="body-sm" className="flex-1">
                <input
                  type="text"
                  value={quickEventTitle}
                  onChange={(e) => setQuickEventTitle(e.target.value)}
                  placeholder="Event title..."
                  className="w-full px-3 py-2 border border-secondary rounded-lg focus:ring-jade-500 focus:border-jade-500"
                  onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
                />
              </Typography>
              <Button variant="primary" size="sm" onClick={handleQuickAdd}>
                Add
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowQuickAdd(false)}
                className="text-secondary hover:text-primary"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div
            className="overflow-y-auto focus-scroll"
            role="region"
            aria-label="Upcoming events list"
            tabIndex={0}
          >
            <div className="space-y-tight">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    name="calendar"
                    size="xl"
                    className="text-muted mx-auto mb-3"
                  />
                  <Typography variant="body-lg" className="text-secondary mb-2">
                    No upcoming events scheduled
                  </Typography>
                  <Typography variant="body-sm" className="text-muted">
                    Check back later or contact your coach
                  </Typography>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    formatEventTime={formatEventTime}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        formatEventTime={formatEventTime}
      />
    </>
  );
};
