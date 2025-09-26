import React from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import {
  MousePointer2,
  User,
  Route,
  Hand,
  Minus,
  ArrowRight,
  Zap,
  Triangle,
  Pen,
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
        : "bg-surface-card border-border hover:border-primary/50 hover:bg-surface-secondary text-content-primary"
    }`}
    title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
  >
    {icon}
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
  ];

  const drawingTools = [
    {
      id: "line",
      icon: <Minus size={20} />,
      label: "Line",
      shortcut: "L",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "line" });
      },
    },
    {
      id: "arrow",
      icon: <ArrowRight size={20} />,
      label: "Arrow",
      shortcut: "A",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "arrow" });
      },
    },
    {
      id: "curve",
      icon: <Zap size={20} />,
      label: "Curve",
      shortcut: "C",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "curve" });
      },
    },
    {
      id: "zone",
      icon: <Triangle size={20} />,
      label: "Zone",
      shortcut: "Z",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "zone" });
      },
    },
    {
      id: "freehand",
      icon: <Pen size={20} />,
      label: "Freehand",
      shortcut: "F",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "freehand" });
      },
    },
  ];

  return (
    <div className="flex flex-col gap-1 p-2 bg-surface-card">
      {/* Main Tools */}
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

      {/* Separator */}
      <div className="h-px bg-border my-2"></div>

      {/* Drawing Tools */}
      {drawingTools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          isActive={state.ui.tool === "draw" && state.ui.drawMode === tool.id}
          onClick={tool.action}
        />
      ))}

      {/* Separator */}
      <div className="h-px bg-border my-2"></div>

      {/* Quick Actions */}
      <ToolButton
        icon={<span className="text-sm">🗑️</span>}
        label="Clear Diagram"
        isActive={false}
        onClick={() => {
          state.doc.players.forEach((player) => {
            dispatch({ type: "REMOVE_PLAYER", id: player.id });
          });
        }}
      />
    </div>
  );
};
