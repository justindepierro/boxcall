import React, { useState, useEffect } from "react";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { Card } from "../components/ui";
import { Button } from "../components/ui/Button/Button";
import { rosterService } from "../services";
import type { RosterPlayerView } from "../services/rosterService";
import { RosterImportModal } from "../components/roster/RosterImportModal";

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
  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "settings">("roster");
  const [roster, setRoster] = useState<RosterPlayerView[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Mock team ID - in real app this would come from context/auth
  const teamId = "current-team";

  useEffect(() => {
    if (activeTab === "roster") {
      loadRoster();
    }
  }, [activeTab]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      const rosterData = await rosterService.listByTeam(teamId);
      setRoster(rosterData);
    } catch (error) {
      console.error("Failed to load roster:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportRoster = () => {
    setShowImportModal(true);
  };

  const handleImportComplete = async (players: any[]) => {
    // TODO: Implement actual roster import logic
    console.log("Importing players:", players);
    await loadRoster(); // Refresh roster after import
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="headline-xl" className="text-text-primary">
            Team Settings
          </Typography>
          <Typography variant="body-lg" color="muted" className="mt-2">
            Configure your team's profile, members, and preferences
          </Typography>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("roster")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "roster"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Roster
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
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
            <div className="surface-subtle dark:bg-purple-900/20 border border-subtle dark:border-purple-800 rounded-lg p-4 inline-block">
              <Typography
                variant="body-sm"
                className="text-purple-700 dark:text-purple-300"
              >
                <Icon
                  name="wrench"
                  className="inline h-4 w-4 align-middle text-current"
                />{" "}
                Coming Soon - Team analytics and insights
              </Typography>
            </div>
          </Card>
        )}

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
                  onClick={handleImportRoster}
                  variant="secondary"
                  size="sm"
                >
                  <Icon name="upload" className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                >
                  <Icon name="plus" className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </div>
            </div>

            {/* Roster Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                  Import your team roster from a CSV file or add players manually to get started.
                </Typography>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={handleImportRoster}
                    variant="primary"
                  >
                    <Icon name="upload" className="h-5 w-5 mr-2" />
                    Import Roster CSV
                  </Button>
                  <Button
                    variant="secondary"
                  >
                    <Icon name="plus" className="h-5 w-5 mr-2" />
                    Add Player Manually
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {roster.map((player) => (
                  <Card key={player.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Typography variant="headline-sm" className="text-blue-600 font-bold">
                            {player.jersey_number || "?"}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="headline-sm" className="text-text-primary">
                            Player {player.id.slice(0, 8)}
                          </Typography>
                          <Typography variant="body-sm" color="muted">
                            {player.position || "Position TBD"}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Icon name="delete" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          player.status === "active" ? "bg-green-100 text-green-800" :
                          player.status === "inactive" ? "bg-gray-100 text-gray-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {player.status || "Unknown"}
                        </span>
                      </div>
                      {player.height_inches && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Height:</span>
                          <span>{Math.floor(player.height_inches / 12)}'{player.height_inches % 12}"</span>
                        </div>
                      )}
                      {player.weight_pounds && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight:</span>
                          <span>{player.weight_pounds} lbs</span>
                        </div>
                      )}
                      {player.graduation_year && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span>{player.graduation_year}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                      >
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
              Comprehensive team management tools for coaches and administrators.
              Configure team settings, manage member roles, and customize your
              team's BoxCall experience.
            </Typography>
            <div className="surface-subtle dark:bg-purple-900/20 border border-subtle dark:border-purple-800 rounded-lg p-4 inline-block">
              <Typography
                variant="body-sm"
                className="text-purple-700 dark:text-purple-300"
              >
                <Icon
                  name="wrench"
                  className="inline h-4 w-4 align-middle text-current"
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
    </div>
  );
};
export default TeamSettings;
