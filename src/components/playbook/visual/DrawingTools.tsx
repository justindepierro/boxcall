import React, { useState } from "react";
import { Button } from "../../ui/Button";
import * as fabric from "fabric";
import { Typography } from "@components/design-system/Typography";
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
    <div className="bg-white rounded-lg shadow-sm border border-subtle p-3 space-y-3">
      <Typography
        variant="body-sm"
        as="div"
        className="font-medium text-slate-700"
      >
        Drawing Tools
      </Typography>
      {/* Tool Selection */}
      <div className="grid grid-cols-3 gap-1">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            variant={selectedTool === tool.id ? "primary" : "ghost"}
            size="xs"
            className="p-2 h-auto flex flex-col border border-subtle"
            title={tool.label}
          >
            <span className="text-center leading-none mb-1">{tool.icon}</span>
            <span className="text-center text-[10px]">
              {tool.label.split(" ")[0]}
            </span>
          </Button>
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
            <Button
              key={color}
              onClick={() => setSelectedColor(color)}
              variant={selectedColor === color ? "outline" : "ghost"}
              size="xs"
              className="w-6 h-6 p-0 min-w-0 border-2"
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
          {[
            { text: "5 YDS", style: "yard-marker" },
            { text: "10 YDS", style: "yard-marker" },
            { text: "HOT", style: "alert" },
            { text: "ALERT", style: "alert" },
          ].map((item) => (
            <Button
              key={item.text}
              onClick={() => addTextAnnotation(item.text, item.style)}
              variant="ghost"
              size="xs"
              className="px-2 py-1 text-xs border border-subtle bg-slate-100 hover:bg-slate-200"
            >
              {item.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
