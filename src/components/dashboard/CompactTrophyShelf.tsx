import React, { useState } from "react";
import { useAchievements } from "../../hooks/useAchievements";
import { Typography } from "../design-system";
import { Modal } from "../ui";
import { ModularIcon as Icon } from "../ui/Icon";

interface CompactTrophyShelfProps {
  userId: string;
  userRole?: string;
}

/**
 * Compact Trophy Shelf - Horizontal Header Display
 *
 * A condensed version of the trophy shelf designed for dashboard header integration.
 * Features:
 * - Horizontal layout with key stats
 * - Quick achievement preview
 * - Modal popup for full trophy details
 * - Minimal footprint for header placement
 */
export const CompactTrophyShelf: React.FC<CompactTrophyShelfProps> = ({
  userId,
}) => {
  const [showModal, setShowModal] = useState(false);
  const { achievements, loading, error } = useAchievements(userId);

  // Extract properties from achievements with defaults
  const helmetStickers = achievements?.helmetStickers || [];
  const boxcallMedals = achievements?.boxcallMedals || [];
  const weeklyStreak = achievements?.weeklyStreak || 0;
  const totalPoints = achievements?.totalPoints || 0;
  const earnedMedals = boxcallMedals.filter((m) => m.earned).length;

  // Recent achievements for quick preview (max 3)
  const recentAchievements = [
    ...helmetStickers.slice(-2).map((sticker) => ({
      id: sticker.id,
      type: "sticker" as const,
      icon: "star" as const,
      name: sticker.name,
      earned: true,
    })),
    ...boxcallMedals
      .filter((m) => m.earned)
      .slice(-1)
      .map((medal) => ({
        id: medal.id,
        type: "medal" as const,
        icon: "award" as const,
        name: medal.name,
        earned: true,
      })),
  ].slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
        <div className="w-4 h-4 bg-muted rounded-lg animate-pulse"></div>
        <div className="w-12 h-3 bg-muted rounded-lg animate-pulse"></div>
        <div className="w-8 h-3 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-error">
        <Icon name="trophy" size="sm" />
        <Typography variant="caption">Error loading achievements</Typography>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Compact Display */}
      <div
        className="flex items-center gap-4 bg-aurora-emerald rounded-aurora border trophy-card px-5 py-3 transition-all duration-300 group cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Trophy Icon with Animation */}
        <div className="relative">
          <Icon
            name="trophy"
            size="md"
            className="trophy-icon transition-colors duration-300"
          />
          {totalPoints > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Stats with Labels */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Icon name="zap" size="sm" className="text-warning-500" />
              <span className="text-lg font-bold text-warning-600 dark:text-warning-500">
                {weeklyStreak}
              </span>
            </div>
            <Typography
              variant="caption"
              className="text-warning-600/70 dark:text-warning-400/70 text-xs font-medium"
            >
              Week Streak
            </Typography>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Icon name="star" size="sm" className="trophy-stat-primary" />
              <span className="text-lg font-bold trophy-stat-primary">
                {helmetStickers.length}
              </span>
            </div>
            <Typography
              variant="caption"
              className="trophy-stat-muted text-xs font-medium"
            >
              Stickers
            </Typography>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Icon name="award" size="sm" className="trophy-stat-secondary" />
              <span className="text-lg font-bold trophy-stat-secondary">
                {earnedMedals}
              </span>
            </div>
            <Typography
              variant="caption"
              className="trophy-stat-muted text-xs font-medium"
            >
              Medals
            </Typography>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 mb-1">
              <Icon name="target" size="sm" className="text-purple-600" />
              <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {totalPoints}
              </span>
            </div>
            <Typography
              variant="caption"
              className="text-purple-700/70 dark:text-purple-300/70 text-xs font-medium"
            >
              Points
            </Typography>
          </div>
        </div>

        {/* Recent Achievement Icons with Animation */}
        {recentAchievements.length > 0 && (
          <>
            <div className="w-px h-8 bg-gradient-to-b from-border to-border-muted"></div>
            <div className="flex flex-col items-center gap-2">
              <Typography
                variant="caption"
                className="trophy-stat-muted text-xs font-medium"
              >
                Recent
              </Typography>
              <div className="flex items-center -space-x-2">
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={`${achievement.type}-${achievement.id}`}
                    className="w-7 h-7 trophy-badge-item rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{ zIndex: recentAchievements.length - index }}
                  >
                    <Icon
                      name={achievement.icon}
                      size="sm"
                      className="trophy-icon"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Expand Indicator */}
        <div className="flex flex-col items-center gap-1 ml-2">
          <Icon
            name="chevron-right"
            size="sm"
            className="trophy-icon opacity-60 transition-transform duration-300 group-hover:translate-x-1"
          />
          <Typography
            variant="caption"
            className="trophy-stat-muted text-xs opacity-50"
          >
            View All
          </Typography>
        </div>
      </div>

      {/* Full Achievement Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Achievement Trophy Shelf"
        size="lg"
      >
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/30 rounded-lg">
              <Icon
                name="zap"
                size="md"
                className="text-warning-500 mx-auto mb-2"
              />
              <Typography
                variant="headline-sm"
                className="font-bold text-warning-600 dark:text-warning-500"
              >
                {weeklyStreak}
              </Typography>
              <Typography
                variant="caption"
                className="text-warning-600 dark:text-warning-400"
              >
                Week Streak
              </Typography>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-bg-muted to-bg-primary rounded-lg">
              <Icon
                name="star"
                size="md"
                className="trophy-stat-primary mx-auto mb-2"
              />
              <Typography
                variant="headline-sm"
                className="font-bold trophy-stat-primary"
              >
                {helmetStickers.length}
              </Typography>
              <Typography variant="caption" className="trophy-stat-primary">
                Helmet Stickers
              </Typography>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-bg-muted to-bg-primary rounded-lg">
              <Icon
                name="award"
                size="md"
                className="trophy-stat-secondary mx-auto mb-2"
              />
              <Typography
                variant="headline-sm"
                className="font-bold trophy-stat-secondary"
              >
                {earnedMedals}
              </Typography>
              <Typography variant="caption" className="trophy-stat-secondary">
                Medals Earned
              </Typography>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-lg">
              <Icon
                name="target"
                size="md"
                className="text-purple-600 mx-auto mb-2"
              />
              <Typography
                variant="headline-sm"
                className="font-bold text-purple-700 dark:text-purple-300"
              >
                {totalPoints}
              </Typography>
              <Typography
                variant="caption"
                className="text-purple-700 dark:text-purple-300"
              >
                Total Points
              </Typography>
            </div>
          </div>

          {/* Achievement Categories */}
          <div className="space-y-4">
            {/* Helmet Stickers */}
            {helmetStickers.length > 0 && (
              <div>
                <Typography
                  variant="headline-sm"
                  className="mb-3 flex items-center gap-2"
                >
                  <Icon name="star" size="sm" className="trophy-stat-primary" />
                  Helmet Stickers
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {helmetStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="flex items-center gap-3 p-3 bg-secondary rounded-lg"
                    >
                      <Icon
                        name="star"
                        size="sm"
                        className="trophy-stat-primary"
                      />
                      <div>
                        <Typography variant="body-sm" className="font-semibold">
                          {sticker.name}
                        </Typography>
                        <Typography variant="caption" className="text-muted">
                          Awarded by {sticker.awardedByName}
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BoxCall Medals */}
            {boxcallMedals.length > 0 && (
              <div>
                <Typography
                  variant="headline-sm"
                  className="mb-3 flex items-center gap-2"
                >
                  <Icon
                    name="award"
                    size="sm"
                    className="trophy-stat-secondary"
                  />
                  BoxCall Medals
                </Typography>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {boxcallMedals.map((medal) => (
                    <div
                      key={medal.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        medal.earned ? "bg-secondary" : "bg-muted opacity-60"
                      }`}
                    >
                      <Icon
                        name="award"
                        size="sm"
                        className={
                          medal.earned ? "trophy-stat-secondary" : "text-muted"
                        }
                      />
                      <div className="flex-1">
                        <Typography
                          variant="body-sm"
                          className={`font-semibold ${medal.earned ? "" : "text-muted"}`}
                        >
                          {medal.name}
                        </Typography>
                        <Typography variant="caption" className="text-muted">
                          {medal.description}
                        </Typography>
                        {!medal.earned &&
                          medal.progress !== undefined &&
                          medal.maxProgress && (
                            <div className="mt-1">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${(medal.progress / medal.maxProgress) * 100}%`,
                                    backgroundColor:
                                      "var(--component-badge-info-bg)",
                                  }}
                                ></div>
                              </div>
                              <Typography
                                variant="caption"
                                className="text-muted"
                              >
                                {medal.progress}/{medal.maxProgress}
                              </Typography>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {helmetStickers.length === 0 && boxcallMedals.length === 0 && (
              <div className="text-center py-8">
                <Icon
                  name="trophy"
                  size="lg"
                  className="trophy-icon mx-auto mb-4 opacity-60"
                />
                <Typography
                  variant="headline-sm"
                  className="trophy-stat-primary mb-2"
                >
                  Ready to Fill Your Trophy Shelf?
                </Typography>
                <Typography
                  variant="body-sm"
                  className="text-muted content-narrow"
                >
                  Start earning achievements by completing tasks, connecting
                  with your team, and reaching your goals. Your coach can award
                  helmet stickers for great performance!
                </Typography>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
