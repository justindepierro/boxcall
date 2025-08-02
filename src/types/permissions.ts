/**
 * BoxCall Permission System
 * 
 * Defines the hierarchical access control system for BoxCall.
 * Handles both app-level subscriptions and team-level roles.
 */

// App-Level User Types (Subscription-based)
export type AppUserType = 
  | 'super_admin'    // Full system access (developers)
  | 'admin'          // Additional devs/testers (GMs)
  | 'head_coach'     // $199 subscription + team management
  | 'coach'          // $9.99 one-time + playbook tools
  | 'player'         // Free tier
  | 'family';        // Free tier with limited access

// Team-Level Roles (Within a specific team)
export type TeamRole = 
  | 'head_coach'     // Team owner, full team control
  | 'coach'          // Assistant coaches
  | 'manager'        // Limited admin (stats, scheduling, practice)
  | 'player'         // Team members
  | 'family';        // Parent/guardian view

// Subscription Tiers
export type SubscriptionTier = 
  | 'free'           // Players, Family
  | 'coach_tools'    // $9.99 - Playbook maker
  | 'team_premium'   // $199 - Head Coach with team
  | 'staff_addon';   // $8 each (5 for $40) - Additional coaching staff

// Permission Categories
export type PermissionCategory = 
  | 'system_admin'       // Super admin/Admin only
  | 'team_management'    // Head coaches
  | 'playbook_tools'     // Coaches and above
  | 'team_dashboard'     // Team members
  | 'family_view';       // Limited family access

// Specific Permissions
export type Permission = 
  // System Administration
  | 'system.full_access'
  | 'system.user_management'
  | 'system.team_oversight'
  
  // Team Management (Head Coach)
  | 'team.create'
  | 'team.delete'
  | 'team.settings'
  | 'team.roster_management'
  | 'team.invite_coaches'
  | 'team.subscription_management'
  | 'team.family_permissions'
  
  // Playbook & Strategy Tools
  | 'playbook.create'
  | 'playbook.edit'
  | 'playbook.export_pdf'
  | 'playbook.practice_mode'
  | 'playbook.share_team'
  
  // Team Dashboard Access
  | 'dashboard.view_team'
  | 'dashboard.view_roster'
  | 'dashboard.view_schedule'
  | 'dashboard.view_playbooks'
  
  // Manager Permissions
  | 'stats.live_game'
  | 'practice.scripts'
  | 'practice.mode'
  | 'schedule.manage'
  
  // Family Permissions (Configurable by Head Coach)
  | 'family.view_calendar'
  | 'family.rsvp_events'
  | 'family.fundraising'
  | 'family.limited_dashboard';

// Permission Matrix
export interface PermissionMatrix {
  [key: string]: {
    appUserType: AppUserType;
    teamRole?: TeamRole;
    subscriptionTier: SubscriptionTier;
    permissions: Permission[];
    description: string;
  };
}

// Default Permission Mapping
export const PERMISSION_MATRIX: PermissionMatrix = {
  // Super Admin - Full System Access
  super_admin: {
    appUserType: 'super_admin',
    subscriptionTier: 'free', // No subscription needed
    permissions: [
      'system.full_access',
      'system.user_management',
      'system.team_oversight',
      'team.create',
      'team.delete',
      'team.settings',
      'team.roster_management',
      'team.invite_coaches',
      'team.subscription_management',
      'team.family_permissions',
      'playbook.create',
      'playbook.edit',
      'playbook.export_pdf',
      'playbook.practice_mode',
      'playbook.share_team',
      'dashboard.view_team',
      'dashboard.view_roster',
      'dashboard.view_schedule',
      'dashboard.view_playbooks',
      'stats.live_game',
      'practice.scripts',
      'practice.mode',
      'schedule.manage',
      'family.view_calendar',
      'family.rsvp_events',
      'family.fundraising',
      'family.limited_dashboard'
    ],
    description: 'Full system access for developers'
  },

  // Admin - Testing/GM Access
  admin: {
    appUserType: 'admin',
    subscriptionTier: 'free',
    permissions: [
      'system.user_management',
      'system.team_oversight',
      'team.create',
      'team.settings',
      'team.roster_management',
      'playbook.create',
      'playbook.edit',
      'playbook.export_pdf',
      'playbook.practice_mode',
      'playbook.share_team',
      'dashboard.view_team',
      'dashboard.view_roster',
      'dashboard.view_schedule',
      'dashboard.view_playbooks'
    ],
    description: 'Testing access for additional developers and smart friends'
  },

  // Head Coach - Team Owner ($199 subscription)
  head_coach_team_owner: {
    appUserType: 'head_coach',
    teamRole: 'head_coach',
    subscriptionTier: 'team_premium',
    permissions: [
      'team.create',
      'team.settings',
      'team.roster_management',
      'team.invite_coaches',
      'team.subscription_management',
      'team.family_permissions',
      'playbook.create',
      'playbook.edit',
      'playbook.export_pdf',
      'playbook.practice_mode',
      'playbook.share_team',
      'dashboard.view_team',
      'dashboard.view_roster',
      'dashboard.view_schedule',
      'dashboard.view_playbooks',
      'stats.live_game',
      'practice.scripts',
      'practice.mode',
      'schedule.manage'
    ],
    description: 'Team owner with full team management and playbook tools'
  },

  // Coach - Staff Member (Staff addon or individual subscription)
  coach_team_staff: {
    appUserType: 'coach',
    teamRole: 'coach',
    subscriptionTier: 'staff_addon',
    permissions: [
      'playbook.create',
      'playbook.edit',
      'playbook.export_pdf',
      'playbook.practice_mode',
      'playbook.share_team',
      'dashboard.view_team',
      'dashboard.view_roster',
      'dashboard.view_schedule',
      'dashboard.view_playbooks',
      'stats.live_game',
      'practice.scripts',
      'practice.mode'
    ],
    description: 'Coaching staff with playbook and team access'
  },

  // Independent Coach - Playbook Tools Only ($9.99)
  coach_independent: {
    appUserType: 'coach',
    subscriptionTier: 'coach_tools',
    permissions: [
      'playbook.create',
      'playbook.edit',
      'playbook.export_pdf',
      'playbook.practice_mode'
    ],
    description: 'Independent coach with playbook maker tools'
  },

  // Manager - Team Helper
  manager: {
    appUserType: 'player', // App-level is still player/free
    teamRole: 'manager',
    subscriptionTier: 'free',
    permissions: [
      'dashboard.view_team',
      'dashboard.view_roster',
      'dashboard.view_schedule',
      'stats.live_game',
      'practice.scripts',
      'practice.mode',
      'schedule.manage'
    ],
    description: 'Team manager with limited admin access'
  },

  // Player - Team Member
  player: {
    appUserType: 'player',
    teamRole: 'player',
    subscriptionTier: 'free',
    permissions: [
      'dashboard.view_team',
      'dashboard.view_roster',
      'dashboard.view_schedule',
      'dashboard.view_playbooks'
    ],
    description: 'Team player with dashboard access'
  },

  // Family - Parent/Guardian View
  family: {
    appUserType: 'family',
    teamRole: 'family',
    subscriptionTier: 'free',
    permissions: [
      'family.view_calendar',
      'family.rsvp_events',
      'family.fundraising',
      'family.limited_dashboard'
    ],
    description: 'Parent/guardian with limited team access'
  }
};

// Helper Functions
export function hasPermission(
  userType: AppUserType,
  teamRole: TeamRole | undefined,
  subscription: SubscriptionTier,
  requiredPermission: Permission
): boolean {
  // Super admin always has access
  if (userType === 'super_admin') return true;

  // Find matching permission profile
  for (const profile of Object.values(PERMISSION_MATRIX)) {
    if (
      profile.appUserType === userType &&
      (profile.teamRole === undefined || profile.teamRole === teamRole) &&
      profile.subscriptionTier === subscription
    ) {
      return profile.permissions.includes(requiredPermission);
    }
  }

  return false;
}

export function getUserPermissions(
  userType: AppUserType,
  teamRole: TeamRole | undefined,
  subscription: SubscriptionTier
): Permission[] {
  // Super admin gets all permissions
  if (userType === 'super_admin') {
    return PERMISSION_MATRIX.super_admin.permissions;
  }

  // Find matching permission profile
  for (const profile of Object.values(PERMISSION_MATRIX)) {
    if (
      profile.appUserType === userType &&
      (profile.teamRole === undefined || profile.teamRole === teamRole) &&
      profile.subscriptionTier === subscription
    ) {
      return profile.permissions;
    }
  }

  return [];
}

export function canAccessTeamFeature(
  userType: AppUserType,
  teamRole: TeamRole | undefined,
  subscription: SubscriptionTier,
  feature: 'management' | 'dashboard' | 'playbooks' | 'family_view'
): boolean {
  switch (feature) {
    case 'management':
      return hasPermission(userType, teamRole, subscription, 'team.settings');
    case 'dashboard':
      return hasPermission(userType, teamRole, subscription, 'dashboard.view_team');
    case 'playbooks':
      return hasPermission(userType, teamRole, subscription, 'playbook.create');
    case 'family_view':
      return hasPermission(userType, teamRole, subscription, 'family.limited_dashboard');
    default:
      return false;
  }
}
