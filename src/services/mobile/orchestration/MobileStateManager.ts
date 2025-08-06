/**
 * Mobile App State Manager
 * 
 * Centralized state management for mobile app initialization and lifecycle.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import type { 
  MobileAppState
} from "./types";
import type { MobileUITheme, MobileViewport } from "../MobileUIService";
import type { PerformanceProfile } from "../MobilePerformanceService";
import type { MobileCalendarState } from "../MobileCalendarService";
import type { NativeAppState } from "../../react-native/ReactNativePlatformService";

/**
 * Central state manager for mobile app lifecycle
 */
export class MobileStateManager {
  private static appState: MobileAppState = {
    initialized: false,
    calendar: null,
    ui: { theme: null, viewport: null },
    performance: null,
    bridgeConnected: false,
    reactNative: {
      enabled: false,
      state: null,
      realTimeConnected: false,
    },
    lastUpdate: new Date(),
  };

  /**
   * Get current mobile app state (immutable copy)
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
   * Update UI state
   */
  static updateUIState(theme: MobileUITheme | null, viewport: MobileViewport | null): void {
    this.appState.ui = { theme, viewport };
    this.updateLastModified();
  }

  /**
   * Update performance state
   */
  static updatePerformanceState(profile: PerformanceProfile | null): void {
    this.appState.performance = profile;
    this.updateLastModified();
  }

  /**
   * Update calendar state
   */
  static updateCalendarState(calendarState: MobileCalendarState | null): void {
    this.appState.calendar = calendarState;
    this.updateLastModified();
  }

  /**
   * Update React Native integration state
   */
  static updateReactNativeState(enabled: boolean, nativeState: NativeAppState | null, realTimeConnected: boolean = false): void {
    this.appState.reactNative = {
      enabled,
      state: nativeState,
      realTimeConnected,
    };
    this.updateLastModified();
  }

  /**
   * Mark app as fully initialized
   */
  static markInitialized(bridgeConnected: boolean = true): void {
    this.appState.initialized = true;
    this.appState.bridgeConnected = bridgeConnected;
    this.updateLastModified();
  }

  /**
   * Update bridge connection status
   */
  static updateBridgeConnection(connected: boolean): void {
    this.appState.bridgeConnected = connected;
    this.updateLastModified();
  }

  /**
   * Update Real-time sync connection status
   */
  static updateRealTimeConnection(connected: boolean): void {
    if (this.appState.reactNative.enabled) {
      this.appState.reactNative.realTimeConnected = connected;
      this.updateLastModified();
    }
  }

  /**
   * Reset app state to uninitialized
   */
  static reset(): void {
    this.appState = {
      initialized: false,
      calendar: null,
      ui: { theme: null, viewport: null },
      performance: null,
      bridgeConnected: false,
      reactNative: {
        enabled: false,
        state: null,
        realTimeConnected: false,
      },
      lastUpdate: new Date(),
    };
  }

  /**
   * Update last modified timestamp
   */
  private static updateLastModified(): void {
    this.appState.lastUpdate = new Date();
  }
}
