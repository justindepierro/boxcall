import React from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Card } from "../ui";

interface PersonalTrophyShelfProps {
  userId: string;
  userRole: string;
}

/**
 * Personal Trophy Shelf - MySpace meets Strava achievements
 *
 * Features:
 * - Helmet Stickers (team achievements from coaches)
 * - BoxCall Medals (platform-specific achievements)
 * - Achievement progress and streaks
 * - Pinned trophy display at top of personal dashboard
 */
export const PersonalTrophyShelf: React.FC<PersonalTrophyShelfProps> = ({
  userId,
  userRole,
}) => {
  // Get real achievement data
  const {
    helmetStickers,
    boxcallMedals,
    weeklyStreak,
    totalPoints,
    loading,
    error,
  } = useAchievements(userId);

  // Show loading state
  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-jade-200 dark:border-jade-800">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <Typography
          variant="body-md"
          className="text-red-600 dark:text-red-400 text-center"
        >
          Failed to load achievements
        </Typography>
      </Card>
    );
  }

  const isPlayer = userRole === "player";

  return (
    <Card className="p-6 bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-jade-200 dark:border-jade-800">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="text-gray-900 dark:text-white"
        >
          🏆 Trophy Shelf
        </Typography>
        <div className="text-right">
          <Typography variant="body-sm" color="muted">
            Total Points
          </Typography>
          <Typography
            variant="headline-sm"
            className="text-jade-600 dark:text-jade-400 font-bold"
          >
            {totalPoints}
          </Typography>
        </div>
      </div>

      {/* Weekly Streak */}
      <div className="flex items-center justify-between mb-6 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🔥</div>
          <div>
            <Typography
              variant="body-md"
              className="font-semibold text-gray-900 dark:text-white"
            >
              Weekly Streak
            </Typography>
            <Typography variant="body-sm" color="muted">
              Keep it up!
            </Typography>
          </div>
        </div>
        <Typography variant="headline-lg" className="text-orange-500 font-bold">
          {weeklyStreak}
        </Typography>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography
            variant="body-lg"
            className="font-bold text-jade-600 dark:text-jade-400"
          >
            {helmetStickers.length}
          </Typography>
          <Typography variant="caption" color="muted">
            Helmet Stickers
          </Typography>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography
            variant="body-lg"
            className="font-bold text-blue-600 dark:text-blue-400"
          >
            {boxcallMedals.filter((m) => m.earned).length}
          </Typography>
          <Typography variant="caption" color="muted">
            BoxCall Medals
          </Typography>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography
            variant="body-lg"
            className="font-bold text-purple-600 dark:text-purple-400"
          >
            {weeklyStreak}
          </Typography>
          <Typography variant="caption" color="muted">
            Day Streak
          </Typography>
        </div>
      </div>

      {/* Recent Helmet Stickers */}
      {isPlayer && helmetStickers.length > 0 && (
        <div className="mb-6">
          <Typography
            variant="body-md"
            className="font-semibold mb-3 text-gray-900 dark:text-white"
          >
            Recent Helmet Stickers
          </Typography>
          <div className="space-y-2">
            {helmetStickers.slice(0, 3).map((sticker) => (
              <div
                key={sticker.id}
                className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-md"
              >
                <div className="text-2xl">{sticker.icon}</div>
                <div className="flex-1">
                  <Typography variant="body-sm" className="font-semibold">
                    {sticker.name}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Awarded by {sticker.awardedByName}
                  </Typography>
                </div>
                <Typography variant="caption" color="muted">
                  {new Date(sticker.date).toLocaleDateString()}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BoxCall Medals Progress */}
      <div className="mb-6">
        <Typography
          variant="body-md"
          className="font-semibold mb-3 text-gray-900 dark:text-white"
        >
          BoxCall Achievements
        </Typography>
        <div className="space-y-2">
          {boxcallMedals.map((medal) => (
            <div
              key={medal.id}
              className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-md"
            >
              <div
                className={`text-2xl ${medal.earned ? "" : "grayscale opacity-50"}`}
              >
                {medal.icon}
              </div>
              <div className="flex-1">
                <Typography variant="body-sm" className="font-semibold">
                  {medal.name}
                </Typography>
                <Typography variant="caption" color="muted">
                  {medal.description}
                </Typography>
                {!medal.earned && medal.progress && medal.maxProgress && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-jade-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(medal.progress / medal.maxProgress) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <Typography variant="caption" color="muted">
                      {medal.progress}/{medal.maxProgress}
                    </Typography>
                  </div>
                )}
              </div>
              {medal.earned && (
                <div className="w-2 h-2 bg-jade-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-jade-200 dark:border-jade-700">
        <button className="w-full py-2 text-jade-600 dark:text-jade-400 hover:bg-jade-100 dark:hover:bg-jade-900/30 rounded-md transition-colors">
          View All Achievements
        </button>
      </div>
    </Card>
  );
};
