import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  PlaybookAnalyticsService,
  type PlaybookAnalyticsSummary,
  type FormationAnalytics,
} from "../../services/playbookAnalyticsService";
import { PlayerPerformanceDashboard } from "./PlayerPerformanceDashboard";
import { GamePlanningDashboard } from "./GamePlanningDashboard";

/**
 * Advanced Analytics Dashboard - Phase 4
 * Comprehensive playbook analytics with performance insights
 */

interface AnalyticsDashboardProps {
  playbookId?: string;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  playbookId,
  className = "",
}) => {
  const [analytics, setAnalytics] = useState<PlaybookAnalyticsSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<
    | "overview"
    | "formations"
    | "situational"
    | "performance"
    | "player-performance"
    | "game-planning"
  >("overview");

  const loadAnalytics = useCallback(async () => {
    if (!playbookId) return;

    try {
      setLoading(true);
      setError(null);
      const data =
        await PlaybookAnalyticsService.getPlaybookAnalytics(playbookId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    if (playbookId) {
      loadAnalytics();
    } else {
      setLoading(false);
    }
  }, [playbookId, loadAnalytics]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Icon
            name="refresh-cw"
            className="h-8 w-8 animate-spin text-jade-600 mx-auto mb-4"
          />
          <Typography variant="body-lg">Loading analytics...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Icon
          name="alert-triangle"
          className="h-12 w-12 text-text-error mx-auto mb-4"
        />
        <Typography variant="headline-sm" className="text-text-error mb-2">
          Analytics Error
        </Typography>
        <Typography variant="body-sm" className="text-text-error mb-4">
          {error}
        </Typography>
        <Button onClick={loadAnalytics} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!analytics || analytics.totalPlays === 0) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <Icon
          name="bar-chart"
          className="h-12 w-12 text-text-muted mx-auto mb-4"
        />
        <Typography variant="headline-sm" className="text-text-secondary mb-2">
          No Analytics Data
        </Typography>
        <Typography variant="body-sm" className="text-text-secondary">
          {playbookId
            ? "No plays found in this playbook yet."
            : "Select a playbook to view analytics."}
        </Typography>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="headline-md" className="flex items-center">
            <Icon name="bar-chart" className="h-6 w-6 text-jade-600 mr-2" />
            Advanced Analytics
          </Typography>
          <Typography variant="body-sm" className="text-text-secondary mt-1">
            Performance insights and strategic analysis
          </Typography>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          {[
            { key: "overview", label: "Overview", icon: "grid" },
            { key: "formations", label: "Formations", icon: "layout" },
            { key: "situational", label: "Situational", icon: "target" },
            { key: "performance", label: "Performance", icon: "trending-up" },
            { key: "player-performance", label: "Players", icon: "users" },
            { key: "game-planning", label: "Game Planning", icon: "file" },
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              variant={selectedView === key ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedView(key as any)}
              className="flex items-center"
            >
              <Icon name={icon as any} className="h-4 w-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === "overview" && <OverviewView analytics={analytics} />}
      {selectedView === "formations" && (
        <FormationsView analytics={analytics} />
      )}
      {selectedView === "situational" && (
        <SituationalView analytics={analytics} />
      )}
      {selectedView === "performance" && (
        <PerformanceView analytics={analytics} />
      )}
      {selectedView === "player-performance" && (
        <PlayerPerformanceDashboard teamId="demo-team-id" />
      )}
      {selectedView === "game-planning" && (
        <GamePlanningDashboard teamId="demo-team-id" />
      )}
    </div>
  );
};

// Overview View Component
const OverviewView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Key Metrics */}
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Total Plays
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.totalPlays}
          </Typography>
        </div>
        <Icon name="file" className="h-8 w-8 text-text-info" />
      </div>
    </Card>

    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Avg Success Rate
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.averageSuccessRate}%
          </Typography>
        </div>
        <Icon name="target" className="h-8 w-8 text-text-success" />
      </div>
    </Card>

    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Avg Complexity
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.averageComplexity}/10
          </Typography>
        </div>
        <Icon name="zap" className="h-8 w-8 text-text-warning" />
      </div>
    </Card>

    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="body-sm" className="text-text-secondary">
            Formations
          </Typography>
          <Typography variant="headline-lg" className="text-text-primary">
            {analytics.formationsCount}
          </Typography>
        </div>
        <Icon name="grid" className="h-8 w-8 text-text-primary" />
      </div>
    </Card>

    {/* Complexity Distribution */}
    <Card className="p-6 md:col-span-2">
      <Typography variant="headline-sm" className="mb-4">
        Complexity Distribution
      </Typography>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Low (1-3)</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-border rounded-full h-2">
              <div
                className="bg-text-success h-2 rounded-full"
                style={{
                  width: `${(analytics.complexityDistribution.low / analytics.totalPlays) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {analytics.complexityDistribution.low}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Medium (4-7)</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-border rounded-full h-2">
              <div
                className="bg-text-warning h-2 rounded-full"
                style={{
                  width: `${(analytics.complexityDistribution.medium / analytics.totalPlays) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {analytics.complexityDistribution.medium}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">High (8-10)</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-border rounded-full h-2">
              <div
                className="bg-text-error h-2 rounded-full"
                style={{
                  width: `${(analytics.complexityDistribution.high / analytics.totalPlays) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium w-8">
              {analytics.complexityDistribution.high}
            </span>
          </div>
        </div>
      </div>
    </Card>

    {/* Top Performing Plays */}
    <Card className="p-6 md:col-span-2">
      <Typography variant="headline-sm" className="mb-4">
        Top Performing Plays
      </Typography>
      <div className="space-y-3">
        {analytics.topPerformingPlays.slice(0, 5).map((play, index) => (
          <div
            key={play.playId}
            className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Badge
                variant={index === 0 ? "success" : "neutral"}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              >
                {index + 1}
              </Badge>
              <div>
                <Typography variant="body-sm" className="font-medium">
                  {play.playName}
                </Typography>
                <Typography variant="body-xs" className="text-text-secondary">
                  {play.formation} • {play.playType}
                </Typography>
              </div>
            </div>
            <div className="text-right">
              <Typography
                variant="body-sm"
                className="font-medium text-text-success"
              >
                {play.successRate}%
              </Typography>
              <Typography variant="body-xs" className="text-text-secondary">
                {play.timesCalled} calls
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// Formations View Component
const FormationsView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="space-y-6">
    <Typography variant="headline-sm">Formation Analysis</Typography>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {analytics.formationAnalytics.map((formation) => (
        <FormationCard key={formation.formation} formation={formation} />
      ))}
    </div>
  </div>
);

// Formation Card Component
const FormationCard: React.FC<{ formation: FormationAnalytics }> = ({
  formation,
}) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-4">
      <Typography variant="headline-sm">{formation.formation}</Typography>
      <Badge
        variant={
          formation.successRate >= 70
            ? "success"
            : formation.successRate >= 50
              ? "warning"
              : "danger"
        }
      >
        {formation.successRate}%
      </Badge>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-sm text-text-secondary">Total Plays</span>
        <span className="font-medium">{formation.totalPlays}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-sm text-text-secondary">Avg Complexity</span>
        <span className="font-medium">{formation.averageComplexity}/10</span>
      </div>
    </div>

    <div className="mt-4">
      <Typography variant="body-xs" className="text-text-secondary mb-2">
        Personnel Usage
      </Typography>
      <div className="flex flex-wrap gap-1">
        {Object.entries(formation.personnelBreakdown).map(
          ([personnel, count]) => (
            <Badge key={personnel} variant="neutral" className="text-xs">
              {personnel}: {count}
            </Badge>
          )
        )}
      </div>
    </div>
  </Card>
);

// Situational View Component
const SituationalView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="space-y-6">
    <Typography variant="headline-sm">Situational Performance</Typography>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* By Down */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          By Down & Distance
        </Typography>
        <div className="space-y-3">
          {Object.entries(analytics.situationalPerformance.byDown).map(
            ([down, stats]) => (
              <div key={down} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">{down}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-text-muted ml-2">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* By Field Position */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          By Field Position
        </Typography>
        <div className="space-y-3">
          {Object.entries(analytics.situationalPerformance.byFieldPosition).map(
            ([position, stats]) => (
              <div key={position} className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">{position}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-text-muted ml-2">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* By Personnel */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          By Personnel
        </Typography>
        <div className="space-y-3">
          {Object.entries(analytics.situationalPerformance.byPersonnel).map(
            ([personnel, stats]) => (
              <div
                key={personnel}
                className="flex justify-between items-center"
              >
                <span className="text-sm text-text-secondary">{personnel}</span>
                <div className="text-right">
                  <span className="font-medium">{stats.rate.toFixed(1)}%</span>
                  <span className="text-xs text-text-muted ml-2">
                    ({stats.called})
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </Card>
    </div>
  </div>
);

// Performance View Component
const PerformanceView: React.FC<{ analytics: PlaybookAnalyticsSummary }> = ({
  analytics,
}) => (
  <div className="space-y-6">
    <Typography variant="headline-sm">Performance Insights</Typography>

    <div className="grid grid-cols-1 gap-6">
      {/* Success Rate Trends */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Success Rate Analysis
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-surface-success rounded-lg">
            <Typography variant="headline-md" className="text-text-success">
              {analytics.topPerformingPlays.length > 0
                ? Math.max(
                    ...analytics.topPerformingPlays.map((p) => p.successRate)
                  ).toFixed(1)
                : 0}
              %
            </Typography>
            <Typography variant="body-xs" className="text-text-success">
              Best Play
            </Typography>
          </div>
          <div className="text-center p-4 bg-surface-info rounded-lg">
            <Typography variant="headline-md" className="text-text-info">
              {analytics.averageSuccessRate.toFixed(1)}%
            </Typography>
            <Typography variant="body-xs" className="text-text-info">
              Average
            </Typography>
          </div>
          <div className="text-center p-4 bg-surface-warning rounded-lg">
            <Typography variant="headline-md" className="text-text-warning">
              {analytics.averageComplexity.toFixed(1)}/10
            </Typography>
            <Typography variant="body-xs" className="text-text-warning">
              Complexity
            </Typography>
          </div>
          <div className="text-center p-4 bg-surface-secondary rounded-lg">
            <Typography variant="headline-md" className="text-text-primary">
              {analytics.formationsCount}
            </Typography>
            <Typography variant="body-xs" className="text-text-primary">
              Formations
            </Typography>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Strategic Recommendations
        </Typography>
        <div className="space-y-3">
          {analytics.averageSuccessRate < 60 && (
            <div className="p-3 bg-surface-warning border border-text-warning rounded-lg">
              <Typography variant="body-sm" className="text-text-warning">
                <Icon name="alert-triangle" className="h-4 w-4 inline mr-2" />
                Consider simplifying play calls - average success rate is below
                60%.
              </Typography>
            </div>
          )}
          {analytics.averageComplexity > 7 && (
            <div className="p-3 bg-surface-error border border-text-error rounded-lg">
              <Typography variant="body-sm" className="text-text-error">
                <Icon name="zap" className="h-4 w-4 inline mr-2" />
                High complexity plays may be causing execution issues.
              </Typography>
            </div>
          )}
          {analytics.formationsCount < 3 && (
            <div className="p-3 bg-surface-info border border-text-info rounded-lg">
              <Typography variant="body-sm" className="text-text-info">
                <Icon name="grid" className="h-4 w-4 inline mr-2" />
                Consider adding more formations for situational variety.
              </Typography>
            </div>
          )}
          {analytics.topPerformingPlays.length > 0 &&
            analytics.topPerformingPlays[0].successRate > 80 && (
              <div className="p-3 bg-surface-success border border-text-success rounded-lg">
                <Typography variant="body-sm" className="text-text-success">
                  <Icon name="check-circle" className="h-4 w-4 inline mr-2" />
                  Excellent performance! Focus on replicating success patterns.
                </Typography>
              </div>
            )}
        </div>
      </Card>
    </div>
  </div>
);
