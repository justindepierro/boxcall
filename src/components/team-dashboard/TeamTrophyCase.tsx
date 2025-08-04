import React from "react";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";
interface TeamTrophyCaseProps {
  teamId: string;
}
/**
 * Team Trophy Case - Collective team achievements
 *
 * Features:
 * - Team goal trophies and milestones
 * - All helmet stickers awarded to team members
 * - Team medals and BoxCall achievements
 * - Season achievements and records
 */
export const TeamTrophyCase: React.FC<TeamTrophyCaseProps> = () => {
  // TODO: Use teamId for fetching team-specific achievements
  // Mock team achievement data - TODO: Fetch from database
  const mockTeamAchievements = {
    teamGoals: [
      {
        id: "1",
        name: "Undefeated Season",
        icon: "award",
        progress: 8,
        target: 10,
        completed: false,
      },
      {
        id: "2",
        name: "League Championship",
        icon: "👑",
        progress: 1,
        target: 1,
        completed: true,
      },
      {
        id: "3",
        name: "Team GPA 3.5+",
        icon: "📚",
        progress: 1,
        target: 1,
        completed: true,
      },
    ],
    teamMedals: [
      {
        id: "1",
        name: "Perfect Practice Week",
        icon: "⭐",
        earned: true,
        date: "2024-08-10",
      },
      {
        id: "2",
        name: "Zero Penalties Game",
        icon: "🚫",
        earned: true,
        date: "2024-08-05",
      },
      {
        id: "3",
        name: "Community Service Champions",
        icon: "🤝",
        earned: false,
        progress: 75,
      },
    ],
    helmetStickers: {
      total: 47,
      thisWeek: 8,
      categories: [
        { name: "Touchdowns", count: 12, icon: "🏈" },
        { name: "Perfect Practice", count: 15, icon: "⭐" },
        { name: "Leadership", count: 8, icon: "👑" },
        { name: "Academic Excellence", count: 12, icon: "📚" },
      ],
    },
    teamStats: {
      totalPoints: 1247,
      rank: 2,
      streak: 5,
    },
  };
  return (
    <Card className="p-6 bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-900/20 dark:to-navy-800/20 border-navy-200 dark:border-navy-800">
      <div className="flex items-center justify-between mb-4">
        <Typography
          variant="headline-md"
          className="text-gray-900 dark:text-white flex items-center gap-2"
        >
          <Icon name="award" size="md" color="current" />
          Team Trophy Case
        </Typography>
        <div className="text-right">
          <Typography variant="body-sm" color="muted">
            League Rank
          </Typography>
          <Typography
            variant="body-lg"
            className="font-bold text-navy-600 dark:text-navy-400"
          >
            #{mockTeamAchievements.teamStats.rank}
          </Typography>
        </div>
      </div>
      {/* Team Stats Overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography
            variant="body-lg"
            className="font-bold text-jade-600 dark:text-jade-400"
          >
            {mockTeamAchievements.helmetStickers.total}
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
            {mockTeamAchievements.teamMedals.filter((m) => m.earned).length}
          </Typography>
          <Typography variant="caption" color="muted">
            Team Medals
          </Typography>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <Typography
            variant="body-lg"
            className="font-bold text-purple-600 dark:text-purple-400"
          >
            {mockTeamAchievements.teamStats.streak}
          </Typography>
          <Typography variant="caption" color="muted">
            Win Streak
          </Typography>
        </div>
      </div>
      {/* Team Goals Progress */}
      <div className="mb-6">
        <Typography
          variant="body-md"
          className="font-semibold mb-3 text-gray-900 dark:text-white"
        >
          Season Goals
        </Typography>
        <div className="space-y-3">
          {mockTeamAchievements.teamGoals.map((goal) => (
            <div
              key={goal.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{goal.icon}</span>
                  <Typography variant="body-sm" className="font-semibold">
                    {goal.name}
                  </Typography>
                </div>
                {goal.completed && (
                  <div className="w-2 h-2 bg-jade-500 rounded-full"></div>
                )}
              </div>
              {!goal.completed && (
                <div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                    <div
                      className="bg-jade-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(goal.progress / goal.target) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <Typography variant="caption" color="muted">
                    {goal.progress}/{goal.target}
                  </Typography>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Helmet Sticker Categories */}
      <div className="mb-6">
        <Typography
          variant="body-md"
          className="font-semibold mb-3 text-gray-900 dark:text-white"
        >
          Helmet Sticker Breakdown
        </Typography>
        <div className="space-y-2">
          {mockTeamAchievements.helmetStickers.categories.map(
            (category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <Typography variant="body-sm">{category.name}</Typography>
                </div>
                <Typography
                  variant="body-sm"
                  className="font-bold text-jade-600 dark:text-jade-400"
                >
                  {category.count}
                </Typography>
              </div>
            )
          )}
        </div>
      </div>
      {/* Recent Team Medals */}
      <div className="mb-6">
        <Typography
          variant="body-md"
          className="font-semibold mb-3 text-gray-900 dark:text-white"
        >
          Team Achievements
        </Typography>
        <div className="space-y-2">
          {mockTeamAchievements.teamMedals.map((medal) => (
            <div
              key={medal.id}
              className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-md"
            >
              <div
                className={`text-lg ${medal.earned ? "" : "grayscale opacity-50"}`}
              >
                {medal.icon}
              </div>
              <div className="flex-1">
                <Typography variant="body-sm" className="font-semibold">
                  {medal.name}
                </Typography>
                {medal.earned ? (
                  <Typography variant="caption" color="muted">
                    Earned {new Date(medal.date!).toLocaleDateString()}
                  </Typography>
                ) : (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-jade-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${medal.progress}%` }}
                      ></div>
                    </div>
                    <Typography variant="caption" color="muted">
                      {medal.progress}% complete
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="pt-4 border-t border-navy-200 dark:border-navy-700">
        <button className="w-full py-2 text-navy-600 dark:text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-900/30 rounded-md transition-colors">
          View All Team Achievements
        </button>
      </div>
    </Card>
  );
};
