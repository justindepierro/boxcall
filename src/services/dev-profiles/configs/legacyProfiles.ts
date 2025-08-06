/**
 * Legacy Profile Configurations
 *
 * Contains legacy "view as" profiles and admin configurations for backward compatibility.
 */

import type { DevProfileConfig } from "../../../types/dev-profiles";
import { DevProfilePermissionService } from "../DevProfilePermissionService";

const permissionService = DevProfilePermissionService.getInstance();

export const legacyProfiles: Record<string, DevProfileConfig> = {
  super_admin_real: {
    id: "super_admin_real",
    email: "",
    fullName: "Super Admin (Real)",
    role: null,
    description: "Legacy super admin with real data",
    permissions: permissionService.getSuperAdminPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "user_real",
      teamIds: [],
      hasAchievements: false,
      hasCalendarEvents: false,
      hasTeamActivity: false,
      achievementCount: 0,
      eventCount: 0,
      activityCount: 0,
    },
  },

  super_admin_mock: {
    id: "super_admin_mock",
    email: "",
    fullName: "Super Admin (Mock)",
    role: null,
    description: "Legacy super admin with mock data",
    permissions: permissionService.getSuperAdminPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "legacy_mock",
      teamIds: ["mock-team-dev"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 10,
      eventCount: 15,
      activityCount: 20,
    },
  },

  view_as_head_coach: {
    id: "view_as_head_coach",
    email: "",
    fullName: "View as Head Coach",
    role: "coach",
    description: "Legacy head coach view",
    permissions: permissionService.getHeadCoachPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "legacy_mock",
      teamIds: ["mock-team-dev"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 12,
      eventCount: 25,
      activityCount: 50,
    },
  },

  view_as_coach: {
    id: "view_as_coach",
    email: "",
    fullName: "View as Coach",
    role: "coach",
    description: "Legacy coach view",
    permissions: permissionService.getAssistantCoachPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "legacy_mock",
      teamIds: ["mock-team-dev"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 8,
      eventCount: 20,
      activityCount: 30,
    },
  },

  view_as_player: {
    id: "view_as_player",
    email: "",
    fullName: "View as Player",
    role: "player",
    description: "Legacy player view",
    permissions: permissionService.getPlayerPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "legacy_mock",
      teamIds: ["mock-team-dev"],
      hasAchievements: true,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 15,
      eventCount: 18,
      activityCount: 40,
    },
  },

  view_as_manager: {
    id: "view_as_manager",
    email: "",
    fullName: "View as Manager",
    role: "coach",
    description: "Legacy manager view",
    permissions: permissionService.getCoachPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "legacy_mock",
      teamIds: ["mock-team-dev"],
      hasAchievements: false,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 0,
      eventCount: 30,
      activityCount: 25,
    },
  },

  view_as_family: {
    id: "view_as_family",
    email: "",
    fullName: "View as Family",
    role: "family",
    description: "Legacy family view",
    permissions: permissionService.getCoachPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "legacy_mock",
      teamIds: ["mock-team-dev"],
      hasAchievements: false,
      hasCalendarEvents: true,
      hasTeamActivity: true,
      achievementCount: 0,
      eventCount: 12,
      activityCount: 15,
    },
  },
};
