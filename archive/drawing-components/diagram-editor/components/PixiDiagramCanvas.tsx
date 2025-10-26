/**
 * PixiDiagramCanvas - Unified Canvas Component
 *
 * Core Pixi.js canvas component that can render diagrams in different modes:
 * - edit: Full editing capabilities
 * - view: Read-only display
 * - live: Live session execution mode
 * - analytics: Performance overlay mode
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Container } from "pixi.js";
import { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";
import type {
  UnifiedDiagramData,
  DiagramCanvasProps,
} from "../types/UnifiedDiagramTypes";
import type { FieldDimensions } from "../core/CoordinateSystem";

interface PixiDiagramCanvasProps extends DiagramCanvasProps {
  fieldDimensions?: FieldDimensions;
  className?: string;
}

export const PixiDiagramCanvas: React.FC<PixiDiagramCanvasProps> = ({
  data,
  mode = "view",
  width = 800,
  height = 600,
  backgroundColor,
  showControls = true,
  onReady,
  onChange: _onChange,
  interactive = true,
  fieldDimensions = { width: 53.333, height: 35, pixelsPerYard: 15 },
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<ProfessionalPixiEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Pixi.js engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const pixiEngine = new ProfessionalPixiEngine({
          canvas: canvasRef.current!,
          width,
          height,
          fieldDimensions,
          backgroundColor,
          enablePerformanceMonitoring: true,
          enableAdvancedInteractions: interactive,
          maxFPS: 60,
          minFPS: 15,
        });

        await pixiEngine.initialize();
        setEngine(pixiEngine);

        // Load diagram data
        await loadDiagramData(pixiEngine, data, mode);

        onReady?.();
      } catch (err) {
        console.error("Failed to initialize Pixi.js engine:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize diagram"
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeEngine();

    return () => {
      if (engine) {
        engine.destroy();
      }
    };
  }, [width, height, fieldDimensions, backgroundColor, interactive]);

  // Load diagram data into the engine
  const loadDiagramData = useCallback(
    async (
      pixiEngine: ProfessionalPixiEngine,
      diagramData: UnifiedDiagramData,
      renderMode: "edit" | "view" | "live" | "analytics"
    ) => {
      // Clear existing content from layers
      const playersLayer = pixiEngine.layers.playersLayer;
      const routesLayer = pixiEngine.layers.routesLayer;

      if (playersLayer) {
        playersLayer.removeChildren();
      }
      if (routesLayer) {
        routesLayer.removeChildren();
      }

      // Load players
      if (diagramData.pixiData.players) {
        for (const player of diagramData.pixiData.players) {
          // Add player to layer - implementation will be added in Phase 2
          console.log("Loading player:", player);
        }
      }

      // Load routes
      if (diagramData.pixiData.routes) {
        for (const route of diagramData.pixiData.routes) {
          // Add route to layer - implementation will be added in Phase 2
          console.log("Loading route:", route);
        }
      }

      // Configure interaction mode
      configureInteractionMode(pixiEngine, renderMode);

      // Load analytics overlay if in analytics mode
      if (renderMode === "analytics" && diagramData.analytics) {
        loadAnalyticsOverlay(pixiEngine, diagramData.analytics);
      }
    },
    []
  );

  // Configure interaction based on mode
  const configureInteractionMode = (
    pixiEngine: ProfessionalPixiEngine,
    renderMode: "edit" | "view" | "live" | "analytics"
  ) => {
    // Configure layer interactivity based on mode
    switch (renderMode) {
      case "edit":
        // Full editing capabilities
        pixiEngine.layers.setLayerInteractive("players", true);
        pixiEngine.layers.setLayerInteractive("routes", true);
        break;

      case "view":
        // Read-only, allow panning/zooming
        pixiEngine.layers.setLayerInteractive("players", false);
        pixiEngine.layers.setLayerInteractive("routes", false);
        break;

      case "live":
        // Live session mode - highlight executable elements
        pixiEngine.layers.setLayerInteractive("players", false);
        pixiEngine.layers.setLayerInteractive("routes", true);
        break;

      case "analytics":
        // Analytics mode - show overlays, disable editing
        pixiEngine.layers.setLayerInteractive("players", false);
        pixiEngine.layers.setLayerInteractive("routes", false);
        break;
    }
  };

  // Load analytics overlay
  const loadAnalyticsOverlay = (
    pixiEngine: ProfessionalPixiEngine,
    analytics: UnifiedDiagramData["analytics"]
  ) => {
    if (!analytics) return;

    // Create analytics overlay layer
    const analyticsLayer = new Container();
    analyticsLayer.name = "analytics";
    analyticsLayer.zIndex = 100;
    pixiEngine.stage.addChild(analyticsLayer);

    // Add performance heatmaps, success rate overlays, etc.
    // Implementation details in Phase 4
  };

  // Handle data changes
  useEffect(() => {
    if (engine && data) {
      loadDiagramData(engine, data, mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode, engine]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-error-bg border border-error-200 rounded-lg ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-error-600 font-medium">Diagram Error</div>
          <div className="text-error-500 text-sm mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600 mx-auto"></div>
            <div className="text-secondary text-sm mt-2">
              Loading diagram...
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border rounded-lg"
        style={{ display: isLoading ? "none" : "block" }}
      />

      {showControls && mode === "edit" && (
        <div className="absolute top-4 right-4">
          {/* Controls will be added in Phase 2 */}
        </div>
      )}
    </div>
  );
};
