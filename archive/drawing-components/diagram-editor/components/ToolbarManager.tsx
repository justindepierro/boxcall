/**
 * useToolbarManager Hook
 *
 * Handles toolbar actions like add players, clear players, alignment, etc.
 * Extracted from the monolithic DiagramEditor component for better maintainability.
 */

import { useCallback } from "react";
import { useDiagramStore } from "../stores/diagramStore";
import { FormationService } from "../../../../services/formationService";
import { convertFormationToDiagramPlayers } from "../../../../utils/formationDiagramHelpers";
import type { ProfessionalPixiEngine } from "../core/ProfessionalPixiEngine";
import type { Player } from "../types/Player";

interface UseToolbarManagerProps {
  app: ProfessionalPixiEngine | null;
  players: Player[];
  showAlertModal: (title: string, message: string) => void;
  showConfirmModal: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void;
  setIsDirty: (dirty: boolean) => void;
  setSelectedAlignment: (alignment: "left" | "middle" | "right") => void;
}

export const useToolbarManager = ({
  app,
  players,
  showAlertModal,
  showConfirmModal,
  setIsDirty,
  setSelectedAlignment,
}: UseToolbarManagerProps) => {
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

  const handleClearWhiteboard = useCallback(() => {
    if (players.length === 0) {
      // No confirmation needed if empty
      useDiagramStore.getState().clearPlayers();
      return;
    }

    showConfirmModal(
      "🗑️ Clear Whiteboard",
      "Clear whiteboard? This will erase all players.\n\nThis action cannot be undone.",
      () => {
        // Clear all players through the store
        useDiagramStore.getState().clearPlayers();
      }
    );
  }, [players.length, showConfirmModal]);

  // Get selected player count for conditional rendering
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

  // Change alignment setting
  const handleAlignmentChange = useCallback(
    (alignment: "left" | "middle" | "right") => {
      setSelectedAlignment(alignment);
      // The PlayerControls component will react to this change
    },
    [setSelectedAlignment]
  );

  // Load formation
  const handleLoadFormation = useCallback(
    async (formationId: string, mode: "replace" | "merge") => {
      try {
        // Fetch full formation with player positions
        const formation = await FormationService.getFormationById(formationId);

        if (!formation) {
          showAlertModal("Error", "Formation not found");
          return;
        }

        if (mode === "replace") {
          // Clear existing players
          useDiagramStore.getState().clearPlayers();
        }

        // Convert formation to diagram players using existing helper
        const diagramPlayers = convertFormationToDiagramPlayers(formation);

        // Add players to diagram
        diagramPlayers.forEach((player: Player) => {
          useDiagramStore.getState().addPlayer(player);
        });

        setIsDirty(true);
      } catch (error) {
        console.error("Failed to load formation:", error);
        showAlertModal("Error", "Failed to load formation. Please try again.");
      }
    },
    [showAlertModal, setIsDirty]
  );

  // Expose handlers to parent component
  return {
    handleAddSingleOffense,
    handleAddSingleDefense,
    handleDeleteSelected,
    handleClearOffense,
    handleClearDefense,
    handleClearWhiteboard,
    handleAlignmentChange,
    handleLoadFormation,
    handleAlignPlayers,
    handleDistributePlayers,
    selectedPlayerCount,
  } as const;
};
