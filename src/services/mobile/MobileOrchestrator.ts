/**
 * Mobile Orchestrator Service
 * 
 * Streamlined orchestrator using modular services for mobile optimization.
 * Coordinates all mobile services through focused, single-responsibility modules.
 * 
 * @author BoxCall Development Team
 * @version 3.0.0
 */

import {
  MobileStateManager,
  MobileInitializationService,
  ReactNativeIntegrationService,
  MobileEventHandlers,
  MobilePerformanceMonitor,
  createMobileConfig,
  checkMobileCapabilities,
} from "./orchestration";

import type {
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
} from "./orchestration";

import type { MobileViewport } from "./MobileUIService";
import type { PlatformContext } from "../cross-platform/UnifiedApiGateway";

/**
 * Streamlined mobile orchestrator using modular services
 * 
 * This class serves as a facade over the modular orchestration services,
 * providing a clean API while delegating to specialized services.
 */
export class MobileOrchestrator {
  // ==========================================
  // Core Mobile App Lifecycle
  // ==========================================

  /**
   * Initialize complete mobile application with all optimizations
   */
  static async initializeMobileApp(
    config: MobileInitializationConfig
  ): Promise<MobileInitializationResult> {
    return MobileInitializationService.initializeMobileApp(config);
  }

  /**
   * Get current mobile app state
   */
  static getAppState(): MobileAppState {
    return MobileStateManager.getAppState();
  }

  /**
   * Check if mobile app is fully initialized
   */
  static isInitialized(): boolean {
    return MobileStateManager.isInitialized();
  }

  /**
   * Cleanup and shutdown mobile app
   */
  static async cleanup(): Promise<void> {
    return MobileInitializationService.cleanup();
  }

  // ==========================================
  // React Native Platform Integration
  // ==========================================

  /**
   * Initialize React Native platform with cross-platform capabilities
   */
  static async initializeReactNativePlatform(): Promise<ReactNativeInitializationResult> {
    return ReactNativeIntegrationService.initializeReactNativePlatform();
  }

  /**
   * Enable real-time synchronization for cross-platform features
   */
  static async enableRealTimeSync(teamIds: string[]): Promise<RealTimeSyncResult> {
    return ReactNativeIntegrationService.enableRealTimeSync(teamIds);
  }

  // ==========================================
  // Device Event Handling
  // ==========================================

  /**
   * Handle device orientation or viewport changes
   */
  static async handleViewportChange(
    newViewport: MobileViewport
  ): Promise<ViewportChangeResult> {
    return MobileEventHandlers.handleViewportChange(newViewport);
  }

  /**
   * Handle battery level changes for dynamic optimization
   */
  static async handleBatteryChange(
    batteryLevel: number,
    isLowPowerMode: boolean = false
  ): Promise<BatteryOptimizationResult> {
    return MobileEventHandlers.handleBatteryChange(batteryLevel, isLowPowerMode);
  }

  /**
   * Handle memory pressure warnings
   */
  static async handleMemoryPressure(
    severity: MemoryPressureSeverity
  ): Promise<MemoryPressureResult> {
    return MobileEventHandlers.handleMemoryPressure(severity);
  }

  // ==========================================
  // Performance Monitoring
  // ==========================================

  /**
   * Get comprehensive mobile app performance status
   */
  static async getPerformanceStatus(): Promise<{
    overall: "excellent" | "good" | "fair" | "poor";
    dashboard: {
      renderTime: number;
      memoryUsage: number;
      batteryImpact: number;
    };
    calendarMetrics: {
      loadTime: number;
      scrollPerformance: number;
      renderEfficiency: number;
    };
    recommendations: string[];
  }> {
    return MobilePerformanceMonitor.getPerformanceStatus();
  }
}

// ============================================================================
// UTILITY FUNCTIONS (Re-exported from orchestration module)
// ============================================================================

/**
 * Detect device capabilities and create optimal mobile configuration
 */
export function createOptimalMobileConfig(
  viewport: MobileViewport,
  platformContext: PlatformContext
): MobileInitializationConfig {
  return createMobileConfig(viewport, platformContext);
}

/**
 * Check if device supports advanced mobile features
 */
export function getMobileCapabilities(viewport: MobileViewport): MobileCapabilities {
  return checkMobileCapabilities(viewport);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

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
};
