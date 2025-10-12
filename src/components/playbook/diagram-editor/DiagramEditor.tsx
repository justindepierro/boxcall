/**
 * Pixi Diagram Editor - Main Entry Point
 *
 * Elite football diagram editor using Pixi.js v8.5.2
 * for hardware-accelerated WebGL rendering and mobile-first experience.
 */

import React, { useState, useEffect, useCallback } from "react";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { PixiErrorBoundary } from "./components/PixiErrorBoundary";
import { LandscapePrompt } from "../../LandscapePrompt";
import { DesktopLayout } from "../DesktopLayout";
import { MobileLayout } from "../MobileLayout";
import { TabletLayout } from "../TabletLayout";
import { useKeyboardControls } from "./hooks/useKeyboardControls";
import { useCopyPaste } from "./hooks/useCopyPaste";
import { useDragBoxSelection } from "./hooks/useDragBoxSelection";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { useAutosave } from "./hooks/useAutosave";
import { useDiagramStore } from "./stores/diagramStore";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { useIsMobilePortrait } from "../../../hooks/useOrientation";
import { supabase } from "../../../lib/supabase";
import { Icon } from "../../../components/ui/Icon/Icon";
import { TipsPopover } from "./components/TipsPopover";
import { DIAGRAM_EDITOR_TIPS } from "./constants/editorTips";
import type { DiagramPixiApp } from "./core/PixiApp";
import type { FieldColorMode } from "./layers/FieldLayer";
import type { DiagramDocument } from "./types/DiagramTypes";
import type { Player } from "./types/Player";
import type { Play } from "../../../types/play";
import type { PersonnelPlayer } from "../../../types/personnel";
import { usePersonnelConfigurationByName } from "../../../hooks/usePersonnel";

// Re-export types for backwards compatibility with PlaybookPage
export type { DiagramMetadata, DiagramDocument } from "./types/DiagramTypes";

export type FieldPosition = "midfield" | "backed-up" | "red-zone" | "free-draw";

export interface DiagramEditorProps {
  onClose?: () => void;
  play?: Play | null; // Optional play to load personnel from and enable autosave
}

const DiagramEditorComponent: React.FC<DiagramEditorProps> = ({
  onClose,
  play,
}) => {
  const [app, setApp] = useState<DiagramPixiApp | null>(null);
  const [colorMode, setColorMode] = useState<FieldColorMode>("jade");
  const [fieldPosition, setFieldPosition] = useState<FieldPosition>("midfield");
  const [playName, setPlayName] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [selectedAlignment, setSelectedAlignment] = useState<
    "left" | "middle" | "right"
  >("middle");

  // Mobile state
  const breakpoint = useBreakpoint();
  const { isMobilePortrait } = useIsMobilePortrait();
  const [dismissedLandscapePrompt, setDismissedLandscapePrompt] =
    useState(false);

  // Fetch personnel configuration if play has personnel assigned
  const personnelName = play?.personnel || "11 Personnel"; // Default to 11 Personnel
  const playbookId = play?.playbook_id;

  const { data: personnelConfig } = usePersonnelConfigurationByName(
    playbookId,
    personnelName
  );

  // Load personnel players into diagram when config is available
  useEffect(() => {
    // Get store actions
    const { addPlayer, clearPlayers } = useDiagramStore.getState();

    // Clear existing players before adding personnel
    clearPlayers();

    // If no personnel config found, create a default 11 Personnel formation
    if (
      !personnelConfig ||
      !personnelConfig.players ||
      personnelConfig.players.length === 0
    ) {
      // Create default 11 Personnel formation (QB, RB, TE, WR, WR)
      const defaultPersonnel = [
        { position: "QB", label: "Q", x: 26.67, y: 12 },
        { position: "RB", label: "R", x: 31, y: 10 },
        { position: "TE", label: "T", x: 21, y: 17.5 },
        { position: "WR", label: "X", x: 10, y: 17.5 },
        { position: "WR", label: "Y", x: 43, y: 17.5 },
      ];

      defaultPersonnel.forEach((player, index) => {
        const diagramPlayer: Player = {
          id: `default-${player.position}-${index}`,
          x: player.x,
          y: player.y,
          jerseyNumber: player.label,
          team: "offense" as const,
          role: player.position,
          position: player.position === "QB" ? "center" : "regular",
        };
        addPlayer(diagramPlayer);
      });

      console.log("ℹ️ No personnel config found, loaded default 11 Personnel");
      return;
    }

    // Position mapping: Define where each position type should be placed on field
    // Field is 53.333 yards wide x 35 yards tall (0,0 is top-left)
    // Center of field is at x: 26.67, typical line of scrimmage around y: 17.5
    const POSITION_COORDS: Record<string, { x: number; y: number }> = {
      QB: { x: 26.67, y: 12 }, // Behind center (5.5 yards back)
      RB: { x: 31, y: 10 }, // In backfield, offset right
      TE: { x: 21, y: 17.5 }, // On line, tight to tackle
      WR: { x: 10, y: 17.5 }, // Split out left (will be adjusted by sort_order)
    };

    // Create diagram players from personnel configuration
    personnelConfig.players.forEach(
      (personnelPlayer: PersonnelPlayer, index: number) => {
        const position = personnelPlayer.player_position;
        let baseCoords = POSITION_COORDS[position] || { x: 26.67, y: 17.5 };

        // Adjust WR positions based on sort_order to spread them out
        if (position === "WR") {
          const wrIndex = personnelConfig.players
            .filter((p: PersonnelPlayer) => p.player_position === "WR")
            .findIndex((p: PersonnelPlayer) => p.id === personnelPlayer.id);

          // Spread WRs across field: X (left), Y (slot left), Z (slot right), etc.
          const positions = [
            { x: 10, y: 17.5 }, // X - far left
            { x: 18, y: 17.5 }, // Y - slot left
            { x: 35, y: 17.5 }, // Z - slot right
            { x: 43, y: 17.5 }, // Additional WR - far right
          ];
          baseCoords = positions[wrIndex] || positions[0];
        }

        // Adjust RB positions if multiple RBs
        if (position === "RB") {
          const rbIndex = personnelConfig.players
            .filter((p: PersonnelPlayer) => p.player_position === "RB")
            .findIndex((p: PersonnelPlayer) => p.id === personnelPlayer.id);

          // Spread RBs in backfield
          if (rbIndex === 0) {
            baseCoords = { x: 31, y: 10 }; // Right side
          } else if (rbIndex === 1) {
            baseCoords = { x: 22, y: 10 }; // Left side
          }
        }

        // Adjust TE positions if multiple TEs
        if (position === "TE") {
          const teIndex = personnelConfig.players
            .filter((p: PersonnelPlayer) => p.player_position === "TE")
            .findIndex((p: PersonnelPlayer) => p.id === personnelPlayer.id);

          // Spread TEs on line
          if (teIndex === 0) {
            baseCoords = { x: 21, y: 17.5 }; // Left side
          } else if (teIndex === 1) {
            baseCoords = { x: 32, y: 17.5 }; // Right side
          }
        }

        // Create the diagram player
        const diagramPlayer: Player = {
          id: `personnel-${personnelPlayer.id}-${index}`,
          x: baseCoords.x,
          y: baseCoords.y,
          jerseyNumber: personnelPlayer.label,
          team: "offense" as const,
          role: position,
          position: position === "QB" ? "center" : "regular", // QB gets square, others get circles
        };

        addPlayer(diagramPlayer);
      }
    );
  }, [personnelConfig]);

  // Modal states
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [confirmTitle, setConfirmTitle] = useState<string>("");
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState<boolean>(false);

  // Show landscape prompt if on mobile in portrait and not dismissed
  const showLandscapePrompt = isMobilePortrait && !dismissedLandscapePrompt;

  // Helper to show alert modal
  const showAlertModal = useCallback((title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  }, []);

  // Helper to show confirm modal
  const showConfirmModal = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmTitle(title);
      setConfirmMessage(message);
      setConfirmAction(() => onConfirm);
      setShowConfirm(true);
    },
    []
  );

  const { players } = useDiagramStore();

  // Track if diagram has been modified
  useEffect(() => {
    if (players.length > 0) {
      setIsDirty(true);
    }
  }, [players]);

  // Cleanup: Clear players when component unmounts
  useEffect(() => {
    return () => {
      // Clear the store when diagram editor closes
      useDiagramStore.getState().clearPlayers();
    };
  }, []);

  // Enable keyboard controls (arrow keys, delete, escape)
  useKeyboardControls({ app, enabled: true });

  // Enable copy/paste (Ctrl/Cmd+C/V/D)
  useCopyPaste({ app, enabled: true });

  // Enable drag box selection (click+drag on empty field)
  useDragBoxSelection({ app, enabled: true });

  // Enable undo/redo (Ctrl+Z/Ctrl+Shift+Z)
  useUndoRedo({ app, enabled: true });

  // Helper function to detect formation based on player positions
  const detectFormation = useCallback((playerList: Player[]): string => {
    const offensivePlayers = playerList.filter((p) => p.team === "offense");

    if (offensivePlayers.length === 0) return "Unknown";
    if (offensivePlayers.length === 11) return "11 Personnel";

    // Simple detection - can be enhanced
    return `${offensivePlayers.length} Players`;
  }, []);

  // Autosave callback - saves diagram data to the play
  const handleAutosave = useCallback(
    async (diagramData: DiagramDocument) => {
      if (!play?.id) {
        console.log("⏭️  Skipping autosave: no play ID (new play, user must save manually)");
        return;
      }

      if (!play.play_name?.trim()) {
        console.log("⏭️  Skipping autosave: no play name");
        return;
      }

      console.log(`💾 Autosaving diagram for play ID: ${play.id}...`);

      const updateData: Partial<Play> = {
        diagram_data: diagramData,
        diagram_version: 2,
        formation: detectFormation(players),
      };

      const { error } = await supabase
        .from("plays")
        .update(updateData as any)
        .eq("id", play.id);

      if (error) {
        console.error("❌ Autosave failed:", error);
        throw new Error(error.message);
      }

      console.log("✅ Autosave successful");
    },
    [play, players, detectFormation]
  );

  // Enable autosave with debouncing (only for existing plays)
  const { status: saveStatus, lastSaved } = useAutosave(players, play?.play_name || "", {
    enabled: Boolean(play?.id), // Only enable autosave for existing plays
    debounceMs: 2500, // Save after 2.5 seconds of inactivity
    onSave: handleAutosave,
    onSaveSuccess: () => {
      console.log("✅ Autosave completed");
      setIsDirty(false);
    },
    onSaveError: (error) => {
      console.error("❌ Autosave error:", error);
      // Don't show alert for autosave errors, just log them
    },
  });

  const handleReady = useCallback((pixiApp: DiagramPixiApp) => {
    console.log("✅ Pixi Diagram Editor Ready!", pixiApp);
    console.log(`📊 FPS: ${pixiApp.getFPS()}`);
    setApp(pixiApp);
  }, []);

  const handleColorModeChange = useCallback(() => {
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
  }, [colorMode, app]);

  const handleFieldPositionChange = useCallback(
    (position: FieldPosition) => {
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
    },
    [app]
  );

  const performSave = useCallback(
    async (name: string) => {
      try {
        console.log(`💾 Saving play: "${name}"...`);

        // Build the diagram document
        const diagramData: DiagramDocument = {
          version: 2,
          players,
          meta: {
            createdAt: play?.diagram_data?.meta?.createdAt || Date.now(),
            updatedAt: Date.now(),
          },
        };

        // Prepare the play data
        const playData: Partial<Play> = {
          play_name: name,
          formation: detectFormation(players),
          p_type: (play?.p_type || "Pass") as Play["p_type"], // Preserve existing type or default to Pass
          diagram_data: diagramData,
          diagram_version: 2,
        };

        console.log("📊 Diagram data:", diagramData);

        let data;
        let error;

        // If we have a play ID, update the existing play
        if (play?.id) {
          console.log(`🔄 Updating existing play ID: ${play.id}`);
          const result = await supabase
            .from("plays")
            .update(playData as any) // Type assertion for now until database types are fully synced
            .eq("id", play.id)
            .select()
            .single();
          data = result.data;
          error = result.error;
        } else {
          // Otherwise, insert a new play
          console.log("➕ Inserting new play");
          const result = await supabase
            .from("plays")
            .insert(playData as any) // Type assertion for now until database types are fully synced
            .select()
            .single();
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error("❌ Supabase error:", error);
          showAlertModal(
            "❌ Save Failed",
            `Failed to save play: ${error.message}`
          );
          return;
        }

        console.log("✅ Play saved successfully:", data);

        // Mark as saved
        setIsDirty(false);
        setShowSaveDialog(false);

        showAlertModal("✅ Success", `Play "${name}" saved successfully!`);
      } catch (err) {
        console.error("❌ Error saving play:", err);
        showAlertModal(
          "❌ Save Failed",
          `Failed to save play: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    },
    [players, detectFormation, showAlertModal, play]
  );

  const handleSave = useCallback(() => {
    if (!playName.trim()) {
      setShowSaveDialog(true);
      return;
    }
    performSave(playName);
  }, [playName, performSave]);

  const handleClose = useCallback(() => {
    if (isDirty && players.length > 0) {
      setShowUnsavedChanges(true);
      return;
    }

    // Clear players before closing
    useDiagramStore.getState().clearPlayers();

    if (onClose) {
      onClose();
    }
  }, [isDirty, players.length, onClose]);

  const handleSaveAndClose = useCallback(() => {
    if (!playName.trim()) {
      setShowSaveDialog(true);
      setShowUnsavedChanges(false);
      return;
    }
    performSave(playName);
    useDiagramStore.getState().clearPlayers();
    setShowUnsavedChanges(false);
    if (onClose) {
      onClose();
    }
  }, [playName, performSave, onClose]);

  const handleCloseWithoutSaving = useCallback(() => {
    useDiagramStore.getState().clearPlayers();
    setShowUnsavedChanges(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const handleClearWhiteboard = useCallback(() => {
    if (isDirty && players.length > 0) {
      showConfirmModal(
        "🗑️ Clear Whiteboard",
        "Clear whiteboard? This will erase all players.\n\nThis action cannot be undone.",
        () => {
          // Clear all players through the store
          useDiagramStore.getState().clearPlayers();
          setPlayName("");
          setIsDirty(false);
        }
      );
      return;
    }

    // Clear all players through the store
    useDiagramStore.getState().clearPlayers();
    setPlayName("");
    setIsDirty(false);
  }, [isDirty, players.length, showConfirmModal]);

  // Toolbar handlers
  const handleAddSingleOffense = useCallback(() => {
    if (!app?.playersLayer) return;

    const number = players.filter((p) => p.team === "offense").length + 1;
    const lastPos = app.playersLayer.getLastDroppedPosition();

    const x = lastPos
      ? Math.min(app.coordinates.fieldWidth - 1, lastPos.x + 2.0)
      : 26.666;
    const y = lastPos ? lastPos.y : 17.5;

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x,
      y,
      jerseyNumber: number.toString(),
      team: "offense",
    };

    useDiagramStore.getState().addPlayer(newPlayer);
  }, [app, players]);

  const handleAddSingleDefense = useCallback(() => {
    if (!app?.playersLayer) return;

    const number = players.filter((p) => p.team === "defense").length + 1;
    const lastPos = app.playersLayer.getLastDroppedPosition();

    const x = lastPos
      ? Math.min(app.coordinates.fieldWidth - 1, lastPos.x + 2.0)
      : 26.666;
    const y = lastPos ? lastPos.y : 27.5;

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      x,
      y,
      jerseyNumber: number.toString(),
      team: "defense",
    };

    useDiagramStore.getState().addPlayer(newPlayer);
  }, [app, players]);

  const handleDeleteSelected = useCallback(() => {
    const selectedPlayerId = useDiagramStore.getState().selectedPlayerId;
    if (selectedPlayerId) {
      useDiagramStore.getState().removePlayer(selectedPlayerId);
    }
  }, []);

  const handleClearOffense = useCallback(() => {
    const offensePlayers = players.filter((p) => p.team === "offense");
    if (offensePlayers.length === 0) {
      showAlertModal(
        "No Offensive Players",
        "There are no offensive players to clear."
      );
      return;
    }
    showConfirmModal(
      "⚪ Clear Offense",
      `Clear all ${offensePlayers.length} offensive players?`,
      () => {
        offensePlayers.forEach((p) =>
          useDiagramStore.getState().removePlayer(p.id)
        );
      }
    );
  }, [players, showAlertModal, showConfirmModal]);

  const handleClearDefense = useCallback(() => {
    const defensePlayers = players.filter((p) => p.team === "defense");
    if (defensePlayers.length === 0) {
      showAlertModal(
        "No Defensive Players",
        "There are no defensive players to clear."
      );
      return;
    }
    showConfirmModal(
      "⚫ Clear Defense",
      `Clear all ${defensePlayers.length} defensive players?`,
      () => {
        defensePlayers.forEach((p) =>
          useDiagramStore.getState().removePlayer(p.id)
        );
      }
    );
  }, [players, showAlertModal, showConfirmModal]);

  const handleAlignmentChange = useCallback(
    (alignment: "left" | "middle" | "right") => {
      setSelectedAlignment(alignment);
      // The PlayerControls component will react to this change
    },
    []
  );

  // Get selected player count for conditional toolbar
  const selectedPlayerCount =
    app?.playersLayer?.getSelectedPlayerIds().length ?? 0;

  // Align selected players horizontally or vertically
  const handleAlignPlayers = useCallback(
    (direction: "horizontal" | "vertical") => {
      if (!app?.playersLayer) return;

      const selectedIds = app.playersLayer.getSelectedPlayerIds();
      if (selectedIds.length < 2) return;

      const selectedPlayers = selectedIds
        .map((id) => app.playersLayer!.getPlayer(id)?.getPlayer())
        .filter((p): p is Player => p !== undefined);

      if (direction === "horizontal") {
        // Align to average Y position
        const avgY =
          selectedPlayers.reduce((sum, p) => sum + p.y, 0) /
          selectedPlayers.length;
        selectedIds.forEach((id) => {
          const sprite = app.playersLayer!.getPlayer(id);
          if (sprite) {
            sprite.updatePlayer({ y: avgY });
          }
        });
      } else {
        // Align to average X position
        const avgX =
          selectedPlayers.reduce((sum, p) => sum + p.x, 0) /
          selectedPlayers.length;
        selectedIds.forEach((id) => {
          const sprite = app.playersLayer!.getPlayer(id);
          if (sprite) {
            sprite.updatePlayer({ x: avgX });
          }
        });
      }
    },
    [app]
  );

  // Distribute selected players evenly
  const handleDistributePlayers = useCallback(
    (direction: "horizontal" | "vertical") => {
      if (!app?.playersLayer) return;

      const selectedIds = app.playersLayer.getSelectedPlayerIds();
      if (selectedIds.length < 3) return;

      const selectedPlayers = selectedIds
        .map((id) => app.playersLayer!.getPlayer(id)?.getPlayer())
        .filter((p): p is Player => p !== undefined);

      if (direction === "horizontal") {
        // Sort by X position
        const sorted = [...selectedPlayers].sort((a, b) => a.x - b.x);
        const minX = sorted[0].x;
        const maxX = sorted[sorted.length - 1].x;
        const spacing = (maxX - minX) / (sorted.length - 1);

        sorted.forEach((player, index) => {
          const sprite = app.playersLayer!.getPlayer(player.id);
          if (sprite && index > 0 && index < sorted.length - 1) {
            sprite.updatePlayer({ x: minX + spacing * index });
          }
        });
      } else {
        // Sort by Y position
        const sorted = [...selectedPlayers].sort((a, b) => a.y - b.y);
        const minY = sorted[0].y;
        const maxY = sorted[sorted.length - 1].y;
        const spacing = (maxY - minY) / (sorted.length - 1);

        sorted.forEach((player, index) => {
          const sprite = app.playersLayer!.getPlayer(player.id);
          if (sprite && index > 0 && index < sorted.length - 1) {
            sprite.updatePlayer({ y: minY + spacing * index });
          }
        });
      }
    },
    [app]
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Show landscape prompt on mobile portrait */}
      {showLandscapePrompt && (
        <LandscapePrompt
          onContinueAnyway={() => setDismissedLandscapePrompt(true)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-card border-b border-border">
        <div className="flex items-center gap-4">
          {/* Title */}
          <h1 className="text-xl font-bold text-content-primary flex items-center gap-2">
            <Icon name="pen-tool" size="lg" />
            Diagram Editor
          </h1>

          {/* Personnel Badge - Show if play has personnel assigned */}
          {play && personnelName && (
            <div className="flex items-center gap-2 pl-4 border-l border-border">
              <span className="text-xs text-content-secondary">Personnel:</span>
              <div className="px-3 py-1.5 rounded-full bg-jade-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                <Icon name="users" size="sm" />
                <span>{personnelName}</span>
                {personnelConfig && personnelConfig.description && (
                  <span className="text-jade-100 font-normal">
                    ({personnelConfig.description})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Toolbar Controls */}
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            {/* Add Players */}
            <button
              onClick={handleAddSingleOffense}
              className="px-4 py-1.5 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-full font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              title="Add Offense Player"
            >
              <Icon name="plus-circle" size="sm" />
              <span>Offense</span>
            </button>
            <button
              onClick={handleAddSingleDefense}
              className="px-4 py-1.5 text-xs bg-error-500 text-white hover:bg-error-600 rounded-full font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              title="Add Defense Player"
            >
              <Icon name="plus-circle" size="sm" />
              <span>Defense</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Alignment Toggle */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-content-secondary mr-1.5">
                Hash:
              </span>
              <button
                onClick={() => handleAlignmentChange("left")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shadow-sm ${
                  selectedAlignment === "left"
                    ? "bg-jade-600 text-white"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                }`}
                title="Align to Left Hash"
              >
                <Icon name="arrow-left" size="sm" />
                <span>Left</span>
              </button>
              <button
                onClick={() => handleAlignmentChange("middle")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shadow-sm ${
                  selectedAlignment === "middle"
                    ? "bg-jade-600 text-white"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                }`}
                title="Align to Middle"
              >
                <Icon name="circle" size="sm" />
                <span>Mid</span>
              </button>
              <button
                onClick={() => handleAlignmentChange("right")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 shadow-sm ${
                  selectedAlignment === "right"
                    ? "bg-jade-600 text-white"
                    : "bg-surface-secondary text-content-secondary hover:bg-surface-tertiary"
                }`}
                title="Align to Right Hash"
              >
                <Icon name="arrow-right" size="sm" />
                <span>Right</span>
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Undo/Redo */}
            <button
              onClick={() => alert("Undo coming soon! Use Ctrl/Cmd+Z")}
              disabled={true}
              className="px-3 py-1.5 text-xs bg-surface-tertiary text-content-tertiary rounded-full font-medium cursor-not-allowed opacity-50 flex items-center gap-1"
              title="Undo (Coming Soon)"
            >
              <Icon name="undo" size="sm" />
              <span>Undo</span>
            </button>
            <button
              onClick={() => alert("Redo coming soon! Use Ctrl/Cmd+Shift+Z")}
              disabled={true}
              className="px-3 py-1.5 text-xs bg-surface-tertiary text-content-tertiary rounded-full font-medium cursor-not-allowed opacity-50 flex items-center gap-1"
              title="Redo (Coming Soon)"
            >
              <Icon name="undo" size="sm" />
              <span>Redo</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Delete/Clear */}
            <button
              onClick={handleDeleteSelected}
              disabled={!useDiagramStore.getState().selectedPlayerId}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                useDiagramStore.getState().selectedPlayerId
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Delete Selected Player"
            >
              <Icon name="delete" size="sm" />
              <span>Delete</span>
            </button>
            <button
              onClick={handleClearOffense}
              disabled={
                players.filter((p) => p.team === "offense").length === 0
              }
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                players.filter((p) => p.team === "offense").length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Clear All Offense"
            >
              <Icon name="close" size="sm" />
              <span>Clear O</span>
            </button>
            <button
              onClick={handleClearDefense}
              disabled={
                players.filter((p) => p.team === "defense").length === 0
              }
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                players.filter((p) => p.team === "defense").length > 0
                  ? "bg-error-600 text-white hover:bg-error-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Clear All Defense"
            >
              <Icon name="close" size="sm" />
              <span>Clear D</span>
            </button>
            <button
              onClick={handleClearWhiteboard}
              disabled={players.length === 0}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm ${
                players.length > 0
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-surface-tertiary text-content-tertiary cursor-not-allowed opacity-50"
              }`}
              title="Clear All Players"
            >
              <Icon name="delete" size="sm" />
              <span>Clear All</span>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-border"></div>

            {/* Quick Tips */}
            <TipsPopover tips={DIAGRAM_EDITOR_TIPS} side="bottom" align="end" />
          </div>
        </div>

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

      {/* Main Content: Responsive Layouts */}
      {breakpoint === "mobile" ? (
        <MobileLayout
          app={app}
          selectedAlignment={selectedAlignment}
          onAlignmentChange={handleAlignmentChange}
          onAddPlayer={handleAddSingleOffense}
          onAddFormation={() => alert("Formation picker coming soon!")}
          onClear={handleClearWhiteboard}
          onUndo={() => alert("Undo coming soon!")}
        >
          <PixiErrorBoundary>
            <DiagramCanvas
              fieldWidth={53.333}
              fieldHeight={35}
              // No pixelsPerYard - will be calculated responsively
              backgroundColor={0x222222}
              onReady={handleReady}
            />
          </PixiErrorBoundary>
        </MobileLayout>
      ) : breakpoint === "tablet" ? (
        <TabletLayout app={app} selectedAlignment={selectedAlignment}>
          <PixiErrorBoundary>
            <DiagramCanvas
              fieldWidth={53.333}
              fieldHeight={35}
              // No pixelsPerYard - will be calculated responsively
              backgroundColor={0x222222}
              onReady={handleReady}
            />
          </PixiErrorBoundary>
        </TabletLayout>
      ) : (
        <DesktopLayout app={app} selectedAlignment={selectedAlignment}>
          <PixiErrorBoundary>
            <DiagramCanvas
              fieldWidth={53.333}
              fieldHeight={35}
              // No pixelsPerYard - will be calculated responsively
              backgroundColor={0x222222}
              onReady={handleReady}
            />
          </PixiErrorBoundary>
        </DesktopLayout>
      )}

      {/* Status Bar */}
      <div className="px-4 py-2 bg-surface-card border-t border-border text-xs text-content-secondary">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Status indicators */}
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
            
            {/* Autosave status indicator */}
            {play?.id && saveStatus === "saving" && (
              <span className="text-info-500 flex items-center gap-1 animate-pulse">
                <Icon name="clock" size="xs" />
                Saving...
              </span>
            )}
            {play?.id && saveStatus === "saved" && lastSaved && (
              <span className="text-success-500 flex items-center gap-1">
                <Icon name="check-circle" size="xs" />
                Saved
              </span>
            )}
            {play?.id && saveStatus === "error" && (
              <span className="text-error-500 flex items-center gap-1">
                <Icon name="alert" size="xs" />
                Save failed
              </span>
            )}
            
            {/* Show unsaved warning for new plays (no autosave) */}
            {!play?.id && isDirty && (
              <span className="text-warning-500 flex items-center gap-1">
                <Icon name="alert" size="xs" />
                Unsaved changes
              </span>
            )}
          </div>

          {/* Right side: Conditional Align/Distribute tools */}
          {(selectedPlayerCount >= 2 || selectedPlayerCount >= 3) && (
            <div className="flex items-center gap-2">
              {/* Align tools (2+ players) */}
              {selectedPlayerCount >= 2 && (
                <>
                  <span className="text-content-tertiary">Align:</span>
                  <button
                    onClick={() => handleAlignPlayers("horizontal")}
                    className="px-3 py-1 text-xs bg-jade-600 text-white hover:bg-jade-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                    title="Align Horizontally"
                  >
                    <Icon name="minus" size="xs" />
                    <span>Horizontal</span>
                  </button>
                  <button
                    onClick={() => handleAlignPlayers("vertical")}
                    className="px-3 py-1 text-xs bg-jade-600 text-white hover:bg-jade-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                    title="Align Vertically"
                  >
                    <Icon name="grip-vertical" size="xs" />
                    <span>Vertical</span>
                  </button>
                </>
              )}

              {/* Distribute tools (3+ players) */}
              {selectedPlayerCount >= 3 && (
                <>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <span className="text-content-tertiary">Distribute:</span>
                  <button
                    onClick={() => handleDistributePlayers("horizontal")}
                    className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                    title="Distribute Horizontally"
                  >
                    <Icon name="arrow-right" size="xs" />
                    <span>Horizontal</span>
                  </button>
                  <button
                    onClick={() => handleDistributePlayers("vertical")}
                    className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-full font-medium transition-colors flex items-center gap-1 shadow-sm"
                    title="Distribute Vertically"
                  >
                    <Icon name="arrow-down" size="xs" />
                    <span>Vertical</span>
                  </button>
                </>
              )}
            </div>
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

      {/* Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
                <span className="text-3xl">
                  {alertTitle.includes("✅")
                    ? "✅"
                    : alertTitle.includes("❌")
                      ? "❌"
                      : "ℹ️"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-content-primary mb-2">
                  {alertTitle.replace(/✅|❌|⚠️|ℹ️/gu, "").trim()}
                </h2>
                <p className="text-base text-content-secondary whitespace-pre-line leading-relaxed">
                  {alertMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-content-primary mb-2">
                  {confirmTitle}
                </h2>
                <p className="text-base text-content-secondary whitespace-pre-line leading-relaxed">
                  {confirmMessage}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirmAction) {
                    confirmAction();
                  }
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150"
              >
                Yes, Continue
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {showUnsavedChanges && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-surface-primary border-2 border-stroke rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
                <span className="text-3xl">💾</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-content-primary mb-2">
                  Unsaved Changes
                </h2>
                <p className="text-base text-content-secondary leading-relaxed">
                  You have unsaved changes. What would you like to do?
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAndClose}
                className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <span>💾</span> Save and Close
              </button>
              <button
                onClick={handleCloseWithoutSaving}
                className="w-full px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-primary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
              >
                Close without Saving
              </button>
              <button
                onClick={() => setShowUnsavedChanges(false)}
                className="w-full px-5 py-3 bg-surface-secondary hover:bg-surface-tertiary text-content-secondary rounded-lg font-semibold border-2 border-stroke transform hover:scale-[1.02] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const DiagramEditor = React.memo(DiagramEditorComponent);

export default DiagramEditor;
