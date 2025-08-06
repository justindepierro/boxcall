/**
 * Development Role Profile Configurations
 *
 * Contains realistic test profiles for different user roles with full data.
 */

import type { DevProfileConfig } from "../../../types/dev-profiles";
import { DevProfilePermissionService } from "../DevProfilePermissionService";

const permissionService = DevProfilePermissionService.getInstance();

export const devRoleProfiles: Record<string, DevProfileConfig> = {
  dev_head_coach: {
    id: "dev_head_coach",
    email: "dev_head_coach@boxcall.dev",
    fullName: "Coach Mike Thompson",
    role: "coach",
    description: "Head coach with full team access",
    permissions: permissionService.getHeadCoachPermissions(),
    teamMemberships: [
      {
        teamId: "dev-team-varsity",
        teamName: "BoxCall Development Varsity",
        role: "coach",
        permissions: null,
        joinedAt: "2024-08-01T00:00:00Z",
        isPrimary: true,
      },
    ],
    dataScope: {
      dataSource: "dev_realistic",
      teamIds: ["dev-team-varsity"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 12,
      eventCount: 25,
      activityCount: 50,
    },
  },

  dev_assistant_coach: {
    id: "dev_assistant_coach",
    email: "dev_assistant_coach@boxcall.dev",
    fullName: "Coach Sarah Rodriguez",
    role: "coach",
    description: "Assistant coach with limited access",
    permissions: permissionService.getAssistantCoachPermissions(),
    teamMemberships: [
      {
        teamId: "dev-team-varsity",
        teamName: "BoxCall Development Varsity",
        role: "coach",
        permissions: { canManagePlaybook: false, canManageRoster: false },
        joinedAt: "2024-08-15T00:00:00Z",
        isPrimary: true,
      },
    ],
    dataScope: {
      dataSource: "dev_realistic",
      teamIds: ["dev-team-varsity"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 8,
      eventCount: 20,
      activityCount: 30,
    },
  },

  dev_player: {
    id: "dev_player",
    email: "dev_player@boxcall.dev",
    fullName: "Jake Williams",
    role: "player",
    description: "Player #15, Quarterback, Junior",
    permissions: permissionService.getPlayerPermissions(),
    teamMemberships: [
      {
        teamId: "dev-team-varsity",
        teamName: "BoxCall Development Varsity",
        role: "player",
        permissions: null,
        joinedAt: "2024-07-01T00:00:00Z",
        isPrimary: true,
      },
    ],
    dataScope: {
      dataSource: "dev_realistic",
      teamIds: ["dev-team-varsity"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 15,
      eventCount: 18,
      activityCount: 40,
    },
  },

  dev_super_admin: {
    id: "dev_super_admin",
    email: "dev_super_admin@boxcall.dev",
    fullName: "System Administrator",
    role: "admin",
    description: "System admin with all access",
    permissions: permissionService.getSuperAdminPermissions(),
    teamMemberships: [
      {
        teamId: "dev-team-varsity",
        teamName: "BoxCall Development Varsity",
        role: "coach",
        permissions: null,
        joinedAt: "2024-01-01T00:00:00Z",
        isPrimary: true,
      },
      {
        teamId: "dev-team-jv",
        teamName: "BoxCall Development JV",
        role: "coach",
        permissions: null,
        joinedAt: "2024-01-01T00:00:00Z",
        isPrimary: false,
      },
    ],
    dataScope: {
      dataSource: "dev_realistic",
      teamIds: ["dev-team-varsity", "dev-team-jv"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 25,
      eventCount: 50,
      activityCount: 100,
    },
  },
};
