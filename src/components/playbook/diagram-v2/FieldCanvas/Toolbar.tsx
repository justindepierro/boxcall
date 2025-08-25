import React from "react";
import { Button } from "../../../ui/Button";
import { Icon } from "../../../ui/Icon/Icon";

// Toolbar for shape/line tools, selection, undo/redo, layer controls, etc.
export const Toolbar: React.FC<{
  activeTool: string;
  onToolSelect: (tool: string) => void;
}> = ({ activeTool, onToolSelect }) => {
  const tools = [
    { key: "select", label: "Select", icon: "pointer" },
    { key: "line", label: "Line", icon: "type" },
    { key: "shape", label: "Shape", icon: "square" },
  ];
  return (
    <div className="field-canvas-toolbar flex gap-2 p-2 bg-white rounded shadow">
      {tools.map((tool) => (
        <Button
          key={tool.key}
          variant={tool.key === activeTool ? "primary" : "secondary"}
          size="sm"
          onClick={() => onToolSelect(tool.key)}
          className="flex items-center gap-1"
        >
          <Icon
            name={tool.icon as import("../../../ui/Icon/types").IconName}
            size="sm"
          />
          <span>{tool.label}</span>
        </Button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onToolSelect("undo")}
        className="flex items-center gap-1"
        aria-label="Undo"
      >
        <Icon name="undo" size="sm" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onToolSelect("redo")}
        className="flex items-center gap-1"
        aria-label="Redo"
      >
        <Icon name="refresh-cw" size="sm" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onToolSelect("layer")}
        className="flex items-center gap-1"
        aria-label="Layer Controls"
      >
        <Icon name="grid" size="sm" />
      </Button>
    </div>
  );
};
