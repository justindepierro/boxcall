import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Layer } from "../Layer";

describe("Layer", () => {
  it("renders layer", () => {
    render(
      <Layer name="layer1" visible={true}>
        <rect x={0} y={0} width={10} height={10} />
      </Layer>
    );
  });
});
