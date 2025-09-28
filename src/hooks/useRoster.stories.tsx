import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useRoster } from "./useRoster";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

const meta: Meta = {
  title: "Hooks/useRoster",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Roster management hook for fetching and managing team player data.

**Features:**
- Team roster data fetching with loading states
- Error handling and retry functionality
- Telemetry integration for performance monitoring
- Type-safe player data management

**Usage:**
\`\`\`tsx
import { useRoster } from './hooks/useRoster';

function TeamRoster({ teamId }: { teamId: string }) {
  const { players, loading, error, refresh } = useRoster(teamId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refresh} />;

  return (
    <div>
      <Button onClick={refresh}>Refresh Roster</Button>
      {players.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
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

// Roster Demo Component
const RosterDemo = () => {
  const [teamId, setTeamId] = useState("team-123");
  const { players, loading, error, refresh } = useRoster(teamId);

  const mockPlayers = [
    {
      id: "player-1",
      user_id: "user-1",
      team_id: teamId,
      jersey_number: 12,
      position: "Quarterback",
      status: "active",
      height_inches: 72,
      weight_pounds: 185,
      graduation_year: 2025,
      class_year: "Senior",
      dominant_hand: "Right",
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: "player-2",
      user_id: "user-2",
      team_id: teamId,
      jersey_number: 25,
      position: "Running Back",
      status: "active",
      height_inches: 68,
      weight_pounds: 175,
      graduation_year: 2026,
      class_year: "Junior",
      dominant_hand: "Left",
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: "player-3",
      user_id: "user-3",
      team_id: teamId,
      jersey_number: 88,
      position: "Wide Receiver",
      status: "active",
      height_inches: 65,
      weight_pounds: 145,
      graduation_year: 2025,
      class_year: "Senior",
      dominant_hand: "Right",
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Roster Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fetch and manage team player data with loading states and error
            handling.
          </p>
        </div>

        {/* Team ID Input */}
        <div className="space-y-4">
          <h4 className="font-medium">Team Configuration</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter team ID"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={refresh} disabled={!teamId.trim()}>
              Refresh Roster
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <h4 className="font-medium">Loading State</h4>
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading roster data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="space-y-4">
            <h4 className="font-medium">Error State</h4>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="danger" className="mb-2">
                    Error
                  </Badge>
                  <p className="text-red-700">{error}</p>
                </div>
                <Button size="sm" onClick={refresh}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Roster Data */}
        {!loading && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Roster ({players.length} players)</h4>
              <Badge variant="info">Team: {teamId}</Badge>
            </div>

            {players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium">
                          Player #{player.jersey_number}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {player.position}
                        </p>
                      </div>
                      <Badge
                        variant={
                          player.status === "active" ? "success" : "neutral"
                        }
                      >
                        {player.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Position:</span>{" "}
                        {player.position}
                      </div>
                      <div>
                        <span className="font-medium">Class:</span>{" "}
                        {player.class_year}
                      </div>
                      <div>
                        <span className="font-medium">Height:</span>{" "}
                        {player.height_inches}"
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span>{" "}
                        {player.weight_pounds} lbs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No players found for team "{teamId}"
              </div>
            )}
          </div>
        )}

        {/* Mock Data Preview */}
        <div className="space-y-4">
          <h4 className="font-medium">Mock Data Preview</h4>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">
              This hook would typically fetch real data from the roster service.
              Here's what the mock data looks like:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              {mockPlayers.map((player) => (
                <div key={player.id} className="p-2 bg-white rounded border">
                  <div className="font-medium">
                    #{player.jersey_number} - {player.position}
                  </div>
                  <div>
                    {player.class_year} • {player.weight_pounds} lbs
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hook Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Return Values</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>players</code> - Array of roster player objects
            </div>
            <div>
              <code>loading</code> - Boolean indicating if data is being fetched
            </div>
            <div>
              <code>error</code> - Error message string or null
            </div>
            <div>
              <code>refresh()</code> - Function to manually refresh roster data
            </div>
          </div>
        </div>

        {/* Player Data Structure */}
        <div className="space-y-4">
          <h4 className="font-medium">Player Data Structure</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>id</code> - Unique player identifier
            </div>
            <div>
              <code>user_id</code> - Associated user ID
            </div>
            <div>
              <code>display_name</code> - Player's display name
            </div>
            <div>
              <code>jersey_number</code> - Player's jersey number
            </div>
            <div>
              <code>position</code> - Player's position
            </div>
            <div>
              <code>is_active</code> - Whether player is active
            </div>
            <div>
              <code>grade_level, height_inches, weight_lbs</code> - Additional
              player info
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Story definitions
export const Default: StoryObj = {
  render: () => <RosterDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo of roster management with loading states, error handling, and data display.",
      },
    },
  },
};

export const LoadingState: StoryObj = {
  render: () => {
    const { loading } = useRoster("loading-team");

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
            <p className="text-sm text-gray-600">
              The hook automatically shows loading state while fetching roster
              data.
            </p>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the loading state behavior of the roster hook.",
      },
    },
  },
};

export const ErrorState: StoryObj = {
  render: () => {
    const { error, refresh } = useRoster("error-team");

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Error State</h3>
        <div className="space-y-4">
          {error ? (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <Badge variant="danger" className="mb-2">
                Error
              </Badge>
              <p className="text-red-700 text-sm">{error}</p>
              <Button size="sm" onClick={refresh} className="mt-2">
                Retry
              </Button>
            </div>
          ) : (
            <div className="p-4 border rounded-lg text-center text-gray-500">
              No error present
            </div>
          )}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Demonstrates error handling and retry functionality.",
      },
    },
  },
};
