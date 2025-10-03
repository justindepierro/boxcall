import { useMemo } from "react";

import { useAuth } from "../app/auth-store";
<<<<<<< HEAD
import { useRoles, useTeamPermissions } from "./useRoles";
=======
import { useDevMode } from "../app/dev-mode-hooks";
import { RBACService } from "@services/rbac/RBACService";
import { PERMISSIONS, type Permission } from "../types/rbac";
>>>>>>> origin/main

const SUPER_ADMIN_EMAIL = "justindepierro@gmail.com";

export const usePermissions = (teamId?: string) => {
  const { user } = useAuth();
  const { roleContext } = useRoles();
  const { permissions, loading, error } = useTeamPermissions(teamId);

  const isSuperAdmin = Boolean(
    user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL
  );
  const appRole = roleContext?.appRole ?? null;

<<<<<<< HEAD
  return useMemo(
    () => ({
      isSuperAdmin,
      appRole,
      canCreateTeamUnlimited: isSuperAdmin,
      permissions,
      permissionsLoading: loading,
      permissionsError: error,
    }),
    [isSuperAdmin, appRole, permissions, loading, error]
=======
  // Specific permission checks for common use cases
  const canCreateTeam = hasPermission(PERMISSIONS.CREATE_TEAM);
  const canManageTeam = useCallback(
    (teamId: string) =>
      hasPermission(PERMISSIONS.MANAGE_TEAM_SETTINGS, { teamId }),
    [hasPermission]
>>>>>>> origin/main
  );
};
