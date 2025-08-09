import React from "react";
import { Card } from "../../ui";
import { Typography } from "../../design-system";
import { TeamFeed } from "../TeamFeed";
import { Button } from "../../ui";
import {
  postCreateStarted,
  postCreateSucceeded,
  postCreateFailed,
} from "../../../lib/telemetry";

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
    <section
      className="lg:col-span-2 space-y-6"
      aria-labelledby="team-feed-heading"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Typography
            as="h2"
            id="team-feed-heading"
            variant="headline-lg"
            className="text-gray-900 dark:text-white"
          >
            Team Feed
          </Typography>
          {isCoach && (
            <Button
              variant="primary"
              size="sm"
              aria-label="Create new post"
              onClick={async () => {
                try {
                  postCreateStarted();
                  // Placeholder logic until modal / form is implemented
                  await new Promise((res) => setTimeout(res, 250));
                  postCreateSucceeded();
                } catch (e) {
                  postCreateFailed({ error: (e as Error).message });
                }
              }}
            >
              New Post
            </Button>
          )}
        </div>
        <TeamFeed teamId={teamId || ""} userRole={userRole} />
      </Card>
  </section>
  );
};
