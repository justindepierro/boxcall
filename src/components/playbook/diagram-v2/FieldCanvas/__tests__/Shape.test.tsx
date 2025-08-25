import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Shape } from "../Shape";

describe("Shape", () => {
  it("renders shape", () => {
    render(
      <Shape type="circle" x={0} y={0} width={20} height={20} color="#eee" />
    );
  });
});
