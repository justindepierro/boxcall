/**
 * Mobile Services Index - Clean Export Module
 * 
 * Professional barrel exports for all mobile optimization services.
 * Provides clean API surface with proper type exports.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

// ============================================================================
// CORE MOBILE SERVICES
// ============================================================================

// Core Mobile Services
export { MobileCalendarService } from "./MobileCalendarService";
export { MobilePerformanceService } from "./MobilePerformanceService";
export { MobileUIService } from "./MobileUIService";

// Mobile Orchestrator - New Modular Architecture
export { 
  MobileOrchestrator,
  createOptimalMobileConfig,
  getMobileCapabilities,
  type MobileAppState,
  type MobileInitializationConfig,
} from "./MobileOrchestrator";

// Mobile Orchestration Services (Modular Architecture)
export {
  MobileStateManager,
  MobileInitializationService,
  ReactNativeIntegrationService,
  MobileEventHandlers,
  MobilePerformanceMonitor,
  createMobileConfig,
  checkMobileCapabilities,
  getOptimalPerformanceProfile,
  isLowEndDevice,
  isTabletDevice,
  isHighEndDevice,
} from "./orchestration";

// Mobile Optimization Services (Modular Architecture)
export {
  BatteryOptimizationService,
  MemoryOptimizationService,
  NetworkOptimizationService,
  RenderingOptimizationService,
  getPerformanceProfile,
  getAllPerformanceProfiles,
  getOptimalProfile,
} from "./optimizations";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Mobile Calendar Types
export type {
  MobileCalendarState,
  MobileCalendarView,
  MobileEvent,
  MobilePerformanceMetrics,
  MobileRenderConfig,
  SwipeAction,
  TouchGesture,
  TouchTarget,
} from "./MobileCalendarService";

// Mobile UI Types
export type {
  MobileAnimation,
  MobileComponentState,
  MobileInteraction,
  MobileLayoutConfig,
  MobileNavigationState,
  MobileUITheme,
  MobileViewport,
} from "./MobileUIService";

// Mobile Performance Types
export type {
  BatteryAction,
  BatteryOptimization,
  MemoryAction,
  MemoryOptimization,
  MemoryWarning,
  NetworkOptimization,
  PerformanceDashboard,
  PerformanceMetric,
  PerformanceProfile,
  PerformanceRecommendation,
  RenderingOptimization,
} from "./types/PerformanceTypes";

// ============================================================================
// PHASE 4.3: REACT NATIVE PLATFORM INTEGRATION
// ============================================================================

// React Native Platform Services
export {
  CoachingAnalyticsService,
  default as ReactNativePlatformService,
  RealTimeService,
  TeamManagementService,
} from "../react-native/ReactNativePlatformService";

// React Native Platform Types
export type {
  CalendarEvent,
  CoachDashboard,
  CoachingInsights,
  CrossPlatformSyncConfig,
  EngagementMetrics,
  FamilyDashboard,
  GameUpdate,
  NativeAppState,
  PerformanceMetrics,
  PlayerDashboard,
  RealTimeSubscription,
  TeamUpdate,
  UserRole,
  UserState,
} from "../react-native";
