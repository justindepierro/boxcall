import React, { useEffect } from "react";
import {
  DiagramEditorProvider,
  useDiagramEditor,
  useAddPlayer,
} from "./context";
import { FieldCanvas } from "./FieldCanvas";
import { computeComplexityScore, type DiagramDocument } from "./types";
import { Button } from "../../ui/Button";

interface ShellProps {
  onDocumentChange?: (doc: DiagramDocument) => void;
}
const Shell: React.FC<ShellProps> = ({ onDocumentChange }) => {
  const { state, dispatch } = useDiagramEditor();
  const addPlayer = useAddPlayer();
  const complexity = computeComplexityScore(state.doc);
  // Propagate document changes upward (debounced lightly by React render)
  useEffect(() => {
    if (onDocumentChange) onDocumentChange(state.doc);
  }, [state.doc, onDocumentChange]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-subtle px-4 py-2 bg-white/80 backdrop-blur z-10">
        <div className="font-medium text-slate-700">
          Visual Play Builder v2 (Prototype)
        </div>
        <div className="flex items-center gap-2 text-xs">
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
          <Button size="xs" variant="primary" onClick={addPlayer}>
            Add Player
          </Button>
          <Button size="xs" variant="secondary" disabled={!state.dirty}>
            Save (stub)
          </Button>
          <span className="text-[10px] text-slate-500 ml-2">
            Complexity: {complexity}
          </span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left side options (placeholder) */}
        <div className="w-64 border-r border-subtle p-3 space-y-4 bg-white/60 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
              FIELD OPTIONS
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showYardLines}
                  onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showYardLines" })}
                />
                <span>Yard Lines</span>
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showHashMarks}
                  onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showHashMarks" })}
                />
                <span>Hash Marks</span>
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showPlayerLabels}
                  onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showPlayerLabels" })}
                />
                <span>Player Labels</span>
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={state.doc.field.showDefensePlayers}
                  onChange={() => dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showDefensePlayers" })}
                />
                <span>Show Defense</span>
              </label>
              <div className="text-[10px] text-slate-500 pt-1">
                View: {state.doc.field.backYards}yd behind LOS / {state.doc.field.forwardYards}yd downfield
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
                  {state.doc.players.filter(p=>p.side!=="D").length} O / {state.doc.players.filter(p=>p.side==="D").length} D
                </span>
              </div>
              <ul className="space-y-2">
                {state.doc.players.map((p) => (
                  <li key={p.id} className="bg-white/80 rounded border border-subtle p-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        value={p.label}
                        aria-label="Player label"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_PLAYER", id: p.id, patch: { label: e.target.value.toUpperCase().slice(0,3) } })
                        }
                      />
                      <select
                        className="flex-1 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        value={p.role || ""}
                        aria-label="Player role"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_PLAYER", id: p.id, patch: { role: e.target.value || undefined } })
                        }
                      >
                        <option value="">Role</option>
                        {['QB','RB','WR','TE','OL','DL','LB','CB','S','K','P'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select
                        className="w-14 px-1 py-0.5 text-[11px] border border-subtle rounded bg-white"
                        value={p.side || 'O'}
                        aria-label="Player side"
                        onChange={(e) => {
                          const val = e.target.value as 'O' | 'D' | 'ST';
                          dispatch({ type: "UPDATE_PLAYER", id: p.id, patch: { side: val } });
                        }}
                      >
                        <option value="O">O</option>
                        <option value="D">D</option>
                        <option value="ST">ST</option>
                      </select>
                      <input
                        type="color"
                        className="w-8 h-6 p-0 border border-subtle rounded cursor-pointer"
                        value={p.color || (p.side==='D' ? '#b91c1c' : '#1e3a8a')}
                        aria-label="Player color"
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_PLAYER", id: p.id, patch: { color: e.target.value } })
                        }
                      />
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => dispatch({ type: "REMOVE_PLAYER", id: p.id })}
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
        <div className="flex-1 p-4">
          <div
            className="relative w-full h-full"
            style={{ aspectRatio: "16 / 9" }}
          >
            <FieldCanvas className="absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const VisualPlayBuilderV2: React.FC<{
  onDocumentChange?: (doc: DiagramDocument) => void;
}> = ({ onDocumentChange }) => (
  <DiagramEditorProvider>
    <Shell onDocumentChange={onDocumentChange} />
  </DiagramEditorProvider>
);
