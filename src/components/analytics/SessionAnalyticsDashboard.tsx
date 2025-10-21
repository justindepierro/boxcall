import React, { useState, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Badge } from "../ui/Badge";
import {
  SessionAnalyticsService,
  type SessionAnalytics,
} from "../../services/sessionAnalyticsService";
import { SuccessRateBarChart } from "./charts/SuccessRateBarChart";
import { PlayTypeDistributionChart } from "./charts/PlayTypeDistributionChart";
import { PlaySuccessHeatmap } from "./charts/PlaySuccessHeatmap";

/**
 * Session Analytics Dashboard - Phase 14.1
 * Comprehensive post-session analytics with charts
 */

interface SessionAnalyticsDashboardProps {
  sessionId: string;
  className?: string;
  onExport?: () => void;
}

export const SessionAnalyticsDashboard: React.FC<
  SessionAnalyticsDashboardProps
> = ({ sessionId, className = "", onExport }) => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SessionAnalyticsService.getSessionAnalytics(sessionId);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SessionAnalyticsService.getSessionAnalytics(sessionId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-spacing-2xl ${className}`}>
        <div className="text-center">
          <Icon
            name="refresh-cw"
            className="h-8 w-8 animate-spin text-jade-600 mx-auto mb-spacing-md"
          />
          <Typography variant="body-lg">Loading analytics...</Typography>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`p-spacing-2xl text-center ${className}`}>
        <Icon
          name="alert-triangle"
          className="h-12 w-12 text-text-error mx-auto mb-spacing-md"
        />
        <Typography variant="headline-sm" className="text-text-error mb-spacing-xs">
          Analytics Error
        </Typography>
        <Typography variant="body-sm" className="text-text-error mb-spacing-md">
          {error || "No analytics data available"}
        </Typography>
        <Button onClick={loadAnalytics} variant="secondary">
          <Icon name="refresh-cw" className="mr-spacing-xs" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-spacing-lg ${className}`}>
      {/* Header */}
      <Card>
        <div className="p-spacing-lg">
          <div className="flex items-start justify-between mb-spacing-md">
            <div>
              <Typography variant="headline-lg" className="mb-spacing-xs">
                {analytics.sessionType === "game" ? "🏈 Game" : "📋 Practice"}{" "}
                Session Analytics
              </Typography>
              <Typography variant="body-sm" className="text-text-secondary">
                {new Date(analytics.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {analytics.opponent && ` • vs ${analytics.opponent}`}
              </Typography>
            </div>
            {onExport && (
              <Button onClick={onExport} variant="secondary" size="sm">
                <Icon name="download" className="mr-spacing-xs" />
                Export PDF
              </Button>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-spacing-md">
            <div className="text-center p-spacing-md bg-surface-secondary rounded-sm">
              <Typography variant="body-xs" className="text-text-secondary mb-spacing-xs">
                Success Rate
              </Typography>
              <Typography
                variant="headline-lg"
                className="font-bold"
                style={{
                  color:
                    analytics.successRate >= 75
                      ? "var(--color-success-500)"
                      : analytics.successRate >= 60
                        ? "var(--color-warning-500)"
                        : "var(--color-error-500)",
                }}
              >
                {analytics.successRate}%
              </Typography>
            </div>

            <div className="text-center p-spacing-md bg-surface-secondary rounded-sm">
              <Typography variant="body-xs" className="text-text-secondary mb-spacing-xs">
                Avg Yards/Play
              </Typography>
              <Typography variant="headline-lg" className="font-bold text-jade-600">
                {analytics.avgYardsPerPlay}
              </Typography>
            </div>

            <div className="text-center p-spacing-md bg-surface-secondary rounded-sm">
              <Typography variant="body-xs" className="text-text-secondary mb-spacing-xs">
                Total Plays
              </Typography>
              <Typography variant="headline-lg" className="font-bold">
                {analytics.totalPlays}
              </Typography>
            </div>

            <div className="text-center p-spacing-md bg-surface-secondary rounded-sm">
              <Typography variant="body-xs" className="text-text-secondary mb-spacing-xs">
                Total Yards
              </Typography>
              <Typography variant="headline-lg" className="font-bold text-jade-600">
                {analytics.totalYards}
              </Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-spacing-lg">
        {/* Success Rate by Down */}
        {analytics.byDown.length > 0 && (
          <SuccessRateBarChart data={analytics.byDown} />
        )}

        {/* Play Type Distribution */}
        {analytics.byPlayType.length > 0 && (
          <PlayTypeDistributionChart data={analytics.byPlayType} />
        )}
      </div>

      {/* Formation Effectiveness */}
      {analytics.byFormation.length > 0 && (
        <Card>
          <div className="p-spacing-lg">
            <Typography variant="headline-sm" className="mb-spacing-md">
              Formation Effectiveness
            </Typography>
            <div className="space-y-spacing-sm">
              {analytics.byFormation.map((formation) => (
                <div
                  key={formation.formationName}
                  className="flex items-center justify-between p-spacing-sm bg-surface-secondary rounded-sm"
                >
                  <div className="flex-1">
                    <Typography variant="body-sm" className="font-semibold">
                      {formation.formationName}
                    </Typography>
                    <Typography variant="body-xs" className="text-text-secondary">
                      {formation.attempts} plays • {formation.avgYards} avg yards
                    </Typography>
                  </div>
                  <Badge
                    variant={
                      formation.successRate >= 75
                        ? "success"
                        : formation.successRate >= 60
                          ? "warning"
                          : "danger"
                    }
                  >
                    {formation.successRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Coverage Performance (Phase 13) */}
      {analytics.byCoverage.length > 0 && (
        <Card>
          <div className="p-spacing-lg">
            <Typography variant="headline-sm" className="mb-spacing-sm">
              Coverage Performance
            </Typography>
            <Typography variant="body-xs" className="text-text-secondary mb-spacing-md">
              How well plays performed against different defensive coverages
            </Typography>
            <div className="space-y-spacing-sm">
              {analytics.byCoverage.map((coverage) => (
                <div
                  key={coverage.coverage}
                  className="flex items-center gap-spacing-md p-spacing-sm bg-surface-secondary rounded-sm"
                >
                  <div className="flex-1">
                    <Typography variant="body-sm" className="font-semibold">
                      {coverage.coverage}
                    </Typography>
                    <Typography variant="body-xs" className="text-text-secondary">
                      {coverage.attempts} plays • {coverage.avgYards} avg yards
                    </Typography>
                  </div>
                  <div className="w-32">
                    <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${coverage.successRate}%`,
                          backgroundColor:
                            coverage.successRate >= 75
                              ? "var(--color-success-500)"
                              : coverage.successRate >= 60
                                ? "var(--color-warning-500)"
                                : "var(--color-error-500)",
                        }}
                      />
                    </div>
                  </div>
                  <Badge
                    variant={
                      coverage.successRate >= 75
                        ? "success"
                        : coverage.successRate >= 60
                          ? "warning"
                          : "danger"
                    }
                    className="w-15 text-center"
                  >
                    {coverage.successRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Hash Success Comparison (Phase 13) */}
      {analytics.byHash.length > 0 && (
        <Card>
          <div className="p-spacing-lg">
            <Typography variant="headline-sm" className="mb-spacing-sm">
              Hash Success Comparison
            </Typography>
            <Typography variant="body-xs" className="text-text-secondary mb-spacing-md">
              Success rate by field hash position (left, middle, right)
            </Typography>
            <div className="grid grid-cols-3 gap-spacing-md">
              {analytics.byHash.map((hash) => {
                const isHighest =
                  hash.successRate ===
                  Math.max(...analytics.byHash.map((h) => h.successRate));
                return (
                  <div
                    key={hash.hash}
                    className={`text-center p-spacing-md rounded-sm ${
                      isHighest
                        ? "bg-success-bg border-2 border-success-500"
                        : "bg-surface-secondary"
                    }`}
                  >
                    {isHighest && (
                      <Icon
                        name="star"
                        className="h-4 w-4 text-success-600 mx-auto mb-spacing-xs"
                      />
                    )}
                    <Typography
                      variant="body-xs"
                      className={`mb-spacing-xs ${isHighest ? "text-success-700 font-semibold" : "text-text-secondary"}`}
                    >
                      {hash.hash.charAt(0).toUpperCase() + hash.hash.slice(1)}
                    </Typography>
                    <Typography
                      variant="headline-md"
                      className={`font-bold ${isHighest ? "text-success-600" : ""}`}
                    >
                      {hash.successRate}%
                    </Typography>
                    <Typography variant="body-xs" className="text-text-muted">
                      {hash.attempts} plays
                    </Typography>
                    <Typography variant="body-xs" className="text-text-muted">
                      {hash.avgYards} avg
                    </Typography>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Field Position Zones - Heatmap (Phase 14.2) */}
      {analytics.byFieldZone.length > 0 && (
        <PlaySuccessHeatmap
          data={analytics.byFieldZone}
          title="Field Position Success Rate"
        />
      )}
    </div>
  );
};
