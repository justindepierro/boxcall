/**
 * ExecutionHeatMap Component
 *
 * Overlays success rate heat maps on diagram routes and formations
 * Shows execution performance data visually
 */

import React from "react";
import { useExecutionAnalytics } from "../hooks/useExecutionAnalytics";

interface ExecutionHeatMapProps {
  diagramId?: string;
  formationId?: string;
  /** Function to convert diagram coordinates to screen coordinates */
  coordinateToScreen: (x: number, y: number) => { x: number; y: number };
  /** Route positions for overlay rendering */
  routePositions?: Array<{
    routeId: string;
    waypoints: Array<{ x: number; y: number }>;
  }>;
  /** Opacity of the heat map overlay */
  opacity?: number;
  /** Whether to show success rates as percentages */
  showLabels?: boolean;
}

export const ExecutionHeatMap: React.FC<ExecutionHeatMapProps> = ({
  diagramId,
  formationId,
  coordinateToScreen,
  routePositions = [],
  opacity = 0.7,
  showLabels = true,
}) => {
  const { routeAnalytics, isLoading } = useExecutionAnalytics(
    diagramId,
    formationId
  );

  if (isLoading || routeAnalytics.size === 0) {
    return null;
  }

  // Get color for success rate (red = low, yellow = medium, green = high)
  const getHeatColor = (successRate: number): string => {
    if (successRate >= 0.8) return "#22c55e"; // green-500
    if (successRate >= 0.6) return "#eab308"; // yellow-500
    if (successRate >= 0.4) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  // Get opacity based on execution count (more executions = more opaque)
  const getExecutionOpacity = (totalExecutions: number): number => {
    const baseOpacity = Math.min(totalExecutions / 10, 1); // Max opacity at 10+ executions
    return baseOpacity * opacity;
  };

  return (
    <g className="execution-heat-map">
      {routePositions.map((route) => {
        const analytics = routeAnalytics.get(route.routeId);
        if (!analytics || analytics.totalExecutions === 0) return null;

        const color = getHeatColor(analytics.successRate);
        const routeOpacity = getExecutionOpacity(analytics.totalExecutions);

        // Create a path from waypoints for the heat overlay
        const pathData = route.waypoints
          .map((point, index) => {
            const screen = coordinateToScreen(point.x, point.y);
            return `${index === 0 ? "M" : "L"} ${screen.x} ${screen.y}`;
          })
          .join(" ");

        // Calculate midpoint for label placement
        const midIndex = Math.floor(route.waypoints.length / 2);
        const midPoint = route.waypoints[midIndex];
        const midScreen = coordinateToScreen(midPoint.x, midPoint.y);

        return (
          <g key={`heat-${route.routeId}`}>
            {/* Heat overlay path */}
            <path
              d={pathData}
              stroke={color}
              strokeWidth="4"
              fill="none"
              strokeOpacity={routeOpacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="heat-route-overlay"
              style={{
                filter: "blur(1px)", // Soft glow effect
              }}
            />

            {/* Success rate label */}
            {showLabels && analytics.totalExecutions >= 3 && (
              <text
                x={midScreen.x}
                y={midScreen.y - 8}
                textAnchor="middle"
                fill={color}
                fontSize="10"
                fontWeight="bold"
                className="heat-label"
                style={{
                  filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
                  userSelect: "none",
                }}
              >
                {Math.round(analytics.successRate * 100)}%
              </text>
            )}

            {/* Execution count indicator */}
            {showLabels && (
              <text
                x={midScreen.x}
                y={midScreen.y + 12}
                textAnchor="middle"
                fill="rgba(255,255,255,0.8)"
                fontSize="8"
                className="execution-count"
                style={{
                  filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.7))",
                  userSelect: "none",
                }}
              >
                {analytics.totalExecutions} reps
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g className="heat-map-legend" transform="translate(10, 10)">
        <rect
          x="0"
          y="0"
          width="120"
          height="60"
          fill="rgba(0,0,0,0.8)"
          rx="4"
          className="legend-background"
        />

        <text
          x="8"
          y="16"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          className="legend-title"
        >
          Success Rate
        </text>

        {/* Color indicators */}
        <g transform="translate(8, 22)">
          <rect x="0" y="0" width="12" height="8" fill="#ef4444" rx="2" />
          <text x="16" y="6" fill="white" fontSize="8">
            0-39%
          </text>

          <rect x="0" y="10" width="12" height="8" fill="#f97316" rx="2" />
          <text x="16" y="16" fill="white" fontSize="8">
            40-59%
          </text>

          <rect x="0" y="20" width="12" height="8" fill="#eab308" rx="2" />
          <text x="16" y="26" fill="white" fontSize="8">
            60-79%
          </text>

          <rect x="0" y="30" width="12" height="8" fill="#22c55e" rx="2" />
          <text x="16" y="36" fill="white" fontSize="8">
            80-100%
          </text>
        </g>
      </g>
    </g>
  );
};

export default ExecutionHeatMap;
