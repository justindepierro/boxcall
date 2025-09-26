import React, { useCallback } from "react";
import { DiagramEditorProvider } from "./context/DiagramEditorProvider";
import { ModernToolPalette } from "./components/ModernToolPalette";
import { FootballFieldCanvas } from "./components/FootballFieldCanvas";
import { ShapeManipulator } from "./components/ShapeManipulator";
import { PlayerPropertiesPanel } from "./components/PlayerPropertiesPanel";
import { RoutePropertiesPanel } from "./components/RoutePropertiesPanel";
import { useDiagramEditor } from "./context/useDiagramEditor";
import type { Play } from "../../../types/play";

interface PlayDiagramBuilderProps {
  play?: Play;
  onClose?: () => void;
}

const PlayDiagramContent: React.FC<{ play?: Play }> = ({ play: _play }) => {
  const { dispatch } = useDiagramEditor();

  // Keyboard shortcuts handler
  // @ts-expect-error - Utility function for future keyboard interactions
  const _handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const cmdOrCtrl = ctrlKey || metaKey;

      // Tool shortcuts
      if (!cmdOrCtrl) {
        switch (key.toLowerCase()) {
          case "v":
            event.preventDefault();
            dispatch({ type: "SET_TOOL", tool: "select" });
            break;
          case "h":
            event.preventDefault();
            dispatch({ type: "SET_TOOL", tool: "pan" });
            break;
          case "p":
            event.preventDefault();
            dispatch({ type: "SET_TOOL", tool: "add-player" });
            break;
          case "r":
            event.preventDefault();
            dispatch({ type: "SET_TOOL", tool: "route" });
            break;
          case "d":
            event.preventDefault();
            dispatch({ type: "SET_TOOL", tool: "draw" });
            break;
          case "l":
            if (shiftKey) {
              event.preventDefault();
              dispatch({ type: "SET_DRAW_MODE", mode: "line" });
              dispatch({ type: "SET_TOOL", tool: "draw" });
            }
            break;
          case "a":
            if (shiftKey) {
              event.preventDefault();
              dispatch({ type: "SET_DRAW_MODE", mode: "arrow" });
              dispatch({ type: "SET_TOOL", tool: "draw" });
            }
            break;
        }
      }

      // Undo/Redo shortcuts
      if (cmdOrCtrl) {
        switch (key.toLowerCase()) {
          case "z":
            event.preventDefault();
            if (shiftKey) {
              dispatch({ type: "REDO" });
            } else {
              dispatch({ type: "UNDO" });
            }
            break;
          case "y":
            event.preventDefault();
            dispatch({ type: "REDO" });
            break;
        }
      }

      // Delete selected items
      if (key === "Delete" || key === "Backspace") {
        // This would need to be implemented - delete selected items
        console.log("Delete key pressed");
      }
    },
    [dispatch]
  );

  return (
    <div className="w-full h-full bg-surface-primary flex flex-col">

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-surface-card border-r border-border flex flex-col flex-shrink-0">
          <ModernToolPalette />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 relative ml-2">
          <ShapeManipulator zoom={1} panX={0} panY={0} snapToGrid={true}>
            <FootballFieldCanvas />
          </ShapeManipulator>

          {/* Properties Popup */}
          <ElementPropertiesPopup />
        </div>
      </div>
    </div>
  );
};

const ElementPropertiesPopup: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();

  if (!state.ui.selectedIds || state.ui.selectedIds.length === 0) {
    return null;
  }

  // Check if a player is selected
  const selectedPlayerId = state.ui.selectedIds.find((id) =>
    state.doc.players.some((player) => player.id === id)
  );

  // Check if a route is selected
  const selectedRouteId = state.ui.selectedIds.find((id) =>
    state.doc.routes.some((route) => route.id === id)
  );

  // Get the selected element's position for popup placement
  let popupPosition = { x: 100, y: 100 }; // Default position

  if (selectedPlayerId) {
    const player = state.doc.players.find((p) => p.id === selectedPlayerId);
    if (player) {
      // Convert field coordinates to screen coordinates (rough approximation)
      const baseX = player.x * 15 + 50; // 15 pixels per yard, offset for popup
      const baseY = player.y * 15 - 50; // Position above the player

      // Ensure popup stays within viewport bounds
      popupPosition = {
        x: Math.max(10, Math.min(baseX, window.innerWidth - 320)), // Keep within horizontal bounds
        y: Math.max(10, Math.min(baseY, window.innerHeight - 200)), // Keep within vertical bounds
      };
    }
  } else if (selectedRouteId) {
    const route = state.doc.routes.find((r) => r.id === selectedRouteId);
    if (
      route &&
      route.segments.length > 0 &&
      route.segments[0].points.length > 0
    ) {
      // Position near the first point of the first segment of the route
      const firstPoint = route.segments[0].points[0];
      const baseX = firstPoint.x * 15 + 50;
      const baseY = firstPoint.y * 15 - 50;

      // Ensure popup stays within viewport bounds
      popupPosition = {
        x: Math.max(10, Math.min(baseX, window.innerWidth - 320)),
        y: Math.max(10, Math.min(baseY, window.innerHeight - 200)),
      };
    }
  }

  return (
    <div
      className="absolute z-50 bg-surface-card border border-border rounded-lg shadow-lg p-3 min-w-64"
      style={{
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
        maxWidth: "300px",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-content-primary">
          {selectedPlayerId
            ? "Player Properties"
            : selectedRouteId
              ? "Route Properties"
              : "Properties"}
        </h3>
        <button
          onClick={() => dispatch({ type: "CLEAR_SELECTION" })}
          className="text-content-secondary hover:text-content-primary p-1"
          title="Close"
        >
          ×
        </button>
      </div>
      {selectedPlayerId && <PlayerPropertiesPanel />}
      {selectedRouteId && <RoutePropertiesPanel />}
      {!selectedPlayerId && !selectedRouteId && (
        <div className="text-sm text-content-secondary">
          Properties panel for selected element
        </div>
      )}
    </div>
  );
};

export const PlayDiagramBuilder: React.FC<PlayDiagramBuilderProps> = ({
  play,
  onClose: _onClose,
}) => {
  return (
    <DiagramEditorProvider>
      <PlayDiagramContent play={play} />
    </DiagramEditorProvider>
  );
};
