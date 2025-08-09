import React from "react";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

interface TeamTrophyCaseProps {
  teamId: string;
}

export const TeamTrophyCase: React.FC<TeamTrophyCaseProps> = ({ teamId }) => {
  return (
    <Card className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="award" size="md" />
        <Typography variant="headline-md">Team Trophy Case</Typography>
      </div>
      <Typography
        variant="body-sm"
        color="muted"
        className="mb-4 leading-relaxed"
      >
        This area will display season goals, helmet stickers, medals, and
        academic/community awards as you begin using the platform.
      </Typography>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
        <li>Record a game or practice result (updates streak & rank)</li>
        <li>Award a player a sticker (coming soon)</li>
        <li>Add a season goal (coming soon)</li>
        <li>Track academic/community achievements (coming soon)</li>
      </ol>
      <Button
        variant="primary"
        size="sm"
        fullWidth
        onClick={() => console.log("achievements.help.click", { teamId })}
      >
        Learn how achievements work
      </Button>
    </Card>
  );
};
