import React, { useState, useEffect } from "react";
import { Typography } from "../design-system/Typography";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { PlayTypeDistributionChart } from "./charts/PlayTypeDistributionChart";
import { SuccessRateBarChart } from "./charts/SuccessRateBarChart";
import {
  SessionAnalyticsService,
  type SessionAnalytics,
} from "../../services/sessionAnalyticsService";
import { getPlayTypeColor } from "@/design-system/chartColors";

interface SessionAnalyticsDashboardProps {
  sessionId: string;
}

/**
 * SessionAnalyticsDashboard - Comprehensive session analytics
 *
 * Displays detailed analytics for a specific practice/game session including:
 * - Play success rates by formation
 * - Player performance metrics
 * - Time distribution analysis
 * - Confidence trends over session
 *
 * @param sessionId - The session ID to analyze
 */
export const SessionAnalyticsDashboard: React.FC<
  SessionAnalyticsDashboardProps
> = ({ sessionId }) => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data =
          await SessionAnalyticsService.getSessionAnalytics(sessionId);
        setAnalytics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Icon
            name="refresh-cw"
            className="h-8 w-8 animate-spin text-primary mx-auto mb-4"
          />
          <Typography variant="body-lg">
            Loading session analytics...
          </Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <Icon
          name="alert-triangle"
          className="h-12 w-12 text-error mx-auto mb-4"
        />
        <Typography variant="headline-sm" className="text-error mb-2">
          Analytics Error
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          {error}
        </Typography>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <Icon name="bar-chart" className="h-12 w-12 text-muted mx-auto mb-4" />
        <Typography variant="headline-sm" className="text-secondary mb-2">
          No Analytics Data
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          No data available for this session.
        </Typography>
      </div>
    );
  }

  // Transform data for charts
  const playTypeData = analytics.byPlayType.map((item) => ({
    name: item.type,
    value: item.count,
    color: getPlayTypeColor(item.type),
  }));

  const formationData = analytics.byFormation.map((item) => ({
    name: item.formationName,
    successRate: item.successRate,
    totalPlays: item.attempts,
    successfulPlays: Math.round((item.attempts * item.successRate) / 100),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon name="chart-bar" className="h-6 w-6 text-primary" />
        <Typography variant="headline-lg">Session Analytics</Typography>
      </div>

      {/* Session Overview */}
      <Card className="p-6">
        <Typography variant="headline-md" className="mb-4">
          Session Overview -{" "}
          {analytics.sessionType === "game" ? "Game" : "Practice"}
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Typography variant="headline-lg" className="text-success-600">
              {analytics.successRate}%
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Overall Success
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="headline-lg" className="text-primary">
              {analytics.totalPlays}
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Total Plays
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="headline-lg" className="text-warning-600">
              {analytics.avgYardsPerPlay.toFixed(1)}
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Avg Yards/Play
            </Typography>
          </div>
          <div className="text-center">
            <Typography variant="headline-lg" className="text-info-600">
              {analytics.totalYards}
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Total Yards
            </Typography>
          </div>
        </div>
        {analytics.opponent && (
          <Typography variant="body-sm" className="text-secondary mt-4">
            Opponent: {analytics.opponent}
          </Typography>
        )}
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlayTypeDistributionChart data={playTypeData} />
        <SuccessRateBarChart
          data={formationData}
          title="Success Rate by Formation"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-3">
            By Down Performance
          </Typography>
          <div className="space-y-2">
            {analytics.byDown.slice(0, 4).map((down) => (
              <div key={down.down} className="flex justify-between">
                <Typography variant="body-sm">{down.down}st Down</Typography>
                <Typography variant="body-sm" className="font-medium">
                  {down.successRate.toFixed(1)}% ({down.successes}/
                  {down.attempts})
                </Typography>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-3">
            Field Position Zones
          </Typography>
          <div className="space-y-2">
            {analytics.byFieldZone.slice(0, 3).map((zone) => (
              <div key={zone.zone} className="flex justify-between">
                <Typography variant="body-sm">{zone.zone}</Typography>
                <Typography variant="body-sm" className="font-medium">
                  {zone.successRate.toFixed(1)}%
                </Typography>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-3">
            Hash Distribution
          </Typography>
          <div className="space-y-2">
            {analytics.byHash.map((hash) => (
              <div key={hash.hash} className="flex justify-between">
                <Typography variant="body-sm" className="capitalize">
                  {hash.hash} Hash
                </Typography>
                <Typography variant="body-sm" className="font-medium">
                  {hash.successRate.toFixed(1)}%
                </Typography>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
