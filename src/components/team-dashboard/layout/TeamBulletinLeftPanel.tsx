import React from "react";

import { Typography } from "../../design-system";
import { Card } from "../../ui";
import { SeasonStatsCard } from "../SeasonStatsCard";
import { TeamQuickActions } from "../TeamQuickActions";
import { TeamTrophyCase } from "../TeamTrophyCase";

interface LeftPanelProps {
  teamId: string | undefined;
  userRole: string;
}

export const TeamBulletinLeftPanel: React.FC<LeftPanelProps> = ({
  teamId,
  userRole,
}) => {
  return (
    <aside
      className="lg:col-span-1 space-y-4"
      aria-labelledby="team-actions-heading"
    >
      <TeamTrophyCase teamId={teamId || ""} />
      <Card className="bc-card-padding">
        <Typography
          as="h2"
          id="team-actions-heading"
          variant="headline-md"
          className="mb-4 text-text-primary"
        >
          Team Actions
        </Typography>
        <TeamQuickActions teamId={teamId || ""} userRole={userRole} />
      </Card>
      <SeasonStatsCard teamId={teamId || ""} userRole={userRole} />
    </aside>
  );
};
