import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { Annotation } from "../../Annotation";
import { FieldCanvasProvider } from "../../FieldCanvasContext";

describe("Annotation", () => {
  it("renders annotation", () => {
    render(
      <FieldCanvasProvider>
        <Annotation />
      </FieldCanvasProvider>
    );
  });
});
