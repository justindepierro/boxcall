import React from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";

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
    ...helmetStickers.map(sticker => ({
      id: sticker.id,
      type: 'sticker',
      icon: sticker.icon,
      name: sticker.name,
      description: `Awarded by ${sticker.awardedByName}`,
      earned: true,
      date: sticker.date
    })),
    ...boxcallMedals.map(medal => ({
      id: medal.id,
      type: 'medal',
      icon: medal.icon,
      name: medal.name,
      description: medal.description,
      earned: medal.earned,
      progress: medal.progress,
      maxProgress: medal.maxProgress
    }))
  ];

  // Helper function to render consistent icons
  const renderAchievementIcon = (iconData: any) => {
    // If it's already a React element (icon), return it
    if (React.isValidElement(iconData)) {
      return iconData;
    }
    
    // If it's text, convert to a proper icon based on the text
    if (typeof iconData === 'string') {
      const iconMap: { [key: string]: string } = {
        'target': 'target',
        'crown': 'crown',
        'check': 'check',
        'zap': 'zap',
        'message': 'message-circle',
        'calendar': 'calendar'
      };
      
      const iconName = iconMap[iconData] || 'star';
      return <Icon name={iconName as any} size={16} className="text-gray-600" />;
    }
    
    // Default fallback icon
    return <Icon name="star" size={16} className="text-gray-600" />;
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
          <Typography variant="headline-md" className="text-gray-900 dark:text-white">
            Trophy Shelf
          </Typography>
        </div>
        <div className="flex-1 flex justify-center">
          <Typography variant="body-sm" className="font-semibold text-gray-900 dark:text-white">
            BoxCall Achievements
          </Typography>
        </div>
        <div className="text-right">
          <Typography variant="body-lg" className="text-jade-600 dark:text-jade-400 font-bold">
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
            <Typography variant="body-sm" className="font-bold text-orange-500 text-center">{weeklyStreak}</Typography>
            <Typography variant="caption" color="muted" className="text-xs text-center">Streak</Typography>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="star" size={14} className="text-jade-600" />
            </div>
            <Typography variant="body-sm" className="font-bold text-jade-600 text-center">{helmetStickers.length}</Typography>
            <Typography variant="caption" color="muted" className="text-xs text-center">Stickers</Typography>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="medal" size={14} className="text-blue-600" />
            </div>
            <Typography variant="body-sm" className="font-bold text-blue-600 text-center">{boxcallMedals.filter(m => m.earned).length}</Typography>
            <Typography variant="caption" color="muted" className="text-xs text-center">Medals</Typography>
          </div>
          <div className="text-center p-2 bg-white/50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Icon name="target" size={14} className="text-purple-600" />
            </div>
            <Typography variant="body-sm" className="font-bold text-purple-600 text-center">{boxcallMedals.length}</Typography>
            <Typography variant="caption" color="muted" className="text-xs text-center">Total</Typography>
          </div>
        </div>

        {/* Right: Scrollable Achievements Section */}
        <div className="flex-1">
          {/* Container matching the height of the 4 stat boxes */}
          <div className="flex flex-col gap-2" style={{ height: '176px' }}>
            {/* Achievement List - Scrollable within the constrained container */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-jade-300 scrollbar-track-transparent pr-1">
              {allAchievements.map((achievement) => (
                <div
                  key={`${achievement.type}-${achievement.id}`}
                  className="flex items-center space-x-3 py-2 px-3 h-10 mb-1 bg-white/60 dark:bg-gray-700/40 rounded-lg border border-white/40 dark:border-gray-600/30"
                >
                  <div className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${achievement.earned ? "" : "grayscale opacity-50"}`}>
                    {renderAchievementIcon(achievement.icon)}
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
                    <div className="w-1.5 h-1.5 bg-jade-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
