import React from "react";
import { Button } from "../../ui/Button/Button";

// Toolbar for shape/line tools, selection, undo/redo, layer controls, etc.
export const Toolbar: React.FC<{
  activeTool: string;
  onToolSelect: (tool: string) => void;
}> = ({ activeTool, onToolSelect }) => {
  const tools = [
    { key: "select", label: "Select" },
    { key: "line", label: "Line" },
    { key: "shape", label: "Shape" },
    { key: "undo", label: "Undo" },
    { key: "redo", label: "Redo" },
    { key: "layer", label: "Layer" },
  ];
  return (
    <div className="field-canvas-toolbar">
      {tools.map((tool) => (
        <Button
          key={tool.key}
          variant={tool.key === activeTool ? "primary" : "secondary"}
          size="sm"
          onClick={() => onToolSelect(tool.key)}
        >
          {tool.label}
        </Button>
      ))}
    </div>
  );
};
