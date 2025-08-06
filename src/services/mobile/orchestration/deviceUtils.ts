/**
 * Mobile Device Utilities
 * 
 * Utility functions for device capability detection and mobile configuration.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import type { MobileViewport } from "../MobileUIService";
import type { PlatformContext } from "../../cross-platform/UnifiedApiGateway";
import type { 
  MobileInitializationConfig, 
  MobileCapabilities,
  PerformanceProfileType
} from "./types";

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
export function checkMobileCapabilities(viewport: MobileViewport): MobileCapabilities {
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

/**
 * Determine optimal performance profile based on device characteristics
 */
export function getOptimalPerformanceProfile(viewport: MobileViewport): PerformanceProfileType {
  const isTablet = viewport.width >= 768;
  const isLowEnd = viewport.width <= 375 && viewport.height <= 667;
  
  if (isLowEnd) {
    return "battery-saver";
  } else if (isTablet) {
    return "performance";
  } else {
    return "balanced";
  }
}

/**
 * Check if device is considered low-end based on viewport
 */
export function isLowEndDevice(viewport: MobileViewport): boolean {
  return viewport.width <= 375 && viewport.height <= 667;
}

/**
 * Check if device is tablet based on viewport
 */
export function isTabletDevice(viewport: MobileViewport): boolean {
  return viewport.width >= 768;
}

/**
 * Check if device supports high-end features
 */
export function isHighEndDevice(viewport: MobileViewport): boolean {
  return viewport.width >= 414 && viewport.height >= 896;
}
