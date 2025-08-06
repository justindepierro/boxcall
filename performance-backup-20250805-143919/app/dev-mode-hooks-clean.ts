/**
 * Clean Dev Mode Hooks - Phase 3 Implementation
 *
 * Simplified, clean hooks that provide clear data resolution.
 * Removes the confusion around mock data bleeding and unclear naming.
 *
 * @version 3.0.0 - Phase 3 Clean Dev Modes
 * @author BoxCall Development Team
 */

import { useContext, useMemo } from "react";
import { useAuthProfile } from "./auth-store";
import { DevModeContext } from "./dev-mode-context";

/**
 * Enhanced useDevMode hook with clean data resolution
 */
export const useCleanDevMode = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useCleanDevMode must be used within a DevModeProvider");
  }

  const { devMode, setDevMode, isDevMode, effectiveUserRole } = context;

  // Clean data resolution - what data should we load?
  const dataResolution = useMemo(() => {
    switch (devMode) {
      case "production":
        return {
          dataSource: "user_real" as const,
          shouldUseMockData: false,
          shouldUseBlankSlate: false,
          shouldShowDevTools: false,
          description: "Your real Supabase data",
        };

      case "blank_slate":
        return {
          dataSource: "empty" as const,
          shouldUseMockData: false,
          shouldUseBlankSlate: true,
          shouldShowDevTools: true,
          description: "Empty state - new coach experience",
        };

      case "view_as_head_coach":
      case "view_as_coach":
      case "view_as_player":
      case "view_as_manager":
      case "view_as_family":
        return {
          dataSource: "dev_realistic" as const,
          shouldUseMockData: true,
          shouldUseBlankSlate: false,
          shouldShowDevTools: true,
          description: "Professional dev profiles with realistic data",
        };

      case "super_admin_mock":
      case "super_admin_real":
        return {
          dataSource: "legacy_mock" as const,
          shouldUseMockData: true,
          shouldUseBlankSlate: false,
          shouldShowDevTools: true,
          description: "Legacy mock data system",
        };

      default:
        return {
          dataSource: "user_real" as const,
          shouldUseMockData: false,
          shouldUseBlankSlate: false,
          shouldShowDevTools: false,
          description: "Default to real data",
        };
    }
  }, [devMode]);

  return {
    devMode,
    setDevMode,
    isDevMode,
    effectiveUserRole,
    dataResolution,
    // Legacy compatibility
    mockTeamData: context.mockTeamData,
    effectiveTeamData: context.effectiveTeamData,
  };
};

/**
 * Clean hook for super admin detection
 */
export const useIsSuperAdminClean = () => {
  const profile = useAuthProfile();
  const { devMode } = useCleanDevMode();

  // Real super admin (system owner)
  const isRealSuperAdmin = profile?.email === "justindepierro@gmail.com";

  // Dev mode super admin simulation
  const isDevSuperAdmin =
    devMode === "super_admin_real" ||
    devMode === "super_admin_mock" ||
    devMode === "view_as_head_coach"; // Head coaches have admin privileges in dev

  return {
    isRealSuperAdmin,
    isDevSuperAdmin,
    isSuperAdmin: isRealSuperAdmin || isDevSuperAdmin,
    hasSystemOwnerAccess: isRealSuperAdmin, // Only real system owner
  };
};

/**
 * Clean hook for team data sourcing
 */
export const useCleanTeamDataSource = () => {
  const { dataResolution, effectiveTeamData } = useCleanDevMode();

  return {
    dataSource: dataResolution.dataSource,
    shouldUseMockData: dataResolution.shouldUseMockData,
    shouldUseBlankSlate: dataResolution.shouldUseBlankSlate,
    shouldShowDevTools: dataResolution.shouldShowDevTools,
    description: dataResolution.description,
    mockTeamData: effectiveTeamData,

    // Helper functions for components
    getTeamData: () => {
      if (dataResolution.shouldUseBlankSlate) return null;
      if (dataResolution.shouldUseMockData) return effectiveTeamData;
      return null; // Will be loaded from Supabase
    },

    getDataSourceIndicator: () => {
      switch (dataResolution.dataSource) {
        case "user_real":
          return "🌍 Real Database";
        case "dev_realistic":
          return "🎭 Dev Profiles";
        case "empty":
          return "🆕 Empty State";
        case "legacy_mock":
          return "🧪 Legacy Mock";
        default:
          return "❓ Unknown";
      }
    },
  };
};

/**
 * Clean hook for role context
 */
export const useCleanRoleContext = () => {
  const { devMode } = useCleanDevMode();
  const profile = useAuthProfile();

  const roleContext = useMemo(() => {
    // System owner always gets super admin
    if (profile?.email === "justindepierro@gmail.com") {
      return {
        role: "super_admin" as const,
        displayName: "System Owner",
        permissions: "full",
        description: "Unlimited access as system owner",
      };
    }

    // Dev mode role simulation
    switch (devMode) {
      case "view_as_head_coach":
        return {
          role: "head_coach" as const,
          displayName: "Head Coach",
          permissions: "team_full",
          description: "Full team management access",
        };

      case "view_as_coach":
        return {
          role: "assistant_coach" as const,
          displayName: "Assistant Coach",
          permissions: "team_limited",
          description: "Limited coaching access",
        };

      case "view_as_player":
        return {
          role: "player" as const,
          displayName: "Player",
          permissions: "player_only",
          description: "Student athlete access",
        };

      case "view_as_manager":
        return {
          role: "manager" as const,
          displayName: "Team Manager",
          permissions: "administrative",
          description: "Administrative and logistics",
        };

      case "view_as_family":
        return {
          role: "family" as const,
          displayName: "Family Member",
          permissions: "family_portal",
          description: "Parent/guardian portal",
        };

      case "super_admin_real":
      case "super_admin_mock":
        return {
          role: "super_admin" as const,
          displayName: "Super Admin (Dev)",
          permissions: "full",
          description: "Development super admin simulation",
        };

      case "production":
      default:
        return {
          role: profile?.role || "user",
          displayName: "Production User",
          permissions: "user_actual",
          description: "Your real permissions",
        };
    }
  }, [devMode, profile]);

  return roleContext;
};

/**
 * Clean hook for development tools visibility
 */
export const useCleanDevTools = () => {
  const { dataResolution, devMode } = useCleanDevMode();

  return {
    shouldShowDevTools: dataResolution.shouldShowDevTools,
    shouldShowDataIndicator: devMode !== "production",
    shouldShowRoleIndicator: devMode !== "production",
    shouldShowPerformanceTools: dataResolution.shouldShowDevTools,
    isProductionMode: devMode === "production",
  };
};
