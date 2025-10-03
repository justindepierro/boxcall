import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useTeamMembershipRole } from "./useTeamMembershipRole";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

const meta: Meta = {
  title: "Hooks/useTeamMembershipRole",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Team membership role query hook with React Query integration.

**Features:**
- Fetches user's role in a specific team
- React Query caching and background updates
- Automatic refetching and error handling
- Type-safe role data

**Usage:**
\`\`\`tsx
import { useTeamMembershipRole } from './hooks/useTeamMembershipRole';

function TeamComponent({ teamId, userId }: { teamId: string; userId: string }) {
  const { data: role, isLoading, error } = useTeamMembershipRole(teamId, userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <p>Your role: {role || 'No role assigned'}</p>
      {role === 'admin' && <AdminControls />}
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

// Team Membership Role Demo Component
const TeamMembershipRoleDemo = () => {
  const [teamId, setTeamId] = useState("team-123");
  const [userId, setUserId] = useState("user-456");
  const {
    data: role,
    isLoading,
    error,
    refetch,
  } = useTeamMembershipRole(teamId, userId);

  const mockRoles = ["admin", "coach", "player", "family", null];
  const [selectedMockRole, setSelectedMockRole] = useState<string | null>(
    "coach"
  );

  const getRoleColor = (role: string | null | undefined) => {
    switch (role) {
      case "admin":
        return "danger";
      case "coach":
        return "warning";
      case "player":
        return "success";
      case "family":
        return "info";
      default:
        return "neutral";
    }
  };

  const getRoleDescription = (role: string | null | undefined) => {
    switch (role) {
      case "admin":
        return "Full administrative access";
      case "coach":
        return "Coaching and team management";
      case "player":
        return "Player access only";
      case "family":
        return "Family member access";
      default:
        return "No role assigned";
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Team Membership Role</h3>
          <p className="text-sm text-gray-600 mb-4">
            Query user's role within a specific team using React Query.
          </p>
        </div>

        {/* Input Controls */}
        <div className="space-y-4">
          <h4 className="font-medium">Query Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team ID</label>
              <Input
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Enter team ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">User ID</label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Refetch Role
          </Button>
        </div>

        {/* Query State */}
        <div className="space-y-4">
          <h4 className="font-medium">Query State</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">Loading</div>
              <Badge variant={isLoading ? "warning" : "neutral"}>
                {isLoading ? "true" : "false"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">Error</div>
              <Badge variant={error ? "danger" : "neutral"}>
                {error ? "true" : "false"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">Has Data</div>
              <Badge variant={role !== undefined ? "success" : "neutral"}>
                {role !== undefined ? "true" : "false"}
              </Badge>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <div className="text-sm font-medium text-gray-600">Role</div>
              <Badge variant={getRoleColor(role)}>{role || "none"}</Badge>
            </div>
          </div>
        </div>

        {/* Role Display */}
        <div className="space-y-4">
          <h4 className="font-medium">Current Role</h4>

          {isLoading && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading role data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <Badge variant="danger" className="mb-2">
                Query Error
              </Badge>
              <p className="text-red-700 text-sm">{error.message}</p>
              <Button size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && role !== undefined && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant={getRoleColor(role)}
                  className="text-lg px-3 py-1"
                >
                  {role || "No Role"}
                </Badge>
                <span className="text-sm text-gray-600">
                  Team: {teamId} • User: {userId}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {getRoleDescription(role)}
              </p>
            </div>
          )}
        </div>

        {/* Mock Role Simulator */}
        <div className="space-y-4">
          <h4 className="font-medium">Mock Role Simulator</h4>
          <p className="text-sm text-gray-600">
            This demonstrates what different roles look like (actual hook
            fetches from database).
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockRoles.map((mockRole) => (
              <div
                key={mockRole || "none"}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedMockRole === mockRole
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMockRole(mockRole)}
              >
                <div className="text-center">
                  <Badge variant={getRoleColor(mockRole)} className="mb-1">
                    {mockRole || "none"}
                  </Badge>
                  <div className="text-xs text-gray-600">
                    {getRoleDescription(mockRole)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedMockRole !== null && (
            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="text-sm">
                <strong>Selected:</strong> {selectedMockRole || "No role"} -{" "}
                {getRoleDescription(selectedMockRole)}
              </p>
            </div>
          )}
        </div>

        {/* Hook Details */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Details</h4>
          <div className="text-sm space-y-2 text-gray-600">
            <div>
              <strong>Query Key:</strong>{" "}
              <code>["team", teamId, "membership_role", userId]</code>
            </div>
            <div>
              <strong>Stale Time:</strong> 60 seconds
            </div>
            <div>
              <strong>Enabled:</strong> When both teamId and userId are provided
            </div>
            <div>
              <strong>Table:</strong> team_members (role column)
            </div>
          </div>
        </div>

        {/* Return Values */}
        <div className="space-y-4">
          <h4 className="font-medium">Return Values</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>data</code> - The user's role string or null
            </div>
            <div>
              <code>isLoading</code> - Boolean indicating if query is loading
            </div>
            <div>
              <code>error</code> - Error object if query failed
            </div>
            <div>
              <code>refetch</code> - Function to manually refetch the data
            </div>
          </div>
        </div>

        {/* Role Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Available Roles</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="danger">admin</Badge>
                <span className="text-sm">System administrators</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">coach</Badge>
                <span className="text-sm">Assistant coaches</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="success">player</Badge>
                <span className="text-sm">Team players</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">family</Badge>
                <span className="text-sm">Family members</span>
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
  render: () => <TeamMembershipRoleDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo of team membership role querying with loading states and error handling.",
      },
    },
  },
};

export const LoadingState: StoryObj = {
  render: () => {
    const { isLoading } = useTeamMembershipRole("team-123", "user-456");

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Loading State</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
            <span>Loading: {isLoading ? "true" : "false"}</span>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">
              The hook shows loading state while fetching role data from the
              database.
            </p>
          </div>
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the loading state behavior of the team membership role hook.",
      },
    },
  },
};

export const ErrorState: StoryObj = {
  render: () => {
    const { error, refetch } = useTeamMembershipRole(
      "invalid-team",
      "invalid-user"
    );

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Error State</h3>
        <div className="space-y-4">
          {error ? (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <Badge variant="danger" className="mb-2">
                Error
              </Badge>
              <p className="text-red-700 text-sm">{error.message}</p>
              <Button size="sm" onClick={() => refetch()} className="mt-2">
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
        story: "Demonstrates error handling when team membership query fails.",
      },
    },
  },
};

export const RoleDisplay: StoryObj = {
  render: () => {
    const roles = ["admin", "coach", "player", "family"];

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Role Display Examples</h3>
        <div className="space-y-3">
          {roles.map((roleExample) => (
            <div
              key={roleExample}
              className="flex items-center justify-between p-3 border rounded"
            >
              <span className="capitalize">{roleExample}</span>
              <Badge
                variant={
                  roleExample === "admin"
                    ? "danger"
                    : roleExample === "coach"
                      ? "warning"
                      : roleExample === "player"
                        ? "success"
                        : "info"
                }
              >
                {roleExample}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows how different roles are displayed in the UI.",
      },
    },
  },
};
