/**
 * BoxCall Phase 4.3 React Native Services
 * Advanced Features & Integration Export Index
 */
export { default as ReactNativePlatformService } from "./ReactNativePlatformService";
export type {
  NativeAppState,
  RealTimeSubscription,
  CrossPlatformSyncConfig,
} from "./ReactNativePlatformService";
export {
  RealTimeService,
  TeamManagementService,
  CoachingAnalyticsService,
} from "./ReactNativePlatformService";
// Re-export Phase 4.3 types for convenience
export type {
  CalendarEvent,
  TeamUpdate,
  UserState,
  GameUpdate,
  PerformanceMetrics,
  EngagementMetrics,
  CoachingInsights,
  CoachDashboard,
  PlayerDashboard,
  FamilyDashboard,
  UserRole,
  ReactNativeConfig,
  PlatformCapabilities,
} from "../../types/phase4-3";
