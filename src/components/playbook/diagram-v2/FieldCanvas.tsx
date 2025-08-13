import React, { useRef, useEffect, useCallback } from "react";
import { useDiagramEditor } from "./context";

// Simple SVG field canvas with zoom/pan transforms (placeholder)
export const FieldCanvas: React.FC<{
  className?: string;
  onPlayerMouseDown?: (id: string, e: React.MouseEvent) => void;
}> = ({ className, onPlayerMouseDown }) => {
  const { state, dispatch } = useDiagramEditor();
  const { doc } = state;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const dragRef = useRef<{ id: string; startX: number; startY: number; offX: number; offY: number } | null>(null);

  const pctToAbs = (xPct: number, yPct: number) => ({ x: (xPct / 100) * 1600, y: (yPct / 100) * 900 });
  const absToPct = (x: number, y: number) => ({ x: (x / 1600) * 100, y: (y / 900) * 100 });

  const handleMouseDownPlayer = (e: React.MouseEvent, id: string) => {
    const player = doc.players.find((p) => p.id === id);
    if (!player) return;
    if (state.ui.tool === "route" && !state.ui.drawing) {
      dispatch({ type: "START_ROUTE", playerId: id, start: { x: player.x, y: player.y } });
    }
    const abs = pctToAbs(player.x, player.y);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, offX: abs.x, offY: abs.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const nx = dragRef.current.offX + dx;
    const ny = dragRef.current.offY + dy;
    const pct = absToPct(nx, ny);
    dispatch({
      type: "MOVE_PLAYER",
      id: dragRef.current.id,
      x: Math.min(100, Math.max(0, pct.x)),
      y: Math.min(100, Math.max(0, pct.y)),
    });
  }, [dispatch]);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (state.ui.tool !== "route") return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (!state.ui.drawing) return;
    // If shift or right-click (?) finalize
    if (e.detail >= 2) {
      dispatch({ type: "ADD_ROUTE_POINT", point: { x, y } });
      dispatch({ type: "COMMIT_ROUTE" });
    } else {
      dispatch({ type: "ADD_ROUTE_POINT", point: { x, y } });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<SVGSVGElement>) => {
    if (state.ui.tool !== "route" || !state.ui.drawing) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    dispatch({ type: "PREVIEW_ROUTE", point: { x, y } });
  };

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900"
        className="w-full h-full bg-emerald-700/90 rounded-md shadow-inner select-none"
        role="img"
        aria-label="Diagram field"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMoveCanvas}
      >
        {/* Yard lines (every 5) */}
        {doc.field.showYardLines &&
          Array.from({ length: 21 }).map((_, i) => (
            <line
              key={i}
              x1={i * (1600 / 20)}
              x2={i * (1600 / 20)}
              y1={0}
              y2={900}
              stroke="#065f46"
              strokeWidth={i % 2 === 0 ? 3 : 1}
              opacity={0.6}
            />
          ))}
        {/* Hash marks placeholder */}
        {doc.field.showHashMarks &&
          Array.from({ length: 21 }).map((_, i) => (
            <g key={`h${i}`}>
              {Array.from({ length: 20 }).map((__, j) => (
                <rect
                  key={j}
                  x={i * (1600 / 20) - 2}
                  y={j * (900 / 20) + 10}
                  width={4}
                  height={2}
                  fill="#047857"
                  opacity={0.5}
                />
              ))}
            </g>
          ))}
        {/* Players */}
        {doc.players.map((p) => (
          <g
            key={p.id}
            transform={`translate(${(p.x / 100) * 1600},${(p.y / 100) * 900})`}
            className="cursor-pointer"
            onMouseDown={(e) => {
              onPlayerMouseDown?.(p.id, e);
              handleMouseDownPlayer(e, p.id);
            }}
          >
            <circle
              r={20}
              fill={p.color || "#1e3a8a"}
              stroke="#fff"
              strokeWidth={2}
            />
            {doc.field.showPlayerLabels && (
              <text
                x={0}
                y={5}
                fontSize={26}
                fontWeight={600}
                fill="#fff"
                textAnchor="middle"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
        {/* In-progress drawing polyline */}
        {state.ui.drawing && (
          <polyline
            points={[
              ...state.ui.drawing.anchorPoints,
              ...(state.ui.drawing.preview ? [state.ui.drawing.preview] : []),
            ]
              .map((p) => `${(p.x / 100) * 1600},${(p.y / 100) * 900}`)
              .join(" ")}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8 6"
          />
        )}
      </svg>
    </div>
  );
};
