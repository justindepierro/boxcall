/**
 * Role Context Definition
 *
 * Context definition for role management system.
 * This file only exports the context definition to avoid React Fast Refresh issues.
 */

import { createContext } from "react";
import type { UserRoleContext, UIPermissions, TeamRole } from "../types/roles";

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

export interface RoleContextValue {
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

export const RoleContext = createContext<RoleContextValue | null>(null);
