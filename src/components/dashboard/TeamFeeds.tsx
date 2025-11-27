// import { useDashboardContext } from "../../context/useDashboardContext"; // not used

// import { useDashboardContext } from "../../context/useDashboardContext"; // not used

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { useDevMode } from "../../app/dev-mode-hooks";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

/**
 * Team Feeds - Cross-team activity and updates
 *
 * Features:
 * - Recent team announcements
 * - Activity from all teams
 * - Quick team communications
 */
const TeamFeeds: React.FC = () => {
  const { devMode } = useDevMode();
  const [showAllFeeds, setShowAllFeeds] = useState(false);

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
  const maxInitialFeeds = 3;
  const displayedFeeds = showAllFeeds ? feeds : feeds.slice(0, maxInitialFeeds);
  const hiddenFeedsCount = feeds.length - maxInitialFeeds;

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  // TODO: Only show quick add for user's own dashboard (add context check if needed)
  return (
    <Card variant="default" size="lg" className="h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <Typography variant="headline-md" className="text-primary">
          Team Feeds
        </Typography>
        <div className="flex items-center space-x-2">
          <Icon name="users" size="sm" color="primary" />
          <Button
            variant="ghost"
            size="xs"
            className="bg-surface-primary rounded-full p-1 border border-subtle hover:bg-jade-50 hover:border-jade-200 transition-colors"
            aria-label="Quick add message"
            onClick={() => setQuickAddOpen(true)}
          >
            <Icon name="plus" size="xs" />
          </Button>
        </div>
      </div>

      {/* Feed Content */}
      {feeds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon
            name="users"
            size="xl"
            color="navy"
            className="mb-4 opacity-50"
          />
          <Typography variant="body-lg" className="text-secondary mb-2">
            No team activity yet
          </Typography>
          <Typography variant="body-sm" className="text-muted">
            Join a team to see updates and announcements
          </Typography>
        </div>
      ) : (
        <div className="space-y-tight">
          {displayedFeeds.map((feed) => (
            <div
              key={feed.id}
              className="flex items-start space-x-3 p-2 rounded-lg surface-subtle-hover transition-colors cursor-pointer"
            >
              {/* Feed Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jade-100 flex items-center justify-center mt-0.5">
                <Icon name={feed.icon} size="sm" color="navy" />
              </div>
              {/* Feed Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Typography
                    variant="body-sm"
                    className="font-medium text-primary truncate"
                  >
                    {feed.team}
                  </Typography>
                  <Typography variant="body-xs" color="muted">
                    {feed.time}
                  </Typography>
                </div>
                <Typography
                  variant="body-sm"
                  className="text-secondary mt-0.5 leading-snug"
                >
                  {feed.title}
                </Typography>
              </div>
            </div>
          ))}
          {/* Show More / View All Button */}
          <div className="pt-2">
            {!showAllFeeds && feeds.length > maxInitialFeeds ? (
              <Button
                variant="brandLink"
                size="sm"
                className="w-full justify-center"
                onClick={() => setShowAllFeeds(true)}
              >
                See More Activity ({hiddenFeedsCount}) →
              </Button>
            ) : (
              <Button
                variant="brandLink"
                size="sm"
                className="w-full justify-center"
              >
                View All Team Updates
              </Button>
            )}
          </div>
        </div>
      )}
      {/* Quick Add Modal */}
      {quickAddOpen && (
        <Modal
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          title="Quick Add Message"
          size="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Implement message post logic
              setQuickAddOpen(false);
              setQuickMessage("");
            }}
          >
            <textarea
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows={3}
              placeholder="Type your message..."
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" variant="primary" size="sm">
                Post
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setQuickAddOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
};
export default TeamFeeds;
