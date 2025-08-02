import React from "react";
import { Typography } from "../design-system";
import { Card } from "../ui";

interface TeamCalendarProps {
  teamId: string;
}

/**
 * Team Calendar - Team-specific events and schedule
 *
 * Features:
 * - Team games, practices, and meetings
 * - Team-specific calendar view
 * - Event details and locations
 * - RSVP functionality for events
 */
export const TeamCalendar: React.FC<TeamCalendarProps> = () => {
  // TODO: Use teamId for fetching team-specific calendar events

  // Mock team calendar data - TODO: Fetch from database
  const mockTeamEvents = [
    {
      id: "1",
      title: "Game vs. Central Lions",
      date: "2024-08-16",
      time: "7:00 PM",
      type: "game",
      location: "Memorial Stadium",
      isHome: true,
    },
    {
      id: "2",
      title: "Practice",
      date: "2024-08-13",
      time: "3:30 PM",
      type: "practice",
      location: "School Field",
    },
    {
      id: "3",
      title: "Team Meeting",
      date: "2024-08-14",
      time: "2:45 PM",
      type: "meeting",
      location: "Team Room",
    },
    {
      id: "4",
      title: "Film Session",
      date: "2024-08-15",
      time: "4:00 PM",
      type: "film",
      location: "Classroom A",
    },
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case "game":
        return "bg-red-500";
      case "practice":
        return "bg-blue-500";
      case "meeting":
        return "bg-jade-500";
      case "film":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "game":
        return "🏈";
      case "practice":
        return "🏃‍♂️";
      case "meeting":
        return "🗣️";
      case "film":
        return "🎬";
      default:
        return "📅";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="text-gray-900 dark:text-white"
        >
          📅 Team Calendar
        </Typography>
        <button className="text-jade-600 dark:text-jade-400 hover:text-jade-700 dark:hover:text-jade-300">
          View Full Calendar
        </button>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-3">
        {mockTeamEvents.map((event) => (
          <div
            key={event.id}
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 ${getEventColor(event.type)} rounded-full flex items-center justify-center text-white text-sm`}
                >
                  {getEventIcon(event.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Typography
                    variant="body-sm"
                    className="font-semibold text-gray-900 dark:text-white"
                  >
                    {event.title}
                  </Typography>
                  {event.type === "game" &&
                    "isHome" in event &&
                    event.isHome && (
                      <div className="px-2 py-1 bg-jade-100 text-jade-800 dark:bg-jade-900 dark:text-jade-200 text-xs rounded-full">
                        HOME
                      </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Typography variant="body-sm" color="muted">
                    📍 {event.location}
                  </Typography>
                  <div className="text-right">
                    <Typography variant="body-sm" className="font-medium">
                      {formatDate(event.date)}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {event.time}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2 text-jade-600 dark:text-jade-400 hover:bg-jade-50 dark:hover:bg-jade-900/20 rounded-md transition-colors">
            Add Event
          </button>
          <button className="py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
            Export Calendar
          </button>
        </div>
      </div>
    </Card>
  );
};
