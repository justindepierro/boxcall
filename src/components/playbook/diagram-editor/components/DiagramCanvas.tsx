/**
 * Pixi-powered Diagram Canvas Component
 *
 * This is the main React component that renders the football field
 * using Pixi.js for hardware-accelerated WebGL rendering.
 */

import React, { useRef, useEffect, useState } from "react";
import { usePixiApp } from "../hooks/usePixiApp";
import { useGestures } from "../hooks/useGestures";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  detectWebGLCapabilities,
  checkMinimumRequirements,
  getWebGLErrorMessage,
} from "../utils/webgl-detection";

export interface DiagramCanvasProps {
  fieldWidth?: number;
  fieldHeight?: number;
  backgroundColor?: number;
  className?: string;
  onReady?: (app: any) => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  fieldWidth = 53.333,
  fieldHeight = 35,
  backgroundColor = 0xf5f7ed,
  className = "",
  onReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  // Check WebGL support on mount
  useEffect(() => {
    const capabilities = detectWebGLCapabilities();
    const requirements = checkMinimumRequirements();

    if (!capabilities.supported) {
      setWebglError(getWebGLErrorMessage(capabilities));
      console.error("❌ WebGL not supported:", capabilities);
      return;
    }

    if (!requirements.meetsRequirements) {
      console.warn(
        "⚠️ System may not meet minimum requirements:",
        requirements.issues
      );
    }
  }, []);

  // usePixiApp now handles ALL resize logic internally
  const { app, isReady, debugCoordinates } = usePixiApp(
    canvasRef,
    containerRef,
    {
      fieldWidth,
      fieldHeight,
      backgroundColor,
    }
  );

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

  // Show WebGL error if detected
  if (webglError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface p-8">
        <div className="max-w-md rounded-lg border border-border bg-surface-card p-6 text-center">
          <div className="mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-content-primary">
            Graphics Not Supported
          </h3>
          <p className="text-sm text-content-secondary">{webglError}</p>
        </div>
      </div>
    );
  }

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

      {!isReady && <LoadingSpinner message="Initializing diagram editor..." />}
    </div>
  );
};
