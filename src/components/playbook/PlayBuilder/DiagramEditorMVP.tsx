import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../../ui/Button";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";

// Lightweight MVP diagram model (not persisted server-side yet)
export interface DiagramPlayer {
  id: string;
  label: string; // e.g., X, Y, H, Q
  x: number; // 0..100 percentage horizontal (0 left, 100 right)
  y: number; // 0..100 percentage vertical (0 top, 100 bottom)
  color?: string;
}
export interface DiagramRoutePoint {
  x: number;
  y: number;
}
export interface DiagramRoute {
  id: string;
  playerId: string; // owner
  points: DiagramRoutePoint[]; // first point implicitly player's position; points include subsequent curve anchors (MVP straight segments)
  color?: string;
}
export interface DiagramModel {
  players: DiagramPlayer[];
  routes: DiagramRoute[];
  version: 1;
}
export interface DiagramEditorMVPProps {
  value?: DiagramModel | null;
  onChange: (model: DiagramModel) => void;
  className?: string;
}

const defaultPlayers: DiagramPlayer[] = [
  { id: "QB", label: "Q", x: 50, y: 80, color: "#ef4444" },
  { id: "RB", label: "H", x: 60, y: 85, color: "#f59e0b" },
  { id: "WR1", label: "X", x: 15, y: 70, color: "#0ea5e9" },
  { id: "WR2", label: "Z", x: 85, y: 70, color: "#0ea5e9" },
  { id: "TE", label: "Y", x: 45, y: 70, color: "#6366f1" },
];

export const DiagramEditorMVP: React.FC<DiagramEditorMVPProps> = ({
  value,
  onChange,
  className,
}) => {
  const [model, setModel] = useState<DiagramModel>(
    value || { players: defaultPlayers, routes: [], version: 1 }
  );
  const [mode, setMode] = useState<"select" | "route">("select");
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [drawingRoute, setDrawingRoute] = useState<DiagramRoute | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const lastTelemetryRef = useRef<number>(0);

  // Emit telemetry (debounced ~1.2s)
  useEffect(() => {
    const now = Date.now();
    if (now - lastTelemetryRef.current < 1200) return;
    lastTelemetryRef.current = now;
    telemetry.enqueue({
      type: TelemetryEventTypes.PlayDiagramUpdated,
      data: {
        players: model.players.length,
        routes: model.routes.length,
        mode,
      },
    });
  }, [model.players.length, model.routes.length, mode]);

  const commit = useCallback(
    (next: DiagramModel) => {
      setModel(next);
      onChange(next);
    },
    [onChange]
  );

  const pctFromClient = (evt: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * 100;
    const y = ((evt.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  };

  // Drag logic
  const handleMouseDownPlayer = (e: React.MouseEvent, id: string) => {
    if (mode === "route") {
      // Start route drawing from this player
      const player = model.players.find((p) => p.id === id);
      if (!player) return;
      const newRoute: DiagramRoute = {
        id: `r_${Date.now()}`,
        playerId: id,
        points: [{ x: player.x, y: player.y }],
        color: player.color || "#0f766e",
      };
      setDrawingRoute(newRoute);
      setActivePlayerId(id);
      e.stopPropagation();
      return;
    }
    const player = model.players.find((p) => p.id === id);
    if (!player) return;
    const pos = pctFromClient(e);
    dragRef.current = {
      id,
      offsetX: pos.x - player.x,
      offsetY: pos.y - player.y,
    };
    setActivePlayerId(id);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragRef.current) {
        const pos = pctFromClient(e);
        commit({
          ...model,
          players: model.players.map((p) =>
            p.id === dragRef.current!.id
              ? {
                  ...p,
                  x: pos.x - dragRef.current!.offsetX,
                  y: pos.y - dragRef.current!.offsetY,
                }
              : p
          ),
        });
      } else if (drawingRoute) {
        const pos = pctFromClient(e);
        setDrawingRoute({
          ...drawingRoute,
          points: [...drawingRoute.points.slice(0, 1), { x: pos.x, y: pos.y }],
        });
      }
    },
    [model, drawingRoute, commit]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (dragRef.current) {
        dragRef.current = null;
      }
      if (drawingRoute) {
        // Finalize route by adding final anchor
        const pos = pctFromClient(e);
        const finalized: DiagramRoute = {
          ...drawingRoute,
          points: [...drawingRoute.points, { x: pos.x, y: pos.y }],
        };
        commit({ ...model, routes: [...model.routes, finalized] });
        setDrawingRoute(null);
        setMode("select");
      }
    },
    [drawingRoute, model, commit]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const addPlayer = () => {
    const next: DiagramPlayer = {
      id: `P${model.players.length + 1}`,
      label: `P${model.players.length + 1}`,
      x: 50,
      y: 50,
      color: "#475569",
    };
    commit({ ...model, players: [...model.players, next] });
  };
  const clearAll = () => {
    commit({ ...model, routes: [], players: model.players });
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs">
          <Button
            size="xs"
            variant={mode === "select" ? "secondary" : "ghost"}
            onClick={() => setMode("select")}
          >
            Select
          </Button>
          <Button
            size="xs"
            variant={mode === "route" ? "secondary" : "ghost"}
            onClick={() => setMode("route")}
          >
            Route
          </Button>
          <Button size="xs" variant="ghost" onClick={addPlayer}>
            + Player
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={clearAll}
            disabled={!model.routes.length}
          >
            Clear Routes
          </Button>
          <span className="text-slate-500 ml-2">
            {model.players.length} players · {model.routes.length} routes
          </span>
        </div>
      </div>
      <div
        className="relative border border-subtle rounded-md bg-slate-800/90"
        style={{ aspectRatio: "16 / 9" }}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label="Play diagram canvas"
          onMouseDown={(_e) => {
            if (mode === "route" && !drawingRoute) {
              // click on empty space cancels
              setMode("select");
            }
          }}
        >
          {/* Field grid (simple yard lines) */}
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              x2="100%"
              y1={`${(i / 10) * 100}%`}
              y2={`${(i / 10) * 100}%`}
              stroke="#334155"
              strokeWidth={1}
            />
          ))}
          {/* Routes */}
          {model.routes.map((r) => (
            <polyline
              key={r.id}
              points={r.points.map((p) => `${p.x}%,${p.y}%`).join(" ")}
              fill="none"
              stroke={r.color || "#0f766e"}
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
          ))}
          {drawingRoute && (
            <polyline
              points={drawingRoute.points
                .map((p) => `${p.x}%,${p.y}%`)
                .join(" ")}
              fill="none"
              stroke={drawingRoute.color || "#0f766e"}
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#0f766e" />
            </marker>
          </defs>
          {/* Players */}
          {model.players.map((p) => (
            <g key={p.id} transform={`translate(${p.x}%,${p.y}%)`}>
              <circle
                r={3.5}
                fill={p.color || "#64748b"}
                stroke={activePlayerId === p.id ? "#f59e0b" : "white"}
                strokeWidth={activePlayerId === p.id ? 2 : 1}
                onMouseDown={(e) => handleMouseDownPlayer(e, p.id)}
                className="cursor-pointer"
              />
              <text
                x={0}
                y={-6}
                textAnchor="middle"
                fontSize={8}
                fill="white"
                style={{ userSelect: "none" }}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
