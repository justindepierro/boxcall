/**
 * Performance Configuration Profiles
 *
 * Predefined performance profiles for different mobile usage scenarios.
 *
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import type { PerformanceProfile } from "../types/PerformanceTypes";

// ============================================================================
// PERFORMANCE PROFILES
// ============================================================================

export const PERFORMANCE_PROFILES: Record<string, PerformanceProfile> = {
  "battery-saver": {
    id: "battery-saver",
    name: "Battery Saver",
    description: "Maximize battery life with aggressive power saving",
    settings: {
      batteryOptimization: "aggressive",
      renderingQuality: "performance",
      networkUsage: "minimal",
      backgroundProcessing: false,
      animations: false,
      hapticFeedback: false,
    },
  },

  balanced: {
    id: "balanced",
    name: "Balanced",
    description: "Optimal balance between performance and battery life",
    settings: {
      batteryOptimization: "balanced",
      renderingQuality: "balanced",
      networkUsage: "limited",
      backgroundProcessing: true,
      animations: true,
      hapticFeedback: true,
    },
  },

  performance: {
    id: "performance",
    name: "High Performance",
    description: "Maximum performance with full feature set",
    settings: {
      batteryOptimization: "performance",
      renderingQuality: "high",
      networkUsage: "unlimited",
      backgroundProcessing: true,
      animations: true,
      hapticFeedback: true,
    },
  },
};

/**
 * Get a performance profile by ID
 */
export function getPerformanceProfile(id: string): PerformanceProfile {
  return PERFORMANCE_PROFILES[id] || PERFORMANCE_PROFILES.balanced;
}

/**
 * Get all available performance profiles
 */
export function getAllPerformanceProfiles(): PerformanceProfile[] {
  return Object.values(PERFORMANCE_PROFILES);
}

/**
 * Determine optimal profile based on device state
 */
export function getOptimalProfile(deviceState: {
  batteryLevel: number;
  isLowPowerMode: boolean;
  connectionType: string;
  memoryUsage: number;
}): PerformanceProfile {
  const { batteryLevel, isLowPowerMode, memoryUsage } = deviceState;

  // Battery saver for low battery or low power mode
  if (isLowPowerMode || batteryLevel < 20) {
    return PERFORMANCE_PROFILES["battery-saver"];
  }

  // Performance mode for high battery and low memory usage
  if (batteryLevel > 70 && memoryUsage < 50) {
    return PERFORMANCE_PROFILES.performance;
  }

  // Default to balanced
  return PERFORMANCE_PROFILES.balanced;
}
