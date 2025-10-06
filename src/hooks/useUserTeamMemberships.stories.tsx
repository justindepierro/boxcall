import type { Meta, StoryObj } from "@storybook/react-vite";
import { useUserTeamMemberships } from "./useUserTeamMemberships";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/useUserTeamMemberships",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
User team memberships management hook for fetching and managing user team relationships.

**Features:**
- Fetches user team memberships with roles and permissions
- Loading states and error handling
- Membership status tracking
- Role-based access control data

**Usage:**
\`\`\`tsx
import { useUserTeamMemberships } from './hooks/useUserTeamMemberships';

function UserTeamsPanel() {
  const { memberships, loading, error, refreshMemberships } = useUserTeamMemberships();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <Button onClick={refreshMemberships}>Refresh Memberships</Button>
      <div>You are a member of {memberships.length} teams</div>
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

// User Team Memberships Demo Component
const UserTeamMembershipsDemo = () => {
  const query = useUserTeamMemberships("user-123"); // Mock user ID
  const { data: memberships = [], isLoading: loading, error, refetch } = query;

  // Filter memberships by status
  const activeMemberships = memberships.filter((m) => m.status === "active");
  const pendingMemberships = memberships.filter((m) => m.status === "pending");

  return (
    <Card className="w-full max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">User Team Memberships</h3>
          <p className="text-sm text-secondary mb-4">
            Manage user team memberships with roles, permissions, and status
            tracking.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Membership Overview</h4>
            <Button onClick={() => refetch()} variant="outline">
              Refresh Memberships
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {memberships.length}
              </div>
              <div className="text-sm text-gray-600">Total Memberships</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeMemberships.length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingMemberships.length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(memberships.map((m: any) => m.role)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Roles</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <h4 className="font-medium">Loading State</h4>
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading user team memberships...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="space-y-4">
            <h4 className="font-medium">Error State</h4>
            <div className="p-4 border border-error-200 rounded-lg bg-red-50">
              <Badge variant="danger" className="mb-2">
                Membership Fetch Error
              </Badge>
              <p className="text-error-600">{error.message}</p>
              <Button size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Active Memberships */}
        {!loading && !error && activeMemberships.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">
              Active Memberships ({activeMemberships.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeMemberships.map((membership: any) => (
                <div
                  key={membership.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium">{membership.teams?.name}</h5>
                      {membership.teams?.school_name && (
                        <p className="text-sm text-gray-600">
                          {membership.teams.school_name}
                        </p>
                      )}
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{membership.role}</Badge>
                      <span className="text-sm text-gray-600">
                        Joined:{" "}
                        {new Date(membership.joined_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Team ID:</span>{" "}
                      {membership.team_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Memberships */}
        {!loading && !error && pendingMemberships.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">
              Pending Memberships ({pendingMemberships.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingMemberships.map((membership: any) => (
                <div
                  key={membership.id}
                  className="p-4 border rounded-lg hover:bg-surface-secondary border-yellow-200 bg-yellow-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium">{membership.teams?.name}</h5>
                      {membership.teams?.school_name && (
                        <p className="text-sm text-gray-600">
                          {membership.teams.school_name}
                        </p>
                      )}
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{membership.role}</Badge>
                      <span className="text-sm text-gray-600">
                        Requested:{" "}
                        {new Date(membership.joined_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Team ID:</span>{" "}
                      {membership.team_id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Memberships Table */}
        {!loading && !error && memberships.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">
              All Memberships ({memberships.length})
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-surface-secondary">
                    <th className="border border px-4 py-2 text-left">
                      Team
                    </th>
                    <th className="border border px-4 py-2 text-left">
                      Role
                    </th>
                    <th className="border border px-4 py-2 text-left">
                      Status
                    </th>
                    <th className="border border px-4 py-2 text-left">
                      Joined
                    </th>
                    <th className="border border px-4 py-2 text-left">
                      Team ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map((membership: any) => (
                    <tr key={membership.id} className="hover:bg-gray-50">
                      <td className="border border px-4 py-2">
                        <div>
                          <div className="font-medium">
                            {membership.teams?.name}
                          </div>
                          {membership.teams?.school_name && (
                            <div className="text-sm text-gray-600">
                              {membership.teams.school_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border border px-4 py-2">
                        <Badge variant="info">{membership.role}</Badge>
                      </td>
                      <td className="border border px-4 py-2">
                        <Badge
                          variant={
                            membership.status === "active"
                              ? "success"
                              : "warning"
                          }
                        >
                          {membership.status}
                        </Badge>
                      </td>
                      <td className="border border px-4 py-2 text-sm">
                        {new Date(membership.joined_at).toLocaleDateString()}
                      </td>
                      <td className="border border px-4 py-2 text-sm font-mono">
                        {membership.team_id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hook Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Hook Return Values</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>
              <code>data</code> - Array of team membership objects (from React
              Query)
            </div>
            <div>
              <code>isLoading</code> - Boolean indicating if data is being
              fetched
            </div>
            <div>
              <code>error</code> - Error object if fetch failed
            </div>
            <div>
              <code>refetch()</code> - Function to manually refresh membership
              data
            </div>
          </div>
        </div>

        {/* Data Structure */}
        <div className="space-y-4">
          <h4 className="font-medium">Membership Data Structure</h4>
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="text-sm space-y-1 text-gray-700">
              <div>
                <code>id</code> - Unique membership identifier
              </div>
              <div>
                <code>user_id</code> - User identifier
              </div>
              <div>
                <code>team_id</code> - Team identifier
              </div>
              <div>
                <code>teams</code> - Joined team data (name, school_name, etc.)
              </div>
              <div>
                <code>role</code> - User role in the team (coach, player, etc.)
              </div>
              <div>
                <code>status</code> - Membership status (active, pending,
                inactive)
              </div>
              <div>
                <code>joined_at</code> - Timestamp when user joined the team
              </div>
              <div>
                <code>created_at, updated_at</code> - Audit timestamps
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
  render: () => <UserTeamMembershipsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Complete user team memberships demo with status filtering and role management.",
      },
    },
  },
};

export const ActiveMemberships: StoryObj = {
  render: () => {
    const query = useUserTeamMemberships("user-123");
    const { data: memberships = [], isLoading: loading } = query;
    const activeMemberships = memberships.filter(
      (m: any) => m.status === "active"
    );

    return (
      <Card className="p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Active Memberships</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading active memberships...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activeMemberships.map((membership: any) => (
                <div key={membership.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {membership.teams?.name}
                      </span>
                      <Badge variant="info" className="ml-2">
                        {membership.role}
                      </Badge>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              ))}
              {activeMemberships.length === 0 && (
                <p className="text-muted text-center py-4">
                  No active memberships
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows only active team memberships with role information.",
      },
    },
  },
};

export const PendingMemberships: StoryObj = {
  render: () => {
    const query = useUserTeamMemberships("user-123");
    const { data: memberships = [], isLoading: loading } = query;
    const pendingMemberships = memberships.filter(
      (m: any) => m.status === "pending"
    );

    return (
      <Card className="p-6 max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Pending Memberships</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading pending memberships...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMemberships.map((membership: any) => (
                <div
                  key={membership.id}
                  className="p-3 border rounded-lg border-yellow-200 bg-yellow-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">
                        {membership.teams?.name}
                      </span>
                      <Badge variant="neutral" className="ml-2">
                        {membership.role}
                      </Badge>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
              ))}
              {pendingMemberships.length === 0 && (
                <p className="text-muted text-center py-4">
                  No pending memberships
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows pending team membership requests awaiting approval.",
      },
    },
  },
};

export const MembershipStats: StoryObj = {
  render: () => {
    const query = useUserTeamMemberships("user-123");
    const { data: memberships = [], isLoading: loading } = query;
    const activeMemberships = memberships.filter(
      (m: any) => m.status === "active"
    );
    const pendingMemberships = memberships.filter(
      (m: any) => m.status === "pending"
    );

    const roleStats = memberships.reduce(
      (acc: Record<string, number>, membership: any) => {
        acc[membership.role] = (acc[membership.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return (
      <Card className="p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-4">Membership Statistics</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Loading statistics...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {memberships.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600">
                    {activeMemberships.length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-yellow-600">
                    {pendingMemberships.length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {Object.keys(roleStats).length}
                  </div>
                  <div className="text-sm text-gray-600">Roles</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Role Distribution</h4>
                {Object.entries(roleStats).map(([role, count]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <Badge variant="info">{role}</Badge>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Shows membership statistics and role distribution.",
      },
    },
  },
};
