import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VisualPlayBuilder } from "../VisualPlayBuilder";
import { DiagramEditorContext } from "../context/DiagramEditorContext";
import { createEmptyDocument } from "../types/types";
import React from "react";
// ...existing code...

describe("Integration: VisualPlayBuilder", () => {
  it("renders main diagram builder UI", () => {
    // Guarantee doc.players is a non-empty array and selectedIds matches a valid player id
    const doc = (() => {
      const d = createEmptyDocument();
      if (!d.players || d.players.length === 0) {
        d.players = [
          {
            id: "QB",
            label: "QB",
            x: 0,
            y: 0,
            color: "#000",
          },
        ];
      }
      return d;
    })();
    const selectedPlayerId = doc.players[0].id;
    const initialState = {
      doc,
      ui: {
        tool: "select" as const,
        selectedIds: [selectedPlayerId],
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
        <VisualPlayBuilder />
      </CustomProvider>
    );
    expect(screen.getByTestId("diagram-root")).toBeInTheDocument();
  });
  // Add more integration tests for flows, e.g. adding players, routes, annotations
});
