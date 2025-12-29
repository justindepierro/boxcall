import React from "react";
import { Icon } from "../ui/Icon";

interface PlaybookStats {
  totalPlays: number;
  formationsCount: number;
  passPlays: number;
  runPlays: number;
  rpoPlays: number;
  playActionPlays: number;
}

interface PlaybookStatsDashboardProps {
  stats: PlaybookStats;
  className?: string;
}

/**
 * Clean, compact playbook stats dashboard
 * Shows key metrics in a scannable format
 */
export const PlaybookStatsDashboard: React.FC<PlaybookStatsDashboardProps> = ({
  stats,
  className = "",
}) => {
  const total = stats.totalPlays || 1; // prevent divide by zero

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
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon name="bar-chart" className="h-4 w-4 text-jade-600" />
        <span className="text-sm font-semibold text-primary">Stats</span>
      </div>

      {/* Primary Stats - Clean 2-column grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl text-center">
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
            {stats.totalPlays}
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-500 mt-1 uppercase tracking-wide">
            Plays
          </div>
        </div>
        <div className="p-4 bg-neutral-50 dark:bg-navy-800 border border-neutral-100 dark:border-navy-700 rounded-xl text-center">
          <div className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            {stats.formationsCount}
          </div>
          <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wide">
            Formations
          </div>
        </div>
      </div>

      {/* Play Type Distribution */}
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
                className={`${d.color} transition-all`}
                style={{ width: `${(d.count / total) * 100}%` }}
                title={`${d.label}: ${d.count}`}
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
  );
};
