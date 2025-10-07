import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toolbar } from "../components/Toolbar";
import React from "react";

describe("Integration: Toolbar", () => {
  it("renders toolbar UI", () => {
    const svgRef = React.createRef<SVGSVGElement>();
    render(<Toolbar svgRef={svgRef} />);
    expect(screen.getByTestId("toolbar-root")).toBeInTheDocument();
  });
  // Add more tests for tool selection, actions, and state
});
