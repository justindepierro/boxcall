/**
 * useRosterModals - Modal State Management Hook
 *
 * Centralizes all modal visibility state and handlers for the RosterPage.
 * Reduces main component complexity by extracting modal logic.
 */

import { useState, useCallback } from "react";
import type { RosterPlayerView } from "../../../services/rosterService";
import type { PlayerFormData } from "../components/PlayerFormModal";

export interface UseRosterModalsReturn {
  // Add Modal
  showAddModal: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;

  // Edit Modal
  showEditModal: boolean;
  editingPlayer: RosterPlayerView | null;
  openEditModal: (player: RosterPlayerView) => void;
  closeEditModal: () => void;

  // Delete Dialog
  showDeleteDialog: boolean;
  playerToDelete: { id: string; name: string } | null;
  openDeleteDialog: (player: RosterPlayerView) => void;
  closeDeleteDialog: () => void;

  // Import Modal
  showImportModal: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;

  // Bulk Status Dialog
  showBulkStatusDialog: boolean;
  bulkStatusValue: string;
  setBulkStatusValue: (value: string) => void;
  openBulkStatusDialog: () => void;
  closeBulkStatusDialog: () => void;

  // Bulk Edit Modal
  showBulkEditModal: boolean;
  openBulkEditModal: () => void;
  closeBulkEditModal: () => void;

  // Invitation Modal
  showInvitationModal: boolean;
  playerToInvite: RosterPlayerView | null;
  openInvitationModal: (player: RosterPlayerView) => void;
  closeInvitationModal: () => void;

  // Form State
  playerForm: PlayerFormData;
  setPlayerForm: React.Dispatch<React.SetStateAction<PlayerFormData>>;
  resetForm: () => void;
  formError: string | null;
  setFormError: (error: string | null) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;

  // Populate form for editing
  populateFormForEdit: (player: RosterPlayerView) => void;
}

const INITIAL_FORM_STATE: PlayerFormData = {
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

export function useRosterModals(): UseRosterModalsReturn {
  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<RosterPlayerView | null>(
    null
  );

  // Delete Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Bulk Status Dialog
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState<string>("active");

  // Bulk Edit Modal
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  // Invitation Modal
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [playerToInvite, setPlayerToInvite] = useState<RosterPlayerView | null>(
    null
  );

  // Form State
  const [playerForm, setPlayerForm] =
    useState<PlayerFormData>(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setPlayerForm(INITIAL_FORM_STATE);
    setFormError(null);
  }, []);

  // Populate form with player data for editing
  const populateFormForEdit = useCallback((player: RosterPlayerView) => {
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
  }, []);

  // Modal handlers
  const openAddModal = useCallback(() => {
    resetForm();
    setShowAddModal(true);
  }, [resetForm]);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    resetForm();
  }, [resetForm]);

  const openEditModal = useCallback(
    (player: RosterPlayerView) => {
      setEditingPlayer(player);
      populateFormForEdit(player);
      setShowEditModal(true);
    },
    [populateFormForEdit]
  );

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingPlayer(null);
    resetForm();
  }, [resetForm]);

  const openDeleteDialog = useCallback((player: RosterPlayerView) => {
    setPlayerToDelete({
      id: player.id,
      name: `${player.first_name} ${player.last_name}`,
    });
    setShowDeleteDialog(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setPlayerToDelete(null);
  }, []);

  const openImportModal = useCallback(() => setShowImportModal(true), []);
  const closeImportModal = useCallback(() => setShowImportModal(false), []);

  const openBulkStatusDialog = useCallback(() => {
    setBulkStatusValue("active");
    setShowBulkStatusDialog(true);
  }, []);

  const closeBulkStatusDialog = useCallback(
    () => setShowBulkStatusDialog(false),
    []
  );

  const openBulkEditModal = useCallback(() => setShowBulkEditModal(true), []);
  const closeBulkEditModal = useCallback(() => setShowBulkEditModal(false), []);

  const openInvitationModal = useCallback((player: RosterPlayerView) => {
    if (!player.first_name || !player.last_name) {
      return; // Validation should happen in caller
    }
    setPlayerToInvite(player);
    setShowInvitationModal(true);
  }, []);

  const closeInvitationModal = useCallback(() => {
    setShowInvitationModal(false);
    setPlayerToInvite(null);
  }, []);

  return {
    // Add Modal
    showAddModal,
    openAddModal,
    closeAddModal,

    // Edit Modal
    showEditModal,
    editingPlayer,
    openEditModal,
    closeEditModal,

    // Delete Dialog
    showDeleteDialog,
    playerToDelete,
    openDeleteDialog,
    closeDeleteDialog,

    // Import Modal
    showImportModal,
    openImportModal,
    closeImportModal,

    // Bulk Status Dialog
    showBulkStatusDialog,
    bulkStatusValue,
    setBulkStatusValue,
    openBulkStatusDialog,
    closeBulkStatusDialog,

    // Bulk Edit Modal
    showBulkEditModal,
    openBulkEditModal,
    closeBulkEditModal,

    // Invitation Modal
    showInvitationModal,
    playerToInvite,
    openInvitationModal,
    closeInvitationModal,

    // Form State
    playerForm,
    setPlayerForm,
    resetForm,
    formError,
    setFormError,
    saving,
    setSaving,

    // Helpers
    populateFormForEdit,
  };
}
