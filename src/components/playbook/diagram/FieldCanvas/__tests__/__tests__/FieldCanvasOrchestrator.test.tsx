import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { FieldCanvasOrchestrator } from "../../FieldCanvasOrchestrator";
import { FieldCanvasProvider } from "../../FieldCanvasContext";

describe("FieldCanvasOrchestrator", () => {
  it("renders orchestrator", () => {
    render(
      <FieldCanvasProvider>
        <FieldCanvasOrchestrator />
      </FieldCanvasProvider>
    );
  });
});
