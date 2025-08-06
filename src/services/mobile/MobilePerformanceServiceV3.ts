/**
 * Mobile Performance Service - Professional Orchestrator
 *
 * Clean orchestration service that coordinates all mobile performance optimization services.
 * Implements modular architecture with clear separation of concerns.
 *
 * @author BoxCall Development Team
 * @version 3.0.0
 */

import {
  BatteryOptimizationService,
  MemoryOptimizationService,
  NetworkOptimizationService,
  RenderingOptimizationService,
  getPerformanceProfile,
  getOptimalProfile,
} from "./optimizations";

import type {
  PerformanceProfile,
  PerformanceDashboard,
  PerformanceRecommendation,
  PerformanceMetric,
} from "./types/PerformanceTypes";

// ============================================================================
// MOBILE PERFORMANCE SERVICE (ORCHESTRATOR)
// ============================================================================

export class MobilePerformanceService {
  private static currentProfile: PerformanceProfile | null = null;
  private static metrics: PerformanceMetric[] = [];
  private static monitoringInterval: number | null = null;

  // ==========================================
  // Performance Monitoring & Management
  // ==========================================

  /**
   * Initialize performance monitoring with a specific profile
   */
  static async initialize(
    profileId: "battery-saver" | "balanced" | "performance" = "balanced"
  ): Promise<{
    success: boolean;
    profile: PerformanceProfile;
    error?: string;
  }> {
    try {
      // Load performance profile
      const profile = getPerformanceProfile(profileId);
      this.currentProfile = profile;

      // Apply profile settings
      await this.applyPerformanceProfile(profile);

      // Start monitoring
      this.startPerformanceMonitoring();

      // Initialize optimization services
      await this.initializeOptimizations();

      return {
        success: true,
        profile,
      };
    } catch (error) {
      return {
        success: false,
        profile: getPerformanceProfile("balanced"),
        error: `Failed to initialize performance service: ${error}`,
      };
    }
  }

  /**
   * Get comprehensive performance dashboard
   */
  static async getPerformanceDashboard(): Promise<PerformanceDashboard> {
    // Update all metrics
    await this.updateAllMetrics();

    // Get optimizations from each service
    const battery =
      BatteryOptimizationService.getCurrentOptimization() ||
      (await BatteryOptimizationService.optimizeBattery(75));
    const memory =
      MemoryOptimizationService.getCurrentOptimization() ||
      (await MemoryOptimizationService.optimizeMemory());
    const network =
      NetworkOptimizationService.getCurrentOptimization() ||
      (await NetworkOptimizationService.optimizeNetwork("wifi"));
    const rendering =
      RenderingOptimizationService.getCurrentOptimization() ||
      (await RenderingOptimizationService.optimizeRendering());

    // Calculate overall score
    const overallScore = this.calculateOverallScore();

    // Generate recommendations
    const recommendations = await this.generateRecommendations();

    return {
      overall: {
        score: overallScore,
        status: this.getPerformanceStatus(overallScore),
      },
      metrics: this.metrics,
      battery,
      memory,
      network,
      rendering,
      recommendations,
    };
  }

  /**
   * Switch to a different performance profile
   */
  static async switchProfile(
    profileId: "battery-saver" | "balanced" | "performance"
  ): Promise<{ success: boolean; profile: PerformanceProfile }> {
    try {
      const newProfile = getPerformanceProfile(profileId);
      await this.applyPerformanceProfile(newProfile);
      this.currentProfile = newProfile;

      return {
        success: true,
        profile: newProfile,
      };
    } catch {
      return {
        success: false,
        profile: this.currentProfile || getPerformanceProfile("balanced"),
      };
    }
  }

  /**
   * Auto-optimize based on current device conditions
   */
  static async autoOptimize(): Promise<{
    optimizations: string[];
    improvementScore: number;
    recommendations: PerformanceRecommendation[];
  }> {
    const beforeScore = this.calculateOverallScore();
    const optimizations: string[] = [];

    // Get device state
    const deviceState = await this.getDeviceState();

    // Determine optimal profile
    const optimalProfile = getOptimalProfile(deviceState);
    if (optimalProfile.id !== this.currentProfile?.id) {
      await this.switchProfile(
        optimalProfile.id as "battery-saver" | "balanced" | "performance"
      );
      optimizations.push(`Switched to ${optimalProfile.name} profile`);
    }

    // Run optimization services
    if (deviceState.batteryLevel < 50) {
      await BatteryOptimizationService.optimizeBattery(
        deviceState.batteryLevel
      );
      optimizations.push("Battery optimization applied");
    }

    const memoryOpt = await MemoryOptimizationService.optimizeMemory();
    if (memoryOpt.warnings.some((w) => w.severity === "warning")) {
      optimizations.push("Memory optimization applied");
    }

    const renderingOpt = await RenderingOptimizationService.optimizeRendering();
    if (
      renderingOpt.quality === "choppy" ||
      renderingOpt.quality === "acceptable"
    ) {
      optimizations.push("Rendering optimization applied");
    }

    const afterScore = this.calculateOverallScore();
    const improvement = afterScore - beforeScore;

    const recommendations = await this.generateRecommendations();

    return {
      optimizations,
      improvementScore: improvement,
      recommendations,
    };
  }

  /**
   * Stop all performance monitoring and cleanup
   */
  static async cleanup(): Promise<void> {
    // Stop monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Reset optimization services
    await BatteryOptimizationService.resetOptimizations();
    await RenderingOptimizationService.disablePerformanceMode();
    await NetworkOptimizationService.disableDataSavingMode();

    // Clear metrics
    this.metrics = [];
    this.currentProfile = null;
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private static async applyPerformanceProfile(
    profile: PerformanceProfile
  ): Promise<void> {
    const { settings } = profile;

    // Apply battery settings
    if (settings.batteryOptimization === "aggressive") {
      await BatteryOptimizationService.optimizeBattery(20, true);
    }

    // Apply rendering settings
    if (settings.renderingQuality === "performance") {
      await RenderingOptimizationService.enablePerformanceMode();
    } else if (settings.renderingQuality === "high") {
      await RenderingOptimizationService.disablePerformanceMode();
    }

    // Apply network settings
    if (settings.networkUsage === "minimal") {
      await NetworkOptimizationService.enableDataSavingMode();
    }
  }

  private static startPerformanceMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = window.setInterval(async () => {
      await this.updateAllMetrics();
    }, 5000); // Update every 5 seconds
  }

  private static async initializeOptimizations(): Promise<void> {
    // Initialize each optimization service
    await BatteryOptimizationService.optimizeBattery(75);
    await MemoryOptimizationService.optimizeMemory();
    await NetworkOptimizationService.optimizeNetwork("wifi");
    await RenderingOptimizationService.optimizeRendering();
  }

  private static async updateAllMetrics(): Promise<void> {
    const timestamp = new Date();

    // Get current optimizations
    const battery = BatteryOptimizationService.getCurrentOptimization();
    const memory = MemoryOptimizationService.getCurrentOptimization();
    const rendering = RenderingOptimizationService.getCurrentOptimization();

    // Update metrics
    this.updateMetric(
      "battery-level",
      battery?.currentLevel || 75,
      "percent",
      { good: 50, fair: 20, poor: 10 },
      timestamp
    );
    this.updateMetric(
      "memory-usage",
      memory?.usedMemory || 128,
      "mb",
      { good: 256, fair: 512, poor: 768 },
      timestamp
    );
    this.updateMetric(
      "frame-rate",
      rendering?.frameRate || 60,
      "fps",
      { good: 55, fair: 30, poor: 15 },
      timestamp
    );
  }

  private static updateMetric(
    name: string,
    value: number,
    unit: PerformanceMetric["unit"],
    threshold: PerformanceMetric["threshold"],
    timestamp: Date
  ): void {
    const status =
      value >= threshold.good
        ? "good"
        : value >= threshold.fair
          ? "fair"
          : "poor";

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      threshold,
      status,
      timestamp,
    };

    // Update or add metric
    const existingIndex = this.metrics.findIndex((m) => m.name === name);
    if (existingIndex >= 0) {
      this.metrics[existingIndex] = metric;
    } else {
      this.metrics.push(metric);
    }

    // Keep only recent metrics (last 20)
    if (this.metrics.length > 20) {
      this.metrics = this.metrics.slice(-20);
    }
  }

  private static calculateOverallScore(): number {
    if (this.metrics.length === 0) return 75; // Default score

    const scores = this.metrics.map((metric) => {
      switch (metric.status) {
        case "good":
          return 100;
        case "fair":
          return 60;
        case "poor":
          return 20;
        default:
          return 75;
      }
    });

    return Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
  }

  private static getPerformanceStatus(
    score: number
  ): "excellent" | "good" | "fair" | "poor" {
    if (score >= 90) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "fair";
    return "poor";
  }

  private static async generateRecommendations(): Promise<
    PerformanceRecommendation[]
  > {
    const recommendations: PerformanceRecommendation[] = [];
    const overallScore = this.calculateOverallScore();

    if (overallScore < 60) {
      recommendations.push({
        id: "auto-optimize",
        type: "battery",
        priority: "high",
        title: "Auto-optimize performance",
        description:
          "Let the system automatically optimize for current conditions",
        action: "Run auto-optimization",
        estimatedImpact: 30,
        autoApply: false,
      });
    }

    const battery = BatteryOptimizationService.getCurrentOptimization();
    if (battery && battery.currentLevel < 30) {
      recommendations.push({
        id: "battery-saver",
        type: "battery",
        priority: "critical",
        title: "Enable battery saver mode",
        description: "Your battery is low. Enable aggressive power saving.",
        action: "Switch to battery saver profile",
        estimatedImpact: 40,
        autoApply: true,
      });
    }

    return recommendations;
  }

  private static async getDeviceState(): Promise<{
    batteryLevel: number;
    isLowPowerMode: boolean;
    connectionType: string;
    memoryUsage: number;
  }> {
    const battery = BatteryOptimizationService.getCurrentOptimization();
    const memory = MemoryOptimizationService.getCurrentOptimization();
    const network = NetworkOptimizationService.getCurrentOptimization();

    return {
      batteryLevel: battery?.currentLevel || 75,
      isLowPowerMode: battery?.isLowPowerMode || false,
      connectionType: network?.connectionType || "wifi",
      memoryUsage: memory ? (memory.usedMemory / memory.totalMemory) * 100 : 25,
    };
  }
}

// Re-export types for backward compatibility
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
} from "./types/PerformanceTypes";
