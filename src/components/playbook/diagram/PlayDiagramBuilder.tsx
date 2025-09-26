import React, { useEffect, useCallback } from "react";
import { DiagramEditorProvider } from "./context/DiagramEditorProvider";
import { ModernToolPalette } from "./components/ModernToolPalette";
import { FootballFieldCanvas } from "./components/FootballFieldCanvas";
import { ShapeManipulator } from "./components/ShapeManipulator";
import { PlayerPropertiesPanel } from "./components/PlayerPropertiesPanel";
import { RoutePropertiesPanel } from "./components/RoutePropertiesPanel";
import { useDiagramEditor } from "./context/useDiagramEditor";
import type { DiagramPlayer } from "./types/types";
import type { Play } from "../../../types/play";

interface PlayDiagramBuilderProps {
  play?: Play;
  onClose?: () => void;
}

const PlayDiagramContent: React.FC<{ play?: Play }> = ({ play }) => {
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

  // Save/Load functionality
  const handleSave = useCallback(() => {
    // This is a placeholder - in a real implementation you'd save to a backend or localStorage
    console.log("Saving diagram...");
    alert("Save functionality will be implemented soon!");
  }, []);

  const handleLoad = useCallback(() => {
    // This is a placeholder - in a real implementation you'd load from a backend or localStorage
    console.log("Loading diagram...");
    alert("Load functionality will be implemented soon!");
  }, []);

  // Export functionality
  const handleExport = useCallback((format: "png" | "svg" | "pdf") => {
    // This is a placeholder implementation
    // In a real implementation, you'd capture the canvas and generate the export
    console.log(`Exporting diagram as ${format.toUpperCase()}`);

    // For now, just show an alert
    alert(
      `Export functionality for ${format.toUpperCase()} will be implemented soon!`
    );
  }, []);

  // Parse personnel string (e.g., "11 Personnel") and create DiagramPlayer objects
  const generatePersonnelFromPlay = (playData: Play): DiagramPlayer[] => {
    const personnel: DiagramPlayer[] = [];

    // Always add QB
    personnel.push({
      id: "QB",
      label: "QB",
      role: "QB",
      side: "O",
      x: 50, // Center of field
      y: 30, // Back of formation
      color: "#047857",
    });

    // Parse personnel string (e.g., "11 Personnel" = 1 RB, 1 TE, 3 WR)
    if (playData.personnel) {
      const personnelMatch = playData.personnel.match(/^(\d)(\d)/);
      if (personnelMatch) {
        const rbCount = parseInt(personnelMatch[1]);
        const teCount = parseInt(personnelMatch[2]);
        const wrCount = 5 - rbCount - teCount; // Total 5 skill players

        // Add RBs
        for (let i = 0; i < rbCount; i++) {
          personnel.push({
            id: `RB${i + 1}`,
            label: rbCount === 1 ? "RB" : `RB${i + 1}`,
            role: "RB",
            side: "O",
            x: 45 + i * 5, // Spread out behind QB
            y: 35,
            color: "#1e3a8a",
          });
        }

        // Add TEs
        for (let i = 0; i < teCount; i++) {
          personnel.push({
            id: `TE${i + 1}`,
            label: teCount === 1 ? "TE" : `TE${i + 1}`,
            role: "TE",
            side: "O",
            x: 40 + i * 10,
            y: 25,
            color: "#7c3aed",
          });
        }

        // Add WRs (X, Y, Z, A, B positions)
        const wrPositions = [
          { id: "X", x: 80, y: 20 },
          { id: "Y", x: 70, y: 25 },
          { id: "Z", x: 20, y: 25 },
          { id: "A", x: 85, y: 15 },
          { id: "B", x: 15, y: 15 },
        ];

        for (let i = 0; i < wrCount && i < wrPositions.length; i++) {
          personnel.push({
            id: wrPositions[i].id,
            label: wrPositions[i].id,
            role: "WR",
            side: "O",
            x: wrPositions[i].x,
            y: wrPositions[i].y,
            color: "#dc2626",
          });
        }
      }
    }

    // Add offensive line (always 5)
    const olPositions = [
      { id: "LT", label: "LT", x: 35, y: 30 },
      { id: "LG", label: "LG", x: 40, y: 30 },
      { id: "C", label: "C", x: 50, y: 30 },
      { id: "RG", label: "RG", x: 60, y: 30 },
      { id: "RT", label: "RT", x: 65, y: 30 },
    ];

    olPositions.forEach((pos) => {
      personnel.push({
        id: pos.id,
        label: pos.label,
        role: "OL",
        side: "O",
        x: pos.x,
        y: pos.y,
        color: "#059669",
      });
    });

    return personnel;
  };

  // Automatically populate personnel when play data is available
  useEffect(() => {
    if (play) {
      const personnel = generatePersonnelFromPlay(play);

      // Add each player to the diagram
      personnel.forEach((player) => {
        dispatch({ type: "ADD_PLAYER", player });
      });
    }
  }, [play, dispatch]);

  return (
    <div className="w-full h-full bg-surface-primary flex flex-col">
      {/* Header Toolbar */}
      <div className="h-14 bg-surface-card border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-content-primary">
            Play Diagram Builder
          </h1>
          {play && (
            <span className="text-sm text-content-secondary bg-surface-secondary px-2 py-1 rounded">
              {play.play_name}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => dispatch({ type: "UNDO" })}
            className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            onClick={() => dispatch({ type: "REDO" })}
            className="p-1.5 text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
          <div className="w-px h-6 bg-border mx-1"></div>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded border border-border transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleLoad}
            className="px-3 py-1.5 text-sm bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded border border-border transition-colors"
          >
            Load
          </button>
          <button className="px-3 py-1.5 text-sm bg-primary hover:bg-primary-hover text-white rounded transition-colors relative group">
            Export
            <div className="absolute top-full right-0 mt-1 bg-surface-card border border-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto min-w-32">
              <button
                onClick={() => handleExport("png")}
                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary first:rounded-t last:rounded-b"
              >
                Export as PNG
              </button>
              <button
                onClick={() => handleExport("svg")}
                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary first:rounded-t last:rounded-b"
              >
                Export as SVG
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full text-left px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary first:rounded-t last:rounded-b"
              >
                Export as PDF
              </button>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-surface-card border-r border-border flex flex-col flex-shrink-0">
          <ModernToolPalette />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
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
