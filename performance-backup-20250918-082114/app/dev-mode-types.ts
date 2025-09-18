// Development mode types and utilities
export type DevMode =
  | "production" // Real data, real permissions
  | "blank_slate" // New user experience
  | "test_as_head_coach" // Test head coach permissions
  | "test_as_coach" // Test assistant coach permissions
  | "test_as_player" // Test player experience
  | "test_as_family"; // Test family portal
// Simple dev mode configurations
export const DEV_MODE_CONFIGS = {
  production: {
    label: "🏠 Production",
    description: "Real data, real permissions",
    color: "green",
  },
  blank_slate: {
    label: "📄 Blank Slate",
    description: "New user experience",
    color: "gray",
  },
  test_as_head_coach: {
    label: "👑 Head Coach",
    description: "Test program owner permissions",
    color: "purple",
  },
  test_as_coach: {
    label: "🎯 Coach",
    description: "Test assistant coach permissions",
    color: "blue",
  },
  test_as_player: {
    label: "🏃 Player",
    description: "Test athlete experience",
    color: "green",
  },
  test_as_family: {
    label: "👨‍👩‍👧‍👦 Family",
    description: "Test parent portal",
    color: "pink",
  },
} as const;

// Additional types for data resolution services
export type CleanDevMode = DevMode;
export type DataSource =
  | "user_real"
  | "dev_realistic"
  | "legacy_mock"
  | "empty";

export interface DataResolutionContext {
  dataSource: DataSource;
  permissionLevel: string;
  userId?: string;
  email?: string;
}

export interface PermissionContext {
  devMode: DevMode;
  userId: string;
  email?: string;
  permissionLevel: string;
}
