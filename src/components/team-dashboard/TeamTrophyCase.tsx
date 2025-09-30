import React from "react";

import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

interface TeamTrophyCaseProps {
  teamId: string;
}

export const TeamTrophyCase: React.FC<TeamTrophyCaseProps> = ({ teamId }) => {
  return (
    <Card className="p-6 surface-card border-subtle card-overflow-safe">
      <div className="flex items-center gap-2 mb-3 icon-text-safe">
        <Icon name="award" size="md" className="flex-shrink-0" />
        <Typography variant="headline-md" className="text-truncate">Team Trophy Case</Typography>
      </div>
      <Typography
        variant="body-sm"
        color="muted"
        className="mb-4 leading-relaxed text-truncate-3"
      >
        This area will display season goals, helmet stickers, medals, and
        academic/community awards as you begin using the platform.
      </Typography>
      <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary mb-4">
        <li className="text-truncate">Record a game or practice result (updates streak & rank)</li>
        <li className="text-truncate">Award a player a sticker (coming soon)</li>
        <li className="text-truncate">Add a season goal (coming soon)</li>
        <li className="text-truncate">Track academic/community achievements (coming soon)</li>
      </ol>
      <Button
        variant="primary"
        size="sm"
        fullWidth
        className="btn-overflow-safe"
        onClick={() => console.info("achievements.help.click", { teamId })}
      >
        <span className="text-truncate">Learn how achievements work</span>
      </Button>
    </Card>
  );
};
