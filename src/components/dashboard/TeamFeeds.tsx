import React from "react";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";

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
  // Mock data for now - replace with actual feeds
  const feeds = [
    {
      id: 1,
      type: 'announcement',
      team: 'Varsity Football',
      title: 'Practice moved to indoor facility',
      time: '2 hours ago',
      icon: 'info' as const,
    },
    {
      id: 2,
      type: 'achievement',
      team: 'JV Football',
      title: 'Great practice today! Defense looked sharp.',
      time: '4 hours ago',
      icon: 'trophy' as const,
    },
    {
      id: 3,
      type: 'schedule',
      team: 'Varsity Football',
      title: 'Game film session added for Thursday',
      time: '1 day ago',
      icon: 'calendar' as const,
    },
  ];

  return (
    <Card className="compact-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <Typography variant="headline-md" className="text-navy-900">
          Team Feeds
        </Typography>
        <Icon name="users" size={14} color="slate" />
      </div>

      {/* Feed Content */}
      <div className="space-y-tight">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Feed Icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-jade-100 flex items-center justify-center mt-0.5">
              <Icon name={feed.icon} size={14} color="jade" />
            </div>

            {/* Feed Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <Typography variant="body-sm" className="font-medium text-navy-800 truncate">
                  {feed.team}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {feed.time}
                </Typography>
              </div>
              <Typography variant="body-sm" className="text-gray-700 mt-0.5 leading-snug">
                {feed.title}
              </Typography>
            </div>
          </div>
        ))}

        {/* Show More */}
        <div className="pt-2 border-t border-gray-100">
          <button className="w-full text-center py-2 text-sm text-jade-600 hover:text-jade-700 font-medium transition-colors">
            View All Team Updates
          </button>
        </div>
      </div>
    </Card>
  );
};
