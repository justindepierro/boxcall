import React from "react";
// Feed placeholder currently only renders onboarding hint.
// Remove Typography/Icon imports until real feed implemented.
// import { Typography } from "../design-system";
// import { Icon } from "../ui/Icon/Icon";
import { OnboardingHint } from "../onboarding/OnboardingHint";
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
  const feedItems: unknown[] = [];
  if (!feedItems.length) {
    return (
      <OnboardingHint
        icon="message"
        title="Team Feed"
        message="Announcements, practice scripts, and achievements will appear here once you begin posting."
        steps={[
          "Click New Post (coach roles)",
          "Share schedule or practice focus",
          "Attach scripts or files (roadmap)",
        ]}
        actions={[
          {
            label: "Plan First Post",
            variant: "primary",
            onClick: () =>
              console.log("telemetry:onboarding.feed.plan_first_post"),
          },
          {
            label: "View Roadmap",
            variant: "ghost",
            onClick: () =>
              console.log("telemetry:onboarding.feed.view_roadmap"),
          },
        ]}
      />
    );
  }
  return <div />;
};
