import React from "react";
import { BottomSheet } from "../../BottomSheet";
import { Icon } from "../../ui/Icon";

export interface PlaybookStats {
  totalPlays: number;
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
 * Clean, compact mobile stats bottom sheet
 * Matches the simplified desktop PlaybookStatsDashboard
 */
export const MobileStatsBottomSheet: React.FC<MobileStatsBottomSheetProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const total = stats.totalPlays || 1;

  // All play types - always show in legend
  const allTypes = [
    { label: "Pass", count: stats.passPlays, color: "bg-violet-500" },
    { label: "Run", count: stats.runPlays, color: "bg-emerald-500" },
    { label: "RPO", count: stats.rpoPlays, color: "bg-orange-500" },
    { label: "PA", count: stats.playActionPlays, color: "bg-sky-500" },
  ];

  // Only show non-zero in the bar chart
  const barTypes = allTypes.filter((d) => d.count > 0);

  return (
    <BottomSheet snapPoints={[0.35, 0.6]} initialSnapPoint={0} zIndex={50}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="bar-chart" className="h-4 w-4 text-jade-600" />
            <span className="text-sm font-semibold text-primary">
              Playbook Stats
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center hover:bg-tertiary rounded-full transition-colors"
            aria-label="Close stats"
          >
            <Icon name="close" size="sm" className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-jade-50 rounded-xl text-center">
            <div className="text-3xl font-bold text-jade-700">
              {stats.totalPlays}
            </div>
            <div className="text-xs font-medium text-jade-600 mt-1">Plays</div>
          </div>
          <div className="p-4 bg-neutral-100 rounded-xl text-center">
            <div className="text-3xl font-bold text-neutral-700">
              {stats.formationsCount}
            </div>
            <div className="text-xs font-medium text-neutral-600 mt-1">
              Formations
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-secondary uppercase tracking-wide">
            Distribution
          </span>

          {/* Stacked bar - only show types with plays */}
          {barTypes.length > 0 && (
            <div className="flex h-3 rounded-full overflow-hidden bg-neutral-200">
              {barTypes.map((d) => (
                <div
                  key={d.label}
                  className={`${d.color}`}
                  style={{ width: `${(d.count / total) * 100}%` }}
                />
              ))}
            </div>
          )}

          {/* Legend - always show all 4 types */}
          <div className="flex flex-wrap gap-3">
            {allTypes.map((d) => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${d.color} ${d.count === 0 ? "opacity-30" : ""}`}
                />
                <span
                  className={`text-xs ${d.count === 0 ? "text-muted" : "text-secondary"}`}
                >
                  {d.label}{" "}
                  <span
                    className={`font-semibold ${d.count === 0 ? "text-muted" : "text-primary"}`}
                  >
                    {d.count}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
