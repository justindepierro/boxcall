import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ZoomPan } from "../ZoomPan";
import { FieldCanvasProvider } from "../FieldCanvasContext";

describe("ZoomPan", () => {
  it("renders ZoomPan", () => {
    render(
      <FieldCanvasProvider>
        <ZoomPan />
      </FieldCanvasProvider>
    );
  });
});
