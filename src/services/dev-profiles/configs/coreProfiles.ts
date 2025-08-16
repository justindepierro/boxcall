/**
 * Core Development Profile Configurations
 *
 * Contains production and blank slate profiles for real development work.
 */

import { DevProfilePermissionService } from "../DevProfilePermissionService";

import type { DevProfileConfig } from "../../../types/dev-profiles";

const permissionService = DevProfilePermissionService.getInstance();

export const coreProfiles: Record<string, DevProfileConfig> = {
  production: {
    id: "production",
    email: "",
    fullName: "Production User",
    role: null,
    description: "Real user data",
    permissions: permissionService.getProductionPermissions(),
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

  blank_slate: {
    id: "blank_slate",
    email: "dev_blank_slate@boxcall.dev",
    fullName: "New Coach",
    role: "coach",
    description: "Empty state for new user testing",
    permissions: permissionService.getCoachPermissions(),
    teamMemberships: [],
    dataScope: {
      dataSource: "empty",
      teamIds: [],
      hasAchievements: false,
      hasCalendarEvents: false,
      hasTeamActivity: false,
      achievementCount: 0,
      eventCount: 0,
      activityCount: 0,
    },
  },

  real_world_dev: {
    id: "real_world_dev",
    email: "",
    fullName: "Real World Dev User",
    role: null,
    description: "Real user data with dev tools",
    permissions: permissionService.getProductionPermissions(),
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
};
