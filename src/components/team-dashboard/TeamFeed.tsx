import React from "react";
import { Typography } from "../design-system";
import { Icon } from "../ui/Icon/Icon";

interface TeamFeedProps {
  teamId: string;
  userRole: string;
}

/**
 * Team Feed - Facebook-style team activity feed
 *
 * Features:
 * - Coach announcements and updates
 * - New plays and practice scripts posted
 * - Team discussions with @mentions and #hashtags
 * - Performance updates and celebrations
 * - Role-based posting permissions
 */
export const TeamFeed: React.FC<TeamFeedProps> = () => {
  // TODO: Use teamId and userRole for fetching team-specific feed

  // Mock feed data - TODO: Fetch from database
  const mockFeedItems = [
    {
      id: "1",
      type: "announcement",
      author: "Coach Johnson",
      authorRole: "head_coach",
      timestamp: "2 hours ago",
      content:
        "Great practice today team! Special shoutout to @Marcus for leadership and @Tyler for those explosive runs. Friday's game plan is uploaded - study hard! #EaglesStrong",
      likes: 12,
      comments: 3,
      pinned: true,
    },
    {
      id: "2",
      type: "play_upload",
      author: "Coach Williams",
      authorRole: "coach",
      timestamp: "4 hours ago",
      content:
        "New red zone package uploaded to playbook! Three new plays added: Red Zone Slant, Corner Fade, and QB Sweep. Practice these routes tonight.",
      attachments: ["Red Zone Package.pdf"],
      likes: 8,
      comments: 1,
    },
    {
      id: "3",
      type: "achievement",
      author: "System",
      authorRole: "system",
      timestamp: "1 day ago",
      content:
        "Team Achievement Unlocked: Perfect Practice Week! Everyone showed up ready to work. Helmet stickers awarded to all players.",
      likes: 23,
      comments: 7,
    },
    {
      id: "4",
      type: "practice_script",
      author: "Coach Johnson",
      authorRole: "head_coach",
      timestamp: "2 days ago",
      content:
        "Friday's practice script is live! Focus areas: Red zone offense, 3rd down defense, and special teams. Weather looks good - outdoor practice confirmed.",
      attachments: ["Friday_Practice_Script.pdf"],
      likes: 6,
      comments: 2,
    },
    {
      id: "5",
      type: "player_spotlight",
      author: "Coach Martinez",
      authorRole: "coach",
      timestamp: "3 days ago",
      content:
        "Player Spotlight: @Devon has been crushing it in the weight room! Up 15lbs on bench press this month. That dedication shows on the field. #WorkEthic",
      likes: 18,
      comments: 9,
    },
  ];

  const getPostIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Icon name="info" size="md" color="jade" />;
      case "play_upload":
        return <Icon name="book" size="md" color="navy" />;
      case "achievement":
        return <Icon name="award" size="md" color="jade" />;
      case "practice_script":
        return <Icon name="file" size="md" color="navy" />;
      case "player_spotlight":
        return <Icon name="star" size="md" color="jade" />;
      default:
        return <Icon name="file" size="md" color="slate" />;
    }
  };

  const getPostColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "border-jade-200 dark:border-jade-800";
      case "play_upload":
        return "border-blue-200 dark:border-blue-800";
      case "achievement":
        return "border-purple-200 dark:border-purple-800";
      case "practice_script":
        return "border-orange-200 dark:border-orange-800";
      case "player_spotlight":
        return "border-yellow-200 dark:border-yellow-800";
      default:
        return "border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Post Section - TODO: Add based on role permissions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Typography variant="body-sm" color="muted">
          Share an update with the team...
        </Typography>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {mockFeedItems.map((item) => (
          <div
            key={item.id}
            className={`p-4 bg-white dark:bg-gray-800 rounded-lg border ${getPostColor(item.type)} ${
              item.pinned ? "ring-2 ring-jade-200 dark:ring-jade-800" : ""
            }`}
          >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-jade-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.author[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Typography
                      variant="body-sm"
                      className="font-semibold text-gray-900 dark:text-white"
                    >
                      {item.author}
                    </Typography>
                    {getPostIcon(item.type)}
                    {item.pinned && (
                      <div className="px-2 py-1 bg-jade-100 text-jade-800 dark:bg-jade-900 dark:text-jade-200 text-xs rounded-full">
                        PINNED
                      </div>
                    )}
                  </div>
                  <Typography variant="caption" color="muted">
                    {item.timestamp}
                  </Typography>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-3">
              <Typography
                variant="body-sm"
                className="whitespace-pre-wrap text-gray-900 dark:text-white"
              >
                {item.content}
              </Typography>

              {/* Attachments */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {item.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                    >
                      <Icon name="download" size="md" color="jade" />
                      <Typography
                        variant="body-sm"
                        className="text-jade-600 dark:text-jade-400"
                      >
                        {attachment}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-jade-600 dark:hover:text-jade-400">
                  <Icon name="check" size="sm" color="current" />
                  <Typography
                    variant="caption"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {item.likes}
                  </Typography>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-jade-600 dark:hover:text-jade-400">
                  <Icon name="message" size="sm" color="current" />
                  <Typography
                    variant="caption"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {item.comments}
                  </Typography>
                </button>
              </div>
              <button className="text-gray-600 dark:text-gray-400 hover:text-jade-600 dark:hover:text-jade-400">
                <Icon name="share" size="sm" color="current" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-4">
        <button className="text-jade-600 dark:text-jade-400 hover:text-jade-700 dark:hover:text-jade-300">
          Load More Posts
        </button>
      </div>
    </div>
  );
};
