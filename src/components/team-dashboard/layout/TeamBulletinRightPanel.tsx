import React from "react";

import { Typography } from "../../design-system";
import { OnboardingHint } from "../../onboarding/OnboardingHint";
import { PlayerRosterContainer } from "../../team/PlayerRosterContainer";
import { Card } from "../../ui";
import { TeamCalendar } from "../TeamCalendar";

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
      <Card
        className="bc-card-padding"
        aria-label="Upcoming events onboarding hint"
      >
        <div className="flex items-center justify-between mb-4">
          <Typography
            as="h2"
            id="calendar-roster-heading"
            variant="headline-md"
            className="text-text-primary"
          >
            Roster
          </Typography>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <PlayerRosterContainer teamId={teamId || ""} />
        </div>
      </Card>
      <Card className="bc-card-padding">
        <OnboardingHint
          icon="calendar"
          title="Upcoming Events"
          message="Once you add games, practices, and meetings they will be summarized here for quick reference."
          actions={[
            {
              label: "Open Calendar",
              variant: "primary",
              onClick: () => console.info("onboarding.upcoming.open_calendar"),
            },
          ]}
        />
      </Card>
    </aside>
  );
};
