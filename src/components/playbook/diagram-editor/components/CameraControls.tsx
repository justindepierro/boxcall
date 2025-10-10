import React from "react";
import type { DiagramPixiApp } from "../core/PixiApp";

interface CameraControlsProps {
  app: DiagramPixiApp | null;
}

/**
 * Camera control buttons for zoom and pan
 * Mobile-first design with large touch targets
 */
export const CameraControls: React.FC<CameraControlsProps> = ({ app }) => {
  const handleZoomIn = () => {
    if (app) {
      app.camera.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (app) {
      app.camera.zoomOut();
    }
  };

  const handleResetView = () => {
    if (app) {
      app.camera.reset();
    }
  };

  const handleTogglePan = () => {
    // TODO: Toggle pan mode in Phase 2B
    console.log("Pan mode toggle - will implement with tool system");
  };

  const buttonBaseClasses =
    "w-12 h-12 rounded-lg bg-white shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center text-gray-700 hover:text-blue-600 border border-gray-200";

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        className={buttonBaseClasses}
        title="Zoom In"
        aria-label="Zoom in"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
          />
        </svg>
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        className={buttonBaseClasses}
        title="Zoom Out"
        aria-label="Zoom out"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
          />
        </svg>
      </button>

      {/* Reset View */}
      <button
        onClick={handleResetView}
        className={buttonBaseClasses}
        title="Reset View"
        aria-label="Reset view to default"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>

      {/* Pan Mode Toggle (placeholder) */}
      <button
        onClick={handleTogglePan}
        className={buttonBaseClasses}
        title="Pan Mode (Coming Soon)"
        aria-label="Toggle pan mode"
        disabled
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      </button>
    </div>
  );
};
