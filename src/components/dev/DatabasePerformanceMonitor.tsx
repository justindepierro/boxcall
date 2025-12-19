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

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

function getStatusDotClassName(status: "good" | "warning" | "error") {
  if (status === "good") return "bg-success-500";
  if (status === "warning") return "bg-warning-500";
  return "bg-error-500";
}

function getPerformanceStatus(metrics: PerformanceMetrics) {
  if (metrics.errorRate > 5)
    return { status: "error" as const, color: "text-error-600" };
  if (
    metrics.averageResponseTime > databaseConfig.performance.slowQueryThreshold
  ) {
    return { status: "warning" as const, color: "text-warning-600" };
  }
  if (metrics.cacheHitRate < 50)
    return { status: "warning" as const, color: "text-warning-600" };
  return { status: "good" as const, color: "text-success-600" };
}

type PerformanceStatus = ReturnType<typeof getPerformanceStatus>;

const DatabasePerformanceCollapsed: React.FC<{
  className: string;
  onExpand: () => void;
  performanceStatus: PerformanceStatus;
  averageResponseTime: number;
  cacheHitRate: number;
}> = ({
  className,
  onExpand,
  performanceStatus,
  averageResponseTime,
  cacheHitRate,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 p-2 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors ${className}`}
    >
      <button
        onClick={onExpand}
        className="flex items-center gap-2"
        title="Database Performance Monitor"
      >
        <div
          className={`w-2 h-2 rounded-full ${getStatusDotClassName(
            performanceStatus.status
          )}`}
        />
        <span className="text-sm font-medium">DB</span>
        <span className="text-xs text-secondary">
          {formatDuration(averageResponseTime)} avg
        </span>
        <span className="text-xs text-secondary">
          {formatPercentage(cacheHitRate)} cache
        </span>
      </button>
    </div>
  );
};

const DatabasePerformanceExpandedHeader: React.FC<{
  performanceStatus: PerformanceStatus;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onCollapse: () => void;
}> = ({
  performanceStatus,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onCollapse,
}) => {
  return (
    <div className="px-4 py-3 border-b border-muted flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${getStatusDotClassName(
            performanceStatus.status
          )}`}
        />
        <h3 className="text-sm font-semibold text-primary">
          Database Performance
        </h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleAutoRefresh}
          className={`text-xs px-2 py-1 rounded-lg ${
            autoRefresh
              ? "bg-success-bg text-success-600"
              : "bg-muted text-primary"
          }`}
        >
          {autoRefresh ? "Auto" : "Manual"}
        </button>
        <button
          onClick={onRefresh}
          className="text-xs px-2 py-1 bg-status-info-bg text-status-info rounded-lg hover:bg-blue-100"
        >
          Refresh
        </button>
        <button
          onClick={onCollapse}
          className="text-muted hover:text-secondary"
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
  );
};

const DatabasePerformanceExpandedMetricsGrid: React.FC<{
  databaseMetrics: any;
  cache: any;
  performanceStatus: PerformanceStatus;
}> = ({ databaseMetrics, cache, performanceStatus }) => {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-secondary p-3 rounded-lg">
        <div className="text-xs text-secondary font-medium">Total Queries</div>
        <div className="text-lg font-bold text-primary">
          {databaseMetrics.totalQueries}
        </div>
      </div>

      <div className="bg-secondary p-3 rounded-lg">
        <div className="text-xs text-secondary font-medium">Avg Response</div>
        <div className={`text-lg font-bold ${performanceStatus.color}`}>
          {formatDuration(databaseMetrics.averageResponseTime)}
        </div>
      </div>

      <div className="bg-secondary p-3 rounded-lg">
        <div className="text-xs text-secondary font-medium">Cache Hit Rate</div>
        <div
          className={`text-lg font-bold ${(() => {
            if (cache.hitRate > 70) return "text-success-600";
            if (cache.hitRate > 40) return "text-warning-600";
            return "text-error-600";
          })()}`}
        >
          {formatPercentage(cache.hitRate)}
        </div>
      </div>

      <div className="bg-secondary p-3 rounded-lg">
        <div className="text-xs text-secondary font-medium">Error Rate</div>
        <div
          className={`text-lg font-bold ${
            databaseMetrics.errorRate === 0
              ? "text-success-600"
              : (() => {
                  if (databaseMetrics.errorRate < 5) return "text-warning-600";
                  return "text-error-600";
                })()
          }`}
        >
          {formatPercentage(databaseMetrics.errorRate)}
        </div>
      </div>
    </div>
  );
};

const DatabasePerformanceExpandedDetails: React.FC<{
  databaseMetrics: any;
  cache: any;
}> = ({ databaseMetrics, cache }) => {
  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-status-info-bg p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-primary dark:text-blue-300 mb-2">
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
              className="mt-2 text-xs px-2 py-1 bg-status-info-bg text-primary dark:text-blue-300 rounded-lg hover:bg-blue-300"
            >
              Clear Cache
            </button>
          </div>
        </div>

        <div className="bg-warning-bg p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-warning-600 mb-2">
            Performance Alerts
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-warning-600">Slow Queries:</span>
              <span
                className={`font-medium ${(() => {
                  if (databaseMetrics.slowQueries > 0) return "text-error-600";
                  return "text-success-600";
                })()}`}
              >
                {databaseMetrics.slowQueries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-warning-600">Threshold:</span>
              <span className="font-medium">
                {formatDuration(databaseConfig.performance.slowQueryThreshold)}
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
  );
};

const DatabasePerformanceExpandedRecentQueries: React.FC<{
  databaseMetrics: any;
}> = ({ databaseMetrics }) => {
  if (
    !databaseMetrics.recentMetrics ||
    databaseMetrics.recentMetrics.length === 0
  ) {
    return null;
  }

  return (
    <div className="px-4 pb-4">
      <h4 className="text-sm font-semibold text-primary mb-2">
        Recent Queries
      </h4>
      <div className="bg-secondary rounded-lg max-h-32 overflow-y-auto">
        {databaseMetrics.recentMetrics
          .slice(0, 5)
          .map((metric: any, index: number) => (
            <div key={index} className="p-2 border-b border last:border-b-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-secondary truncate flex-1 mr-2">
                  {metric.query}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {metric.cacheHit && (
                    <span className="px-1 py-0.5 bg-success-bg text-success-600 rounded-lg text-xs">
                      cached
                    </span>
                  )}
                  <span
                    className={`font-medium ${
                      metric.duration >
                      databaseConfig.performance.slowQueryThreshold
                        ? "text-error-600"
                        : "text-primary"
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
  );
};

const DatabasePerformanceExpandedConfig: React.FC = () => (
  <div className="px-4 pb-4 border-t border pt-4">
    <details className="text-xs">
      <summary className="cursor-pointer text-secondary hover:text-primary">
        Configuration
      </summary>
      <div className="mt-2 space-y-1 text-secondary">
        <div>Cache TTL: {formatDuration(databaseConfig.cache.defaultTTL)}</div>
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
);

const DatabasePerformanceExpanded: React.FC<{
  className: string;
  performanceStatus: PerformanceStatus;
  databaseMetrics: any;
  cache: any;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onCollapse: () => void;
}> = ({
  className,
  performanceStatus,
  databaseMetrics,
  cache,
  autoRefresh,
  onToggleAutoRefresh,
  onRefresh,
  onCollapse,
}) => {
  return (
    <div className={`bg-primary rounded-lg shadow-md ${className}`}>
      <DatabasePerformanceExpandedHeader
        performanceStatus={performanceStatus}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={onToggleAutoRefresh}
        onRefresh={onRefresh}
        onCollapse={onCollapse}
      />
      <DatabasePerformanceExpandedMetricsGrid
        databaseMetrics={databaseMetrics}
        cache={cache}
        performanceStatus={performanceStatus}
      />
      <DatabasePerformanceExpandedDetails
        databaseMetrics={databaseMetrics}
        cache={cache}
      />
      <DatabasePerformanceExpandedRecentQueries
        databaseMetrics={databaseMetrics}
      />
      <DatabasePerformanceExpandedConfig />
    </div>
  );
};

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

  const performanceStatus = getPerformanceStatus(databaseMetrics);

  if (!isExpanded) {
    return (
      <DatabasePerformanceCollapsed
        className={className}
        onExpand={() => setIsExpanded(true)}
        performanceStatus={performanceStatus}
        averageResponseTime={databaseMetrics.averageResponseTime}
        cacheHitRate={cache.hitRate}
      />
    );
  }

  return (
    <DatabasePerformanceExpanded
      className={className}
      performanceStatus={performanceStatus}
      databaseMetrics={databaseMetrics}
      cache={cache}
      autoRefresh={autoRefresh}
      onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
      onRefresh={refresh}
      onCollapse={() => setIsExpanded(false)}
    />
  );
};

export default DatabasePerformanceMonitor;
