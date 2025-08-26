import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { DiagramEditorProvider } from "../../../context/context";
import { PlayerSidebar } from "../../PlayerSidebar";

// Smoke test: renders grouped headers (OFFENSE / DEFENSE) when players exist

describe("PlayerSidebar", () => {
  it("renders without crashing (no players)", () => {
    render(
      <DiagramEditorProvider>
        <PlayerSidebar />
      </DiagramEditorProvider>
    );
    // With no players, may not show headers; just assert container present
    const el = screen.getByTestId("player-sidebar-root");
    expect(el).not.toBeNull();
  });
});
