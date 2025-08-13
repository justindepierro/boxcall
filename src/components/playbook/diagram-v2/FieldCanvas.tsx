import React, { useRef, useEffect, useCallback, useState } from "react";
import { useDiagramEditor } from "./context";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";

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
    id: string; // primary dragged id
    startX: number;
    startY: number;
    moved: boolean;
    // For group drag: snapshot of original positions in absolute px
    originals: { id: string; xAbs: number; yAbs: number }[];
  } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const selectionDragRef = useRef<{
    startX: number;
    startY: number;
  } | null>(null);
  const nudgeBatchRef = useRef<{ events: number; playersMoved: number; timer: number | null }>({
    events: 0,
    playersMoved: 0,
    timer: null,
  });
  const [selectionBox, setSelectionBox] = useState<null | {
    x: number;
    y: number;
    w: number;
    h: number;
  }>(null);

  const pctToAbs = (xPct: number, yPct: number) => ({
    x: (xPct / 100) * 1600,
    y: (yPct / 100) * 900,
  });
  const absToPct = (x: number, y: number) => ({
    x: (x / 1600) * 100,
    y: (y / 900) * 100,
  });

  // Map client mouse event to SVG world coordinates (0..1600 x 0..900), accounting for pan/zoom
  const clientToWorld = useCallback(
    (evt: { clientX: number; clientY: number }) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      // Position within the SVG's viewBox space
      const xView = ((evt.clientX - rect.left) / rect.width) * 1600;
      const yView = ((evt.clientY - rect.top) / rect.height) * 900;
      // Invert the inner group transform translate(pan) scale(zoom)
      const xWorld = (xView - state.ui.panX) / state.ui.zoom;
      const yWorld = (yView - state.ui.panY) / state.ui.zoom;
      return { x: xWorld, y: yWorld };
    },
    [state.ui.panX, state.ui.panY, state.ui.zoom]
  );

  const handleMouseDownPlayer = (e: React.MouseEvent, id: string) => {
    // Prevent canvas-level mousedown from clearing selection
    e.stopPropagation();
    const player = doc.players.find((p) => p.id === id);
    if (!player) return;
    if (e.detail === 2) {
      // Double-click: select all players on same side (offense vs defense) for quick bulk moves
      const sameSide = doc.players
        .filter((p) => (player.side || "O") === (p.side || "O"))
        .map((p) => p.id);
      dispatch({ type: "SET_SELECTION", ids: sameSide });
    } else if (e.metaKey || e.shiftKey) dispatch({ type: "TOGGLE_SELECT", id });
    else dispatch({ type: "SET_SELECTION", ids: [id] });
    if (state.ui.tool === "route" && !state.ui.drawing) {
      dispatch({
        type: "START_ROUTE",
        playerId: id,
        start: { x: player.x, y: player.y },
      });
    }
    // Build group snapshot (selected players) for potential group drag
    const selected = state.ui.selectedIds || [id];
    const originals = selected
      .map((pid) => doc.players.find((p) => p.id === pid))
      .filter(Boolean)
      .map((p) => {
        const abs = pctToAbs(p!.x, p!.y);
        return { id: p!.id, xAbs: abs.x, yAbs: abs.y };
      });
    const start = clientToWorld(e);
    dragRef.current = {
      id,
      startX: start.x,
      startY: start.y,
      moved: false,
      originals,
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
  // Convert pixel delta to SVG world (viewBox) units
  const svg = svgRef.current;
  const rect = svg?.getBoundingClientRect();
  const dxPx = e.clientX - panRef.current.startX;
  const dyPx = e.clientY - panRef.current.startY;
  const dx = rect ? (dxPx / rect.width) * 1600 : dxPx;
  const dy = rect ? (dyPx / rect.height) * 900 : dyPx;
  dispatch({ type: "PAN", dx, dy });
        panRef.current.startX = e.clientX; // incremental
        panRef.current.startY = e.clientY;
        return;
      }
      if (selectionDragRef.current) {
  const curr = clientToWorld(e);
  const sx = selectionDragRef.current.startX;
  const sy = selectionDragRef.current.startY;
  const x1 = Math.min(sx, curr.x);
  const y1 = Math.min(sy, curr.y);
  const x2 = Math.max(sx, curr.x);
  const y2 = Math.max(sy, curr.y);
  setSelectionBox({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
        return;
      }
      if (!dragRef.current) return;
      // Compute delta in world coordinates
      const now = clientToWorld(e);
      const dx = now.x - dragRef.current.startX;
      const dy = now.y - dragRef.current.startY;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) dragRef.current.moved = true;
      const patches: { id: string; x: number; y: number }[] = [];
      const { originals } = dragRef.current;
      originals.forEach((o) => {
        const nx = o.xAbs + dx;
        const ny = o.yAbs + dy;
        const pct = absToPct(nx, ny);
        patches.push({
          id: o.id,
          x: Math.min(100, Math.max(0, snapPct(pct.x))),
          y: Math.min(100, Math.max(0, snapPct(pct.y))),
        });
      });
      if (patches.length) {
        dispatch({ type: "MOVE_SELECTION", patches, mode: "drag" });
      }
    },
  [dispatch, snapPct, clientToWorld]
  );

  const handleMouseUp = useCallback(() => {
    if (selectionDragRef.current && selectionBox) {
      const { x, y, w, h } = selectionBox;
      const ids: string[] = [];
      doc.players.forEach((p) => {
        const abs = pctToAbs(p.x, p.y);
        if (abs.x >= x && abs.x <= x + w && abs.y >= y && abs.y <= y + h)
          ids.push(p.id);
      });
      if (ids.length) dispatch({ type: "SET_SELECTION", ids });
    }
    selectionDragRef.current = null;
    setSelectionBox(null);
    if (dragRef.current?.moved) {
      // commit history snapshot once per drag interaction
      dispatch({ type: "COMMIT_MOVE" });
    }
    dragRef.current = null;
  }, [doc.players, selectionBox, dispatch]);

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (state.ui.tool === "pan") {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        panX: state.ui.panX,
        panY: state.ui.panY,
      };
    } else if (state.ui.tool === "select") {
      const start = clientToWorld(e);
  selectionDragRef.current = { startX: start.x, startY: start.y };
      setSelectionBox({ x: start.x, y: start.y, w: 0, h: 0 });
      dispatch({ type: "CLEAR_SELECTION" });
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
    const world = clientToWorld(e);
    const x = snapPct((world.x / 1600) * 100);
    const y = snapPct((world.y / 900) * 100);
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
    const world = clientToWorld(e);
    const x = snapPct((world.x / 1600) * 100);
    const y = snapPct((world.y / 900) * 100);
    dispatch({ type: "PREVIEW_ROUTE", point: { x, y } });
  };

  // Debounce commit after keyboard nudges
  const commitMoveTimer = useRef<number | null>(null);
  const scheduleCommitMove = useCallback(() => {
    if (commitMoveTimer.current) window.clearTimeout(commitMoveTimer.current);
    commitMoveTimer.current = window.setTimeout(() => {
      dispatch({ type: "COMMIT_MOVE" });
      commitMoveTimer.current = null;
    }, 300);
  }, [dispatch]);

  // Keyboard shortcuts + arrow key nudging
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
      const selected = state.ui.selectedIds || [];
      if (
        selected.length &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const delta = e.shiftKey ? 2 : 0.5;
        const patches: { id: string; x: number; y: number }[] = [];
        selected.forEach((id) => {
          const p = doc.players.find((pl) => pl.id === id);
          if (!p) return;
          let nx = p.x;
          let ny = p.y;
          if (e.key === "ArrowUp") ny = Math.max(0, p.y - delta);
          if (e.key === "ArrowDown") ny = Math.min(100, p.y + delta);
          if (e.key === "ArrowLeft") nx = Math.max(0, p.x - delta);
          if (e.key === "ArrowRight") nx = Math.min(100, p.x + delta);
          patches.push({ id, x: nx, y: ny });
        });
        if (patches.length) {
          dispatch({ type: "MOVE_SELECTION", patches });
          scheduleCommitMove();
          // Nudge telemetry (sample individual events at ~1/5 rate)
          if (Math.random() < 0.2) {
            telemetry.enqueue({
              type: TelemetryEventTypes.PlayDiagramNudge,
              data: { count: selected.length, dx: patches[0] ? patches[0].x : 0, dy: patches[0] ? patches[0].y : 0 }
            });
          }
          // Aggregate into batch buffer
          nudgeBatchRef.current.events++;
          nudgeBatchRef.current.playersMoved = Math.max(nudgeBatchRef.current.playersMoved, selected.length);
          if (!nudgeBatchRef.current.timer) {
            nudgeBatchRef.current.timer = window.setTimeout(() => {
              telemetry.enqueue({
                type: TelemetryEventTypes.PlayDiagramNudgeBatch,
                data: { events: nudgeBatchRef.current.events, maxPlayers: nudgeBatchRef.current.playersMoved }
              });
              nudgeBatchRef.current = { events: 0, playersMoved: 0, timer: null };
            }, 1500);
          }
        }
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [
    dispatch,
    state.ui.drawing,
    state.ui.selectedIds,
    doc.players,
    scheduleCommitMove,
  ]);

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
          {/* Field background */}
          {(() => {
            const theme = doc.field.theme || "classic";
            if (theme === "classic")
              return (
                <rect
                  x={0}
                  y={0}
                  width={1600}
                  height={900}
                  fill="#1e7a44"
                  fillOpacity={0.55}
                />
              );
            if (theme === "mono-light")
              return (
                <rect x={0} y={0} width={1600} height={900} fill="#f4f5f6" />
              );
            if (theme === "mono-dark")
              return (
                <rect x={0} y={0} width={1600} height={900} fill="#1d1f20" />
              );
          })()}
          {/* LOS */}
          {(() => {
            const losYards = doc.field.losYards ?? 20;
            const y = (losYards / doc.field.forwardYards) * 900;
            return (
              <rect
                x={0}
                y={y - 3}
                width={1600}
                height={6}
                fill="#064e3b"
                opacity={0.95}
                rx={2}
              />
            );
          })()}
          {/* Red Zone Highlight (top 20 yards of visible slice) */}
          {doc.field.showRedZone && doc.field.forwardYards >= 20 && (
            <rect
              x={0}
              y={0}
              width={1600}
              height={(20 / doc.field.forwardYards) * 900}
              fill="#ef4444"
              opacity={0.08}
            />
          )}
          {/* Yard Lines */}
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
          {/* Hashes */}
          {doc.field.showHashMarks &&
            (() => {
              const layout = doc.field.hashLayout || "highschool";
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
              const theme = doc.field.theme || "classic";
              const hashColor =
                theme === "mono-dark"
                  ? "#374151"
                  : theme === "mono-light"
                    ? "#9ca3af"
                    : "#064e3b";
              const midColor = theme === "classic" ? "#065f46" : hashColor;
              const marks: React.ReactNode[] = [];
              const w = 10;
              const h = 3;
              const sideOffsetFt = 3;
              const sideCenterX = sideOffsetFt * PXPF;
              const sideRightCenterX = 1600 - sideCenterX;
              for (let yrd = 0; yrd <= doc.field.forwardYards; yrd++) {
                const y = (yrd / doc.field.forwardYards) * 900;
                marks.push(
                  <g key={yrd}>
                    <rect
                      x={lX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.55}
                    />
                    <rect
                      x={rX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.55}
                    />
                    {doc.field.ballHash === "middle" && (
                      <rect
                        x={mid - 3}
                        y={y - h / 2}
                        width={6}
                        height={h}
                        fill={midColor}
                        opacity={0.35}
                      />
                    )}
                    <rect
                      x={sideCenterX - w / 2}
                      y={y - h / 2}
                      width={w}
                      height={h}
                      fill={hashColor}
                      opacity={0.45}
                    />
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
              return marks;
            })()}
          {/* Yard Numbers */}
          {Array.from({ length: doc.field.forwardYards / 5 + 1 }).map(
            (_, i) => {
              const y = i * (900 / (doc.field.forwardYards / 5));
              if (i === 0) return null;
              const yardValue = i * 5;
              if (yardValue === 50) return null;
              const theme = doc.field.theme || "classic";
              const baseColor =
                theme === "classic"
                  ? "#ecfdf5"
                  : theme === "mono-light"
                    ? "#444"
                    : "#e5e7eb";
              const opacity = theme === "classic" ? 0.24 : 0.32;
              const feetFromSideline = 9 * 3;
              const leftX = feetFromSideline * 10;
              const rightX = 1600 - leftX;
              const numberY = y + 26;
              const digits = String(yardValue).split("");
              const halfSpacing = 24;
              return (
                <g key={i} opacity={opacity}>
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
            }
          )}
          {/* Players */}
          {doc.players
            .filter((p) => doc.field.showDefensePlayers || p.side !== "D")
            .map((p) => {
              const isCenter = p.label === "C" || p.role === "C";
              const theme = doc.field.theme || "classic";
              const defaultOutline =
                theme === "mono-light" ? "#1f2937" : "#ffffff";
              const strokeColor = p.outlineColor || defaultOutline;
              const selected = (state.ui.selectedIds || []).includes(p.id);
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
                      stroke={selected ? "#fbbf24" : strokeColor}
                      strokeWidth={selected ? 4 : 2}
                    />
                  ) : (
                    <ellipse
                      rx={26}
                      ry={18}
                      fill={p.color || (p.side === "D" ? "#b91c1c" : "#1e3a8a")}
                      stroke={selected ? "#fbbf24" : strokeColor}
                      strokeWidth={selected ? 4 : 2}
                    />
                  )}{" "}
                  {doc.field.showPlayerLabels && (
                    <text
                      x={0}
                      y={4}
                      fontSize={18}
                      fontWeight={700}
                      fill={theme === "mono-light" ? "#111827" : "#ffffff"}
                      textAnchor="middle"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              );
            })}
          {/* Route drawing preview */}
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
          {selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.w}
              height={selectionBox.h}
              fill="rgba(250,204,21,0.15)"
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}
        </g>
      </svg>
    </div>
  );
};
