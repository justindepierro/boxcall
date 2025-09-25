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
      className={`bg-surface-primary rounded-lg border border-border p-4 ${className}`}
    >
      <div className="flex items-center mb-4">
        <Icon name="bar-chart" className="h-5 w-5 text-jade-600 mr-2" />
        <Typography variant="headline-sm" className="text-text-primary">
          Playbook Overview
        </Typography>
      </div>

      <div className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-surface-success rounded-lg">
            <div className="text-2xl font-bold text-text-success">
              {stats.totalPlays}
            </div>
            <div className="text-xs text-text-success">Total Plays</div>
          </div>
          <div className="text-center p-3 bg-surface-info rounded-lg">
            <div className="text-2xl font-bold text-text-info">
              {stats.formationsCount}
            </div>
            <div className="text-xs text-text-info">Formations</div>
          </div>
        </div>

        {/* Diagram Coverage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-secondary">
              Diagram Coverage
            </span>
            <span className="text-sm font-medium text-text-primary">
              {diagramCoverage}%
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-text-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${diagramCoverage}%` }}
            />
          </div>
        </div>

        {/* Play Type Distribution */}
        <div>
          <Typography variant="body-sm" className="text-text-secondary mb-2">
            Play Distribution
          </Typography>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Pass Plays</span>
              <span className="text-sm font-medium">
                {stats.passPlays} ({passPercentage}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Run Plays</span>
              <span className="text-sm font-medium">
                {stats.runPlays} ({runPercentage}%)
              </span>
            </div>
            {stats.rpoPlays > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">RPO Plays</span>
                <span className="text-sm font-medium">{stats.rpoPlays}</span>
              </div>
            )}
            {stats.playActionPlays > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Play Action</span>
                <span className="text-sm font-medium">
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
