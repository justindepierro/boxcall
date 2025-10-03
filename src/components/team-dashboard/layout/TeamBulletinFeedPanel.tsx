import React from "react";

import { Card } from "../../ui";
import { TeamFeed } from "../TeamFeed";

interface FeedPanelProps {
  teamId: string | undefined;
  userRole: string;
}

export const TeamBulletinFeedPanel: React.FC<FeedPanelProps> = ({
  teamId,
  userRole,
}) => {
  return (
    <section
      className="lg:col-span-2 space-y-4"
      aria-labelledby="team-feed-heading"
    >
      <Card className="p-3">
        <TeamFeed teamId={teamId || ""} userRole={userRole} />
      </Card>
    </section>
  );
};
