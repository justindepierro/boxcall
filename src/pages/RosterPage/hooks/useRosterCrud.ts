import { useState, useCallback } from "react";
import { rosterService } from "../../../services";
import type {
  RosterPlayerView,
  PlayerRosterInsert,
  PlayerRosterUpdate,
} from "../../../services/rosterService";
import { info, error as logError } from "../../../utils/logger";
import { useToast } from "../../../hooks/useToast";
import { useAutosavePlayer } from "./useAutosavePlayer";
import type { UseRosterModalsReturn } from "./useRosterModals";
import {
  useAddPlayerMutation,
  useDeletePlayerMutation,
} from "../../../hooks/useRosterQueries";

export interface PlayerFormData {
  first_name: string;
  last_name: string;
  nickname: string;
  position: string;
  jersey_number: string;
  grade_level: string;
  heightFeet: string;
  heightInches: string;
  weight_lbs: string;
  email_address: string;
  phone_number: string;
  parent_contact: string;
  graduation_year: string;
  dominant_hand: string;
  roster_status: string;
}

export const INITIAL_FORM_DATA: PlayerFormData = {
  first_name: "",
  last_name: "",
  nickname: "",
  position: "",
  jersey_number: "",
  grade_level: "",
  heightFeet: "",
  heightInches: "",
  weight_lbs: "",
  email_address: "",
  phone_number: "",
  parent_contact: "",
  graduation_year: "",
  dominant_hand: "right",
  roster_status: "active",
};

interface UseRosterCrudOptions {
  teamId: string | null;
  modals: UseRosterModalsReturn;
  setPlayers: React.Dispatch<React.SetStateAction<RosterPlayerView[]>>;
}

// Helper to convert height from form to inches
const formHeightToInches = (
  feet: string,
  inches: string
): number | undefined => {
  if (!feet.trim() && !inches.trim()) return undefined;
  return (
    (parseInt(feet.trim() || "0", 10) || 0) * 12 +
    (parseInt(inches.trim() || "0", 10) || 0)
  );
};

// Helper to convert form to PlayerRosterUpdate
const formToUpdate = (form: PlayerFormData): PlayerRosterUpdate => ({
  first_name: form.first_name.trim() || undefined,
  last_name: form.last_name.trim() || undefined,
  nickname: form.nickname.trim() || undefined,
  jersey_number: form.jersey_number ? parseInt(form.jersey_number) : undefined,
  position: form.position || undefined,
  grade_level: form.grade_level || undefined,
  height_inches: formHeightToInches(form.heightFeet, form.heightInches),
  weight_lbs: form.weight_lbs ? parseInt(form.weight_lbs) : undefined,
  email_address: form.email_address.trim() || undefined,
  phone_number: form.phone_number.trim() || undefined,
  parent_contact: form.parent_contact.trim() || undefined,
});

export interface UseRosterCrudReturn {
  playerForm: PlayerFormData;
  setPlayerForm: React.Dispatch<React.SetStateAction<PlayerFormData>>;
  saving: boolean;
  formError: string | null;
  resetForm: () => void;
  autosavePlayer: ReturnType<typeof useAutosavePlayer>;
  handleFieldChange: <K extends keyof PlayerFormData>(
    field: K,
    value: PlayerFormData[K]
  ) => void;
  handleAddPlayer: () => Promise<void>;
  handleEditPlayer: () => Promise<void>;
  handleDeletePlayer: () => Promise<void>;
  openEditModal: (player: RosterPlayerView) => void;
}

/**
 * useRosterCrud - Core CRUD operations for player management
 */
export function useRosterCrud(
  options: UseRosterCrudOptions
): UseRosterCrudReturn {
  const { teamId, modals, setPlayers } = options;
  const toast = useToast();

  const addPlayerMutation = useAddPlayerMutation(teamId);
  const deletePlayerMutation = useDeletePlayerMutation(teamId);

  const [playerForm, setPlayerForm] =
    useState<PlayerFormData>(INITIAL_FORM_DATA);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const autosavePlayer = useAutosavePlayer({
    playerId: modals.editingPlayer?.id || null,
    enabled: modals.showEditModal && !!modals.editingPlayer,
    debounceMs: 800,
    onSave: async (playerId, updates) => {
      info("[RosterPage] Autosaving player edits");
      await rosterService.updatePlayer(playerId, updates);
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
      );
    },
    onSaveSuccess: () => info("[RosterPage] Autosave successful"),
    onSaveError: (error) => {
      logError("[RosterPage] Autosave failed:", error);
      toast.error("Failed to autosave changes. Please try saving manually.");
    },
  });

  const resetForm = useCallback(() => {
    setPlayerForm(INITIAL_FORM_DATA);
    setFormError(null);
  }, []);

  const handleFieldChange = useCallback(
    <K extends keyof PlayerFormData>(field: K, value: PlayerFormData[K]) => {
      setPlayerForm((prev) => ({ ...prev, [field]: value }));
      const autosaveFields = [
        "first_name",
        "last_name",
        "nickname",
        "position",
        "jersey_number",
        "grade_level",
        "heightFeet",
        "heightInches",
        "weight_lbs",
        "email_address",
        "phone_number",
        "parent_contact",
      ];
      if (autosaveFields.includes(field)) {
        autosavePlayer.triggerAutosave(
          formToUpdate({ ...playerForm, [field]: value })
        );
      }
    },
    [playerForm, autosavePlayer]
  );

  const handleAddPlayer = useCallback(async () => {
    if (!teamId) return;
    try {
      setSaving(true);
      setFormError(null);
      if (
        !playerForm.first_name.trim() ||
        !playerForm.last_name.trim() ||
        !playerForm.position.trim()
      ) {
        setFormError(
          "First name, last name, and at least one position are required"
        );
        return;
      }
      const inches = parseInt(playerForm.heightInches.trim() || "0", 10) || 0;
      if (
        (playerForm.heightFeet.trim() || playerForm.heightInches.trim()) &&
        (inches < 0 || inches > 11)
      ) {
        setFormError("Invalid height format. Inches must be 0-11.");
        return;
      }
      const playerData: PlayerRosterInsert = {
        team_id: teamId,
        first_name: playerForm.first_name,
        last_name: playerForm.last_name,
        nickname: playerForm.nickname.trim() || undefined,
        position: playerForm.position,
        jersey_number: playerForm.jersey_number
          ? parseInt(playerForm.jersey_number)
          : undefined,
        grade_level: playerForm.grade_level || undefined,
        height_inches: formHeightToInches(
          playerForm.heightFeet,
          playerForm.heightInches
        ),
        weight_lbs: playerForm.weight_lbs
          ? parseInt(playerForm.weight_lbs)
          : undefined,
      };
      await addPlayerMutation.mutateAsync(playerData);
      toast.success(
        `Player ${playerForm.first_name} ${playerForm.last_name} added successfully`
      );
      modals.closeAddModal();
      resetForm();
    } catch (error) {
      logError("[RosterPage] Failed to add player:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add player. Please try again.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [teamId, playerForm, addPlayerMutation, toast, modals, resetForm]);

  const handleEditPlayer = useCallback(async () => {
    if (!modals.editingPlayer) return;
    try {
      setSaving(true);
      setFormError(null);
      const inches = parseInt(playerForm.heightInches.trim() || "0", 10) || 0;
      if (
        (playerForm.heightFeet.trim() || playerForm.heightInches.trim()) &&
        (inches < 0 || inches > 11)
      ) {
        setFormError("Invalid height format. Inches must be 0-11.");
        return;
      }
      await autosavePlayer.saveNow(formToUpdate(playerForm));
      toast.success(
        `Player ${playerForm.first_name} ${playerForm.last_name} updated successfully`
      );
      modals.closeEditModal();
      resetForm();
    } catch (error) {
      logError("[RosterPage] Failed to update player:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update player. Please try again.";
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [
    modals.editingPlayer,
    playerForm,
    autosavePlayer,
    toast,
    modals,
    resetForm,
  ]);

  const handleDeletePlayer = useCallback(async () => {
    if (!modals.playerToDelete) return;
    try {
      await deletePlayerMutation.mutateAsync(modals.playerToDelete.id);
      toast.success("Player deleted successfully");
      modals.closeDeleteDialog();
    } catch (error) {
      logError("[RosterPage] Failed to delete player:", error);
      toast.error("Failed to delete player. Please try again.");
      modals.closeDeleteDialog();
    }
  }, [modals, deletePlayerMutation, toast]);

  const openEditModal = useCallback(
    (player: RosterPlayerView) => {
      setPlayerForm({
        first_name: player.first_name || "",
        last_name: player.last_name || "",
        nickname: player.nickname || "",
        position: player.position || "",
        jersey_number: player.jersey_number?.toString() || "",
        grade_level: player.grade_level || "",
        heightFeet: player.height_inches
          ? Math.floor(player.height_inches / 12).toString()
          : "",
        heightInches: player.height_inches
          ? (player.height_inches % 12).toString()
          : "",
        weight_lbs: player.weight_lbs?.toString() || "",
        email_address: "",
        phone_number: "",
        parent_contact: "",
        graduation_year: "",
        dominant_hand: "",
        roster_status: "",
      });
      modals.openEditModal(player);
    },
    [modals]
  );

  return {
    playerForm,
    setPlayerForm,
    saving,
    formError,
    resetForm,
    autosavePlayer,
    handleFieldChange,
    handleAddPlayer,
    handleEditPlayer,
    handleDeletePlayer,
    openEditModal,
  };
}
