import React from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import { DrawingTools } from "./DrawingTools";
import {
  MousePointer2,
  User,
  Route,
  Square,
  Hand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid3X3,
  Magnet,
} from "lucide-react";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  shortcut?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  shortcut,
}) => (
  <button
    onClick={onClick}
    className={`group relative w-12 h-12 rounded-lg border transition-all duration-200 flex items-center justify-center ${
      isActive
        ? "bg-primary border-primary text-primary-foreground shadow-lg"
        : "bg-surface-card border-border hover:border-primary/50 hover:bg-surface-secondary text-text-primary"
    }`}
    title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
  >
    {icon}
    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="bg-surface-tooltip text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
        {label}
        {shortcut && (
          <span className="ml-1 text-text-secondary">({shortcut})</span>
        )}
      </div>
    </div>
  </button>
);

export const ModernToolPalette: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();

  const tools = [
    {
      id: "select",
      icon: <MousePointer2 size={20} />,
      label: "Select",
      shortcut: "V",
      action: () => dispatch({ type: "SET_TOOL", tool: "select" }),
    },
    {
      id: "pan",
      icon: <Hand size={20} />,
      label: "Pan",
      shortcut: "H",
      action: () => dispatch({ type: "SET_TOOL", tool: "pan" }),
    },
    {
      id: "add-player",
      icon: <User size={20} />,
      label: "Add Player",
      shortcut: "P",
      action: () => dispatch({ type: "SET_TOOL", tool: "add-player" }),
    },
    {
      id: "route",
      icon: <Route size={20} />,
      label: "Draw Route",
      shortcut: "R",
      action: () => dispatch({ type: "SET_TOOL", tool: "route" }),
    },
    {
      id: "draw",
      icon: <Square size={20} />,
      label: "Draw Tool",
      shortcut: "D",
      action: () => dispatch({ type: "SET_TOOL", tool: "draw" }),
    },
  ];

  const viewControls = [
    {
      id: "zoom-in",
      icon: <ZoomIn size={16} />,
      label: "Zoom In",
      shortcut: "+",
      action: () =>
        dispatch({ type: "SET_ZOOM", zoom: Math.min(5, state.ui.zoom * 1.2) }),
    },
    {
      id: "zoom-out",
      icon: <ZoomOut size={16} />,
      label: "Zoom Out",
      shortcut: "-",
      action: () =>
        dispatch({
          type: "SET_ZOOM",
          zoom: Math.max(0.1, state.ui.zoom * 0.8),
        }),
    },
    {
      id: "reset-view",
      icon: <RotateCcw size={16} />,
      label: "Reset View",
      shortcut: "0",
      action: () =>
        dispatch({ type: "SET_VIEWPORT", zoom: 1, panX: 0, panY: 0 }),
    },
  ];

  const toggleControls = [
    {
      id: "yard-lines",
      icon: <Grid3X3 size={16} />,
      label: state.doc.field.showYardLines
        ? "Hide Yard Lines"
        : "Show Yard Lines",
      isActive: state.doc.field.showYardLines,
      action: () =>
        dispatch({ type: "TOGGLE_FIELD_FLAG", flag: "showYardLines" }),
    },
    {
      id: "snap",
      icon: <Magnet size={16} />,
      label: "Toggle Snap",
      isActive: true, // Default to enabled
      action: () => dispatch({ type: "SET_SNAP_PULSE", enabled: true }),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-surface-card border-r border-border min-w-16">
      {/* Main Tools */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Tools
        </div>
        {tools.map((tool) => (
          <ToolButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            shortcut={tool.shortcut}
            isActive={state.ui.tool === tool.id}
            onClick={tool.action}
          />
        ))}
      </div>

      {/* Drawing Tools - Show when draw tool is active */}
      {state.ui.tool === "draw" && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
            Drawing
          </div>
          <DrawingTools />
        </div>
      )}

      {/* View Controls */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          View
        </div>
        {viewControls.map((control) => (
          <ToolButton
            key={control.id}
            icon={control.icon}
            label={control.label}
            shortcut={control.shortcut}
            isActive={false}
            onClick={control.action}
          />
        ))}
      </div>

      {/* Toggle Controls */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Options
        </div>
        {toggleControls.map((control) => (
          <button
            key={control.id}
            onClick={control.action}
            className={`group relative w-12 h-12 rounded-lg border transition-all duration-200 flex items-center justify-center ${
              control.isActive
                ? "bg-accent border-accent text-accent-foreground"
                : "bg-surface-card border-border hover:border-accent/50 hover:bg-surface-secondary text-text-primary"
            }`}
            title={control.label}
          >
            {control.icon}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-surface-tooltip text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
                {control.label}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-xs text-text-secondary space-y-1">
          <div>
            Tool:{" "}
            <span className="text-text-primary capitalize">
              {state.ui.tool}
            </span>
          </div>
          <div>
            Zoom:{" "}
            <span className="text-text-primary">
              {Math.round(state.ui.zoom * 100)}%
            </span>
          </div>
          {state.ui.selectedIds && state.ui.selectedIds.length > 0 && (
            <div>
              Sel:{" "}
              <span className="text-text-primary">
                {state.ui.selectedIds.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
