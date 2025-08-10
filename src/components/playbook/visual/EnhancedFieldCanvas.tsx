import React, { useRef, useEffect, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import * as fabric from "fabric";
import type { Play } from "../../../types/play";
import {
  FORMATION_TEMPLATES,
  getPositionColor,
  isOffensiveLine,
} from "./formationConstants";
import { FieldBackground } from "./FieldBackgrounds";
import { DrawingTools } from "./DrawingTools";
interface EnhancedFieldCanvasProps {
  play?: Play;
  onPlayerMove?: (playerId: string, x: number, y: number) => void;
  onRouteUpdate?: (playerId: string, route: Record<string, unknown>) => void;
  readOnly?: boolean;
  className?: string;
  lineOfScrimmage?: number; // Yard line (0-100)
}
type FieldMode = "football" | "redzone" | "blank" | "lines" | "grid" | "dots";
export const EnhancedFieldCanvas: React.FC<EnhancedFieldCanvasProps> = ({
  play,
  onPlayerMove,
  readOnly = false,
  className = "",
  lineOfScrimmage = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [fieldMode, setFieldMode] = useState<FieldMode>("football");
  const [zoom, setZoom] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [selectedTool, setSelectedTool] = useState("select");
  // Canvas dimensions - proper football field aspect ratio
  // 53.33 yards wide, 40 yards visible (10 behind LOS + 30 ahead)
  const FIELD_WIDTH = 800;
  const FIELD_HEIGHT = 600; // 800 * (40/53.33) ≈ 600
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3.0;
  // Setup players based on formation with proper field orientation
  const setupPlayers = useCallback(
    (canvas: fabric.Canvas, playData: Play) => {
      if (!canvas) return;
      // Clear existing players
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        if (obj.get("isPlayer") || obj.get("isPlayerLabel")) {
          canvas.remove(obj);
        }
      });
      const formation = playData.formation || "Shotgun";
      const players = FORMATION_TEMPLATES[formation] || [];
      players.forEach((player) => {
        // Convert formation coordinates to field coordinates
        // Formation X (0-100) maps to field width (sideline to sideline)
        // Formation Y (0-100) maps to field depth (behind LOS to downfield)
        const x = (player.x / 100) * FIELD_WIDTH;
        // Y coordinate: 25% of field = Line of Scrimmage
        // Player Y of 50 = at LOS, 0 = 10 yards behind, 100 = 30 yards ahead
        const y = FIELD_HEIGHT * (0.25 + ((player.y - 50) / 100) * 0.75);
        const color = getPositionColor(player.position);
        const isOLine = isOffensiveLine(player.position);
        const radius = isOLine ? 8 : 12;
        // Create player circle
        const playerCircle = new fabric.Circle({
          left: x,
          top: y,
          radius: radius,
          fill: color,
          stroke: "#ffffff",
          strokeWidth: 2,
          originX: "center",
          originY: "center",
          selectable: !readOnly,
          moveCursor: readOnly ? "default" : "move",
        });
        // Add custom properties
        playerCircle.set("playerId", player.id);
        playerCircle.set("playerPosition", player.position);
        playerCircle.set("isPlayer", true);
        playerCircle.set("originalX", x);
        playerCircle.set("originalY", y);
        canvas.add(playerCircle);
        // Player number
        if (player.number) {
          const playerNumber = new fabric.Text(player.number.toString(), {
            left: x,
            top: y,
            fontSize: isOLine ? 8 : 10,
            fill: "#ffffff",
            fontWeight: "bold",
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
          });
          playerNumber.set("playerId", player.id);
          playerNumber.set("isPlayerLabel", true);
          playerNumber.set("labelType", "number");
          canvas.add(playerNumber);
        }
        // Position label
        const positionLabel = new fabric.Text(player.position, {
          left: x,
          top: y - (radius + 15),
          fontSize: 10,
          fill: fieldMode === "football" ? "#ffffff" : "#1f2937",
          fontWeight: "bold",
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        });
        positionLabel.set("playerId", player.id);
        positionLabel.set("isPlayerLabel", true);
        positionLabel.set("labelType", "position");
        canvas.add(positionLabel);
      });
      canvas.renderAll();
    },
    [readOnly, fieldMode]
  );
  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      backgroundColor: "transparent",
      selection: !readOnly,
      interactive: !readOnly,
      preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;
    // Set up players if play is provided
    if (play) {
      setupPlayers(canvas, play);
    }
    // Event handlers for player movement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("object:moving", (e: any) => {
      const obj = e.target;
      if (!obj || !obj.get("isPlayer")) return;
      // Constrain movement to field bounds with padding
      const bounds = {
        left: 15,
        top: 15,
        right: FIELD_WIDTH - 15,
        bottom: FIELD_HEIGHT - 15,
      };
      if (obj.left! < bounds.left) obj.left = bounds.left;
      if (obj.top! < bounds.top) obj.top = bounds.top;
      if (obj.left! > bounds.right) obj.left = bounds.right;
      if (obj.top! > bounds.bottom) obj.top = bounds.bottom;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("object:modified", (e: any) => {
      const obj = e.target;
      if (!obj || !obj.get("isPlayer") || !obj.get("playerId")) return;
      // Update related objects (number and label)
      const playerId = obj.get("playerId");
      const relatedObjects = canvas
        .getObjects()
        .filter(
          (o: fabric.FabricObject) =>
            o.get("playerId") === playerId && o !== obj
        );
      relatedObjects.forEach((related: fabric.FabricObject) => {
        related.left = obj.left;
        if (
          related.get("isPlayerLabel") &&
          related.get("labelType") === "position"
        ) {
          related.top = obj.top! - 15; // Position label above
        } else {
          related.top = obj.top; // Number
        }
      });
      canvas.renderAll();
      // Notify parent
      if (onPlayerMove && playerId) {
        onPlayerMove(playerId, obj.left!, obj.top!);
      }
    });
    canvas.on("selection:created", (e) => {
      const obj = e.selected[0];
      if (obj && obj.get("isPlayer") && obj.get("playerId")) {
        setSelectedPlayer(obj.get("playerId"));
      }
    });
    canvas.on("selection:cleared", () => {
      setSelectedPlayer(null);
      setIsDrawingRoute(false);
    });
    return () => {
      canvas.dispose();
    };
  }, [play, readOnly, onPlayerMove, setupPlayers]);
  // Handle zoom changes
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, MAX_ZOOM);
    setZoom(newZoom);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(newZoom);
      fabricCanvasRef.current.renderAll();
    }
  };
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, MIN_ZOOM);
    setZoom(newZoom);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(newZoom);
      fabricCanvasRef.current.renderAll();
    }
  };
  const handleResetView = () => {
    setZoom(1);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(1);
      fabricCanvasRef.current.viewportTransform = [1, 0, 0, 1, 0, 0];
      fabricCanvasRef.current.renderAll();
    }
  };
  const resetPlayers = () => {
    if (!fabricCanvasRef.current || !play) return;
    setupPlayers(fabricCanvasRef.current, play);
  };
  const toggleRouteDrawing = () => {
    setIsDrawingRoute((prev) => !prev);
  };
  const fieldModeOptions: { value: FieldMode; label: string; icon: string }[] =
    [
      { value: "football", label: "Football Field", icon: "🏈" },
      { value: "redzone", label: "Red Zone", icon: "🔴" },
      { value: "blank", label: "Blank", icon: "⬜" },
      { value: "lines", label: "Lined Paper", icon: "📝" },
      { value: "grid", label: "Grid Paper", icon: "📊" },
      { value: "dots", label: "Dot Paper", icon: "⚫" },
    ];
  return (
    <div
      className={`relative surface-card rounded-lg border-subtle overflow-hidden ${className}`}
    >
      {/* Field Background */}
      <div
        ref={containerRef}
        className="relative"
        style={{ width: FIELD_WIDTH, height: FIELD_HEIGHT }}
      >
        <FieldBackground
          width={FIELD_WIDTH}
          height={FIELD_HEIGHT}
          mode={fieldMode}
          lineOfScrimmage={lineOfScrimmage}
        />
        {/* Fabric Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ zIndex: 10 }}
        />
      </div>
      {/* Controls */}
      {!readOnly && (
        <div className="absolute top-4 right-4 z-20 space-y-2">
          {/* Field Mode Selector */}
          <div className="surface-subtle rounded-lg shadow-sm border-subtle p-2">
            <div className="text-xs font-medium text-slate-600 mb-2">
              Background
            </div>
            <select
              value={fieldMode}
              onChange={(e) => setFieldMode(e.target.value as FieldMode)}
              className="w-full text-xs border border-slate-300 rounded px-2 py-1"
            >
              {fieldModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
          {/* Zoom Controls */}
          <div className="surface-subtle rounded-lg shadow-sm border-subtle p-2">
            <div className="flex items-center space-x-1">
              <Button
                size="xs"
                variant="ghost"
                onClick={handleZoomOut}
                className="p-1 h-auto w-auto hover:bg-slate-100 text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleZoomIn}
                className="p-1 h-auto w-auto hover:bg-slate-100 text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleResetView}
                className="p-1 h-auto w-auto hover:bg-slate-100 text-slate-600 ml-1"
                title="Reset View"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* Player Controls */}
          <div className="surface-subtle rounded-lg shadow-sm border-subtle p-2 space-y-2">
            <Button
              size="xs"
              variant={isDrawingRoute ? "danger" : "secondary"}
              onClick={toggleRouteDrawing}
              disabled={!selectedPlayer}
              fullWidth
              className="h-auto px-3 py-2"
            >
              {isDrawingRoute ? "Stop Drawing" : "Draw Route"}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={resetPlayers}
              fullWidth
              className="h-auto px-3 py-2"
            >
              Reset Positions
            </Button>
          </div>
        </div>
      )}
      {/* Drawing Tools */}
      {!readOnly && (
        <div className="absolute top-4 right-4 z-20">
          <DrawingTools
            canvas={fabricCanvasRef.current}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
          />
        </div>
      )}
      {/* Status Display */}
      {selectedPlayer && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3 z-20">
          <div className="text-sm">
            <div className="font-medium text-text-primary">Selected Player</div>
            <div className="text-text-secondary">{selectedPlayer}</div>
            {isDrawingRoute && (
              <div className="text-blue-600 mt-1">
                Click to add route points
              </div>
            )}
          </div>
        </div>
      )}
      {/* Field Info */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3 z-20">
        <div className="text-xs text-text-secondary space-y-1">
          <div className="font-medium capitalize">
            {fieldMode.replace("-", " ")} Mode
          </div>
          <div>LOS: {lineOfScrimmage} yard line</div>
          <div>View: 10yd behind to 30yd ahead</div>
          {play && (
            <div className="font-medium text-green-600">
              {play.formation} Formation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
