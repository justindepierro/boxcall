/**
 * Unified Role System Types
 *
 * This file defines the standardized role architecture that matches
 * the database schema after the role system overhaul migration.
 *
 * Architecture:
 * - App-level roles: Primary user role determining subscription features
 * - Team-level roles: Specific roles within team memberships
 * - Capabilities: Granular permissions for specific actions
 */

// ============================================================================
// CORE ROLE TYPES
// ============================================================================

/**
 * App-level user roles (stored in profiles.role)
 * Determines subscription features and base app permissions
 */
export type AppRole =
  | "super_admin" // System administrators
  | "admin" // Team administrators/head coaches
  | "coach" // Assistant coaches/coordinators
  | "player" // Team players
  | "family"; // Family members/parents

/**
 * Team-level roles (stored in team_members.team_role)
 * Specific roles within a team determining team-level permissions
 */
export type TeamRole =
  | "head_coach" // Team owner/head coach
  | "assistant_coach" // Assistant coaches
  | "coordinator" // Specialized coordinators (OC, DC, etc.)
  | "manager" // Team managers
  | "player" // Active players
  | "family" // Family members
  | "alumni"; // Former players/coaches

/**
 * Granular permission capabilities
 * Used in team_members.capabilities array
 */
export type Capability =
  // Team Management
  | "team.manage"
  | "team.settings"

  // Roster Management
  | "roster.manage"
  | "roster.view"

  // Playbook Management
  | "playbook.manage"
  | "playbook.create"
  | "playbook.edit"
  | "playbook.view"

  // Calendar Management
  | "calendar.manage"
  | "calendar.view"

  // Analytics & Reports
  | "analytics.view"
  | "analytics.manage"

  // Profile Management
  | "profile.manage"
  | "profile.view"

  // Settings
  | "settings.manage"
  | "settings.view";

export const CAPABILITY_KEYS: Capability[] = [
  "team.manage",
  "team.settings",
  "roster.manage",
  "roster.view",
  "playbook.manage",
  "playbook.create",
  "playbook.edit",
  "playbook.view",
  "calendar.manage",
  "calendar.view",
  "analytics.view",
  "analytics.manage",
  "profile.manage",
  "profile.view",
  "settings.manage",
  "settings.view",
];

export type CapabilityFlags = {
  [K in Capability]: boolean;
};

export const EMPTY_CAPABILITY_FLAGS: CapabilityFlags = CAPABILITY_KEYS.reduce(
  (acc, key) => {
    acc[key] = false;
    return acc;
  },
  {} as CapabilityFlags
);

export function capabilityFlagsFromList(list: Capability[]): CapabilityFlags {
  return list.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, { ...EMPTY_CAPABILITY_FLAGS });
}

export function capabilityListFromFlags(
  flags: Partial<CapabilityFlags> | null | undefined
): Capability[] {
  if (!flags) return [];
  return CAPABILITY_KEYS.filter((key) => Boolean(flags[key]));
}

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

/**
 * Complete user role context
 * Combines app-level role with team memberships
 */
export interface UserRoleContext {
  /** Primary app-level role */
  appRole: AppRole;

  /** Team memberships with roles and permissions */
  teamMemberships: TeamMembership[];

  /** User's profile ID */
  userId: string;

  /** Last updated timestamp */
  lastUpdated: Date;
}

/**
 * Team membership with role and permissions
 */
export interface TeamMembership {
  /** Team ID */
  teamId: string;

  /** Team name */
  teamName: string;

  /** Role within this team */
  teamRole: TeamRole;

  /** Granular capabilities for this team */
  capabilities: Capability[];

  /** Whether membership is active */
  isActive: boolean;

  /** When role was assigned */
  assignedAt: Date;

  /** Optional role notes */
  roleNotes?: string;
}

/**
 * UI permission flags for components
 * Computed from UserRoleContext for specific contexts
 */
export interface UIPermissions {
  // Global permissions
  canManageGlobalSettings: boolean;
  canAccessAdminPanel: boolean;

  // Team-specific permissions (for current team context)
  canManageTeam: boolean;
  canManageRoster: boolean;
  canManagePlaybook: boolean;
  canCreatePlays: boolean;
  canEditPlays: boolean;
  canViewPlaybook: boolean;
  canManageCalendar: boolean;
  canViewCalendar: boolean;
  canViewAnalytics: boolean;
  canManageAnalytics: boolean;
  canManageTeamSettings: boolean;

  // Profile permissions
  canEditOwnProfile: boolean;
  canEditOtherProfiles: boolean;
  canViewProfiles: boolean;
}

// ============================================================================
// ROLE MAPPING CONSTANTS
// ============================================================================

/**
 * Default capabilities for each team role
 */
export const DEFAULT_TEAM_ROLE_CAPABILITIES: Record<TeamRole, Capability[]> = {
  head_coach: [
    "team.manage",
    "roster.manage",
    "playbook.manage",
    "calendar.manage",
    "analytics.view",
    "analytics.manage",
    "settings.manage",
    "profile.manage",
  ],

  assistant_coach: [
    "playbook.manage",
    "playbook.create",
    "playbook.edit",
    "roster.view",
    "calendar.manage",
    "analytics.view",
    "profile.manage",
  ],

  coordinator: [
    "playbook.manage",
    "playbook.create",
    "playbook.edit",
    "roster.view",
    "calendar.view",
    "analytics.view",
    "profile.manage",
  ],

  manager: ["roster.view", "calendar.view", "analytics.view", "profile.manage"],

  player: ["playbook.view", "calendar.view", "roster.view", "profile.manage"],

  family: ["calendar.view", "roster.view", "profile.view"],

  alumni: ["roster.view", "profile.view"],
};

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
export const TEAM_ROLE_HIERARCHY: Record<TeamRole, number> = {
  head_coach: 100,
  assistant_coach: 80,
  coordinator: 70,
  manager: 60,
  player: 40,
  family: 20,
  alumni: 10,
};

/**
 * App role to team role mapping
 * Suggested team role when user joins a team based on app role
 */
export const APP_ROLE_TO_TEAM_ROLE: Record<AppRole, TeamRole> = {
  super_admin: "head_coach",
  admin: "head_coach",
  coach: "assistant_coach",
  player: "player",
  family: "family",
};

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Human-readable role display names
 */
export const ROLE_DISPLAY_NAMES: Record<AppRole | TeamRole, string> = {
  // App roles
  super_admin: "Super Admin",
  admin: "Administrator",
  coach: "Coach",
  player: "Player",
  family: "Family",

  // Team roles
  head_coach: "Head Coach",
  assistant_coach: "Assistant Coach",
  coordinator: "Coordinator",
  manager: "Manager",
  alumni: "Alumni",
};

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<AppRole | TeamRole, string> = {
  // App roles
  super_admin: "Full system access and administration",
  admin: "Team administration and management",
  coach: "Coaching tools and team management",
  player: "Player features and team participation",
  family: "Family member access and updates",

  // Team roles
  head_coach: "Full team management and administrative access",
  assistant_coach: "Coaching responsibilities and playbook management",
  coordinator: "Specialized coaching role with focused permissions",
  manager: "Team operations and organizational support",
  alumni: "Former team member with limited access",
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if role is a coaching role (any level)
 */
export function isCoachingRole(role: TeamRole): boolean {
  return ["head_coach", "assistant_coach", "coordinator"].includes(role);
}

/**
 * Check if role has management permissions
 */
export function isManagementRole(role: TeamRole): boolean {
  return ["head_coach", "assistant_coach", "manager"].includes(role);
}

/**
 * Check if app role has admin privileges
 */
export function isAdminAppRole(role: AppRole): boolean {
  return ["super_admin", "admin"].includes(role);
}

/**
 * Check if team role can manage other members
 */
export function canManageMembers(role: TeamRole): boolean {
  return role === "head_coach";
}

/**
 * Check if team role can edit playbook
 */
export function canEditPlaybook(role: TeamRole): boolean {
  return ["head_coach", "assistant_coach", "coordinator"].includes(role);
}
