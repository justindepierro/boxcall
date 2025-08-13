import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  DiagramEditorProvider,
  useDiagramEditor,
  useAddPlayer,
} from "./context";
import { FieldCanvas } from "./FieldCanvas";
import { svgElementToDataUrl } from "./thumbnail";
import { telemetry } from "../../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../../telemetry/events";
import { computeComplexityScore, type DiagramDocument } from "./types";
import { Button } from "../../ui/Button";

interface ShellProps {
  onDocumentChange?: (doc: DiagramDocument) => void;
}
const Shell: React.FC<ShellProps> = ({ onDocumentChange }) => {
  const { state, dispatch } = useDiagramEditor();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [thumbBusy, setThumbBusy] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  // Sidebar (left panel) resizable width
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(260);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    resizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.classList.add("select-none", "cursor-col-resize");
  };
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const delta = e.clientX - startXRef.current;
    const next = Math.min(420, Math.max(200, startWidthRef.current + delta));
    setSidebarWidth(next);
  }, []);
  const handleGlobalMouseUp = useCallback(() => {
    if (resizingRef.current) {
      resizingRef.current = false;
      document.body.classList.remove("select-none", "cursor-col-resize");
    }
  }, []);
  useEffect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);
  const addPlayer = useAddPlayer();
  const complexity = computeComplexityScore(state.doc);
  // Propagate document changes upward (debounced lightly by React render)
  useEffect(() => {
    if (onDocumentChange) onDocumentChange(state.doc);
  }, [state.doc, onDocumentChange]);
  return (
    <div className="flex flex-col h-full min-h-[620px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-subtle px-4 py-2 bg-white/80 backdrop-blur z-10">
        <div className="font-medium text-slate-700 mr-4 whitespace-nowrap">
          Diagram Builder v2
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1 pr-3 border-r border-subtle">
            <Button
              size="xs"
              variant={state.ui.tool === "select" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: "SET_TOOL", tool: "select" })}
            >
              Select
            </Button>
            <Button
              size="xs"
              variant={state.ui.tool === "add-player" ? "secondary" : "ghost"}
              onClick={addPlayer}
            >
              Player
            </Button>
            <Button
              size="xs"
              variant={state.ui.tool === "route" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: "SET_TOOL", tool: "route" })}
            >
              Route
            </Button>
            <Button
              size="xs"
              variant={state.ui.tool === "motion" ? "secondary" : "ghost"}
              onClick={() =>
                dispatch({
                  type: "SET_TOOL",
                  tool: "motion" as unknown as typeof state.ui.tool,
                })
              }
            >
              Motion
            </Button>
            <Button
              size="xs"
              variant={state.ui.tool === "pan" ? "secondary" : "ghost"}
              onClick={() => dispatch({ type: "SET_TOOL", tool: "pan" })}
            >
              Pan
            </Button>
          </div>
          <div className="flex items-center gap-1 pr-3 border-r border-subtle">
            <Button
              size="xs"
              variant="ghost"
              onClick={() =>
                dispatch({
                  type: "SET_ZOOM",
                  zoom: Math.max(0.25, state.ui.zoom - 0.1),
                })
              }
            >
              -
            </Button>
            <span className="text-[10px] w-10 text-center">
              {Math.round(state.ui.zoom * 100)}%
            </span>
            <Button
              size="xs"
              variant="ghost"
              onClick={() =>
                dispatch({
                  type: "SET_ZOOM",
                  zoom: Math.min(3, state.ui.zoom + 0.1),
                })
              }
            >
              +
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch({ type: "SET_ZOOM", zoom: 1 })}
            >
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-1 pr-3 border-r border-subtle">
            <Button
              size="xs"
              variant="ghost"
              disabled={state.historyIndex <= 0}
              onClick={() => dispatch({ type: "UNDO" })}
            >
              Undo
            </Button>
            <Button
              size="xs"
              variant="ghost"
              disabled={state.historyIndex >= state.history.length - 1}
              onClick={() => dispatch({ type: "REDO" })}
            >
              Redo
            </Button>
          </div>
          <div className="flex items-center gap-1 pr-3 border-r border-subtle">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-blue-600"
                checked={state.ui.snap}
                onChange={(e) =>
                  dispatch({ type: "SET_SNAP", enabled: e.target.checked })
                }
              />
              <span>Snap</span>
            </label>
            {state.ui.snap && (
              <select
                className="text-[10px] border border-subtle rounded px-1 py-0.5 bg-white"
                value={state.ui.snapGrid}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SNAP_GRID",
                    size: Number(e.target.value),
                  })
                }
              >
                {[1, 2, 4, 5, 10].map((g) => (
                  <option key={g} value={g}>
                    {g}%
                  </option>
                ))}
              </select>
            )}
          </div>
          <Button size="xs" variant="primary" onClick={addPlayer} className="shrink-0">
            Add Player
          </Button>
          <div className="flex items-center gap-1 border-l border-r border-subtle pl-2 pr-2">
            <span className="text-[10px]">Hash:</span>
            <select
              className="text-[10px] border border-subtle rounded px-1 py-0.5 bg-white"
              value={state.doc.field.ballHash || "middle"}
              onChange={(e) =>
                dispatch({
                  type: "SET_BALL_HASH",
                  hash: e.target.value as "left" | "right" | "middle",
                })
              }
            >
              <option value="left">Left</option>
              <option value="middle">Middle</option>
              <option value="right">Right</option>
            </select>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => dispatch({ type: "MIRROR" })}
            >
              Mirror
            </Button>
            <select
              className="text-[10px] border border-subtle rounded px-1 py-0.5 bg-white"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  dispatch({
                    type: "APPLY_FORMATION",
                    formation: e.target.value,
                  });
                  e.target.value = "";
                }
              }}
            >
              <option value="">Formation</option>
              <option value="trips-right">Trips Right</option>
            </select>
          </div>
          <Button size="xs" variant="secondary" disabled={!state.dirty} className="shrink-0">
            Save (stub)
          </Button>
          <Button
            size="xs"
            variant="ghost"
            disabled={thumbBusy}
            onClick={async () => {
              if (!svgRef.current) return;
              setThumbBusy(true);
              const start = performance.now();
              try {
                const dataUrl = await svgElementToDataUrl(svgRef.current, {
                  width: 480,
                  background:
                    state.doc.field.theme === "mono-light"
                      ? "#f4f5f6"
                      : state.doc.field.theme === "mono-dark"
                        ? "#1d1f20"
                        : "#0f5e2e",
                });
                setThumbUrl(dataUrl);
                telemetry.enqueue({
                  type: TelemetryEventTypes.PlayDiagramExportThumbnail,
                  data: {
                    w: 480,
                    h: Math.round(480 * (9 / 16)),
                    durationMs: Math.round(performance.now() - start),
                  },
                });
              } finally {
                setThumbBusy(false);
              }
            }}
          >
            {thumbBusy ? "Rendering…" : "Thumbnail"}
          </Button>
          <span className="text-[10px] text-slate-500 ml-2">
            Complexity: {complexity}
          </span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar (Resizable) */}
        <div
          className="border-r border-subtle p-3 space-y-4 bg-white/60 overflow-y-auto shrink-0"
          style={{ width: sidebarWidth }}
        >
          <div>
            <div className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
              FIELD OPTIONS
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="shrink-0">Theme</span>
                <select
                  className="flex-1 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                  value={state.doc.field.theme || "classic"}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FIELD_THEME",
                      theme: e.target.value as "classic" | "mono-light" | "mono-dark",
                    })
                  }
                >
                  <option value="classic">Classic</option>
                  <option value="mono-light">Mono Light</option>
                  <option value="mono-dark">Mono Dark</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="shrink-0">Hashes</span>
                <select
                  className="flex-1 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                  value={state.doc.field.hashLayout || 'highschool'}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FIELD_HASH_LAYOUT',
                      layout: e.target.value as 'highschool' | 'college' | 'nfl'
                    })
                  }
                >
                  <option value="highschool">High School</option>
                  <option value="college">College</option>
                  <option value="nfl">NFL</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showYardLines}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE_FIELD_FLAG",
                      flag: "showYardLines",
                    })
                  }
                />
                <span>Yard Lines</span>
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showHashMarks}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE_FIELD_FLAG",
                      flag: "showHashMarks",
                    })
                  }
                />
                <span>Hash Marks</span>
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showPlayerLabels}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE_FIELD_FLAG",
                      flag: "showPlayerLabels",
                    })
                  }
                />
                <span>Player Labels</span>
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showDefensePlayers}
                  onChange={() =>
                    dispatch({
                      type: "TOGGLE_FIELD_FLAG",
                      flag: "showDefensePlayers",
                    })
                  }
                />
                <span>Show Defense</span>
              </label>
              <div className="text-[10px] text-slate-500 pt-1">
                View: {state.doc.field.backYards}yd behind LOS /{" "}
                {state.doc.field.forwardYards}yd downfield
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Players: {state.doc.players.length}
          </div>
          <div className="text-xs text-slate-500">
            Routes: {state.doc.routes.length}
          </div>
          {/* Player Metadata Panel */}
          {state.doc.players.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mt-3 mb-1 flex items-center justify-between">
                <span>PLAYERS</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {state.doc.players.filter((p) => p.side !== "D").length} O /{" "}
                  {state.doc.players.filter((p) => p.side === "D").length} D
                </span>
              </div>
              <ul className="space-y-2">
                {state.doc.players.map((p) => (
                  <li
                    key={p.id}
                    className="bg-white/80 rounded border border-subtle p-2 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        value={p.label}
                        aria-label="Player label"
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_PLAYER",
                            id: p.id,
                            patch: {
                              label: e.target.value.toUpperCase().slice(0, 3),
                            },
                          })
                        }
                      />
                      <select
                        className="flex-1 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        value={p.role || ""}
                        aria-label="Player role"
                        onChange={(e) =>
                          dispatch({
                            type: "UPDATE_PLAYER",
                            id: p.id,
                            patch: { role: e.target.value || undefined },
                          })
                        }
                      >
                        <option value="">Role</option>
                        {[
                          "QB",
                          "RB",
                          "WR",
                          "TE",
                          "OL",
                          "DL",
                          "LB",
                          "CB",
                          "S",
                          "K",
                          "P",
                        ].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        value={p.side || "O"}
                        aria-label="Player side"
                        onChange={(e) => {
                          const val = e.target.value as "O" | "D" | "ST";
                          dispatch({
                            type: "UPDATE_PLAYER",
                            id: p.id,
                            patch: { side: val },
                          });
                        }}
                      >
                        <option value="O">O</option>
                        <option value="D">D</option>
                        <option value="ST">ST</option>
                      </select>
                      <select
                        className="w-16 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        aria-label="Player color"
                        value={p.color || (p.side === 'D' ? '#b91c1c' : '#1e3a8a')}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_PLAYER',
                            id: p.id,
                            patch: { color: e.target.value },
                          })
                        }
                      >
                        {['#1e3a8a','#2563eb','#312e81','#047857','#16a34a','#92400e','#b91c1c','#dc2626','#0d9488','#7c3aed','#6366f1','#374151'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        className="w-16 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        aria-label="Outline color"
                        value={p.outlineColor || ''}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_PLAYER',
                            id: p.id,
                            patch: { outlineColor: e.target.value || undefined },
                          })
                        }
                      >
                        <option value="">Auto</option>
                        {['#ffffff','#f8fafc','#1f2937','#111827','#000000'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          dispatch({ type: "REMOVE_PLAYER", id: p.id })
                        }
                        aria-label="Remove player"
                      >
                        ✕
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {state.doc.routes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mt-2 mb-1">
                ROUTES
              </div>
              <ul className="space-y-1">
                {state.doc.routes.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between text-[11px] bg-white/70 rounded px-2 py-1 border border-subtle"
                  >
                    <span>
                      {r.playerId} ·{" "}
                      {r.segments.reduce((a, s) => a + s.points.length - 1, 0)}{" "}
                      pts
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        dispatch({ type: "DELETE_ROUTE", routeId: r.id })
                      }
                    >
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Resize Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={handleResizeMouseDown}
          className="w-1 cursor-col-resize bg-transparent hover:bg-blue-200 active:bg-blue-300 transition-colors"
        />
        {/* Canvas Area */}
        <div className="flex-1 min-w-0 flex flex-col p-3">
          <div className="relative flex-1 min-h-0 rounded-md bg-emerald-800/60">
            <div className="absolute inset-0">
              {/* Attach ref to underlying SVG via wrapper div query */}
              <FieldCanvas className="w-full h-full" />
              <CaptureSvgRef targetRef={svgRef} />
              {thumbUrl && (
                <img
                  src={thumbUrl}
                  alt="Diagram thumbnail"
                  className="absolute bottom-2 right-2 w-32 h-auto ring-2 ring-white shadow-lg rounded bg-white/30 backdrop-blur"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to locate the first SVG in parent and store ref
const CaptureSvgRef: React.FC<{ targetRef: React.MutableRefObject<SVGSVGElement | null> }> = ({ targetRef }) => {
  useEffect(() => {
    if (!targetRef.current) {
      const svg = document.querySelector<SVGSVGElement>("svg[aria-label='Diagram field']");
      if (svg) targetRef.current = svg;
    }
  });
  return null;
};

export const VisualPlayBuilderV2: React.FC<{
  onDocumentChange?: (doc: DiagramDocument) => void;
}> = ({ onDocumentChange }) => (
  <DiagramEditorProvider>
    <Shell onDocumentChange={onDocumentChange} />
  </DiagramEditorProvider>
);
