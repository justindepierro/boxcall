/**
 * Database Performance Monitor Component
 *
 * Real-time monitoring dashboard for database performance metrics,
 * cache statistics, and query optimization insights
 */

import React, { useState, useEffect } from "react";
import {
  useOptimizedMetrics,
  useOptimizedCache,
} from "../../hooks/useOptimizedDatabase";
import { databaseConfig } from "../../config/database";

interface PerformanceMetrics {
  totalQueries: number;
  averageResponseTime: number;
  cacheHitRate: number;
  slowQueries: number;
  errorRate: number;
}

interface DatabasePerformanceMonitorProps {
  className?: string;
  showDetails?: boolean;
  refreshInterval?: number;
}

const DatabasePerformanceMonitor: React.FC<DatabasePerformanceMonitorProps> = ({
  className = "",
  showDetails = false,
  refreshInterval = 5000,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { databaseMetrics, refresh } = useOptimizedMetrics();
  const cache = useOptimizedCache();
  // const _performance = useOptimizedPerformanceMonitor(); // TODO: Use performance data

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 10) / 10}%`;
  };

  const getPerformanceStatus = (metrics: PerformanceMetrics) => {
    if (metrics.errorRate > 5)
      return { status: "error", color: "text-red-600" };
    if (
      metrics.averageResponseTime >
      databaseConfig.performance.slowQueryThreshold
    ) {
      return { status: "warning", color: "text-yellow-600" };
    }
    if (metrics.cacheHitRate < 50)
      return { status: "warning", color: "text-yellow-600" };
    return { status: "good", color: "text-green-600" };
  };

  const performanceStatus = getPerformanceStatus(databaseMetrics);

  if (!isExpanded) {
    return (
      <div
        className={`inline-flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2"
          title="Database Performance Monitor"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              performanceStatus.status === "good"
                ? "bg-green-500"
                : performanceStatus.status === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium">DB</span>
          <span className="text-xs text-gray-600">
            {formatDuration(databaseMetrics.averageResponseTime)} avg
          </span>
          <span className="text-xs text-gray-600">
            {formatPercentage(cache.hitRate)} cache
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              performanceStatus.status === "good"
                ? "bg-green-500"
                : performanceStatus.status === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          />
          <h3 className="text-sm font-semibold text-gray-900">
            Database Performance
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs px-2 py-1 rounded ${
              autoRefresh
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {autoRefresh ? "Auto" : "Manual"}
          </button>
          <button
            onClick={refresh}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Refresh
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Queries */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 font-medium">Total Queries</div>
          <div className="text-lg font-bold text-gray-900">
            {databaseMetrics.totalQueries}
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 font-medium">Avg Response</div>
          <div className={`text-lg font-bold ${performanceStatus.color}`}>
            {formatDuration(databaseMetrics.averageResponseTime)}
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 font-medium">
            Cache Hit Rate
          </div>
          <div
            className={`text-lg font-bold ${
              cache.hitRate > 70
                ? "text-green-600"
                : cache.hitRate > 40
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {formatPercentage(cache.hitRate)}
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 font-medium">Error Rate</div>
          <div
            className={`text-lg font-bold ${
              databaseMetrics.errorRate < 1
                ? "text-green-600"
                : databaseMetrics.errorRate < 5
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {formatPercentage(databaseMetrics.errorRate)}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cache Statistics */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Cache Statistics
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Size:</span>
                <span className="font-medium">
                  {cache.size} / {cache.maxSize}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Entries:</span>
                <span className="font-medium">{cache.entries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Utilization:</span>
                <span className="font-medium">
                  {formatPercentage((cache.size / cache.maxSize) * 100)}
                </span>
              </div>
              <button
                onClick={cache.clearCache}
                className="mt-2 text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Performance Alerts */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">
              Performance Alerts
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-700">Slow Queries:</span>
                <span
                  className={`font-medium ${
                    databaseMetrics.slowQueries > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {databaseMetrics.slowQueries}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-700">Threshold:</span>
                <span className="font-medium">
                  {formatDuration(
                    databaseConfig.performance.slowQueryThreshold
                  )}
                </span>
              </div>
              {databaseMetrics.slowQueries > 0 && (
                <div className="text-xs text-orange-600 mt-1">
                  ⚠️ {databaseMetrics.slowQueries} queries exceeded threshold
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Queries (if available) */}
      {databaseMetrics.recentMetrics &&
        databaseMetrics.recentMetrics.length > 0 && (
          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Recent Queries
            </h4>
            <div className="bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
              {databaseMetrics.recentMetrics
                .slice(0, 5)
                .map((metric: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-600 truncate flex-1 mr-2">
                        {metric.query}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {metric.cacheHit && (
                          <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            cached
                          </span>
                        )}
                        <span
                          className={`font-medium ${
                            metric.duration >
                            databaseConfig.performance.slowQueryThreshold
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {formatDuration(metric.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Configuration Info */}
      <div className="px-4 pb-4 border-t border-gray-200 pt-4">
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
            Configuration
          </summary>
          <div className="mt-2 space-y-1 text-gray-600">
            <div>
              Cache TTL: {formatDuration(databaseConfig.cache.defaultTTL)}
            </div>
            <div>
              Slow Query Threshold:{" "}
              {formatDuration(databaseConfig.performance.slowQueryThreshold)}
            </div>
            <div>
              Query Optimization:{" "}
              {databaseConfig.optimization.enableQueryOptimization
                ? "Enabled"
                : "Disabled"}
            </div>
            <div>
              Query Logging:{" "}
              {databaseConfig.performance.enableQueryLogging
                ? "Enabled"
                : "Disabled"}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default DatabasePerformanceMonitor;
