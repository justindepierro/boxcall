/**
 * Pixi Diagram Editor - Main Entry Point
 *
 * Elite football diagram editor using Pixi.js v8.5.2
 * for hardware-accelerated WebGL rendering and mobile-first experience.
 */

import React, { useState, useEffect } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { PlayerControls } from "./components/PlayerControls";
import { PixiErrorBoundary } from "./components/PixiErrorBoundary";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useCopyPaste } from "./hooks/useCopyPaste";
import { useDragBoxSelection } from "./hooks/useDragBoxSelection";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useDiagramStore } from "./stores/diagramStore";
import { supabase } from "../../../lib/supabase";
import { Icon } from "../../../components/ui/Icon/Icon";
import type { DiagramPixiApp } from "./core/PixiApp";
import type { FieldColorMode } from "./layers/FieldLayer";
import type { DiagramDocument } from "./types/DiagramTypes";
import type { Player } from "./types/Player";

// Re-export types for backwards compatibility with PlaybookPage
export type { DiagramMetadata, DiagramDocument } from "./types/DiagramTypes";

export type FieldPosition = "midfield" | "backed-up" | "red-zone" | "free-draw";

export interface DiagramEditorProps {
  onClose?: () => void;
}

export const DiagramEditor: React.FC<DiagramEditorProps> = ({ onClose }) => {
  const [app, setApp] = useState<DiagramPixiApp | null>(null);
  const [colorMode, setColorMode] = useState<FieldColorMode>("jade");
  const [fieldPosition, setFieldPosition] = useState<FieldPosition>("midfield");
  const [playName, setPlayName] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);

  const { players } = useDiagramStore();

  // Track if diagram has been modified
  useEffect(() => {
    if (players.length > 0) {
      setIsDirty(true);
    }
  }, [players]);

  // Enable keyboard controls (arrow keys, delete, escape)
  useKeyboardControls({ app, enabled: true });
  useKeyboardControls({ app, enabled: true });

  // Enable copy/paste (Ctrl/Cmd+C/V/D)
  useCopyPaste({ app, enabled: true });

  // Enable drag box selection (click+drag on empty field)
  useDragBoxSelection({ app, enabled: true });

  // Enable undo/redo (Ctrl+Z/Ctrl+Shift+Z)
  useUndoRedo({ app, enabled: true });

  const handleReady = (pixiApp: DiagramPixiApp) => {
    console.log("✅ Pixi Diagram Editor Ready!", pixiApp);
    console.log(`📊 FPS: ${pixiApp.getFPS()}`);
    setApp(pixiApp);
  };

  const handleColorModeChange = () => {
    const modes: FieldColorMode[] = ["jade", "blackwhite", "darkgray"];
    const currentIndex = modes.indexOf(colorMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setColorMode(nextMode);

    // Update field layer color mode
    if (app) {
      const fieldLayer = app.getFieldLayer();
      if (fieldLayer) {
        fieldLayer.setColorMode(nextMode);
      }
    }
  };

  const handleFieldPositionChange = (position: FieldPosition) => {
    setFieldPosition(position);

    // Update line of scrimmage based on position
    if (app) {
      const fieldLayer = app.getFieldLayer();
      if (fieldLayer) {
        switch (position) {
          case "midfield":
            fieldLayer.setLineOfScrimmage(25, true); // 50-yard line (middle)
            break;
          case "backed-up":
            fieldLayer.setLineOfScrimmage(5, true); // 10-yard line (backed up)
            break;
          case "red-zone":
            fieldLayer.setLineOfScrimmage(30, true); // 10-yard line from endzone
            break;
          case "free-draw":
            fieldLayer.setLineOfScrimmage(25, false); // Hide line of scrimmage
            break;
        }
      }
    }
  };

  const handleSave = () => {
    if (!playName.trim()) {
      setShowSaveDialog(true);
      return;
    }
    performSave(playName);
  };

  const performSave = async (name: string) => {
    try {
      console.log(`💾 Saving play: "${name}"...`);

      // Build the diagram document
      const diagramData: DiagramDocument = {
        version: 2,
        players,
        meta: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      // Prepare the play data
      const playData = {
        play_name: name,
        formation: detectFormation(players),
        p_type: "Pass" as const, // Default, user can change later
        diagram_data: diagramData,
      };

      console.log("📊 Diagram data:", diagramData);

      // Insert into Supabase
      const { data, error } = await supabase
        .from("plays")
        .insert(playData as any) // Type assertion for now until database types are fully synced
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);
        alert(`Failed to save play: ${error.message}`);
        return;
      }

      console.log("✅ Play saved successfully:", data);

      // Mark as saved
      setIsDirty(false);
      setShowSaveDialog(false);

      alert(`✅ Play "${name}" saved successfully!`);
    } catch (err) {
      console.error("❌ Error saving play:", err);
      alert(
        `Failed to save play: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  // Helper function to detect formation based on player positions
  const detectFormation = (playerList: Player[]): string => {
    const offensivePlayers = playerList.filter((p) => p.team === "offense");

    if (offensivePlayers.length === 0) return "Unknown";
    if (offensivePlayers.length === 11) return "11 Personnel";

    // Simple detection - can be enhanced
    return `${offensivePlayers.length} Players`;
  };

  const handleClose = () => {
    if (isDirty && players.length > 0) {
      const result = window.confirm(
        "You have unsaved changes. Do you want to save before closing?\n\n" +
          "OK = Save and close\n" +
          "Cancel = Close without saving"
      );

      if (result) {
        // User wants to save
        if (!playName.trim()) {
          setShowSaveDialog(true);
          return; // Don't close yet, wait for them to name it
        } else {
          performSave(playName);
        }
      }
    }

    if (onClose) {
      onClose();
    }
  };

  const handleClearWhiteboard = () => {
    if (isDirty && players.length > 0) {
      const confirmed = window.confirm(
        "Clear whiteboard? This will erase all players.\n\n" +
          "This action cannot be undone."
      );
      if (!confirmed) return;
    }

    // Clear all players through the store
    useDiagramStore.getState().clearPlayers();
    setPlayName("");
    setIsDirty(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-card border-b border-border">
        <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
          <Icon name="pen-tool" size="lg" />
          Diagram Editor
        </h1>
        <div className="flex items-center gap-3">
          {/* Field Position Selector */}
          <select
            value={fieldPosition}
            onChange={(e) =>
              handleFieldPositionChange(e.target.value as FieldPosition)
            }
            className="px-3 py-1.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary text-content-primary transition-colors text-sm font-medium border border-border cursor-pointer"
            title="Select field position"
          >
            <option value="midfield">Midfield</option>
            <option value="backed-up">Backed Up</option>
            <option value="red-zone">Red Zone</option>
            <option value="free-draw">Free Draw</option>
          </select>

          {/* Color Mode Toggle */}
          <button
            onClick={handleColorModeChange}
            className="px-3 py-1.5 rounded-md bg-surface-secondary hover:bg-surface-tertiary text-content-primary transition-colors text-sm font-medium border border-border flex items-center gap-2"
            title="Toggle field color mode"
          >
            <Icon name="sun" size="sm" />
            {colorMode === "jade" && "Jade"}
            {colorMode === "blackwhite" && "B&W"}
            {colorMode === "darkgray" && "Dark"}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isDirty
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-surface-secondary text-content-secondary cursor-not-allowed"
            }`}
            disabled={!isDirty}
            title={isDirty ? "Save play" : "No changes to save"}
          >
            <Icon name={isDirty ? "save" : "check-circle"} size="sm" />
            {isDirty ? "Save" : "Saved"}
          </button>

          {onClose && (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-content-primary transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Sidebar + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-surface-card border-r border-border flex-shrink-0 overflow-y-auto">
          <PlayerControls app={app} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-surface-secondary">
          <PixiErrorBoundary>
            <DiagramCanvas
              fieldWidth={53.333}
              fieldHeight={35}
              pixelsPerYard={20}
              backgroundColor={0x222222}
              onReady={handleReady}
            />
          </PixiErrorBoundary>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-surface-card border-t border-border text-xs text-content-secondary">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Icon name="check-circle" size="xs" />
            Elite Pixi.js Rendering
          </span>
          <span className="flex items-center gap-1">
            <Icon name="sparkles" size="xs" />
            Mobile-First
          </span>
          <span className="flex items-center gap-1">
            <Icon name="zap" size="xs" />
            WebGL Accelerated
          </span>
          <span className="flex items-center gap-1">
            <Icon name="target" size="xs" />
            Single Coordinate System
          </span>
          {isDirty && (
            <span className="text-warning-500 flex items-center gap-1">
              <Icon name="alert" size="xs" />
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-surface-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-content-primary mb-4 flex items-center gap-2">
                <Icon name="save" size="lg" />
                Save Play
              </h2>
              <p className="text-content-secondary mb-4">
                Give your play a name to save it:
              </p>
              <input
                type="text"
                value={playName}
                onChange={(e) => setPlayName(e.target.value)}
                placeholder="e.g., 4 Verts, Sluggo, Spider 2 Y Banana"
                className="w-full px-4 py-2 rounded-md bg-surface-secondary border border-border text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && playName.trim()) {
                    performSave(playName);
                  }
                  if (e.key === "Escape") {
                    setShowSaveDialog(false);
                  }
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => performSave(playName || "Untitled Play")}
                  disabled={!playName.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    playName.trim()
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-surface-secondary text-content-tertiary cursor-not-allowed"
                  }`}
                >
                  <Icon name="save" size="sm" />
                  Save
                </button>
                <button
                  onClick={handleClearWhiteboard}
                  className="flex-1 px-4 py-2 rounded-lg bg-error-600 hover:bg-error-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="delete" size="sm" />
                  Clear Whiteboard
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary text-content-primary font-medium transition-colors flex items-center gap-2"
                >
                  <Icon name="close" size="sm" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramEditor;
