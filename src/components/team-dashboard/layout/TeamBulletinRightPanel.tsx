import React from "react";
import { Card } from "../../ui";
import { Typography } from "../../design-system";
import { TeamCalendar } from "../TeamCalendar";
import { OnboardingHint } from "../../onboarding/OnboardingHint";
import { PlayerRosterContainer } from "../../team/PlayerRosterContainer";

interface RightPanelProps {
  teamId: string | undefined;
}

export const TeamBulletinRightPanel: React.FC<RightPanelProps> = ({
  teamId,
}) => {
  return (
    <aside
      className="lg:col-span-1 space-y-6"
      aria-labelledby="calendar-roster-heading"
    >
      <TeamCalendar teamId={teamId || ""} />
      <Card className="p-6" aria-label="Upcoming events onboarding hint">
        <div className="flex items-center justify-between mb-4">
          <Typography
            as="h2"
            id="calendar-roster-heading"
            variant="headline-md"
            className="text-gray-900 dark:text-white"
          >
            Roster
          </Typography>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <PlayerRosterContainer teamId={teamId || ""} />
        </div>
      </Card>
      <Card className="p-6">
        <OnboardingHint
          icon="calendar"
          title="Upcoming Events"
          message="Once you add games, practices, and meetings they will be summarized here for quick reference."
          actions={[
            {
              label: "Open Calendar",
              variant: "primary",
              onClick: () => console.log("onboarding.upcoming.open_calendar"),
            },
          ]}
        />
      </Card>
  </aside>
  );
};
