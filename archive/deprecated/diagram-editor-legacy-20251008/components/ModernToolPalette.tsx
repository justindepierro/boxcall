import React, { useState } from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import {
  MousePointer2,
  Hand,
  Circle,
  Square,
  Triangle,
  Minus,
  Pen,
  Zap,
  MoreHorizontal,
} from "lucide-react";

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  shortcut?: string;
  sizeClass: string;
  badge?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  shortcut,
  sizeClass,
  badge,
}) => (
  <button
    onClick={onClick}
    className={`group relative ${sizeClass} rounded-lg border-2 transition-all duration-200 flex items-center justify-center font-medium ${
      isActive
        ? "bg-brand-primary border-brand-primary text-white shadow-xl shadow-brand-primary/50 scale-105"
        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-brand-primary hover:bg-brand-primary/10 hover:scale-105 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg"
    }`}
    title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
  >
    <div className={isActive ? "scale-110" : ""}>{icon}</div>
    {badge && (
      <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-xs px-1 rounded-full leading-none">
        {badge}
      </span>
    )}
  </button>
);

interface ModernToolPaletteProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
}

export const ModernToolPalette: React.FC<ModernToolPaletteProps> = ({
  orientation = "vertical",
  className = "",
}) => {
  const { state, dispatch } = useDiagramEditor();
  const [showLineStyles, setShowLineStyles] = useState(false);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Basic tools
  const basicTools = [
    {
      id: "select",
      icon: <MousePointer2 size={20} />,
      label: "Select & Move",
      shortcut: "V",
      action: () => dispatch({ type: "SET_TOOL", tool: "select" }),
    },
    {
      id: "pan",
      icon: <Hand size={20} />,
      label: "Pan View",
      shortcut: "H",
      action: () => dispatch({ type: "SET_TOOL", tool: "pan" }),
    },
  ];

  // Shape tools for players
  const shapeTools = [
    {
      id: "oval" as const,
      icon: <Circle size={20} />,
      label: "Oval Player",
      shortcut: "O",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "add-player" });
        dispatch({ type: "SET_PLAYER_SHAPE", shape: "oval" });
      },
    },
    {
      id: "rectangle" as const,
      icon: <Square size={20} />,
      label: "Rectangle Player",
      shortcut: "R",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "add-player" });
        dispatch({ type: "SET_PLAYER_SHAPE", shape: "rectangle" });
      },
    },
    {
      id: "triangle" as const,
      icon: <Triangle size={20} className="rotate-180" />,
      label: "Triangle Player",
      shortcut: "T",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "add-player" });
        dispatch({ type: "SET_PLAYER_SHAPE", shape: "triangle" });
      },
    },
  ];

  // Line drawing tools
  const lineTools = [
    {
      id: "line",
      icon: <Minus size={20} />,
      label: "Straight Line",
      shortcut: "L",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "line" });
      },
    },
    {
      id: "curve",
      icon: <Zap size={20} />,
      label: "Curved Line",
      shortcut: "C",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "curve" });
      },
    },
    {
      id: "freehand",
      icon: <Pen size={20} />,
      label: "Freehand Draw",
      shortcut: "F",
      action: () => {
        dispatch({ type: "SET_TOOL", tool: "draw" });
        dispatch({ type: "SET_DRAW_MODE", mode: "freehand" });
      },
    },
  ];

  // Line style options
  const lineStyles = [
    {
      id: "solid",
      label: "Solid",
      icon: <div className="w-6 h-0.5 bg-current" />,
      action: () => {
        dispatch({ type: "SET_DRAW_MODE", mode: "line" });
      },
    },
    {
      id: "dashed",
      label: "Dashed",
      icon: <div className="flex gap-1"><div className="w-2 h-0.5 bg-current" /><div className="w-2 h-0.5 bg-current" /></div>,
      action: () => {
        dispatch({ type: "SET_DRAW_MODE", mode: "dashed" });
      },
    },
    {
      id: "dotted",
      label: "Dotted",
      icon: <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /><div className="w-1 h-1 rounded-full bg-current" /></div>,
      action: () => {
        dispatch({ type: "SET_DRAW_MODE", mode: "dotted" });
      },
    },
    {
      id: "zigzag",
      label: "Zigzag",
      icon: <svg width="24" height="12" viewBox="0 0 24 12" className="stroke-current" fill="none"><path d="M0 6 L6 0 L12 6 L18 0 L24 6" strokeWidth="2" /></svg>,
      action: () => {
        dispatch({ type: "SET_DRAW_MODE", mode: "zigzag" });
      },
    },
  ];

  // Endpoint styles
  const endpointStyles = [
    {
      id: "none",
      label: "No Arrow",
      icon: <Minus size={16} />,
      action: () => {
        dispatch({ type: "SET_DRAW_ARROW_HEAD", arrowHead: "none" });
      },
    },
    {
      id: "end",
      label: "Arrow End",
      icon: <span className="text-sm">→</span>,
      action: () => {
        dispatch({ type: "SET_DRAW_ARROW_HEAD", arrowHead: "end" });
      },
    },
    {
      id: "start",
      label: "Arrow Start",
      icon: <span className="text-sm">←</span>,
      action: () => {
        dispatch({ type: "SET_DRAW_ARROW_HEAD", arrowHead: "start" });
      },
    },
    {
      id: "both",
      label: "Both Arrows",
      icon: <span className="text-sm">↔</span>,
      action: () => {
        dispatch({ type: "SET_DRAW_ARROW_HEAD", arrowHead: "both" });
      },
    },
  ];

  const containerClasses =
    orientation === "vertical"
      ? "flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl"
      : "flex flex-wrap gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-2xl items-center";
  const separator =
    orientation === "vertical" ? (
      <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-2" />
    ) : (
      <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-2" />
    );
  const buttonSizeClass = orientation === "vertical" ? "w-14 h-14" : "w-12 h-12";

  const currentDrawMode = state.ui.drawMode || "line";
  const currentArrowHead = state.ui.drawArrowHead || "none";

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Basic Tools */}
      <div className="text-xs text-content-secondary font-medium px-1 mb-1">Tools</div>
      {basicTools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          isActive={state.ui.tool === tool.id}
          onClick={tool.action}
          sizeClass={buttonSizeClass}
        />
      ))}

      {separator}

      {/* Shape Tools */}
      <div className="text-xs text-content-secondary font-medium px-1 mb-1">Shapes</div>
      {shapeTools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          isActive={state.ui.tool === "add-player" && state.ui.playerShape === tool.id}
          onClick={tool.action}
          sizeClass={buttonSizeClass}
        />
      ))}

      {separator}

      {/* Line Tools */}
      <div className="text-xs text-content-secondary font-medium px-1 mb-1">Lines</div>
      {lineTools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          isActive={state.ui.tool === "draw" && state.ui.drawMode === tool.id}
          onClick={tool.action}
          sizeClass={buttonSizeClass}
        />
      ))}

      {separator}

      {/* Line Style Toggle */}
      <button
        onClick={() => setShowLineStyles(!showLineStyles)}
        className={`${buttonSizeClass} rounded-lg border transition-all duration-200 flex items-center justify-center ${
          showLineStyles
            ? "bg-brand-primary/20 border-brand-primary text-brand-primary"
            : "bg-surface-secondary border-border hover:border-brand-primary/50 text-content-secondary"
        }`}
        title="Line Styles"
      >
        <MoreHorizontal size={20} />
      </button>

      {/* Line Styles (collapsible) */}
      {showLineStyles && (
        <>
          <div className="text-xs text-content-secondary font-medium px-1 mb-1">Style</div>
          {lineStyles.map((style) => (
            <ToolButton
              key={style.id}
              icon={style.icon}
              label={style.label}
              isActive={currentDrawMode === style.id}
              onClick={style.action}
              sizeClass={buttonSizeClass}
            />
          ))}
        </>
      )}

      {/* Endpoint Toggle */}
      <button
        onClick={() => setShowEndpoints(!showEndpoints)}
        className={`${buttonSizeClass} rounded-lg border transition-all duration-200 flex items-center justify-center ${
          showEndpoints
            ? "bg-brand-primary/20 border-brand-primary text-brand-primary"
            : "bg-surface-secondary border-border hover:border-brand-primary/50 text-content-secondary"
        }`}
        title="Endpoints"
      >
        <span className="text-lg">→</span>
      </button>

      {/* Endpoints (collapsible) */}
      {showEndpoints && (
        <>
          <div className="text-xs text-content-secondary font-medium px-1 mb-1">Arrows</div>
          {endpointStyles.map((style) => (
            <ToolButton
              key={style.id}
              icon={style.icon}
              label={style.label}
              isActive={currentArrowHead === style.id}
              onClick={style.action}
              sizeClass={buttonSizeClass}
            />
          ))}
        </>
      )}

      {separator}

      {/* Color Picker Toggle */}
      <button
        onClick={() => setShowColorPicker(!showColorPicker)}
        className={`${buttonSizeClass} rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
          showColorPicker
            ? "bg-brand-primary/20 border-brand-primary text-brand-primary"
            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-brand-primary/50 text-slate-700 dark:text-slate-200"
        }`}
        title="Color"
      >
        <div 
          className="w-6 h-6 rounded border-2 border-current"
          style={{ backgroundColor: state.ui.drawColor || "#6366F1" }}
        />
      </button>

      {/* Color Picker (collapsible) */}
      {showColorPicker && (
        <>
          <div className="text-xs text-content-secondary font-medium px-1 mb-1">Color</div>
          <div className="grid grid-cols-4 gap-2 p-2">
            {[
              { color: "#6366F1", label: "Blue" },
              { color: "#EF4444", label: "Red" },
              { color: "#10B981", label: "Green" },
              { color: "#F59E0B", label: "Amber" },
              { color: "#8B5CF6", label: "Purple" },
              { color: "#EC4899", label: "Pink" },
              { color: "#06B6D4", label: "Cyan" },
              { color: "#64748B", label: "Slate" },
              { color: "#000000", label: "Black" },
              { color: "#FFFFFF", label: "White", border: true },
              { color: "#F97316", label: "Orange" },
              { color: "#14B8A6", label: "Teal" },
            ].map(({ color, label, border }) => (
              <button
                key={color}
                onClick={() => dispatch({ type: "SET_DRAW_COLOR", color })}
                className={`w-10 h-10 rounded-lg transition-all hover:scale-110 shadow-md ${
                  state.ui.drawColor === color
                    ? "border-4 border-brand-primary scale-110 shadow-xl"
                    : border
                    ? "border-2 border-slate-400 dark:border-slate-500"
                    : "border-2 border-transparent"
                }`}
                style={{ backgroundColor: color }}
                title={label}
                aria-label={label}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
