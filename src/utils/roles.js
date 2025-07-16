// src/utils/roles.js
import { getOverrideRole } from '@state/devToolState.js';
import { getCurrentUser } from '@state/userState';

export function getCurrentRole() {
  const override = getOverrideRole();
  if (override) {
    console.warn('🧪 Using overridden role:', override);
    return override;
  }
  return window.userSettings?.role || null;
}

// 1. Define known roles
export const ROLES = {
  HEAD_COACH: 'head_coach',
  COACH: 'coach',
  PLAYER: 'player',
  FAMILY: 'family',
  MANAGER: 'manager',
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

export function getUserRole() {
  const override = getOverrideRole();
  if (override) return override;

  const user = getCurrentUser();
  return user?.role || null;
}
