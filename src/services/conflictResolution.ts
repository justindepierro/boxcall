/**
 * Real-Time Conflict Resolution Service
 * Handles merge conflicts and data synchronization for collaborative widgets
 *
 * Phase 2B Sprint 4: Live Dashboard Sharing
 */

import { logError, warn } from "../utils/logger";

export interface ConflictResolution {
  widgetId: string;
  conflictId: string;
  type: "data" | "position" | "config";
  strategies: Array<"last_write_wins" | "merge_automatic" | "user_decides">;
  metadata: {
    timestamp: number;
    users: string[];
    versions: Record<string, unknown>[];
  };
}

export interface MergeStrategy {
  name: string;
  description: string;
  apply: (local: unknown, remote: unknown, base?: unknown) => unknown;
  canApply: (local: unknown, remote: unknown) => boolean;
}

class ConflictResolutionService {
  private mergeStrategies: Map<string, MergeStrategy> = new Map();
  private conflictHistory: Map<string, ConflictResolution[]> = new Map();
  private listeners: Array<(conflict: ConflictResolution) => void> = [];

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default merge strategies
   */
  private initializeDefaultStrategies(): void {
    // Last Write Wins - simple timestamp-based resolution
    this.registerStrategy({
      name: "last_write_wins",
      description: "Accept the most recent change",
      apply: (local, remote) => {
        const localTime = (local as { timestamp?: number })?.timestamp || 0;
        const remoteTime = (remote as { timestamp?: number })?.timestamp || 0;
        return remoteTime > localTime ? remote : local;
      },
      canApply: (local, remote) => {
        return (
          typeof local === "object" &&
          typeof remote === "object" &&
          local !== null &&
          remote !== null
        );
      },
    });

    // Automatic merge for non-conflicting properties
    this.registerStrategy({
      name: "merge_automatic",
      description: "Merge non-conflicting properties automatically",
      apply: (local, remote) => {
        if (
          typeof local !== "object" ||
          typeof remote !== "object" ||
          local === null ||
          remote === null
        ) {
          return remote; // Fallback to remote
        }

        const localObj = local as Record<string, unknown>;
        const remoteObj = remote as Record<string, unknown>;
        const merged = { ...localObj };

        // Merge properties that don't conflict
        for (const [key, value] of Object.entries(remoteObj)) {
          if (!(key in localObj) || localObj[key] === value) {
            merged[key] = value;
          }
          // For conflicts, keep local value (could be enhanced)
        }

        return merged;
      },
      canApply: (local, remote) => {
        return (
          typeof local === "object" &&
          typeof remote === "object" &&
          local !== null &&
          remote !== null
        );
      },
    });

    // Array merge strategy
    this.registerStrategy({
      name: "array_merge",
      description: "Merge arrays by combining unique elements",
      apply: (local, remote) => {
        if (!Array.isArray(local) || !Array.isArray(remote)) {
          return remote;
        }

        // Simple merge - combine and deduplicate
        const combined = [...local, ...remote];
        return Array.from(
          new Set(combined.map((item) => JSON.stringify(item)))
        ).map((item) => JSON.parse(item));
      },
      canApply: (local, remote) => {
        return Array.isArray(local) && Array.isArray(remote);
      },
    });
  }

  /**
   * Register a new merge strategy
   */
  registerStrategy(strategy: MergeStrategy): void {
    this.mergeStrategies.set(strategy.name, strategy);
  }

  /**
   * Detect conflicts between local and remote data
   */
  detectConflict(
    widgetId: string,
    local: unknown,
    remote: unknown,
    base?: unknown
  ): ConflictResolution | null {
    // Simple conflict detection - enhanced version would use deeper comparison
    if (JSON.stringify(local) === JSON.stringify(remote)) {
      return null; // No conflict
    }

    const conflictId = `${widgetId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const conflict: ConflictResolution = {
      widgetId,
      conflictId,
      type: this.inferConflictType(local, remote),
      strategies: this.getApplicableStrategies(local, remote),
      metadata: {
        timestamp: Date.now(),
        users: [], // Will be populated by caller
        versions: [local, remote, base].filter(Boolean) as Record<
          string,
          unknown
        >[],
      },
    };

    // Store conflict in history
    const history = this.conflictHistory.get(widgetId) || [];
    history.push(conflict);
    this.conflictHistory.set(widgetId, history);

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(conflict);
      } catch (error) {
        logError("Error in conflict listener:", error);
      }
    });

    return conflict;
  }

  /**
   * Attempt automatic resolution using specified strategy
   */
  autoResolve(
    conflict: ConflictResolution,
    strategyName: string = "last_write_wins"
  ): unknown | null {
    const strategy = this.mergeStrategies.get(strategyName);
    if (!strategy) {
      warn(`Unknown merge strategy: ${strategyName}`);
      return null;
    }

    const versions = conflict.metadata.versions;
    if (versions.length < 2) {
      return null;
    }

    const [local, remote, base] = versions;

    if (!strategy.canApply(local, remote)) {
      warn(`Strategy ${strategyName} cannot be applied to these data types`);
      return null;
    }

    try {
      return strategy.apply(local, remote, base);
    } catch (error) {
      logError(`Error applying merge strategy ${strategyName}:`, error);
      return null;
    }
  }

  /**
   * Get conflict history for a widget
   */
  getConflictHistory(widgetId: string): ConflictResolution[] {
    return this.conflictHistory.get(widgetId) || [];
  }

  /**
   * Clear conflict history for a widget
   */
  clearConflictHistory(widgetId: string): void {
    this.conflictHistory.delete(widgetId);
  }

  /**
   * Add listener for conflict events
   */
  onConflict(listener: (conflict: ConflictResolution) => void): () => void {
    this.listeners.push(listener);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get available merge strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.mergeStrategies.keys());
  }

  /**
   * Get strategy description
   */
  getStrategyDescription(name: string): string {
    return this.mergeStrategies.get(name)?.description || "Unknown strategy";
  }

  /**
   * Infer the type of conflict based on data structure
   */
  private inferConflictType(
    local: unknown,
    remote: unknown
  ): "data" | "position" | "config" {
    // Simple heuristics - could be enhanced with schema analysis
    const localObj = local as Record<string, unknown>;

    if (
      typeof local === "object" &&
      typeof remote === "object" &&
      local !== null &&
      remote !== null
    ) {
      if (("x" in localObj && "y" in localObj) || "position" in localObj) {
        return "position";
      }
      if ("config" in localObj || "settings" in localObj) {
        return "config";
      }
    }

    return "data";
  }

  /**
   * Get applicable strategies for given data types
   */
  private getApplicableStrategies(
    local: unknown,
    remote: unknown
  ): Array<"last_write_wins" | "merge_automatic" | "user_decides"> {
    const strategies: Array<
      "last_write_wins" | "merge_automatic" | "user_decides"
    > = [];

    // Last write wins is always applicable
    strategies.push("last_write_wins");

    // Check if automatic merge is possible
    if (
      typeof local === "object" &&
      typeof remote === "object" &&
      local !== null &&
      remote !== null
    ) {
      strategies.push("merge_automatic");
    }

    // User decision is always an option
    strategies.push("user_decides");

    return strategies;
  }
}

// Export singleton instance
export const conflictResolutionService = new ConflictResolutionService();
