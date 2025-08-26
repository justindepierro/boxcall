import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { Arrow } from "../../Arrow";

describe("Arrow", () => {
  it("renders without crashing", () => {
    render(<Arrow x1={0} y1={0} x2={10} y2={10} color="black" />);
  });
});
