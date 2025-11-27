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
    <div className={`overflow-visible ${className}`}>
      <div className="flex items-center mb-6">
        <Icon name="bar-chart" className="h-5 w-5 text-jade-600 mr-2" />
        <Typography variant="headline-sm" className="text-primary">
          Playbook Overview
        </Typography>
      </div>

      <div className="space-y-6">
        {/* Main Stats - Enhanced with gradients */}
        <div className="grid grid-cols-2 gap-5">
          {/* Total Plays - Jade gradient (primary brand) */}
          <div className="text-center p-5 bg-gradient-to-br from-jade-50 to-jade-100 rounded-xl border-l-4 border-jade-600 transition-all duration-300 hover:shadow-lg hover:shadow-jade-500/20">
            <div className="text-4xl font-bold text-jade-800">
              {stats.totalPlays}
            </div>
            <div className="text-xs font-semibold text-jade-600 mt-2 uppercase tracking-wide">
              Total Plays
            </div>
          </div>
          {/* Formations - Purple gradient (advanced/special) */}
          <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <div className="text-4xl font-bold text-purple-800">
              {stats.formationsCount}
            </div>
            <div className="text-xs font-semibold text-purple-600 mt-2 uppercase tracking-wide">
              Formations
            </div>
          </div>
        </div>

        {/* Diagram Coverage - Enhanced with emerald theme */}
        <div className="p-5 bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 rounded-xl border border-emerald-300/50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
              Diagram Coverage
            </span>
            <span className="text-xl font-bold text-emerald-800">
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
            className="text-primary mb-4 font-semibold uppercase tracking-wide"
          >
            Play Distribution
          </Typography>
          <div className="space-y-3">
            {/* Pass Plays - Blue gradient */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border-l-4 border-blue-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-800">
                  Pass Plays
                </span>
              </div>
              <span className="text-sm font-bold text-blue-800">
                {stats.passPlays}{" "}
                <span className="text-blue-600">({passPercentage}%)</span>
              </span>
            </div>
            {/* Run Plays - Emerald gradient */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border-l-4 border-emerald-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <span className="text-sm font-semibold text-emerald-800">
                  Run Plays
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800">
                {stats.runPlays}{" "}
                <span className="text-emerald-600">({runPercentage}%)</span>
              </span>
            </div>
            {/* RPO Plays - Navy gradient */}
            {stats.rpoPlays > 0 && (
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-navy-50 to-navy-100/50 rounded-xl border-l-4 border-navy-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-navy-600 rounded-full"></div>
                  <span className="text-sm font-semibold text-navy-800">
                    RPO Plays
                  </span>
                </div>
                <span className="text-sm font-bold text-navy-800">
                  {stats.rpoPlays}
                </span>
              </div>
            )}
            {/* Play Action - Amber gradient */}
            {stats.playActionPlays > 0 && (
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border-l-4 border-amber-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm font-semibold text-amber-800">
                    Play Action
                  </span>
                </div>
                <span className="text-sm font-bold text-amber-800">
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
