import { useState, useEffect, useCallback, useMemo } from "react";
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
import { rosterService } from "../services";
import type {
  RosterPlayerView,
  PlayerRosterInsert,
  PlayerRosterUpdate,
} from "../services/rosterService";
import { getActiveTeamId } from "../utils/activeTeam";
import { RosterImportModal } from "../components/roster/RosterImportModal";
import { info, error as logError } from "../utils/logger";
import { useToast } from "../hooks/useToast";

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

  // State
  const [players, setPlayers] = useState<RosterPlayerView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
    new Set()
  );
  const [editingPlayer, setEditingPlayer] = useState<RosterPlayerView | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state for add/edit
  const [playerForm, setPlayerForm] = useState({
    first_name: "",
    last_name: "",
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

  const teamId = getActiveTeamId();

  // Load roster data
  const loadRoster = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const rosterData = await rosterService.listByTeam(teamId);
      setPlayers(rosterData);
    } catch (error) {
      console.error("Failed to load roster:", error);
      toast.error("Failed to load roster. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  // Filtered players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        !searchTerm ||
        `${player.first_name} ${player.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        player.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.jersey_number?.toString().includes(searchTerm);

      // Support filtering by multiple positions (comma-separated)
      const matchesPosition =
        !positionFilter ||
        (player.position &&
          player.position
            .split(",")
            .map((p) => p.trim())
            .includes(positionFilter));

      const matchesStatus =
        !statusFilter || player.is_active === (statusFilter === "active");

      return matchesSearch && matchesPosition && matchesStatus;
    });
  }, [players, searchTerm, positionFilter, statusFilter]);

  // Form handlers
  const resetForm = () => {
    setPlayerForm({
      first_name: "",
      last_name: "",
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

      await rosterService.createPlayer(playerData);
      info("[RosterPage] Player added successfully");
      toast.success(
        `Player ${playerForm.first_name} ${playerForm.last_name} added successfully`
      );
      setShowAddModal(false);
      resetForm();
      loadRoster();
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

      const updateData: PlayerRosterUpdate = {
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

      await rosterService.updatePlayer(editingPlayer.id, updateData);
      info("[RosterPage] Player updated successfully");
      toast.success(
        `Player ${playerForm.first_name} ${playerForm.last_name} updated successfully`
      );
      setShowEditModal(false);
      setEditingPlayer(null);
      resetForm();
      loadRoster();
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

  const confirmDeletePlayer = (playerId: string, playerName: string) => {
    setPlayerToDelete({ id: playerId, name: playerName });
    setShowDeleteDialog(true);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      await rosterService.deletePlayer(playerToDelete.id);
      info("[RosterPage] Player deleted successfully");
      toast.success("Player deleted successfully");
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
      loadRoster();
    } catch (error) {
      logError("[RosterPage] Failed to delete player:", error);
      toast.error("Failed to delete player. Please try again.");
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
    }
  };

  // Selection handlers
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedPlayerIds(new Set(filteredPlayers.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedPlayerIds(new Set());
  };

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

  // Status options
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "injured", label: "Injured" },
    { value: "suspended", label: "Suspended" },
    { value: "academic_probation", label: "Academic Probation" },
    { value: "inactive", label: "Inactive" },
    { value: "transferred", label: "Transferred" },
  ];

  if (loading) {
    return (
      <Aurora variant="shell" fullHeight>
        <PageLayout title="Roster" subtitle="Loading team roster...">
          <div className="space-y-spacing-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-32 bg-surface-muted rounded-lg"></div>
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
                onClick={
                  selectedPlayerIds.size === filteredPlayers.length
                    ? clearSelection
                    : selectAll
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
            <div className="flex flex-col sm:flex-row gap-spacing-md w-full sm:w-auto">
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Positions</option>
                {positionOptions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-spacing-sm py-spacing-xs border border-surface-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-spacing-md">
            <Card className="p-spacing-md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-sm" color="muted">
                    Total Players
                  </Typography>
                  <Typography variant="headline-lg">
                    {players.length}
                  </Typography>
                </div>
                <Icon name="users" className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-spacing-md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-sm" color="muted">
                    Active Players
                  </Typography>
                  <Typography variant="headline-lg">
                    {players.filter((p) => p.is_active === true).length}
                  </Typography>
                </div>
                <Icon
                  name="check-circle"
                  className="w-8 h-8 text-success-500"
                />
              </div>
            </Card>
            <Card className="p-spacing-md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-sm" color="muted">
                    Injured
                  </Typography>
                  <Typography variant="headline-lg">{0}</Typography>
                </div>
                <Icon
                  name="alert-triangle"
                  className="w-8 h-8 text-error-500"
                />
              </div>
            </Card>
            <Card className="p-spacing-md">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body-sm" color="muted">
                    Average Height
                  </Typography>
                  <Typography variant="headline-lg">
                    {players.length > 0
                      ? Math.round(
                          players
                            .filter((p) => p.height_inches)
                            .reduce(
                              (sum, p) => sum + (p.height_inches || 0),
                              0
                            ) / players.filter((p) => p.height_inches).length
                        )
                      : 0}
                    "
                  </Typography>
                </div>
                <Icon name="trending-up" className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </div>

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
                onClick: () => {
                  setSearchTerm("");
                  setPositionFilter("");
                  setStatusFilter("");
                },
              }}
            />
          )}

          {/* Player Grid */}
          {!loading && filteredPlayers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-spacing-md">
              {filteredPlayers.map((player) => (
                <Card
                  key={player.id}
                  className={`p-spacing-md hover:shadow-lg transition-all ${
                    selectedPlayerIds.has(player.id)
                      ? "ring-2 ring-primary bg-primary-50/30"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-spacing-md">
                    <div className="flex items-center gap-spacing-sm">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.has(player.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          togglePlayerSelection(player.id);
                        }}
                        className="w-5 h-5 rounded border-2 border-surface-secondary text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                        aria-label={`Select ${player.first_name} ${player.last_name}`}
                      />
                      <div>
                        <Typography
                          variant="headline-sm"
                          className="font-semibold mb-1"
                        >
                          {player.first_name} {player.last_name}
                        </Typography>
                        {/* Badges Row */}
                        <div className="flex gap-2 flex-wrap">
                          {/* Jersey Number Badge */}
                          {player.jersey_number && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jade-700 text-white">
                              #{player.jersey_number}
                            </span>
                          )}
                          {/* Position Badges - Support multiple positions */}
                          {player.position &&
                            player.position
                              .split(",")
                              .filter(Boolean)
                              .map((pos) => (
                                <span
                                  key={pos}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"
                                >
                                  {pos.trim()}
                                </span>
                              ))}
                          {/* Grade Level Badge */}
                          {player.grade_level && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                              {player.grade_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-spacing-xs">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(player)}
                      >
                        <Icon name="edit" className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          confirmDeletePlayer(
                            player.id,
                            `${player.first_name} ${player.last_name}`
                          )
                        }
                        className="text-error-500 hover:text-error-700"
                      >
                        <Icon name="delete" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-spacing-xs text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Height:</span>
                      <span>
                        {player.height_inches
                          ? `${Math.floor(player.height_inches / 12)}'${player.height_inches % 12}"`
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Weight:</span>
                      <span>
                        {player.weight_lbs
                          ? `${player.weight_lbs} lbs`
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Status:</span>
                      <span
                        className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
                          player.is_active
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {player.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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

              <div className="grid grid-cols-2 gap-4">
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
                >
                  {saving ? "Updating..." : "Update Player"}
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
        </div>
      </PageLayout>
    </Aurora>
  );
}
