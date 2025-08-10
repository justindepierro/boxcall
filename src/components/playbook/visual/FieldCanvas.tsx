import React, { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Button } from "../../ui/Button";
import type { Play } from "../../../types/play";
import { PlayerPositionSystem } from "./PlayerPositionSystem";
import { RouteDrawingSystem } from "./RouteDrawingSystem";
interface FieldCanvasProps {
  play?: Play; // Play data to visualize
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  onRouteUpdate?: (playerId: string, route: Record<string, unknown>) => void;
  readOnly?: boolean;
  className?: string;
}
interface FieldDimensions {
  width: number;
  height: number;
  yardWidth: number;
  fieldWidth: number;
  fieldHeight: number;
}
export const FieldCanvas: React.FC<FieldCanvasProps> = ({
  play,
  onPlayerMove: _onPlayerMove,
  onRouteUpdate: _onRouteUpdate,
  readOnly = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<FieldDimensions>({
    width: 800,
    height: 400,
    yardWidth: 6,
    fieldWidth: 720,
    fieldHeight: 360,
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  // Calculate responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const aspectRatio = 2; // Football field is roughly 2:1 (120 yards x 53.3 yards)
        const width = Math.min(containerWidth - 32, 800); // 32px for padding
        const height = width / aspectRatio;
        const yardWidth = width / 120; // 120 yards including end zones
        setDimensions({
          width,
          height,
          yardWidth,
          fieldWidth: width * 0.9, // Leave some margin
          fieldHeight: height * 0.9,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  // Generate yard lines
  const generateYardLines = () => {
    const lines = [];
    for (let yard = 0; yard <= 120; yard += 5) {
      const x = (yard / 120) * dimensions.fieldWidth;
      const isMainLine = yard % 10 === 0;
      const isMidfield = yard === 60;
      lines.push(
        <line
          key={`yard-${yard}`}
          x1={x}
          y1={0}
          x2={x}
          y2={dimensions.fieldHeight}
          stroke={isMidfield ? "#ffffff" : isMainLine ? "#e2e8f0" : "#f1f5f9"}
          strokeWidth={isMidfield ? 2 : isMainLine ? 1.5 : 1}
        />
      );
      // Add yard numbers for main lines
      if (isMainLine && yard > 0 && yard < 120) {
        const yardNumber = yard <= 60 ? yard : 120 - yard;
        if (yardNumber !== 60) {
          lines.push(
            <text
              key={`yard-number-${yard}`}
              x={x}
              y={20}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
              className="font-mono"
            >
              {yardNumber}
            </text>
          );
        }
      }
    }
    return lines;
  };
  // Generate hash marks
  const generateHashMarks = () => {
    const hashMarks = [];
    const hashY1 = dimensions.fieldHeight * 0.3; // Left hash
    const hashY2 = dimensions.fieldHeight * 0.7; // Right hash
    for (let yard = 1; yard < 120; yard++) {
      const x = (yard / 120) * dimensions.fieldWidth;
      hashMarks.push(
        <g key={`hash-${yard}`}>
          <line
            x1={x}
            y1={hashY1 - 8}
            x2={x}
            y2={hashY1 + 8}
            stroke="#94a3b8"
            strokeWidth={1}
          />
          <line
            x1={x}
            y1={hashY2 - 8}
            x2={x}
            y2={hashY2 + 8}
            stroke="#94a3b8"
            strokeWidth={1}
          />
        </g>
      );
    }
    return hashMarks;
  };
  const handleZoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || readOnly) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  return (
    <div
      className={`relative surface-card rounded-lg border-subtle overflow-hidden ${className}`}
    >
      {/* Controls */}
      {!readOnly && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 surface-subtle rounded-lg shadow-sm border-subtle p-2">
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="xs"
            className="p-1 h-auto"
            title="Zoom In"
            icon={<ZoomIn className="h-4 w-4 text-slate-600" />}
            iconPosition="only"
            aria-label="Zoom in"
          />
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="xs"
            className="p-1 h-auto"
            title="Zoom Out"
            icon={<ZoomOut className="h-4 w-4 text-slate-600" />}
            iconPosition="only"
            aria-label="Zoom out"
          />
          <Button
            onClick={handleResetView}
            variant="ghost"
            size="xs"
            className="p-1 h-auto"
            title="Reset View"
            icon={<RotateCcw className="h-4 w-4 text-slate-600" />}
            iconPosition="only"
            aria-label="Reset view"
          />
          <div className="w-px h-4 bg-slate-300" />
          <Move className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">Drag to pan</span>
        </div>
      )}
      {/* Field Container */}
      <div
        ref={containerRef}
        className="w-full h-full p-4"
        style={{ minHeight: "400px" }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="border border-slate-300 rounded-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Field Background */}
          <rect
            width={dimensions.fieldWidth}
            height={dimensions.fieldHeight}
            fill="#22c55e" // Football field green
            rx={8}
          />
          {/* End Zones */}
          <rect
            x={0}
            y={0}
            width={dimensions.fieldWidth * 0.1}
            height={dimensions.fieldHeight}
            fill="#16a34a"
            opacity={0.8}
          />
          <rect
            x={dimensions.fieldWidth * 0.9}
            y={0}
            width={dimensions.fieldWidth * 0.1}
            height={dimensions.fieldHeight}
            fill="#16a34a"
            opacity={0.8}
          />
          {/* Transform group for zoom and pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Yard Lines */}
            <g>{generateYardLines()}</g>
            {/* Hash Marks */}
            <g>{generateHashMarks()}</g>
            {/* Midfield Logo Area */}
            <circle
              cx={dimensions.fieldWidth / 2}
              cy={dimensions.fieldHeight / 2}
              r="20"
              fill="rgba(255, 255, 255, 0.1)"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={dimensions.fieldWidth / 2}
              y={dimensions.fieldHeight / 2 + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#ffffff"
              className="font-bold"
            >
              50
            </text>
            {/* Players and Routes */}
            {play && (
              <g>
                {/* Render Players */}
                <PlayerPositionSystem
                  play={play}
                  fieldWidth={dimensions.fieldWidth}
                  fieldHeight={dimensions.fieldHeight}
                  readOnly={readOnly}
                  showLabels={true}
                />
                {/* Render Routes */}
                <RouteDrawingSystem
                  players={[]} // Will be populated with formation players
                  routes={[]} // Will be populated with demo routes
                  fieldWidth={dimensions.fieldWidth}
                  fieldHeight={dimensions.fieldHeight}
                  isDrawing={false}
                />
                {/* Play Name */}
                <text
                  x={dimensions.fieldWidth / 2}
                  y={dimensions.fieldHeight - 30}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#1f2937"
                  className="font-medium"
                >
                  {play.play_name}
                  {play.one_word_play && ` ("${play.one_word_play}")`}
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>
      {/* Field Info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <div className="text-xs text-slate-600 space-y-1">
          <div>Zoom: {Math.round(zoom * 100)}%</div>
          <div>Field: 120 × 53.3 yards</div>
          {play && (
            <div className="font-medium text-jade-600">
              {play.formation} Formation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
