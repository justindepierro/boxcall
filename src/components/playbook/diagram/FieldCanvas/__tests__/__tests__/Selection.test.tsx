import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { Selection } from "../../Selection";
import { FieldCanvasProvider } from "../../FieldCanvasContext";

describe("Selection", () => {
  it("renders selection", () => {
    render(
      <FieldCanvasProvider>
        <Selection />
      </FieldCanvasProvider>
    );
  });
});
