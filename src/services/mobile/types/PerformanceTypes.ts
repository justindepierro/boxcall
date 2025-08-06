/**
 * Mobile Performance Types - Core Type Definitions
 *
 * Centralized type definitions for mobile performance monitoring and optimization.
 * Provides type safety across all mobile performance services.
 *
 * @author BoxCall Development Team
 * @version 2.0.0
 */

// ============================================================================
// CORE PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "fps" | "mb" | "percent" | "score";
  threshold: {
    good: number;
    fair: number;
    poor: number;
  };
  status: "good" | "fair" | "poor";
  timestamp: Date;
}

export interface PerformanceProfile {
  id: string;
  name: string;
  description: string;
  settings: {
    batteryOptimization: BatteryOptimization["strategy"];
    renderingQuality: "high" | "balanced" | "performance";
    networkUsage: "unlimited" | "limited" | "minimal";
    backgroundProcessing: boolean;
    animations: boolean;
    hapticFeedback: boolean;
  };
}

export interface PerformanceDashboard {
  overall: {
    score: number; // 0-100
    status: "excellent" | "good" | "fair" | "poor";
  };
  metrics: PerformanceMetric[];
  battery: BatteryOptimization;
  memory: MemoryOptimization;
  network: NetworkOptimization;
  rendering: RenderingOptimization;
  recommendations: PerformanceRecommendation[];
}

export interface PerformanceRecommendation {
  id: string;
  type: "battery" | "memory" | "network" | "rendering";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  action: string;
  estimatedImpact: number; // 0-100
  autoApply: boolean;
}

// ============================================================================
// BATTERY OPTIMIZATION TYPES
// ============================================================================

export interface BatteryOptimization {
  strategy: "aggressive" | "balanced" | "performance";
  actions: BatteryAction[];
  estimatedSavings: number; // percentage
  currentLevel: number; // percentage
  isLowPowerMode: boolean;
}

export interface BatteryAction {
  type:
    | "reduce-refresh-rate"
    | "disable-animations"
    | "reduce-sync"
    | "dim-display"
    | "background-processing";
  description: string;
  impact: "low" | "medium" | "high";
  enabled: boolean;
}

// ============================================================================
// MEMORY OPTIMIZATION TYPES
// ============================================================================

export interface MemoryOptimization {
  totalMemory: number; // MB
  usedMemory: number; // MB
  availableMemory: number; // MB
  warnings: MemoryWarning[];
  optimizations: MemoryAction[];
  cacheSize: number; // MB
}

export interface MemoryWarning {
  type: "high-usage" | "memory-leak" | "cache-overflow" | "background-tasks";
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
}

export interface MemoryAction {
  type: "clear-cache" | "compress-images" | "limit-history" | "reduce-quality";
  description: string;
  memoryFreed: number; // MB
  executed: boolean;
}

// ============================================================================
// NETWORK OPTIMIZATION TYPES
// ============================================================================

export interface NetworkOptimization {
  usage: {
    sent: number; // bytes
    received: number; // bytes
    requests: number;
  };
  optimization: {
    compression: boolean;
    caching: boolean;
    requestBatching: boolean;
    imageLazyLoading: boolean;
  };
  connectionType: "wifi" | "cellular" | "5g" | "4g" | "3g" | "offline";
  quality: "excellent" | "good" | "poor" | "offline";
}

// ============================================================================
// RENDERING OPTIMIZATION TYPES
// ============================================================================

export interface RenderingOptimization {
  frameRate: number; // fps
  renderTime: number; // ms
  droppedFrames: number;
  optimizations: {
    virtualization: boolean;
    lazyRendering: boolean;
    layoutCaching: boolean;
    imageOptimization: boolean;
  };
  quality: "smooth" | "acceptable" | "choppy";
}
