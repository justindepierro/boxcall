import React from "react";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";

interface PlaybookStats {
  totalPlays: number;
  playsWithDiagrams: number;
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
  const diagramCoverage =
    stats.totalPlays > 0
      ? Math.round((stats.playsWithDiagrams / stats.totalPlays) * 100)
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
    <div
      className={`bg-surface-primary rounded-lg p-4 overflow-visible ${className}`}
    >
      <div className="flex items-center mb-4">
        <Icon name="bar-chart" className="h-5 w-5 text-jade-600 mr-2" />
        <Typography variant="headline-sm" className="text-text-primary">
          Playbook Overview
        </Typography>
      </div>

      <div className="space-y-4">
        {/* Main Stats - Enhanced with gradients */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Plays - Jade gradient (primary brand) */}
          <div className="text-center p-4 bg-gradient-to-br from-jade-50 to-jade-100 rounded-lg border-l-4 border-jade-600 transition-all duration-300 hover:shadow-lg hover:shadow-jade-500/10">
            <div className="text-3xl font-bold text-jade-900">
              {stats.totalPlays}
            </div>
            <div className="text-xs font-medium text-jade-700 mt-1">
              Total Plays
            </div>
          </div>
          {/* Formations - Purple gradient (advanced/special) */}
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-l-4 border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="text-3xl font-bold text-purple-900">
              {stats.formationsCount}
            </div>
            <div className="text-xs font-medium text-purple-700 mt-1">
              Formations
            </div>
          </div>
        </div>

        {/* Diagram Coverage - Enhanced with emerald theme */}
        <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-emerald-100/50 rounded-lg border border-emerald-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-emerald-700">
              Diagram Coverage
            </span>
            <span className="text-lg font-bold text-emerald-900">
              {diagramCoverage}%
            </span>
          </div>
          <div className="w-full bg-emerald-200/50 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${diagramCoverage}%` }}
            />
          </div>
        </div>

        {/* Play Type Distribution - Color-coded */}
        <div>
          <Typography
            variant="body-sm"
            className="text-text-secondary mb-3 font-medium"
          >
            Play Distribution
          </Typography>
          <div className="space-y-3">
            {/* Pass Plays - Blue gradient */}
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">
                  Pass Plays
                </span>
              </div>
              <span className="text-sm font-bold text-blue-900">
                {stats.passPlays}{" "}
                <span className="text-blue-700">({passPercentage}%)</span>
              </span>
            </div>
            {/* Run Plays - Emerald gradient */}
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg border-l-4 border-emerald-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-900">
                  Run Plays
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-900">
                {stats.runPlays}{" "}
                <span className="text-emerald-700">({runPercentage}%)</span>
              </span>
            </div>
            {/* RPO Plays - Navy gradient */}
            {stats.rpoPlays > 0 && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-navy-50 to-navy-100/50 rounded-lg border-l-4 border-navy-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                  <span className="text-sm font-medium text-navy-900">
                    RPO Plays
                  </span>
                </div>
                <span className="text-sm font-bold text-navy-900">
                  {stats.rpoPlays}
                </span>
              </div>
            )}
            {/* Play Action - Amber gradient */}
            {stats.playActionPlays > 0 && (
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg border-l-4 border-warning-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                  <span className="text-sm font-medium text-primary">
                    Play Action
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {stats.playActionPlays}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div>
            <Typography variant="body-sm" className="text-text-secondary mb-2">
              Recent Activity
            </Typography>
            <div className="space-y-2">
              {stats.recentActivity.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center text-xs text-text-secondary"
                >
                  <Icon
                    name={
                      activity.type === "created"
                        ? "plus"
                        : activity.type === "updated"
                          ? "edit"
                          : "copy"
                    }
                    className="h-3 w-3 mr-2 text-text-muted"
                  />
                  <span className="truncate">{activity.playName}</span>
                  <span className="ml-auto text-text-muted">
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
