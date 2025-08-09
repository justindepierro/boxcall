import React from "react";
import { Card } from "../../ui";
import { Typography } from "../../design-system";
import { TeamTrophyCase } from "../TeamTrophyCase";
import { TeamQuickActions } from "../TeamQuickActions";
import { OnboardingHint } from "../../onboarding/OnboardingHint";

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
      className="lg:col-span-1 space-y-6"
      aria-labelledby="team-actions-heading"
    >
      <TeamTrophyCase teamId={teamId || ""} />
      <Card className="p-6">
        <Typography
          as="h2"
          id="team-actions-heading"
          variant="headline-md"
          className="mb-4 text-gray-900 dark:text-white"
        >
          Team Actions
        </Typography>
        <TeamQuickActions teamId={teamId || ""} userRole={userRole} />
      </Card>
      <Card className="p-6">
        <OnboardingHint
          icon="chart"
          title="Season Stats"
          message="Track wins, points, and player performance here once you begin logging games and practices. We'll surface trends, streaks, and rankings."
          steps={[
            "Record first game or practice (feature pending)",
            "Automatic season aggregation",
            "Unlock comparative insights",
          ]}
          actions={[
            {
              label: "View Roadmap",
              variant: "ghost",
              onClick: () => console.log("onboarding.stats.roadmap"),
            },
          ]}
        />
      </Card>
  </aside>
  );
};
