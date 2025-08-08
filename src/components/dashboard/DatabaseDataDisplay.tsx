/**
 * Database Data Display
             <Typography variant="body-md" className="text-orange-700">
              Currently in <strong>{devMode}</strong> mode. Switch * Shows the loaded demo data from the database
 * Respects dev mode settings for data source
 */
import React from "react";
import { useTeamsData } from "../../hooks/useTeamsData";
import { useDevMode } from "../../app/dev-mode-hooks";
import { Typography } from "../design-system";
import { Card } from "../ui";
import { Icon } from "../ui/Icon/Icon";

export const DatabaseDataDisplay: React.FC = () => {
  const { devMode } = useDevMode();
  const { teams, playbooks, plays, loading, error, totalCount } =
    useTeamsData();

  // Show dev mode warning if not in production
  const showDevModeWarning = devMode !== "production";

  if (showDevModeWarning) {
    return (
      <Card className="p-6 border-orange-200 bg-orange-50">
        <div className="flex items-center">
          <Icon name="warning" size={20} color="warning" className="mr-3" />
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
      <Card className="p-6">
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
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center">
          <Icon name="warning" size={20} color="error" className="mr-3" />
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
      <Card className="p-6">
        <div className="text-center py-8">
          <Icon
            name="database"
            size={48}
            color="secondary"
            className="mx-auto mb-4 opacity-50"
          />
          <Typography variant="headline-sm" className="text-gray-600 mb-2">
            No Data Found
          </Typography>
          <Typography variant="body-sm" className="text-gray-500">
            Run the demo data loader to populate your database
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-jade-50 to-blue-50 border-jade-200">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teams */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-jade-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="users" size={20} color="primary" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-gray-900">
                Teams
              </Typography>
              <Typography variant="body-sm" color="muted">
                {teams.length} loaded
              </Typography>
            </div>
          </div>
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="p-3 bg-gray-50 rounded-lg">
                <Typography
                  variant="body-sm"
                  className="font-medium text-gray-900"
                >
                  {team.name}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {team.school_name} • {team.mascot} • {team.season_year}
                </Typography>
              </div>
            ))}
          </div>
        </Card>

        {/* Playbooks */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="book" size={20} color="info" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-gray-900">
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
                  className="font-medium text-gray-900"
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
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Icon name="zap" size={20} color="navy" />
            </div>
            <div>
              <Typography variant="headline-sm" className="text-gray-900">
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
                  className="font-medium text-gray-900"
                >
                  {play.play_name}
                </Typography>
                <Typography variant="body-xs" color="muted">
                  {play.formation} • {play.p_type}
                </Typography>
                {play.notes && (
                  <Typography variant="body-xs" className="text-gray-600 mt-1">
                    {play.notes.substring(0, 50)}...
                  </Typography>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <Typography variant="headline-sm" className="text-blue-800 mb-3">
          🚀 Next Steps
        </Typography>
        <div className="space-y-2">
          <Typography variant="body-sm" className="text-blue-700">
            • Navigate to <strong>/playbook</strong> to see your plays in the
            playbook interface
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • Test team management features with the loaded teams
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • Create additional plays using the PlayBuilder interface
          </Typography>
          <Typography variant="body-sm" className="text-blue-700">
            • Test the complete authentication flow (login → use app → logout)
          </Typography>
        </div>
      </Card>
    </div>
  );
};
