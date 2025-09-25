import React from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { ModularIcon as Icon, SmartIconSystem } from "../ui/Icon";
interface PersonalTrophyShelfProps {
  userId: string;
  userRole?: string; // Optional for future role-based features
}
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
  const allAchievements = [
    ...helmetStickers.map((sticker) => ({
      id: sticker.id,
      type: "sticker",
      icon: sticker.icon,
      name: sticker.name,
      description: `Awarded by ${sticker.awardedByName}`,
      earned: true,
      date: sticker.date,
    })),
    ...boxcallMedals.map((medal) => ({
      id: medal.id,
      type: "medal",
      icon: medal.icon,
      name: medal.name,
      description: medal.description,
      earned: medal.earned,
      progress: medal.progress,
      maxProgress: medal.maxProgress,
    })),
  ];
  // Helper function to render consistent icons using available Icon component names
  const renderAchievementIcon = (
    iconData: React.ReactElement | string | undefined,
    name?: string,
    description?: string
  ) => {
    // If it's already a React element (icon), return it
    if (React.isValidElement(iconData)) {
      return iconData;
    }

    // Define available icon names that the Icon component supports
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

    let iconName: ValidIconName = "star"; // fallback

    if (typeof iconData === "string") {
      // Try to use the provided icon name directly first with our available icons
      const iconMap: { [key: string]: ValidIconName } = {
        target: "target",
        crown: "star", // crown -> star
        check: "check",
        zap: "zap",
        message: "message",
        calendar: "calendar",
        trophy: "trophy",
        award: "award",
        medal: "award", // medal -> award
        star: "star",
        flag: "flag",
        activity: "activity",
        shield: "shield",
      };
      iconName = iconMap[iconData] || "star"; // fallback to star if not found
    } else {
      // Use SmartIconSystem to analyze content and pick best icon
      const content = `${name || ""} ${description || ""}`;
      const smartIcon = SmartIconSystem.getContextualIcon(
        content,
        "achievement",
        "trophy"
      );
      // Map SmartIconSystem results to our available icons
      const smartIconMap: { [key: string]: ValidIconName } = {
        trophy: "trophy",
        award: "award",
        star: "star",
        target: "target",
        zap: "zap",
        check: "check",
        flag: "flag",
        activity: "activity",
        chart: "activity", // chart -> activity
        shield: "shield",
      };
      iconName = smartIconMap[smartIcon] || "star";
    }
    return <Icon name={iconName} size="sm" className="text-text-secondary" />;
  };
  // Show loading state
  if (loading) {
    return (
      <Card
        variant="glass"
        className="compact-card surface-card bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-subtle dark:border-jade-800"
      >
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jade-600"></div>
        </div>
      </Card>
    );
  }
  // Show error state
  if (error) {
    return (
      <Card
        variant="glass"
        className="compact-card surface-card bg-surface-error border-subtle dark:border-text-error"
      >
        <Typography
          variant="headline-md"
          className="text-text-error text-center"
        >
          Failed to load achievements
        </Typography>
      </Card>
    );
  }
  return (
    <Card
      variant="glass"
      className="compact-card surface-card bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-subtle dark:border-jade-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="trophy" size="sm" className="text-text-warning" />
          <Typography variant="headline-md" className="text-text-primary">
            Trophy Shelf
          </Typography>
        </div>
        <div className="flex-1 flex justify-center">
          <Typography
            variant="body-sm"
            className="font-semibold text-text-primary"
          >
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
      {/* Main Layout: Left Stats + Right Achievements */}
      <div className="flex gap-3 h-full">
        {/* Left: Vertical Stats Stack */}
        <div className="flex flex-col gap-2 w-20">
          <div className="text-center p-2 surface-card/50 dark:surface-card/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="zap" size="sm" className="text-text-warning" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-text-warning text-center"
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
          <div className="text-center p-2 surface-card/50 dark:surface-card/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="star" size="sm" className="text-jade-600" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-jade-600 text-center"
            >
              {helmetStickers.length}
            </Typography>
            <Typography
              variant="caption"
              color="muted"
              className="text-xs text-center"
            >
              Stickers
            </Typography>
          </div>
          <div className="text-center p-2 surface-card/50 dark:surface-card/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="award" size="sm" className="text-text-info" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-text-info text-center"
            >
              {boxcallMedals.filter((m) => m.earned).length}
            </Typography>
            <Typography
              variant="caption"
              color="muted"
              className="text-xs text-center"
            >
              Medals
            </Typography>
          </div>
          <div className="text-center p-2 surface-card/50 dark:surface-card/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="target" size="sm" className="text-text-primary" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-text-primary text-center"
            >
              {boxcallMedals.length}
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
        {/* Right: Scrollable Achievements Section */}
        <div className="flex-1">
          {/* Container matching the height of the 4 stat boxes */}
          <div className="flex flex-col gap-2" style={{ height: "176px" }}>
            {/* Achievement List - Scrollable within the constrained container */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-jade-300 scrollbar-track-transparent pr-1">
              {allAchievements.length > 0 ? (
                allAchievements.map((achievement) => (
                  <div
                    key={`${achievement.type}-${achievement.id}`}
                    className="flex items-center space-x-3 py-2 px-3 h-10 mb-1 surface-card/60 dark:surface-card/40 rounded-lg border border-subtle dark:border-text-tertiary/30"
                  >
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
                      <Typography
                        variant="caption"
                        className="font-semibold truncate"
                      >
                        {achievement.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="muted"
                        className="block truncate"
                      >
                        {achievement.description}
                      </Typography>
                    </div>
                    {achievement.earned && (
                      <div className="w-1.5 h-1.5 surface-subtle0 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
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
                    There's nothing like goals to chase! BoxCall creates
                    seasonal achievements so you can stay on track. Earn medals
                    by completing tasks like studying your playbook, creating
                    calendar events, connecting with your team and more. Your
                    coach can award helmet stickers, and you can all work
                    together to add trophies to your team trophy case. Let's
                    help you reach your dreams and fill your trophy shelf!
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
