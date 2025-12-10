import React, { useState, useEffect, useCallback } from "react";
import { Typography } from "../design-system/Typography";
import { Icon } from "../ui/Icon";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { logError } from "../../utils/logger";
import {
  PlayerPerformanceAnalyticsService,
  type PlayerPerformanceMetrics,
  type TeamPerformanceOverview,
  type PerformanceInsights,
} from "../../services/performanceAnalyticsService";

/**
 * Player Performance Analytics Dashboard - Phase 4
 * Comprehensive player performance tracking and insights
 */

interface PlayerPerformanceDashboardProps {
  teamId: string;
}

export const PlayerPerformanceDashboard: React.FC<
  PlayerPerformanceDashboardProps
> = ({ teamId }) => {
  const [overview, setOverview] = useState<TeamPerformanceOverview | null>(
    null
  );
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);
  const [selectedPlayer, setSelectedPlayer] =
    useState<PlayerPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, insightsData] = await Promise.all([
        PlayerPerformanceAnalyticsService.getTeamPerformanceOverview(teamId),
        PlayerPerformanceAnalyticsService.getPerformanceInsights(teamId),
      ]);

      setOverview(overviewData);
      setInsights(insightsData);
    } catch (err) {
      logError("Error loading performance data:", err);
      setError("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="refresh-cw" className="animate-spin mr-2" />
        <Typography variant="body-sm">
          Loading performance analytics...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Icon
            name="alert-triangle"
            className="text-error mx-auto mb-4"
            size="lg"
          />
          <Typography variant="headline-sm" className="mb-2">
            Error Loading Analytics
          </Typography>
          <Typography variant="body-sm" className="text-secondary mb-4">
            {error}
          </Typography>
          <Button onClick={loadPerformanceData} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!overview || !insights) {
    return (
      <Card className="p-6">
        <Typography variant="body-sm">No performance data available</Typography>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="headline-sm">
            Team Performance Overview
          </Typography>
          <Badge
            variant={
              overview.averageTeamRating >= 8
                ? "success"
                : overview.averageTeamRating >= 6
                  ? "warning"
                  : "danger"
            }
          >
            {overview.averageTeamRating}/10 Average
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <Typography
              variant="display-lg"
              className="text-3xl font-bold text-info"
            >
              {overview.totalPlayers}
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Active Players
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="display-lg"
              className="text-3xl font-bold text-success"
            >
              {overview.topPerformers.length}
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Top Performers
            </Typography>
          </div>
          <div className="text-center">
            <Typography
              variant="display-lg"
              className="text-3xl font-bold text-warning"
            >
              {overview.playersNeedingAttention.length}
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Need Attention
            </Typography>
          </div>
        </div>
      </Card>

      {/* Position Breakdown */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Position Performance
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(overview.positionBreakdown).map(
            ([position, data]) => (
              <div key={position} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="headline-sm">{position}</Typography>
                  <Badge variant="neutral">{data.count} players</Badge>
                </div>
                <Typography variant="body-sm" className="text-secondary mb-1">
                  Avg Rating: {data.averageRating.toFixed(1)}/10
                </Typography>
                <Typography variant="body-xs" className="text-sm">
                  Top: {data.topPerformer}
                </Typography>
              </div>
            )
          )}
        </div>
      </Card>

      {/* Top Performers */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Top Performers
        </Typography>
        <div className="space-y-3">
          {overview.topPerformers.map((player, index) => (
            <div
              key={player.playerId}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary cursor-pointer"
              onClick={() => setSelectedPlayer(player)}
            >
              <div className="flex items-center space-x-3">
                <Badge variant="neutral">#{index + 1}</Badge>
                <div>
                  <Typography variant="body-sm" className="font-medium">
                    {player.playerName}
                  </Typography>
                  <Typography variant="body-xs" className="text-secondary">
                    {player.position}
                  </Typography>
                </div>
              </div>
              <div className="text-right">
                <Typography
                  variant="body-sm"
                  className="font-bold text-success"
                >
                  {player.averageRating}/10
                </Typography>
                <Typography variant="body-xs" className="text-secondary">
                  {player.totalActivities} activities
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Players Needing Attention */}
      {overview.playersNeedingAttention.length > 0 && (
        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-4">
            Players Needing Attention
          </Typography>
          <div className="space-y-3">
            {overview.playersNeedingAttention.map((player) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-3 border border-text-warning rounded-lg bg-warning/20 cursor-pointer"
                onClick={() => setSelectedPlayer(player)}
              >
                <div className="flex items-center space-x-3">
                  <Icon name="alert-triangle" className="text-warning" />
                  <div>
                    <Typography variant="body-sm" className="font-medium">
                      {player.playerName}
                    </Typography>
                    <Typography variant="body-xs" className="text-secondary">
                      {player.position}
                    </Typography>
                  </div>
                </div>
                <div className="text-right">
                  <Typography
                    variant="body-sm"
                    className="font-bold text-warning"
                  >
                    {player.averageRating}/10
                  </Typography>
                  <Badge
                    variant={
                      player.improvementTrend === "declining"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {player.improvementTrend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights and Recommendations */}
      <Card className="p-6">
        <Typography variant="headline-sm" className="mb-4">
          Insights & Recommendations
        </Typography>

        {/* Alerts */}
        {insights.alerts.length > 0 && (
          <div className="mb-6">
            <Typography variant="headline-sm" className="mb-3">
              Alerts
            </Typography>
            <div className="space-y-2">
              {insights.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === "critical"
                      ? "border-text-error bg-surface-error"
                      : alert.type === "warning"
                        ? "border-text-warning bg-warning/20"
                        : "border-text-info bg-info/20"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon
                      name={
                        alert.type === "critical" ? "alert-triangle" : "info"
                      }
                      className={
                        alert.type === "critical"
                          ? "text-error"
                          : alert.type === "warning"
                            ? "text-warning"
                            : "text-info"
                      }
                    />
                    <Typography variant="body-sm">{alert.message}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div className="mb-6">
            <Typography variant="headline-sm" className="mb-3">
              Recommendations
            </Typography>
            <div className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-info/20 border-text-info"
                >
                  <Typography variant="body-sm">{rec}</Typography>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends */}
        {insights.trends.length > 0 && (
          <div>
            <Typography variant="headline-sm" className="mb-3">
              Performance Trends
            </Typography>
            <div className="space-y-2">
              {insights.trends.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <Typography variant="body-sm">{trend.metric}</Typography>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        trend.trend === "up"
                          ? "success"
                          : trend.trend === "down"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {trend.trend === "up"
                        ? "↗"
                        : trend.trend === "down"
                          ? "↘"
                          : "→"}
                      {Math.abs(trend.change)}
                    </Badge>
                    <Typography variant="body-xs" className="text-secondary">
                      {trend.period}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};

/**
 * Player Detail Modal Component
 */
interface PlayerDetailModalProps {
  player: PlayerPerformanceMetrics;
  onClose: () => void;
}

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-backdrop flex items-center justify-center p-4 z-modal">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="headline-lg">{player.playerName}</Typography>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="close" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Typography variant="headline-md" className="mb-2">
                Overview
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">Position:</Typography>
                  <Typography variant="body" className="font-medium">
                    {player.position}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Average Rating:</Typography>
                  <Typography variant="body" className="font-medium">
                    {player.averageRating}/10
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Total Activities:</Typography>
                  <Typography variant="body" className="font-medium">
                    {player.totalActivities}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Trend:</Typography>
                  <Badge
                    variant={
                      player.improvementTrend === "improving"
                        ? "success"
                        : player.improvementTrend === "declining"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    {player.improvementTrend}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Typography variant="headline-md" className="mb-2">
                Strengths & Weaknesses
              </Typography>
              <div className="space-y-3">
                <div>
                  <Typography
                    variant="body"
                    className="font-medium text-success mb-1"
                  >
                    Strengths:
                  </Typography>
                  <div className="flex flex-wrap gap-1">
                    {player.strengths.map((strength, index) => (
                      <Badge key={index} variant="success">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Typography
                    variant="body"
                    className="font-medium text-warning mb-1"
                  >
                    Weaknesses:
                  </Typography>
                  <div className="flex flex-wrap gap-1">
                    {player.weaknesses.map((weakness, index) => (
                      <Badge key={index} variant="warning">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Typography variant="headline-md" className="mb-4">
              Recent Performance
            </Typography>
            <div className="space-y-2">
              {player.recentPerformances.map((performance, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <Typography variant="body" className="font-medium">
                      {performance.activity}
                    </Typography>
                    <Typography variant="body" className="text-secondary">
                      {performance.date}
                    </Typography>
                    {performance.notes && (
                      <Typography variant="body" className="text-muted italic">
                        {performance.notes}
                      </Typography>
                    )}
                  </div>
                  <Badge
                    variant={
                      performance.rating >= 8
                        ? "success"
                        : performance.rating >= 6
                          ? "warning"
                          : "danger"
                    }
                  >
                    {performance.rating}/10
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
