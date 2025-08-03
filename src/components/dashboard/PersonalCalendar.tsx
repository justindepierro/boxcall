import { format } from "date-fns";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCalendar, useUpcomingEvents } from "../../hooks/useCalendar";
import type { CalendarEvent } from "../../services/calendarService";
import { BoxCallCalendar } from "../calendar/BoxCallCalendar";
import "../calendar/BoxCallCalendar.css";
import { Typography } from "../design-system";
import { Card } from "../ui";
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
 * - Quick RSVP and calendar integration
 */
export const PersonalCalendar: React.FC<PersonalCalendarProps> = ({
  userId,
}) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Use calendar hooks
  const { upcomingEvents, loading: upcomingLoading } = useUpcomingEvents(
    userId,
    8
  );
  const { events, loading: calendarLoading } = useCalendar(userId);

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
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
  const formatEventTime = (start: string, end?: string) => {
    const startTime = format(new Date(start), "h:mm a");
    if (end) {
      const endTime = format(new Date(end), "h:mm a");
      return `${startTime} - ${endTime}`;
    }
    return startTime;
  };

  if (upcomingLoading && viewMode === "list") {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Typography variant="headline-lg" className="text-navy-900">
            Personal Calendar
          </Typography>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
          <span className="ml-3 text-gray-600">Loading your schedule...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
        <Typography variant="headline-lg" className="text-navy-900">
          Personal Calendar
        </Typography>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/calendar")}
            className="text-jade-600 hover:text-jade-700 text-sm font-medium transition-colors"
          >
            View Full Calendar →
          </button>

          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-gray-600 hover:text-navy-900"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-gray-600 hover:text-navy-900"
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "list" ? (
          /* List View */
          <div className="p-6 overflow-y-auto">
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="calendar" size="2xl" className="text-gray-400 mx-auto mb-3" />
                  <Typography variant="body-md" className="text-gray-600">
                    No upcoming events scheduled
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    Check back later or contact your coach
                  </Typography>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-jade-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Event Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-lg">
                        {event.type === "game" && "🏈"}
                        {event.type === "practice" && "⚡"}
                        {event.type === "meeting" && "👥"}
                        {event.type === "film" && "🎬"}
                        {event.type === "other" && "📋"}
                      </span>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Typography
                          variant="headline-sm"
                          className="text-navy-900 font-semibold truncate"
                        >
                          {event.title}
                        </Typography>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeBadge(event.type)}`}
                        >
                          {event.type}
                        </span>
                        {event.is_home && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-jade-100 text-jade-800">
                            HOME
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span className="w-4 h-4 mr-1">📅</span>
                          {format(new Date(event.start), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center">
                          <span className="w-4 h-4 mr-1">⏰</span>
                          {formatEventTime(event.start, event.end)}
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <span className="w-4 h-4 mr-1">📍</span>
                            {event.location}
                          </span>
                        )}
                      </div>

                      {event.team_name && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-navy-100 text-navy-800">
                            {event.team_name}
                          </span>
                        </div>
                      )}

                      {event.opponent && (
                        <Typography
                          variant="caption"
                          className="text-gray-600 mt-1 block"
                        >
                          vs. {event.opponent}
                        </Typography>
                      )}
                    </div>

                    {/* RSVP Status */}
                    {event.rsvp_required && (
                      <div className="flex-shrink-0">
                        <button className="px-3 py-1 text-xs font-medium rounded-md border border-jade-300 text-jade-700 hover:bg-jade-50 transition-colors">
                          RSVP
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="h-full p-6">
            {calendarLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
                <span className="ml-3 text-gray-600">Loading calendar...</span>
              </div>
            ) : (
              <BoxCallCalendar
                events={events}
                onEventClick={handleEventClick}
                height="100%"
                className="h-full"
              />
            )}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Typography variant="headline-md" className="text-navy-900">
                  {selectedEvent.title}
                </Typography>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeBadge(selectedEvent.type)}`}
                  >
                    {selectedEvent.type}
                  </span>
                  {selectedEvent.is_home && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-jade-100 text-jade-800">
                      HOME
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    {format(
                      new Date(selectedEvent.start),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">⏰</span>
                    {formatEventTime(selectedEvent.start, selectedEvent.end)}
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📍</span>
                      {selectedEvent.location}
                    </div>
                  )}
                  {selectedEvent.team_name && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">👥</span>
                      {selectedEvent.team_name}
                    </div>
                  )}
                  {selectedEvent.opponent && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">🏈</span>
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

                {selectedEvent.rsvp_required && (
                  <div className="pt-3 border-t border-gray-200">
                    <Typography
                      variant="caption"
                      className="text-gray-600 block mb-2"
                    >
                      RSVP Required
                    </Typography>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm font-medium rounded-md bg-jade-600 text-white hover:bg-jade-700 transition-colors">
                        Attending
                      </button>
                      <button className="px-3 py-1 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                        Maybe
                      </button>
                      <button className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
                        Can't Attend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
