import React from "react";
import { Typography } from "../../design-system";

interface AchievementsGridProps {
  achievements: {
    stickers: number;
    medals: number;
    streak: number;
    points: number;
  };
}

interface AchievementItemProps {
  label: string;
  value: number;
  colorClass: string;
}

const AchievementItem: React.FC<AchievementItemProps> = ({
  label,
  value,
  colorClass,
}) => (
  <div
    className={`bg-${colorClass}/5 rounded-lg p-3 md:p-sm text-center border border-${colorClass}/20 hover:border-${colorClass}/40 hover:shadow-md hover:scale-[1.02] transition-all duration-200`}
  >
    <Typography
      variant="body-xs"
      className={`text-${colorClass} font-medium text-xs`}
    >
      {label}
    </Typography>
    <Typography
      variant="body-sm"
      className={`font-bold text-${colorClass} text-2xl md:text-lg mt-1`}
    >
      {value}
    </Typography>
  </div>
);

/**
 * Achievements Grid - 2x2 on mobile, 4 columns on desktop
 */
export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
  achievements,
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-sm">
    <AchievementItem
      label="Stickers"
      value={achievements.stickers}
      colorClass="brand-primary"
    />
    <AchievementItem
      label="Medals"
      value={achievements.medals}
      colorClass="success"
    />
    <AchievementItem
      label="Streak"
      value={achievements.streak}
      colorClass="warning"
    />
    <AchievementItem
      label="Points"
      value={achievements.points}
      colorClass="brand-secondary"
    />
  </div>
);

export const AchievementsLoading: React.FC = () => (
  <div className="flex items-center justify-center py-md">
    <div className="w-6 h-6 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
    <Typography variant="body-xs" className="text-muted ml-xs">
      Loading achievements…
    </Typography>
  </div>
);
