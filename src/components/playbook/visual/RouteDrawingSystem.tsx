import React, { useState } from "react";
import type { PlayerPosition } from "./formationConstants";

interface RoutePoint {
  x: number;
  y: number;
  timing?: number; // Timing in seconds
  type?: "straight" | "curve" | "cut" | "break";
}

interface Route {
  id: string;
  playerId: string;
  points: RoutePoint[];
  routeType: string; // "Slant", "Out", "Go", "Post", "Curl", etc.
  depth: number; // Route depth in yards
  timing: number; // Total route timing
  color: string;
}

interface RouteDrawingSystemProps {
  players: PlayerPosition[];
  routes?: Route[];
  onRouteUpdate?: (playerId: string, route: Route) => void;
  fieldWidth: number;
  fieldHeight: number;
  isDrawing?: boolean;
  selectedPlayerId?: string;
}

// Common route types with default patterns
const ROUTE_TYPES = {
  Slant: { depth: 5, timing: 1.5, color: "#3b82f6" },
  Out: { depth: 8, timing: 2.0, color: "#22c55e" },
  Go: { depth: 20, timing: 3.5, color: "#ef4444" },
  Post: { depth: 12, timing: 2.5, color: "#f59e0b" },
  Curl: { depth: 10, timing: 2.2, color: "#8b5cf6" },
  Comeback: { depth: 12, timing: 2.8, color: "#06b6d4" },
  Dig: { depth: 12, timing: 2.7, color: "#84cc16" },
  Corner: { depth: 15, timing: 3.0, color: "#f97316" },
  Hitch: { depth: 6, timing: 1.8, color: "#ec4899" },
  Fade: { depth: 18, timing: 3.2, color: "#6366f1" },
} as const;

export const RouteDrawingSystem: React.FC<RouteDrawingSystemProps> = ({
  players: _players,
  routes = [],
  onRouteUpdate: _onRouteUpdate,
  fieldWidth: _fieldWidth,
  fieldHeight: _fieldHeight,
  isDrawing = false,
  selectedPlayerId,
}) => {
  const [_drawingRoute, _setDrawingRoute] = useState<RoutePoint[]>([]);
  const [selectedRouteType, _setSelectedRouteType] =
    useState<keyof typeof ROUTE_TYPES>("Slant");

  // Generate route path SVG
  const generateRoutePath = (points: RoutePoint[]): string => {
    if (points.length < 2) return "";

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      if (point.type === "curve" && i > 0 && i < points.length - 1) {
        // Create smooth curve using quadratic bezier
        const prev = points[i - 1];
        const cp1x = prev.x + (point.x - prev.x) * 0.5;
        const cp1y = prev.y + (point.y - prev.y) * 0.5;
        path += ` Q ${cp1x} ${cp1y} ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    }

    return path;
  };

  // Get route color based on type
  const getRouteColor = (routeType: string): string => {
    return (
      ROUTE_TYPES[routeType as keyof typeof ROUTE_TYPES]?.color || "#64748b"
    );
  };

  // Use provided routes or empty array for demo
  const currentRoutes = routes;

  return (
    <g className="route-drawing-system">
      {/* Route paths */}
      {currentRoutes.map((route: Route) => (
        <g key={route.id} className="route">
          {/* Route path */}
          <path
            d={generateRoutePath(route.points)}
            stroke={route.color}
            strokeWidth="3"
            fill="none"
            strokeDasharray={
              isDrawing && selectedPlayerId === route.playerId ? "5,5" : "none"
            }
            className="transition-all duration-200"
          />

          {/* Route points */}
          {route.points.map((point: RoutePoint, index: number) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={route.color}
              stroke="#ffffff"
              strokeWidth="2"
              className={`transition-all duration-200 ${
                isDrawing ? "cursor-crosshair" : ""
              }`}
            />
          ))}

          {/* Route direction arrow */}
          {route.points.length >= 2 && (
            <g>
              {(() => {
                const lastPoint = route.points[route.points.length - 1];
                const secondLastPoint = route.points[route.points.length - 2];
                const angle = Math.atan2(
                  lastPoint.y - secondLastPoint.y,
                  lastPoint.x - secondLastPoint.x
                );
                const arrowLength = 8;
                const arrowAngle = Math.PI / 6;

                return (
                  <g transform={`translate(${lastPoint.x}, ${lastPoint.y})`}>
                    <path
                      d={`M 0 0 L ${-arrowLength * Math.cos(angle - arrowAngle)} ${-arrowLength * Math.sin(angle - arrowAngle)} M 0 0 L ${-arrowLength * Math.cos(angle + arrowAngle)} ${-arrowLength * Math.sin(angle + arrowAngle)}`}
                      stroke={route.color}
                      strokeWidth="2"
                      fill="none"
                    />
                  </g>
                );
              })()}
            </g>
          )}

          {/* Route label */}
          {route.points.length > 0 && (
            <text
              x={route.points[0].x}
              y={route.points[0].y - 20}
              textAnchor="middle"
              fontSize="10"
              fill={route.color}
              className="font-semibold"
            >
              {route.routeType}
            </text>
          )}
        </g>
      ))}

      {/* Drawing route preview */}
      {isDrawing && _drawingRoute.length > 0 && (
        <g className="drawing-route">
          <path
            d={generateRoutePath(_drawingRoute)}
            stroke={getRouteColor(selectedRouteType)}
            strokeWidth="3"
            fill="none"
            strokeDasharray="3,3"
            opacity="0.7"
          />
          {_drawingRoute.map((point: RoutePoint, index: number) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={getRouteColor(selectedRouteType)}
              opacity="0.7"
            />
          ))}
        </g>
      )}
    </g>
  );
};
