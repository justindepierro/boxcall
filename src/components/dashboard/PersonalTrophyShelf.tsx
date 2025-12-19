import React from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { ModularIcon as Icon, SmartIconSystem } from "../ui/Icon";
interface PersonalTrophyShelfProps {
  userId: string;
  userRole?: string; // Optional for future role-based features
}

type TrophyAchievementListItem = {
  id: string;
  type: "sticker" | "medal";
  icon: React.ReactElement | string | undefined;
  name: string;
  description: string;
  earned: boolean;
  date?: string;
  progress?: number;
  maxProgress?: number;
};

type ValidIconName =
  | "star"
  | "trophy"
  | "award"
  | "target"
  | "zap"
  | "check"
  | "flag"
  | "activity"
  | "shield"
  | "message"
  | "calendar";

const ICON_MAP: Record<string, ValidIconName> = {
  target: "target",
  crown: "star",
  check: "check",
  zap: "zap",
  message: "message",
  calendar: "calendar",
  trophy: "trophy",
  award: "award",
  medal: "award",
  star: "star",
  flag: "flag",
  activity: "activity",
  shield: "shield",
};

const SMART_ICON_MAP: Record<string, ValidIconName> = {
  trophy: "trophy",
  award: "award",
  star: "star",
  target: "target",
  zap: "zap",
  check: "check",
  flag: "flag",
  activity: "activity",
  chart: "activity",
  shield: "shield",
};

function renderAchievementIcon(
  iconData: React.ReactElement | string | undefined,
  name?: string,
  description?: string
): React.ReactNode {
  if (React.isValidElement(iconData)) {
    return iconData;
  }

  let iconName: ValidIconName = "star";

  if (typeof iconData === "string") {
    iconName = ICON_MAP[iconData] || "star";
  } else {
    const content = `${name || ""} ${description || ""}`;
    const smartIcon = SmartIconSystem.getContextualIcon(
      content,
      "achievement",
      "trophy"
    );
    iconName = SMART_ICON_MAP[smartIcon] || "star";
  }

  return <Icon name={iconName} size="sm" className="text-secondary" />;
}

const PersonalTrophyShelfLoading: React.FC = () => (
  <Card variant="default" size="lg">
    <div className="flex items-center justify-center h-24">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jade-600"></div>
    </div>
  </Card>
);

const PersonalTrophyShelfError: React.FC = () => (
  <Card
    variant="default"
    size="lg"
    className="bg-surface-error border-muted dark:border-text-error"
  >
    <Typography variant="headline-md" className="text-error text-center">
      Failed to load achievements
    </Typography>
  </Card>
);

const TrophyShelfHeader: React.FC<{ totalPoints: number }> = ({
  totalPoints,
}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon name="trophy" size="sm" className="text-warning" />
      <Typography variant="headline-md" className="text-primary">
        Trophy Shelf
      </Typography>
    </div>
    <div className="flex-1 flex justify-center">
      <Typography variant="body-sm" className="font-semibold text-primary">
        BoxCall Achievements
      </Typography>
    </div>
    <div className="text-right">
      <Typography
        variant="body-lg"
        className="text-jade-600 dark:text-jade-400 font-bold"
      >
        {totalPoints} points
      </Typography>
    </div>
  </div>
);

const TrophyShelfStats: React.FC<{
  weeklyStreak: number;
  helmetStickersCount: number;
  earnedMedalsCount: number;
  totalMedalsCount: number;
}> = ({
  weeklyStreak,
  helmetStickersCount,
  earnedMedalsCount,
  totalMedalsCount,
}) => (
  <div className="flex flex-col gap-2 w-20">
    <div className="text-center p-2 bg-secondary rounded-lg">
      <div className="flex items-center justify-center mb-1">
        <Icon name="zap" size="sm" className="text-warning" />
      </div>
      <Typography
        variant="body-sm"
        className="font-bold text-warning text-center"
      >
        {weeklyStreak}
      </Typography>
      <Typography
        variant="caption"
        color="muted"
        className="text-xs text-center"
      >
        Streak
      </Typography>
    </div>
    <div className="text-center p-2 bg-secondary rounded-lg">
      <div className="flex items-center justify-center mb-1">
        <Icon name="star" size="sm" className="text-jade-600" />
      </div>
      <Typography
        variant="body-sm"
        className="font-bold text-jade-600 text-center"
      >
        {helmetStickersCount}
      </Typography>
      <Typography
        variant="caption"
        color="muted"
        className="text-xs text-center"
      >
        Stickers
      </Typography>
    </div>
    <div className="text-center p-2 bg-secondary rounded-lg">
      <div className="flex items-center justify-center mb-1">
        <Icon name="award" size="sm" className="text-info" />
      </div>
      <Typography variant="body-sm" className="font-bold text-info text-center">
        {earnedMedalsCount}
      </Typography>
      <Typography
        variant="caption"
        color="muted"
        className="text-xs text-center"
      >
        Medals
      </Typography>
    </div>
    <div className="text-center p-2 bg-secondary rounded-lg">
      <div className="flex items-center justify-center mb-1">
        <Icon name="target" size="sm" className="text-primary" />
      </div>
      <Typography
        variant="body-sm"
        className="font-bold text-primary text-center"
      >
        {totalMedalsCount}
      </Typography>
      <Typography
        variant="caption"
        color="muted"
        className="text-xs text-center"
      >
        Total
      </Typography>
    </div>
  </div>
);

const TrophyShelfAchievementRow: React.FC<{
  achievement: TrophyAchievementListItem;
}> = ({ achievement }) => (
  <div className="flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-primary/60 dark:bg-primary/40 rounded-lg border border-muted dark:border-text-tertiary/30">
    <div
      className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${achievement.earned ? "" : "grayscale opacity-50"}`}
    >
      {renderAchievementIcon(
        achievement.icon,
        achievement.name,
        achievement.description
      )}
    </div>
    <div className="flex-1 min-w-0">
      <Typography variant="caption" className="font-semibold truncate">
        {achievement.name}
      </Typography>
      <Typography variant="caption" color="muted" className="block truncate">
        {achievement.description}
      </Typography>
    </div>
    {achievement.earned && (
      <div className="w-1.5 h-1.5 surface-subtle0 rounded-full flex-shrink-0"></div>
    )}
  </div>
);

const TrophyShelfAchievementsList: React.FC<{
  achievements: TrophyAchievementListItem[];
}> = ({ achievements }) => (
  <div className="flex-1">
    <div className="flex flex-col gap-2 h-44">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-jade-300 scrollbar-track-transparent pr-1">
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <TrophyShelfAchievementRow
              key={`${achievement.type}-${achievement.id}`}
              achievement={achievement}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
            <Icon
              name="trophy"
              size="lg"
              className="text-jade-400 mb-3 opacity-60"
            />
            <Typography
              variant="body-sm"
              className="font-semibold text-jade-700 dark:text-jade-300 mb-2"
            >
              Ready to Fill Your Trophy Shelf?
            </Typography>
            <Typography
              variant="caption"
              color="muted"
              className="text-xs leading-relaxed"
            >
              There's nothing like goals to chase! BoxCall creates seasonal
              achievements so you can stay on track. Earn medals by completing
              tasks like studying your playbook, creating calendar events,
              connecting with your team and more. Your coach can award helmet
              stickers, and you can all work together to add trophies to your
              team trophy case. Let's help you reach your dreams and fill your
              trophy shelf!
            </Typography>
          </div>
        )}
      </div>
    </div>
  </div>
);
/**
 * Personal Trophy Shelf - Compact Scrollable Design
 *
 * Features:
 * - Compact horizontal layout with vertical stats
 * - Scrollable achievements with standardized icons
 * - Achievement status indicators (earned/unearned)
 * - Integrated helmet stickers and BoxCall medals
 * - Responsive design with jade/navy color palette
 */
export const PersonalTrophyShelf: React.FC<PersonalTrophyShelfProps> = ({
  userId,
}) => {
  const { achievements, loading, error } = useAchievements(userId);

  // Extract properties from achievements with defaults
  const helmetStickers = achievements?.helmetStickers || [];
  const boxcallMedals = achievements?.boxcallMedals || [];
  const weeklyStreak = achievements?.weeklyStreak || 0;
  const totalPoints = achievements?.totalPoints || 0;

  // Combine all achievements for scrolling
  const allAchievements: TrophyAchievementListItem[] = [
    ...helmetStickers.map((sticker) => ({
      id: sticker.id,
      type: "sticker" as const,
      icon: sticker.icon,
      name: sticker.name,
      description: `Awarded by ${sticker.awardedByName}`,
      earned: true,
      date: sticker.date,
    })),
    ...boxcallMedals.map((medal) => ({
      id: medal.id,
      type: "medal" as const,
      icon: medal.icon,
      name: medal.name,
      description: medal.description,
      earned: medal.earned,
      progress: medal.progress,
      maxProgress: medal.maxProgress,
    })),
  ];

  if (loading) return <PersonalTrophyShelfLoading />;
  if (error) return <PersonalTrophyShelfError />;

  return (
    <Card variant="default" size="lg">
      <TrophyShelfHeader totalPoints={totalPoints} />
      {/* Main Layout: Left Stats + Right Achievements */}
      <div className="flex gap-3 h-full">
        <TrophyShelfStats
          weeklyStreak={weeklyStreak}
          helmetStickersCount={helmetStickers.length}
          earnedMedalsCount={boxcallMedals.filter((m) => m.earned).length}
          totalMedalsCount={boxcallMedals.length}
        />
        <TrophyShelfAchievementsList achievements={allAchievements} />
      </div>
    </Card>
  );
};
