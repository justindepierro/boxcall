/**
 * Route Analytics Dashboard
 *
 * Comprehensive analytics dashboard showing route performance by situational context.
 * Displays which routes perform best by down/distance/field position with data-driven insights.
 */

import { useState, useMemo } from "react";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import { useExecutionAnalytics } from "../hooks/useExecutionAnalytics";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@lib/utils/cn";

interface RouteAnalyticsDashboardProps {
  diagramId?: string;
  formationId?: string;
  className?: string;
}

interface RoutePerformance {
  routeId: string;
  routeLabel?: string;
  totalExecutions: number;
  successRate: number;
  successCount: number;
  averageYards?: number;
  situationalBreakdown: {
    down: number;
    distance: number;
    fieldPosition: string;
    executions: number;
    successRate: number;
  }[];
}

export function RouteAnalyticsDashboard({
  diagramId,
  formationId,
  className,
}: RouteAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );
  const [selectedDown, setSelectedDown] = useState<number | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"successRate" | "executions" | "yards">(
    "successRate"
  );
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  // Calculate time range
  const timeRangeFilter = useMemo(() => {
    const now = new Date();
    const days = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      all: 365 * 2, // 2 years
    }[timeRange];

    return {
      start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
      end: now,
    };
  }, [timeRange]);

  const { routeAnalytics, situationalAnalytics, isLoading, executions } =
    useExecutionAnalytics(diagramId, formationId, timeRangeFilter);

  // Transform data for the dashboard
  const routePerformanceData = useMemo(() => {
    const routeMap = new Map<string, RoutePerformance>();

    // Process route analytics
    routeAnalytics.forEach((route, routeId) => {
      routeMap.set(routeId, {
        routeId,
        routeLabel: `Route ${routeId.slice(-4)}`, // Simple label for now
        totalExecutions: route.totalExecutions,
        successRate: route.successRate,
        successCount: route.successCount,
        averageYards: route.averageYardsGained,
        situationalBreakdown: [],
      });
    });

    // Add situational breakdown
    situationalAnalytics.forEach((situation) => {
      situation.routeAnalytics.forEach((route) => {
        const existing = routeMap.get(route.routeId);
        if (existing) {
          existing.situationalBreakdown.push({
            down: situation.down,
            distance: situation.distance,
            fieldPosition: situation.fieldPosition,
            executions: route.totalExecutions,
            successRate: route.successRate,
          });
        }
      });
    });

    return Array.from(routeMap.values());
  }, [routeAnalytics, situationalAnalytics]);

  // Filter and sort routes
  const filteredRoutes = useMemo(() => {
    let filtered = routePerformanceData;

    // Apply situational filters
    if (selectedDown !== null) {
      filtered = filtered.filter((route) =>
        route.situationalBreakdown.some((s) => s.down === selectedDown)
      );
    }

    if (selectedDistance !== null) {
      filtered = filtered.filter((route) =>
        route.situationalBreakdown.some(
          (s) => `${s.down}-${s.distance}` === selectedDistance
        )
      );
    }

    // Sort routes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "successRate":
          return b.successRate - a.successRate;
        case "executions":
          return b.totalExecutions - a.totalExecutions;
        case "yards":
          return (b.averageYards || 0) - (a.averageYards || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [routePerformanceData, selectedDown, selectedDistance, sortBy]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return "text-success-600 bg-success-50";
    if (rate >= 0.6) return "text-yellow-600 bg-yellow-50";
    if (rate >= 0.4) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getFieldPositionColor = (position: string) => {
    switch (position) {
      case "red-zone":
        return "bg-red-100 text-red-800";
      case "goal-line":
        return "bg-purple-100 text-purple-800";
      case "plus-territory":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-content-primary flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Route Analytics Dashboard
            </h2>
            <p className="text-content-secondary mt-1">
              Data-driven insights for route performance by situational context
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 rounded-md bg-surface-secondary border border-border text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-jade-600" />
              <span className="text-sm font-medium">Total Executions</span>
            </div>
            <div className="text-2xl font-bold">{executions.length}</div>
          </div>

          <div className="bg-surface-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success-600" />
              <span className="text-sm font-medium">Avg Success Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {executions.length > 0
                ? `${((executions.filter((e: any) => e.result === "success").length / executions.length) * 100).toFixed(1)}%`
                : "0%"}
            </div>
          </div>

          <div className="bg-surface-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Routes Analyzed</span>
            </div>
            <div className="text-2xl font-bold">
              {routePerformanceData.length}
            </div>
          </div>

          <div className="bg-surface-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Last Updated</span>
            </div>
            <div className="text-sm font-bold">
              {executions.length > 0
                ? formatDistanceToNow(new Date(executions[0].created_at), {
                    addSuffix: true,
                  })
                : "Never"}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <select
            value={selectedDown || ""}
            onChange={(e) =>
              setSelectedDown(e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-3 py-2 rounded-md bg-surface-secondary border border-border text-sm"
          >
            <option value="">All Downs</option>
            <option value="1">1st Down</option>
            <option value="2">2nd Down</option>
            <option value="3">3rd Down</option>
            <option value="4">4th Down</option>
          </select>

          <select
            value={selectedDistance || ""}
            onChange={(e) => setSelectedDistance(e.target.value || null)}
            className="px-3 py-2 rounded-md bg-surface-secondary border border-border text-sm"
          >
            <option value="">All Distances</option>
            <option value="1-10">1st & 10</option>
            <option value="2-5">2nd & 5</option>
            <option value="3-3">3rd & 3</option>
            <option value="3-7">3rd & 7</option>
            <option value="4-1">4th & 1</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-md bg-surface-secondary border border-border text-sm"
          >
            <option value="successRate">Sort by Success Rate</option>
            <option value="executions">Sort by Executions</option>
            <option value="yards">Sort by Yards</option>
          </select>
        </div>
      </Card>

      {/* Route Performance Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Route Performance Analysis
        </h3>

        {filteredRoutes.length === 0 ? (
          <div className="text-center py-8 text-content-secondary">
            No route data available for the selected filters
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRoutes.map((route) => (
              <div
                key={route.routeId}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{route.routeLabel}</h4>
                    <Badge
                      className={cn(
                        "text-xs",
                        getSuccessRateColor(route.successRate)
                      )}
                    >
                      {(route.successRate * 100).toFixed(1)}% success
                    </Badge>
                    <span className="text-sm text-content-secondary">
                      {route.totalExecutions} executions
                    </span>
                    {route.averageYards && (
                      <span className="text-sm text-content-secondary">
                        {route.averageYards.toFixed(1)} avg yards
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedRoute(
                        expandedRoute === route.routeId ? null : route.routeId
                      )
                    }
                  >
                    {expandedRoute === route.routeId ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Success Rate Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Success Rate</span>
                    <span>{(route.successRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-surface-secondary rounded-full h-2">
                    <div
                      className="bg-jade-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${route.successRate * 100}%` }}
                    />
                  </div>
                </div>

                {/* Situational Breakdown */}
                {expandedRoute === route.routeId && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-sm font-medium mb-3">
                      Situational Performance
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {route.situationalBreakdown.map((situation, index) => (
                        <div
                          key={index}
                          className="bg-surface-secondary p-3 rounded-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              className={cn(
                                "text-xs",
                                getFieldPositionColor(situation.fieldPosition)
                              )}
                            >
                              {situation.fieldPosition}
                            </Badge>
                            <span className="text-xs text-content-secondary">
                              {situation.executions} exec
                            </span>
                          </div>
                          <div className="text-sm">
                            {situation.down}st & {situation.distance}
                          </div>
                          <div className="text-lg font-semibold text-jade-600">
                            {(situation.successRate * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
