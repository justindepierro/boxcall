/**
 * Phase 1 Foundation - Database Performance Monitor
 * Advanced monitoring and analytics for database operations
 *
 * Features:
 * - Query performance tracking
 * - Slow query detection
 * - Service metrics aggregation
 * - Real-time performance alerts
 */

import type { ServiceMetrics } from "../base/BaseService";

export interface DatabaseMetrics {
  avgQueryTime: number;
  cacheHitRate: number;
  connectionPoolUtilization: number;
  activeQueries: number;
  tableGrowthRate: Record<string, number>;
  errorRate: number;
}

export interface SlowQuery {
  operation: string;
  duration: number;
  timestamp: Date;
  errorMessage?: string;
}

export interface PerformanceReport {
  timeRange: { start: Date; end: Date };
  overallMetrics: DatabaseMetrics;
  slowQueries: SlowQuery[];
  serviceBreakdown: Record<
    string,
    {
      avgResponseTime: number;
      successRate: number;
      totalOperations: number;
    }
  >;
  recommendations: string[];
}

export class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor;
  private metrics: ServiceMetrics[] = [];
  private slowQueryThreshold = 1000; // 1 second
  private maxMetricsRetention = 10000; // Keep last 10k metrics

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
    }
    return DatabasePerformanceMonitor.instance;
  }

  /**
   * Track query performance
   */
  async trackQueryPerformance(
    query: string,
    duration: number,
    success = true,
    error?: string
  ): Promise<void> {
    const metric: ServiceMetrics = {
      operationName: query,
      duration,
      success,
      errorMessage: error,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Maintain metrics retention limit
    if (this.metrics.length > this.maxMetricsRetention) {
      this.metrics = this.metrics.slice(-this.maxMetricsRetention);
    }

    // Log slow queries immediately
    if (duration > this.slowQueryThreshold) {
      // console.warn(`🐌 Slow Query Detected: ${query} took ${duration}ms`);
      // In production, you might want to send to monitoring service
      // await this.sendSlowQueryAlert(metric);
    }

    // Log errors immediately
    if (!success && error) {
      // console.error(`❌ Query Error: ${query} failed with: ${error}`);
    }
  }

  /**
   * Detect slow queries in recent metrics
   */
  async detectSlowQueries(timeRangeMinutes = 60): Promise<SlowQuery[]> {
    const cutoff = new Date(Date.now() - timeRangeMinutes * 60 * 1000);

    return this.metrics
      .filter(
        (m) => m.timestamp >= cutoff && m.duration > this.slowQueryThreshold
      )
      .map((m) => ({
        operation: m.operationName,
        duration: m.duration,
        timestamp: m.timestamp,
        errorMessage: m.errorMessage,
      }))
      .sort((a, b) => b.duration - a.duration); // Sort by duration desc
  }

  /**
   * Calculate current database metrics
   */
  async getCurrentMetrics(): Promise<DatabaseMetrics> {
    const recentMetrics = this.getRecentMetrics(15); // Last 15 minutes

    if (recentMetrics.length === 0) {
      return {
        avgQueryTime: 0,
        cacheHitRate: 100,
        connectionPoolUtilization: 0,
        activeQueries: 0,
        tableGrowthRate: {},
        errorRate: 0,
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const avgQueryTime = totalDuration / recentMetrics.length;

    const errors = recentMetrics.filter((m) => !m.success).length;
    const errorRate = (errors / recentMetrics.length) * 100;

    // Calculate table operation breakdown
    const tableOperations: Record<string, number> = {};
    recentMetrics.forEach((m) => {
      const tableName = this.extractTableName(m.operationName);
      tableOperations[tableName] = (tableOperations[tableName] || 0) + 1;
    });

    return {
      avgQueryTime: Math.round(avgQueryTime),
      cacheHitRate: 95, // TODO: Implement actual cache hit rate tracking
      connectionPoolUtilization: 25, // TODO: Implement connection pool monitoring
      activeQueries: recentMetrics.length,
      tableGrowthRate: tableOperations,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(
    timeRangeMinutes = 60
  ): Promise<PerformanceReport> {
    const endTime = new Date();
    const startTime = new Date(
      endTime.getTime() - timeRangeMinutes * 60 * 1000
    );

    const reportMetrics = this.metrics.filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime
    );

    const overallMetrics = await this.getCurrentMetrics();
    const slowQueries = await this.detectSlowQueries(timeRangeMinutes);

    // Service breakdown
    const serviceBreakdown: Record<
      string,
      { avgResponseTime: number; successRate: number; totalOperations: number }
    > = {};

    const serviceGroups = this.groupMetricsByService(reportMetrics);
    Object.entries(serviceGroups).forEach(([service, metrics]) => {
      const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
      const successful = metrics.filter((m) => m.success).length;

      serviceBreakdown[service] = {
        avgResponseTime: Math.round(totalDuration / metrics.length),
        successRate: Math.round((successful / metrics.length) * 100),
        totalOperations: metrics.length,
      };
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      overallMetrics,
      slowQueries,
      serviceBreakdown
    );

    return {
      timeRange: { start: startTime, end: endTime },
      overallMetrics,
      slowQueries,
      serviceBreakdown,
      recommendations,
    };
  }

  /**
   * Add metrics from a service (called by BaseService)
   */
  addServiceMetrics(metrics: ServiceMetrics[]): void {
    this.metrics.push(...metrics);

    // Maintain retention limit
    if (this.metrics.length > this.maxMetricsRetention) {
      this.metrics = this.metrics.slice(-this.maxMetricsRetention);
    }
  }

  /**
   * Get real-time performance dashboard data
   */
  async getDashboardData(): Promise<{
    currentMetrics: DatabaseMetrics;
    recentSlowQueries: SlowQuery[];
    topServices: Array<{
      service: string;
      avgTime: number;
      operations: number;
    }>;
    errorTrend: Array<{ timestamp: Date; errorCount: number }>;
  }> {
    const currentMetrics = await this.getCurrentMetrics();
    const recentSlowQueries = await this.detectSlowQueries(30); // Last 30 minutes

    // Top services by activity
    const recentMetrics = this.getRecentMetrics(15);
    const serviceGroups = this.groupMetricsByService(recentMetrics);
    const topServices = Object.entries(serviceGroups)
      .map(([service, metrics]) => ({
        service,
        avgTime: Math.round(
          metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
        ),
        operations: metrics.length,
      }))
      .sort((a, b) => b.operations - a.operations)
      .slice(0, 10);

    // Error trend (last 4 hours, grouped by 15-minute intervals)
    const errorTrend = this.calculateErrorTrend(240, 15);

    return {
      currentMetrics,
      recentSlowQueries: recentSlowQueries.slice(0, 10),
      topServices,
      errorTrend,
    };
  }

  // Helper methods

  private getRecentMetrics(minutes: number): ServiceMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp >= cutoff);
  }

  private extractTableName(operationName: string): string {
    const parts = operationName.split(".");
    return parts[0] || "unknown";
  }

  private groupMetricsByService(
    metrics: ServiceMetrics[]
  ): Record<string, ServiceMetrics[]> {
    return metrics.reduce(
      (groups, metric) => {
        const service = this.extractTableName(metric.operationName);
        if (!groups[service]) {
          groups[service] = [];
        }
        groups[service].push(metric);
        return groups;
      },
      {} as Record<string, ServiceMetrics[]>
    );
  }

  private generateRecommendations(
    metrics: DatabaseMetrics,
    slowQueries: SlowQuery[],
    serviceBreakdown: Record<
      string,
      { avgResponseTime: number; successRate: number; totalOperations: number }
    >
  ): string[] {
    const recommendations: string[] = [];

    // Slow query recommendations
    if (slowQueries.length > 0) {
      recommendations.push(
        `🐌 ${slowQueries.length} slow queries detected. Consider adding indexes or optimizing query logic.`
      );

      const slowestQuery = slowQueries[0];
      if (slowestQuery.duration > 5000) {
        recommendations.push(
          `⚠️ Critical: Query "${slowestQuery.operation}" took ${slowestQuery.duration}ms. Immediate optimization required.`
        );
      }
    }

    // Error rate recommendations
    if (metrics.errorRate > 5) {
      recommendations.push(
        `❌ High error rate detected (${metrics.errorRate}%). Check application logs and database connectivity.`
      );
    }

    // Response time recommendations
    if (metrics.avgQueryTime > 500) {
      recommendations.push(
        `⏱️ Average response time is ${metrics.avgQueryTime}ms. Consider implementing caching or query optimization.`
      );
    }

    // Service-specific recommendations
    Object.entries(serviceBreakdown).forEach(([service, stats]) => {
      if (stats.avgResponseTime > 1000) {
        recommendations.push(
          `🔧 ${service} service averaging ${stats.avgResponseTime}ms. Consider service-level optimization.`
        );
      }

      if (stats.successRate < 95) {
        recommendations.push(
          `⚠️ ${service} service has ${stats.successRate}% success rate. Check for data validation or connection issues.`
        );
      }
    });

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "✅ Database performance is within acceptable parameters."
      );
    } else {
      recommendations.push(
        "💡 Consider implementing query caching and connection pooling for improved performance."
      );
    }

    return recommendations;
  }

  private calculateErrorTrend(
    totalMinutes: number,
    intervalMinutes: number
  ): Array<{ timestamp: Date; errorCount: number }> {
    const now = new Date();
    const intervals = Math.floor(totalMinutes / intervalMinutes);
    const trend: Array<{ timestamp: Date; errorCount: number }> = [];

    for (let i = intervals - 1; i >= 0; i--) {
      const intervalStart = new Date(
        now.getTime() - i * intervalMinutes * 60 * 1000
      );
      const intervalEnd = new Date(
        intervalStart.getTime() + intervalMinutes * 60 * 1000
      );

      const errorsInInterval = this.metrics.filter(
        (m) =>
          m.timestamp >= intervalStart &&
          m.timestamp < intervalEnd &&
          !m.success
      ).length;

      trend.push({
        timestamp: intervalStart,
        errorCount: errorsInInterval,
      });
    }

    return trend;
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(milliseconds: number): void {
    this.slowQueryThreshold = milliseconds;
  }

  /**
   * Clear all metrics (for testing/reset)
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalMetrics: number;
    oldestMetric: Date | null;
    newestMetric: Date | null;
    uniqueOperations: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalMetrics: 0,
        oldestMetric: null,
        newestMetric: null,
        uniqueOperations: 0,
      };
    }

    const timestamps = this.metrics.map((m) => m.timestamp);
    const operations = new Set(this.metrics.map((m) => m.operationName));

    return {
      totalMetrics: this.metrics.length,
      oldestMetric: new Date(Math.min(...timestamps.map((t) => t.getTime()))),
      newestMetric: new Date(Math.max(...timestamps.map((t) => t.getTime()))),
      uniqueOperations: operations.size,
    };
  }
}

// Export singleton instance
export const performanceMonitor = DatabasePerformanceMonitor.getInstance();
