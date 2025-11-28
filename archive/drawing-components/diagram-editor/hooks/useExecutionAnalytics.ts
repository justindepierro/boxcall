/**
 * useExecutionAnalytics Hook
 *
 * Aggregates execution data for heat maps and analytics
 * Provides success rates by route, formation, and situational context
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ExecutionResult } from "../../../../types/session";

interface ExecutionData {
  id: string;
  result: ExecutionResult;
  yards_gained?: number;
  route_executions?: Array<{
    route_id?: string;
    routeId?: string;
    result: ExecutionResult;
    notes?: string;
    executed_at?: string;
  }>;
  diagram_data?: {
    id: string;
    type: string;
    version: number;
  };
  down?: number;
  distance?: number;
  yard_line?: number;
  created_at: string;
}

export interface RouteAnalytics {
  routeId: string;
  totalExecutions: number;
  successRate: number; // 0-1
  successCount: number;
  failureCount: number;
  neutralCount: number;
  skippedCount: number;
  averageYardsGained?: number;
  yardsGained: number[]; // Temporary array for calculation
}

export interface FormationAnalytics {
  formationId: string;
  totalExecutions: number;
  successRate: number;
  routeAnalytics: RouteAnalytics[];
}

export interface SituationalAnalytics {
  down: number;
  distance: number;
  fieldPosition: "red-zone" | "midfield" | "plus-territory" | "goal-line";
  totalExecutions: number;
  successRate: number;
  successCount: number; // Add this property
  routeAnalytics: RouteAnalytics[];
}

export const useExecutionAnalytics = (
  diagramId?: string,
  formationId?: string,
  timeRange?: { start: Date; end: Date }
) => {
  // Fetch execution data from Supabase
  const { data: executions, isLoading } = useQuery<ExecutionData[]>({
    queryKey: ["execution-analytics", diagramId, formationId, timeRange],
    queryFn: async () => {
      // TODO: Implement actual query when play_executions table is created
      // For now, return mock data
      return [] as ExecutionData[];
    },
    enabled: !!(diagramId || formationId), // Only run if we have a filter
  });

  // Aggregate route-level analytics
  const routeAnalytics = useMemo(() => {
    if (!executions) return new Map<string, RouteAnalytics>();

    const analytics = new Map<string, RouteAnalytics>();

    executions.forEach((execution) => {
      if (!execution.route_executions) return;

      execution.route_executions.forEach((routeExec: any) => {
        const routeId = routeExec.route_id || routeExec.routeId;
        if (!routeId) return;

        const existing = analytics.get(routeId) || {
          routeId,
          totalExecutions: 0,
          successCount: 0,
          failureCount: 0,
          neutralCount: 0,
          skippedCount: 0,
          successRate: 0,
          yardsGained: [] as number[], // Explicitly type as number array
        };

        existing.totalExecutions++;

        switch (routeExec.result) {
          case "success":
            existing.successCount++;
            break;
          case "failure":
            existing.failureCount++;
            break;
          case "neutral":
            existing.neutralCount++;
            break;
          case "skipped":
            existing.skippedCount++;
            break;
        }

        if (execution.yards_gained && routeExec.result === "success") {
          existing.yardsGained.push(execution.yards_gained);
        }

        analytics.set(routeId, existing);
      });
    });

    // Calculate success rates and averages
    analytics.forEach((route) => {
      route.successRate =
        route.totalExecutions > 0
          ? route.successCount / route.totalExecutions
          : 0;

      if (route.yardsGained.length > 0) {
        route.averageYardsGained =
          route.yardsGained.reduce((a, b) => a + b, 0) /
          route.yardsGained.length;
      }

      // Remove the yardsGained array as it's not needed in the final result
      delete (route as any).yardsGained;
    });

    return analytics;
  }, [executions]);

  // Aggregate formation-level analytics
  const formationAnalytics = useMemo(() => {
    if (!executions) return null;

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(
      (e) => e.result === "success"
    ).length;
    const successRate =
      totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;

    return {
      formationId: formationId || "unknown",
      totalExecutions,
      successRate,
      routeAnalytics: Array.from(routeAnalytics.values()),
    };
  }, [executions, formationId, routeAnalytics]);

  // Aggregate situational analytics
  const situationalAnalytics = useMemo(() => {
    if (!executions) return [];

    const situational = new Map<string, SituationalAnalytics>();

    executions.forEach((execution) => {
      if (!execution.down || !execution.distance || !execution.yard_line)
        return;

      const fieldPosition = getFieldPosition(execution.yard_line);
      const key = `${execution.down}-${execution.distance}-${fieldPosition}`;

      const existing = situational.get(key) || {
        down: execution.down,
        distance: execution.distance,
        fieldPosition,
        totalExecutions: 0,
        successRate: 0,
        successCount: 0,
        routeAnalytics: [],
      };

      existing.totalExecutions++;
      if (execution.result === "success") {
        existing.successCount++;
      }

      situational.set(key, existing);
    });

    // Calculate success rates
    situational.forEach((sit) => {
      sit.successRate =
        sit.totalExecutions > 0 ? sit.successCount / sit.totalExecutions : 0;
      // Add route analytics for this situation (simplified)
      sit.routeAnalytics = Array.from(routeAnalytics.values()).slice(0, 5); // Top 5 routes
    });

    return Array.from(situational.values());
  }, [executions, routeAnalytics]);

  return {
    routeAnalytics,
    formationAnalytics,
    situationalAnalytics,
    isLoading,
    executions: executions || [],
  };
};

// Helper function to determine field position
function getFieldPosition(
  yardLine: number
): "red-zone" | "midfield" | "plus-territory" | "goal-line" {
  if (yardLine >= 80) return "red-zone";
  if (yardLine >= 60) return "plus-territory";
  if (yardLine <= 20) return "goal-line";
  return "midfield";
}
