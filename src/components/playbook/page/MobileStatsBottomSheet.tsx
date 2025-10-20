import React from "react";
import { BottomSheet } from "../../BottomSheet";
import { Typography } from "../../design-system/Typography";
import { Icon } from "../../ui/Icon";

export interface PlaybookStats {
  totalPlays: number;
  playsWithDiagrams: number;
  formationsCount: number;
  passPlays: number;
  runPlays: number;
  rpoPlays: number;
  playActionPlays: number;
}

export interface MobileStatsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlaybookStats;
}

/**
 * MobileStatsBottomSheet - Swipeable stats dashboard for mobile
 *
 * Features:
 * - Snap points: 40% and 90% for peek and full view
 * - Hero stats card showing key metrics
 * - Play type distribution
 * - Formation count
 * - Diagram coverage
 *
 * @example
 * ```tsx
 * <MobileStatsBottomSheet
 *   isOpen={showStats}
 *   onClose={() => setShowStats(false)}
 *   stats={playbookStats}
 * />
 * ```
 */
export const MobileStatsBottomSheet: React.FC<MobileStatsBottomSheetProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const diagramPercentage =
    stats.totalPlays > 0
      ? Math.round((stats.playsWithDiagrams / stats.totalPlays) * 100)
      : 0;

  return (
    <BottomSheet snapPoints={[0.4, 0.9]} initialSnapPoint={0} zIndex={50}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography
              variant="headline-sm"
              className="text-text-primary font-semibold"
            >
              Playbook Stats
            </Typography>
            <Typography variant="body-xs" className="text-text-secondary">
              Your playbook overview
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center hover:bg-surface-tertiary rounded-full transition-colors"
            aria-label="Close stats"
          >
            <Icon name="close" size="sm" className="h-4 w-4" />
          </button>
        </div>

        {/* Total Plays Card */}
        <div className="bg-gradient-to-br from-brand-jade/10 to-brand-jade/5 rounded-lg p-4 border border-brand-jade/20">
          <div className="flex items-center justify-between">
            <div>
              <Typography
                variant="body-sm"
                className="text-text-secondary font-medium mb-1"
              >
                Total Plays
              </Typography>
              <Typography
                variant="display-md"
                className="text-text-primary font-bold"
              >
                {stats.totalPlays}
              </Typography>
              <Typography
                variant="body-xs"
                className="text-text-secondary mt-1"
              >
                {stats.playsWithDiagrams} with diagrams
              </Typography>
            </div>
            <div className="h-12 w-12 rounded-full bg-brand-jade/20 flex items-center justify-center">
              <Icon name="grid" size="md" className="h-6 w-6 text-brand-jade" />
            </div>
          </div>
        </div>

        {/* Diagram Coverage */}
        <div className="bg-surface-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Typography
              variant="body-sm"
              className="text-text-secondary font-medium"
            >
              Diagram Coverage
            </Typography>
            <Typography
              variant="body-sm"
              className="text-brand-jade font-semibold"
            >
              {diagramPercentage}%
            </Typography>
          </div>
          <div className="w-full bg-surface-tertiary rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-jade h-full rounded-full transition-all duration-300"
              style={{ width: `${diagramPercentage}%` }}
            />
          </div>
        </div>

        {/* Play Type Distribution */}
        <div className="space-y-3">
          <Typography
            variant="body-sm"
            className="text-text-secondary font-medium"
          >
            Play Types
          </Typography>

          <div className="grid grid-cols-2 gap-3">
            {/* Pass Plays */}
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name="arrow-right"
                  size="sm"
                  className="h-4 w-4 text-blue-500"
                />
                <Typography
                  variant="body-xs"
                  className="text-text-secondary font-medium"
                >
                  Pass
                </Typography>
              </div>
              <Typography
                variant="headline-md"
                className="text-text-primary font-bold"
              >
                {stats.passPlays}
              </Typography>
            </div>

            {/* Run Plays */}
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name="arrow-up"
                  size="sm"
                  className="h-4 w-4 text-success-500"
                />
                <Typography
                  variant="body-xs"
                  className="text-text-secondary font-medium"
                >
                  Run
                </Typography>
              </div>
              <Typography
                variant="headline-md"
                className="text-text-primary font-bold"
              >
                {stats.runPlays}
              </Typography>
            </div>

            {/* RPO Plays */}
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name="zap"
                  size="sm"
                  className="h-4 w-4 text-purple-500"
                />
                <Typography
                  variant="body-xs"
                  className="text-text-secondary font-medium"
                >
                  RPO
                </Typography>
              </div>
              <Typography
                variant="headline-md"
                className="text-text-primary font-bold"
              >
                {stats.rpoPlays}
              </Typography>
            </div>

            {/* Play Action */}
            <div className="bg-surface-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  name="activity"
                  size="sm"
                  className="h-4 w-4 text-orange-500"
                />
                <Typography
                  variant="body-xs"
                  className="text-text-secondary font-medium"
                >
                  Play Action
                </Typography>
              </div>
              <Typography
                variant="headline-md"
                className="text-text-primary font-bold"
              >
                {stats.playActionPlays}
              </Typography>
            </div>
          </div>
        </div>

        {/* Formations */}
        <div className="bg-surface-secondary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                name="grid"
                size="sm"
                className="h-5 w-5 text-text-secondary"
              />
              <Typography
                variant="body-sm"
                className="text-text-secondary font-medium"
              >
                Formations
              </Typography>
            </div>
            <Typography
              variant="headline-sm"
              className="text-text-primary font-bold"
            >
              {stats.formationsCount}
            </Typography>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
