import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActionBar } from "../components/ActionBar";
import { DiagramEditorContext } from "../context/DiagramEditorContext";
import { createEmptyDocument } from "../types/types";

const mockState = {
  doc: {
    ...createEmptyDocument(),
    players: [
      {
        id: "p1",
        label: "QB",
        assignment: "Pass",
        locked: false,
        x: 50,
        y: 50,
        role: "QB",
        side: "O" as const,
        color: "#047857",
      },
    ],
  },
  ui: {
    tool: "select" as const,
    selectedIds: ["p1"],
    dragging: false,
    zoom: 1,
    panX: 0,
    panY: 0,
    snap: false,
    snapGrid: 2,
    // ...other required EditorToolState fields
  },
  dirty: false,
  history: [],
  historyIndex: -1,
};
const mockDispatch = () => {};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <DiagramEditorContext.Provider
      value={{ state: mockState, dispatch: mockDispatch }}
    >
      {children}
    </DiagramEditorContext.Provider>
  );
}

describe("ActionBar", () => {
  it("renders with selected player", () => {
    render(<ActionBar svgRef={{ current: null }} />, { wrapper: Wrapper });
    expect(screen.getByText("QB")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pass")).toBeInTheDocument();
  });

  it("does not render if no player selected", () => {
    const emptyState = {
      doc: { ...createEmptyDocument(), players: [] },
      ui: {
        tool: "select" as const,
        selectedIds: [],
        dragging: false,
        zoom: 1,
        panX: 0,
        panY: 0,
        snap: false,
        snapGrid: 2,
        // ...other required EditorToolState fields
      },
      dirty: false,
      history: [],
      historyIndex: -1,
    };
    render(
      <DiagramEditorContext.Provider
        value={{ state: emptyState, dispatch: mockDispatch }}
      >
        <ActionBar svgRef={{ current: null }} />
      </DiagramEditorContext.Provider>
    );
    // Check that nothing is rendered when no player is selected
    const { container } = render(
      <DiagramEditorContext.Provider
        value={{ state: emptyState, dispatch: mockDispatch }}
      >
        <ActionBar svgRef={{ current: null }} />
      </DiagramEditorContext.Provider>
    );
    expect(container.firstChild).toBeNull();
  });
});
