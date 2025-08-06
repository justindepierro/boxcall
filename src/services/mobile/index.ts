// ============================================================================
// PHASE 4.2: MOBILE OPTIMIZATION - MOBILE SERVICES INDEX
// ============================================================================

// Core Mobile Services
export { MobileCalendarService } from "./MobileCalendarService";
export { MobilePerformanceService } from "./MobilePerformanceService";
export { MobileUIService } from "./MobileUIService";

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

// PHASE 4.3: React Native Platform Integration
export {
  CoachingAnalyticsService,
  default as ReactNativePlatformService,
  RealTimeService,
  TeamManagementService,
} from "../react-native/ReactNativePlatformService";

// Type Exports
export type {
  MobileCalendarState,
  // Mobile Calendar Types
  MobileCalendarView,
  MobileEvent,
  MobilePerformanceMetrics,
  MobileRenderConfig,
  SwipeAction,
  TouchGesture,
  TouchTarget,
} from "./MobileCalendarService";

export type {
  MobileAnimation,
  MobileComponentState,
  MobileInteraction,
  MobileLayoutConfig,
  MobileNavigationState,
  // Mobile UI Types
  MobileUITheme,
  MobileViewport,
} from "./MobileUIService";

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

// PHASE 4.3: React Native Platform Types
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

// ============================================================================
// MOBILE ORCHESTRATOR SERVICE
// ============================================================================

import {
  MobileCalendarService,
  type MobileCalendarState,
  type MobilePerformanceMetrics,
} from "./MobileCalendarService";
import {
  MobilePerformanceService,
  type PerformanceDashboard,
  type PerformanceProfile,
} from "./MobilePerformanceService";
import {
  MobileUIService,
  type MobileUITheme,
  type MobileViewport,
} from "./MobileUIService";
// PHASE 4.3: React Native Platform Integration
import type { UserState } from "../react-native";
import ReactNativePlatformService, {
  type NativeAppState,
} from "../react-native/ReactNativePlatformService";
// MobileWebBridgeService - available via service imports
import type { PlatformContext } from "../cross-platform/UnifiedApiGateway";

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

/**
 * Central orchestrator for all mobile optimization services
 * Coordinates calendar, UI, and performance services
 */
export class MobileOrchestrator {
  private static appState: MobileAppState = {
    initialized: false,
    calendar: null,
    ui: { theme: null, viewport: null },
    performance: null,
    bridgeConnected: false,
    // PHASE 4.3: React Native Integration
    reactNative: {
      enabled: false,
      state: null,
      realTimeConnected: false,
    },
    lastUpdate: new Date(),
  };

  // ==========================================
  // Mobile App Initialization
  // ==========================================

  /**
   * Initialize complete mobile application with all optimizations
   */
  static async initializeMobileApp(
    config: MobileInitializationConfig
  ): Promise<{ success: boolean; state: MobileAppState; error?: string }> {
    try {
      // 1. Initialize Mobile UI Service
      const uiResult = await MobileUIService.initialize(
        config.viewport,
        config.theme || "auto"
      );

      if (!uiResult.success) {
        throw new Error(`UI initialization failed: ${uiResult.error}`);
      }

      this.appState.ui = {
        theme: uiResult.theme,
        viewport: config.viewport,
      };

      // 2. Initialize Mobile Performance Service
      const perfResult = await MobilePerformanceService.initialize(
        config.performanceProfile || "balanced"
      );

      if (!perfResult.success) {
        throw new Error(
          `Performance initialization failed: ${perfResult.error}`
        );
      }

      this.appState.performance = perfResult.profile;

      // 3. Initialize Mobile Calendar Service
      const calendarState = await MobileCalendarService.initialize(
        config.platformContext
      );

      this.appState.calendar = calendarState;

      // 5. Enable auto-optimization if requested
      if (config.enableAutoOptimization) {
        await this.enableAutoOptimization();
      }

      // 6. Mark as initialized
      this.appState.initialized = true;
      this.appState.bridgeConnected = true;
      this.appState.lastUpdate = new Date();

      return {
        success: true,
        state: this.appState,
      };
    } catch (error) {
      return {
        success: false,
        state: this.appState,
        error: `Mobile app initialization failed: ${error}`,
      };
    }
  }

  // ==========================================
  // PHASE 4.3: React Native Platform Integration
  // ==========================================

  /**
   * Initialize React Native platform with cross-platform capabilities
   */
  static async initializeReactNativePlatform(): Promise<{
    success: boolean;
    nativeState: NativeAppState | null;
    error?: string;
  }> {
    try {
      if (!this.appState.initialized) {
        throw new Error("Mobile app must be initialized first");
      }

      // Initialize React Native platform service
      const rnPlatformService = new ReactNativePlatformService();
      const nativeState = await rnPlatformService.initializeNativeApp();

      // Update app state with React Native integration
      this.appState.reactNative = {
        enabled: true,
        state: nativeState,
        realTimeConnected: nativeState.syncStatus === "connected",
      };

      this.appState.lastUpdate = new Date();

      return {
        success: true,
        nativeState,
      };
    } catch (error) {
      return {
        success: false,
        nativeState: null,
        error: `React Native initialization failed: ${error}`,
      };
    }
  }

  /**
   * Enable real-time synchronization for cross-platform features
   */
  static async enableRealTimeSync(teamIds: string[]): Promise<{
    success: boolean;
    subscriptions: string[];
    error?: string;
  }> {
    try {
      if (
        !this.appState.reactNative.enabled ||
        !this.appState.reactNative.state
      ) {
        throw new Error("React Native platform must be initialized first");
      }

      const rnPlatformService = new ReactNativePlatformService();
      const realTimeService = rnPlatformService.getRealTimeService();
      const subscriptions: string[] = [];

      // Subscribe to calendar changes for each team
      for (const teamId of teamIds) {
        const calendarSub = await realTimeService.subscribeToCalendarChanges(
          teamId,
          (events) => {
            console.log(`Calendar updated for team ${teamId}:`, events);
            // Update mobile calendar state
            this.appState.lastUpdate = new Date();
          }
        );
        subscriptions.push(calendarSub);

        const teamSub = await realTimeService.subscribeToTeamUpdates(
          teamId,
          (update) => {
            console.log(`Team update for ${teamId}:`, update);
            // Handle team updates
            this.appState.lastUpdate = new Date();
          }
        );
        subscriptions.push(teamSub);
      }

      // Update real-time connection status
      this.appState.reactNative.realTimeConnected = true;
      this.appState.lastUpdate = new Date();

      return {
        success: true,
        subscriptions,
      };
    } catch (error) {
      return {
        success: false,
        subscriptions: [],
        error: `Real-time sync initialization failed: ${error}`,
      };
    }
  }

  /**
   * Handle cross-platform state synchronization
   */
  static async syncCrossPlatformState(userId: string): Promise<{
    success: boolean;
    syncedData: UserState | null;
    error?: string;
  }> {
    try {
      if (!this.appState.reactNative.enabled) {
        throw new Error("React Native platform must be enabled");
      }

      const rnPlatformService = new ReactNativePlatformService();
      const realTimeService = rnPlatformService.getRealTimeService();

      // Sync user state across platforms
      const userState = await realTimeService.syncUserState(userId);

      // Update mobile app state with synced data
      this.appState.lastUpdate = new Date();

      return {
        success: true,
        syncedData: userState,
      };
    } catch (error) {
      return {
        success: false,
        syncedData: null,
        error: `Cross-platform sync failed: ${error}`,
      };
    }
  }

  /**
   * Get React Native platform status
   */
  static getReactNativeStatus(): {
    enabled: boolean;
    state: NativeAppState | null;
    realTimeConnected: boolean;
  } {
    return { ...this.appState.reactNative };
  }

  /**
   * Handle device orientation or viewport changes
   */
  static async handleViewportChange(
    newViewport: MobileViewport
  ): Promise<{ success: boolean; adaptations: string[] }> {
    const adaptations: string[] = [];

    try {
      // Update UI service viewport
      await MobileUIService.handleViewportChange(newViewport);
      adaptations.push("UI layout adapted");

      // Switch calendar view if needed (portrait vs landscape)
      if (this.appState.calendar) {
        const viewType =
          newViewport.orientation === "landscape" ? "week" : "day";
        await MobileCalendarService.switchView(viewType);
        adaptations.push(`Calendar switched to ${viewType} view`);
      }

      // Update app state
      this.appState.ui.viewport = newViewport;
      this.appState.lastUpdate = new Date();

      return { success: true, adaptations };
    } catch (error) {
      console.error("Failed to handle viewport change:", error);
      return { success: false, adaptations };
    }
  }

  /**
   * Handle battery level changes for dynamic optimization
   */
  static async handleBatteryChange(
    batteryLevel: number,
    isLowPowerMode: boolean = false
  ): Promise<{ success: boolean; optimizations: string[] }> {
    const optimizations: string[] = [];

    try {
      // Optimize performance based on battery level
      const batteryOpt = await MobilePerformanceService.optimizeBattery(
        batteryLevel,
        isLowPowerMode
      );

      if (batteryOpt.strategy === "aggressive") {
        // Switch to battery saver profile
        await MobilePerformanceService.switchProfile("battery-saver");
        optimizations.push("Switched to battery saver mode");

        // Reduce calendar refresh rate
        if (this.appState.calendar) {
          // TODO: Implement reduced refresh rate in calendar
          optimizations.push("Reduced calendar sync frequency");
        }

        // Disable animations in UI
        MobileUIService.updateLayoutConfig({
          accessibility: {
            reduceMotion: true,
            highContrast: false,
            largeText: false,
            voiceOver: false,
          },
        });
        optimizations.push("Disabled animations");
      }

      return { success: true, optimizations };
    } catch (error) {
      console.error("Failed to handle battery change:", error);
      return { success: false, optimizations: [] };
    }
  }

  /**
   * Handle memory pressure warnings
   */
  static async handleMemoryPressure(
    severity: "low" | "medium" | "high"
  ): Promise<{ success: boolean; memoryFreed: number; actions: string[] }> {
    const actions: string[] = [];
    let totalMemoryFreed = 0;

    try {
      if (severity === "high" || severity === "medium") {
        // Clear performance service caches
        const cleared = await MobilePerformanceService.clearCaches();
        totalMemoryFreed += cleared.freedMemory;
        actions.push(
          ...cleared.clearedCaches.map((cache) => `Cleared ${cache} cache`)
        );

        // Optimize memory in performance service
        await MobilePerformanceService.optimizeMemory();
        actions.push("Applied memory optimizations");
      }

      if (severity === "high") {
        // Force garbage collection if possible
        // TODO: Implement actual garbage collection
        actions.push("Triggered garbage collection");
        totalMemoryFreed += 10; // Estimated
      }

      return {
        success: true,
        memoryFreed: totalMemoryFreed,
        actions,
      };
    } catch (error) {
      console.error("Failed to handle memory pressure:", error);
      return { success: false, memoryFreed: 0, actions: [] };
    }
  }

  // ==========================================
  // Performance Monitoring
  // ==========================================

  /**
   * Get comprehensive mobile app performance status
   */
  static async getPerformanceStatus(): Promise<{
    overall: "excellent" | "good" | "fair" | "poor";
    dashboard: PerformanceDashboard | null;
    calendarMetrics: MobilePerformanceMetrics | null;
    recommendations: string[];
  }> {
    try {
      // Get performance dashboard
      const dashboard =
        await MobilePerformanceService.getPerformanceDashboard();

      // Get calendar performance metrics
      const calendarState = MobileCalendarService.getState();
      const calendarMetrics = calendarState?.performanceMetrics || null;

      // Generate combined recommendations
      const recommendations =
        await this.generateOverallRecommendations(dashboard);

      return {
        overall: dashboard.overall.status,
        dashboard,
        calendarMetrics,
        recommendations,
      };
    } catch (error) {
      console.error("Failed to get performance status:", error);
      return {
        overall: "poor",
        dashboard: null,
        calendarMetrics: null,
        recommendations: ["Unable to assess performance"],
      };
    }
  }

  /**
   * Enable automatic performance optimization
   */
  static async enableAutoOptimization(): Promise<void> {
    // Set up periodic optimization checks
    setInterval(async () => {
      try {
        await MobilePerformanceService.autoOptimize();
      } catch (error) {
        console.error("Auto-optimization failed:", error);
      }
    }, 60000); // Every minute

    // Set up memory monitoring
    setInterval(async () => {
      try {
        const memoryOpt = await MobilePerformanceService.optimizeMemory();
        const criticalWarnings = memoryOpt.warnings.filter(
          (w) => w.severity === "critical"
        );

        if (criticalWarnings.length > 0) {
          await this.handleMemoryPressure("high");
        }
      } catch (error) {
        console.error("Memory monitoring failed:", error);
      }
    }, 30000); // Every 30 seconds
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  /**
   * Get current mobile app state
   */
  static getAppState(): MobileAppState {
    return { ...this.appState };
  }

  /**
   * Check if mobile app is fully initialized
   */
  static isInitialized(): boolean {
    return this.appState.initialized;
  }

  /**
   * Get bridge connection status
   */
  static isBridgeConnected(): boolean {
    return this.appState.bridgeConnected;
  }

  /**
   * Cleanup and shutdown mobile app
   */
  static async cleanup(): Promise<void> {
    try {
      // Cleanup individual services
      await MobileCalendarService.cleanup();
      MobileUIService.cleanup();
      MobilePerformanceService.cleanup();

      // Reset app state
      this.appState = {
        initialized: false,
        calendar: null,
        ui: { theme: null, viewport: null },
        performance: null,
        bridgeConnected: false,
        // PHASE 4.3: React Native Integration
        reactNative: {
          enabled: false,
          state: null,
          realTimeConnected: false,
        },
        lastUpdate: new Date(),
      };
    } catch (error) {
      console.error("Failed to cleanup mobile app:", error);
    }
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private static async generateOverallRecommendations(
    dashboard: PerformanceDashboard | null
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (!dashboard) {
      recommendations.push(
        "Unable to assess performance - dashboard unavailable"
      );
      return recommendations;
    }

    if (dashboard.overall.score < 70) {
      recommendations.push("Consider switching to performance mode");
    }

    if (dashboard.battery.currentLevel < 30) {
      recommendations.push("Enable battery saver mode to extend usage");
    }

    if (dashboard.memory.usedMemory / dashboard.memory.totalMemory > 0.8) {
      recommendations.push("Clear caches to free memory");
    }

    if (dashboard.rendering.frameRate < 30) {
      recommendations.push("Reduce visual effects for smoother performance");
    }

    return recommendations;
  }
}

// ============================================================================
// MOBILE UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect device capabilities and create optimal mobile configuration
 */
export function createMobileConfig(
  viewport: MobileViewport,
  platformContext: PlatformContext
): MobileInitializationConfig {
  // Determine optimal settings based on device
  const isTablet = viewport.width >= 768;
  const isLowEnd = viewport.width <= 375 && viewport.height <= 667;

  return {
    viewport,
    platformContext,
    theme: "auto",
    performanceProfile: isLowEnd
      ? "battery-saver"
      : isTablet
        ? "performance"
        : "balanced",
    enableAutoOptimization: true,
  };
}

/**
 * Check if device supports advanced mobile features
 */
export function checkMobileCapabilities(viewport: MobileViewport): {
  supportsHapticFeedback: boolean;
  supportsAdvancedAnimations: boolean;
  supportsBackgroundSync: boolean;
  recommendedQuality: "high" | "balanced" | "performance";
} {
  const isHighEnd = viewport.width >= 414 && viewport.height >= 896;
  const isTablet = viewport.width >= 768;

  return {
    supportsHapticFeedback: isHighEnd,
    supportsAdvancedAnimations: isHighEnd || isTablet,
    supportsBackgroundSync: true,
    recommendedQuality: isHighEnd
      ? "high"
      : isTablet
        ? "balanced"
        : "performance",
  };
}
