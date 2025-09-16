import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { Toolbar } from "../../Toolbar";

describe("Toolbar", () => {
  it("renders toolbar", () => {
    render(<Toolbar activeTool="select" onToolSelect={() => {}} />);
  });
});
