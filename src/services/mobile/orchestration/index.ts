/**
 * Mobile Orchestration Services - Barrel Exports
 * 
 * Clean export interface for modular mobile orchestration services.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

// Core orchestration services
export { MobileStateManager } from "./MobileStateManager";
export { MobileInitializationService } from "./MobileInitializationService";
export { ReactNativeIntegrationService } from "./ReactNativeIntegrationService";
export { MobileEventHandlers } from "./MobileEventHandlers";
export { MobilePerformanceMonitor } from "./MobilePerformanceMonitor";

// Device utilities
export {
  createMobileConfig,
  checkMobileCapabilities,
  getOptimalPerformanceProfile,
  isLowEndDevice,
  isTabletDevice,
  isHighEndDevice,
} from "./deviceUtils";

// Type exports
export type {
  MobileAppState,
  MobileInitializationConfig,
  MobileInitializationResult,
  ReactNativeInitializationResult,
  RealTimeSyncResult,
  ViewportChangeResult,
  BatteryOptimizationResult,
  MemoryPressureResult,
  MobileCapabilities,
  MemoryPressureSeverity,
  PerformanceProfileType,
} from "./types";
