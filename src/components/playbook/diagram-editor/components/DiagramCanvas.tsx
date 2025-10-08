/**
 * Pixi-powered Diagram Canvas Component
 *
 * This is the main React component that renders the football field
 * using Pixi.js for hardware-accelerated WebGL rendering.
 */

import React, { useRef, useEffect } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import { useGestures } from "../hooks/useGestures";
import { LoadingSpinner } from "./LoadingSpinner";

export interface DiagramCanvasProps {
  fieldWidth?: number;
  fieldHeight?: number;
  pixelsPerYard?: number;
  backgroundColor?: number;
  className?: string;
  onReady?: (app: any) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  fieldWidth = 53.333,
  fieldHeight = 35,
  pixelsPerYard = 15,
  backgroundColor = 0xf5f7ed,
  className = "",
  onReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { app, isReady, debugCoordinates } = usePixiApp(canvasRef, {
    fieldWidth,
    fieldHeight,
    pixelsPerYard,
    backgroundColor,
  });

  // Enable gesture handling
  useGestures({
    app,
    canvasRef,
    enabled: isReady,
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
        console.error('Debug coordinates failed:', error);
      }
    }
  }, [isReady, debugCoordinates, app]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: "block",
          touchAction: "none", // Prevent browser gestures
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {!isReady && <LoadingSpinner message="Initializing diagram editor..." />}
    </div>
  );
};
