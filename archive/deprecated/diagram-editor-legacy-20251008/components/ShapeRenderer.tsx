import React from "react";
import type { Shape } from "../types/types";

interface ShapeRendererProps {
  shape: Shape;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({ shape }) => {
  switch (shape.type) {
    case "line":
      return (
        <line
          x1={shape.points[0].x}
          y1={shape.points[0].y}
          x2={shape.points[1].x}
          y2={shape.points[1].y}
          stroke={shape.color}
          strokeWidth={shape.width}
        />
      );
    case "arrow":
      return (
        <g>
          <defs>
            <marker
              id={`arrowhead-${shape.id}`}
              markerWidth="10"
              markerHeight="7"
              refX="0"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={shape.color} />
            </marker>
          </defs>
          <line
            x1={shape.points[0].x}
            y1={shape.points[0].y}
            x2={shape.points[1].x}
            y2={shape.points[1].y}
            stroke={shape.color}
            strokeWidth={shape.width}
            markerEnd={`url(#arrowhead-${shape.id})`}
          />
        </g>
      );
    case "freehand":
      return (
        <path
          d={shape.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
            .join(" ")}
          stroke={shape.color}
          strokeWidth={shape.width}
          fill="none"
        />
      );
    default:
      return null;
  }
};
