import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Button } from "../components/ui/Button/Button";
import { rosterService } from "../services";
import type { RosterPlayerView } from "../services/rosterService";
import { RosterImportModal } from "../components/roster/RosterImportModal";
import { StaffManagement } from "../components/team/StaffManagement";
import { getActiveTeamId } from "../utils/activeTeam";
import { PageLayout } from "../components/layout/PageLayout";

/**
 * TeamSettings - Team configuration and management
 * Available to coaches and managers only
 *
 * Features:
 * - Team profile and information
 * - Member management and roles
 * - Team preferences and settings
 * - Integration configurations
 * - Roster management
 */
export const TeamSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "staff" | "roster" | "settings"
  >("roster");
  const [roster, setRoster] = useState<RosterPlayerView[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    firstName: "",
    lastName: "",
    jerseyNumber: "",
    position: "",
    classYear: "",
    heightInches: "",
    weightPounds: "",
    email: "",
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<RosterPlayerView | null>(
    null
  );
  const [deletingPlayer, setDeletingPlayer] = useState<RosterPlayerView | null>(
    null
  );
  const [editPlayerData, setEditPlayerData] = useState({
    firstName: "",
    lastName: "",
    jerseyNumber: "",
    position: "",
    classYear: "",
    heightInches: "",
    weightPounds: "",
    email: "",
  });

  // Get the active team ID
  const teamId = getActiveTeamId();

  const loadRoster = useCallback(async () => {
    try {
      setLoading(true);
      const rosterData = await rosterService.listByTeam(teamId);
      setRoster(rosterData);
    } catch (error) {
      console.error("Failed to load roster:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (activeTab === "roster") {
      loadRoster();
    }
  }, [activeTab, loadRoster]);

  const handleImportRoster = () => {
    setShowImportModal(true);
  };

  const handleDownloadTemplate = () => {
    // Create CSV template with proper headers and sample data
    const headers = [
      "First Name",
      "Last Name",
      "Jersey Number",
      "Position",
      "Grade",
      "Height",
      "Weight",
      "Email",
    ];

    const sampleData = [
      "John,Doe,23,QB,12,6'2\",185,john.doe@email.com",
      "Jane,Smith,45,WR,11,5'8\",145,jane.smith@email.com",
    ];

    const csvContent = [headers.join(","), ...sampleData].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "roster_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportComplete = async (players: any[]) => {
    console.log("Importing players:", players);

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const player of players) {
        try {
          // Map CSV data to our player format
          const playerData = {
            team_id: teamId,
            first_name: player.firstName || player["First Name"] || "",
            last_name: player.lastName || player["Last Name"] || "",
            primary_position: player.position || player["Position"] || "RB",
            jersey_number:
              player.jerseyNumber || player["Jersey Number"]
                ? parseInt(player.jerseyNumber || player["Jersey Number"], 10)
                : undefined,
            height_inches:
              player.height || player["Height"]
                ? parseInt(player.height || player["Height"], 10)
                : undefined,
            weight_pounds:
              player.weight || player["Weight"]
                ? parseInt(player.weight || player["Weight"], 10)
                : undefined,
            class_year: player.grade || player["Grade"] || undefined,
            email_address: player.email || player["Email"] || undefined,
          };

          // Validate required fields
          if (!playerData.first_name.trim() || !playerData.last_name.trim()) {
            errors.push(
              `Player ${playerData.first_name} ${playerData.last_name}: First and last name are required`
            );
            errorCount++;
            continue;
          }

          // Check for jersey number conflicts
          if (playerData.jersey_number) {
            const isAvailable = await rosterService.checkJerseyNumberAvailable(
              teamId,
              playerData.jersey_number
            );
            if (!isAvailable) {
              errors.push(
                `Player ${playerData.first_name} ${playerData.last_name}: Jersey number ${playerData.jersey_number} is already taken`
              );
              errorCount++;
              continue;
            }
          }

          await rosterService.createPlayer(playerData);
          successCount++;
        } catch (error) {
          console.error(`Failed to import player:`, player, error);
          errors.push(
            `Player ${player.firstName || player["First Name"] || "Unknown"}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        console.log(`✅ Successfully imported ${successCount} players`);
      }
      if (errorCount > 0) {
        console.warn(`⚠️ Failed to import ${errorCount} players:`, errors);
      }

      await loadRoster(); // Refresh roster after import
    } catch (error) {
      console.error("Failed to import roster:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = () => {
    setShowAddPlayerForm(true);
  };

  const resetPlayerForm = () => {
    setNewPlayerData({
      firstName: "",
      lastName: "",
      jerseyNumber: "",
      position: "",
      classYear: "",
      heightInches: "",
      weightPounds: "",
      email: "",
    });
    setSaveError(null);
  };

  const handleSavePlayer = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      // Validate required fields
      if (!newPlayerData.firstName.trim() || !newPlayerData.lastName.trim()) {
        setSaveError("First name and last name are required");
        return;
      }

      if (!newPlayerData.position) {
        setSaveError("Position is required");
        return;
      }

      // Validate jersey number if provided
      let jerseyNumber: number | undefined;
      if (newPlayerData.jerseyNumber.trim()) {
        jerseyNumber = parseInt(newPlayerData.jerseyNumber.trim(), 10);
        if (isNaN(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
          setSaveError("Jersey number must be between 0 and 99");
          return;
        }

        // Check if jersey number is available
        const isAvailable = await rosterService.checkJerseyNumberAvailable(
          teamId,
          jerseyNumber
        );
        if (!isAvailable) {
          setSaveError(`Jersey number ${jerseyNumber} is already taken`);
          return;
        }
      }

      // Parse optional numeric fields
      const heightInches = newPlayerData.heightInches.trim()
        ? parseInt(newPlayerData.heightInches.trim(), 10)
        : undefined;
      const weightPounds = newPlayerData.weightPounds.trim()
        ? parseInt(newPlayerData.weightPounds.trim(), 10)
        : undefined;

      // Create player data object
      const playerData = {
        team_id: teamId,
        first_name: newPlayerData.firstName.trim(),
        last_name: newPlayerData.lastName.trim(),
        email_address: newPlayerData.email.trim() || undefined,
        primary_position: newPlayerData.position,
        jersey_number: jerseyNumber,
        class_year: (newPlayerData.classYear as any) || undefined,
        height_inches: heightInches,
        weight_pounds: weightPounds,
      };

      await rosterService.createPlayer(playerData);

      setShowAddPlayerForm(false);
      resetPlayerForm();
      await loadRoster(); // Refresh roster after adding
    } catch (error) {
      console.error("Failed to add player:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to add player"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditPlayer = (player: RosterPlayerView) => {
    // Extract first name and last name from the player ID (since we don't have them in the view)
    // For now, we'll use placeholders. In a real implementation, you'd get these from the database
    setEditPlayerData({
      firstName: "", // Would come from database
      lastName: "", // Would come from database
      jerseyNumber: player.jersey_number?.toString() || "",
      position: player.position || "",
      classYear: player.class_year || "",
      heightInches: player.height_inches?.toString() || "",
      weightPounds: player.weight_pounds?.toString() || "",
      email: "", // Would come from database
    });
    setEditingPlayer(player);
  };

  const handleDeletePlayer = (player: RosterPlayerView) => {
    setDeletingPlayer(player);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlayer) return;

    try {
      await rosterService.deletePlayer(deletingPlayer.id);
      await loadRoster(); // Refresh roster after deletion
      setDeletingPlayer(null);
    } catch (error) {
      console.error("Failed to delete player:", error);
      // Could add error handling here
    }
  };

  const handleCancelDelete = () => {
    setDeletingPlayer(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPlayer) return;

    try {
      setSaving(true);
      setSaveError(null);

      // Validate jersey number if provided
      let jerseyNumber: number | undefined;
      if (editPlayerData.jerseyNumber.trim()) {
        jerseyNumber = parseInt(editPlayerData.jerseyNumber.trim(), 10);
        if (isNaN(jerseyNumber) || jerseyNumber < 0 || jerseyNumber > 99) {
          setSaveError("Jersey number must be between 0 and 99");
          return;
        }

        // Check if jersey number is available (excluding current player)
        const isAvailable = await rosterService.checkJerseyNumberAvailable(
          teamId,
          jerseyNumber,
          editingPlayer.id
        );
        if (!isAvailable) {
          setSaveError(`Jersey number ${jerseyNumber} is already taken`);
          return;
        }
      }

      // Parse optional numeric fields
      const heightInches = editPlayerData.heightInches.trim()
        ? parseInt(editPlayerData.heightInches.trim(), 10)
        : undefined;
      const weightPounds = editPlayerData.weightPounds.trim()
        ? parseInt(editPlayerData.weightPounds.trim(), 10)
        : undefined;

      // Create update data object
      const updateData = {
        primary_position: editPlayerData.position || undefined,
        jersey_number: jerseyNumber,
        class_year: (editPlayerData.classYear as any) || undefined,
        height_inches: heightInches,
        weight_pounds: weightPounds,
        // Note: first_name, last_name, email would be updated here if available
      };

      await rosterService.updatePlayer(editingPlayer.id, updateData);

      setEditingPlayer(null);
      await loadRoster(); // Refresh roster after updating
    } catch (error) {
      console.error("Failed to update player:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to update player"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setSaveError(null);
  };

  const handleCancelAddPlayer = () => {
    setShowAddPlayerForm(false);
    resetPlayerForm();
  };

  return (
    <PageLayout
      title="Team Settings"
      subtitle="Configure your team's profile, members, and preferences"
      variant="form"
    >
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-text-info text-text-info"
                  : "text-text-secondary hover:text-text-primary hover:border-border-light"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "staff"
                  ? "border-text-info text-text-info"
                  : "text-text-secondary hover:text-text-primary hover:border-border-light"
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "roster"
                  ? "border-text-info text-text-info"
                  : "text-text-secondary hover:text-text-primary hover:border-border-light"
              }`}
            >
              Roster
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "settings"
                  ? "border-text-info text-text-info"
                  : "text-text-secondary hover:text-text-primary hover:border-border-light"
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <Typography variant="headline-lg" className="mb-4">
              Team Overview
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-6 max-w-2xl mx-auto"
            >
              View team statistics, performance metrics, and activity summaries.
            </Typography>
            <div className="surface-subtle dark:bg-surface-info/20 border border-subtle dark:border-text-info rounded-lg p-4 inline-block">
              <Typography variant="body-sm" className="text-text-info">
                <Icon
                  name="wrench"
                  className="inline h-4 w-4 align-middle text-text-info"
                />{" "}
                Coming Soon - Team analytics and insights
              </Typography>
            </div>
          </Card>
        )}

        {activeTab === "staff" && <StaffManagement teamId={teamId} />}

        {activeTab === "roster" && (
          <div className="space-y-6">
            {/* Roster Header */}
            <div className="flex justify-between items-center">
              <div>
                <Typography variant="headline-lg" className="text-text-primary">
                  Team Roster
                </Typography>
                <Typography variant="body-md" color="muted" className="mt-1">
                  {roster.length} players on roster
                </Typography>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  size="sm"
                >
                  <Icon name="download" className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
                <Button
                  onClick={handleImportRoster}
                  variant="secondary"
                  size="sm"
                >
                  <Icon name="upload" className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button onClick={handleAddPlayer} variant="primary" size="sm">
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </div>
            </div>

            {/* Quick Add Player Form */}
            {showAddPlayerForm && (
              <Card className="p-6 border-text-info bg-surface-info">
                <Typography variant="headline-sm" className="mb-4">
                  Add New Player
                </Typography>

                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <Typography variant="body-sm" className="text-red-700">
                      {saveError}
                    </Typography>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={newPlayerData.firstName}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={newPlayerData.lastName}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Jersey Number
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={newPlayerData.jerseyNumber}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          jerseyNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      placeholder="23"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Position *
                    </label>
                    <select
                      value={newPlayerData.position}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      required
                    >
                      <option value="">Select Position</option>
                      <option value="QB">Quarterback</option>
                      <option value="RB">Running Back</option>
                      <option value="WR">Wide Receiver</option>
                      <option value="TE">Tight End</option>
                      <option value="OL">Offensive Line</option>
                      <option value="DL">Defensive Line</option>
                      <option value="LB">Linebacker</option>
                      <option value="DB">Defensive Back</option>
                      <option value="K">Kicker</option>
                      <option value="P">Punter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Class Year
                    </label>
                    <select
                      value={newPlayerData.classYear}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          classYear: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                    >
                      <option value="">Select Class</option>
                      <option value="freshman">Freshman</option>
                      <option value="sophomore">Sophomore</option>
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                      <option value="graduate">Graduate</option>
                      <option value="redshirt">Redshirt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Height (inches)
                    </label>
                    <input
                      type="number"
                      min="48"
                      max="96"
                      value={newPlayerData.heightInches}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          heightInches: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      placeholder="72"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      min="80"
                      max="400"
                      value={newPlayerData.weightPounds}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          weightPounds: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newPlayerData.email}
                      onChange={(e) =>
                        setNewPlayerData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                      placeholder="player@email.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button onClick={handleCancelAddPlayer} variant="secondary">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePlayer}
                    variant="primary"
                    disabled={
                      !newPlayerData.firstName ||
                      !newPlayerData.lastName ||
                      !newPlayerData.position ||
                      saving
                    }
                  >
                    {saving ? "Adding..." : "Add Player"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Roster Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-info mx-auto mb-4"></div>
                <Typography variant="body-lg" color="muted">
                  Loading roster...
                </Typography>
              </div>
            ) : roster.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <Typography variant="headline-lg" className="mb-4">
                  No Players Yet
                </Typography>
                <Typography
                  variant="body-lg"
                  color="muted"
                  className="mb-6 max-w-2xl mx-auto"
                >
                  Import your team roster from a CSV file or add players
                  manually to get started.
                </Typography>
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleImportRoster} variant="primary">
                    <Icon name="upload" className="h-5 w-5 mr-2" />
                    Import Roster CSV
                  </Button>
                  <Button onClick={handleAddPlayer} variant="secondary">
                    <Icon name="plus" className="h-5 w-5 mr-2" />
                    Add Player Manually
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {roster.map((player) => (
                  <Card
                    key={player.id}
                    className="p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-surface-info rounded-full flex items-center justify-center">
                          <Typography
                            variant="headline-sm"
                            className="text-text-info font-bold"
                          >
                            {player.jersey_number || "?"}
                          </Typography>
                        </div>
                        <div>
                          <Typography
                            variant="headline-sm"
                            className="text-text-primary"
                          >
                            Player {player.id.slice(0, 8)}
                          </Typography>
                          <Typography variant="body-sm" color="muted">
                            {player.position || "Position TBD"}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          className="p-1 text-text-muted hover:text-text-secondary"
                          onClick={() => handleEditPlayer(player)}
                          title="Edit player"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-text-muted hover:text-text-error"
                          onClick={() => handleDeletePlayer(player)}
                          title="Delete player"
                        >
                          <Icon name="delete" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            player.status === "active"
                              ? "bg-surface-success text-text-success"
                              : player.status === "inactive"
                                ? "bg-surface-secondary text-text-secondary"
                                : "bg-surface-warning text-text-warning"
                          }`}
                        >
                          {player.status || "Unknown"}
                        </span>
                      </div>
                      {player.height_inches && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Height:</span>
                          <span>
                            {Math.floor(player.height_inches / 12)}'
                            {player.height_inches % 12}"
                          </span>
                        </div>
                      )}
                      {player.weight_pounds && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Weight:</span>
                          <span>{player.weight_pounds} lbs</span>
                        </div>
                      )}
                      {player.graduation_year && (
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Class:</span>
                          <span>{player.graduation_year}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Icon name="mail" className="h-4 w-4 mr-2" />
                        Invite to Boxcall
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <Typography variant="headline-lg" className="mb-4">
              Team Configuration
            </Typography>
            <Typography
              variant="body-lg"
              color="muted"
              className="mb-6 max-w-2xl mx-auto"
            >
              Comprehensive team management tools for coaches and
              administrators. Configure team settings, manage member roles, and
              customize your team's BoxCall experience.
            </Typography>
            <div className="surface-subtle dark:bg-surface-info/20 border border-subtle dark:border-text-info rounded-lg p-4 inline-block">
              <Typography variant="body-sm" className="text-text-info">
                <Icon
                  name="wrench"
                  className="inline h-4 w-4 align-middle text-text-info"
                />{" "}
                Coming Soon - Advanced team management and configuration tools
              </Typography>
            </div>
          </Card>
        )}
      </div>
      {/* Roster Import Modal */}
      <RosterImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportComplete}
      />

      {/* Delete Confirmation Modal */}
      {deletingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Icon name="delete" className="h-6 w-6 text-red-500 mr-3" />
              <Typography variant="headline-sm" className="text-text-primary">
                Delete Player
              </Typography>
            </div>
            <Typography variant="body-md" className="text-text-secondary mb-6">
              Are you sure you want to delete this player? This action cannot be
              undone.
            </Typography>
            <div className="flex justify-end space-x-3">
              <Button onClick={handleCancelDelete} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="primary"
                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
              >
                Delete Player
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <Icon name="edit" className="h-6 w-6 text-blue-500 mr-3" />
              <Typography variant="headline-sm" className="text-text-primary">
                Edit Player
              </Typography>
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <Typography variant="body-sm" className="text-red-700">
                  {saveError}
                </Typography>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Jersey Number
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={editPlayerData.jerseyNumber}
                  onChange={(e) =>
                    setEditPlayerData((prev) => ({
                      ...prev,
                      jerseyNumber: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                  placeholder="23"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Position
                </label>
                <select
                  value={editPlayerData.position}
                  onChange={(e) =>
                    setEditPlayerData((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                >
                  <option value="">Select Position</option>
                  <option value="QB">Quarterback</option>
                  <option value="RB">Running Back</option>
                  <option value="WR">Wide Receiver</option>
                  <option value="TE">Tight End</option>
                  <option value="OL">Offensive Line</option>
                  <option value="DL">Defensive Line</option>
                  <option value="LB">Linebacker</option>
                  <option value="DB">Defensive Back</option>
                  <option value="K">Kicker</option>
                  <option value="P">Punter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Class Year
                </label>
                <select
                  value={editPlayerData.classYear}
                  onChange={(e) =>
                    setEditPlayerData((prev) => ({
                      ...prev,
                      classYear: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                >
                  <option value="">Select Class</option>
                  <option value="freshman">Freshman</option>
                  <option value="sophomore">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="graduate">Graduate</option>
                  <option value="redshirt">Redshirt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Height (inches)
                </label>
                <input
                  type="number"
                  min="48"
                  max="96"
                  value={editPlayerData.heightInches}
                  onChange={(e) =>
                    setEditPlayerData((prev) => ({
                      ...prev,
                      heightInches: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                  placeholder="72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min="80"
                  max="400"
                  value={editPlayerData.weightPounds}
                  onChange={(e) =>
                    setEditPlayerData((prev) => ({
                      ...prev,
                      weightPounds: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border-medium rounded-md focus:outline-none focus:ring-2 focus:ring-text-info"
                  placeholder="175"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button onClick={handleCancelEdit} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
export default TeamSettings;
