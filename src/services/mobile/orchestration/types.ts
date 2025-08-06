/**
 * Mobile Orchestration Types
 * 
 * Centralized type definitions for mobile orchestration services.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import type { MobileUITheme, MobileViewport } from "../MobileUIService";
import type { PerformanceProfile } from "../MobilePerformanceService";
import type { MobileCalendarState } from "../MobileCalendarService";
import type { PlatformContext } from "../../cross-platform/UnifiedApiGateway";
import type { NativeAppState } from "../../react-native/ReactNativePlatformService";

// ============================================================================
// MOBILE APP STATE TYPES
// ============================================================================

export interface MobileAppState {
  initialized: boolean;
  calendar: MobileCalendarState | null;
  ui: {
    theme: MobileUITheme | null;
    viewport: MobileViewport | null;
  };
  performance: PerformanceProfile | null;
  bridgeConnected: boolean;
  // PHASE 4.3: React Native Integration
  reactNative: {
    enabled: boolean;
    state: NativeAppState | null;
    realTimeConnected: boolean;
  };
  lastUpdate: Date;
}

export interface MobileInitializationConfig {
  viewport: MobileViewport;
  platformContext: PlatformContext;
  theme?: "light" | "dark" | "auto";
  performanceProfile?: "battery-saver" | "balanced" | "performance";
  enableAutoOptimization?: boolean;
}

// ============================================================================
// SERVICE RESULT TYPES
// ============================================================================

export interface MobileInitializationResult {
  success: boolean;
  state: MobileAppState;
  error?: string;
}

export interface ReactNativeInitializationResult {
  success: boolean;
  nativeState: NativeAppState | null;
  error?: string;
}

export interface RealTimeSyncResult {
  success: boolean;
  subscriptions: string[];
  error?: string;
}

export interface ViewportChangeResult {
  success: boolean;
  adaptations: string[];
}

export interface BatteryOptimizationResult {
  success: boolean;
  optimizations: string[];
}

export interface MemoryPressureResult {
  success: boolean;
  memoryFreed: number;
  actions: string[];
}

// ============================================================================
// DEVICE CAPABILITY TYPES
// ============================================================================

export interface MobileCapabilities {
  supportsHapticFeedback: boolean;
  supportsAdvancedAnimations: boolean;
  supportsBackgroundSync: boolean;
  recommendedQuality: "high" | "balanced" | "performance";
}

export type MemoryPressureSeverity = "low" | "medium" | "high";
export type PerformanceProfileType = "battery-saver" | "balanced" | "performance";
