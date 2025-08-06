/**
 * Real World Data Integration Hooks
 *
 * These hooks provide seamless integration between your real team data
 * and the professional dev profile system for comprehensive testing.
 *
 * @version 1.0.0
 * @author BoxCall Development Team
 */

import { useAuth } from "./auth-store";
import { useDevMode, useDevProfileConfig } from "./dev-mode-hooks-enhanced";
import type { DevProfileConfig } from "../types/dev-profiles";

/**
 * Hook to determine the current data context and source
 */
export const useDataContext = () => {
  const { devMode } = useDevMode();
  const { user, profile } = useAuth();
  const profileConfig = useDevProfileConfig();

  // Real world data modes
  const isRealWorldMode = devMode === "production";
  const isBlankSlate = devMode === "blank_slate";
  const isProfessionalDevProfile =
    profileConfig && profileConfig.dataScope.dataSource === "dev_realistic";

  return {
    // Data Source Flags
    useRealData: isRealWorldMode,
    useBlankSlate: isBlankSlate,
    useProfessionalDevData: isProfessionalDevProfile,
    useLegacyMockData:
      !isRealWorldMode && !isBlankSlate && !isProfessionalDevProfile,

    // Context Information
    dataSource: isRealWorldMode
      ? ("real_user_data" as const)
      : isBlankSlate
        ? ("empty" as const)
        : isProfessionalDevProfile
          ? ("professional_dev" as const)
          : ("legacy_mock" as const),

    // User Context
    currentUserId: user?.id,
    currentUserProfile: profile,
    isDevModeActive: devMode !== "production",

    // Professional Dev Profile Context
    devProfileConfig: profileConfig,

    // Team Context
    shouldShowDevTools: devMode !== "production",
    shouldUseCaching: isRealWorldMode || isProfessionalDevProfile,

    // Development Context
    isProduction: devMode === "production",
  };
};

/**
 * Hook for smart data fetching based on current context
 */
export const useSmartDataSource = <T>(dataType: string) => {
  const context = useDataContext();

  const getDataSource = (): Promise<T | null> => {
    if (context.useRealData) {
      // Fetch from real user data (Supabase with user's actual teams)
      return fetchRealUserData<T>(dataType, context.currentUserId);
    }

    if (context.useProfessionalDevData && context.devProfileConfig) {
      // Fetch from professional dev profile system
      return fetchProfessionalDevData<T>(dataType, context.devProfileConfig);
    }

    if (context.useBlankSlate) {
      // Return empty/minimal data for new user experience
      return Promise.resolve(null);
    }

    // Fallback to legacy mock data
    return fetchLegacyMockData<T>(dataType);
  };

  return {
    getDataSource,
    context,
    shouldCache: context.shouldUseCaching,
    dataSourceType: context.dataSource,
  };
};

/**
 * Hook for team-specific data context
 */
export const useTeamDataContext = () => {
  const context = useDataContext();

  return {
    ...context,

    // Team-specific context
    getTeamIds: () => {
      if (context.useRealData && context.currentUserProfile) {
        // Return user's actual team IDs
        return getUserTeamIds(context.currentUserProfile.id);
      }

      if (context.useProfessionalDevData && context.devProfileConfig) {
        // Return dev profile team IDs
        return context.devProfileConfig.dataScope.teamIds;
      }

      if (context.useBlankSlate) {
        // No teams for blank slate
        return [];
      }

      // Legacy mock team IDs
      return getLegacyMockTeamIds();
    },

    // Team permissions based on context
    getTeamPermissions: (teamId: string) => {
      if (context.useRealData) {
        return getRealUserTeamPermissions(context.currentUserId, teamId);
      }

      if (context.useProfessionalDevData && context.devProfileConfig) {
        const membership = context.devProfileConfig.teamMemberships.find(
          (m: { teamId: string }) => m.teamId === teamId
        );
        return membership?.permissions || null;
      }

      return null;
    },

    // Development helpers
    isDevelopmentMode: context.isDevModeActive,
    canUseMockData: !context.useRealData,
    shouldShowDebugInfo: context.shouldShowDevTools,
  };
};

/**
 * Hook for achievements with smart data source
 */
export const useSmartAchievements = () => {
  const { getDataSource, context } =
    useSmartDataSource<Achievement[]>("achievements");

  return {
    getAchievements: getDataSource,
    hasAchievements: !context.useBlankSlate,
    achievementSource: context.dataSource,
    shouldShowPlaceholder: context.useBlankSlate,
  };
};

/**
 * Hook for calendar events with smart data source
 */
export const useSmartCalendar = () => {
  const { getDataSource, context } =
    useSmartDataSource<CalendarEvent[]>("calendar");

  return {
    getCalendarEvents: getDataSource,
    hasEvents: !context.useBlankSlate,
    eventSource: context.dataSource,
    shouldShowEmptyState: context.useBlankSlate,
  };
};

/**
 * Hook for dashboard data with smart source routing
 */
export const useSmartDashboard = () => {
  const context = useDataContext();

  return {
    getDashboardData: async () => {
      if (context.useRealData) {
        return fetchRealDashboardData(context.currentUserId);
      }

      if (context.useProfessionalDevData) {
        return fetchProfessionalDevDashboardData(context.devProfileConfig);
      }

      if (context.useBlankSlate) {
        return getBlankSlateDashboardData();
      }

      return fetchLegacyMockDashboardData();
    },

    shouldShowOnboarding: context.useBlankSlate,
    shouldShowDevMetrics: context.isDevModeActive,
    dashboardType: context.dataSource,
  };
};

// Helper functions for data fetching
async function fetchRealUserData<T>(
  dataType: string,
  userId: string | undefined
): Promise<T | null> {
  if (!userId) return null;

  // Implement real Supabase data fetching
  console.log(`Fetching real ${dataType} data for user ${userId}`);
  // TODO: Implement actual Supabase queries
  return null;
}

async function fetchProfessionalDevData<T>(
  dataType: string,
  config: DevProfileConfig
): Promise<T | null> {
  // Fetch from professional dev profile system
  console.log(`Fetching professional dev ${dataType} data`, config);
  // TODO: Implement dev profile data fetching
  return null;
}

async function fetchLegacyMockData<T>(dataType: string): Promise<T | null> {
  // Fetch from existing mock data system
  console.log(`Fetching legacy mock ${dataType} data`);
  // TODO: Use existing mock data services
  return null;
}

function getUserTeamIds(userId: string): string[] {
  // Get user's actual team IDs from Supabase
  console.log(`Getting team IDs for user ${userId}`);
  return [];
}

function getRealUserTeamPermissions(
  userId: string | undefined,
  teamId: string
) {
  // Get real user permissions for team
  console.log(`Getting permissions for user ${userId} in team ${teamId}`);
  return null;
}

function getLegacyMockTeamIds(): string[] {
  // Return legacy mock team IDs
  return ["mock-team-1"];
}

async function fetchRealDashboardData(userId: string | undefined) {
  console.log(`Fetching real dashboard data for user ${userId}`);
  return null;
}

async function fetchProfessionalDevDashboardData(
  config: DevProfileConfig | null
) {
  console.log(`Fetching professional dev dashboard data`, config);
  return null;
}

function getBlankSlateDashboardData() {
  return {
    teams: [],
    achievements: [],
    upcomingEvents: [],
    recentActivity: [],
    onboardingStep: 1,
  };
}

async function fetchLegacyMockDashboardData() {
  console.log(`Fetching legacy mock dashboard data`);
  return null;
}

// Type definitions
interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: "practice" | "game" | "meeting";
}
