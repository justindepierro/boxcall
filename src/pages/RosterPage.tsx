import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/layout/PageLayout";
import { Card, Button, Input, Modal } from "../components/ui";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { Aurora } from "../components/ui/Aurora";
import { DeleteConfirmationDialog } from "../components/common/DeleteConfirmationDialog";
import { Pagination } from "../components/Pagination";
import { MultiSelect } from "../components/ui/MultiSelect";
import type { MultiSelectOption } from "../components/ui/MultiSelect";
import { rosterService } from "../services";
import { sendPlayerInvitation } from "../services/invitationService";
import type {
  RosterPlayerView,
  PlayerRosterInsert,
  PlayerRosterUpdate,
} from "../services/rosterService";
import { RosterImportModal } from "../components/roster/RosterImportModal";
import { BulkEditModal } from "../components/roster/BulkEditModal";
import type { BulkEditUpdates } from "../components/roster/BulkEditModal";
import { info, error as logError } from "../utils/logger";
import { useToast } from "../hooks/useToast";
import { usePagination } from "../hooks/usePagination";
import { exportToCSV, generateExportFilename } from "../utils/exportUtils";
import {
  useRosterData,
  useRosterFilters,
  useRosterSelection,
  useRosterStats,
  useAutosavePlayer,
} from "./RosterPage/hooks";
import {
  useAddPlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
  useBulkUpdatePlayersMutation,
} from "../hooks/useRosterQueries";
import { PlayerCard, RosterStats } from "./RosterPage/components";

/**
 * RosterPage - Complete roster management interface
 *
 * Features:
 * - Player list with search and filtering
 * - Add/Edit/Delete players
 * - Bulk CSV import
 * - Player statistics and profiles
 * - Multiple positions per player
 * - Bulk selection and operations
 *
 * Badge Colors:
 * - Jersey Number: jade-700 (default, will use team branding colors when available)
 * - Position: blue-100/800
 * - Grade Level: purple-100/800
 */
export default function RosterPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Custom hooks for state management
  const {
    players,
    setPlayers: _setPlayers,
    loading,
    teamId,
    loadRoster,
  } = useRosterData();

  // React Query mutations for optimistic updates
  const addPlayerMutation = useAddPlayerMutation(teamId);
  const updatePlayerMutation = useUpdatePlayerMutation(teamId);
  const deletePlayerMutation = useDeletePlayerMutation(teamId);
  const bulkUpdateMutation = useBulkUpdatePlayersMutation(teamId);

  const {
    filteredPlayers,
    searchTerm,
    setSearchTerm,
    positionFilters,
    togglePositionFilter,
    gradeLevelFilters,
    toggleGradeLevelFilter,
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useRosterFilters(players);
  const {
    selectedPlayerIds,
    togglePlayerSelection,
    selectAll,
    clearSelection,
    isAllSelected: _isAllSelected,
  } = useRosterSelection();
  const { totalPlayers, activePlayerCount } = useRosterStats(players);

  // Pagination (50 players per page for optimal performance)
  const {
    paginatedData: paginatedPlayers,
    currentPage,
    totalPages,
    goToPage,
  } = usePagination(filteredPlayers, 50, {
    persistInUrl: true,
    urlParamName: "page",
  });

  // Modal and form state (not extracted - specific to this page)
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState<string>("active");
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<RosterPlayerView | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for add/edit
  const [playerForm, setPlayerForm] = useState({
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
  });

  // Form handlers
  const resetForm = () => {
    setPlayerForm({
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
      dominant_hand: "",
      roster_status: "",
    });
    setFormError(null);
  };

  // Helper function to convert form to update data
  const formToUpdateData = (): PlayerRosterUpdate => {
    // Convert height from ft-in to inches
    let heightInches: number | undefined;
    if (playerForm.heightFeet.trim() || playerForm.heightInches.trim()) {
      const feet = parseInt(playerForm.heightFeet.trim() || "0", 10) || 0;
      const inches = parseInt(playerForm.heightInches.trim() || "0", 10) || 0;
      heightInches = feet * 12 + inches;
    }

    return {
      nickname: playerForm.nickname.trim() || undefined,
      jersey_number: playerForm.jersey_number
        ? parseInt(playerForm.jersey_number)
        : undefined,
      position: playerForm.position || undefined,
      grade_level: playerForm.grade_level || undefined,
      height_inches: heightInches,
      weight_lbs: playerForm.weight_lbs
        ? parseInt(playerForm.weight_lbs)
        : undefined,
    };
  };

  // Autosave hook for edit modal
  const autosavePlayer = useAutosavePlayer({
    playerId: editingPlayer?.id || null,
    enabled: showEditModal && !!editingPlayer,
    debounceMs: 800,
    onSave: async (playerId, updates) => {
      info("[RosterPage] Autosaving player edits");
      await rosterService.updatePlayer(playerId, updates);

      // Update local state
      _setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
      );
    },
    onSaveSuccess: () => {
      info("[RosterPage] Autosave successful");
    },
    onSaveError: (error) => {
      logError("[RosterPage] Autosave failed:", error);
      toast.error("Failed to autosave changes. Please try saving manually.");
    },
  });

  // Helper to trigger autosave after form field changes
  const handleFieldChange = <K extends keyof typeof playerForm>(
    field: K,
    value: (typeof playerForm)[K]
  ) => {
    setPlayerForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Only trigger autosave for fields that affect the update data
    if (
      field === "nickname" ||
      field === "position" ||
      field === "jersey_number" ||
      field === "grade_level" ||
      field === "heightFeet" ||
      field === "heightInches" ||
      field === "weight_lbs"
    ) {
      // Trigger autosave with current form + new value
      const updatedForm = { ...playerForm, [field]: value };

      let heightInches: number | undefined;
      if (updatedForm.heightFeet.trim() || updatedForm.heightInches.trim()) {
        const feet = parseInt(updatedForm.heightFeet.trim() || "0", 10) || 0;
        const inches =
          parseInt(updatedForm.heightInches.trim() || "0", 10) || 0;
        heightInches = feet * 12 + inches;
      }

      const updateData: PlayerRosterUpdate = {
        nickname: updatedForm.nickname.trim() || undefined,
        jersey_number: updatedForm.jersey_number
          ? parseInt(updatedForm.jersey_number)
          : undefined,
        position: updatedForm.position || undefined,
        grade_level: updatedForm.grade_level || undefined,
        height_inches: heightInches,
        weight_lbs: updatedForm.weight_lbs
          ? parseInt(updatedForm.weight_lbs)
          : undefined,
      };

      autosavePlayer.triggerAutosave(updateData);
    }
  };

  const handleAddPlayer = async () => {
    if (!teamId) return;

    try {
      setSaving(true);
      setFormError(null);

      // Validate required fields
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

      // Convert height from ft-in to inches
      let heightInches: number | undefined;
      if (playerForm.heightFeet.trim() || playerForm.heightInches.trim()) {
        const feet = parseInt(playerForm.heightFeet.trim() || "0", 10) || 0;
        const inches = parseInt(playerForm.heightInches.trim() || "0", 10) || 0;

        if (feet < 0 || inches < 0 || inches > 11) {
          setFormError("Invalid height format. Inches must be 0-11.");
          return;
        }

        heightInches = feet * 12 + inches;
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
        height_inches: heightInches,
        weight_lbs: playerForm.weight_lbs
          ? parseInt(playerForm.weight_lbs)
          : undefined,
      };

      // Use React Query mutation for optimistic update
      await addPlayerMutation.mutateAsync(playerData);

      toast.success(
        `Player ${playerForm.first_name} ${playerForm.last_name} added successfully`
      );
      setShowAddModal(false);
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
  };

  const handleEditPlayer = async () => {
    if (!editingPlayer) return;

    try {
      setSaving(true);
      setFormError(null);

      // Validate height format
      if (playerForm.heightFeet.trim() || playerForm.heightInches.trim()) {
        const feet = parseInt(playerForm.heightFeet.trim() || "0", 10) || 0;
        const inches = parseInt(playerForm.heightInches.trim() || "0", 10) || 0;

        if (feet < 0 || inches < 0 || inches > 11) {
          setFormError("Invalid height format. Inches must be 0-11.");
          return;
        }
      }

      const updateData = formToUpdateData();

      // Use autosave's saveNow for immediate save (bypasses debounce)
      await autosavePlayer.saveNow(updateData);

      toast.success(
        `Player ${playerForm.first_name} ${playerForm.last_name} updated successfully`
      );
      setShowEditModal(false);
      setEditingPlayer(null);
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
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      // Use React Query mutation for optimistic update
      await deletePlayerMutation.mutateAsync(playerToDelete.id);

      toast.success("Player deleted successfully");
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
    } catch (error) {
      logError("[RosterPage] Failed to delete player:", error);
      toast.error("Failed to delete player. Please try again.");
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
    }
  };

  // Send invitation to player
  const handleSendInvitation = async (playerId?: string) => {
    if (!playerForm.email_address?.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!teamId) {
      toast.error("Team ID not found");
      return;
    }

    try {
      info("[RosterPage] Sending invitation to player");

      const playerName = `${playerForm.first_name} ${playerForm.last_name}`;
      const result = await sendPlayerInvitation({
        playerId: playerId || editingPlayer?.id || "",
        email: playerForm.email_address,
        playerName,
        teamName: "Your Team", // TODO: Get actual team name
        invitedBy: "Coach", // TODO: Get actual coach name from auth
        teamId, // Required for rate limiting and audit
      });

      if (result.success) {
        toast.success(result.message);
        // Reload roster to show updated invitation status
        await loadRoster();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      logError("[RosterPage] Failed to send invitation:", error);
      toast.error("Failed to send invitation. Please try again.");
    }
  };

  // Bulk status change handler
  const handleBulkStatusChange = async () => {
    if (selectedPlayerIds.size === 0) return;

    try {
      setSaving(true);
      const playerIds = Array.from(selectedPlayerIds);

      // Use React Query mutation for optimistic update
      await bulkUpdateMutation.mutateAsync({
        playerIds,
        updates: { roster_status: bulkStatusValue },
      });

      const statusLabel =
        statusOptions.find((s) => s.value === bulkStatusValue)?.label ||
        bulkStatusValue;
      toast.success(
        `Successfully updated ${playerIds.length} player${playerIds.length !== 1 ? "s" : ""} to ${statusLabel}`
      );

      setShowBulkStatusDialog(false);
      clearSelection();
    } catch (error) {
      logError("[RosterPage] Failed to update player statuses:", error);
      toast.error("Failed to update player statuses. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle individual player active status (with optimistic update)
  const togglePlayerStatus = async (
    player: RosterPlayerView,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent card click navigation

    const newStatus = !player.is_active;
    const previousPlayers = [...players]; // Backup for rollback

    // Optimistic update - update UI immediately
    const optimisticPlayers = players.map((p) =>
      p.id === player.id ? { ...p, is_active: newStatus } : p
    );
    _setPlayers(optimisticPlayers);

    try {
      await rosterService.updatePlayer(player.id, {
        is_active: newStatus,
      });

      info(
        `[RosterPage] Toggled status for ${player.first_name} ${player.last_name} to ${newStatus ? "active" : "inactive"}`
      );
      toast.success(
        `${player.first_name} ${player.last_name} marked as ${newStatus ? "active" : "inactive"}`
      );

      // Optimistic update already handled - no need to reload
    } catch (error) {
      // Rollback on error
      _setPlayers(previousPlayers);
      logError("[RosterPage] Failed to toggle player status:", error);
      toast.error("Failed to update player status. Please try again.");
    }
  };

  const handleBulkEdit = async (updates: BulkEditUpdates) => {
    if (selectedPlayerIds.size === 0) return;

    try {
      const playerIds = Array.from(selectedPlayerIds);

      // Use React Query mutation for optimistic update
      await bulkUpdateMutation.mutateAsync({
        playerIds,
        updates,
      });

      // Build a description of what was updated
      const updatedFields: string[] = [];
      if (updates.position) updatedFields.push("position");
      if (updates.grade_level) updatedFields.push("grade level");
      if (updates.height_inches) updatedFields.push("height");
      if (updates.weight_lbs) updatedFields.push("weight");

      toast.success(
        `Successfully updated ${updatedFields.join(", ")} for ${playerIds.length} player${playerIds.length !== 1 ? "s" : ""}`
      );

      setShowBulkEditModal(false);
      clearSelection();
    } catch (error) {
      logError("[RosterPage] Failed to bulk edit players:", error);
      toast.error("Failed to update players. Please try again.");
    }
  };

  // Export handler
  const handleExportCSV = () => {
    try {
      // Export selected players if any are selected, otherwise export filtered players
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

      const count = playersToExport.length;
      toast.success(
        `Successfully exported ${count} player${count !== 1 ? "s" : ""} to CSV`
      );

      info(`[RosterPage] Exported ${count} players to CSV: ${filename}.csv`);
    } catch (error) {
      logError("[RosterPage] Failed to export CSV:", error);
      toast.error("Failed to export roster. Please try again.");
    }
  };

  // CSV import handler
  const handleImportPlayers = async (csvPlayers: any[]) => {
    if (!teamId) return;

    try {
      setSaving(true);

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
          weight_lbs: csvPlayer.weight ? parseInt(csvPlayer.weight) : undefined,
        };

        await rosterService.createPlayer(playerData);
      }

      info(`[RosterPage] ${csvPlayers.length} players imported successfully`);
      toast.success(
        `Successfully imported ${csvPlayers.length} player${csvPlayers.length !== 1 ? "s" : ""}`
      );
      setShowImportModal(false);
      loadRoster();
    } catch (error) {
      logError("[RosterPage] Failed to import players:", error);
      toast.error(
        "Failed to import players. Please check the file and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (player: RosterPlayerView) => {
    setEditingPlayer(player);
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
    setShowEditModal(true);
  };

  // Position options
  const positionOptions = [
    "QB",
    "RB",
    "FB",
    "WR",
    "TE",
    "OL",
    "C",
    "G",
    "T",
    "DT",
    "DE",
    "LB",
    "CB",
    "S",
    "K",
    "P",
  ];

  // Format position options for MultiSelect
  const positionSelectOptions: MultiSelectOption[] = positionOptions.map(
    (pos) => ({
      value: pos,
      label: pos,
    })
  );

  // Grade level options for MultiSelect
  const gradeLevelSelectOptions: MultiSelectOption[] = [
    { value: "9", label: "9th Grade (Freshman)" },
    { value: "10", label: "10th Grade (Sophomore)" },
    { value: "11", label: "11th Grade (Junior)" },
    { value: "12", label: "12th Grade (Senior)" },
  ];

  // Status options
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "injured", label: "Injured" },
    { value: "suspended", label: "Suspended" },
    { value: "academic_probation", label: "Academic Probation" },
    { value: "inactive", label: "Inactive" },
    { value: "inactive_cut", label: "Inactive (Cut)" },
    { value: "inactive_quit", label: "Inactive (Quit)" },
    { value: "transferred", label: "Transferred" },
    { value: "alumni", label: "Alumni" },
  ];

  if (loading) {
    return (
      <Aurora variant="shell" fullHeight>
        <PageLayout title="Roster" subtitle="Loading team roster...">
          <div className="space-y-spacing-lg">
            {/* Loading skeleton for stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-spacing-md">
              {[...Array(4)].map((_, i) => (
                <Card key={`stat-${i}`} className="animate-pulse">
                  <div className="h-24 bg-surface-muted rounded-lg"></div>
                </Card>
              ))}
            </div>

            {/* Loading skeleton for player cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
              {[...Array(9)].map((_, i) => (
                <Card
                  key={`player-${i}`}
                  className="animate-pulse p-spacing-md"
                >
                  <div className="space-y-spacing-sm">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-spacing-sm">
                        <div className="w-4 h-4 bg-surface-muted rounded"></div>
                        <div className="h-6 w-32 bg-surface-muted rounded"></div>
                      </div>
                      <div className="w-8 h-8 bg-surface-muted rounded"></div>
                    </div>

                    {/* Badges skeleton */}
                    <div className="flex flex-wrap gap-spacing-xs">
                      <div className="h-6 w-12 bg-surface-muted rounded-full"></div>
                      <div className="h-6 w-16 bg-surface-muted rounded-full"></div>
                      <div className="h-6 w-20 bg-surface-muted rounded-full"></div>
                    </div>

                    {/* Stats skeleton */}
                    <div className="flex gap-spacing-md pt-spacing-sm">
                      <div className="h-4 w-24 bg-surface-muted rounded"></div>
                      <div className="h-4 w-24 bg-surface-muted rounded"></div>
                    </div>

                    {/* Footer skeleton */}
                    <div className="flex items-center justify-between pt-spacing-sm">
                      <div className="h-8 w-20 bg-surface-muted rounded"></div>
                      <div className="h-8 w-16 bg-surface-muted rounded"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </PageLayout>
      </Aurora>
    );
  }

  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="Team Roster"
        subtitle={`${players.length} players • Manage your team's roster and player information`}
      >
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              onClick: () => navigate("/dashboard"),
            },
            { id: "roster", label: "Roster", current: true },
          ]}
          className="mb-4"
        />

        <div className="space-y-spacing-lg relative z-10">
          {/* Selection Bar */}
          {selectedPlayerIds.size > 0 && (
            <div className="flex items-center justify-between gap-spacing-md bg-primary-50 p-spacing-sm rounded-lg border border-primary-200">
              <div className="flex items-center gap-spacing-md">
                <Typography
                  variant="body-sm"
                  className="text-primary-700 font-medium"
                >
                  {selectedPlayerIds.size} player
                  {selectedPlayerIds.size !== 1 ? "s" : ""} selected
                </Typography>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBulkStatusValue("active");
                    setShowBulkStatusDialog(true);
                  }}
                  className="border-primary-300 text-primary-700 hover:bg-primary-100"
                >
                  <Icon name="edit" className="w-4 h-4 mr-spacing-xs" />
                  Change Status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBulkEditModal(true)}
                  className="border-primary-300 text-primary-700 hover:bg-primary-100"
                >
                  <Icon name="edit" className="w-4 h-4 mr-spacing-xs" />
                  Edit Selected
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-spacing-md justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-spacing-md">
              <Button
                onClick={() => {
                  console.log("[RosterPage] Add Player button clicked");
                  setShowAddModal(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Icon name="plus" className="w-4 h-4 mr-spacing-xs" />
                Add Player
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("[RosterPage] Import CSV button clicked");
                  setShowImportModal(true);
                }}
              >
                <Icon name="upload" className="w-4 h-4 mr-spacing-xs" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportCSV()}
                disabled={filteredPlayers.length === 0}
              >
                <Icon name="download" className="w-4 h-4 mr-spacing-xs" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={
                  selectedPlayerIds.size === filteredPlayers.length
                    ? clearSelection
                    : () => selectAll(filteredPlayers)
                }
                disabled={filteredPlayers.length === 0}
              >
                <Icon name="check" className="w-4 h-4 mr-spacing-xs" />
                {selectedPlayerIds.size === filteredPlayers.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-spacing-sm items-center w-full">
              <Input
                placeholder="Search players by name, nickname, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />

              {/* Position Multi-Select */}
              <MultiSelect
                options={positionSelectOptions}
                selected={positionFilters}
                onChange={(values) => {
                  // Update filters by comparing old and new arrays
                  const added = values.filter(
                    (v) => !positionFilters.includes(v)
                  );
                  const removed = positionFilters.filter(
                    (v) => !values.includes(v)
                  );

                  if (added.length > 0) {
                    added.forEach((pos) => togglePositionFilter(pos));
                  }
                  if (removed.length > 0) {
                    removed.forEach((pos) => togglePositionFilter(pos));
                  }
                }}
                placeholder="All Positions"
                selectedLabel={(count) =>
                  `${count} Position${count !== 1 ? "s" : ""}`
                }
                ariaLabel="Filter by position"
              />

              {/* Grade Level Multi-Select */}
              <MultiSelect
                options={gradeLevelSelectOptions}
                selected={gradeLevelFilters}
                onChange={(values) => {
                  // Update filters by comparing old and new arrays
                  const added = values.filter(
                    (v) => !gradeLevelFilters.includes(v)
                  );
                  const removed = gradeLevelFilters.filter(
                    (v) => !values.includes(v)
                  );

                  if (added.length > 0) {
                    added.forEach((grade) => toggleGradeLevelFilter(grade));
                  }
                  if (removed.length > 0) {
                    removed.forEach((grade) => toggleGradeLevelFilter(grade));
                  }
                }}
                placeholder="All Grades"
                selectedLabel={(count) =>
                  `${count} Grade${count !== 1 ? "s" : ""}`
                }
                ariaLabel="Filter by grade level"
              />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm w-full sm:w-auto sm:min-w-40 cursor-pointer hover:border-primary transition-colors"
                style={{ height: "42px" }}
              >
                <option value="" className="text-text-secondary">
                  All Status
                </option>
                {statusOptions.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                    className="py-1"
                  >
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Clear All Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="whitespace-nowrap transition-all hover:scale-105 text-warning-600 hover:text-warning-600 hover:bg-warning-bg"
                >
                  <Icon name="close" className="w-4 h-4 mr-spacing-xs" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filter Chips */}
            {(positionFilters.length > 0 || gradeLevelFilters.length > 0) && (
              <div className="flex flex-wrap gap-spacing-xs animate-fade-in">
                {/* Position Filter Chips - Blue theme */}
                {positionFilters.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => togglePositionFilter(pos)}
                    className="inline-flex items-center gap-spacing-xs px-spacing-sm py-spacing-xs bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-all shadow-sm border border-blue-300"
                  >
                    <span className="font-medium">{pos}</span>
                    <Icon name="close" className="w-3 h-3" />
                  </button>
                ))}
                {/* Grade Level Filter Chips - Purple theme */}
                {gradeLevelFilters.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => toggleGradeLevelFilter(grade)}
                    className="inline-flex items-center gap-spacing-xs px-spacing-sm py-spacing-xs bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-all shadow-sm border border-purple-300"
                  >
                    <span className="font-medium">Grade {grade}</span>
                    <Icon name="close" className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Roster Stats */}
          <RosterStats
            totalPlayers={totalPlayers}
            activePlayerCount={activePlayerCount}
            filteredCount={filteredPlayers.length}
            selectedCount={selectedPlayerIds.size}
          />

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-spacing-md">
                  <div className="flex items-start gap-spacing-sm mb-spacing-sm">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPlayers.length === 0 && players.length === 0 && (
            <EmptyState
              icon="users"
              title="No players yet"
              description="Get started by adding your first player to the roster"
              primaryAction={{
                label: "Add First Player",
                onClick: () => setShowAddModal(true),
                icon: "plus",
              }}
            />
          )}

          {/* No Results State */}
          {!loading && filteredPlayers.length === 0 && players.length > 0 && (
            <EmptyState
              icon="search"
              title="No players found"
              description="Try adjusting your search or filters"
              primaryAction={{
                label: "Clear Filters",
                onClick: clearAllFilters,
              }}
            />
          )}

          {/* Player Grid */}
          {!loading && filteredPlayers.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md animate-fade-in">
                {paginatedPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayerIds.has(player.id)}
                    onToggleSelection={togglePlayerSelection}
                    onEdit={openEditModal}
                    onToggleStatus={togglePlayerStatus}
                    onNavigate={(id) => navigate(`/roster/${id}`)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                itemsPerPage={50}
                totalItems={filteredPlayers.length}
                className="mt-spacing-lg"
              />
            </>
          )}

          {/* Add Player Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              resetForm();
            }}
            title="Add New Player"
          >
            <div className="space-y-spacing-md">
              {formError && (
                <div className="p-spacing-sm bg-error-100 dark:bg-error-900/30 border border-error-500 rounded-lg">
                  <Typography
                    variant="body-sm"
                    className="text-error-700 dark:text-error-300"
                  >
                    {formError}
                  </Typography>
                </div>
              )}

              <div className="grid grid-cols-2 gap-spacing-md">
                <Input
                  label="First Name"
                  value={playerForm.first_name}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  required
                />
                <Input
                  label="Last Name"
                  value={playerForm.last_name}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <Input
                label="Nickname"
                value={playerForm.nickname}
                onChange={(e) =>
                  setPlayerForm((prev) => ({
                    ...prev,
                    nickname: e.target.value,
                  }))
                }
                placeholder="e.g., Johnny"
              />

              <div className="grid grid-cols-2 gap-spacing-md">
                <div>
                  <label className="block text-sm font-medium mb-spacing-xs">
                    Position(s) *
                  </label>
                  {/* Selected Positions Display */}
                  {playerForm.position && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {playerForm.position
                        .split(",")
                        .filter(Boolean)
                        .map((pos) => (
                          <span
                            key={pos}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {pos}
                            <button
                              type="button"
                              onClick={() => {
                                const positions = playerForm.position
                                  .split(",")
                                  .filter((p) => p !== pos);
                                setPlayerForm((prev) => ({
                                  ...prev,
                                  position: positions.join(","),
                                }));
                              }}
                              className="ml-1 hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                  {/* Position Selector */}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentPositions = playerForm.position
                          ? playerForm.position.split(",").filter(Boolean)
                          : [];
                        if (!currentPositions.includes(e.target.value)) {
                          setPlayerForm((prev) => ({
                            ...prev,
                            position: [
                              ...currentPositions,
                              e.target.value,
                            ].join(","),
                          }));
                        }
                      }
                    }}
                    className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">+ Add Position</option>
                    {positionOptions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-1">
                    Select multiple positions if player plays more than one
                  </p>
                </div>
                <Input
                  label="Jersey Number"
                  type="number"
                  value={playerForm.jersey_number}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      jersey_number: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Grade Level
                  </label>
                  <select
                    value={playerForm.grade_level}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        grade_level: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Grade</option>
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Height (feet)"
                    type="number"
                    value={playerForm.heightFeet}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        heightFeet: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Height (inches)"
                    type="number"
                    value={playerForm.heightInches}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        heightInches: e.target.value,
                      }))
                    }
                  />
                </div>
                <Input
                  label="Weight (lbs)"
                  type="number"
                  value={playerForm.weight_lbs}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      weight_lbs: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={playerForm.email_address}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      email_address: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Phone"
                  value={playerForm.phone_number}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                />
              </div>

              <Input
                label="Parent Contact"
                value={playerForm.parent_contact}
                onChange={(e) =>
                  setPlayerForm((prev) => ({
                    ...prev,
                    parent_contact: e.target.value,
                  }))
                }
              />

              {/* Invite to Team Button - Show when email is entered */}
              {playerForm.email_address?.trim() && (
                <Button
                  variant="outline"
                  onClick={() => handleSendInvitation()}
                  className="w-full border-jade-600 text-jade-700 hover:bg-jade-50 dark:border-jade-500 dark:text-jade-400 dark:hover:bg-jade-950"
                >
                  <Icon name="mail" className="w-4 h-4 mr-spacing-xs" />
                  Invite {playerForm.first_name || "Player"} to Team
                </Button>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPlayer}
                  disabled={
                    saving ||
                    !playerForm.first_name ||
                    !playerForm.last_name ||
                    !playerForm.position
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  {saving ? "Adding..." : "Add Player"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Edit Player Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingPlayer(null);
              resetForm();
            }}
            title="Edit Player"
          >
            <div className="space-y-4">
              {formError && (
                <div className="p-spacing-sm bg-error-100 dark:bg-error-900/30 border border-error-500 rounded-lg">
                  <Typography
                    variant="body-sm"
                    className="text-error-700 dark:text-error-300"
                  >
                    {formError}
                  </Typography>
                </div>
              )}

              {/* Autosave Status Indicator */}
              {showEditModal && editingPlayer && (
                <div className="flex items-center justify-between px-spacing-sm py-spacing-xs rounded-lg bg-surface-secondary/50">
                  <Typography variant="body-sm" className="text-text-secondary">
                    {autosavePlayer.status === "saving" &&
                      "💾 Saving changes..."}
                    {autosavePlayer.status === "saved" && "✓ All changes saved"}
                    {autosavePlayer.status === "error" &&
                      "⚠️ Autosave failed - please save manually"}
                    {autosavePlayer.status === "idle" &&
                      autosavePlayer.hasUnsavedChanges &&
                      "⏳ Saving soon..."}
                    {autosavePlayer.status === "idle" &&
                      !autosavePlayer.hasUnsavedChanges &&
                      autosavePlayer.lastSaved &&
                      "✓ Up to date"}
                    {autosavePlayer.status === "idle" &&
                      !autosavePlayer.hasUnsavedChanges &&
                      !autosavePlayer.lastSaved &&
                      "Ready to edit"}
                  </Typography>
                  {autosavePlayer.lastSaved && (
                    <Typography
                      variant="body-xs"
                      className="text-text-tertiary"
                    >
                      {new Date(autosavePlayer.lastSaved).toLocaleTimeString()}
                    </Typography>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={playerForm.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  required
                />
                <Input
                  label="Last Name"
                  value={playerForm.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  required
                />
              </div>

              <Input
                label="Nickname"
                value={playerForm.nickname}
                onChange={(e) => handleFieldChange("nickname", e.target.value)}
                placeholder="e.g., Johnny"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position(s) *
                  </label>
                  {/* Selected Positions Display */}
                  {playerForm.position && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {playerForm.position
                        .split(",")
                        .filter(Boolean)
                        .map((pos) => (
                          <span
                            key={pos}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {pos}
                            <button
                              type="button"
                              onClick={() => {
                                const positions = playerForm.position
                                  .split(",")
                                  .filter((p) => p !== pos);
                                handleFieldChange(
                                  "position",
                                  positions.join(",")
                                );
                              }}
                              className="ml-1 hover:text-blue-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                  {/* Position Selector */}
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const currentPositions = playerForm.position
                          ? playerForm.position.split(",").filter(Boolean)
                          : [];
                        if (!currentPositions.includes(e.target.value)) {
                          handleFieldChange(
                            "position",
                            [...currentPositions, e.target.value].join(",")
                          );
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">+ Add Position</option>
                    {positionOptions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary mt-1">
                    Select multiple positions if player plays more than one
                  </p>
                </div>
                <Input
                  label="Jersey Number"
                  type="number"
                  value={playerForm.jersey_number}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      jersey_number: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Grade Level
                  </label>
                  <select
                    value={playerForm.grade_level}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        grade_level: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Grade</option>
                    <option value="freshman">Freshman</option>
                    <option value="sophomore">Sophomore</option>
                    <option value="junior">Junior</option>
                    <option value="senior">Senior</option>
                    <option value="graduate">Graduate</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Height (feet)"
                    type="number"
                    value={playerForm.heightFeet}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        heightFeet: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Height (inches)"
                    type="number"
                    value={playerForm.heightInches}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        heightInches: e.target.value,
                      }))
                    }
                  />
                </div>
                <Input
                  label="Weight (lbs)"
                  type="number"
                  value={playerForm.weight_lbs}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      weight_lbs: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={playerForm.email_address}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      email_address: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Phone"
                  value={playerForm.phone_number}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                />
              </div>

              <Input
                label="Parent Contact"
                value={playerForm.parent_contact}
                onChange={(e) =>
                  setPlayerForm((prev) => ({
                    ...prev,
                    parent_contact: e.target.value,
                  }))
                }
              />

              {/* Invite to Team Button - Show when email is entered and not already invited */}
              {playerForm.email_address?.trim() && (
                <Button
                  variant="outline"
                  onClick={() => handleSendInvitation()}
                  className="w-full border-jade-600 text-jade-700 hover:bg-jade-50 dark:border-jade-500 dark:text-jade-400 dark:hover:bg-jade-950"
                >
                  <Icon name="mail" className="w-4 h-4 mr-spacing-xs" />
                  {editingPlayer?.invitation_status === "pending"
                    ? "Resend Invitation"
                    : `Invite ${playerForm.first_name || "Player"} to Team`}
                </Button>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPlayer(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditPlayer}
                  disabled={
                    saving || !playerForm.first_name || !playerForm.last_name
                  }
                  className="bg-primary hover:bg-primary/90"
                  title="Save changes immediately"
                >
                  {saving ? "Saving..." : "Save Now"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Import Modal */}
          <RosterImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={handleImportPlayers}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setPlayerToDelete(null);
            }}
            onConfirm={handleDeletePlayer}
            title="Delete Player"
            entityName={playerToDelete?.name || ""}
          />

          {/* Bulk Status Change Dialog */}
          <Modal
            isOpen={showBulkStatusDialog}
            onClose={() => setShowBulkStatusDialog(false)}
            title="Change Player Status"
          >
            <div className="space-y-spacing-md">
              <Typography variant="body-sm" className="text-text-secondary">
                You are about to change the status for{" "}
                <strong>{selectedPlayerIds.size}</strong> player
                {selectedPlayerIds.size !== 1 ? "s" : ""}. This will affect
                their access to team features.
              </Typography>

              <div className="bg-warning-bg border border-warning rounded-lg p-spacing-sm">
                <div className="flex gap-spacing-xs">
                  <Icon
                    name="info"
                    className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-warning-foreground">
                    <strong>Note:</strong> Players marked as Inactive (Cut),
                    Inactive (Quit), or Alumni will lose access to the team
                    feed, calendar, and playbook.
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="bulk-status"
                  className="block text-sm font-medium text-text-primary mb-2"
                >
                  New Status
                </label>
                <select
                  id="bulk-status"
                  value={bulkStatusValue}
                  onChange={(e) => setBulkStatusValue(e.target.value)}
                  className="w-full px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-spacing-sm pt-spacing-md">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkStatusDialog(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkStatusChange}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saving ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Bulk Edit Modal */}
          <BulkEditModal
            isOpen={showBulkEditModal}
            onClose={() => setShowBulkEditModal(false)}
            selectedCount={selectedPlayerIds.size}
            onSave={handleBulkEdit}
            hasInactiveOrAlumni={Array.from(selectedPlayerIds).some((id) => {
              const player = players.find((p) => p.id === id);
              return (
                player &&
                (player.roster_status === "inactive_cut" ||
                  player.roster_status === "inactive_quit" ||
                  player.roster_status === "alumni")
              );
            })}
          />
        </div>
      </PageLayout>
    </Aurora>
  );
}
