/**
 * Pixi Diagram Editor - Main Entry Point
 *
 * Elite football diagram editor using Pixi.js v8.5.2
 * for hardware-accelerated WebGL rendering and mobile-first experience.
 */

import React, { useState } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { CameraControls } from "./components/CameraControls";
import { PlayerControls } from "./components/PlayerControls";
import { PixiErrorBoundary } from "./components/PixiErrorBoundary";
import type { DiagramPixiApp } from "./core/PixiApp";

// Re-export types for backwards compatibility with PlaybookPage
export type { DiagramMetadata, DiagramDocument } from "./types/DiagramTypes";

export interface DiagramEditorProps {
  onClose?: () => void;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({ onClose }) => {
  const [app, setApp] = useState<DiagramPixiApp | null>(null);

  const handleReady = (pixiApp: DiagramPixiApp) => {
    console.log("✅ Pixi Diagram Editor Ready!", pixiApp);
    console.log(`📊 FPS: ${pixiApp.getFPS()}`);
    setApp(pixiApp);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-card border-b border-border">
        <h1 className="text-xl font-bold text-content-primary">
          🏈 Diagram Editor (Pixi.js)
        </h1>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-content-primary transition-colors"
          >
            Close
          </button>
        )}
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden bg-surface-secondary">
        <PixiErrorBoundary>
          <DiagramCanvas
            fieldWidth={53.333}
            fieldHeight={35}
            pixelsPerYard={15}
            onReady={handleReady}
          />
          <CameraControls app={app} />
          <PlayerControls />
        </PixiErrorBoundary>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-surface-card border-t border-border text-xs text-content-secondary">
        <div className="flex items-center gap-4">
          <span>✅ Elite Pixi.js Rendering</span>
          <span>📱 Mobile-First</span>
          <span>⚡ WebGL Accelerated</span>
          <span>🎯 Single Coordinate System</span>
        </div>
      </div>
    </div>
  );
};

export default DiagramEditor;
