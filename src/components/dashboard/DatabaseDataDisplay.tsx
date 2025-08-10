/**
 * Database Data Display
 * Shows the loaded demo data from the database with interactive team selector
 * Respects dev mode settings for data source
 */
import React, { useState } from "react";
import { useTeamsData } from "../../hooks/useTeamsData";
import { useDevMode } from "../../app/dev-mode-hooks";
import { Typography } from "../design-system";
import { Card, Button } from "../ui";
import { Icon } from "../ui/Icon/Icon";

// Using the same Team interface as useTeamsData hook
interface Team {
  id: string;
  name: string;
  school_name?: string;
  mascot?: string;
  season_year?: number;
  created_at: string;
  updated_at: string;
}

export const DatabaseDataDisplay: React.FC = () => {
  const { devMode } = useDevMode();
  const { teams, playbooks, plays, loading, error, totalCount } =
    useTeamsData();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Show dev mode warning if not in production
  const showDevModeWarning = devMode !== "production";

  if (showDevModeWarning) {
    return (
      <Card className="bc-card-padding surface-card border-orange-200 bg-orange-50">
        <div className="flex items-center">
          <Icon name="warning" size="md" color="warning" className="mr-3" />
          <div>
            <Typography variant="headline-sm" className="text-orange-800 mb-1">
              Dev Mode Active - {devMode}
            </Typography>
            <Typography variant="body-sm" className="text-orange-700 mb-3">
              Currently in <strong>{devMode}</strong> mode. Switch to production
              mode to see database data.
            </Typography>
            <Typography variant="body-xs" className="text-orange-600">
              Open dev tools → Switch to "Production" mode to see your loaded
              demo data
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
  <Card className="bc-card-padding surface-card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
          <Typography variant="body-md" className="ml-3">
            Loading database data...
          </Typography>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
  <Card className="bc-card-padding surface-card border-red-200 bg-red-50">
        <div className="flex items-center">
          <Icon name="warning" size="md" color="error" className="mr-3" />
          <div>
    <Typography variant="headline-sm" className="text-red-800 mb-1">
              Database Error
            </Typography>
    <Typography variant="body-sm" className="text-red-600">
              {error}
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
    <Card className="bc-card-padding surface-card">
        <div className="text-center py-8">
          <Icon
            name="database"
            size="xl"
            color="secondary"
            className="mx-auto mb-4 opacity-50"
          />
      <Typography variant="headline-sm" className="text-text-secondary mb-2">
            No Data Found
          </Typography>
      <Typography variant="body-sm" className="text-text-muted">
            Run the demo data loader to populate your database
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
  <Card className="bc-card-padding surface-card bg-gradient-to-r from-jade-50 to-blue-50 border-jade-200">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="headline-md" className="text-jade-800 mb-1">
              🎉 Demo Data Loaded Successfully!
            </Typography>
            <Typography variant="body-md" className="text-jade-700">
              Your BoxCall database is now populated with sample data
            </Typography>
          </div>
          <div className="text-right">
            <Typography
              variant="headline-lg"
              className="text-jade-600 font-bold"
            >
              {totalCount}
            </Typography>
            <Typography variant="body-sm" className="text-jade-600">
              Total Items
            </Typography>
          </div>
        </div>
      </Card>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 bc-grid-gap">
        {/* Team Selector */}
    <Card className="bc-card-padding surface-card">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-jade-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="users" size="md" color="primary" />
            </div>
            <div>
      <Typography variant="headline-sm" className="text-text-primary">
                Team Selector
              </Typography>
              <Typography variant="body-sm" color="muted">
                {teams.length} teams • Select to view details
              </Typography>
            </div>
          </div>
          <div className="space-y-2">
            {teams.map((team) => {
              const isActive = selectedTeam?.id === team.id;
              return (
                <Button
                  key={team.id}
                  onClick={() => setSelectedTeam(isActive ? null : team)}
                  variant={isActive ? "primary" : "ghost"}
                  size="sm"
                  className={`w-full justify-start px-3 py-3 ${
                    isActive
                      ? "bg-jade-50 border border-jade-300 shadow-sm"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 text-left">
                      <Typography
                        variant="body-sm"
                        className="font-medium truncate text-text-primary"
                      >
                        {team.name}
                      </Typography>
                      <Typography variant="body-xs" color="muted">
                        {team.school_name} • {team.mascot}
                      </Typography>
                    </div>
                    <Icon
                      name={isActive ? "chevron-up" : "chevron-down"}
                      size="sm"
                      color={isActive ? "primary" : "secondary"}
                    />
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Selected Team Details */}
          {selectedTeam && (
            <div className="mt-4 p-4 bg-jade-50 border border-jade-200 rounded-lg">
              <Typography variant="headline-sm" className="text-jade-900 mb-3">
                {selectedTeam.name} Details
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body-xs" color="muted">
                    School:
                  </Typography>
                  <Typography variant="body-xs" className="font-medium">
                    {selectedTeam.school_name}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-xs" color="muted">
                    Mascot:
                  </Typography>
                  <Typography variant="body-xs" className="font-medium">
                    {selectedTeam.mascot}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography variant="body-xs" color="muted">
                    Season:
                  </Typography>
                  <Typography variant="body-xs" className="font-medium">
                    {selectedTeam.season_year}
                  </Typography>
                </div>
                <div className="mt-3 pt-2 border-t border-jade-200">
                  <Typography variant="body-xs" className="text-jade-700">
                    💡 In a full app, selecting a team would switch your
                    workspace context, filter playbooks/plays, and update all
                    data to this team's information.
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Playbooks */}
        <Card className="bc-card-padding surface-card">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="book" size="md" color="info" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-text-primary">
                Playbooks
              </Typography>
              <Typography variant="body-sm" color="muted">
                {playbooks.length} loaded
              </Typography>
            </div>
          </div>
          <div className="space-y-3">
            {playbooks.map((playbook) => (
              <div key={playbook.id} className="p-3 bg-gray-50 rounded-lg">
                <Typography
                  variant="body-sm"
                  className="font-medium text-text-primary"
                >
                  {playbook.name}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {playbook.description}
                </Typography>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      playbook.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {playbook.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Plays */}
        <Card className="bc-card-padding surface-card">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="zap" size="md" color="secondary" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-text-primary">
                Plays
              </Typography>
              <Typography variant="body-sm" color="muted">
                {plays.length} loaded
              </Typography>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {plays.map((play) => (
              <div key={play.id} className="p-3 bg-gray-50 rounded-lg">
                <Typography
                  variant="body-sm"
                  className="font-medium text-text-primary"
                >
                  {play.play_name}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {play.formation} • {play.p_type}
                </Typography>
                {play.notes && (
                  <Typography variant="body-xs" className="text-text-secondary mt-1">
                    {play.notes.substring(0, 50)}...
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Next Steps */}
  <Card className="bc-card-padding surface-card bg-blue-50 border-blue-200">
        <Typography variant="headline-sm" className="text-blue-800 mb-3">
          🚀 Next Steps
        </Typography>
        <div className="space-y-2">
          <Typography variant="body-sm" className="text-blue-700">
            • <strong>Try the Team Selector:</strong> Click on teams above to
            explore team details and selection functionality
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • <strong>Navigate to Playbook:</strong> Go to{" "}
            <strong>/playbook</strong> to see your plays in the playbook
            interface
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • <strong>Test Team Management:</strong> Use the loaded teams to
            test coaching workflows and team-specific features
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • <strong>Create Additional Plays:</strong> Use the PlayBuilder
            interface to add more plays to your playbooks
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • <strong>Full Authentication Flow:</strong> Test the complete login
            → use app → logout experience
          </Typography>
        </div>
      </Card>
    </div>
  );
};
