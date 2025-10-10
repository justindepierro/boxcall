import React from "react";

interface SettingsTabProps {
  // Add props as needed for settings
}

/**
 * SettingsTab - Mobile-optimized editor settings
 *
 * Features:
 * - Field color mode
 * - Field position
 * - Grid settings
 * - Editor preferences
 */
export const SettingsTab: React.FC<SettingsTabProps> = () => {
  return (
    <div className="space-y-4">
      {/* Field Appearance */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">
          Field Appearance
        </h3>
        <div className="space-y-2">
          <button
            disabled
            className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed opacity-50 touch-manipulation text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">🎨</div>
              <div>
                <div className="text-sm font-medium">Field Color</div>
                <div className="text-xs mt-0.5">Jade Green</div>
              </div>
            </div>
          </button>
          <button
            disabled
            className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed opacity-50 touch-manipulation text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">📍</div>
              <div>
                <div className="text-sm font-medium">Field Position</div>
                <div className="text-xs mt-0.5">Midfield</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Grid & Snapping */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">
          Grid & Snapping
        </h3>
        <div className="space-y-2">
          <button
            disabled
            className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed opacity-50 touch-manipulation text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">⊞</div>
              <div>
                <div className="text-sm font-medium">Show Grid</div>
                <div className="text-xs mt-0.5">Off</div>
              </div>
            </div>
          </button>
          <button
            disabled
            className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed opacity-50 touch-manipulation text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">🧲</div>
              <div>
                <div className="text-sm font-medium">Snap to Grid</div>
                <div className="text-xs mt-0.5">Enabled</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Editor Preferences */}
      <div>
        <h3 className="text-sm font-semibold text-primary mb-2">
          Editor Preferences
        </h3>
        <div className="space-y-2">
          <button
            disabled
            className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed opacity-50 touch-manipulation text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">📏</div>
              <div>
                <div className="text-sm font-medium">Show Measurements</div>
                <div className="text-xs mt-0.5">Yards</div>
              </div>
            </div>
          </button>
          <button
            disabled
            className="w-full px-4 py-3 bg-surface-secondary text-secondary rounded-lg cursor-not-allowed opacity-50 touch-manipulation text-left"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">🔢</div>
              <div>
                <div className="text-sm font-medium">Jersey Numbers</div>
                <div className="text-xs mt-0.5">Auto-Number</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-surface-secondary rounded-lg p-4">
        <h3 className="text-sm font-semibold text-primary mb-2">
          About Diagram Editor
        </h3>
        <div className="text-xs text-secondary space-y-1">
          <p>
            <strong>Version:</strong> 2.0.0 (Mobile-First)
          </p>
          <p>
            <strong>Engine:</strong> Pixi.js v8.5.2 (WebGL)
          </p>
          <p>
            <strong>Performance:</strong> 60 FPS target
          </p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="text-center py-8">
        <div className="text-4xl mb-2">⚙️</div>
        <p className="text-sm font-medium text-secondary">
          Settings Coming Soon
        </p>
        <p className="text-xs text-secondary mt-1">
          More customization options in Phase 3!
        </p>
      </div>
    </div>
  );
};
