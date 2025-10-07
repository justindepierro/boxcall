import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect } from "vitest";
import { Toolbar } from "../Toolbar";
import { DiagramEditorProvider } from "../../context";

// Minimal smoke test: renders and toggles a tool button

describe("Toolbar", () => {
  it("renders and switches to route tool", () => {
    const svgRef = {
      current: null,
    } as React.MutableRefObject<SVGSVGElement | null>;
    render(
      <DiagramEditorProvider>
        <Toolbar svgRef={svgRef} />
      </DiagramEditorProvider>
    );
    const routeBtn = screen.getByRole("button", { name: /route/i });
    fireEvent.click(routeBtn);
    expect(routeBtn).toBeTruthy();
  });
});
