/**
 * Database Health Monitoring Service
 *
 * Provides proactive monitoring with:
 * - Real-time health checks
 * - Performance metrics collection
 * - Alerting for issues
 * - Trend analysis
 * - Automated diagnostics
 */

import { dbConnectivity } from "./DatabaseConnectivityService";
import { debug, error as logError, warn } from "../../utils/logger";

interface HealthMetrics {
  timestamp: Date;
  responseTime: number;
  isHealthy: boolean;
  activeConnections: number;
  errorRate: number;
  slowQueries: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: HealthMetrics) => boolean;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  cooldownMinutes: number;
}

interface Alert {
  id: string;
  ruleId: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metrics: HealthMetrics;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export class DatabaseHealthMonitor {
  private static instance: DatabaseHealthMonitor;
  private metrics: HealthMetrics[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private maxMetricsHistory = 1000;
  private alertCooldowns = new Map<string, Date>();

  static getInstance(): DatabaseHealthMonitor {
    if (!DatabaseHealthMonitor.instance) {
      DatabaseHealthMonitor.instance = new DatabaseHealthMonitor();
    }
    return DatabaseHealthMonitor.instance;
  }

  constructor() {
    this.initializeAlertRules();
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: "connection_unhealthy",
        name: "Database Connection Unhealthy",
        condition: (metrics) => !metrics.isHealthy,
        severity: "critical",
        message: "Database connection is unhealthy",
        cooldownMinutes: 5,
      },
      {
        id: "high_response_time",
        name: "High Response Time",
        condition: (metrics) => metrics.responseTime > 5000, // 5 seconds
        severity: "high",
        message: "Database response time is critically high",
        cooldownMinutes: 10,
      },
      {
        id: "high_error_rate",
        name: "High Error Rate",
        condition: (metrics) => metrics.errorRate > 0.1, // 10% error rate
        severity: "high",
        message: "Database error rate is above threshold",
        cooldownMinutes: 15,
      },
      {
        id: "slow_queries",
        name: "Slow Queries Detected",
        condition: (metrics) => metrics.slowQueries > 5,
        severity: "medium",
        message: "Multiple slow queries detected",
        cooldownMinutes: 30,
      },
      {
        id: "connection_overload",
        name: "Connection Overload",
        condition: (metrics) => metrics.activeConnections > 20,
        severity: "medium",
        message: "High number of active connections detected",
        cooldownMinutes: 20,
      },
    ];
  }

  /**
   * Start health monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      warn("Health monitoring already running");
      return;
    }

    this.isMonitoring = true;
    debug("🏥 Starting database health monitoring...");

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logError("Health monitoring error:", error);
      }
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    debug("⏹️ Stopped database health monitoring");
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = performance.now();

    try {
      // Get connectivity metrics
      const connectivityMetrics = dbConnectivity.getMetrics();

      // Perform a simple query to test response time
      const client = await dbConnectivity.getClient();
      const queryStartTime = performance.now();

      const { error } = await client.from("profiles").select("id").limit(1);

      const queryEndTime = performance.now();
      const responseTime = queryEndTime - queryStartTime;

      // Calculate error rate from recent metrics
      const recentMetrics = this.metrics.slice(-10);
      const errorRate =
        recentMetrics.length > 0
          ? recentMetrics.filter((m) => !m.isHealthy).length /
            recentMetrics.length
          : 0;

      // Get slow queries count (this would need integration with query monitoring)
      const slowQueries = 0; // Placeholder - would need actual slow query tracking

      const metrics: HealthMetrics = {
        timestamp: new Date(),
        responseTime,
        isHealthy: !error && connectivityMetrics.circuitBreakerState !== "OPEN",
        activeConnections: connectivityMetrics.activeConnections,
        errorRate,
        slowQueries,
        // Memory and CPU would need system monitoring integration
      };

      this.addMetrics(metrics);
      this.checkAlerts(metrics);

      const totalTime = performance.now() - startTime;
      debug(`✅ Health check completed in ${totalTime.toFixed(2)}ms`);
    } catch (error) {
      const totalTime = performance.now() - startTime;

      const errorMetrics: HealthMetrics = {
        timestamp: new Date(),
        responseTime: totalTime,
        isHealthy: false,
        activeConnections: 0,
        errorRate: 1,
        slowQueries: 0,
      };

      this.addMetrics(errorMetrics);
      this.checkAlerts(errorMetrics);

      logError(`❌ Health check failed in ${totalTime.toFixed(2)}ms:`, error);
    }
  }

  /**
   * Add metrics to history
   */
  private addMetrics(metrics: HealthMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Check metrics against alert rules
   */
  private checkAlerts(metrics: HealthMetrics): void {
    const now = new Date();

    for (const rule of this.alertRules) {
      // Check cooldown
      const lastAlert = this.alertCooldowns.get(rule.id);
      if (
        lastAlert &&
        now.getTime() - lastAlert.getTime() < rule.cooldownMinutes * 60 * 1000
      ) {
        continue;
      }

      // Check condition
      if (rule.condition(metrics)) {
        this.createAlert(rule, metrics);
        this.alertCooldowns.set(rule.id, now);
      }
    }
  }

  /**
   * Create and store alert
   */
  private createAlert(rule: AlertRule, metrics: HealthMetrics): void {
    const alert: Alert = {
      id: `${rule.id}_${Date.now()}`,
      ruleId: rule.id,
      severity: rule.severity,
      message: rule.message,
      metrics,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log alert
    this.logAlert(alert);
  }

  /**
   * Log alert with appropriate severity
   */
  private logAlert(alert: Alert): void {
    const logMessage = `🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.message}`;

    switch (alert.severity) {
      case "critical":
        logError(logMessage, {
          alertId: alert.id,
          responseTime: alert.metrics.responseTime,
          timestamp: alert.timestamp,
        });
        break;
      case "high":
        logError(logMessage, {
          alertId: alert.id,
          responseTime: alert.metrics.responseTime,
          timestamp: alert.timestamp,
        });
        break;
      case "medium":
        warn(logMessage, {
          alertId: alert.id,
          responseTime: alert.metrics.responseTime,
          timestamp: alert.timestamp,
        });
        break;
      case "low":
        console.info(logMessage, {
          alertId: alert.id,
          responseTime: alert.metrics.responseTime,
          timestamp: alert.timestamp,
        });
        break;
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      debug(`✅ Alert resolved: ${alert.message}`);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): {
    isHealthy: boolean;
    metrics: HealthMetrics | null;
    activeAlerts: Alert[];
    uptime: number;
  } {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const activeAlerts = this.alerts.filter((a) => !a.resolved);

    // Calculate uptime (percentage of healthy checks in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter((m) => m.timestamp > oneHourAgo);
    const healthyChecks = recentMetrics.filter((m) => m.isHealthy).length;
    const uptime =
      recentMetrics.length > 0
        ? (healthyChecks / recentMetrics.length) * 100
        : 100;

    return {
      isHealthy: latestMetrics?.isHealthy ?? false,
      metrics: latestMetrics || null,
      activeAlerts,
      uptime,
    };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(hours: number = 24): HealthMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp > cutoff);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(hours: number = 24): {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    trend: "improving" | "degrading" | "stable";
  } {
    const metrics = this.getMetricsHistory(hours);

    if (metrics.length === 0) {
      return {
        averageResponseTime: 0,
        errorRate: 0,
        uptime: 100,
        trend: "stable",
      };
    }

    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const errorRate =
      metrics.filter((m) => !m.isHealthy).length / metrics.length;
    const uptime =
      (metrics.filter((m) => m.isHealthy).length / metrics.length) * 100;

    // Simple trend analysis (compare first half vs second half)
    const midpoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midpoint);
    const secondHalf = metrics.slice(midpoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, m) => sum + m.responseTime, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, m) => sum + m.responseTime, 0) /
      secondHalf.length;

    let trend: "improving" | "degrading" | "stable" = "stable";
    if (secondHalfAvg < firstHalfAvg * 0.9) {
      trend = "improving";
    } else if (secondHalfAvg > firstHalfAvg * 1.1) {
      trend = "degrading";
    }

    return {
      averageResponseTime: avgResponseTime,
      errorRate,
      uptime,
      trend,
    };
  }

  /**
   * Run diagnostics
   */
  async runDiagnostics(): Promise<{
    connectivity: boolean;
    performance: boolean;
    errors: string[];
    recommendations: string[];
  }> {
    const errors: string[] = [];
    const recommendations: string[] = [];

    // Test connectivity
    try {
      const client = await dbConnectivity.getClient();
      const { error } = await client.from("profiles").select("count").single();
      if (error) throw error;
    } catch (error) {
      errors.push(`Connectivity test failed: ${error}`);
      recommendations.push(
        "Check database connection and network connectivity"
      );
    }

    // Test performance
    const trends = this.getPerformanceTrends(1); // Last hour
    if (trends.averageResponseTime > 2000) {
      errors.push(
        `Poor performance: ${trends.averageResponseTime.toFixed(2)}ms average response time`
      );
      recommendations.push("Optimize database queries and consider indexing");
    }

    if (trends.errorRate > 0.05) {
      errors.push(`High error rate: ${(trends.errorRate * 100).toFixed(2)}%`);
      recommendations.push("Investigate and fix recurring errors");
    }

    // Check for active alerts
    const activeAlerts = this.alerts.filter((a) => !a.resolved);
    if (activeAlerts.length > 0) {
      errors.push(`${activeAlerts.length} active alerts`);
      recommendations.push("Review and resolve active alerts");
    }

    return {
      connectivity:
        errors.filter((e) => e.includes("Connectivity")).length === 0,
      performance: trends.averageResponseTime < 2000 && trends.errorRate < 0.05,
      errors,
      recommendations,
    };
  }
}

// Export singleton instance
export const databaseHealthMonitor = DatabaseHealthMonitor.getInstance();
