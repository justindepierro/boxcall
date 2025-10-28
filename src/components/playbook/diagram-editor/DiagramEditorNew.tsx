/**
 * Unified Diagram Editor
 *
 * Professional NFL-quality playbook diagram editor
 * Starting with basic structure, will integrate all services
 */

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@components/ui/Button/Button";
import Card from "@components/ui/Card/Card";

// Core services (will integrate later)
import { PixiDiagramCanvas } from "@services/canvas/DiagramCanvas";
import { createFormationFromTemplate } from "@services/FormationPositioningEngine";

// Types
import type { UnifiedDiagramData } from "../../../types/diagram";
import type { RouteType } from "../../../types/field";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Format personnel grouping for display */
const formatPersonnel = (
  personnel: { rb: number; te: number; wr: number } | undefined
): string => {
  if (!personnel) return "N/A";
  const total = personnel.rb + personnel.te + personnel.wr;
  return `${total}${personnel.rb}${personnel.te}`;
};

// ============================================================================
// MAIN DIAGRAM EDITOR COMPONENT
// ============================================================================

interface DiagramEditorProps {
  initialData?: UnifiedDiagramData;
  diagramType?: "formation" | "play" | "template";
  onChange?: (data: UnifiedDiagramData) => void;
  onSave?: (data: UnifiedDiagramData) => void;
  readOnly?: boolean;
  width?: number;
  height?: number;
  enableRoutes?: boolean;
  enablePlayerEditing?: boolean;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialData,
  diagramType = "play",
  onChange,
  onSave,
  readOnly = false,
  width = 1200,
  height = 600,
  enableRoutes = true,
  enablePlayerEditing = true,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [diagramData, setDiagramData] = useState<UnifiedDiagramData | null>(
    null
  );
  const [canvas, setCanvas] = useState<PixiDiagramCanvas | null>(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const [currentRouteType, setCurrentRouteType] =
    useState<RouteType>("primary");

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const newCanvas = new PixiDiagramCanvas({
      width,
      height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });
    newCanvas.initialize(canvasRef.current);

    // Create new diagram or load existing
    const formation = createFormationFromTemplate("I-Formation-11");
    if (!formation) {
      console.error("Failed to create formation");
      return;
    }

    const diagramDataToLoad = initialData || {
      id: `diagram-${Date.now()}`,
      type: diagramType,
      name: "New Diagram",
      description: "",
      formation,
      playData:
        diagramType === "play"
          ? {
              id: `play-${Date.now()}`,
              name: "New Play",
              category: "run",
              formationId: formation.id,
              routes: [],
              assignments: [],
            }
          : undefined,
      canvas: {
        zoom: 1,
        panX: 0,
        panY: 0,
        width,
        height,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Load formation players
    diagramDataToLoad.formation.players.forEach((player) => {
      newCanvas.addPlayer(player as any); // Type cast for now
    });

    setDiagramData(diagramDataToLoad);
    setCanvas(newCanvas);

    return () => {
      newCanvas.destroy();
    };
  }, [width, height, initialData, diagramType]);

  const saveDiagram = () => {
    if (!diagramData) return;
    onSave?.(diagramData);
  };

  const applyFormationTemplate = (templateKey: string) => {
    if (!canvas || !diagramData) return;

    const formation = createFormationFromTemplate(templateKey);
    if (!formation) {
      console.error("Failed to create formation from template:", templateKey);
      return;
    }

    // Clear existing players
    diagramData.formation.players.forEach((player) => {
      canvas.removePlayer(player.id);
    });

    // Add new players
    formation.players.forEach((player) => {
      canvas.addPlayer(player as any); // Type cast for now
    });

    const updatedData = {
      ...diagramData,
      formation: formation as any, // Type cast for now
      updatedAt: new Date().toISOString(),
    };

    setDiagramData(updatedData);
    onChange?.(updatedData);
  };

  return (
    <div className="diagram-editor flex flex-col h-full bg-neutral-900">
      {/* Toolbar */}
      <div className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={selectedTool === "select" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedTool("select")}
            >
              Select
            </Button>
            {enablePlayerEditing && (
              <Button
                variant={selectedTool === "player" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedTool("player")}
              >
                Move Players
              </Button>
            )}
            {enableRoutes && (
              <Button
                variant={selectedTool === "route" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedTool("route")}
              >
                Draw Routes
              </Button>
            )}
            <Button
              variant={selectedTool === "formation" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedTool("formation")}
            >
              Formations
            </Button>
          </div>

          {selectedTool === "route" && enableRoutes && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Route Type:</span>
              <select
                value={currentRouteType}
                onChange={(e) =>
                  setCurrentRouteType(e.target.value as RouteType)
                }
                className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm"
              >
                <option value="primary">Primary</option>
                <option value="hot">Hot</option>
                <option value="check">Check</option>
              </select>
            </div>
          )}

          {selectedTool === "formation" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Templates:</span>
              <select
                onChange={(e) => applyFormationTemplate(e.target.value)}
                className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Template
                </option>
                <option value="I-Formation-11">I-Formation (11)</option>
                <option value="Shotgun-11">Shotgun (11)</option>
                <option value="Empty-10">Empty (10)</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button variant="primary" size="sm" onClick={saveDiagram}>
                Save Diagram
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="w-full h-full bg-neutral-800 rounded-lg overflow-hidden"
            style={{ width: `${width}px`, height: `${height}px` }}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-neutral-800 border-l border-neutral-700 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>

          {diagramData && (
            <Card className="mb-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-neutral-400">
                    Name
                  </label>
                  <input
                    type="text"
                    value={diagramData.name}
                    onChange={(e) =>
                      setDiagramData((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400">
                    Type
                  </label>
                  <span className="text-white capitalize">
                    {diagramData.type}
                  </span>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <h4 className="font-medium text-white mb-2">Formation Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Personnel:</span>
                <span className="text-white">
                  {formatPersonnel(diagramData?.formation.personnel)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Players:</span>
                <span className="text-white">
                  {diagramData?.formation.players.length || 0}
                </span>
              </div>
              {diagramData?.playData && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Routes:</span>
                  <span className="text-white">
                    {diagramData.playData.routes.length}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-neutral-800 border-t border-neutral-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <div className="flex items-center gap-4">
            <span>
              Tool:{" "}
              <span className="text-white capitalize">{selectedTool}</span>
            </span>
            {diagramData && (
              <span>
                Formation:{" "}
                <span className="text-white">
                  {formatPersonnel(diagramData.formation.personnel)}
                </span>
              </span>
            )}
          </div>
          <div>
            {diagramData && (
              <span>
                Last saved:{" "}
                {new Date(diagramData.updatedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default DiagramEditor;
export type { DiagramEditorProps };
