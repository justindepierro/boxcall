import { Typography } from "../components/design-system";
/**
 * Teams Page - Shows all teams from database
 *
 * Displays the teams loaded from Supabase database
 */
import React from "react";
import { useTeamsData } from "../hooks/useTeamsData";
import Card from "../components/ui/Card/Card";

export const TeamsPage: React.FC = () => {
  const { teams, loading, error } = useTeamsData();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
          <span className="ml-3 text-lg text-text-secondary">
            Loading teams...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-8">
          <Typography variant="headline-lg" className="text-red-600 mb-4">
            Error Loading Teams
          </Typography>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Typography variant="display-lg" className="mb-2">
          Teams
        </Typography>
        <Typography variant="body-md" className="text-text-secondary">
          {teams.length} teams found in database
        </Typography>
      </div>

      {teams.length === 0 ? (
        <div className="text-center p-8">
          <Typography variant="headline-lg" className="text-text-muted mb-4">
            No Teams Found
          </Typography>
          <p className="text-text-muted">
            Create a team or check your database connection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Typography variant="headline-md" className="text-blue-600">
                    {team.name}
                  </Typography>
                  <span className="text-xs text-text-muted surface-subtle px-2 py-1 rounded">
                    {team.season_year || "No Year"}
                  </span>
                </div>

                {team.school_name && (
                  <Typography variant="body-sm" className="text-text-primary">
                    <strong>School:</strong> {team.school_name}
                  </Typography>
                )}

                {team.mascot && (
                  <Typography variant="body-sm" className="text-text-primary">
                    <strong>Mascot:</strong> {team.mascot}
                  </Typography>
                )}

                <div className="pt-2 border-t border-subtle">
                  <Typography variant="body-xs" className="text-text-muted">
                    Created: {new Date(team.created_at).toLocaleDateString()}
                  </Typography>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
