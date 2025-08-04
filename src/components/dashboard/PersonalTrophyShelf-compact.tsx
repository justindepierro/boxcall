import React, { useState } from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";
interface PersonalTrophyShelfProps {
  userId: string;
  userRole: string;
}
/**
 * Personal Trophy Shelf - Compact Scrollable Design
 *
 * Features:
 * - Compact stats in grid layout
 * - Scrollable achievements with up/down controls
 * - Space-efficient design matching user's vision
 * - Combined helmet stickers and BoxCall medals
 */
export const PersonalTrophyShelf: React.FC<PersonalTrophyShelfProps> = ({
  userId,
  userRole: _userRole,
}) => {
  const [achievementScrollIndex, setAchievementScrollIndex] = useState(0);
  const {
    helmetStickers,
    boxcallMedals,
    weeklyStreak,
    totalPoints,
    loading,
    error,
  } = useAchievements(userId);
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
  const visibleAchievements = 3; // Show 3 achievements at a time
  const maxScrollIndex = Math.max(
    0,
    allAchievements.length - visibleAchievements
  );
  const scrollUp = () => {
    setAchievementScrollIndex(Math.max(0, achievementScrollIndex - 1));
  };
  const scrollDown = () => {
    setAchievementScrollIndex(
      Math.min(maxScrollIndex, achievementScrollIndex + 1)
    );
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
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="award" size={14} className="text-yellow-600" />
          <Typography
            variant="headline-md"
            className="text-gray-900 dark:text-white"
          >
            Trophy Shelf
          </Typography>
        </div>
        <div className="text-right">
          <Typography variant="caption" color="muted">
            240 points
          </Typography>
          <Typography
            variant="body-lg"
            className="text-jade-600 dark:text-jade-400 font-bold"
          >
            {totalPoints}
          </Typography>
        </div>
      </div>
      {/* Compact Stats Row */}
      <div className="grid grid-cols-4 gap-2 my-3">
        <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded">
          <div className="flex items-center justify-center mb-1">
            <Icon name="flame" size={14} color="warning" />
          </div>
          <Typography variant="body-sm" className="font-bold text-orange-500">
            {weeklyStreak}
          </Typography>
          <Typography variant="caption" color="muted">
            Streak
          </Typography>
        </div>
        <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded">
          <Typography variant="body-sm" className="font-bold text-jade-600">
            {helmetStickers.length}
          </Typography>
          <Typography variant="caption" color="muted">
            Stickers
          </Typography>
        </div>
        <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded">
          <Typography variant="body-sm" className="font-bold text-blue-600">
            {boxcallMedals.filter((m) => m.earned).length}
          </Typography>
          <Typography variant="caption" color="muted">
            Medals
          </Typography>
        </div>
        <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded">
          <Typography variant="body-sm" className="font-bold text-purple-600">
            {boxcallMedals.length}
          </Typography>
          <Typography variant="caption" color="muted">
            Total
          </Typography>
        </div>
      </div>
      {/* Scrollable Achievements Section */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Typography
            variant="body-sm"
            className="font-semibold text-gray-900 dark:text-white"
          >
            BoxCall Achievements
          </Typography>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollUp}
              disabled={achievementScrollIndex === 0}
              className="p-1 h-6 w-6"
            >
              <Icon name="chevron-up" size={12} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollDown}
              disabled={achievementScrollIndex >= maxScrollIndex}
              className="p-1 h-6 w-6"
            >
              <Icon name="chevron-down" size={12} />
            </Button>
          </div>
        </div>
        {/* Achievement List - Fixed Height with Scroll */}
        <div className="h-[120px] overflow-hidden">
          <div
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateY(-${achievementScrollIndex * 40}px)`,
            }}
          >
            {allAchievements.map((achievement) => (
              <div
                key={`${achievement.type}-${achievement.id}`}
                className="flex items-center space-x-3 py-2 h-10"
              >
                <div
                  className={`text-lg ${achievement.earned ? "" : "grayscale opacity-50"}`}
                >
                  {achievement.icon}
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
            ))}
          </div>
        </div>
        {/* Scroll Indicator */}
        {allAchievements.length > visibleAchievements && (
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              {Array.from({
                length: Math.ceil(allAchievements.length / visibleAchievements),
              }).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    Math.floor(achievementScrollIndex / visibleAchievements) ===
                    index
                      ? "bg-jade-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
