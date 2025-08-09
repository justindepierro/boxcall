import React from "react";
import { Card } from "../../ui";
import { Typography } from "../../design-system";
import { TeamFeed } from "../TeamFeed";

interface FeedPanelProps {
  teamId: string | undefined;
  userRole: string;
  isCoach: boolean;
}

export const TeamBulletinFeedPanel: React.FC<FeedPanelProps> = ({
  teamId,
  userRole,
  isCoach,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography
            variant="headline-md"
            className="text-gray-900 dark:text-white"
          >
            Team Feed
          </Typography>
          {isCoach && (
            <button className="px-4 py-2 bg-jade-500 text-white rounded-md hover:bg-jade-600 transition-colors">
              + New Post
            </button>
          )}
        </div>
        <TeamFeed teamId={teamId || ""} userRole={userRole} />
      </Card>
    </div>
  );
};
