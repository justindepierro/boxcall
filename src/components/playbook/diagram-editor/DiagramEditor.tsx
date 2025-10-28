/**
 * Unified Diagram Editor
 *
 * Professional NFL-quality playbook diagram editor that integrates:
 * - Formation positioning with NFL standards
 * - Player drag-drop management with constraints
 * - Route drawing with color coding and templates
 * - Canvas abstraction with Pixi.js
 * - Export capabilities (CSV/PDF)
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@components/ui/Button/Button";
import Card from "@components/ui/Card/Card";

// Core services
import { PixiDiagramCanvas } from "@services/canvas/DiagramCanvas";
import { PlayerManager } from "@services/PlayerManager";
import { RouteDrawingEngine } from "@services/RouteDrawingEngine";
import { createFormationFromTemplate } from "@services/FormationPositioningEngine";

// Types
import type { UnifiedDiagramData, Route } from "../../../types/diagram";
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
  /** Initial diagram data (optional) */
  initialData?: UnifiedDiagramData;

  /** Diagram type (formation, play, template) */
  diagramType?: "formation" | "play" | "template";

  /** Callback when diagram changes */
  onChange?: (data: UnifiedDiagramData) => void;

  /** Callback when diagram is saved */
  onSave?: (data: UnifiedDiagramData) => void;

  /** Read-only mode */
  readOnly?: boolean;

  /** Canvas dimensions */
  width?: number;
  height?: number;

  /** Enable route drawing */
  enableRoutes?: boolean;

  /** Enable player editing */
  enablePlayerEditing?: boolean;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({
  initialData,
  diagramType = "play",
  onChange,
  onSave,
  readOnly = false,
  width = 600,
  height = 1200,
  enableRoutes = true,
  enablePlayerEditing = true,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const canvasRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  const [diagramData, setDiagramData] = useState<UnifiedDiagramData | null>(
    null
  );

  // Service instances
  const [canvas, setCanvas] = useState<PixiDiagramCanvas | null>(null);
  const [_playerManager, setPlayerManager] = useState<PlayerManager | null>(
    null
  );
  const [routeEngine] = useState(() =>
    enableRoutes ? new RouteDrawingEngine(null as any) : null
  );

  // UI state
  const [selectedTool, setSelectedTool] = useState<
    "select" | "player" | "route" | "formation"
  >("select");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [currentRouteType, setCurrentRouteType] =
    useState<RouteType>("primary");

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current) return;

      // Initialize canvas
      const newCanvas = new PixiDiagramCanvas({
        width,
        height,
        backgroundColor: 0x1a1a1a, // Dark field background
      });

      try {
        await newCanvas.initialize(canvasRef.current);
        setCanvas(newCanvas);
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
      }
      const newPlayerManager = new PlayerManager(newCanvas);
      setPlayerManager(newPlayerManager);

      // Setup player manager callbacks
      newPlayerManager.onPlayerSelected((playerId) => {
        setSelectedPlayerId(playerId);
        setSelectedRouteId(null); // Clear route selection
      });

      newPlayerManager.onValidationError((error) => {
        // TODO: Show error toast
        console.warn("Player positioning error:", error);
      });

      if (routeEngine) {
        // Create a minimal canvas interface for route engine
        const routeCanvasInterface = {
          addRoute: (route: Route) => newCanvas.addRoute(route),
          updateRoute: (id: string, updates: Partial<Route>) =>
            newCanvas.updateRoute(id, updates),
          removeRoute: (id: string) => newCanvas.removeRoute(id),
          selectRoute: (id: string | null) => newCanvas.selectRoute(id),
          onRouteDraw: (callback: (route: Omit<Route, "id">) => void) => {
            // Canvas will call this when route drawing completes
            newCanvas.onRouteDraw(callback);
          },
        };
        routeEngine.setCanvas(routeCanvasInterface);
      }

      setCanvas(newCanvas);

      // Load initial data or create new diagram
      if (initialData) {
        loadDiagram(initialData);
      } else {
        createNewDiagram();
      }
    };

    initializeCanvas();

    // Cleanup
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup canvas on unmount
  useEffect(() => {
    return () => {
      if (canvas) {
        canvas.destroy();
      }
    };
  }, [canvas]);

  // ============================================================================
  // DIAGRAM MANAGEMENT
  // ============================================================================

  const loadDiagram = useCallback(
    (data: UnifiedDiagramData) => {
      if (!canvas) return;

      // Clear existing players and routes
      // TODO: Add clear methods to canvas

      // Load formation players
      data.formation.players.forEach((player) => {
        canvas.addPlayer(player as any);
      });

      // Load routes if play data exists
      if (data.playData) {
        data.playData.routes.forEach((route) => {
          canvas.addRoute(route);
        });
      }

      setDiagramData(data);
    },
    [canvas]
  );

  const createNewDiagram = useCallback(() => {
    const newData: UnifiedDiagramData = {
      id: `diagram-${Date.now()}`,
      type: diagramType,
      name: "New Diagram",
      description: "",
      formation: (createFormationFromTemplate("I-Formation-11") as any) || {
        id: `formation-${Date.now()}`,
        name: "Empty Formation",
        category: "pro",
        type: "I Formation",
        direction: "left",
        strength: "balanced",
        personnel: { rb: 1, te: 1, wr: 1 },
        players: [],
      },
      playData:
        diagramType === "play"
          ? {
              id: `play-${Date.now()}`,
              name: "New Play",
              category: "run",
              formationId: `formation-${Date.now()}`,
              routes: [],
              assignments: [],
              protection: {
                type: "man",
                strength: "balanced",
                hotRoutes: [],
              },
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

    setDiagramData(newData);
    loadDiagram(newData);
  }, [diagramType, width, height, loadDiagram]);

  const saveDiagram = useCallback(() => {
    if (!diagramData || !canvas) return;

    // TODO: Extract zoom/pan from canvas data
    // const canvasData = canvas.getCanvasData();
    const updatedData = {
      ...diagramData,
      canvas: {
        ...diagramData.canvas,
        // TODO: Extract zoom/pan from canvas data
      },
      updatedAt: new Date().toISOString(),
    };

    setDiagramData(updatedData);
    onSave?.(updatedData);
  }, [diagramData, canvas, onSave]); // ============================================================================
  // TOOL HANDLERS
  // ============================================================================

  const handleToolChange = useCallback((tool: string) => {
    setSelectedTool(tool as typeof selectedTool);
    setSelectedPlayerId(null);
    setSelectedRouteId(null);
    setIsDrawingRoute(false);

    // Update canvas interaction mode
    // TODO: Implement interaction modes on canvas
    // if (canvas) {
    //   switch (tool) {
    //     case 'select':
    //       canvas.setInteractionMode('select');
    //       break;
    //     case 'player':
    //       canvas.setInteractionMode('drag');
    //       break;
    //     case 'route':
    //       canvas.setInteractionMode('draw');
    //       break;
    //     case 'formation':
    //       canvas.setInteractionMode('formation');
    //       break;
    //   }
    // }
  }, []);

  const handlePlayerSelect = useCallback((playerId: string | null) => {
    setSelectedPlayerId(playerId);
    setSelectedRouteId(null);
  }, []);

  const handleRouteSelect = useCallback((routeId: string | null) => {
    setSelectedRouteId(routeId);
    setSelectedPlayerId(null);
  }, []);

  const handleRouteStart = useCallback(
    (playerId: string) => {
      if (!routeEngine || !enableRoutes) return;

      setIsDrawingRoute(true);
      routeEngine.startRouteDrawing(playerId, currentRouteType);
    },
    [routeEngine, enableRoutes, currentRouteType]
  );

  // ============================================================================
  // FORMATION MANAGEMENT
  // ============================================================================

  const applyFormationTemplate = useCallback(
    (templateKey: string) => {
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
        canvas.addPlayer(player as any);
      });

      const updatedData = {
        ...diagramData,
        formation: formation as any,
        updatedAt: new Date().toISOString(),
      };

      setDiagramData(updatedData);
      onChange?.(updatedData);
    },
    [canvas, diagramData, onChange]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="diagram-editor flex flex-col h-full bg-neutral-900">
      {/* Toolbar */}
      <DiagramToolbar
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        onSave={saveDiagram}
        readOnly={readOnly}
        enableRoutes={enableRoutes}
        enablePlayerEditing={enablePlayerEditing}
        currentRouteType={currentRouteType}
        onRouteTypeChange={setCurrentRouteType}
        onFormationTemplate={applyFormationTemplate}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className="w-full h-full bg-neutral-800 rounded-lg"
            style={{ width: `${width}px`, height: `${height}px` }}
          />

          {/* Canvas Overlay for Drawing State */}
          {isDrawingRoute && (
            <div className="absolute top-4 left-4 bg-jade-600 text-white px-3 py-1 rounded-md text-sm font-medium">
              Drawing Route... Click to add points, double-click to finish
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <DiagramPropertiesPanel
          diagramData={diagramData}
          selectedPlayerId={selectedPlayerId}
          selectedRouteId={selectedRouteId}
          onPlayerUpdate={handlePlayerSelect}
          onRouteUpdate={handleRouteSelect}
          onRouteStart={handleRouteStart}
          readOnly={readOnly}
        />
      </div>

      {/* Status Bar */}
      <DiagramStatusBar
        diagramData={diagramData}
        selectedTool={selectedTool}
        isDrawingRoute={isDrawingRoute}
      />
    </div>
  );
};

// ============================================================================
// TOOLBAR COMPONENT
// ============================================================================

interface DiagramToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  onSave: () => void;
  readOnly: boolean;
  enableRoutes: boolean;
  enablePlayerEditing: boolean;
  currentRouteType: RouteType;
  onRouteTypeChange: (type: RouteType) => void;
  onFormationTemplate: (template: string) => void;
}

const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  selectedTool,
  onToolChange,
  onSave,
  readOnly,
  enableRoutes,
  enablePlayerEditing,
  currentRouteType,
  onRouteTypeChange,
  onFormationTemplate,
}) => {
  const tools = [
    { id: "select", label: "Select", icon: "cursor" },
    ...(enablePlayerEditing
      ? [{ id: "player", label: "Move Players", icon: "move" }]
      : []),
    ...(enableRoutes
      ? [{ id: "route", label: "Draw Routes", icon: "pen" }]
      : []),
    { id: "formation", label: "Formations", icon: "layout" },
  ];

  return (
    <div className="bg-neutral-800 border-b border-neutral-700 p-4">
      <div className="flex items-center justify-between">
        {/* Tool Selection */}
        <div className="flex items-center gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "primary" : "secondary"}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              className="min-w-24"
            >
              {tool.label}
            </Button>
          ))}
        </div>

        {/* Route Type Selector */}
        {selectedTool === "route" && enableRoutes && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Route Type:</span>
            <select
              value={currentRouteType}
              onChange={(e) => onRouteTypeChange(e.target.value as RouteType)}
              className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm"
            >
              <option value="primary">Primary</option>
              <option value="hot">Hot</option>
              <option value="check">Check</option>
            </select>
          </div>
        )}

        {/* Formation Templates */}
        {selectedTool === "formation" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Templates:</span>
            <select
              onChange={(e) => onFormationTemplate(e.target.value)}
              className="bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Select Template
              </option>
              <option value="i-formation">I-Formation</option>
              <option value="shotgun">Shotgun</option>
              <option value="empty">Empty</option>
              <option value="pistol">Pistol</option>
            </select>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!readOnly && (
            <Button variant="primary" size="sm" onClick={onSave}>
              Save Diagram
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROPERTIES PANEL COMPONENT
// ============================================================================

interface DiagramPropertiesPanelProps {
  diagramData: UnifiedDiagramData | null;
  selectedPlayerId: string | null;
  selectedRouteId: string | null;
  onPlayerUpdate: (playerId: string | null) => void;
  onRouteUpdate: (routeId: string | null) => void;
  onRouteStart: (playerId: string) => void;
  readOnly: boolean;
}

const DiagramPropertiesPanel: React.FC<DiagramPropertiesPanelProps> = ({
  diagramData,
  selectedPlayerId,
  selectedRouteId,
  onPlayerUpdate: _onPlayerUpdate,
  onRouteUpdate: _onRouteUpdate,
  onRouteStart,
  readOnly,
}) => {
  if (!diagramData) return null;

  const selectedPlayer = selectedPlayerId
    ? diagramData.formation.players.find((p) => p.id === selectedPlayerId)
    : null;

  const selectedRoute =
    selectedRouteId && diagramData.playData
      ? diagramData.playData.routes.find((r) => r.id === selectedRouteId)
      : null;

  return (
    <div className="w-80 bg-neutral-800 border-l border-neutral-700 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>

      {/* Diagram Info */}
      <Card className="mb-4">
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-neutral-400">
              Name
            </label>
            <input
              type="text"
              value={diagramData.name}
              onChange={(_e) => {
                /* TODO: Update diagram name */
              }}
              className="w-full bg-neutral-700 border border-neutral-600 rounded px-2 py-1 text-white"
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400">
              Type
            </label>
            <span className="text-white capitalize">{diagramData.type}</span>
          </div>
        </div>
      </Card>

      {/* Player Properties */}
      {selectedPlayer && (
        <Card className="mb-4">
          <h4 className="font-medium text-white mb-2">
            Player: {selectedPlayer.label}
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-neutral-400">
                Position
              </label>
              <span className="text-white">
                {selectedPlayer.playerPosition}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400">
                Coordinates
              </label>
              <span className="text-white">
                ({selectedPlayer.fieldPosition.x.toFixed(1)},{" "}
                {selectedPlayer.fieldPosition.y.toFixed(1)})
              </span>
            </div>
            {!readOnly && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRouteStart(selectedPlayer.id)}
                className="w-full"
              >
                Draw Route
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Route Properties */}
      {selectedRoute && (
        <Card className="mb-4">
          <h4 className="font-medium text-white mb-2">
            Route: {selectedRoute.name}
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-neutral-400">
                Type
              </label>
              <span className="text-white capitalize">
                {selectedRoute.type}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400">
                Depth
              </label>
              <span className="text-white">
                {selectedRoute.depth?.toFixed(1) || "N/A"} yards
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400">
                Points
              </label>
              <span className="text-white">
                {selectedRoute.path.length} points
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Formation Summary */}
      <Card>
        <h4 className="font-medium text-white mb-2">Formation Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Personnel:</span>
            <span className="text-white">
              {formatPersonnel(diagramData.formation.personnel)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Players:</span>
            <span className="text-white">
              {diagramData.formation.players.length}
            </span>
          </div>
          {diagramData.playData && (
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
  );
};

// ============================================================================
// STATUS BAR COMPONENT
// ============================================================================

interface DiagramStatusBarProps {
  diagramData: UnifiedDiagramData | null;
  selectedTool: string;
  isDrawingRoute: boolean;
}

const DiagramStatusBar: React.FC<DiagramStatusBarProps> = ({
  diagramData,
  selectedTool,
  isDrawingRoute,
}) => {
  return (
    <div className="bg-neutral-800 border-t border-neutral-700 px-4 py-2">
      <div className="flex items-center justify-between text-sm text-neutral-400">
        <div className="flex items-center gap-4">
          <span>
            Tool: <span className="text-white capitalize">{selectedTool}</span>
          </span>
          {diagramData && (
            <span>
              Formation:{" "}
              <span className="text-white">
                {formatPersonnel(diagramData.formation.personnel)}
              </span>
            </span>
          )}
          {isDrawingRoute && (
            <span className="text-jade-400">● Drawing Route</span>
          )}
        </div>
        <div>
          {diagramData && (
            <span>
              Last saved: {new Date(diagramData.updatedAt).toLocaleTimeString()}
            </span>
          )}
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
