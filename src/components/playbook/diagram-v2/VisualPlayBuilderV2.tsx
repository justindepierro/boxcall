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
        <div className="w-56 border-r border-subtle p-3 space-y-4 bg-white/60">
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
