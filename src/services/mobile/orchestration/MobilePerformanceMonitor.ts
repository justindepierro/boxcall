/**
 * Mobile Performance Monitor Service
 * 
 * Handles performance monitoring, status checks, and recommendation generation.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import { MobilePerformanceService } from "../MobilePerformanceService";
import { MobileCalendarService } from "../MobileCalendarService";
import type { PerformanceDashboard } from "../types/PerformanceTypes";

/**
 * Service for monitoring mobile app performance
 */
export class MobilePerformanceMonitor {
  /**
   * Get comprehensive mobile app performance status
   */
  static async getPerformanceStatus(): Promise<{
    overall: "excellent" | "good" | "fair" | "poor";
    dashboard: {
      renderTime: number;
      memoryUsage: number;
      batteryImpact: number;
    };
    calendarMetrics: {
      loadTime: number;
      scrollPerformance: number;
      renderEfficiency: number;
    };
    recommendations: string[];
  }> {
    try {
      // Get performance dashboard from service
      const performanceDashboard = await MobilePerformanceService.getPerformanceDashboard();

      // Get calendar performance metrics
      const calendarState = MobileCalendarService.getState();
      const calendarMetrics = calendarState?.performanceMetrics;

      // Create structured dashboard data
      const dashboard = {
        renderTime: performanceDashboard?.rendering?.renderTime || 16.7,
        memoryUsage: performanceDashboard?.memory?.usedMemory || 0,
        batteryImpact: performanceDashboard?.battery?.currentLevel || 100,
      };

      // Create structured calendar metrics
      const metrics = {
        loadTime: calendarMetrics?.renderTime || 0,
        scrollPerformance: calendarMetrics?.scrollFPS || 60,
        renderEfficiency: calendarMetrics?.memoryUsage || 0,
      };

      // Generate recommendations
      const recommendations = await this.generateOverallRecommendations(performanceDashboard);

      return {
        overall: performanceDashboard?.overall?.status || "good",
        dashboard,
        calendarMetrics: metrics,
        recommendations,
      };
    } catch (error) {
      console.error("Failed to get performance status:", error);
      return {
        overall: "poor",
        dashboard: {
          renderTime: 33.3,
          memoryUsage: 0,
          batteryImpact: 0,
        },
        calendarMetrics: {
          loadTime: 0,
          scrollPerformance: 0,
          renderEfficiency: 0,
        },
        recommendations: ["Unable to assess performance - service unavailable"],
      };
    }
  }

  /**
   * Generate overall performance recommendations
   */
  private static async generateOverallRecommendations(
    dashboard: PerformanceDashboard | null
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (!dashboard) {
      recommendations.push("Unable to assess performance - dashboard unavailable");
      return recommendations;
    }

    if (dashboard.overall?.score < 70) {
      recommendations.push("Consider switching to performance mode");
    }

    if (dashboard.battery?.currentLevel < 30) {
      recommendations.push("Enable battery saver mode to extend usage");
    }

    if (dashboard.memory?.usedMemory && dashboard.memory?.totalMemory) {
      if (dashboard.memory.usedMemory / dashboard.memory.totalMemory > 0.8) {
        recommendations.push("Clear caches to free memory");
      }
    }

    if (dashboard.rendering?.frameRate < 30) {
      recommendations.push("Reduce visual effects for smoother performance");
    }

    if (recommendations.length === 0) {
      recommendations.push("Performance is optimal");
    }

    return recommendations;
  }
}
