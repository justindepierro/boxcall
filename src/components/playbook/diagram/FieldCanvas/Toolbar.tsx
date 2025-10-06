import React from "react";
import { Button } from "../../../ui/Button";
import { Icon } from "../../../ui/Icon/Icon";

// Toolbar for shape/line tools, selection, undo/redo, layer controls, etc.
export const Toolbar: React.FC<{
  activeTool: string;
  onToolSelect: (tool: string) => void;
}> = ({ activeTool, onToolSelect }) => {
  const tools = [
    {
      key: "select",
      label: "Select",
      icon: "pointer" as const,
      tooltip: "Select and move objects",
    },
    {
      key: "line",
      label: "Line",
      icon: "pen-tool" as const,
      tooltip: "Draw a line",
    },
    {
      key: "arrow",
      label: "Arrow",
      icon: "arrow-right" as const,
      tooltip: "Draw an arrow",
    },
    {
      key: "shape",
      label: "Shape",
      icon: "circle" as const,
      tooltip: "Draw a shape",
    },
    { key: "text", label: "Text", icon: "type" as const, tooltip: "Add text" },
  ];
  return (
    <nav
      className="field-canvas-toolbar flex gap-2 p-3 bg-surface-primary rounded-lg shadow-lg"
      aria-label="Field Canvas Toolbar"
      style={{ minHeight: 56 }}
    >
      {tools.map((tool) => (
        <Button
          key={tool.key}
          variant={tool.key === activeTool ? "primary" : "secondary"}
          size="sm"
          onClick={() => onToolSelect(tool.key)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150
            ${tool.key === activeTool ? "bg-surface-info text-text-info shadow-md ring-2 ring-focus-info" : "hover:bg-surface-hover hover:shadow-sm focus:bg-surface-info-hover focus:ring-2 focus:ring-focus-info"}`}
          aria-label={tool.label}
          title={tool.tooltip}
          tabIndex={0}
        >
          <Icon
            name={tool.icon}
            size="sm"
            color={tool.key === activeTool ? "navy" : "current"}
          />
          <span className="sr-only md:not-sr-only">{tool.label}</span>
        </Button>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onToolSelect("undo")}
        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-surface-hover hover:shadow-sm focus:bg-surface-info-hover focus:ring-2 focus:ring-focus-info"
        aria-label="Undo"
        title="Undo (Cmd+Z)"
      >
        <Icon name="undo" size="sm" />
        <span className="sr-only md:not-sr-only">Undo</span>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onToolSelect("redo")}
        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-surface-hover hover:shadow-sm focus:bg-surface-info-hover focus:ring-2 focus:ring-focus-info"
        aria-label="Redo"
        title="Redo (Cmd+Shift+Z)"
      >
        <Icon name="refresh-cw" size="sm" />
        <span className="sr-only md:not-sr-only">Redo</span>
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onToolSelect("layer")}
        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 hover:bg-surface-hover hover:shadow-sm focus:bg-surface-info-hover focus:ring-2 focus:ring-focus-info"
        aria-label="Layer Controls"
        title="Layer Controls"
      >
        <Icon name="grid" size="sm" />
        <span className="sr-only md:not-sr-only">Layers</span>
      </Button>
    </nav>
  );
};
