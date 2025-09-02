/**
 * Role Provider Component
 *
 * React provider component for managing user roles and permissions
 * throughout the application.
 */

import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  UserRoleContext,
  UIPermissions,
  TeamRole,
  Capability,
} from "../types/roles";
import { RoleService } from "../services/roleService";
import { useAuth } from "../app/auth-store";
import { RoleContext, type RoleContextValue } from "./roleContext";

// Re-export the context and types for convenience
export { RoleContext, type RoleContextValue };

// ============================================================================
// ROLE PROVIDER
// ============================================================================

interface RoleProviderProps {
  children: ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { user } = useAuth();
  const [roleContext, setRoleContext] = useState<UserRoleContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRoles = useCallback(async () => {
    if (!user?.id) {
      setRoleContext(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const context = await RoleService.getUserRoleContext(user.id);
      setRoleContext(context);
    } catch (err) {
      console.error("Error refreshing roles:", err);
      setError(err instanceof Error ? err.message : "Failed to load roles");
      setRoleContext(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load roles when user changes
  useEffect(() => {
    refreshRoles();
  }, [user?.id, refreshRoles]);

  const getUIPermissions = async (teamId?: string): Promise<UIPermissions> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    return RoleService.getUIPermissions(user.id, teamId);
  };

  const hasCapability = async (
    teamId: string,
    capability: string
  ): Promise<boolean> => {
    if (!user?.id) return false;
    return RoleService.hasCapability(user.id, teamId, capability as Capability);
  };

  const getUserTeamRole = (teamId: string): TeamRole | null => {
    if (!roleContext) return null;
    const membership = roleContext.teamMemberships.find(
      (tm) => tm.teamId === teamId
    );
    return membership?.teamRole || null;
  };

  const isCoach = async (teamId: string): Promise<boolean> => {
    if (!user?.id) return false;
    return RoleService.isCoach(user.id, teamId);
  };

  const value: RoleContextValue = {
    roleContext,
    loading,
    error,
    refreshRoles,
    getUIPermissions,
    hasCapability,
    getUserTeamRole,
    isCoach,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
