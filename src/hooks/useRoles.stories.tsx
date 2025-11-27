import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { RoleProvider, useRoles, useAppRole, useTeamRole } from "./useRoles";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

// Mock auth context for stories
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

const meta: Meta = {
  title: "Hooks/useRoles",
  component: RoleProvider,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
# useRoles Hook System

A comprehensive role-based access control (RBAC) system providing multiple hooks for managing user roles and permissions.

- \`useRoles()\` - Primary hook for accessing role context
- \`useAppRole()\` - Get user's application-level role
- \`useTeamRole(teamId)\` - Get user's role in a specific team
- \`useTeamPermissions(teamId?)\` - Check permissions with loading states
- \`useCapability(teamId, capability)\` - Check specific capabilities
- \`useRoleGuard()\` - Role-based conditional rendering utilities
- \`useRoleDisplayNames()\` - Get human-readable role names
- \`useTeamMembership(teamId)\` - Team membership utilities

## Architecture

The system uses a provider pattern with context to manage role state across the application.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <MockAuthProvider>
        <RoleProvider>
          <Story />
        </RoleProvider>
      </MockAuthProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// PRIMARY HOOK DEMO
// ============================================================================

const RolesDemo: React.FC = () => {
  const { roleContext, loading, error, refreshRoles, hasCapability } =
    useRoles();

  const [testTeamId] = React.useState("team-123");
  const [testCapability] = React.useState("manage_roster");
  const [capabilityResult, setCapabilityResult] = React.useState<
    boolean | null
  >(null);

  const handleTestCapability = async () => {
    try {
      const result = await hasCapability(testTeamId, testCapability);
      setCapabilityResult(result);
    } catch (err) {
      console.error("Error checking capability:", err);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading role context...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="p-3 bg-error-bg border border-red-400 text-error-600 rounded mb-4">
          Error: {error}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Role Context</h3>

        <div className="space-y-4">
          {/* App Role */}
          <div className="space-y-2">
            <strong>App Role:</strong>
            <Badge
              variant={
                roleContext?.appRole === "super_admin" ? "success" : "neutral"
              }
            >
              {roleContext?.appRole || "None"}
            </Badge>
          </div>

          {/* Team Memberships */}
          <div className="space-y-2">
            <strong>Team Memberships:</strong>
            {roleContext?.teamMemberships?.length ? (
              <div className="space-y-2">
                {roleContext.teamMemberships.map((membership, index) => (
                  <div
                    key={index}
                    className="p-3 bg-secondary rounded-lg"
                  >
                    <div>Team: {membership.teamId}</div>
                    <div>Role: {membership.teamRole}</div>
                    <div>Active: {membership.isActive ? "Yes" : "No"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted">No team memberships</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={refreshRoles} variant="outline" size="sm">
              Refresh Roles
            </Button>
          </div>
        </div>
      </Card>

      {/* Permission Testing */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Permission Testing</h3>

        <div className="space-y-4">
          <Button onClick={handleTestCapability} variant="outline">
            Check Capability: {testCapability}
          </Button>

          {capabilityResult !== null && (
            <div className="p-3 bg-secondary rounded-lg">
              <strong>Has Capability:</strong> {capabilityResult ? "Yes" : "No"}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// APP ROLE HOOK DEMO
// ============================================================================

const AppRoleDemo: React.FC = () => {
  const appRole = useAppRole();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">App Role Hook</h3>
      <div className="space-y-2">
        <strong>Current App Role:</strong>
        <Badge
          variant={
            appRole === "super_admin"
              ? "success"
              : appRole === "admin"
                ? "warning"
                : "neutral"
          }
        >
          {appRole || "None"}
        </Badge>
      </div>
    </Card>
  );
};

// ============================================================================
// TEAM ROLE HOOK DEMO
// ============================================================================

const TeamRoleDemo: React.FC = () => {
  const [teamId, setTeamId] = React.useState("team-123");
  const teamRole = useTeamRole(teamId);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Team Role Hook</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <strong>Team ID:</strong>
          <input
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter team ID"
          />
        </div>

        <div className="space-y-2">
          <strong>Team Role:</strong>
          <Badge variant={teamRole ? "success" : "neutral"}>
            {teamRole || "None"}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// STORIES
// ============================================================================

export const PrimaryHook: Story = {
  render: () => <RolesDemo />,
};

export const AppRoleHook: Story = {
  render: () => <AppRoleDemo />,
};

export const TeamRoleHook: Story = {
  render: () => <TeamRoleDemo />,
};

export const AllHooksDemo: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Complete Role System Demo</h2>
      <RolesDemo />
      <AppRoleDemo />
      <TeamRoleDemo />
    </div>
  ),
};
