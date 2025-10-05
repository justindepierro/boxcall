import React from "react";

/**
 * Alignment guide lines
 */
export interface AlignmentGuides {
  vertical?: number[];
  horizontal?: number[];
}

/**
 * Guide fade-out state
 */
export interface GuideFadeState {
  guides: AlignmentGuides;
  t0: number;
}

/**
 * Center snap flash state
 */
export interface CenterFlashState {
  x: boolean;
  y: boolean;
  t0: number;
}

/**
 * Field Guides Component
 *
 * Renders alignment guides and center snap flash labels:
 * - Live alignment guides (vertical/horizontal) with fade-in
 * - Fade-out trail when guides disappear
 * - Center snap flash labels ("Center") with fade-out
 *
 * @param alignGuides - Current alignment guide lines
 * @param guideLiveOpacity - Opacity for live guides (fade-in target)
 * @param guideFade - Fade-out state when guides disappear
 * @param guideFadeOpacity - Opacity for fading guides (animated)
 * @param centerFlash - Center snap flash state
 */
export const FieldGuides: React.FC<{
  alignGuides?: AlignmentGuides;
  guideLiveOpacity?: number;
  guideFade?: GuideFadeState;
  guideFadeOpacity?: number;
  centerFlash?: CenterFlashState;
}> = ({
  alignGuides,
  guideLiveOpacity = 0.8,
  guideFade,
  guideFadeOpacity,
  centerFlash,
}) => {
  return (
    <>
      {/* Live alignment guides (with fade-in) */}
      {alignGuides && (
        <g
          pointerEvents="none"
          opacity={guideLiveOpacity}
          style={{ transition: "opacity 120ms ease" }}
        >
          {/* Vertical guides */}
          {alignGuides.vertical?.map((x, i) => (
            <line
              key={`vg${i}`}
              x1={x}
              x2={x}
              y1={0}
              y2={900}
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ))}
          {/* Horizontal guides */}
          {alignGuides.horizontal?.map((y, i) => (
            <line
              key={`hg${i}`}
              x1={0}
              x2={1600}
              y1={y}
              y2={y}
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ))}
        </g>
      )}

      {/* Fade-out trail when guides disappear */}
      {!alignGuides && guideFade && (() => {
        const elapsed = performance.now() - guideFade.t0;
        const op = guideFadeOpacity ?? Math.max(0, 0.6 * (1 - elapsed / 260));
        if (op <= 0) return null;

        return (
          <g pointerEvents="none" opacity={op}>
            {/* Vertical fade-out guides */}
            {guideFade.guides.vertical?.map((x, i) => (
              <line
                key={`vgf${i}`}
                x1={x}
                x2={x}
                y1={0}
                y2={900}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            ))}
            {/* Horizontal fade-out guides */}
            {guideFade.guides.horizontal?.map((y, i) => (
              <line
                key={`hgf${i}`}
                x1={0}
                x2={1600}
                y1={y}
                y2={y}
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            ))}
          </g>
        );
      })()}

      {/* Center snap flash labels */}
      {centerFlash && (() => {
        const elapsed = performance.now() - centerFlash.t0;
        const op = Math.max(0, 0.9 * (1 - elapsed / 800));
        if (op <= 0) return null;

        const nodes: React.ReactNode[] = [];

        // Vertical center label (near top)
        if (centerFlash.x) {
          nodes.push(
            <g key="cxl" pointerEvents="none" opacity={op}>
              <rect
                x={800 - 26}
                y={6}
                width={52}
                height={18}
                rx={9}
                ry={9}
                fill="#0f172a"
                opacity={0.7}
              />
              <text
                x={800}
                y={19}
                fontSize={11}
                fontWeight={700}
                fill="#a7f3d0"
                textAnchor="middle"
              >
                Center
              </text>
            </g>
          );
        }

        // Horizontal center label (near right side)
        if (centerFlash.y) {
          nodes.push(
            <g key="cyl" pointerEvents="none" opacity={op}>
              <rect
                x={1600 - 66}
                y={450 - 9}
                width={60}
                height={18}
                rx={9}
                ry={9}
                fill="#0f172a"
                opacity={0.7}
              />
              <text
                x={1600 - 36}
                y={450 + 4}
                fontSize={11}
                fontWeight={700}
                fill="#a7f3d0"
                textAnchor="middle"
              >
                Center
              </text>
            </g>
          );
        }

        return nodes.length > 0 ? <>{nodes}</> : null;
      })()}
    </>
  );
};
