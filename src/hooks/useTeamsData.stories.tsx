import type { Meta, StoryObj } from "@storybook/react-vite";
import { useTeamsData } from "./useTeamsData";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useTeamsData",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Teams data management hook for fetching teams, playbooks, and plays.

**Features:**
- Fetches teams, playbooks, and plays data
- Loading states and error handling
- Manual refresh functionality
- Data aggregation and statistics

**Usage:**
\`\`\`tsx
import { useTeamsData } from './hooks/useTeamsData';

function TeamsDashboard() {
  const { teams, playbooks, plays, loading, error, refreshData } = useTeamsData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <Button onClick={refreshData}>Refresh Data</Button>
      <div>Total: {teams.length} teams, {playbooks.length} playbooks, {plays.length} plays</div>
    </div>
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Teams Data Demo Component
const TeamsDataDemo = () => {
  const { teams, playbooks, plays, loading, error, refreshData, totalCount } =
    useTeamsData();

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Teams Data Management</h3>
          <p className="text-sm text-secondary mb-4">
            Fetch and manage teams, playbooks, and plays data with loading
            states and refresh functionality.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Data Overview</h4>
            <Button onClick={refreshData} variant="outline">
              Refresh All Data
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teams.length}
              </div>
              <div className="text-sm text-secondary">Teams</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {playbooks.length}
              </div>
              <div className="text-sm text-secondary">Playbooks</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {plays.length}
              </div>
              <div className="text-sm text-secondary">Plays</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {totalCount}
              </div>
              <div className="text-sm text-secondary">Total Items</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <h4 className="font-medium">Loading State</h4>
            <div className="p-4 border rounded-lg bg-status-info-bg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading teams, playbooks, and plays data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="space-y-4">
            <h4 className="font-medium">Error State</h4>
            <div className="p-4 border border-error-200 rounded-lg bg-error-bg">
              <Badge variant="danger" className="mb-2">
                Data Fetch Error
              </Badge>
              <p className="text-error-600">{error}</p>
              <Button size="sm" onClick={refreshData} className="mt-2">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Teams Data */}
        {!loading && !error && (
          <div className="space-y-4">
            <h4 className="font-medium">Teams ({teams.length})</h4>

            {teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium">{team.name}</h5>
                        {team.school_name && (
                          <p className="text-sm text-secondary">
                            {team.school_name}
                          </p>
                        )}
                      </div>
                      {team.mascot && (
                        <Badge variant="info">{team.mascot}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Season:</span>{" "}
                        {team.season_year || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span>{" "}
                        {team.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No teams found
              </div>
            )}
          </div>
        )}

        {/* Playbooks Data */}
        {!loading && !error && (
          <div className="space-y-4">
            <h4 className="font-medium">Playbooks ({playbooks.length})</h4>

            {playbooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playbooks.map((playbook) => (
                  <div
                    key={playbook.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium">{playbook.name}</h5>
                        {playbook.description && (
                          <p className="text-sm text-secondary">
                            {playbook.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={playbook.is_active ? "success" : "neutral"}
                      >
                        {playbook.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Team ID:</span>{" "}
                      {playbook.team_id.slice(0, 8)}...
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No playbooks found
              </div>
            )}
          </div>
        )}

        {/* Plays Data */}
        {!loading && !error && (
          <div className="space-y-4">
            <h4 className="font-medium">Plays ({plays.length})</h4>

            {plays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plays.map((play) => (
                  <div
                    key={play.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-sm">{play.play_name}</h5>
                      <Badge variant="info" className="text-xs">
                        {play.formation}
                      </Badge>
                    </div>

                    <div className="text-xs text-secondary space-y-1">
                      <div>
                        <span className="font-medium">Type:</span> {play.p_type}
                      </div>
                      <div>
                        <span className="font-medium">Playbook:</span>{" "}
                        {play.playbook_id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No plays found
              </div>
            )}
          </div>
        )}

        {/* Hook Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Return Values</h4>
          <div className="text-sm space-y-1 text-secondary">
            <div>
              <code>teams</code> - Array of team objects
            </div>
            <div>
              <code>playbooks</code> - Array of playbook objects
            </div>
            <div>
              <code>plays</code> - Array of play objects
            </div>
            <div>
              <code>loading</code> - Boolean indicating if data is being fetched
            </div>
            <div>
              <code>error</code> - Error message string or null
            </div>
            <div>
              <code>refreshData()</code> - Function to manually refresh all data
            </div>
            <div>
              <code>totalCount</code> - Total number of all items combined
            </div>
          </div>
        </div>

        {/* Data Structure */}
        <div className="space-y-4">
          <h4 className="font-medium">Data Structures</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium">Team</h5>
              <div className="text-secondary space-y-1">
                <div>
                  <code>id, name</code>
                </div>
                <div>
                  <code>school_name, mascot</code>
                </div>
                <div>
                  <code>season_year</code>
                </div>
                <div>
                  <code>created_at, updated_at</code>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium">Playbook</h5>
              <div className="text-secondary space-y-1">
                <div>
                  <code>id, team_id, name</code>
                </div>
                <div>
                  <code>description</code>
                </div>
                <div>
                  <code>is_active</code>
                </div>
                <div>
                  <code>created_at, updated_at</code>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-medium">Play</h5>
              <div className="text-secondary space-y-1">
                <div>
                  <code>id, playbook_id</code>
                </div>
                <div>
                  <code>formation, play_name</code>
                </div>
                <div>
                  <code>p_type, notes</code>
                </div>
                <div>
                  <code>created_at, updated_at</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <TeamsDataDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete teams data management demo with loading states, error handling, and data display.",
      },
    },
  },
};

export const LoadingState: StoryObj = {
  render: () => {
    const { loading, refreshData } = useTeamsData();

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Loading State</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            <span>Loading: {loading ? "true" : "false"}</span>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-secondary">
              The hook loads teams, playbooks, and plays data simultaneously.
            </p>
          </div>

          <Button onClick={refreshData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the loading state while fetching teams data.",
      },
    },
  },
};

export const DataOverview: StoryObj = {
  render: () => {
    const { teams, playbooks, plays, totalCount } = useTeamsData();

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Data Overview</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">
                {teams.length}
              </div>
              <div className="text-sm text-secondary">Teams</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">
                {playbooks.length}
              </div>
              <div className="text-sm text-secondary">Playbooks</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-purple-600">
                {plays.length}
              </div>
              <div className="text-sm text-secondary">Plays</div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-xl font-bold text-orange-600">
                {totalCount}
              </div>
              <div className="text-sm text-secondary">Total</div>
            </div>
          </div>

          <div className="p-3 border rounded-lg bg-gray-50">
            <p className="text-sm text-secondary">
              Combined count of all teams, playbooks, and plays in the system.
            </p>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows data statistics and counts from the teams data hook.",
      },
    },
  },
};
