import React from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Icon, SmartIconSystem, type IconName } from "../ui/Icon";
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
  // Helper function to render consistent icons using SmartIconSystem
  const renderAchievementIcon = (
    iconData: React.ReactElement | string | undefined,
    name?: string,
    description?: string
  ) => {
    // If it's already a React element (icon), return it
    if (React.isValidElement(iconData)) {
      return iconData;
    }
    // Use SmartIconSystem for intelligent icon selection
    let iconName: IconName = "star"; // fallback
    if (typeof iconData === "string") {
      // Try to use the provided icon name directly first
      const iconMap: { [key: string]: IconName } = {
        target: "target",
        crown: "crown",
        check: "check",
        zap: "zap",
        message: "message-circle",
        calendar: "calendar",
      };
      iconName = iconMap[iconData] || (iconData as IconName);
    } else {
      // Use SmartIconSystem to analyze content and pick best icon
      const content = `${name || ""} ${description || ""}`;
      iconName = SmartIconSystem.getContextualIcon(
        content,
        "achievement",
        "trophy"
      );
    }
    return <Icon name={iconName} size={16} className="text-gray-600" />;
  };
  // Show loading state
  if (loading) {
    return (
      <Card className="compact-card bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-jade-200 dark:border-jade-800">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jade-600"></div>
        </div>
      </Card>
    );
  }
  // Show error state
  if (error) {
    return (
      <Card className="compact-card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <Typography
          variant="headline-md"
          className="text-red-600 dark:text-red-400 text-center"
        >
          Failed to load achievements
        </Typography>
      </Card>
    );
  }
  return (
    <Card className="compact-card bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-jade-200 dark:border-jade-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="trophy" size={14} className="text-yellow-600" />
          <Typography
            variant="headline-md"
            className="text-gray-800 dark:text-white"
          >
            Trophy Shelf
          </Typography>
        </div>
        <div className="flex-1 flex justify-center">
          <Typography
            variant="body-sm"
            className="font-semibold text-gray-800 dark:text-white"
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
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="zap" size={14} className="text-orange-500" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-orange-500 text-center"
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
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="star" size={14} className="text-jade-600" />
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
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="medal" size={14} className="text-blue-600" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-blue-600 text-center"
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
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="target" size={14} className="text-purple-600" />
            </div>
            <Typography
              variant="body-sm"
              className="font-bold text-purple-600 text-center"
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
                    className="flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-white/60 dark:bg-gray-700/40 rounded-lg border border-white/40 dark:border-gray-600/30"
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
                      <div className="w-1.5 h-1.5 bg-jade-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
                  <Icon
                    name="trophy"
                    size={24}
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
