import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Typography } from "../design-system/Typography";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { SuccessRateBarChart } from "./charts/SuccessRateBarChart";
import {
  SessionAnalyticsService,
  type PlayTrendData,
} from "../../services/sessionAnalyticsService";
import { PlayAnalyticsService } from "../../services/playAnalyticsService";

interface TrendAnalyticsDashboardProps {
  playId: string;
  teamId: string;
}

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center">
      <Icon
        name="refresh-cw"
        className="h-8 w-8 animate-spin text-primary mx-auto mb-4"
      />
      <Typography variant="body-lg">Loading trend analytics...</Typography>
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-6 text-center">
    <Icon name="alert-triangle" className="h-12 w-12 text-error mx-auto mb-4" />
    <Typography variant="headline-sm" className="text-error mb-2">
      Analytics Error
    </Typography>
    <Typography variant="body-sm" className="text-secondary">
      {message}
    </Typography>
  </div>
);

const OverviewCard: React.FC<{
  trendDirection: number;
  totalTrendPoints: number;
  avgSuccessRate: number;
}> = ({ trendDirection, totalTrendPoints, avgSuccessRate }) => (
  <Card className="p-6">
    <Typography variant="headline-md" className="mb-4">
      Trend Analysis Overview
    </Typography>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center">
        <Typography variant="headline-lg" className="text-success-600">
          {trendDirection >= 0 ? "+" : ""}
          {trendDirection.toFixed(1)}%
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          Success Rate Trend
        </Typography>
      </div>
      <div className="text-center">
        <Typography variant="headline-lg" className="text-primary">
          {totalTrendPoints}
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          Weeks Analyzed
        </Typography>
      </div>
      <div className="text-center">
        <Typography variant="headline-lg" className="text-info-600">
          {avgSuccessRate.toFixed(1)}%
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          Average Success
        </Typography>
      </div>
    </div>
  </Card>
);

const TrendTooltip: React.FC<{
  active?: boolean;
  payload?: any;
  label?: string | number;
}> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-primary rounded-lg p-3 shadow-xl">
      <Typography variant="body-sm" className="font-medium mb-1">
        {label}
      </Typography>
      {payload.map((entry: any, index: number) => (
        <Typography key={index} variant="body-xs" className="text-secondary">
          {entry.dataKey === "successRate" ? "Success Rate" : entry.dataKey}:{" "}
          {(() => {
            if (entry.dataKey === "successRate") return `${entry.value}%`;
            if (entry.dataKey === "avgYards")
              return `${entry.value.toFixed(1)} yds`;
            return entry.value;
          })()}
        </Typography>
      ))}
    </div>
  );
};

/**
 * TrendAnalyticsDashboard - Full trend analysis for plays and formations
 *
 * Shows trend analysis over time including:
 * - Play success rate trends
 * - Formation effectiveness over time
 * - Player performance trends
 * - Comparative analysis across sessions
 *
 * @param playId - The play ID to analyze trends for
 * @param teamId - The team ID for context
 */
export const TrendAnalyticsDashboard: React.FC<
  TrendAnalyticsDashboardProps
> = ({ playId, teamId }) => {
  const [trendData, setTrendData] = useState<PlayTrendData[]>([]);
  const [formationData, setFormationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrendData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load play trend data
        const playTrends = await SessionAnalyticsService.getPlayTrend(
          playId,
          teamId
        );

        // Load playbook analytics for formation comparison
        const playbookData =
          await PlayAnalyticsService.getPlaybookAnalytics(playId);

        setTrendData(playTrends);
        setFormationData(
          playbookData.formationAnalytics.map((f) => ({
            name: f.formation,
            successRate: f.successRate,
            totalPlays: f.totalPlays,
            successfulPlays: Math.round((f.totalPlays * f.successRate) / 100),
          }))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trend data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrendData();
  }, [playId, teamId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  // Calculate trend metrics
  const totalTrendPoints = trendData.length;
  const avgSuccessRate =
    totalTrendPoints > 0
      ? trendData.reduce((sum, d) => sum + d.successRate, 0) / totalTrendPoints
      : 0;
  const trendDirection =
    totalTrendPoints > 1
      ? trendData[totalTrendPoints - 1].successRate - trendData[0].successRate
      : 0;

  // Format data for line chart
  const chartData = trendData.map((point, index) => ({
    week: `Week ${index + 1}`,
    successRate: point.successRate,
    executions: point.executions,
    avgYards: point.avgYards,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon name="trending-up" className="h-6 w-6 text-primary" />
        <Typography variant="headline-lg">Trend Analytics</Typography>
      </div>

      {/* Overview */}
      <OverviewCard
        trendDirection={trendDirection}
        totalTrendPoints={totalTrendPoints}
        avgSuccessRate={avgSuccessRate}
      />

      {/* Success Rate Trends Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-4">
            Success Rate Trends Over Time
          </Typography>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12 }}
                  className="text-secondary"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-secondary"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={(props) => <TrendTooltip {...props} />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Success Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Typography variant="body-xs" className="text-secondary mt-2">
            Success rate progression over time
          </Typography>
        </Card>
      )}

      {/* Formation Comparison */}
      {formationData.length > 0 && (
        <SuccessRateBarChart
          data={formationData}
          title="Formation Effectiveness Comparison"
        />
      )}

      {/* Additional Trend Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-3">
            Performance Metrics
          </Typography>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Typography variant="body-sm">Total Executions</Typography>
              <Typography variant="body-sm" className="font-medium">
                {trendData.reduce((sum, d) => sum + d.executions, 0)}
              </Typography>
            </div>
            <div className="flex justify-between items-center">
              <Typography variant="body-sm">Avg Yards/Play</Typography>
              <div className="flex items-center gap-2">
                <Typography variant="body-sm" className="font-medium">
                  {trendData.length > 0
                    ? (
                        trendData.reduce((sum, d) => sum + d.avgYards, 0) /
                        trendData.length
                      ).toFixed(1)
                    : "0.0"}
                </Typography>
                <Typography variant="body-xs" className="text-secondary">
                  yds
                </Typography>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Typography variant="body-sm">Best Week</Typography>
              <Typography
                variant="body-sm"
                className="font-medium text-success-600"
              >
                {trendData.length > 0
                  ? Math.max(...trendData.map((d) => d.successRate)).toFixed(1)
                  : "0.0"}
                %
              </Typography>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="headline-sm" className="mb-3">
            Trend Analysis
          </Typography>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Typography variant="body-sm">Consistency</Typography>
              <Typography variant="body-sm" className="font-medium">
                {calculateConsistency(trendData)}%
              </Typography>
            </div>
            <div className="flex justify-between items-center">
              <Typography variant="body-sm">Improvement Rate</Typography>
              <div className="flex items-center gap-2">
                <Typography
                  variant="body-sm"
                  className={`font-medium ${trendDirection >= 0 ? "text-success-600" : "text-error-600"}`}
                >
                  {trendDirection >= 0 ? "+" : ""}
                  {trendDirection.toFixed(1)}%
                </Typography>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Typography variant="body-sm">Reliability</Typography>
              <Typography variant="body-sm" className="font-medium">
                {trendData.filter((d) => d.successRate >= 70).length}/
                {trendData.length} weeks
              </Typography>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper function to calculate consistency (lower variance = higher consistency)
function calculateConsistency(data: PlayTrendData[]): number {
  if (data.length < 2) return 100;

  const mean = data.reduce((sum, d) => sum + d.successRate, 0) / data.length;
  const variance =
    data.reduce((sum, d) => sum + Math.pow(d.successRate - mean, 2), 0) /
    data.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency score (lower std dev = higher consistency)
  const consistency = Math.max(0, 100 - stdDev * 2);
  return Math.round(consistency);
}
