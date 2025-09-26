import React, { useState, useCallback } from "react";
import { useDiagramEditor } from "../context/useDiagramEditor";
import { ShapeEngine } from "../engine/ShapeEngine";
import type { Point, DiagramElement } from "../engine/ShapeEngine";
import {
  Minus,
  ArrowRight,
  Zap,
  Circle,
  Square,
  Triangle,
  Pen,
  Settings,
} from "lucide-react";

interface DrawingToolsProps {
  className?: string;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  className = "",
}) => {
  const { state, dispatch } = useDiagramEditor();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [_drawingState, _setDrawingState] = useState<{
    isDrawing: boolean;
    startPoint: Point | null;
    currentPoint: Point | null;
    tool: string | null;
  }>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    tool: null,
  });

  const drawingTools = [
    {
      id: "line",
      icon: <Minus size={16} />,
      label: "Line",
      shortcut: "L",
      action: () => handleToolSelect("line"),
    },
    {
      id: "arrow",
      icon: <ArrowRight size={16} />,
      label: "Arrow",
      shortcut: "A",
      action: () => handleToolSelect("arrow"),
    },
    {
      id: "curve",
      icon: <Zap size={16} />,
      label: "Curve",
      shortcut: "C",
      action: () => handleToolSelect("curve"),
    },
    {
      id: "circle",
      icon: <Circle size={16} />,
      label: "Circle",
      shortcut: "O",
      action: () => handleToolSelect("circle"),
    },
    {
      id: "rectangle",
      icon: <Square size={16} />,
      label: "Rectangle",
      shortcut: "R",
      action: () => handleToolSelect("rectangle"),
    },
    {
      id: "zone",
      icon: <Triangle size={16} />,
      label: "Zone",
      shortcut: "Z",
      action: () => handleToolSelect("zone"),
    },
    {
      id: "freehand",
      icon: <Pen size={16} />,
      label: "Freehand",
      shortcut: "F",
      action: () => handleToolSelect("freehand"),
    },
  ];

  const colorOptions = [
    "#000000", // Black
    "#ef4444", // Red
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#6b7280", // Gray
  ];

  const widthOptions = [1, 2, 3, 4, 5, 8, 12];

  const handleToolSelect = useCallback(
    (toolId: string) => {
      setSelectedTool(toolId);
      dispatch({ type: "SET_TOOL", tool: "draw" });
      dispatch({ type: "SET_DRAW_MODE", mode: toolId as any });
    },
    [dispatch]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      dispatch({ type: "SET_DRAW_COLOR", color });
    },
    [dispatch]
  );

  const handleWidthChange = useCallback(
    (width: number) => {
      dispatch({ type: "SET_DRAW_WIDTH", width });
    },
    [dispatch]
  );

  const _createDrawingElement = useCallback(
    (
      tool: string,
      startPoint: Point,
      endPoint: Point
    ): DiagramElement | null => {
      const bounds = ShapeEngine.calculateRouteBounds([
        { start: startPoint, end: endPoint },
      ]);

      switch (tool) {
        case "line":
          return ShapeEngine.createShapeElement(
            "line",
            {
              x: Math.min(startPoint.x, endPoint.x),
              y: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(endPoint.x - startPoint.x),
              height: Math.abs(endPoint.y - startPoint.y),
            },
            {
              stroke: state.ui.drawColor || "#000000",
              strokeWidth: state.ui.drawWidth || 2,
            }
          );

        case "arrow":
          return ShapeEngine.createShapeElement("arrow", bounds, {
            stroke: state.ui.drawColor || "#000000",
            strokeWidth: state.ui.drawWidth || 2,
          });

        case "circle": {
          const radius = ShapeEngine.distance(startPoint, endPoint) / 2;
          return ShapeEngine.createShapeElement(
            "circle",
            {
              x: startPoint.x - radius,
              y: startPoint.y - radius,
              width: radius * 2,
              height: radius * 2,
            },
            {
              stroke: state.ui.drawColor || "#000000",
              strokeWidth: state.ui.drawWidth || 2,
              fill: "transparent",
            }
          );
        }

        case "rectangle":
          return ShapeEngine.createShapeElement(
            "rectangle",
            {
              x: Math.min(startPoint.x, endPoint.x),
              y: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(endPoint.x - startPoint.x),
              height: Math.abs(endPoint.y - startPoint.y),
            },
            {
              stroke: state.ui.drawColor || "#000000",
              strokeWidth: state.ui.drawWidth || 2,
              fill: "transparent",
            }
          );

        case "zone":
          // Create a zone shape (could be a polygon or special shape)
          return ShapeEngine.createShapeElement("zone", bounds, {
            fill: (state.ui.drawColor || "#3b82f6") + "40", // Add transparency
            stroke: state.ui.drawColor || "#3b82f6",
            strokeWidth: state.ui.drawWidth || 2,
          });

        default:
          return null;
      }
    },
    [state.ui.drawColor, state.ui.drawWidth]
  );

  // Drawing event handlers (would be used by parent component)
  // const startDrawing = useCallback((point: Point) => {
  //   if (!selectedTool) return;
  //   setDrawingState({
  //     isDrawing: true,
  //     startPoint: point,
  //     currentPoint: point,
  //     tool: selectedTool
  //   });
  // }, [selectedTool]);

  // const updateDrawing = useCallback((point: Point) => {
  //   if (!drawingState.isDrawing) return;
  //   setDrawingState(prev => ({
  //     ...prev,
  //     currentPoint: point
  //   }));
  // }, [drawingState.isDrawing]);

  // const finishDrawing = useCallback(() => {
  //   if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) return;
  //   const element = createDrawingElement(
  //     drawingState.tool!,
  //     drawingState.startPoint,
  //     drawingState.currentPoint
  //   );
  //   if (element) {
  //     dispatch({ type: 'COMMIT_ANNOTATION' });
  //   }
  //   setDrawingState({
  //     isDrawing: false,
  //     startPoint: null,
  //     currentPoint: null,
  //     tool: null
  //   });
  // }, [drawingState, createDrawingElement, dispatch]);

  return (
    <div
      className={`bg-surface-card border border-border rounded-lg p-3 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">Drawing Tools</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-surface-secondary rounded"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {drawingTools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.action}
            className={`group relative p-2 rounded border transition-all duration-200 flex flex-col items-center justify-center text-xs ${
              selectedTool === tool.id
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-surface-card border-border hover:border-primary/50 hover:bg-surface-secondary text-text-primary"
            }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.icon}
            <span className="mt-1">{tool.shortcut}</span>

            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-surface-tooltip text-text-primary text-xs px-2 py-1 rounded whitespace-nowrap">
                {tool.label}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Options */}
      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Color Picker */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              Color
            </label>
            <div className="flex gap-1 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    state.ui.drawColor === color
                      ? "border-primary scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Width Selector */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              Width
            </label>
            <div className="flex gap-1">
              {widthOptions.map((width) => (
                <button
                  key={width}
                  onClick={() => handleWidthChange(width)}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    state.ui.drawWidth === width
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-surface-card border-border hover:border-primary/50 text-text-primary"
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          {/* Arrow Head Toggle */}
          {(selectedTool === "arrow" || selectedTool === "line") && (
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">
                Arrow Head
              </label>
              <div className="flex gap-1">
                {["none", "start", "end", "both"].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      dispatch({
                        type: "SET_DRAW_ARROW_HEAD",
                        arrowHead: option as "none" | "start" | "end" | "both",
                      })
                    }
                    className={`px-2 py-1 text-xs rounded border transition-all capitalize ${
                      state.ui.drawArrowHead === option
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-surface-card border-border hover:border-primary/50 text-text-primary"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Settings */}
      <div className="text-xs text-text-secondary pt-2 border-t border-border">
        <div>Tool: {selectedTool || "None"}</div>
        <div>
          Color:{" "}
          <span
            className="inline-block w-3 h-3 rounded border border-border"
            style={{ backgroundColor: state.ui.drawColor || "#000000" }}
          />
        </div>
        <div>Width: {state.ui.drawWidth || 2}px</div>
      </div>
    </div>
  );
};
