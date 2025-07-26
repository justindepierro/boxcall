// src/utils/roles.js
import { getOverrideRole } from '@state/devToolState.js';
import { getCurrentUser, getUserSettings } from '@state/userState.js';

import { devWarn } from './devLogger';

/**
 * Returns the current role, considering any dev override.
 * @returns {string|null}
 */
export function getCurrentRole() {
  const override = getOverrideRole();
  if (override) {
    devWarn('🧪 Using overridden role: ${override}');
    return override;
  }
  const settings = getUserSettings();
  return settings?.role || null;
}

// 1. Define known roles
export const ROLES = {
  HEAD_COACH: 'head_coach',
  COACH: 'coach', // Simplified from assistant_coach and coordinator
  PLAYER: 'player',
  FAMILY: 'family', // Changed from parent
  MANAGER: 'manager',
};

// Super Admin roles (platform level)
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// 2. Define role hierarchies/relationships
export const ROLE_HIERARCHY = {
  [ROLES.HEAD_COACH]: 4,
  [ROLES.COACH]: 3, // Simplified from assistant_coach and coordinator
  [ROLES.MANAGER]: 2,
  [ROLES.PLAYER]: 1,
  [ROLES.FAMILY]: 1, // Changed from parent
};

// Super admin roles have highest privilege
export const ADMIN_HIERARCHY = {
  [ADMIN_ROLES.SUPER_ADMIN]: 100,
  [ADMIN_ROLES.ADMIN]: 90,
  [ADMIN_ROLES.MODERATOR]: 80,
};

// 3. Basic role checkers
export function isHeadCoach() {
  return getCurrentRole() === ROLES.HEAD_COACH;
}

export function isCoach() {
  return [ROLES.HEAD_COACH, ROLES.COACH].includes(getCurrentRole());
}

export function isPlayer() {
  return getCurrentRole() === ROLES.PLAYER;
}

export function isFamily() {
  return getCurrentRole() === ROLES.FAMILY;
}

export function isManager() {
  return getCurrentRole() === ROLES.MANAGER;
}

// 4. Combined role groupings
export function isStaff() {
  return [ROLES.HEAD_COACH, ROLES.COACH, ROLES.MANAGER].includes(getCurrentRole());
}

export function isTeamMember() {
  return [ROLES.HEAD_COACH, ROLES.COACH, ROLES.MANAGER, ROLES.PLAYER].includes(getCurrentRole());
}

export function isViewerOnly() {
  return getCurrentRole() === ROLES.FAMILY;
}

// 5. Capability checks (business logic)
export function canEditTeamSettings() {
  return isHeadCoach();
}

export function canViewTeamSettings() {
  return isStaff(); // including manager
}

export function canEditRoster() {
  return isStaff(); // Coaches and Managers can edit
}

export function canSubmitPlays() {
  return isCoach();
}

export function canViewBoxCall() {
  return isTeamMember(); // exclude family
}

/**
 * Gets the user's role directly from the user object, falling back to overrides.
 * @returns {string|null}
 */
export function getUserRole() {
  const override = getOverrideRole();
  if (override) return override;

  const user = getCurrentUser();
  return user?.role || getCurrentRole() || null;
}

// 6. Super Admin functionality
export function isSuperAdmin() {
  const user = getCurrentUser();
  return user?.email === 'justindepierro@gmail.com' || user?.admin_role === ADMIN_ROLES.SUPER_ADMIN;
}

export function isAdmin() {
  return isSuperAdmin() || getCurrentUser()?.admin_role === ADMIN_ROLES.ADMIN;
}

export function isModerator() {
  return isAdmin() || getCurrentUser()?.admin_role === ADMIN_ROLES.MODERATOR;
}

export function canManagePlatform() {
  return isSuperAdmin();
}

export function canManageTeams() {
  return isAdmin();
}

export function canModerateContent() {
  return isModerator();
}

export function hasHigherRole(userRole, targetRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  return userLevel > targetLevel;
}

export function hasAdminAccess() {
  return isSuperAdmin() || isAdmin() || isModerator();
}
