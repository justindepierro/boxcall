/**
 * FastAnalyticsDashboard Component
 *
 * A+ Grade Analytics Dashboard
 * Uses denormalized play_executions for instant insights without JOINs
 *
 * Features:
 * - Play family success rates
 * - Situational performance (down & distance)
 * - Personnel tendencies
 * - Auto-generated insights
 */

import React from "react";
import { Typography } from "../design-system/Typography";
import { Icon, type IconName } from "../ui/Icon";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import {
  useFastAnalytics,
  getTopPlayFamilies,
  getStrugglingStituations,
  getPersonnelTendencies,
  formatDownDistanceBucket,
  formatFieldZone,
} from "../../hooks/useFastAnalytics";

interface FastAnalyticsDashboardProps {
  teamId: string;
  className?: string;
}

export const FastAnalyticsDashboard: React.FC<FastAnalyticsDashboardProps> = ({
  teamId,
  className = "",
}) => {
  const {
    playFamilyStats,
    situationalStats,
    personnelStats,
    tendencyReport,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useFastAnalytics(teamId);

  // Derived data
  const topFamilies = getTopPlayFamilies(playFamilyStats);
  const strugglingSituations = getStrugglingStituations(situationalStats);
  const personnelTendencies = getPersonnelTendencies(personnelStats);
  const insights = tendencyReport?.insights || [];

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-2xl ${className}`}>
        <div className="text-center">
          <Icon
            name="refresh-cw"
            className="h-8 w-8 animate-spin text-jade-600 mx-auto mb-md"
          />
          <Typography variant="body-lg">Loading A+ Analytics...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-2xl text-center ${className}`}>
        <Icon
          name="alert-triangle"
          className="h-12 w-12 text-error mx-auto mb-md"
        />
        <Typography variant="headline-sm" className="text-error mb-xs">
          Analytics Error
        </Typography>
        <Typography variant="body-sm" className="text-secondary mb-md">
          {error}
        </Typography>
        <button onClick={refresh} className="btn-secondary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography
            variant="headline-md"
            className="flex items-center gap-sm"
          >
            <Icon name="zap" className="h-6 w-6 text-jade-600" />
            Fast Analytics
            <Badge variant="success" size="sm">
              A+ Grade
            </Badge>
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            Instant insights from denormalized execution data
          </Typography>
        </div>
        {lastUpdated && (
          <Typography variant="body-xs" className="text-muted">
            Updated {lastUpdated.toLocaleTimeString()}
          </Typography>
        )}
      </div>

      {/* Auto-Generated Insights */}
      {insights.length > 0 && (
        <Card className="p-lg bg-surface-success-hover border-success">
          <Typography
            variant="headline-sm"
            className="mb-md flex items-center gap-sm"
          >
            <Icon name="lightbulb" className="h-5 w-5 text-success" />
            AI-Generated Insights
          </Typography>
          <div className="space-y-sm">
            {insights.slice(0, 5).map((insight, idx) => (
              <div key={idx} className="flex items-start gap-sm">
                <InsightIcon type={insight.type} />
                <div>
                  <Typography variant="body-sm" className="font-medium">
                    {insight.message}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {insight.context}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Top Play Families */}
        <Card className="p-lg">
          <Typography
            variant="headline-sm"
            className="mb-md flex items-center gap-sm"
          >
            <Icon name="grid" className="h-5 w-5 text-jade-600" />
            Top Play Families
          </Typography>
          {topFamilies.length === 0 ? (
            <EmptyState message="No play family data yet. Execute plays to see analytics." />
          ) : (
            <div className="space-y-sm">
              {topFamilies.map((family) => (
                <PlayFamilyRow key={family.playFamily} family={family} />
              ))}
            </div>
          )}
        </Card>

        {/* Personnel Tendencies */}
        <Card className="p-lg">
          <Typography
            variant="headline-sm"
            className="mb-md flex items-center gap-sm"
          >
            <Icon name="users" className="h-5 w-5 text-jade-600" />
            Personnel Tendencies
          </Typography>
          {personnelStats.length === 0 ? (
            <EmptyState message="No personnel data yet. Tag plays with personnel groupings." />
          ) : (
            <div className="space-y-md">
              {personnelTendencies.mostUsed && (
                <div className="flex items-center justify-between p-sm bg-secondary rounded-lg">
                  <div>
                    <Typography
                      variant="body-xs"
                      className="text-muted uppercase"
                    >
                      Most Used
                    </Typography>
                    <Typography variant="body-md" className="font-semibold">
                      {personnelTendencies.mostUsed.personnel} Personnel
                    </Typography>
                  </div>
                  <Badge variant="info">
                    {personnelTendencies.mostUsed.totalCalls} calls
                  </Badge>
                </div>
              )}
              {personnelTendencies.bestPerforming && (
                <div className="flex items-center justify-between p-sm bg-secondary rounded-lg">
                  <div>
                    <Typography
                      variant="body-xs"
                      className="text-muted uppercase"
                    >
                      Best Performing
                    </Typography>
                    <Typography variant="body-md" className="font-semibold">
                      {personnelTendencies.bestPerforming.personnel} Personnel
                    </Typography>
                  </div>
                  <Badge variant="success">
                    {personnelTendencies.bestPerforming.successRate.toFixed(1)}%
                  </Badge>
                </div>
              )}
              {personnelTendencies.runHeavy.length > 0 && (
                <div>
                  <Typography variant="body-xs" className="text-muted mb-xs">
                    Run Heavy ({">"}60%)
                  </Typography>
                  <div className="flex flex-wrap gap-xs">
                    {personnelTendencies.runHeavy.map((p) => (
                      <Badge key={p.personnel} variant="neutral">
                        {p.personnel} ({p.runPercentage.toFixed(0)}% run)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Situational Performance */}
        <Card className="p-lg">
          <Typography
            variant="headline-sm"
            className="mb-md flex items-center gap-sm"
          >
            <Icon name="target" className="h-5 w-5 text-jade-600" />
            Situational Performance
          </Typography>
          {situationalStats.length === 0 ? (
            <EmptyState message="No situational data yet. Log executions with down & distance." />
          ) : (
            <div className="space-y-sm">
              {situationalStats
                .filter((s) => s.totalCalls >= 5)
                .sort((a, b) => b.successRate - a.successRate)
                .slice(0, 8)
                .map((situation, idx) => (
                  <SituationRow key={idx} situation={situation} />
                ))}
            </div>
          )}
        </Card>

        {/* Areas to Improve */}
        <Card className="p-lg">
          <Typography
            variant="headline-sm"
            className="mb-md flex items-center gap-sm"
          >
            <Icon name="alert-triangle" className="h-5 w-5 text-warning" />
            Areas to Improve
          </Typography>
          {strugglingSituations.length === 0 ? (
            <div className="text-center py-lg">
              <Icon
                name="check-circle"
                className="h-8 w-8 text-success mx-auto mb-sm"
              />
              <Typography variant="body-sm" className="text-success">
                No struggling situations detected!
              </Typography>
            </div>
          ) : (
            <div className="space-y-sm">
              {strugglingSituations.slice(0, 5).map((situation, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-sm bg-surface-error-hover rounded-lg border border-error"
                >
                  <div>
                    <Typography variant="body-sm" className="font-medium">
                      {formatDownDistanceBucket(situation.downDistanceBucket)}
                    </Typography>
                    <Typography variant="body-xs" className="text-secondary">
                      {formatFieldZone(situation.fieldZone)} •{" "}
                      {situation.playFamily || "Mixed"}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography
                      variant="body-sm"
                      className="font-semibold text-error"
                    >
                      {situation.successRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="body-xs" className="text-muted">
                      {situation.totalCalls} calls
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Helper Components

const PlayFamilyRow: React.FC<{
  family: {
    playFamily: string;
    successRate: number;
    totalCalls: number;
    avgYards: number | null;
  };
}> = ({ family }) => (
  <div className="flex items-center justify-between p-sm bg-secondary rounded-lg">
    <div>
      <Typography variant="body-md" className="font-medium capitalize">
        {family.playFamily.replace(/_/g, " ")}
      </Typography>
      <Typography variant="body-xs" className="text-muted">
        {family.totalCalls} calls • {family.avgYards?.toFixed(1) || "N/A"} YPC
      </Typography>
    </div>
    <SuccessRateBadge rate={family.successRate} />
  </div>
);

const SituationRow: React.FC<{
  situation: {
    downDistanceBucket: string | null;
    fieldZone: string | null;
    successRate: number;
    totalCalls: number;
  };
}> = ({ situation }) => (
  <div className="flex items-center justify-between p-sm bg-secondary rounded-lg">
    <div>
      <Typography variant="body-sm" className="font-medium">
        {formatDownDistanceBucket(situation.downDistanceBucket)}
      </Typography>
      <Typography variant="body-xs" className="text-muted">
        {formatFieldZone(situation.fieldZone)} • {situation.totalCalls} calls
      </Typography>
    </div>
    <SuccessRateBadge rate={situation.successRate} />
  </div>
);

const SuccessRateBadge: React.FC<{ rate: number }> = ({ rate }) => {
  let variant: "success" | "warning" | "danger" = "success";
  if (rate < 40) variant = "danger";
  else if (rate < 55) variant = "warning";

  return <Badge variant={variant}>{rate.toFixed(1)}%</Badge>;
};

const InsightIcon: React.FC<{ type: string }> = ({ type }) => {
  const iconMap: Record<string, { icon: IconName; color: string }> = {
    strength: { icon: "trophy", color: "text-success" },
    weakness: { icon: "alert-triangle", color: "text-error" },
    tendency: { icon: "trending-up", color: "text-info" },
    opportunity: { icon: "lightbulb", color: "text-warning" },
  };

  const config = iconMap[type] || { icon: "info", color: "text-muted" };

  return <Icon name={config.icon} className={`h-5 w-5 ${config.color}`} />;
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-lg">
    <Icon name="inbox" className="h-8 w-8 text-muted mx-auto mb-sm" />
    <Typography variant="body-sm" className="text-secondary">
      {message}
    </Typography>
  </div>
);
