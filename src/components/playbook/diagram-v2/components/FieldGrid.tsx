import React from "react";
import { colorTokens } from "../../../../design-system/tokens";

/**
 * Field configuration
 */
export interface FieldConfig {
  theme?: "classic" | "mono-light" | "mono-dark";
  forwardYards: number;
  losYards?: number;
  showRedZone?: boolean;
  showYardLines?: boolean;
  showHashMarks?: boolean;
  hashLayout?: "highschool" | "college" | "nfl";
  ballHash?: "left" | "middle" | "right";
}

/**
 * Field Grid Component
 *
 * Renders the football field background with:
 * - Field background (themed)
 * - Line of scrimmage (LOS)
 * - Red zone highlight
 * - Yard lines (every 5 yards)
 * - Hash marks (layout-specific)
 * - Yard numbers
 * - Optional grid overlay
 *
 * @param field - Field configuration
 * @param showGridOverlay - Whether to show the snap grid overlay
 * @param snapGrid - Grid interval for overlay (1 = 1%)
 */
export const FieldGrid: React.FC<{
  field: FieldConfig;
  showGridOverlay?: boolean;
  snapGrid?: number;
}> = ({ field, showGridOverlay, snapGrid = 1 }) => {
  const theme = field.theme || "classic";
  const losYards = field.losYards ?? 20;

  // Field background based on theme
  const renderBackground = () => {
    if (theme === "classic") {
      return (
        <rect
          x={0}
          y={0}
          width={1600}
          height={900}
          fill="url(#fieldGradient)"
        />
      );
    }
    if (theme === "mono-light") {
      return <rect x={0} y={0} width={1600} height={900} fill={colorTokens.gray[100]} />;
    }
    if (theme === "mono-dark") {
      return <rect x={0} y={0} width={1600} height={900} fill={colorTokens.gray[900]} />;
    }
    return null;
  };

  // Line of scrimmage
  const renderLOS = () => {
    const y = (losYards / field.forwardYards) * 900;
    return (
      <rect
        x={0}
        y={y - 3}
        width={1600}
        height={6}
        fill={colorTokens.emerald[900]}
        opacity={0.95}
        rx={2}
      />
    );
  };

  // Red zone highlight
  const renderRedZone = () => {
    if (!field.showRedZone || field.forwardYards < 20) return null;
    return (
      <rect
        x={0}
        y={0}
        width={1600}
        height={(20 / field.forwardYards) * 900}
        fill={colorTokens.red[500]}
        opacity={0.08}
      />
    );
  };

  // Yard lines
  const renderYardLines = () => {
    if (!field.showYardLines) return null;
    return Array.from({ length: field.forwardYards / 5 + 1 }).map((_, i) => (
      <line
        key={i}
        x1={0}
        x2={1600}
        y1={i * (900 / (field.forwardYards / 5))}
        y2={i * (900 / (field.forwardYards / 5))}
        stroke={colorTokens.emerald[800]}
        strokeWidth={i % 2 === 0 ? 3 : 1}
        opacity={0.6}
      />
    ));
  };

  // Hash marks
  const renderHashMarks = () => {
    if (!field.showHashMarks) return null;

    const layout = field.hashLayout || "highschool";
    const FT = 160;
    const PXPF = 1600 / FT;
    const hashDistances: Record<string, [number, number]> = {
      highschool: [53 + 4 / 12, FT - (53 + 4 / 12)],
      college: [60, FT - 60],
      nfl: [70 + 9 / 12, FT - (70 + 9 / 12)],
    };
    const [lFt, rFt] = hashDistances[layout];
    const lX = lFt * PXPF;
    const rX = rFt * PXPF;
    const mid = 800;

    const hashColor =
      theme === "mono-dark"
        ? colorTokens.gray[700]
        : theme === "mono-light"
          ? colorTokens.gray[400]
          : colorTokens.emerald[900];
    const midColor = theme === "classic" ? colorTokens.emerald[800] : hashColor;

    const marks: React.ReactNode[] = [];
    const w = 10;
    const h = 3;
    const sideOffsetFt = 3;
    const sideCenterX = sideOffsetFt * PXPF;
    const sideRightCenterX = 1600 - sideCenterX;

    for (let yrd = 0; yrd <= field.forwardYards; yrd++) {
      const y = (yrd / field.forwardYards) * 900;
      marks.push(
        <g key={yrd}>
          {/* Left hash */}
          <rect
            x={lX - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            fill={hashColor}
            opacity={0.55}
          />
          {/* Right hash */}
          <rect
            x={rX - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            fill={hashColor}
            opacity={0.55}
          />
          {/* Middle hash (if enabled) */}
          {field.ballHash === "middle" && (
            <rect
              x={mid - 3}
              y={y - h / 2}
              width={6}
              height={h}
              fill={midColor}
              opacity={0.35}
            />
          )}
          {/* Left sideline hash */}
          <rect
            x={sideCenterX - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            fill={hashColor}
            opacity={0.45}
          />
          {/* Right sideline hash */}
          <rect
            x={sideRightCenterX - w / 2}
            y={y - h / 2}
            width={w}
            height={h}
            fill={hashColor}
            opacity={0.45}
          />
        </g>
      );
    }

    return <g>{marks}</g>;
  };

  // Yard numbers
  const renderYardNumbers = () => {
    const baseColor =
      theme === "classic"
        ? colorTokens.emerald[50]
        : theme === "mono-light"
          ? colorTokens.gray[700]
          : colorTokens.gray[200];
    const opacity = theme === "classic" ? 0.24 : 0.32;
    const feetFromSideline = 9 * 3;
    const leftX = feetFromSideline * 10;
    const rightX = 1600 - leftX;
    const halfSpacing = 24;

    return Array.from({ length: field.forwardYards / 5 + 1 }).map((_, i) => {
      const y = i * (900 / (field.forwardYards / 5));
      if (i === 0) return null;
      const yardValue = i * 5;
      if (yardValue === 50) return null;

      const numberY = y + 26;
      const digits = String(yardValue).split("");

      return (
        <g key={i} opacity={opacity}>
          {/* Left side numbers */}
          <g
            transform={`translate(${leftX},${numberY}) rotate(90)`}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {digits.map((d, di) => (
              <text
                key={di}
                fontSize={50}
                fontWeight={700}
                fill={baseColor}
                textAnchor="middle"
                dominantBaseline="middle"
                x={di === 0 ? -halfSpacing : halfSpacing}
              >
                {d}
              </text>
            ))}
          </g>
          {/* Right side numbers */}
          <g
            transform={`translate(${rightX},${numberY}) rotate(-90)`}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {digits.map((d, di) => (
              <text
                key={di}
                fontSize={50}
                fontWeight={700}
                fill={baseColor}
                textAnchor="middle"
                dominantBaseline="middle"
                x={di === 0 ? -halfSpacing : halfSpacing}
              >
                {d}
              </text>
            ))}
          </g>
        </g>
      );
    });
  };

  // Grid overlay
  const renderGridOverlay = () => {
    if (!showGridOverlay) return null;

    const g = Math.max(1, snapGrid);
    const color =
      theme === "mono-dark"
        ? colorTokens.gray[500]
        : theme === "mono-light"
          ? colorTokens.gray[400]
          : colorTokens.emerald[500];
    const opacity = theme === "classic" ? 0.2 : 0.25;
    const stepX = (1600 * g) / 100;
    const stepY = (900 * g) / 100;
    const nodes: React.ReactNode[] = [];

    // Vertical lines
    for (let x = 0; x <= 1600; x += stepX) {
      nodes.push(
        <line
          key={`gv-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={900}
          stroke={color}
          strokeWidth={1}
          opacity={opacity}
          strokeDasharray="4 6"
          style={{ pointerEvents: "none" }}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= 900; y += stepY) {
      nodes.push(
        <line
          key={`gh-${y}`}
          x1={0}
          y1={y}
          x2={1600}
          y2={y}
          stroke={color}
          strokeWidth={1}
          opacity={opacity}
          strokeDasharray="4 6"
          style={{ pointerEvents: "none" }}
        />
      );
    }

    return <g>{nodes}</g>;
  };

  return (
    <g id="field-grid">
      {renderBackground()}
      {renderLOS()}
      {renderRedZone()}
      {renderYardLines()}
      {renderHashMarks()}
      {renderYardNumbers()}
      {renderGridOverlay()}
    </g>
  );
};
