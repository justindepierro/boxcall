import React from "react";
import { Typography } from "../design-system";
import { Card } from "../ui";
interface CrossTeamMessagesProps {
  userId: string;
}
/**
 * Cross-Team Messages - Multi-team communication hub
 *
 * Features:
 * - Messages from all teams user belongs to
 * - Important announcements and updates
 * - @mentions and team-specific communications
 * - Priority message filtering
 */
export const CrossTeamMessages: React.FC<CrossTeamMessagesProps> = () => {
  // TODO: Use props for fetching user-specific messages
  // Mock message data - TODO: Fetch from database
  const mockMessages = [
    {
      id: "1",
      teamName: "Dev Varsity Team",
      teamLogo: "🦅",
      from: "Coach Johnson",
      subject: "Practice Schedule Update",
      preview: "Friday practice moved to 4:00 PM due to weather concerns...",
      timestamp: "2 hours ago",
      isRead: false,
      priority: "high",
    },
    {
      id: "2",
      teamName: "Elite 7v7",
      teamLogo: "⚡",
      from: "Coach Martinez",
      subject: "Game Film Available",
      preview: "Film from Saturday's games is now available for review...",
      timestamp: "1 day ago",
      isRead: true,
      priority: "normal",
    },
    {
      id: "3",
      teamName: "Spring Development",
      teamLogo: "🌱",
      from: "Team Manager",
      subject: "Gear Collection Reminder",
      preview: "Please return all team gear by Friday, August 30th...",
      timestamp: "2 days ago",
      isRead: false,
      priority: "normal",
    },
    {
      id: "4",
      teamName: "Dev Varsity Team",
      teamLogo: "🦅",
      from: "Athletic Director",
      subject: "Parent Meeting",
      preview: "Mandatory parent meeting scheduled for next Tuesday...",
      timestamp: "3 days ago",
      isRead: true,
      priority: "high",
    },
  ];
  const unreadCount = mockMessages.filter((msg) => !msg.isRead).length;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="text-gray-900 dark:text-white"
        >
          📬 Team Messages
        </Typography>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </div>
          )}
          <button className="text-jade-600 dark:text-jade-400 hover:text-jade-700 dark:hover:text-jade-300">
            Mark All Read
          </button>
        </div>
      </div>
      {/* Message List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              message.isRead
                ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                : "bg-white dark:bg-gray-700 border-jade-200 dark:border-jade-800 shadow-sm"
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Team Logo */}
              <div className="text-xl">{message.teamLogo}</div>
              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Typography
                      variant="body-sm"
                      className="font-semibold text-gray-900 dark:text-white"
                    >
                      {message.teamName}
                    </Typography>
                    {message.priority === "high" && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <Typography variant="caption" color="muted">
                    {message.timestamp}
                  </Typography>
                </div>
                <Typography
                  variant="body-sm"
                  className="font-medium text-gray-900 dark:text-white"
                >
                  {message.subject}
                </Typography>
                <Typography
                  variant="body-sm"
                  color="muted"
                  className="line-clamp-2"
                >
                  {message.preview}
                </Typography>
                <div className="flex items-center justify-between mt-2">
                  <Typography variant="caption" color="muted">
                    From: {message.from}
                  </Typography>
                  {!message.isRead && (
                    <div className="w-2 h-2 bg-jade-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2 text-jade-600 dark:text-jade-400 hover:bg-jade-50 dark:hover:bg-jade-900/20 rounded-md transition-colors">
            View All Messages
          </button>
          <button className="py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
            Message Settings
          </button>
        </div>
      </div>
    </Card>
  );
};
