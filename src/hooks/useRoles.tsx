/**
 * Role Hooks
 *
 * React hooks for managing user roles and permissions.
 * Provides convenient access to role information and permission checking.
 *
 * Note: This file exports both hooks and a provider component, which is
 * necessary for the role system architecture. ESLint warning disabled.
 */

/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type {
  UserRoleContext,
  UIPermissions,
  AppRole,
  TeamRole,
  Capability,
} from "../types/roles";
import { RoleService } from "@services";
import { useAuth } from "../app/auth-store";
import { debug, error as logError } from "../utils/logger";

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

interface RoleContextValue {
  roleContext: UserRoleContext | null;
  loading: boolean;
  error: string | null;
  refreshRoles: () => Promise<void>;

  // Convenience methods
  getUIPermissions: (teamId?: string) => Promise<UIPermissions>;
  hasCapability: (teamId: string, capability: string) => Promise<boolean>;
  getUserTeamRole: (teamId: string) => TeamRole | null;
  isCoach: (teamId: string) => Promise<boolean>;
}

const RoleContext = createContext<RoleContextValue | null>(null);

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
    debug("🔄 useRoles: refreshRoles called, user:", user?.id);
    if (!user?.id) {
      debug("🔄 useRoles: No user ID, setting roleContext to null");
      setRoleContext(null);
      return;
    }

    debug("🔄 useRoles: Starting role refresh for user:", user.id);
    // Clear cache to force fresh data
    RoleService.clearRoleCache(user.id);
    setLoading(true);
    setError(null);

    try {
      debug("🔄 useRoles: Calling RoleService.getUserRoleContext");
      const context = await RoleService.getUserRoleContext(user.id);
      debug("🔄 useRoles: Got role context:", context);
      debug(
        "🔄 useRoles: Team memberships count:",
        context?.teamMemberships?.length
      );
      setRoleContext(context);
    } catch (err) {
      logError("Error refreshing roles:", err);
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

  // Development helpers
  if (import.meta.env.DEV) {
    (window as any).BoxCallDebug = {
      ...(window as any).BoxCallDebug,
      refreshRoles,
      clearRoleCache: () => RoleService.clearRoleCache(),
      getRoleContext: () => roleContext,
    };
  }

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Primary hook for accessing role context
 */
export function useRoles(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoles must be used within a RoleProvider");
  }
  return context;
}

/**
 * Hook for getting user's app role
 */
export function useAppRole(): AppRole | null {
  const { roleContext } = useRoles();
  return roleContext?.appRole || null;
}

/**
 * Hook for getting user's role in a specific team
 */
export function useTeamRole(teamId?: string): TeamRole | null {
  const { roleContext } = useRoles();

  if (!teamId || !roleContext) return null;

  const membership = roleContext.teamMemberships.find(
    (tm) => tm.teamId === teamId
  );
  return membership?.teamRole || null;
}

/**
 * Hook for checking permissions with automatic loading states
 */
export function useTeamPermissions(teamId?: string) {
  const { getUIPermissions } = useRoles();
  const [permissions, setPermissions] = useState<UIPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const perms = await getUIPermissions(teamId);
        setPermissions(perms);
      } catch (err) {
        console.error("Error loading permissions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load permissions"
        );
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [teamId, getUIPermissions]);

  return { permissions, loading, error };
}

/**
 * Hook for checking if user has specific capability
 */
export function useCapability(teamId: string, capability: string) {
  const { hasCapability } = useRoles();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkCapability = async () => {
      setLoading(true);
      try {
        const access = await hasCapability(teamId, capability);
        setHasAccess(access);
      } catch (error) {
        console.error("Error checking capability:", error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (teamId && capability) {
      checkCapability();
    }
  }, [teamId, capability, hasCapability]);

  return { hasAccess, loading };
}

/**
 * Hook for role-based conditional rendering
 */
export function useRoleGuard() {
  const { roleContext } = useRoles();

  const isAppRole = (role: AppRole): boolean => {
    return roleContext?.appRole === role;
  };

  const isTeamRole = (teamId: string, role: TeamRole): boolean => {
    if (!roleContext) return false;
    const membership = roleContext.teamMemberships.find(
      (tm) => tm.teamId === teamId
    );
    return membership?.teamRole === role;
  };

  const isAnyTeamRole = (teamId: string, roles: TeamRole[]): boolean => {
    if (!roleContext) return false;
    const membership = roleContext.teamMemberships.find(
      (tm) => tm.teamId === teamId
    );
    return membership ? roles.includes(membership.teamRole) : false;
  };

  const isCoachingRole = (teamId: string): boolean => {
    return isAnyTeamRole(teamId, [
      "head_coach",
      "assistant_coach",
      "coordinator",
    ]);
  };

  const isAdmin = (): boolean => {
    return isAppRole("super_admin") || isAppRole("admin");
  };

  return {
    isAppRole,
    isTeamRole,
    isAnyTeamRole,
    isCoachingRole,
    isAdmin,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for getting display names
 */
export function useRoleDisplayNames() {
  return {
    getAppRoleDisplayName: (role: AppRole) =>
      RoleService.getRoleDisplayName(role),
    getTeamRoleDisplayName: (role: TeamRole) =>
      RoleService.getRoleDisplayName(role),
  };
}

/**
 * Hook for team membership utilities
 */
export function useTeamMembership(teamId?: string) {
  const { roleContext } = useRoles();

  const membership =
    teamId && roleContext
      ? roleContext.teamMemberships.find((tm) => tm.teamId === teamId)
      : null;

  const isMember = Boolean(membership);
  const isActive = membership?.isActive || false;
  const teamRole = membership?.teamRole || null;
  const capabilities = membership?.capabilities || [];

  return {
    membership,
    isMember,
    isActive,
    teamRole,
    capabilities,
  };
}
