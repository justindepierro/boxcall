import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  unit: string;
  trend: "up" | "down" | "stable";
  color: string;
  icon: "target" | "star" | "warning";
}

export interface PlayEffectivenessData {
  playName: string;
  attempts: number;
  successes: number;
  averageYards: number;
  successRate: number;
  trend: "up" | "down" | "stable";
}

export interface MobileAnalyticsDashboardProps {
  teamId: string;
  timeframe: "week" | "month" | "season";
  onTimeframeChange: (timeframe: "week" | "month" | "season") => void;
  className?: string;
}

/**
 * Mobile Analytics Dashboard
 *
 * Features:
 * - Touch-optimized performance metrics with visual indicators
 * - Swipe navigation between analytics categories
 * - Simple charts optimized for mobile viewing
 * - Quick insights with actionable recommendations
 * - Offline analytics data for recent games
 * - Export functionality for sharing with staff
 */
export const MobileAnalyticsDashboard: React.FC<
  MobileAnalyticsDashboardProps
> = ({ teamId: _teamId, timeframe, onTimeframeChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "plays" | "players">(
    "overview"
  );

  // Sample metrics data
  const metrics: AnalyticsMetric[] = [
    {
      id: "total_plays",
      name: "Total Plays",
      value: 156,
      previousValue: 142,
      unit: "",
      trend: "up",
      color: "bg-blue-500",
      icon: "target",
    },
    {
      id: "success_rate",
      name: "Success Rate",
      value: 68,
      previousValue: 62,
      unit: "%",
      trend: "up",
      color: "bg-green-500",
      icon: "star",
    },
    {
      id: "avg_yards",
      name: "Avg Yards/Play",
      value: 5.2,
      previousValue: 4.8,
      unit: " yards",
      trend: "up",
      color: "bg-purple-500",
      icon: "target",
    },
    {
      id: "turnovers",
      name: "Turnovers",
      value: 3,
      previousValue: 7,
      unit: "",
      trend: "down",
      color: "bg-red-500",
      icon: "warning",
    },
  ];

  // Sample play effectiveness data
  const playEffectiveness: PlayEffectivenessData[] = [
    {
      playName: "Power O Right",
      attempts: 23,
      successes: 18,
      averageYards: 4.2,
      successRate: 78,
      trend: "up",
    },
    {
      playName: "Quick Slants",
      attempts: 31,
      successes: 26,
      averageYards: 6.1,
      successRate: 84,
      trend: "up",
    },
    {
      playName: "Deep Post",
      attempts: 8,
      successes: 3,
      averageYards: 8.5,
      successRate: 38,
      trend: "down",
    },
    {
      playName: "Screen Pass",
      attempts: 12,
      successes: 9,
      averageYards: 5.8,
      successRate: 75,
      trend: "stable",
    },
  ];

  // Get trend icon and color
  const getTrendIndicator = (
    trend: "up" | "down" | "stable"
  ): { icon: "chevron-up" | "chevron-down" | "star"; color: string } => {
    switch (trend) {
      case "up":
        return { icon: "chevron-up", color: "text-green-500" };
      case "down":
        return { icon: "chevron-down", color: "text-red-500" };
      default:
        return { icon: "star", color: "text-gray-500" };
    }
  };

  // Calculate percentage change
  const getPercentageChange = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return Math.abs(change).toFixed(1);
  };

  // Render metric card
  const renderMetricCard = (metric: AnalyticsMetric) => {
    const trendIndicator = getTrendIndicator(metric.trend);
    const percentageChange = getPercentageChange(
      metric.value,
      metric.previousValue
    );

    return (
      <div
        key={metric.id}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center`}
          >
            <Icon name={metric.icon} size="sm" className="text-white" />
          </div>
          {percentageChange && (
            <div
              className={`flex items-center space-x-1 ${trendIndicator.color}`}
            >
              <Icon name={trendIndicator.icon} size="xs" />
              <span className="text-xs font-medium">{percentageChange}%</span>
            </div>
          )}
        </div>

        <Typography variant="headline-lg" className="font-bold mb-1">
          {metric.value}
          {metric.unit}
        </Typography>

        <Typography variant="body-sm" color="muted">
          {metric.name}
        </Typography>
      </div>
    );
  };

  // Render play effectiveness card
  const renderPlayCard = (play: PlayEffectivenessData) => {
    const trendIndicator = getTrendIndicator(play.trend);

    return (
      <div
        key={play.playName}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <Typography variant="body-md" className="font-semibold mb-1">
              {play.playName}
            </Typography>
            <Typography variant="body-sm" color="muted">
              {play.attempts} attempts • {play.averageYards} avg yards
            </Typography>
          </div>
          <div
            className={`flex items-center space-x-1 ${trendIndicator.color}`}
          >
            <Icon name={trendIndicator.icon} size="xs" />
            <span className="text-xs font-medium">{play.successRate}%</span>
          </div>
        </div>

        {/* Success rate bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              play.successRate >= 70
                ? "bg-green-500"
                : play.successRate >= 50
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${play.successRate}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {play.successes}/{play.attempts} successful
          </span>
          <span>{play.successRate}% success rate</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`mobile-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="headline-md" className="font-bold">
            Team Analytics
          </Typography>

          {/* Export button */}
          <button className="p-2 text-brand-jade hover:bg-brand-jade hover:text-white rounded-lg transition-colors touch-manipulation">
            <Icon name="share" size="md" />
          </button>
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-4">
          {(["week", "month", "season"] as const).map((period) => (
            <button
              key={period}
              onClick={() => onTimeframeChange(period)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors capitalize touch-manipulation ${
                timeframe === period
                  ? "bg-white dark:bg-gray-800 text-brand-jade shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-1">
          {(
            [
              { id: "overview", label: "Overview", icon: "grid" },
              { id: "plays", label: "Plays", icon: "target" },
              { id: "players", label: "Players", icon: "users" },
            ] as Array<{
              id: string;
              label: string;
              icon: "grid" | "target" | "users";
            }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? "bg-brand-jade text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon name={tab.icon} size="xs" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Key metrics */}
            <div>
              <Typography variant="body-md" className="font-semibold mb-4">
                Key Metrics
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                {metrics.map(renderMetricCard)}
              </div>
            </div>

            {/* Quick insights */}
            <div>
              <Typography variant="body-md" className="font-semibold mb-4">
                Quick Insights
              </Typography>
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon
                      name="star"
                      size="sm"
                      className="text-green-600 dark:text-green-400 mt-0.5"
                    />
                    <div>
                      <Typography
                        variant="body-sm"
                        className="font-medium text-green-800 dark:text-green-200 mb-1"
                      >
                        Improved Performance
                      </Typography>
                      <Typography
                        variant="body-xs"
                        className="text-green-700 dark:text-green-300"
                      >
                        Success rate up 6% from last {timeframe}. Running plays
                        showing strong improvement.
                      </Typography>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon
                      name="warning"
                      size="sm"
                      className="text-yellow-600 dark:text-yellow-400 mt-0.5"
                    />
                    <div>
                      <Typography
                        variant="body-sm"
                        className="font-medium text-yellow-800 dark:text-yellow-200 mb-1"
                      >
                        Area for Focus
                      </Typography>
                      <Typography
                        variant="body-xs"
                        className="text-yellow-700 dark:text-yellow-300"
                      >
                        Deep passing plays need attention. Consider more
                        practice on timing routes.
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "plays" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="body-md" className="font-semibold">
                Play Effectiveness
              </Typography>
              <Typography variant="body-sm" color="muted">
                Last {timeframe}
              </Typography>
            </div>

            <div className="space-y-3">
              {playEffectiveness.map(renderPlayCard)}
            </div>
          </div>
        )}

        {activeTab === "players" && (
          <div className="text-center py-12">
            <Icon
              name="users"
              size="lg"
              className="mx-auto mb-3 text-gray-400"
            />
            <Typography variant="body-md" color="muted" className="mb-2">
              Player Analytics Coming Soon
            </Typography>
            <Typography variant="body-sm" color="muted">
              Individual player performance metrics and comparisons
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
