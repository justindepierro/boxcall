/**
 * Master Data Resolution Hook - Phase 4 Implementation
 *
 * Central hook that all components use to get clean, resolved data.
 * Replaces scattered data loading logic throughout the app.
 *
 * Key principles:
 * - Single source of truth for all data loading
 * - Automatic dev mode context resolution
 * - Clean separation between real and mock data
 * - Super admin support for justindepierro@gmail.com
 *
 * @version 4.0.0 - Phase 4 Data Resolution Service Integration
 * @author BoxCall Development Team
 */

import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../app/auth-store";
import { useDevMode } from "../app/dev-mode-hooks";
// TODO: Re-enable when DataResolutionService is fixed
// import { DataResolutionService } from "../services/DataResolutionService";

// Basic interfaces for resolved data (expanded from database types)
export interface UserProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface TeamData {
  id: string;
  name: string;
  description?: string;
  team_code?: string;
  subscription_tier?: string;
  season?: string;
  school?: string;
  mascot?: string;
  [key: string]: unknown;
}

export interface AchievementData {
  id: string;
  title: string;
  description?: string;
  type?: string;
  date: string;
  team_id?: string;
  [key: string]: unknown;
}

export interface CalendarEventData {
  id: string;
  title: string;
  type: string;
  date: string;
  time?: string;
  location?: string;
  team_id?: string;
  [key: string]: unknown;
}

interface ResolvedData {
  userProfile: UserProfileData | null;
  teams: TeamData[];
  achievements: AchievementData[];
  calendarEvents: CalendarEventData[];
  isLoading: boolean;
  error: string | null;
  context: { dataSource?: string } | null;
}

/**
 * Master hook for data resolution
 * Replaces all individual data loading patterns
 */
export const useDataResolution = () => {
  const { user } = useAuth();
  const { devMode } = useDevMode();
  const [resolvedData, setResolvedData] = useState<ResolvedData>({
    userProfile: null,
    teams: [],
    achievements: [],
    calendarEvents: [],
    isLoading: true,
    error: null,
    context: null,
  });

  // TODO: Re-enable when DataResolutionService is fixed
  // const dataService = DataResolutionService.getInstance();

  const loadData = useCallback(async () => {
    if (!user?.id || !devMode) {
      setResolvedData((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setResolvedData((prev) => ({ ...prev, isLoading: true, error: null }));

      // TODO: Fix DataResolutionService integration
      // For now, return empty data to get app running
      const mockContext = {
        dataSource: devMode === "production" ? "user_real" : "dev_realistic",
      };

      setResolvedData({
        userProfile: null,
        teams: [],
        achievements: [],
        calendarEvents: [],
        isLoading: false,
        error: null,
        context: mockContext,
      });

      console.log("✅ Data Resolution: Using temporary mock data", {
        devMode,
        dataSource: mockContext.dataSource,
      });
    } catch (error) {
      console.error("❌ Data Resolution: Error loading data", error);
      setResolvedData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load data",
      }));
    }
  }, [user?.id, devMode]);

  // Load data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh function for manual reloading
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    ...resolvedData,
    refresh,
    // Helper functions for common checks
    isSystemOwner: user?.email === "justindepierro@gmail.com",
    hasTeams: (resolvedData.teams?.length || 0) > 0,
    isRealData: resolvedData.context?.dataSource === "user_real",
    isDevData: resolvedData.context?.dataSource === "dev_realistic",
    isMockData: resolvedData.context?.dataSource === "legacy_mock",
    isEmptyState: resolvedData.context?.dataSource === "empty",
  };
};

/**
 * Specialized hook for dashboard data
 * Provides dashboard-specific data formatting
 */
export const useDashboardData = () => {
  const resolution = useDataResolution();

  const dashboardData = {
    ...resolution,
    // Dashboard-specific computed properties
    userTeams:
      resolution.teams?.map((team) => ({
        team,
        membership: { role: "head_coach" }, // TODO: Get real membership
        memberCount: 25, // TODO: Get real member count
      })) || [],
    totalTeams: resolution.teams?.length || 0,
    activeTeams: resolution.teams || [],
    recentActivity:
      resolution.achievements?.slice(0, 3).map((achievement) => ({
        id: achievement.id,
        type: "achievement" as const,
        title: achievement.title,
        description: achievement.description,
        timestamp: achievement.date,
        teamId: resolution.teams?.[0]?.id,
        teamName: resolution.teams?.[0]?.name,
        icon: "award" as const,
        color: "jade" as const,
      })) || [],
  };

  return dashboardData;
};

/**
 * Specialized hook for team data
 * Provides team-specific data formatting
 */
export const useTeamData = (teamId?: string) => {
  const resolution = useDataResolution();

  const team = teamId
    ? resolution.teams?.find((t) => t.id === teamId)
    : resolution.teams?.[0];

  const teamAchievements =
    resolution.achievements?.filter(
      (achievement) => !teamId || achievement.team_id === teamId
    ) || [];

  const teamEvents =
    resolution.calendarEvents?.filter(
      (event) => !teamId || event.team_id === teamId
    ) || [];

  return {
    ...resolution,
    team,
    achievements: teamAchievements,
    events: teamEvents,
    hasTeam: !!team,
  };
};

/**
 * Specialized hook for user profile data
 * Provides user-specific data formatting
 */
export const useUserProfileData = () => {
  const resolution = useDataResolution();

  return {
    ...resolution,
    profile: resolution.userProfile,
    hasProfile: !!resolution.userProfile,
    isComplete: !!(
      resolution.userProfile?.first_name &&
      resolution.userProfile?.last_name &&
      resolution.userProfile?.email
    ),
  };
};

export default useDataResolution;
