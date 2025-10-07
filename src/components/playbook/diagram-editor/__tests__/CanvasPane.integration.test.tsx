import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasPane } from "../components/CanvasPane";
import { DiagramEditorContext } from "../context/DiagramEditorContext";
import { createEmptyDocument } from "../types/types";
// ...existing code...
import React from "react";

describe("Integration: CanvasPane", () => {
  it("renders canvas pane UI", () => {
    const svgRef = React.createRef<SVGSVGElement>();
    const initialState = {
      doc: createEmptyDocument(),
      ui: {
        tool: "select" as const,
        selectedIds: [],
        mode: "default",
        zoom: 1,
        panX: 0,
        panY: 0,
        snap: false,
        snapGrid: 2,
      },
      dirty: false,
      history: [],
      historyIndex: -1,
    };
    const CustomProvider = ({ children }: { children: React.ReactNode }) => {
      const [state, dispatch] = React.useReducer(
        () => initialState,
        initialState
      );
      return (
        <DiagramEditorContext.Provider value={{ state, dispatch }}>
          {children}
        </DiagramEditorContext.Provider>
      );
    };
    render(
      <CustomProvider>
        <CanvasPane svgRef={svgRef} />
      </CustomProvider>
    );
    expect(screen.getByTestId("canvas-pane-root")).toBeInTheDocument();
  });
  // Add more tests for drawing, selection, and context
});
