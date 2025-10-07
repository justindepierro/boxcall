import React from "react";
import { colorTokens } from "../../../../design-system/tokens";
import type { DiagramAnnotation, DiagramAnnotationConnector } from "../types";

/**
 * Player reference for connectors
 */
export interface PlayerRef {
  id: string;
  x: number;
  y: number;
}

/**
 * Field Annotations Component
 *
 * Renders all annotations on the field with:
 * - Connectors (lines between players with arrowheads)
 * - Lines, arrows, dashed lines, dotted lines
 * - Curves (quadratic bezier)
 * - Selection highlights and hover states
 *
 * @param annotations - Array of annotation objects
 * @param players - Array of player objects (for connectors)
 * @param selectedAnnotationId - ID of selected annotation
 * @param hoverAnnotationId - ID of hovered annotation
 * @param showSelectionPulse - Whether to animate selection pulse
 * @param onAnnotationMouseDown - Handler for annotation mouse down
 * @param onAnnotationMouseEnter - Handler for annotation mouse enter
 * @param onAnnotationMouseLeave - Handler for annotation mouse leave
 */
export const FieldAnnotations: React.FC<{
  annotations: DiagramAnnotation[];
  players: PlayerRef[];
  selectedAnnotationId?: string;
  hoverAnnotationId?: string;
  showSelectionPulse?: boolean;
  onAnnotationMouseDown?: (id: string, e: React.MouseEvent) => void;
  onAnnotationMouseEnter?: (id: string, e: React.MouseEvent) => void;
  onAnnotationMouseLeave?: (id: string, e: React.MouseEvent) => void;
}> = ({
  annotations,
  players,
  selectedAnnotationId,
  hoverAnnotationId,
  showSelectionPulse = true,
  onAnnotationMouseDown,
  onAnnotationMouseEnter,
  onAnnotationMouseLeave,
}) => {
  /**
   * Render arrowhead at endpoint
   */
  const renderArrowHead = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    direction: "start" | "end"
  ) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    const size = 10;

    if (direction === "end") {
      const px = x2 - ux * size;
      const py = y2 - uy * size;
      const leftX = px + -uy * (size * 0.6);
      const leftY = py + ux * (size * 0.6);
      const rightX = px - -uy * (size * 0.6);
      const rightY = py - ux * (size * 0.6);
      return (
        <polygon
          points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={color}
        />
      );
    } else {
      const px = x1 + ux * size;
      const py = y1 + uy * size;
      const leftX = px + uy * (size * 0.6);
      const leftY = py + -ux * (size * 0.6);
      const rightX = px - uy * (size * 0.6);
      const rightY = py - -ux * (size * 0.6);
      return (
        <polygon
          points={`${x1},${y1} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={color}
        />
      );
    }
  };

  return (
    <g id="field-annotations">
      {annotations.map((a) => {
        const color = a.color || colorTokens.gray[900];
        const width = a.width || 3;
        const isSelected = selectedAnnotationId === a.id;
        const isHover = hoverAnnotationId === a.id;
        const highlightStroke =
          isSelected || isHover
            ? isSelected
              ? colorTokens.blue[500]
              : colorTokens.cyan[400]
            : undefined;

        const commonEvents = {
          onMouseEnter: (e: React.MouseEvent) => {
            e.stopPropagation();
            onAnnotationMouseEnter?.(a.id, e);
          },
          onMouseLeave: (e: React.MouseEvent) => {
            e.stopPropagation();
            onAnnotationMouseLeave?.(a.id, e);
          },
        };

        // Connector annotation (line between two players)
        if (a.type === "connector") {
          const conn = a as DiagramAnnotationConnector;
          const from = players.find((p) => p.id === conn.fromPlayerId);
          const to = players.find((p) => p.id === conn.toPlayerId);
          if (!from || !to) return null;

          const x1 = (from.x / 100) * 1600;
          const y1 = (from.y / 100) * 900;
          const x2 = (to.x / 100) * 1600;
          const y2 = (to.y / 100) * 900;
          const ah = a.arrowHead ?? "end";

          return (
            <g
              key={a.id}
              className="cursor-move"
              onMouseDown={(e) => {
                e.stopPropagation();
                onAnnotationMouseDown?.(a.id, e);
              }}
              {...commonEvents}
            >
              {/* Selection pulse */}
              {isSelected && showSelectionPulse && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={colorTokens.blue[500]}
                  strokeWidth={width + 10}
                  opacity={0.35}
                  strokeLinecap="round"
                  className="animate-selectedBreathe"
                />
              )}
              {/* Highlight */}
              {highlightStroke && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={highlightStroke}
                  strokeWidth={width + 8}
                  opacity={0.25}
                  strokeLinecap="round"
                />
              )}
              {/* Main line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={width}
              />
              {/* Arrowheads */}
              {(ah === "end" || ah === "both") &&
                renderArrowHead(x1, y1, x2, y2, color, "end")}
              {(ah === "start" || ah === "both") &&
                renderArrowHead(x1, y1, x2, y2, color, "start")}
            </g>
          );
        }

        // Line-like annotations (line, arrow, dashed, dotted, curve)
        const pts = "points" in a ? a.points : [];
        const abs = pts
          .map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`)
          .join(" ");

        // Curve annotation (quadratic bezier)
        if (a.type === "curve" && pts.length >= 3) {
          const [s, c, e] = pts;
          const d = `M ${(s.x / 100) * 1600},${(s.y / 100) * 900} Q ${(c.x / 100) * 1600},${(c.y / 100) * 900} ${(e.x / 100) * 1600},${(e.y / 100) * 900}`;

          return (
            <g
              key={a.id}
              className="cursor-move"
              onMouseDown={(e) => {
                e.stopPropagation();
                onAnnotationMouseDown?.(a.id, e);
              }}
              {...commonEvents}
            >
              {/* Selection pulse */}
              {isSelected && showSelectionPulse && (
                <path
                  d={d}
                  fill="none"
                  stroke={colorTokens.blue[500]}
                  strokeWidth={width + 10}
                  opacity={0.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-selectedBreathe"
                />
              )}
              {/* Highlight */}
              {highlightStroke && (
                <path
                  d={d}
                  fill="none"
                  stroke={highlightStroke}
                  strokeWidth={width + 8}
                  opacity={0.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {/* Main curve */}
              <path d={d} fill="none" stroke={color} strokeWidth={width} />
            </g>
          );
        }

        // Polyline annotations (line, arrow, dashed, dotted)
        return (
          <g
            key={a.id}
            className="cursor-move"
            onMouseDown={(e) => {
              e.stopPropagation();
              onAnnotationMouseDown?.(a.id, e);
            }}
            {...commonEvents}
          >
            {/* Selection pulse */}
            {isSelected && showSelectionPulse && (
              <polyline
                points={abs}
                fill="none"
                stroke={colorTokens.blue[500]}
                strokeWidth={width + 10}
                opacity={0.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-selectedBreathe"
              />
            )}
            {/* Highlight */}
            {highlightStroke && (
              <polyline
                points={abs}
                fill="none"
                stroke={highlightStroke}
                strokeWidth={width + 8}
                opacity={0.25}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Main polyline */}
            <polyline
              points={abs}
              fill="none"
              stroke={color}
              strokeWidth={width}
              strokeDasharray={
                a.type === "dashed"
                  ? "8 6"
                  : a.type === "dotted"
                    ? "2 6"
                    : undefined
              }
            />
            {/* Arrowhead for arrow type */}
            {a.type === "arrow" &&
              pts.length >= 2 &&
              (() => {
                const p2 = pts[pts.length - 1];
                const p1 = pts[pts.length - 2];
                const x2 = (p2.x / 100) * 1600;
                const y2 = (p2.y / 100) * 900;
                const x1 = (p1.x / 100) * 1600;
                const y1 = (p1.y / 100) * 900;
                const ah = a.arrowHead ?? "end";
                const heads: React.ReactElement[] = [];
                if (ah === "end" || ah === "both") {
                  heads.push(
                    <React.Fragment key="end">
                      {renderArrowHead(x1, y1, x2, y2, color, "end")}
                    </React.Fragment>
                  );
                }
                if (ah === "start" || ah === "both") {
                  heads.push(
                    <React.Fragment key="start">
                      {renderArrowHead(x1, y1, x2, y2, color, "start")}
                    </React.Fragment>
                  );
                }
                return heads;
              })()}
          </g>
        );
      })}
    </g>
  );
};
