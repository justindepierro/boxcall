import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

export interface MobileAnalyticsProps {
  teamId: string;
  timeframe: "week" | "month" | "season";
  onTimeframeChange: (timeframe: "week" | "month" | "season") => void;
  className?: string;
}

interface AnalyticsMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: "activity" | "users" | "calendar" | "trending-up" | "trophy";
}

interface PerformanceData {
  category: string;
  current: number;
  previous: number;
  target: number;
}

/**
 * Mobile Analytics Dashboard
 *
 * Features:
 * - Key performance metrics at a glance
 * - Touch-friendly charts and indicators
 * - Quick insights for coaches on the go
 * - Performance trends and comparisons
 * - Team progress tracking
 */
export const MobileAnalyticsDashboard: React.FC<MobileAnalyticsProps> = ({
  teamId: _teamId,
  timeframe,
  onTimeframeChange,
  className = "",
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Sample analytics data - would come from analytics service
  const metrics: AnalyticsMetric[] = [
    {
      id: "attendance",
      label: "Avg Attendance",
      value: "87%",
      change: 5.2,
      trend: "up",
      icon: "users",
    },
    {
      id: "practices",
      label: "Practices Held",
      value: "12",
      change: -8.3,
      trend: "down",
      icon: "calendar",
    },
    {
      id: "engagement",
      label: "Team Engagement",
      value: "94%",
      change: 12.1,
      trend: "up",
      icon: "activity",
    },
    {
      id: "performance",
      label: "Performance Index",
      value: "8.4",
      change: 2.8,
      trend: "up",
      icon: "trending-up",
    },
  ];

  const performanceData: PerformanceData[] = [
    { category: "Offense", current: 82, previous: 75, target: 85 },
    { category: "Defense", current: 78, previous: 80, target: 85 },
    { category: "Special Teams", current: 88, previous: 85, target: 90 },
    { category: "Conditioning", current: 91, previous: 87, target: 95 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <Icon name="trending-up" size="sm" className="text-green-500" />;
      case "down":
        return (
          <Icon
            name="trending-up"
            size="sm"
            className="text-red-500 rotate-180"
          />
        );
      default:
        return <Icon name="minus" size="sm" className="text-gray-500" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className={`mobile-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="headline-md" className="font-bold">
            Team Analytics
          </Typography>
          <Icon name="chart" size="lg" className="text-brand-jade" />
        </div>

        {/* Timeframe selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(["week", "month", "season"] as const).map((period) => (
            <button
              key={period}
              onClick={() => onTimeframeChange(period)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors capitalize touch-manipulation ${
                timeframe === period
                  ? "bg-white dark:bg-gray-800 text-brand-jade shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="p-4">
        <Typography variant="body-md" className="font-semibold mb-3">
          Key Metrics
        </Typography>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-4 rounded-xl border-2 transition-all touch-manipulation ${
                selectedMetric === metric.id
                  ? "border-brand-jade bg-brand-jade-light dark:bg-brand-jade-dark"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  name={metric.icon}
                  size="md"
                  className={
                    selectedMetric === metric.id
                      ? "text-brand-jade-dark dark:text-brand-jade-light"
                      : "text-gray-600 dark:text-gray-400"
                  }
                />
                {getTrendIcon(metric.trend)}
              </div>
              <Typography
                variant="headline-lg"
                className={`font-bold mb-1 ${
                  selectedMetric === metric.id
                    ? "text-brand-jade-dark dark:text-brand-jade-light"
                    : ""
                }`}
              >
                {metric.value}
              </Typography>
              <Typography
                variant="body-sm"
                className={
                  selectedMetric === metric.id
                    ? "text-brand-jade-dark dark:text-brand-jade-light opacity-75"
                    : "text-gray-600 dark:text-gray-400"
                }
              >
                {metric.label}
              </Typography>
              <div
                className={`flex items-center mt-2 text-xs font-medium ${getChangeColor(metric.change)}`}
              >
                <span>
                  {metric.change > 0 ? "+" : ""}
                  {metric.change}%
                </span>
                <span className="ml-1 opacity-75">vs last {timeframe}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Performance Breakdown */}
        <div className="mb-6">
          <Typography variant="body-md" className="font-semibold mb-3">
            Performance Breakdown
          </Typography>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            {performanceData.map((item, index) => (
              <div
                key={index}
                className={`${index !== performanceData.length - 1 ? "mb-4" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Typography variant="body-sm" className="font-medium">
                    {item.category}
                  </Typography>
                  <div className="flex items-center space-x-2">
                    <Typography variant="body-sm" color="muted">
                      {item.current}%
                    </Typography>
                    <div
                      className={`text-xs font-medium ${getChangeColor(item.current - item.previous)}`}
                    >
                      ({item.current - item.previous > 0 ? "+" : ""}
                      {item.current - item.previous})
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.current, item.target)}`}
                    style={{
                      width: `${Math.min((item.current / item.target) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <Typography variant="body-xs" color="muted">
                    Previous: {item.previous}%
                  </Typography>
                  <Typography variant="body-xs" color="muted">
                    Target: {item.target}%
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div>
          <Typography variant="body-md" className="font-semibold mb-3">
            Quick Insights
          </Typography>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <div className="flex items-start">
                <Icon
                  name="trending-up"
                  size="sm"
                  className="text-green-600 dark:text-green-400 mt-0.5 mr-3"
                />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-green-800 dark:text-green-200"
                  >
                    Team Engagement Up 12%
                  </Typography>
                  <Typography
                    variant="body-xs"
                    className="text-green-700 dark:text-green-300 mt-1"
                  >
                    Players are more active in team communications and showing
                    up consistently.
                  </Typography>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
              <div className="flex items-start">
                <Icon
                  name="warning"
                  size="sm"
                  className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3"
                />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-yellow-800 dark:text-yellow-200"
                  >
                    Practice Frequency Below Target
                  </Typography>
                  <Typography
                    variant="body-xs"
                    className="text-yellow-700 dark:text-yellow-300 mt-1"
                  >
                    Consider scheduling more practice sessions to meet season
                    goals.
                  </Typography>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <div className="flex items-start">
                <Icon
                  name="info"
                  size="sm"
                  className="text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
                />
                <div>
                  <Typography
                    variant="body-sm"
                    className="font-medium text-blue-800 dark:text-blue-200"
                  >
                    Special Teams Excellence
                  </Typography>
                  <Typography
                    variant="body-xs"
                    className="text-blue-700 dark:text-blue-300 mt-1"
                  >
                    Special teams performance is exceeding expectations this{" "}
                    {timeframe}.
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom safe area padding */}
      <div className="h-safe-area-inset-bottom"></div>
    </div>
  );
};
