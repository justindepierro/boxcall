import React from "react";

import { Typography } from "../design-system";
import { Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

interface TeamTrophyCaseProps {
  teamId: string;
  compact?: boolean;
  onClick?: () => void;
}

export const TeamTrophyCase: React.FC<TeamTrophyCaseProps> = ({
  teamId,
  compact = false,
  onClick,
}) => {
  if (compact) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform duration-200"
        onClick={onClick}
      >
        <div className="w-16 h-16 bg-aurora-amber rounded-2xl flex items-center justify-center mb-3 shadow-lg">
          <Icon name="award" size="xl" className="text-warning-600" />
        </div>
        <Typography
          variant="label-md"
          className="text-text-primary font-medium mb-1"
        >
          Trophy Case
        </Typography>
        <Typography variant="caption" color="muted" className="text-xs">
          0 trophies
        </Typography>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3 icon-text-safe">
        <Icon name="award" size="md" className="flex-shrink-0" />
        <Typography variant="headline-md" className="text-truncate">
          Team Trophy Case
        </Typography>
      </div>

      <div className="flex-1">
        <Typography
          variant="body-sm"
          color="muted"
          className="mb-4 leading-relaxed text-truncate-3"
        >
          This area will display season goals, helmet stickers, medals, and
          academic/community awards as you begin using the platform.
        </Typography>
        <ol className="list-decimal list-inside space-y-1 text-sm text-text-secondary mb-4">
          <li className="text-truncate">Record a game or practice result</li>
          <li className="text-truncate">Award a player a sticker</li>
          <li className="text-truncate">Add a season goal</li>
          <li className="text-truncate">Track academic achievements</li>
        </ol>
      </div>

      <div className="mt-auto pt-3">
        <Button
          variant="primary"
          className="w-full btn-overflow-safe"
          onClick={() => console.info("achievements.help.click", { teamId })}
        >
          <span className="text-truncate">Learn Achievements</span>
        </Button>
      </div>
    </div>
  );
};
