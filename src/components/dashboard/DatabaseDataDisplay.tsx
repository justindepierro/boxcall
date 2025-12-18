/* eslint-disable max-lines-per-function */

import { Typography } from "../design-system";
/**
 * Database Data Display
 * Shows the loaded demo data from the database with interactive team selector
 * Respects dev mode settings for data source
 */
import React, { useState } from "react";
import { useTeamsData } from "../../hooks/useTeamsData";
import { useDevMode } from "../../app/dev-mode-hooks";
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
      <Card className="p-6 bg-primary border-muted bg-subtle">
        <div className="flex items-center">
          <Icon name="warning" size="md" color="warning" className="mr-3" />
          <div>
            <Typography variant="headline-sm" className="text-warning mb-1">
              Dev Mode Active - {devMode}
            </Typography>
            <Typography variant="body-sm" className="text-warning mb-3">
              Currently in <strong>{devMode}</strong> mode. Switch to production
              mode to see database data.
            </Typography>
            <Typography variant="body-xs" className="text-warning">
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
      <Card className="p-6 bg-primary">
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
      <Card className="p-6 bg-primary border-muted bg-subtle">
        <div className="flex items-center">
          <Icon name="warning" size="md" color="error" className="mr-3" />
          <div>
            <Typography variant="headline-sm" className="text-error mb-1">
              Database Error
            </Typography>
            <Typography variant="body-sm" className="text-error">
              {error}
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="p-6 bg-primary">
        <div className="text-center py-8">
          <Icon
            name="database"
            size="xl"
            color="secondary"
            className="mx-auto mb-4 opacity-50"
          />
          <Typography variant="headline-sm" className="text-secondary mb-2">
            No Data Found
          </Typography>
          <Typography variant="body-sm" className="text-muted">
            Run the demo data loader to populate your database
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-primary bg-gradient-to-r from-bg-success/20 to-bg-info/20 border-muted">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="headline-md" className="text-success800 mb-1">
              <Icon
                name="party-popper"
                className="inline h-4 w-4 align-middle text-primary"
              />{" "}
              Demo Data Loaded Successfully!
            </Typography>
            <Typography variant="body-md" className="text-success700">
              Your BoxCall database is now populated with sample data
            </Typography>
          </div>
          <div className="text-right">
            <Typography
              variant="headline-lg"
              className="text-success600 font-bold"
            >
              {totalCount}
            </Typography>
            <Typography variant="body-sm" className="text-success600">
              Total Items
            </Typography>
          </div>
        </div>
      </Card>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 bc-grid-gap">
        {/* Team Selector */}
        <Card className="p-6 bg-primary">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-jade-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="users" size="md" color="primary" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-primary">
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
                      ? "bg-subtle border border-jade-300 shadow-sm"
                      : "bg-subtle hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1 text-left">
                      <Typography
                        variant="body-sm"
                        className="font-medium truncate text-primary"
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
            <div className="mt-4 p-4 bg-subtle border border-muted rounded-lg">
              <Typography
                variant="headline-sm"
                className="text-success900 mb-3"
              >
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
                <div className="mt-3 pt-2 border-t border-muted">
                  <Typography variant="body-xs" className="text-success700">
                    <Icon
                      name="lightbulb"
                      className="inline h-4 w-4 align-middle text-primary"
                    />{" "}
                    In a full app, selecting a team would switch your workspace
                    context, filter playbooks/plays, and update all data to this
                    team's information.
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Playbooks */}
        <Card className="p-6 bg-primary">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center mr-3">
              <Icon name="book" size="md" color="info" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-primary">
                Playbooks
              </Typography>
              <Typography variant="body-sm" color="muted">
                {playbooks.length} loaded
              </Typography>
            </div>
          </div>
          <div className="space-y-3">
            {playbooks.map((playbook) => (
              <div key={playbook.id} className="p-3 bg-subtle rounded-lg">
                <Typography
                  variant="body-sm"
                  className="font-medium text-primary"
                >
                  {playbook.name}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {playbook.description}
                </Typography>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs ${
                      playbook.is_active
                        ? "bg-success/20 text-success"
                        : "bg-subtle text-tertiary"
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
        <Card className="p-6 bg-primary">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mr-3">
              <Icon name="zap" size="md" color="secondary" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-primary">
                Plays
              </Typography>
              <Typography variant="body-sm" color="muted">
                {plays.length} loaded
              </Typography>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {plays.map((play) => (
              <div key={play.id} className="p-3 bg-subtle rounded-lg">
                <Typography
                  variant="body-sm"
                  className="font-medium text-primary"
                >
                  {play.play_name}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {play.formation} • {play.p_type}
                </Typography>
                {play.notes && (
                  <Typography variant="body-xs" className="text-secondary mt-1">
                    {play.notes.substring(0, 50)}...
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="p-6 bg-primary bg-subtle border-muted">
        <Typography variant="headline-sm" className="text-info mb-3">
          <Icon
            name="rocket"
            className="inline h-4 w-4 align-middle text-primary"
          />{" "}
          Next Steps
        </Typography>
        <div className="space-y-2">
          <Typography variant="body-sm" className="text-info">
            • <strong>Try the Team Selector:</strong> Click on teams above to
            explore team details and selection functionality
          </Typography>
          <Typography variant="body-sm" className="text-info">
            • <strong>Navigate to Playbook:</strong> Go to{" "}
            <strong>/playbook</strong> to see your plays in the playbook
            interface
          </Typography>
          <Typography variant="body-sm" className="text-info">
            • <strong>Test Team Management:</strong> Use the loaded teams to
            test coaching workflows and team-specific features
          </Typography>
          <Typography variant="body-sm" className="text-info">
            • <strong>Create Additional Plays:</strong> Use the PlayBuilder
            interface to add more plays to your playbooks
          </Typography>
          <Typography variant="body-sm" className="text-info">
            • <strong>Full Authentication Flow:</strong> Test the complete login
            → use app → logout experience
          </Typography>
        </div>
      </Card>
    </div>
  );
};
