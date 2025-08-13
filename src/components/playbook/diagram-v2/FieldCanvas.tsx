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

  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    offX: number;
    offY: number;
  } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const pctToAbs = (xPct: number, yPct: number) => ({
    x: (xPct / 100) * 1600,
    y: (yPct / 100) * 900,
  });
  const absToPct = (x: number, y: number) => ({
    x: (x / 1600) * 100,
    y: (y / 900) * 100,
  });

  const handleMouseDownPlayer = (e: React.MouseEvent, id: string) => {
    const player = doc.players.find((p) => p.id === id);
    if (!player) return;
    if (state.ui.tool === "route" && !state.ui.drawing) {
      dispatch({
        type: "START_ROUTE",
        playerId: id,
        start: { x: player.x, y: player.y },
      });
    }
    const abs = pctToAbs(player.x, player.y);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      offX: abs.x,
      offY: abs.y,
    };
  };

  const snapPct = useCallback(
    (val: number) => {
      if (!state.ui.snap) return val;
      const g = state.ui.snapGrid || 1;
      return Math.round(val / g) * g;
    },
    [state.ui.snap, state.ui.snapGrid]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (panRef.current) {
        const dx = e.clientX - panRef.current.startX;
        const dy = e.clientY - panRef.current.startY;
        dispatch({ type: "PAN", dx, dy });
        panRef.current.startX = e.clientX; // incremental
        panRef.current.startY = e.clientY;
        return;
      }
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const nx = dragRef.current.offX + dx;
      const ny = dragRef.current.offY + dy;
      const pct = absToPct(nx, ny);
      dispatch({
        type: "MOVE_PLAYER",
        id: dragRef.current.id,
        x: Math.min(100, Math.max(0, snapPct(pct.x))),
        y: Math.min(100, Math.max(0, snapPct(pct.y))),
      });
    },
    [dispatch, snapPct]
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (state.ui.tool === "pan") {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: state.ui.panX,
        panY: state.ui.panY,
      };
    }
  };
  const endPan = () => {
    panRef.current = null;
  };
  useEffect(() => {
    window.addEventListener("mouseup", endPan);
    return () => window.removeEventListener("mouseup", endPan);
  }, []);

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
    const x = snapPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = snapPct(((e.clientY - rect.top) / rect.height) * 100);
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
    const x = snapPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = snapPct(((e.clientY - rect.top) / rect.height) * 100);
    dispatch({ type: "PREVIEW_ROUTE", point: { x, y } });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state.ui.drawing) {
        dispatch({ type: "CANCEL_ROUTE" });
      }
      // Undo / Redo
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        if (e.shiftKey) dispatch({ type: "REDO" });
        else dispatch({ type: "UNDO" });
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [dispatch, state.ui.drawing]);

  return (
    <div className={className}>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 900"
        className="w-full h-full rounded-md shadow-inner select-none"
        role="img"
        aria-label="Diagram field"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMoveCanvas}
        onMouseDown={handleCanvasMouseDown}
      >
        <g
          transform={`translate(${state.ui.panX} ${state.ui.panY}) scale(${state.ui.zoom})`}
        >
          {(() => {
            const theme = doc.field.theme || "classic";
            if (theme === "classic") {
              return (
                <rect
                  x={0}
                  y={0}
                  width={1600}
                  height={900}
                  fill="#0f5e2e" /* softer green */
                  fillOpacity={0.82}
                />
              );
            }
            if (theme === "mono-light") {
              return (
                <rect
                  x={0}
                  y={0}
                  width={1600}
                  height={900}
                  fill="#f4f5f6" /* off white */
                  fillOpacity={1}
                />
              );
            }
            if (theme === "mono-dark") {
              return (
                <rect
                  x={0}
                  y={0}
                  width={1600}
                  height={900}
                  fill="#1d1f20" /* soft near-black */
                  fillOpacity={1}
                />
              );
            }
          })()}
          {/* Line of Scrimmage (LOS) at y = proportional to backYards buffer (centered conceptually at middle) */}
          {(() => {
            const totalSlice = doc.field.backYards + doc.field.forwardYards; // vertical coverage in yards
            const losRatio = doc.field.backYards / totalSlice; // portion from top
            const losY = losRatio * 900;
            return (
              <line
                x1={0}
                x2={1600}
                y1={losY}
                y2={losY}
                stroke="#fef08a"
                strokeWidth={8}
                strokeLinecap="round"
                opacity={0.9}
              />
            );
          })()}
          {/* Yard lines based on vertical orientation slice (always vertical downfield) */}
          {doc.field.showYardLines &&
            Array.from({ length: doc.field.forwardYards / 5 + 1 }).map(
              (_, i) => (
                <line
                  key={i}
                  x1={0}
                  x2={1600}
                  y1={i * (900 / (doc.field.forwardYards / 5))}
                  y2={i * (900 / (doc.field.forwardYards / 5))}
                  stroke="#065f46"
                  strokeWidth={i % 2 === 0 ? 3 : 1}
                  opacity={0.6}
                />
              )
            )}
          {/* Hash marks simplified for vertical view */}
          {doc.field.showHashMarks &&
            (() => {
              // College style approx hash groupings every yard within visible forward slice
              const marks = [] as React.ReactNode[];
              for (let yrd = 0; yrd <= doc.field.forwardYards; yrd++) {
                const y = (yrd / doc.field.forwardYards) * 900;
                marks.push(
                  <g key={`h${yrd}`}>
                    {" "}
                    {/* Left & Right hashes plus middle guideline if selected */}
                    <rect
                      x={1600 * 0.3 - 3}
                      y={y - 1}
                      width={6}
                      height={3}
                      fill="#064e3b"
                      opacity={0.55}
                    />
                    <rect
                      x={1600 * 0.7 - 3}
                      y={y - 1}
                      width={6}
                      height={3}
                      fill="#064e3b"
                      opacity={0.55}
                    />
                    {/* Optional midpoint reference for middle hash placement */}
                    {doc.field.ballHash === "middle" && (
                      <rect
                        x={1600 * 0.5 - 2}
                        y={y - 1}
                        width={4}
                        height={3}
                        fill="#065f46"
                        opacity={0.35}
                      />
                    )}
                  </g>
                );
              }
              return marks;
            })()}
          {/* Yard numbers stacked (approx every 5 yards) below LOS area */}
          {Array.from({ length: doc.field.forwardYards / 5 + 1 }).map((_, i) => {
            const y = i * (900 / (doc.field.forwardYards / 5));
            if (i === 0) return null;
            const yardValue = i * 5;
            if (yardValue === 50) return null;
            const theme = doc.field.theme || "classic";
            const baseColor = theme === "classic" ? "#ecfdf5" : theme === "mono-light" ? "#444" : "#e5e7eb";
            const opacity = theme === "classic" ? 0.24 : 0.32;
            const leftX = 1600 * 0.18; // beyond left hash (~0.3)
            const rightX = 1600 * 0.82; // beyond right hash (~0.7)
            return (
              <g key={`yn${i}`} opacity={opacity}>
                <text
                  x={leftX}
                  y={y + 40}
                  fontSize={46}
                  fontWeight={700}
                  fill={baseColor}
                  textAnchor="middle"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {yardValue}
                </text>
                <text
                  x={rightX}
                  y={y + 40}
                  fontSize={46}
                  fontWeight={700}
                  fill={baseColor}
                  textAnchor="middle"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {yardValue}
                </text>
              </g>
            );
          })}
          {/* Ball marker at selected hash */}
          {(() => {
            const totalSlice = doc.field.backYards + doc.field.forwardYards;
            const losRatio = doc.field.backYards / totalSlice;
            const losY = losRatio * 900;
            const hashX =
              doc.field.ballHash === "left"
                ? 1600 * 0.3
                : doc.field.ballHash === "right"
                  ? 1600 * 0.7
                  : 800;
            return (
              <circle
                cx={hashX}
                cy={losY - 16}
                r={14}
                fill="#fef3c7"
                stroke="#92400e"
                strokeWidth={4}
              />
            );
          })()}
          {/* Players */}
          {doc.players
            .filter((p) => doc.field.showDefensePlayers || p.side !== "D")
            .map((p) => {
              const isCenter = p.label === "C" || p.role === "C";
              return (
                <g
                  key={p.id}
                  transform={`translate(${(p.x / 100) * 1600},${(p.y / 100) * 900})`}
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    onPlayerMouseDown?.(p.id, e);
                    handleMouseDownPlayer(e, p.id);
                  }}
                >
                  {isCenter ? (
                    <rect
                      x={-24}
                      y={-16}
                      width={48}
                      height={32}
                      rx={4}
                      ry={4}
                      fill={p.color || "#1e3a8a"}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ) : (
                    <ellipse
                      rx={26}
                      ry={18}
                      fill={p.color || (p.side === "D" ? "#b91c1c" : "#1e3a8a")}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )}
                  {doc.field.showPlayerLabels && (
                    <text
                      x={0}
                      y={5}
                      fontSize={isCenter ? 20 : 20}
                      fontWeight={600}
                      fill="#fff"
                      textAnchor="middle"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
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
        </g>
      </svg>
    </div>
  );
};
