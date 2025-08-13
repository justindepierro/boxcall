import React from "react";
import {
  DiagramEditorProvider,
  useDiagramEditor,
  useAddPlayer,
} from "./context";
import { FieldCanvas } from "./FieldCanvas";
import { computeComplexityScore } from "./types";
import { Button } from "../../ui/Button";

const Shell: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();
  const addPlayer = useAddPlayer();
  const complexity = computeComplexityScore(state.doc);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-subtle px-4 py-2 bg-white/80 backdrop-blur z-10">
        <div className="font-medium text-slate-700">
          Visual Play Builder v2 (Prototype)
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 pr-3 border-r border-subtle">
            <Button size="xs" variant={state.ui.tool === "select" ? "secondary" : "ghost"} onClick={() => dispatch({ type: "SET_TOOL", tool: "select" })}>Select</Button>
            <Button size="xs" variant={state.ui.tool === "add-player" ? "secondary" : "ghost"} onClick={addPlayer}>Player</Button>
            <Button size="xs" variant={state.ui.tool === "route" ? "secondary" : "ghost"} onClick={() => dispatch({ type: "SET_TOOL", tool: "route" })}>Route</Button>
            <Button size="xs" variant={state.ui.tool === "pan" ? "secondary" : "ghost"} onClick={() => dispatch({ type: "SET_TOOL", tool: "pan" })}>Pan</Button>
          </div>
          <div className="flex items-center gap-1 pr-3 border-r border-subtle">
            <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "SET_ZOOM", zoom: Math.max(0.25, state.ui.zoom - 0.1) })}>-</Button>
            <span className="text-[10px] w-10 text-center">{Math.round(state.ui.zoom * 100)}%</span>
            <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "SET_ZOOM", zoom: Math.min(3, state.ui.zoom + 0.1) })}>+</Button>
            <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "SET_ZOOM", zoom: 1 })}>Reset</Button>
          </div>
          <Button size="xs" variant="primary" onClick={addPlayer}>
            Add Player
          </Button>
          <Button size="xs" variant="secondary" disabled={!state.dirty}>
            Save (stub)
          </Button>
          <span className="text-[10px] text-slate-500 ml-2">Complexity: {complexity}</span>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left side options (placeholder) */}
        <div className="w-64 border-r border-subtle p-3 space-y-4 bg-white/60 overflow-y-auto">
          <div>
            <div className="text-xs font-semibold text-slate-600 tracking-wide mb-1">
              FIELD OPTIONS
            </div>
            <p className="text-xs text-slate-500">(Coming soon)</p>
          </div>
          <div className="text-xs text-slate-500">
            Players: {state.doc.players.length}
          </div>
          <div className="text-xs text-slate-500">
            Routes: {state.doc.routes.length}
          </div>
          {state.doc.routes.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-600 mt-2 mb-1">ROUTES</div>
              <ul className="space-y-1">
                {state.doc.routes.map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-[11px] bg-white/70 rounded px-2 py-1 border border-subtle">
                    <span>{r.playerId} · {r.segments.reduce((a,s)=>a+s.points.length-1,0)} pts</span>
                    <Button size="xs" variant="ghost" onClick={() => dispatch({ type: "DELETE_ROUTE", routeId: r.id })}>✕</Button>
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

export const VisualPlayBuilderV2: React.FC = () => (
  <DiagramEditorProvider>
    <Shell />
  </DiagramEditorProvider>
);
