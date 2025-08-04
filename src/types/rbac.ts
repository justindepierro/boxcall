// Core RBAC Types and Constants
export const UserRole = {
  SUPER_ADMIN: "super_admin",
  TEAM_OWNER: "team_owner",
  HEAD_COACH: "head_coach",
  ASSISTANT_COACH: "coach",
  TEAM_MANAGER: "manager",
  PLAYER: "player",
  FAMILY: "family",
  VIEWER: "viewer",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  // Team Management
  CREATE_TEAM: "team:create",
  DELETE_TEAM: "team:delete",
  MANAGE_TEAM_SETTINGS: "team:manage",

  // User Management
  INVITE_USERS: "users:invite",
  MANAGE_ROLES: "users:manage_roles",
  REMOVE_USERS: "users:remove",

  // Content Management
  CREATE_PLAYS: "content:create_plays",
  EDIT_SCHEDULE: "content:edit_schedule",
  MANAGE_ACHIEVEMENTS: "content:manage_achievements",

  // System (Super Admin Only)
  ACCESS_ALL_TEAMS: "system:access_all_teams",
  MANAGE_BILLING: "system:manage_billing",
  VIEW_ANALYTICS: "system:view_analytics",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const DataScopeMode = {
  PRODUCTION: "production",
  DEV_BLANK_SLATE: "dev_blank",
  DEV_MOCK_TEAM: "dev_mock",
  SYSTEM_WIDE: "system_wide",
} as const;

export type DataScopeMode = (typeof DataScopeMode)[keyof typeof DataScopeMode];

export interface DataScope {
  mode: DataScopeMode;
  teamIds: string[];
  userId?: string;
  restrictions?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  role?: string;
  permissions?: Permission[];
  teamMemberships?: { teamId: string; role: string }[];
}
