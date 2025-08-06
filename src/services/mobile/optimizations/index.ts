/**
 * Mobile Optimization Services - Index
 *
 * Centralized exports for all mobile optimization services.
 * Provides clean API for modular performance optimization.
 *
 * @author BoxCall Development Team
 * @version 2.0.0
 */

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { BatteryOptimizationService } from "./BatteryOptimizationService";
export { MemoryOptimizationService } from "./MemoryOptimizationService";
export { NetworkOptimizationService } from "./NetworkOptimizationService";
export { RenderingOptimizationService } from "./RenderingOptimizationService";

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

export {
  PERFORMANCE_PROFILES,
  getPerformanceProfile,
  getAllPerformanceProfiles,
  getOptimalProfile,
} from "./PerformanceProfiles";

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  PerformanceMetric,
  PerformanceProfile,
  PerformanceDashboard,
  PerformanceRecommendation,
  BatteryOptimization,
  BatteryAction,
  MemoryOptimization,
  MemoryWarning,
  MemoryAction,
  NetworkOptimization,
  RenderingOptimization,
} from "../types/PerformanceTypes";
