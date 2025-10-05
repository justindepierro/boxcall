import React from "react";
import { colorTokens } from "../../../../design-system/tokens";

/**
 * Route point
 */
export interface RoutePoint {
  x: number; // percentage
  y: number; // percentage
}

/**
 * Route segment
 */
export interface RouteSegment {
  id: string;
  type: "line" | "curve";
  points: RoutePoint[];
}

/**
 * Route data
 */
export interface Route {
  id: string;
  segments: RouteSegment[];
}

/**
 * Attach preview for route endpoints
 */
export interface AttachPreview {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  targetId?: string;
}

/**
 * Field Routes Component
 *
 * Renders all routes on the field with:
 * - Route paths (lines and curves)
 * - Route points (draggable)
 * - Attach preview when dragging endpoints near players
 *
 * @param routes - Array of route objects
 * @param attachPreview - Optional attach preview state
 * @param onRoutePointDrag - Handler for route point dragging
 */
export const FieldRoutes: React.FC<{
  routes: Route[];
  attachPreview?: AttachPreview;
  onRoutePointMouseDown?: (
    routeId: string,
    segIndex: number,
    pointIndex: number,
    e: React.MouseEvent
  ) => void;
}> = ({ routes, attachPreview, onRoutePointMouseDown }) => {
  return (
    <g id="field-routes">
      {/* Attach preview dashed line */}
      {attachPreview && (
        <line
          x1={attachPreview.x1}
          y1={attachPreview.y1}
          x2={attachPreview.x2}
          y2={attachPreview.y2}
          stroke={colorTokens.emerald[500]}
          strokeWidth={3}
          strokeDasharray="6 4"
          opacity={0.7}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* Existing routes */}
      {routes.map((r) => (
        <g key={r.id}>
          {r.segments.map((s, si) => {
            const pts = s.points.map((p) => ({
              x: (p.x / 100) * 1600,
              y: (p.y / 100) * 900,
            }));

            // Quadratic curve rendering
            if (s.type === "curve" && pts.length >= 3) {
              const d = `M ${pts[0].x},${pts[0].y} Q ${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y}`;
              return (
                <g key={s.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke={colorTokens.blue[600]}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pts.map((p, pi) => {
                    const isEndpoint = pi === 0 || pi === pts.length - 1;
                    const radius = pi === 1 ? 10 : isEndpoint ? 12 : 10;
                    const fill = pi === 1 ? colorTokens.emerald[400] : colorTokens.amber[400];
                    return (
                      <circle
                        key={pi}
                        cx={p.x}
                        cy={p.y}
                        r={radius}
                        fill={fill}
                        stroke={colorTokens.gray[800]}
                        strokeWidth={2}
                        className="cursor-move"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          onRoutePointMouseDown?.(r.id, si, pi, e);
                        }}
                      />
                    );
                  })}
                </g>
              );
            }

            // Default line polyline rendering
            return (
              <g key={s.id}>
                <polyline
                  points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke={colorTokens.blue[600]}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pts.map((p, pi) => {
                  const isEndpoint = pi === 0 || pi === pts.length - 1;
                  return (
                    <circle
                      key={pi}
                      cx={p.x}
                      cy={p.y}
                      r={isEndpoint ? 12 : 10}
                      fill={colorTokens.amber[400]}
                      stroke={colorTokens.gray[800]}
                      strokeWidth={2}
                      className="cursor-move"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        onRoutePointMouseDown?.(r.id, si, pi, e);
                      }}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
};
