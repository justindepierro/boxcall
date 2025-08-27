import React from "react";
import { Toolbar } from "./Toolbar";
import { Layer } from "./Layer";
import { Shape } from "./Shape";
import { Line } from "./Line";
import { Selection } from "./Selection";
import { ZoomPan } from "./ZoomPan";
import { Annotation } from "./Annotation";
import { FieldCanvasProvider } from "./FieldCanvasContext";
import { useFieldCanvas } from "./useFieldCanvas";
import { useEffect } from "react";
import { eventBus } from "../../../lib/eventBus";

// Top-level orchestrator for FieldCanvas
export const FieldCanvasOrchestrator: React.FC = () => {
  return (
    <FieldCanvasProvider>
      <FieldCanvasOrchestratorInner />
    </FieldCanvasProvider>
  );
};

const FieldCanvasOrchestratorInner: React.FC = () => {
  const { state, dispatch } = useFieldCanvas();
  // Subscribe to playbook:toolSelected events
  useEffect(() => {
    const unsubscribe = eventBus.subscribe("playbook:toolSelected", (event) => {
      if (
        event.payload &&
        typeof event.payload === "object" &&
        "tool" in event.payload
      ) {
        dispatch({
          type: "SET_TOOL",
          tool: (event.payload as { tool: string }).tool,
        });
      }
    });
    return unsubscribe;
  }, [dispatch]);

  const handleToolSelect = (tool: string) => {
    dispatch({ type: "SET_TOOL", tool });
  };
  // Example: shapes and lines from state.doc (replace with real data structure)
  const shapes = state.doc.shapes || [];
  const lines = state.doc.lines || [];
  return (
    <div className="field-canvas">
      <Toolbar activeTool={state.ui.tool} onToolSelect={handleToolSelect} />
      <svg className="main-svg">
        <Layer name="main">
          {shapes.map(
            (shape: import("./FieldCanvasContext").ShapeType, i: number) => (
              <Shape key={i} {...shape} />
            )
          )}
          {lines.map(
            (line: import("./FieldCanvasContext").LineType, i: number) => (
              <Line key={i} {...line} />
            )
          )}
        </Layer>
        <Selection />
        <ZoomPan />
        <Annotation />
      </svg>
    </div>
  );
};
