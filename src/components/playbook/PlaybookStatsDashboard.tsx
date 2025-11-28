import React from "react";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";

interface PlaybookStats {
  totalPlays: number;
  playsWithPhotos?: number;
  formationsCount: number;
  passPlays: number;
  runPlays: number;
  rpoPlays: number;
  playActionPlays: number;
  recentActivity: Array<{
    id: string;
    type:
      | "created"
      | "updated"
      | "duplicated"
      | "added_to_script"
      | "added_to_gameplan";
    playName: string;
    timestamp: Date;
    details?: string;
  }>;
}

interface PlaybookStatsDashboardProps {
  stats: PlaybookStats;
  className?: string;
}

export const PlaybookStatsDashboard: React.FC<PlaybookStatsDashboardProps> = ({
  stats,
  className = "",
}) => {
  const photoCoverage =
    stats.totalPlays > 0
      ? Math.round(((stats.playsWithPhotos || 0) / stats.totalPlays) * 100)
      : 0;

  const passPercentage =
    stats.totalPlays > 0
      ? Math.round((stats.passPlays / stats.totalPlays) * 100)
      : 0;

  const runPercentage =
    stats.totalPlays > 0
      ? Math.round((stats.runPlays / stats.totalPlays) * 100)
      : 0;

  return (
    <div className={`overflow-visible ${className}`}>
      <div className="flex items-center mb-6">
        <Icon name="bar-chart" className="h-5 w-5 text-jade-600 mr-2" />
        <Typography variant="headline-sm" className="text-primary">
          Playbook Overview
        </Typography>
      </div>

      <div className="space-y-5">
        {/* Main Stats - Enhanced with gradients */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Plays - Jade gradient (primary brand) */}
          <div className="text-center p-6 bg-gradient-to-br from-jade-50 to-jade-100 rounded-xl border-l-4 border-jade-600 transition-all duration-300 hover:shadow-md hover:shadow-jade-500/20 hover:scale-[1.02]">
            <div className="text-5xl font-bold text-jade-700">
              {stats.totalPlays}
            </div>
            <div className="text-xs font-semibold text-jade-600 mt-2.5 uppercase tracking-wider">
              Total Plays
            </div>
          </div>
          {/* Formations - Purple gradient (advanced/special) */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-600 transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20 hover:scale-[1.02]">
            <div className="text-5xl font-bold text-purple-700">
              {stats.formationsCount}
            </div>
            <div className="text-xs font-semibold text-purple-600 mt-2.5 uppercase tracking-wider">
              Formations
            </div>
          </div>
        </div>

        {/* Photo Coverage - Enhanced with rose theme */}
        <div className="p-5 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border-l-4 border-rose-500 transition-all duration-300 hover:shadow-md hover:shadow-rose-500/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-rose-700 uppercase tracking-wider">
              Plays with Photos
            </span>
            <span className="text-2xl font-bold text-rose-700">
              {stats.playsWithPhotos || 0}
            </span>
          </div>
          <div className="w-full bg-rose-200/60 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-rose-500 to-rose-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${photoCoverage}%` }}
            />
          </div>
          <Typography
            variant="body-xs"
            className="text-rose-600 mt-2.5 font-semibold"
          >
            {photoCoverage}% coverage
          </Typography>
        </div>

        {/* Play Type Distribution - Color-coded */}
        <div>
          <Typography
            variant="body-sm"
            className="text-primary mb-4 font-semibold uppercase tracking-wider"
          >
            Play Distribution
          </Typography>
          <div className="space-y-2.5">
            {/* Pass Plays - Cyan gradient */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-l-4 border-cyan-600 transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-cyan-600 rounded-full shadow-sm"></div>
                <span className="text-sm font-semibold text-cyan-800">
                  Pass Plays
                </span>
              </div>
              <span className="text-sm font-bold text-cyan-700">
                {stats.passPlays}{" "}
                <span className="text-cyan-600">({passPercentage}%)</span>
              </span>
            </div>
            {/* Run Plays - Emerald gradient */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border-l-4 border-emerald-600 transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full shadow-sm"></div>
                <span className="text-sm font-semibold text-emerald-800">
                  Run Plays
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-700">
                {stats.runPlays}{" "}
                <span className="text-emerald-600">({runPercentage}%)</span>
              </span>
            </div>
            {/* RPO Plays - Amber gradient */}
            {stats.rpoPlays > 0 && (
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-warning-bg to-warning-bg/80 rounded-xl border-l-4 border-warning-600 transition-all duration-200 hover:shadow-md hover:shadow-warning-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-warning-600 rounded-full shadow-sm"></div>
                  <span className="text-sm font-semibold text-warning-700">
                    RPO Plays
                  </span>
                </div>
                <span className="text-sm font-bold text-warning-600">
                  {stats.rpoPlays}
                </span>
              </div>
            )}
            {/* Play Action - Orange gradient */}
            {stats.playActionPlays > 0 && (
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-l-4 border-orange-600 transition-all duration-200 hover:shadow-md hover:shadow-orange-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-orange-600 rounded-full shadow-sm"></div>
                  <span className="text-sm font-semibold text-orange-800">
                    Play Action
                  </span>
                </div>
                <span className="text-sm font-bold text-orange-700">
                  {stats.playActionPlays}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div>
            <Typography variant="body-sm" className="text-secondary mb-2">
              Recent Activity
            </Typography>
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center text-xs text-secondary"
                >
                  <Icon
                    name={
                      activity.type === "created"
                        ? "plus"
                        : activity.type === "updated"
                          ? "edit"
                          : "copy"
                    }
                    className="h-3 w-3 mr-2 text-muted"
                  />
                  <span className="truncate">{activity.playName}</span>
                  <span className="ml-auto text-muted">
                    {activity.timestamp.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
