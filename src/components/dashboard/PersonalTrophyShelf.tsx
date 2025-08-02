import React from 'react';
import { Typography } from '../design-system';
import { Card } from '../ui';

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
  // userId, // TODO: Use for fetching user-specific achievements
  userRole
}) => {
  // Mock achievement data - TODO: Fetch from database
  const mockAchievements = {
    helmetStickers: [
      { id: "1", name: "First Touchdown", icon: "🏈", awardedBy: "Coach Johnson", date: "2024-08-15" },
      { id: "2", name: "Perfect Practice", icon: "⭐", awardedBy: "Coach Williams", date: "2024-08-12" },
      { id: "3", name: "Team Leader", icon: "👑", awardedBy: "Coach Johnson", date: "2024-08-10" },
    ],
    boxcallMedals: [
      { id: "1", name: "Profile Complete", icon: "✅", description: "Completed profile setup", earned: true },
      { id: "2", name: "Team Player", icon: "🤝", description: "Joined first team", earned: true },
      { id: "3", name: "Week Warrior", icon: "🔥", description: "Active 7 days straight", earned: false, progress: 5 },
    ],
    weeklyStreak: 5,
    totalPoints: 285
  };

  const isPlayer = userRole === 'player';
  // const isCoach = userRole === 'coach' || userRole === 'head_coach'; // TODO: Use for coach-specific achievements

  return (
    <Card className="p-6 bg-gradient-to-br from-jade-50 to-jade-100 dark:from-jade-900/20 dark:to-jade-800/20 border-jade-200 dark:border-jade-800">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="headline-md" className="text-gray-900 dark:text-white">
          🏆 Trophy Shelf
        </Typography>
        <div className="text-right">
          <Typography variant="body-sm" color="muted">
            Total Points
          </Typography>
          <Typography variant="body-lg" className="font-bold text-jade-600 dark:text-jade-400">
            {mockAchievements.totalPoints}
          </Typography>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography variant="body-lg" className="font-bold text-jade-600 dark:text-jade-400">
            {mockAchievements.helmetStickers.length}
          </Typography>
          <Typography variant="caption" color="muted">
            Helmet Stickers
          </Typography>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography variant="body-lg" className="font-bold text-blue-600 dark:text-blue-400">
            {mockAchievements.boxcallMedals.filter(m => m.earned).length}
          </Typography>
          <Typography variant="caption" color="muted">
            BoxCall Medals
          </Typography>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography variant="body-lg" className="font-bold text-purple-600 dark:text-purple-400">
            {mockAchievements.weeklyStreak}
          </Typography>
          <Typography variant="caption" color="muted">
            Day Streak
          </Typography>
        </div>
      </div>

      {/* Recent Helmet Stickers */}
      {isPlayer && mockAchievements.helmetStickers.length > 0 && (
        <div className="mb-6">
          <Typography variant="body-md" className="font-semibold mb-3 text-gray-900 dark:text-white">
            Recent Helmet Stickers
          </Typography>
          <div className="space-y-2">
            {mockAchievements.helmetStickers.slice(0, 3).map((sticker) => (
              <div key={sticker.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-md">
                <div className="text-2xl">{sticker.icon}</div>
                <div className="flex-1">
                  <Typography variant="body-sm" className="font-semibold">
                    {sticker.name}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Awarded by {sticker.awardedBy}
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
        <Typography variant="body-md" className="font-semibold mb-3 text-gray-900 dark:text-white">
          BoxCall Achievements
        </Typography>
        <div className="space-y-2">
          {mockAchievements.boxcallMedals.map((medal) => (
            <div key={medal.id} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-md">
              <div className={`text-2xl ${medal.earned ? '' : 'grayscale opacity-50'}`}>
                {medal.icon}
              </div>
              <div className="flex-1">
                <Typography variant="body-sm" className="font-semibold">
                  {medal.name}
                </Typography>
                <Typography variant="caption" color="muted">
                  {medal.description}
                </Typography>
                {!medal.earned && medal.progress && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-jade-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(medal.progress / 7) * 100}%` }}
                      ></div>
                    </div>
                    <Typography variant="caption" color="muted">
                      {medal.progress}/7 days
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
