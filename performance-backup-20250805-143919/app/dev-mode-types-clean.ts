/**
 * Clean Development Mode Types - Phase 3 Implementation
 *
 * Simplified dev mode system with clear separation of concerns:
 * - What data you see (production vs dev data)
 * - What role you're testing (permissions)
 * - What UI mode you're in (dev tools vs production)
 *
 * @version 3.0.0 - Phase 3 Clean Dev Modes
 * @author BoxCall Development Team
 */

/**
 * Clean development mode types - no more confusion!
 */
export type CleanDevMode =
  // Production modes
  | "production" // Real data, real permissions, production UI
  | "production_with_devtools" // Real data, real permissions, dev tools enabled

  // Development modes - use realistic dev data
  | "dev_head_coach" // Dev data + head coach permissions
  | "dev_assistant_coach" // Dev data + assistant coach permissions
  | "dev_player" // Dev data + player permissions
  | "dev_manager" // Dev data + manager permissions
  | "dev_family" // Dev data + family permissions
  | "dev_super_admin" // Dev data + super admin permissions

  // Special testing modes
  | "blank_slate" // Empty state - new user experience
  | "legacy_mock"; // Old mock system for backward compatibility

/**
 * Data source configuration - what data to load
 */
export type DataSource =
  | "user_real" // User's actual Supabase data
  | "dev_realistic" // Professional dev profiles with realistic data
  | "empty" // Blank slate - no data
  | "legacy_mock"; // Old mock data system

/**
 * Permission context - what the user can do
 */
export type PermissionContext =
  | "user_actual" // User's real permissions from auth
  | "super_admin" // Full system permissions (you as system owner)
  | "head_coach" // Full team management permissions
  | "assistant_coach" // Limited coaching permissions
  | "player" // Player-specific permissions
  | "manager" // Administrative permissions
  | "family" // Family portal permissions
  | "viewer"; // Read-only permissions

/**
 * UI mode - what development tools are shown
 */
export type UIMode =
  | "production" // Production UI - no dev tools
  | "development"; // Development UI - dev tools enabled

/**
 * Complete dev mode configuration
 */
export interface DevModeConfig {
  mode: CleanDevMode;
  dataSource: DataSource;
  permissionContext: PermissionContext;
  uiMode: UIMode;
  displayName: string;
  description: string;
  category: "Production" | "Development" | "Testing";
}

/**
 * Dev mode configurations - maps clean modes to their settings
 */
export const DEV_MODE_CONFIGS: Record<CleanDevMode, DevModeConfig> = {
  // Production modes
  production: {
    mode: "production",
    dataSource: "user_real",
    permissionContext: "user_actual",
    uiMode: "production",
    displayName: "🌍 Production",
    description: "Your real data and permissions",
    category: "Production",
  },

  production_with_devtools: {
    mode: "production_with_devtools",
    dataSource: "user_real",
    permissionContext: "user_actual",
    uiMode: "development",
    displayName: "🌍 Production + Dev Tools",
    description: "Your real data with development tools",
    category: "Production",
  },

  // Development modes
  dev_head_coach: {
    mode: "dev_head_coach",
    dataSource: "dev_realistic",
    permissionContext: "head_coach",
    uiMode: "development",
    displayName: "[Trophy/Achievement] Head Coach",
    description: "Professional head coach with full access",
    category: "Development",
  },

  dev_assistant_coach: {
    mode: "dev_assistant_coach",
    dataSource: "dev_realistic",
    permissionContext: "assistant_coach",
    uiMode: "development",
    displayName: "👨‍🏫 Assistant Coach",
    description: "Professional assistant coach with limited access",
    category: "Development",
  },

  dev_player: {
    mode: "dev_player",
    dataSource: "dev_realistic",
    permissionContext: "player",
    uiMode: "development",
    displayName: "🏃‍♂️ Player",
    description: "Student athlete perspective",
    category: "Development",
  },

  dev_manager: {
    mode: "dev_manager",
    dataSource: "dev_realistic",
    permissionContext: "manager",
    uiMode: "development",
    displayName: "[Clipboard/List] Team Manager",
    description: "Administrative and logistics role",
    category: "Development",
  },

  dev_family: {
    mode: "dev_family",
    dataSource: "dev_realistic",
    permissionContext: "family",
    uiMode: "development",
    displayName: "👨‍👩‍👧‍👦 Family Member",
    description: "Parent/guardian portal access",
    category: "Development",
  },

  dev_super_admin: {
    mode: "dev_super_admin",
    dataSource: "dev_realistic",
    permissionContext: "super_admin",
    uiMode: "development",
    displayName: "[Crown/Leadership] System Admin",
    description: "Full system administration access",
    category: "Development",
  },

  // Testing modes
  blank_slate: {
    mode: "blank_slate",
    dataSource: "empty",
    permissionContext: "user_actual",
    uiMode: "development",
    displayName: "🆕 Blank Slate",
    description: "New coach experience - no data",
    category: "Testing",
  },

  legacy_mock: {
    mode: "legacy_mock",
    dataSource: "legacy_mock",
    permissionContext: "super_admin",
    uiMode: "development",
    displayName: "🧪 Legacy Mock Data",
    description: "Original mock system (backward compatibility)",
    category: "Testing",
  },
};

/**
 * Data resolution context - tells services what data to load
 */
export interface DataResolutionContext {
  dataSource: DataSource;
  permissionContext: PermissionContext;
  uiMode: UIMode;
  userId?: string;
  teamIds?: string[];
  shouldShowDevTools: boolean;
  shouldUseMockData: boolean;
  shouldUseBlankSlate: boolean;
}

/**
 * Legacy dev mode type for backward compatibility
 * TODO: Remove once all components are migrated to clean system
 */
export type LegacyDevMode =
  | "production"
  | "blank_slate"
  | "super_admin_real"
  | "super_admin_mock"
  | "view_as_head_coach"
  | "view_as_coach"
  | "view_as_player"
  | "view_as_manager"
  | "view_as_family";

/**
 * Convert clean dev mode to legacy dev mode for backward compatibility
 */
export function toLegacyDevMode(cleanMode: CleanDevMode): LegacyDevMode {
  switch (cleanMode) {
    case "production":
    case "production_with_devtools":
      return "production";
    case "dev_head_coach":
      return "view_as_head_coach";
    case "dev_assistant_coach":
      return "view_as_coach";
    case "dev_player":
      return "view_as_player";
    case "dev_manager":
      return "view_as_manager";
    case "dev_family":
      return "view_as_family";
    case "dev_super_admin":
      return "super_admin_real";
    case "blank_slate":
      return "blank_slate";
    case "legacy_mock":
      return "super_admin_mock";
    default:
      return "production";
  }
}

/**
 * Convert legacy dev mode to clean dev mode
 */
export function fromLegacyDevMode(legacyMode: LegacyDevMode): CleanDevMode {
  switch (legacyMode) {
    case "production":
      return "production";
    case "view_as_head_coach":
      return "dev_head_coach";
    case "view_as_coach":
      return "dev_assistant_coach";
    case "view_as_player":
      return "dev_player";
    case "view_as_manager":
      return "dev_manager";
    case "view_as_family":
      return "dev_family";
    case "super_admin_real":
      return "dev_super_admin";
    case "super_admin_mock":
      return "legacy_mock";
    case "blank_slate":
      return "blank_slate";
    default:
      return "production";
  }
}
