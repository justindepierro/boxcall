import { format } from "date-fns";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpcomingEvents } from "../../hooks/useCalendar";
import type { CalendarEvent } from "../../services/calendarService";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Button } from "../ui/Button/Button";
import Icon from "../ui/Icon/Icon";

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

  // Use calendar hooks
  const { upcomingEvents, loading: upcomingLoading } = useUpcomingEvents(
    userId,
    8
  );

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Handle quick add event
  const handleQuickAdd = async () => {
    if (!quickEventTitle.trim()) return;

    // TODO: Implement event creation service call
    console.log("Creating event:", quickEventTitle);
    setQuickEventTitle("");
    setShowQuickAdd(false);
  };

  // Get event type badge color
  const getEventTypeBadge = (type: string) => {
    const colors = {
      game: "bg-navy-600 text-white",
      practice: "bg-jade-600 text-white",
      meeting: "bg-amber-600 text-white",
      film: "bg-purple-600 text-white",
      other: "bg-gray-600 text-white",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  // Format event time
  const formatEventTime = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const startTime = format(new Date(start), "h:mm a");
    const endTime = format(new Date(end), "h:mm a");
    return `${startTime} - ${endTime}`;
  };

  if (upcomingLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </Card>
    );
  }

  return (
    <>
      <Card className="compact-card h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
          <Typography variant="headline-md" className="text-navy-800">
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
              variant="outline"
              size="xs"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="border-jade-200 text-jade-600 hover:text-jade-700"
            >
              + Add
            </Button>
          </div>
        </div>

        {/* Quick Add Event Form */}
        {showQuickAdd && (
          <div className="mb-4 p-3 bg-jade-50 rounded-lg border border-jade-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={quickEventTitle}
                onChange={(e) => setQuickEventTitle(e.target.value)}
                placeholder="Event title..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-jade-500 focus:border-jade-500"
                onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
              />
              <Button variant="primary" size="sm" onClick={handleQuickAdd}>
                Add
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowQuickAdd(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="overflow-y-auto">
            <div className="space-y-tight">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Icon
                    name="calendar"
                    size="xl"
                    className="text-gray-400 mx-auto mb-3"
                  />
                  <Typography variant="body-lg" className="text-gray-500 mb-2">
                    No upcoming events scheduled
                  </Typography>
                  <Typography variant="body-sm" className="text-gray-400">
                    Check back later or contact your coach
                  </Typography>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                  >
                    {/* Event Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <Icon
                        name={
                          event.type === "game"
                            ? "shield"
                            : event.type === "practice"
                              ? "activity"
                              : "calendar"
                        }
                        size="sm"
                        className="text-jade-600"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Typography
                          variant="body-md"
                          className="font-medium text-navy-900 truncate"
                        >
                          {event.title}
                        </Typography>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getEventTypeBadge(
                            event.type
                          )}`}
                        >
                          {event.type}
                        </span>
                      </div>

                      <Typography
                        variant="body-sm"
                        className="text-gray-600 mb-1"
                      >
                        {format(new Date(event.start), "EEE, MMM d")} •{" "}
                        {formatEventTime(event.start, event.end)}
                      </Typography>

                      {event.location && (
                        <Typography
                          variant="body-xs"
                          className="text-gray-500 truncate"
                        >
                          📍 {event.location}
                        </Typography>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Typography
                  variant="headline-md"
                  className="text-navy-900 pr-4"
                >
                  {selectedEvent.title}
                </Typography>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-600"
                  icon={<Icon name="close" size="sm" />}
                  iconPosition="only"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeBadge(selectedEvent.type)}`}
                  >
                    {selectedEvent.type}
                  </span>
                  {selectedEvent.is_home && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Home
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <Icon name="calendar" size="sm" />
                  <Typography variant="body-sm">
                    {format(
                      new Date(selectedEvent.start),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </Typography>
                </div>

                <div className="flex items-center space-x-2 text-gray-600">
                  <Icon name="clock" size="sm" />
                  <Typography variant="body-sm">
                    {formatEventTime(selectedEvent.start, selectedEvent.end)}
                  </Typography>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Icon name="target" size="sm" />
                    <Typography variant="body-sm">
                      {selectedEvent.location}
                    </Typography>
                  </div>
                )}

                {selectedEvent.team_name && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Icon name="users" size="sm" />
                    <Typography variant="body-sm" className="font-medium">
                      {selectedEvent.team_name}
                    </Typography>
                  </div>
                )}

                {selectedEvent.opponent && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Icon name="shield" size="sm" />
                    <Typography variant="body-sm" className="font-medium">
                      vs. {selectedEvent.opponent}
                    </Typography>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <Button variant="primary" size="sm" className="flex-1">
                  RSVP Going
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-gray-300"
                >
                  Maybe
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
