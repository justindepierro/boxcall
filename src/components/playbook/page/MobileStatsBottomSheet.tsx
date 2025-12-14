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
  formationsNeedingMapping?: number;
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

// Extracted stat card components
const TotalPlaysCard: React.FC<{
  totalPlays: number;
  playsWithDiagrams: number;
}> = ({ totalPlays, playsWithDiagrams }) => (
  <div className="bg-gradient-to-br from-brand-jade/10 to-brand-jade/5 rounded-lg p-4 border border-brand-jade/20">
    <div className="flex items-center justify-between">
      <div>
        <Typography
          variant="body-sm"
          className="text-secondary font-medium mb-1"
        >
          Total Plays
        </Typography>
        <Typography variant="display-md" className="text-primary font-bold">
          {totalPlays}
        </Typography>
        <Typography variant="body-xs" className="text-secondary mt-1">
          {playsWithDiagrams} with diagrams
        </Typography>
      </div>
      <div className="h-12 w-12 rounded-full bg-brand-jade/20 flex items-center justify-center">
        <Icon name="grid" size="md" className="h-6 w-6 text-brand-jade" />
      </div>
    </div>
  </div>
);

const DiagramCoverageCard: React.FC<{ percentage: number }> = ({
  percentage,
}) => (
  <div className="bg-secondary rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <Typography variant="body-sm" className="text-secondary font-medium">
        Diagram Coverage
      </Typography>
      <Typography variant="body-sm" className="text-brand-jade font-semibold">
        {percentage}%
      </Typography>
    </div>
    <div className="w-full bg-tertiary rounded-full h-2 overflow-hidden">
      <div
        className="bg-brand-jade h-full rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const FormationMapperCard: React.FC<{ needsMapping: number }> = ({
  needsMapping,
}) => (
  <div className="bg-secondary rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <Typography variant="body-sm" className="text-secondary font-medium">
          Formation Mapper
        </Typography>
        <Typography variant="headline-md" className="text-primary font-bold">
          {needsMapping}
        </Typography>
        <Typography variant="body-xs" className="text-secondary mt-1">
          {needsMapping === 0 ? "All plays mapped" : "need mapping"}
        </Typography>
      </div>
      <div className="h-12 w-12 rounded-full bg-warning-500/20 flex items-center justify-center">
        <Icon name="link" size="md" className="h-6 w-6 text-warning-500" />
      </div>
    </div>
  </div>
);

const PlayTypeCard: React.FC<{
  icon: string;
  label: string;
  count: number;
  iconColor: string;
}> = ({ icon, label, count, iconColor }) => (
  <div className="bg-secondary rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      <Icon name={icon} size="sm" className={`h-4 w-4 ${iconColor}`} />
      <Typography variant="body-xs" className="text-secondary font-medium">
        {label}
      </Typography>
    </div>
    <Typography variant="headline-md" className="text-primary font-bold">
      {count}
    </Typography>
  </div>
);

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
              className="text-primary font-semibold"
            >
              Playbook Stats
            </Typography>
            <Typography variant="body-xs" className="text-secondary">
              Your playbook overview
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center hover:bg-tertiary rounded-full transition-colors"
            aria-label="Close stats"
          >
            <Icon name="close" size="sm" className="h-4 w-4" />
          </button>
        </div>

        {/* Total Plays Card */}
        <TotalPlaysCard
          totalPlays={stats.totalPlays}
          playsWithDiagrams={stats.playsWithDiagrams}
        />

        {/* Diagram Coverage */}
        <DiagramCoverageCard percentage={diagramPercentage} />

        {typeof stats.formationsNeedingMapping === "number" && (
          <FormationMapperCard needsMapping={stats.formationsNeedingMapping} />
        )}

        {/* Play Type Distribution */}
        <div className="space-y-3">
          <Typography variant="body-sm" className="text-secondary font-medium">
            Play Types
          </Typography>

          <div className="grid grid-cols-2 gap-3">
            <PlayTypeCard
              icon="arrow-right"
              label="Pass"
              count={stats.passPlays}
              iconColor="text-blue-500"
            />
            <PlayTypeCard
              icon="arrow-up"
              label="Run"
              count={stats.runPlays}
              iconColor="text-success-500"
            />
            <PlayTypeCard
              icon="arrow-up-right"
              label="RPO"
              count={stats.rpoPlays}
              iconColor="text-warning-500"
            />
            <PlayTypeCard
              icon="arrow-down"
              label="Play Action"
              count={stats.playActionPlays}
              iconColor="text-purple-500"
            />
          </div>
        </div>

        {/* Formations */}
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="grid" size="sm" className="h-5 w-5 text-secondary" />
              <Typography
                variant="body-sm"
                className="text-secondary font-medium"
              >
                Formations
              </Typography>
            </div>
            <Typography
              variant="headline-sm"
              className="text-primary font-bold"
            >
              {stats.formationsCount}
            </Typography>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
