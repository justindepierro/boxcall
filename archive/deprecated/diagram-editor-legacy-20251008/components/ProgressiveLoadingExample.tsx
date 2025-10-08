/**
 * ProgressiveLoadingExample
 *
 * Example component demonstrating how to integrate progressive loading
 * into the DiagramEditor with lazy-loaded components.
 */

import React from "react";
import { ProgressiveComponent } from "./ProgressiveComponent";
import { withProgressiveLoading } from "./withProgressiveLoading";
import {
  LazyAISuggestionsPanel,
  LazyRoutePropertiesPanel,
  LazyPlayerPropertiesPanel,
  LazyHelpOverlay,
  LazyTipsOverlay,
  LazyAuroraFieldPresets,
} from "./LazyComponents";

// Create wrapped components with progressive loading
const ProgressiveAISuggestionsPanel = withProgressiveLoading(
  LazyAISuggestionsPanel,
  {
    loadOnViewport: true,
    delay: 100,
  }
);

const ProgressiveRoutePropertiesPanel = withProgressiveLoading(
  LazyRoutePropertiesPanel,
  {
    loadOnInteraction: true,
    delay: 1000,
  }
);

const ProgressivePlayerPropertiesPanel = withProgressiveLoading(
  LazyPlayerPropertiesPanel,
  {
    loadAfterPriority: true,
    priority: 1,
  }
);

interface ProgressiveLoadingExampleProps {
  showAISuggestions?: boolean;
  showRouteProperties?: boolean;
  showPlayerProperties?: boolean;
  showHelp?: boolean;
  showTips?: boolean;
  showFieldPresets?: boolean;
}

export const ProgressiveLoadingExample: React.FC<
  ProgressiveLoadingExampleProps
> = ({
  showAISuggestions = false,
  showRouteProperties = false,
  showPlayerProperties = false,
  showHelp = false,
  showTips = false,
  showFieldPresets = false,
}) => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Progressive Loading Demo</h2>

      {/* AI Suggestions Panel - Viewport triggered */}
      {showAISuggestions && (
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-2">
            AI Suggestions (Viewport Trigger)
          </h3>
          <ProgressiveAISuggestionsPanel
            onLoad={() => console.log("AI Suggestions loaded")}
            onError={(error) => console.error("AI Suggestions failed:", error)}
          />
        </div>
      )}

      {/* Route Properties Panel - Interaction triggered */}
      {showRouteProperties && (
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-2">
            Route Properties (Interaction Trigger)
          </h3>
          <ProgressiveRoutePropertiesPanel
            onLoad={() => console.log("Route Properties loaded")}
            onError={(error) =>
              console.error("Route Properties failed:", error)
            }
          />
        </div>
      )}

      {/* Player Properties Panel - Priority triggered */}
      {showPlayerProperties && (
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-2">
            Player Properties (Priority Trigger)
          </h3>
          <ProgressivePlayerPropertiesPanel
            onLoad={() => console.log("Player Properties loaded")}
            onError={(error) =>
              console.error("Player Properties failed:", error)
            }
          />
        </div>
      )}

      {/* Help Overlay - Viewport triggered */}
      {showHelp && (
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-2">
            Help Overlay (Viewport Trigger)
          </h3>
          <ProgressiveComponent
            lazyComponent={LazyHelpOverlay}
            componentProps={{
              open: false,
              onClose: () => {},
              dontShowAgain: false,
              onDontShowAgainChange: () => {},
            }}
            loadingOptions={{
              loadOnViewport: true,
              delay: 200,
            }}
            onLoad={() => console.log("Help Overlay loaded")}
            onError={(error) => console.error("Help Overlay failed:", error)}
          />
        </div>
      )}

      {/* Tips Overlay - Interaction triggered */}
      {/* Tips Overlay - Interaction triggered */}
      {showTips && (
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-2">
            Tips Overlay (Interaction Trigger)
          </h3>
          <ProgressiveComponent
            lazyComponent={LazyTipsOverlay}
            componentProps={{
              open: false,
              onClose: () => {},
              dontShowAgain: false,
              onDontShowAgainChange: () => {},
            }}
            loadingOptions={{
              loadOnInteraction: true,
              delay: 2000,
            }}
            onLoad={() => console.log("Tips Overlay loaded")}
            onError={(error: Error) =>
              console.error("Tips Overlay failed:", error)
            }
          />
        </div>
      )}

      {/* Field Presets - Priority triggered */}
      {showFieldPresets && (
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-2">
            Field Presets (Priority Trigger)
          </h3>
          <ProgressiveComponent
            lazyComponent={LazyAuroraFieldPresets}
            componentProps={{
              activePreset: "default",
              onPresetSelect: () => {},
            }}
            loadingOptions={{
              loadAfterPriority: true,
              priority: 2,
            }}
            onLoad={() => console.log("Field Presets loaded")}
            onError={(error: Error) =>
              console.error("Field Presets failed:", error)
            }
          />
        </div>
      )}
    </div>
  );
};

// Example of using ProgressiveComponent directly
export const DirectProgressiveExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Direct Progressive Loading</h2>

      <ProgressiveComponent
        lazyComponent={LazyAISuggestionsPanel}
        loadingOptions={{
          loadOnViewport: true,
          delay: 100,
        }}
        onLoad={() => console.log("Direct AI Suggestions loaded")}
        onError={(error: Error) =>
          console.error("Direct AI Suggestions failed:", error)
        }
      />
    </div>
  );
};
