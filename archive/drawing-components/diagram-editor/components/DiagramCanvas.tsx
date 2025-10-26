/**
 * Pixi-powered Diagram Canvas Component
 *
 * This is the main React component that renders the football field
 * using Pixi.js for hardware-accelerated WebGL rendering.
 */

import React, { useRef, useEffect } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import { useGestures } from "../hooks/useGestures";
import { useRouteDrawing } from "../hooks/useRouteDrawing";
import { useWaypointEditing } from "../hooks/useWaypointEditing";
import { useDiagramStore } from "../stores/diagramStore";
import { LoadingSpinner } from "./LoadingSpinner";

export interface DiagramCanvasProps {
  fieldWidth?: number;
  fieldHeight?: number;
  backgroundColor?: number;
  className?: string;
  onReady?: (app: any) => void;
  routeType?: "primary" | "hot" | "check"; // Current route type from toolbar
  children?: React.ReactNode; // For overlays like collaborative cursors
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  fieldWidth = 53.333,
  fieldHeight = 35,
  backgroundColor = 0xf5f7ed,
  className = "",
  onReady,
  routeType = "primary",
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // WebGL detection is now handled by ProfessionalPixiEngine
  // No need for redundant checks here

  // usePixiApp now handles ALL resize logic internally
  const { app, isReady, playersLayer, routesLayer, debugCoordinates } =
    usePixiApp(canvasRef, containerRef, {
      fieldWidth,
      fieldHeight,
      backgroundColor,
    });

  // Get active tool from store
  const activeTool = useDiagramStore((state) => state.activeTool);

  // Log state changes for debugging
  useEffect(() => {
    console.log("📊 DiagramCanvas state:", {
      hasCanvas: !!canvasRef.current,
      isReady,
    });
  }, [isReady]);

  // Enable gesture handling
  useGestures({
    app,
    canvasRef,
    enabled: isReady,
  });

  // Enable route drawing when draw-route tool is active
  useRouteDrawing({
    app,
    routesLayer,
    playersLayer,
    isEnabled: isReady && activeTool === "draw-route",
    routeType,
  });

  // Enable waypoint editing when edit-waypoint tool is active
  useWaypointEditing({
    app,
    isEnabled: isReady && activeTool === "edit-waypoint",
  });

  // Notify parent when ready
  useEffect(() => {
    if (isReady && app && onReady) {
      onReady(app);
    }
  }, [isReady, app, onReady]);

  // Debug: Log coordinate system on mount
  useEffect(() => {
    if (isReady && debugCoordinates && app) {
      console.log("🚀 DiagramCanvas mounted and ready");
      try {
        debugCoordinates();
      } catch (error) {
        console.error("Debug coordinates failed:", error);
      }
    }
  }, [isReady, debugCoordinates, app]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: "block",
          touchAction: "none", // Prevent browser gestures
          width: "100%",
          height: "100%",
        }}
      />

      {/* Overlay for collaborative cursors and other UI elements */}
      {children && (
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full"
            style={{ pointerEvents: "none" }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {children}
          </svg>
        </div>
      )}

      {!isReady && <LoadingSpinner message="Initializing diagram editor..." />}
    </div>
  );
};
