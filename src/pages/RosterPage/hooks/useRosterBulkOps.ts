import { useCallback, useState } from "react";
import { rosterService } from "../../../services";
import type {
  RosterPlayerView,
  PlayerRosterInsert,
} from "../../../services/rosterService";
import type { BulkEditUpdates } from "../../../components/roster/BulkEditModal";
import { info, error as logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import {
  exportToCSV,
  generateExportFilename,
} from "../../../utils/exportUtils";
import type { UseRosterModalsReturn } from "./useRosterModals";
import { useBulkUpdatePlayersMutation } from "../../../hooks/useRosterQueries";

interface UseRosterBulkOpsOptions {
  teamId: string | null;
  modals: UseRosterModalsReturn;
  players: RosterPlayerView[];
  setPlayers: React.Dispatch<React.SetStateAction<RosterPlayerView[]>>;
  selectedPlayerIds: Set<string>;
  filteredPlayers: RosterPlayerView[];
  clearSelection: () => void;
  loadRoster: () => Promise<void>;
}

export interface UseRosterBulkOpsReturn {
  bulkSaving: boolean;
  handleBulkStatusChange: () => Promise<void>;
  handleBulkEdit: (updates: BulkEditUpdates) => Promise<void>;
  handleImportPlayers: (csvPlayers: any[]) => Promise<void>;
  handleExportCSV: () => void;
  togglePlayerStatus: (
    player: RosterPlayerView,
    e: React.MouseEvent
  ) => Promise<void>;
}

/**
 * useRosterBulkOps - Bulk operations for roster management
 */
export function useRosterBulkOps(
  options: UseRosterBulkOpsOptions
): UseRosterBulkOpsReturn {
  const {
    teamId,
    modals,
    players,
    setPlayers,
    selectedPlayerIds,
    filteredPlayers,
    clearSelection,
    loadRoster,
  } = options;
  const toast = useToast();
  const [bulkSaving, setBulkSaving] = useState(false);
  const bulkUpdateMutation = useBulkUpdatePlayersMutation(teamId);

  const handleBulkStatusChange = useCallback(async () => {
    if (selectedPlayerIds.size === 0) return;
    try {
      setBulkSaving(true);
      const playerIds = Array.from(selectedPlayerIds);
      await bulkUpdateMutation.mutateAsync({
        playerIds,
        updates: { roster_status: modals.bulkStatusValue },
      });
      toast.success(
        `Successfully updated ${playerIds.length} player${playerIds.length !== 1 ? "s" : ""}`
      );
      modals.closeBulkStatusDialog();
      clearSelection();
    } catch (error) {
      logError("[RosterPage] Failed to update player statuses:", error);
      toast.error("Failed to update player statuses. Please try again.");
    } finally {
      setBulkSaving(false);
    }
  }, [selectedPlayerIds, bulkUpdateMutation, modals, toast, clearSelection]);

  const handleBulkEdit = useCallback(
    async (updates: BulkEditUpdates) => {
      if (selectedPlayerIds.size === 0) return;
      try {
        const playerIds = Array.from(selectedPlayerIds);
        await bulkUpdateMutation.mutateAsync({ playerIds, updates });
        const updatedFields: string[] = [];
        if (updates.position) updatedFields.push("position");
        if (updates.grade_level) updatedFields.push("grade level");
        if (updates.height_inches) updatedFields.push("height");
        if (updates.weight_lbs) updatedFields.push("weight");
        toast.success(
          `Successfully updated ${updatedFields.join(", ")} for ${playerIds.length} player${playerIds.length !== 1 ? "s" : ""}`
        );
        modals.closeBulkEditModal();
        clearSelection();
      } catch (error) {
        logError("[RosterPage] Failed to bulk edit players:", error);
        toast.error("Failed to update players. Please try again.");
      }
    },
    [selectedPlayerIds, bulkUpdateMutation, modals, toast, clearSelection]
  );

  const handleImportPlayers = useCallback(
    async (csvPlayers: any[]) => {
      if (!teamId) return;
      try {
        setBulkSaving(true);
        for (const csvPlayer of csvPlayers) {
          const playerData: PlayerRosterInsert = {
            team_id: teamId,
            first_name: csvPlayer.firstName,
            last_name: csvPlayer.lastName,
            position: csvPlayer.position,
            jersey_number: csvPlayer.jerseyNumber
              ? parseInt(csvPlayer.jerseyNumber)
              : undefined,
            grade_level: csvPlayer.classYear as any,
            height_inches: csvPlayer.height
              ? parseInt(csvPlayer.height)
              : undefined,
            weight_lbs: csvPlayer.weight
              ? parseInt(csvPlayer.weight)
              : undefined,
          };
          await rosterService.createPlayer(playerData);
        }
        info(`[RosterPage] ${csvPlayers.length} players imported successfully`);
        toast.success(
          `Successfully imported ${csvPlayers.length} player${csvPlayers.length !== 1 ? "s" : ""}`
        );
        modals.closeImportModal();
        loadRoster();
      } catch (error) {
        logError("[RosterPage] Failed to import players:", error);
        toast.error(
          "Failed to import players. Please check the file and try again."
        );
      } finally {
        setBulkSaving(false);
      }
    },
    [teamId, modals, toast, loadRoster]
  );

  const handleExportCSV = useCallback(() => {
    try {
      const playersToExport =
        selectedPlayerIds.size > 0
          ? filteredPlayers.filter((p) => selectedPlayerIds.has(p.id))
          : filteredPlayers;
      if (playersToExport.length === 0) {
        toast.warning("No players to export");
        return;
      }
      const filename = generateExportFilename("team");
      exportToCSV(playersToExport, filename);
      toast.success(
        `Successfully exported ${playersToExport.length} player${playersToExport.length !== 1 ? "s" : ""} to CSV`
      );
      info(
        `[RosterPage] Exported ${playersToExport.length} players to CSV: ${filename}.csv`
      );
    } catch (error) {
      logError("[RosterPage] Failed to export CSV:", error);
      toast.error("Failed to export roster. Please try again.");
    }
  }, [selectedPlayerIds, filteredPlayers, toast]);

  const togglePlayerStatus = useCallback(
    async (player: RosterPlayerView, e: React.MouseEvent) => {
      e.stopPropagation();
      const newStatus = !player.is_active;
      const previousPlayers = [...players];
      setPlayers(
        players.map((p) =>
          p.id === player.id ? { ...p, is_active: newStatus } : p
        )
      );
      try {
        await rosterService.updatePlayer(player.id, { is_active: newStatus });
        info(
          `[RosterPage] Toggled status for ${player.first_name} ${player.last_name}`
        );
        toast.success(
          `${player.first_name} ${player.last_name} marked as ${newStatus ? "active" : "inactive"}`
        );
      } catch (error) {
        setPlayers(previousPlayers);
        logError("[RosterPage] Failed to toggle player status:", error);
        toast.error("Failed to update player status. Please try again.");
      }
    },
    [players, setPlayers, toast]
  );

  return {
    bulkSaving,
    handleBulkStatusChange,
    handleBulkEdit,
    handleImportPlayers,
    handleExportCSV,
    togglePlayerStatus,
  };
}
