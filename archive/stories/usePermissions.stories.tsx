import type { Meta, StoryObj } from "@storybook/react-vite";
import { usePermissions } from "./usePermissions";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Typography } from "../components/design-system/Typography";
import { Badge } from "../components/ui/Badge";

const meta: Meta = {
  title: "Hooks/usePermissions",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A React hook for checking user permissions and role-based access control (RBAC) throughout the application.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

const PermissionsDemo: React.FC = () => {
  const {
    hasPermission,
    canCreateTeam,
    canManageTeam,
    isSuperAdmin,
    canCreateTeamUnlimited,
    effectivePermissions,
    rbacUser,
  } = usePermissions();

  const testPermissions = [
    "CREATE_TEAM",
    "MANAGE_TEAM_SETTINGS",
    "DELETE_TEAM",
    "INVITE_USERS",
    "MANAGE_USERS",
    "VIEW_ANALYTICS",
  ];

  return (
    <Card className="p-6 max-w-2xl">
      <div className="space-y-6">
        <Typography variant="headline-md">Permissions Hook Demo</Typography>

        {/* User Info */}
        <div className="space-y-2">
          <Typography variant="body-md">Current User</Typography>
          <div className="p-3 bg-surface-secondary rounded-lg">
            {rbacUser ? (
              <div className="space-y-1">
                <Typography variant="body-sm">
                  <strong>Email:</strong> {rbacUser.email}
                </Typography>
                <Typography variant="body-sm">
                  <strong>Role:</strong> {rbacUser.role || "No role"}
                </Typography>
                <Typography variant="body-sm">
                  <strong>ID:</strong> {rbacUser.id.slice(0, 8)}...
                </Typography>
              </div>
            ) : (
              <Typography variant="body-sm" color="muted">
                No user logged in
              </Typography>
            )}
          </div>
        </div>

        {/* Special Permissions */}
        <div className="space-y-2">
          <Typography variant="body-md">Special Permissions</Typography>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isSuperAdmin ? "success" : "neutral"}>
              Super Admin: {isSuperAdmin ? "Yes" : "No"}
            </Badge>
            <Badge variant={canCreateTeam ? "success" : "neutral"}>
              Can Create Team: {canCreateTeam ? "Yes" : "No"}
            </Badge>
            <Badge variant={canCreateTeamUnlimited ? "success" : "neutral"}>
              Unlimited Teams: {canCreateTeamUnlimited ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {/* Permission Testing */}
        <div className="space-y-3">
          <Typography variant="body-md">Permission Testing</Typography>
          <div className="grid grid-cols-1 gap-2">
            {testPermissions.map((permission) => {
              const hasPerm = hasPermission(permission as any);
              return (
                <div
                  key={permission}
                  className="flex items-center justify-between p-2 bg-surface-secondary rounded"
                >
                  <Typography variant="body-sm">{permission}</Typography>
                  <Badge variant={hasPerm ? "success" : "danger"}>
                    {hasPerm ? "✓" : "✗"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Management Test */}
        <div className="space-y-2">
          <Typography variant="body-md">Team Management</Typography>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const canManage = canManageTeam("test-team-id");
                alert(`Can manage team: ${canManage}`);
              }}
            >
              Test Team Management (test-team-id)
            </Button>
          </div>
        </div>

        {/* Data Scope */}
        <div className="space-y-2">
          <Typography variant="body-md">Data Scope</Typography>
          <div className="p-3 bg-surface-secondary rounded-lg">
            <Typography variant="body-sm" color="muted">
              Data scope information available via RBAC service
            </Typography>
          </div>
        </div>

        {/* Effective Permissions */}
        <div className="space-y-2">
          <Typography variant="body-md">Effective Permissions</Typography>
          <div className="p-3 bg-surface-secondary rounded-lg max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {effectivePermissions.map((perm) => (
                <Badge key={perm} variant="info" size="sm">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const Default: StoryObj = {
  render: () => <PermissionsDemo />,
};

export const PermissionChecking: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-md">
        This demo shows how to check various permissions and understand the
        current user's access level.
      </Typography>
      <PermissionsDemo />
    </div>
  ),
};

export const RoleBasedAccess: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body-md">
        Different user roles have different permission sets. Log in with
        different accounts to see how permissions change.
      </Typography>
      <PermissionsDemo />
    </div>
  ),
};
