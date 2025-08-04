/**
 * Enhanced Development Mode Hooks
 *
 * Professional React hooks that integrate the new dev profile system
 * while maintaining backward compatibility with existing components.
 *
 * @version 2.0.0
 * @author BoxCall Development Team
 */

import { useContext, useEffect, useState } from "react";
import { useAuthProfile } from "./auth-store";
import { DevModeContext } from "./dev-mode-context";
import { DevProfileService } from "../services/dev-profiles/DevProfileService";
import type { DevMode, DevProfileConfig } from "../types/dev-profiles";
import type { DevMode as LegacyDevMode } from "./dev-mode-types";

// Get the dev profile service instance
const devProfileService = DevProfileService.getInstance();

/**
 * Enhanced useDevMode hook with professional dev profile integration
 */
export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevMode must be used within a DevModeProvider");
  }

  // Enhanced setDevMode that integrates with the new profile system
  const enhancedSetDevMode = async (mode: DevMode) => {
    try {
      // Switch to the new profile
      await devProfileService.switchToProfile(mode);

      // Convert new DevMode to legacy DevMode for backward compatibility
      const legacyMode = convertToLegacyDevMode(mode);
      context.setDevMode(legacyMode);
    } catch (error) {
      console.error("Error switching dev mode:", error);
      // Fallback to legacy behavior
      const legacyMode = convertToLegacyDevMode(mode);
      context.setDevMode(legacyMode);
    }
  };

  return {
    ...context,
    setDevMode: enhancedSetDevMode,
  };
};

/**
 * Convert new DevMode to legacy DevMode for backward compatibility
 */
function convertToLegacyDevMode(mode: DevMode): LegacyDevMode {
  switch (mode) {
    case "dev_head_coach":
      return "view_as_head_coach";
    case "dev_assistant_coach":
      return "view_as_coach";
    case "dev_player":
      return "view_as_player";
    case "dev_super_admin":
      return "super_admin_real";
    case "blank_slate":
      return "blank_slate";
    default:
      return "view_as_coach";
  }
}

/**
 * Hook for accessing the professional dev profile service
 */
export const useDevProfileService = () => {
  return devProfileService;
};

/**
 * Hook for current dev profile state
 */
export const useDevProfileState = () => {
  const [state, setState] = useState(devProfileService.getCurrentState());

  useEffect(() => {
    const listener = {
      onProfileEvent: () => {
        setState(devProfileService.getCurrentState());
      },
    };

    devProfileService.addEventListener(listener);
    return () => devProfileService.removeEventListener(listener);
  }, []);

  return state;
};

/**
 * Hook for current dev profile configuration
 */
export const useDevProfileConfig = (): DevProfileConfig | null => {
  const state = useDevProfileState();
  return state.currentProfile;
};

/**
 * Hook for dev profile permissions
 */
export const useDevProfilePermissions = () => {
  const config = useDevProfileConfig();
  const service = useDevProfileService();

  return {
    permissions: config?.permissions || null,
    validatePermission: (action: string) => service.validatePermission(action),
    hasPermission: (action: string) => service.validatePermission(action),
  };
};

/**
 * Hook to check if user has super admin capabilities (enhanced version)
 */
export const useIsSuperAdmin = () => {
  const { devMode } = useDevMode();
  const profile = useAuthProfile();
  const profileConfig = useDevProfileConfig();

  // Real super admin check
  const isRealSuperAdmin = profile?.role === "admin";

  // Dev profile super admin - check if profileConfig has super admin permissions
  const isDevSuperAdmin = profileConfig?.permissions.systemAdmin === true;

  // Legacy simulated super admin
  const isSimulatedSuperAdmin =
    devMode === "super_admin_real" || devMode === "super_admin_mock";

  return isRealSuperAdmin || isDevSuperAdmin || isSimulatedSuperAdmin;
};

/**
 * Hook to get effective team member role for current context (enhanced)
 */
export const useEffectiveTeamRole = () => {
  const { effectiveUserRole } = useDevMode();
  const profileConfig = useDevProfileConfig();

  // If we have a dev profile, use its primary team membership role
  if (profileConfig?.teamMemberships.length) {
    const primaryMembership =
      profileConfig.teamMemberships.find((m) => m.isPrimary) ||
      profileConfig.teamMemberships[0];
    return primaryMembership.role;
  }

  // Fallback to legacy behavior
  return effectiveUserRole;
};

/**
 * Hook to determine data source and handle both old and new systems
 */
export const useTeamDataSource = () => {
  const { devMode, effectiveTeamData } = useDevMode();
  const profileConfig = useDevProfileConfig();

  // New dev profile system
  if (profileConfig) {
    const dataScope = profileConfig.dataScope;

    return {
      shouldUseMockData: dataScope.dataSource === "legacy_mock",
      shouldUseBlankSlate: dataScope.dataSource === "empty",
      shouldUseDevData: dataScope.dataSource === "dev_realistic",
      mockTeamData: effectiveTeamData,
      dataSource: dataScope.dataSource,
      teamIds: dataScope.teamIds,
      hasAchievements: dataScope.hasAchievements,
      hasCalendarEvents: dataScope.hasCalendarEvents,
      hasTeamActivity: dataScope.hasTeamActivity,
    };
  }

  // Legacy system fallback
  const shouldUseMockData =
    devMode === "super_admin_mock" || devMode.startsWith("view_as_");

  const shouldUseBlankSlate = devMode === "blank_slate";

  return {
    shouldUseMockData,
    shouldUseBlankSlate,
    shouldUseDevData: false,
    mockTeamData: effectiveTeamData,
    dataSource: shouldUseBlankSlate
      ? ("empty" as const)
      : shouldUseMockData
        ? ("legacy_mock" as const)
        : ("user_real" as const),
    teamIds: [],
    hasAchievements: !shouldUseBlankSlate,
    hasCalendarEvents: !shouldUseBlankSlate,
    hasTeamActivity: !shouldUseBlankSlate,
  };
};

/**
 * Hook for getting dev profile data with caching
 */
export const useDevProfileData = <T>(dataType: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = useDevProfileService();
  const state = useDevProfileState();

  useEffect(() => {
    if (!state.currentProfile || !state.isActive) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await service.getProfileData<T>(dataType);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType, state.currentProfile, state.isActive, service]);

  return { data, loading, error };
};
