import React from "react";

/**
 * Field Minimap Component
 *
 * Renders a miniature overview map in the bottom-right corner showing:
 * - Field background (theme-colored)
 * - Viewport rectangle (shows current visible area)
 * - Interactive drag to reposition viewport
 *
 * Hidden when fully zoomed out (zoom <= 1.0)
 *
 * @param panX - Current pan X offset
 * @param panY - Current pan Y offset
 * @param zoom - Current zoom level
 * @param theme - Field theme (classic, mono-light, mono-dark)
 * @param onMinimapDrag - Handler for minimap drag interaction
 */
export const FieldMinimap: React.FC<{
  panX: number;
  panY: number;
  zoom: number;
  theme?: string;
  onMinimapDrag?: (miniElement: HTMLDivElement, clientX: number, clientY: number) => void;
}> = ({
  panX,
  panY,
  zoom,
  theme = "classic",
  onMinimapDrag,
}) => {
  const miniDragRef = React.useRef({ dragging: false });
  const showMini = zoom > 1.001; // hide when fully zoomed out
  if (!showMini) return null;

  const MINI_W = 160;
  const border = 1;

  // Compute viewport rect in world coords
  const widthWorld = 1600 / zoom;
  const heightWorld = 900 / zoom;
  let xWorld = -panX / zoom;
  let yWorld = -panY / zoom;
  xWorld = Math.max(0, Math.min(1600 - widthWorld, xWorld));
  yWorld = Math.max(0, Math.min(900 - heightWorld, yWorld));

  // Scale to minimap
  const scale = MINI_W / 1600; // 0.1
  const rx = xWorld * scale;
  const ry = yWorld * scale;
  const rw = widthWorld * scale;
  const rh = heightWorld * scale;

  // Theme colors
  const bg =
    theme === "mono-dark"
      ? "#111827"
      : theme === "mono-light"
        ? "#f9fafb"
        : "#064e3b";
  const frame =
    theme === "mono-dark"
      ? "#6b7280"
      : theme === "mono-light"
        ? "#9ca3af"
        : "#10b981";

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    miniDragRef.current.dragging = true;
    onMinimapDrag?.(e.currentTarget, e.clientX, e.clientY);

    const move = (ev: MouseEvent) => {
      if (!miniDragRef.current.dragging) return;
      onMinimapDrag?.(e.currentTarget, ev.clientX, ev.clientY);
    };
    const up = () => {
      miniDragRef.current.dragging = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      className="absolute bottom-spacing-xs right-spacing-xs select-none"
      style={{
        width: MINI_W + 2 * border,
        height: MINI_W * 0.5625 + 2 * border,
      }}
      onMouseDown={onMouseDown}
      role="presentation"
      aria-hidden
    >
      <svg
        width={MINI_W + 2 * border}
        height={MINI_W * 0.5625 + 2 * border}
        viewBox={`0 0 ${MINI_W + 2 * border} ${MINI_W * 0.5625 + 2 * border}`}
        style={{ display: "block", cursor: "pointer" }}
      >
        {/* Frame */}
        <rect
          x={0}
          y={0}
          width={MINI_W + 2 * border}
          height={MINI_W * 0.5625 + 2 * border}
          rx={6}
          fill="#ffffff"
          opacity={0.8}
        />
        <g transform={`translate(${border} ${border})`}>
          {/* Field background */}
          <rect
            x={0}
            y={0}
            width={MINI_W}
            height={MINI_W * 0.5625}
            fill={bg}
            opacity={theme === "classic" ? 0.6 : 0.8}
          />
          {/* Viewport rectangle */}
          <rect
            x={rx}
            y={ry}
            width={rw}
            height={rh}
            fill="none"
            stroke={frame}
            strokeWidth={2}
          />
        </g>
      </svg>
    </div>
  );
};
