/**
 * Basic test for DiagramEditor component
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DiagramEditor } from "./DiagramEditorNew";

describe("DiagramEditor", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <DiagramEditor diagramType="formation" width={800} height={600} />
    );

    expect(container).toBeTruthy();
  });

  it("renders with initial data", () => {
    const mockData = {
      id: "test-diagram",
      type: "formation" as const,
      name: "Test Formation",
      description: "Test description",
      formation: {
        id: "test-formation",
        name: "Test Formation",
        category: "pro" as const,
        type: "I Formation" as const,
        direction: null,
        strength: "balanced" as const,
        personnel: { rb: 1, te: 1, wr: 1 },
        players: [],
      },
      canvas: {
        zoom: 1,
        panX: 0,
        panY: 0,
        width: 800,
        height: 600,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { container } = render(
      <DiagramEditor
        initialData={mockData}
        diagramType="formation"
        width={800}
        height={600}
      />
    );

    expect(container).toBeTruthy();
  });
});
