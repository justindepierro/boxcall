import React from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { OnboardingHint } from "../onboarding/OnboardingHint";
interface TeamCalendarProps {
  teamId: string;
}
/**
 * Team Calendar - Team-specific events and schedule
 *
 * Features:
 * - Team games, practices, and meetings
 * - Team-specific calendar view
 * - Event details and locations
 * - RSVP functionality for events
 */
export const TeamCalendar: React.FC<TeamCalendarProps> = () => {
  const events: unknown[] = [];
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Icon name="calendar" size="md" /> Team Calendar
        </Typography>
      </div>
      {!events.length && (
        <OnboardingHint
          icon="calendar"
          title="Schedule Your First Event"
          message="Add games, practices, meetings, and film sessions to build your season schedule."
          steps={[
            "Create an event (coach roles)",
            "Players will see upcoming commitments",
            "RSVP & attendance tracking (roadmap)",
          ]}
          actions={[
            {
              label: "Plan Event",
              variant: "primary",
              onClick: () =>
                console.log("telemetry:onboarding.calendar.plan_event"),
            },
            {
              label: "View Roadmap",
              variant: "ghost",
              onClick: () =>
                console.log("telemetry:onboarding.calendar.view_roadmap"),
            },
          ]}
        />
      )}
    </Card>
  );
};
