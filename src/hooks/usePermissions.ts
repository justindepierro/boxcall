import { useMemo } from "react";

import { useAuth } from "../app/auth-store";
import { useRoles, useTeamPermissions } from "./useRoles";
import { isSuperAdminEmail } from "../config/superAdmin";

/**
 * Hook for permission checking in React components
 * Simplified version after Phase 3 consolidation
 */
export const usePermissions = (teamId?: string) => {
  const { user } = useAuth();
  const { roleContext } = useRoles();
  const { permissions, loading, error } = useTeamPermissions(teamId);

  const isSuperAdmin = isSuperAdminEmail(user?.email ?? null);
  const appRole = roleContext?.appRole ?? null;

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
  );
};
