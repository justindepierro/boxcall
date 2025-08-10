import React from "react";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { useDevMode } from "../../app/dev-mode-hooks";

interface TeamFeedsProps {
  userId: string;
}
/**
 * Team Feeds - Cross-team activity and updates
 *
 * Features:
 * - Recent team announcements
 * - Activity from all teams
 * - Quick team communications
 */
export const TeamFeeds: React.FC<TeamFeedsProps> = ({ userId: _userId }) => {
  const { devMode } = useDevMode();

  // Get feeds based on dev mode
  const getFeeds = () => {
    // Blank slate or production with no teams - empty state
    if (devMode === "blank_slate" || devMode === "production") {
      return [];
    }

    // Dev profiles with realistic data
    if (devMode?.startsWith("dev_")) {
      return [
        {
          id: 1,
          type: "announcement",
          team: "BoxCall Development Varsity",
          title: "Practice moved to indoor facility",
          time: "2 hours ago",
          icon: "info" as const,
        },
        {
          id: 2,
          type: "achievement",
          team: "BoxCall Development Varsity",
          title: "Great practice today! Defense looked sharp.",
          time: "4 hours ago",
          icon: "trophy" as const,
        },
        {
          id: 3,
          type: "schedule",
          team: "BoxCall Development Varsity",
          title: "Game film session added for Thursday",
          time: "1 day ago",
          icon: "calendar" as const,
        },
      ];
    }

    // Legacy mock modes
    // Allow legacy mock modes (cast for narrowed union compatibility)
    if (
      (devMode as string) === "super_admin_mock" ||
      devMode?.startsWith("view_as_")
    ) {
      return [
        {
          id: 1,
          type: "announcement",
          team: "Varsity Football",
          title: "Practice moved to indoor facility",
          time: "2 hours ago",
          icon: "info" as const,
        },
        {
          id: 2,
          type: "achievement",
          team: "JV Football",
          title: "Great practice today! Defense looked sharp.",
          time: "4 hours ago",
          icon: "trophy" as const,
        },
        {
          id: 3,
          type: "schedule",
          team: "Varsity Football",
          title: "Game film session added for Thursday",
          time: "1 day ago",
          icon: "calendar" as const,
        },
      ];
    }

    return [];
  };

  const feeds = getFeeds();

  return (
    <Card className="compact-card h-full surface-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <Typography variant="headline-md" className="text-text-primary">
          Team Feeds
        </Typography>
        <Icon name="users" size="sm" color="secondary" />
      </div>

      {/* Feed Content */}
      {feeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon
            name="users"
            size="xl"
            color="secondary"
            className="mb-4 opacity-50"
          />
          <Typography variant="body-lg" className="text-text-secondary mb-2">
            No team activity yet
          </Typography>
          <Typography variant="body-sm" className="text-text-muted">
            Join a team to see updates and announcements
          </Typography>
        </div>
      ) : (
        <div className="space-y-tight">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {/* Feed Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jade-100 flex items-center justify-center mt-0.5">
                <Icon name={feed.icon} size="sm" color="primary" />
              </div>
              {/* Feed Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Typography
                    variant="body-sm"
                    className="font-medium text-text-primary truncate"
                  >
                    {feed.team}
                  </Typography>
                  <Typography variant="body-xs" color="muted">
                    {feed.time}
                  </Typography>
                </div>
                <Typography
                  variant="body-sm"
                  className="text-text-secondary mt-0.5 leading-snug"
                >
                  {feed.title}
                </Typography>
              </div>
            </div>
          ))}
          {/* Show More */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="link"
              size="sm"
              className="w-full justify-center text-jade-600 hover:text-jade-700"
            >
              View All Team Updates
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
