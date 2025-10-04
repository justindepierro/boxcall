import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "../components/layout/PageLayout";
import { Card, Button, Input, Modal } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { rosterService } from "../services";
import type {
  RosterPlayerView,
  PlayerRosterInsert,
  PlayerRosterUpdate,
} from "../services/rosterService";
import { getActiveTeamId } from "../utils/activeTeam";
import { RosterImportModal } from "../components/roster/RosterImportModal";
// import { useToast } from "../hooks/useToast";

/**
 * RosterPage - Complete roster management interface
 *
 * Features:
 * - Player list with search and filtering
 * - Add/Edit/Delete players
 * - Bulk CSV import
 * - Player statistics and profiles
 * - Team overview dashboard
 * - Coach role management
 */
export default function RosterPage() {
  const navigate = useNavigate();

  // State
  const [players, setPlayers] = useState<RosterPlayerView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
    if (!teamId) return;

    try {
      setLoading(true);
      const rosterData = await rosterService.listByTeam(teamId);
      setPlayers(rosterData);
    } catch (error) {
      console.error("Failed to load roster:", error);
      // console.log("Failed to load roster", "error");
    } finally {
      setLoading(false);
    }
  }, [teamId]);

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

      const matchesPosition =
        !positionFilter || player.position === positionFilter;
      const matchesStatus =
        !statusFilter || player.roster_status === statusFilter;

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
        !playerForm.position
      ) {
        setFormError("First name, last name, and position are required");
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
      console.log("Player added successfully");
      setShowAddModal(false);
      resetForm();
      loadRoster();
    } catch (error) {
      console.error("Failed to add player:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to add player. Please try again."
      );
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
      console.log("Player updated successfully");
      setShowEditModal(false);
      setEditingPlayer(null);
      resetForm();
      loadRoster();
    } catch (error) {
      console.error("Failed to update player:", error);
      console.log("Failed to update player");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    try {
      await rosterService.deletePlayer(playerId);
      console.log("Player deleted successfully");
      loadRoster();
    } catch (error) {
      console.error("Failed to delete player:", error);
      console.log("Failed to delete player");
    }
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
          graduation_year: csvPlayer.graduationYear
            ? parseInt(csvPlayer.graduationYear)
            : undefined,
        };

        await rosterService.createPlayer(playerData);
      }

      console.log(
        `${csvPlayers.length} players imported successfully`,
        "success"
      );
      setShowImportModal(false);
      loadRoster();
    } catch (error) {
      console.error("Failed to import players:", error);
      console.log("Failed to import players", "error");
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
      <PageLayout title="Roster" subtitle="Loading team roster...">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Team Roster"
      subtitle={`${players.length} players • Manage your team's roster and player information`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Icon name="plus" className="w-4 h-4 mr-2" />
              Add Player
            </Button>
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Icon name="upload" className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Input
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" color="muted">
                  Total Players
                </Typography>
                <Typography variant="headline-lg">{players.length}</Typography>
              </div>
              <Icon name="users" className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" color="muted">
                  Active Players
                </Typography>
                <Typography variant="headline-lg">
                  {players.filter((p) => p.is_active === true).length}
                </Typography>
              </div>
              <Icon name="check-circle" className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body-sm" color="muted">
                  Injured
                </Typography>
                <Typography variant="headline-lg">{0}</Typography>
              </div>
              <Icon name="alert-triangle" className="w-8 h-8 text-red-500" />
            </div>
          </Card>
          <Card className="p-4">
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
                          .reduce((sum, p) => sum + (p.height_inches || 0), 0) /
                          players.filter((p) => p.height_inches).length
                      )
                    : 0}
                  "
                </Typography>
              </div>
              <Icon name="trending-up" className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Player Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <Card
              key={player.id}
              className="p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Typography
                      variant="headline-sm"
                      className="text-primary font-bold"
                    >
                      {player.jersey_number || "?"}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="headline-sm" className="font-semibold">
                      {player.first_name} {player.last_name}
                    </Typography>
                    <Typography variant="body-sm" color="muted">
                      {player.position || "No position"}
                    </Typography>
                  </div>
                </div>
                <div className="flex gap-1">
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
                    onClick={() => handleDeletePlayer(player.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Icon name="delete" className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Class:</span>
                  <span className="capitalize">
                    {player.grade_level || "Not set"}
                  </span>
                </div>
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
                    {player.weight_lbs ? `${player.weight_lbs} lbs` : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status:</span>
                  <span
                    className={`capitalize px-2 py-1 rounded text-xs ${
                      player.is_active
                        ? "bg-green-100 text-green-800"
                        : player.roster_status === "injured"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {player.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <Card className="p-8 text-center">
            <Icon
              name="users"
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
            />
            <Typography variant="headline-md" className="mb-2">
              No players found
            </Typography>
            <Typography variant="body-lg" color="muted" className="mb-4">
              {searchTerm || positionFilter || statusFilter
                ? "Try adjusting your search or filters"
                : "Get started by adding your first player"}
            </Typography>
            {!searchTerm && !positionFilter && !statusFilter && (
              <Button onClick={() => setShowAddModal(true)}>
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Add First Player
              </Button>
            )}
          </Card>
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
          <div className="space-y-4">
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
                  Position
                </label>
                <select
                  value={playerForm.position}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Position</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  Position
                </label>
                <select
                  value={playerForm.position}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Position</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
      </div>
    </PageLayout>
  );
}
