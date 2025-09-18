import { useCallback, useMemo } from "react";

import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
import { RBACService } from "@services/rbac/RBACService";
import { Permission } from "../types/rbac";

/**
 * Hook for permission checking in React components
 * Handles super admin override for justindepierro@gmail.com
 */
export const usePermissions = () => {
  const { user, profile } = useAuth();
  const { devMode } = useDevMode();

  // Convert auth profile to RBAC UserProfile
  const rbacUser = useMemo(() => {
    if (!user || !profile) return null;

    return {
      id: user.id,
      email: user.email || "",
      role: profile.role || undefined,
      permissions: [], // TODO: Load from database
      teamMemberships: [], // TODO: Load from database
    };
  }, [user, profile]);

  const hasPermission = useCallback(
    (permission: Permission, context?: { teamId?: string }) => {
      return RBACService.hasPermission(rbacUser, permission, context);
    },
    [rbacUser]
  );

  // Specific permission checks for common use cases
  const canCreateTeam = hasPermission(Permission.CREATE_TEAM);
  const canManageTeam = useCallback(
    (teamId: string) =>
      hasPermission(Permission.MANAGE_TEAM_SETTINGS, { teamId }),
    [hasPermission]
  );

  const isSuperAdmin = RBACService.isSuperAdmin(rbacUser);
  const canCreateTeamUnlimited = RBACService.canCreateTeamUnlimited(rbacUser);

  const effectivePermissions = RBACService.getEffectivePermissions(
    rbacUser,
    devMode
  );
  const dataScope = RBACService.getDataScope(rbacUser, devMode);

  return {
    // Core permission checking
    hasPermission,

    // Specific permissions
    canCreateTeam,
    canManageTeam,

    // Super admin status
    isSuperAdmin,
    canCreateTeamUnlimited,

    // Advanced
    effectivePermissions,
    dataScope,

    // Raw user data
    rbacUser,
  };
};
