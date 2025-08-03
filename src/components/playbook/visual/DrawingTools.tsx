import React, { useState } from "react";
import * as fabric from "fabric";

interface DrawingToolsProps {
  canvas: fabric.Canvas | null;
  selectedTool: string;
  onToolChange: (tool: string) => void;
}

interface TextStyle {
  fontSize: number;
  fill: string;
  fontWeight: string;
  backgroundColor?: string;
}

const TEXT_STYLES: Record<string, TextStyle> = {
  "route-label": { fontSize: 12, fill: "#000000", fontWeight: "bold" },
  "yard-marker": { fontSize: 10, fill: "#dc2626", fontWeight: "bold" },
  "coaching-note": { fontSize: 11, fill: "#2563eb", fontWeight: "bold" },
  alert: {
    fontSize: 12,
    fill: "#dc2626",
    fontWeight: "bold",
    backgroundColor: "#fee2e2",
  },
};

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  canvas,
  selectedTool,
  onToolChange,
}) => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedRouteStyle, setSelectedRouteStyle] = useState("route-solid");

  // Add text annotation to canvas center
  const addTextAnnotation = (text: string, style: string) => {
    if (!canvas) return;

    const textStyle = TEXT_STYLES[style] || TEXT_STYLES["route-label"];
    const center = canvas.getCenterPoint();

    const textObj = new fabric.Text(text, {
      left: center.x,
      top: center.y,
      ...textStyle,
      originX: "center",
      originY: "center",
    });

    textObj.set("isAnnotation", true);
    textObj.set("annotationType", style);

    canvas.add(textObj);
    canvas.renderAll();
  };

  const tools = [
    { id: "select", label: "Select", icon: "↖️" },
    { id: "route-solid", label: "Solid Route", icon: "━" },
    { id: "route-dashed", label: "Dashed Route", icon: "┅" },
    { id: "arrow", label: "Arrow", icon: "→" },
    { id: "text", label: "Text", icon: "T" },
    { id: "player-QB", label: "QB", icon: "🔵" },
    { id: "player-RB", label: "RB", icon: "🔴" },
    { id: "player-WR", label: "WR", icon: "🟢" },
    { id: "player-TE", label: "TE", icon: "🟠" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 space-y-3">
      <div className="text-sm font-medium text-slate-700">Drawing Tools</div>

      {/* Tool Selection */}
      <div className="grid grid-cols-3 gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`p-2 text-xs rounded border transition-colors ${
              selectedTool === tool.id
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title={tool.label}
          >
            <span className="block text-center">{tool.icon}</span>
            <span className="block text-center mt-1">
              {tool.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Route Style Options */}
      {selectedTool.startsWith("route") && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-600">Route Style</div>
          <select
            value={selectedRouteStyle}
            onChange={(e) => setSelectedRouteStyle(e.target.value)}
            className="w-full text-xs border border-slate-300 rounded px-2 py-1"
          >
            <option value="route-solid">Solid Route</option>
            <option value="route-dashed">Dashed Route</option>
            <option value="route-hot">Hot Route (Red)</option>
            <option value="route-option">Option Route (Blue)</option>
            <option value="route-motion">Motion (Green)</option>
          </select>
        </div>
      )}

      {/* Color Picker */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-600">Color</div>
        <div className="flex space-x-1">
          {[
            "#000000",
            "#dc2626",
            "#2563eb",
            "#059669",
            "#f59e0b",
            "#8b5cf6",
          ].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded border-2 ${
                selectedColor === color
                  ? "border-slate-400"
                  : "border-slate-200"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Quick Add Annotations */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-600">
          Quick Annotations
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { text: "5 YDS", style: "yard-marker" },
            { text: "10 YDS", style: "yard-marker" },
            { text: "HOT", style: "alert" },
            { text: "ALERT", style: "alert" },
          ].map(({ text, style }) => (
            <button
              key={text}
              onClick={() => addTextAnnotation(text, style)}
              className="px-2 py-1 text-xs bg-slate-100 border border-slate-200 rounded hover:bg-slate-200"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
