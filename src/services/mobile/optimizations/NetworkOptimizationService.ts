/**
 * Network Optimization Service
 *
 * Dedicated service for network optimization in mobile environments.
 * Provides intelligent data usage management and connection optimization.
 *
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import type { NetworkOptimization } from "../types/PerformanceTypes";

// ============================================================================
// NETWORK OPTIMIZATION SERVICE
// ============================================================================

export class NetworkOptimizationService {
  private static currentOptimization: NetworkOptimization | null = null;

  /**
   * Optimize network usage based on connection type
   */
  static async optimizeNetwork(
    connectionType: NetworkOptimization["connectionType"]
  ): Promise<NetworkOptimization> {
    const usage = await this.getNetworkUsage();
    const optimization = this.getNetworkOptimization(connectionType);

    const networkOpt: NetworkOptimization = {
      usage,
      optimization,
      connectionType,
      quality: this.determineNetworkQuality(connectionType),
    };

    // Apply optimizations based on connection type
    if (connectionType === "3g" || connectionType === "cellular") {
      await this.applyDataSavingMode();
    }

    this.currentOptimization = networkOpt;
    return networkOpt;
  }

  /**
   * Monitor network performance
   */
  static async monitorNetwork(): Promise<{
    latency: number;
    bandwidth: number;
    packetLoss: number;
    quality: NetworkOptimization["quality"];
  }> {
    const startTime = performance.now();

    try {
      // Simple network test using fetch to a known endpoint
      const response = await fetch("/api/ping", {
        method: "HEAD",
        cache: "no-cache",
      });

      const latency = performance.now() - startTime;

      return {
        latency,
        bandwidth: this.estimateBandwidth(latency),
        packetLoss: response.ok ? 0 : 1,
        quality: this.determineNetworkQuality(
          this.currentOptimization?.connectionType || "wifi"
        ),
      };
    } catch {
      return {
        latency: 999,
        bandwidth: 0,
        packetLoss: 1,
        quality: "offline",
      };
    }
  }

  /**
   * Get current network optimization state
   */
  static getCurrentOptimization(): NetworkOptimization | null {
    return this.currentOptimization;
  }

  /**
   * Enable data saving mode
   */
  static async enableDataSavingMode(): Promise<void> {
    await this.applyDataSavingMode();
  }

  /**
   * Disable data saving mode
   */
  static async disableDataSavingMode(): Promise<void> {
    // Revert data saving optimizations
    if (this.currentOptimization) {
      this.currentOptimization.optimization.compression = false;
      this.currentOptimization.optimization.requestBatching = false;
      this.currentOptimization.optimization.imageLazyLoading = false;
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private static async getNetworkUsage(): Promise<
    NetworkOptimization["usage"]
  > {
    // Try to get network usage from browser APIs
    if ("connection" in navigator) {
      const connection = (navigator as unknown as { connection?: {
        downlink?: number;
        effectiveType?: string;
        rtt?: number;
        saveData?: boolean;
      } }).connection;
      return {
        sent: connection?.downlink || 0,
        received: connection?.effectiveType === "4g" ? 100 : connection?.effectiveType === "3g" ? 50 : 0,
        requests: 0, // Would need to track this
      };
    }

    // Fallback to estimated values
    return {
      sent: 1024 * 1024, // 1MB estimated
      received: 5 * 1024 * 1024, // 5MB estimated
      requests: 50, // 50 requests estimated
    };
  }

  private static getNetworkOptimization(
    connectionType: NetworkOptimization["connectionType"]
  ): NetworkOptimization["optimization"] {
    switch (connectionType) {
      case "wifi":
      case "5g":
        return {
          compression: false,
          caching: true,
          requestBatching: false,
          imageLazyLoading: true,
        };
      case "4g":
        return {
          compression: true,
          caching: true,
          requestBatching: true,
          imageLazyLoading: true,
        };
      case "3g":
      case "cellular":
        return {
          compression: true,
          caching: true,
          requestBatching: true,
          imageLazyLoading: true,
        };
      case "offline":
        return {
          compression: false,
          caching: true,
          requestBatching: false,
          imageLazyLoading: false,
        };
      default:
        return {
          compression: true,
          caching: true,
          requestBatching: true,
          imageLazyLoading: true,
        };
    }
  }

  private static determineNetworkQuality(
    connectionType: NetworkOptimization["connectionType"]
  ): NetworkOptimization["quality"] {
    switch (connectionType) {
      case "wifi":
      case "5g":
        return "excellent";
      case "4g":
        return "good";
      case "3g":
      case "cellular":
        return "poor";
      case "offline":
        return "offline";
      default:
        return "good";
    }
  }

  private static async applyDataSavingMode(): Promise<void> {
    if (this.currentOptimization) {
      // Enable all data saving optimizations
      this.currentOptimization.optimization.compression = true;
      this.currentOptimization.optimization.requestBatching = true;
      this.currentOptimization.optimization.imageLazyLoading = true;

      // Add CSS class for data saving mode
      document.body.classList.add("data-saving-mode");
    }
  }

  private static estimateBandwidth(latency: number): number {
    // Simple bandwidth estimation based on latency
    if (latency < 50) {
      return 100; // High bandwidth (Mbps)
    } else if (latency < 100) {
      return 50; // Medium bandwidth
    } else if (latency < 300) {
      return 10; // Low bandwidth
    } else {
      return 1; // Very low bandwidth
    }
  }
}
