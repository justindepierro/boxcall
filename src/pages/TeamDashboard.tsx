import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { PlayerList } from "../components/team/PlayerList";
import { PlayerForm } from "../components/team/PlayerForm";
import { TeamSettings } from "../components/team/TeamSettings";
import type { TeamPlayer, TeamSettings as TeamSettingsType } from "../types/team-management";

/**
 * TeamDashboard Component
 * 
 * Main team management interface for coaches.
 * Handles player management, team settings, and roster operations.
 */
export const TeamDashboard: React.FC = () => {
  const { teamId } = useParams();
  
  // State management
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<TeamPlayer | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "settings">("roster");

  // Load team data
  useEffect(() => {
    if (teamId) {
      loadTeamData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const loadTeamData = async () => {
    if (!teamId) return;
    
    setLoading(true);
    
    try {
      // TODO: Replace with actual database query once teams table is created
      // For now, using mock data until database schema is implemented
      const mockTeam = {
        id: teamId,
        name: "Sample Team",
        school: "Sample High School", 
        level: "varsity" as const,
        season: "2025",
        logoUrl: undefined,
        location: {
          address: "123 Main St",
          city: "Sample City",
          state: "Sample State",
          zipCode: "12345"
        },
        subscription: {
          tier: "team_premium" as const,
          features: ["player_management", "analytics"],
          headCoachId: "admin"
        },
        familyPermissions: {
          canViewRoster: true,
          canViewSchedule: true,
          canViewStats: true,
          canRSVP: true,
          canFundraise: true
        },
        settings: {
          allowPlayerSelfRegistration: false,
          requireParentApproval: true,
          showPlayerStats: true,
          enableNotifications: true
        }
      };
      setTeamSettings(mockTeam);

      // TODO: Replace with actual database query once team_players table is created
      const mockPlayers = [
        {
          id: "1",
          team_id: teamId,
          first_name: "John",
          last_name: "Smith",
          email: "john.smith@email.com",
          positions: ["QB", "S"],
          jersey_number: 12,
          height: "6'2\"",
          weight: 185,
          graduation_year: 2026,
          team_level: "varsity" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          team_id: teamId,
          first_name: "Mike",
          last_name: "Johnson",
          email: "mike.johnson@email.com",
          positions: ["RB", "WR"],
          jersey_number: 24,
          height: "5'10\"",
          weight: 170,
          graduation_year: 2025,
          team_level: "varsity" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setPlayers(mockPlayers);

    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowPlayerForm(true);
  };

  const handleEditPlayer = (player: TeamPlayer) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handlePlayerSaved = (player: TeamPlayer) => {
    if (editingPlayer) {
      // Update existing player
      setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
    } else {
      // Add new player
      setPlayers(prev => [...prev, { ...player, id: Date.now().toString() }]);
    }
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("Are you sure you want to remove this player from the team?")) {
      setPlayers(prev => prev.filter(p => p.id !== playerId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!teamSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Team Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to find team with ID: {teamId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {teamSettings.logoUrl ? (
                <img
                  src={teamSettings.logoUrl}
                  alt={`${teamSettings.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                  {teamSettings.name[0]}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {teamSettings.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {teamSettings.school || "Team Management Dashboard"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleAddPlayer}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <span>👤</span>
                <span>Add Player</span>
              </Button>
              
              <Button
                onClick={() => setActiveTab("settings")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Team Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("roster")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "roster"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                🏈 Roster ({players.length})
              </button>
              
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                ⚙️ Team Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "roster" && (
          <PlayerList
            players={players}
            onEditPlayer={handleEditPlayer}
            onDeletePlayer={handleDeletePlayer}
            onAddPlayer={handleAddPlayer}
          />
        )}

        {activeTab === "settings" && teamSettings && (
          <TeamSettings
            teamSettings={teamSettings}
            onUpdate={setTeamSettings}
          />
        )}

        {/* Modals */}
        {showPlayerForm && (
          <PlayerForm
            player={editingPlayer}
            teamId={teamId!}
            onSave={handlePlayerSaved}
            onCancel={() => {
              setShowPlayerForm(false);
              setEditingPlayer(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
