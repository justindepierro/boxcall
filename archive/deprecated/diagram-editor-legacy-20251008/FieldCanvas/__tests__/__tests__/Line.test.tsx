import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { Line } from "../../Line";

describe("Line", () => {
  it("renders line", () => {
    render(<Line x1={0} y1={0} x2={10} y2={10} color="#333" />);
  });
});
