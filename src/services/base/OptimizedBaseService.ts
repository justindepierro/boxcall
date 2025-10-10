/**
 * Enhanced Base Service with Database Optimization
 *
 * Extends the existing BaseService with advanced optimization features
 * including query optimization, enhanced caching, and performance monitoring
 */

import { BaseService as OriginalBaseService } from "./BaseService";
import {
  dbOptimization,
  type QueryMetrics,
} from "../database/DatabaseOptimizationService";
import type { Database } from "../../types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

interface OptimizedServiceOptions {
  enableQueryOptimization?: boolean;
  defaultCacheTTL?: number;
  enableMetrics?: boolean;
  batchSize?: number;
}

interface QueryOptions {
  columns?: string[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  cacheTTL?: number;
  skipCache?: boolean;
}

interface ServiceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  cacheHit?: boolean;
  queryMetrics?: QueryMetrics;
  timestamp: Date;
}

/**
 * Enhanced Base Service with optimization features
 */
export class OptimizedBaseService<
  T extends keyof Database["public"]["Tables"],
> extends OriginalBaseService<T> {
  protected options: OptimizedServiceOptions;
  protected serviceMetrics: ServiceMetrics[] = [];

  constructor(
    supabase: SupabaseClient<Database>,
    tableName: T,
    options: OptimizedServiceOptions = {}
  ) {
    super(supabase, tableName);

    this.options = {
      enableQueryOptimization: true,
      defaultCacheTTL: 300000, // 5 minutes
      enableMetrics: true,
      batchSize: 100,
      ...options,
    };
  }

  /**
   * Validation methods (inherited from BaseService)
   */
  protected async validateCreate(_data: Inserts<T>): Promise<void> {
    // Default implementation - can be overridden
    return Promise.resolve();
  }

  protected async validateUpdate(
    _id: string,
    _data: Updates<T>
  ): Promise<void> {
    // Default implementation - can be overridden
    return Promise.resolve();
  }

  /**
   * Enhanced create with optimization
   */
  async optimizedCreate(data: Inserts<T>): Promise<{
    data: Tables<T> | null;
    error: any;
    metrics: QueryMetrics;
  }> {
    if (!this.options.enableQueryOptimization) {
      // Fallback to original create
      try {
        const result = await this.create(data);
        return {
          data: result,
          error: null,
          metrics: this.createFallbackMetrics("CREATE", true),
        };
      } catch (error) {
        return {
          data: null,
          error,
          metrics: this.createFallbackMetrics("CREATE", false),
        };
      }
    }

    const result = await dbOptimization.optimizedInsert(
      this.tableName as string,
      data,
      { returning: ["*"] }
    );

    this.recordServiceMetrics({
      operation: "optimizedCreate",
      duration: result.metrics.duration,
      success: result.metrics.success,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    // Emit domain event if successful
    if (result.data && result.data.length > 0) {
      await this.emitEvent({
        aggregateId: (result.data[0] as any).id,
        aggregateType: String(this.tableName),
        eventType: "created",
        eventData: result.data[0],
        causedBy: "system",
        timestamp: new Date(),
      });
    }

    return {
      data: result.data?.[0] || null,
      error: result.error,
      metrics: result.metrics,
    };
  }

  /**
   * Enhanced findById with optimization
   */
  async optimizedFindById(
    id: string,
    options: QueryOptions = {}
  ): Promise<{
    data: Tables<T> | null;
    error: any;
    metrics: QueryMetrics;
  }> {
    if (!this.options.enableQueryOptimization) {
      // Fallback to original findById
      try {
        const result = await this.findById(id);
        return {
          data: result,
          error: null,
          metrics: this.createFallbackMetrics("SELECT", true),
        };
      } catch (error) {
        return {
          data: null,
          error,
          metrics: this.createFallbackMetrics("SELECT", false),
        };
      }
    }

    const result = await dbOptimization.optimizedSelect<Tables<T>>(
      this.tableName as string,
      {
        columns: options.columns,
        filters: { id },
        cacheTTL: options.cacheTTL || this.options.defaultCacheTTL,
        skipCache: options.skipCache,
      }
    );

    this.recordServiceMetrics({
      operation: "optimizedFindById",
      duration: result.metrics.duration,
      success: result.metrics.success,
      cacheHit: result.metrics.cacheHit,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
      metrics: result.metrics,
    };
  }

  /**
   * Enhanced findMany with optimization
   */
  async optimizedFindMany(
    filters: Partial<Tables<T>> = {},
    options: QueryOptions = {}
  ): Promise<{
    data: Tables<T>[] | null;
    error: any;
    metrics: QueryMetrics;
  }> {
    if (!this.options.enableQueryOptimization) {
      // Fallback to original findMany
      try {
        const result = await this.findMany(filters, options.limit);
        return {
          data: result,
          error: null,
          metrics: this.createFallbackMetrics("SELECT", true),
        };
      } catch (error) {
        return {
          data: null,
          error,
          metrics: this.createFallbackMetrics("SELECT", false),
        };
      }
    }

    const result = await dbOptimization.optimizedSelect<Tables<T>>(
      this.tableName as string,
      {
        columns: options.columns,
        filters,
        orderBy: options.orderBy,
        limit: options.limit,
        offset: options.offset,
        cacheTTL: options.cacheTTL || this.options.defaultCacheTTL,
        skipCache: options.skipCache,
      }
    );

    this.recordServiceMetrics({
      operation: "optimizedFindMany",
      duration: result.metrics.duration,
      success: result.metrics.success,
      cacheHit: result.metrics.cacheHit,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Enhanced update with optimization
   */
  async optimizedUpdate(
    id: string,
    data: Updates<T>
  ): Promise<{
    data: Tables<T> | null;
    error: any;
    metrics: QueryMetrics;
  }> {
    if (!this.options.enableQueryOptimization) {
      // Fallback to original update
      try {
        const result = await this.update(id, data);
        return {
          data: result,
          error: null,
          metrics: this.createFallbackMetrics("UPDATE", true),
        };
      } catch (error) {
        return {
          data: null,
          error,
          metrics: this.createFallbackMetrics("UPDATE", false),
        };
      }
    }

    const result = await dbOptimization.optimizedUpdate<Tables<T>>(
      this.tableName as string,
      data,
      { id },
      { returning: ["*"] }
    );

    this.recordServiceMetrics({
      operation: "optimizedUpdate",
      duration: result.metrics.duration,
      success: result.metrics.success,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    // Emit domain event if successful
    if (result.data && result.data.length > 0) {
      await this.emitEvent({
        aggregateId: id,
        aggregateType: String(this.tableName),
        eventType: "updated",
        eventData: { id, changes: data },
        causedBy: "system",
        timestamp: new Date(),
      });
    }

    return {
      data: result.data?.[0] || null,
      error: result.error,
      metrics: result.metrics,
    };
  }

  /**
   * Enhanced delete with optimization
   */
  async optimizedDelete(id: string): Promise<{
    success: boolean;
    error: any;
    metrics: QueryMetrics;
  }> {
    if (!this.options.enableQueryOptimization) {
      // Fallback to original delete
      try {
        await this.delete(id);
        return {
          success: true,
          error: null,
          metrics: this.createFallbackMetrics("DELETE", true),
        };
      } catch (error) {
        return {
          success: false,
          error,
          metrics: this.createFallbackMetrics("DELETE", false),
        };
      }
    }

    const result = await dbOptimization.optimizedDelete(
      this.tableName as string,
      { id }
    );

    this.recordServiceMetrics({
      operation: "optimizedDelete",
      duration: result.metrics.duration,
      success: result.metrics.success,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    // Emit domain event if successful
    if (result.metrics.success) {
      await this.emitEvent({
        aggregateId: id,
        aggregateType: String(this.tableName),
        eventType: "deleted",
        eventData: { id },
        causedBy: "system",
        timestamp: new Date(),
      });
    }

    return {
      success: result.metrics.success,
      error: result.error,
      metrics: result.metrics,
    };
  }

  /**
   * Batch create with optimization
   */
  async optimizedBatchCreate(
    records: Inserts<T>[],
    batchSize?: number
  ): Promise<{
    data: Tables<T>[] | null;
    error: any;
    metrics: QueryMetrics;
  }> {
    const result = await dbOptimization.batchInsert<Tables<T>>(
      this.tableName as string,
      records,
      batchSize || this.options.batchSize
    );

    this.recordServiceMetrics({
      operation: "optimizedBatchCreate",
      duration: result.metrics.duration,
      success: result.metrics.success,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    // Emit domain events for successful inserts
    if (result.data && result.data.length > 0) {
      for (const record of result.data) {
        await this.emitEvent({
          aggregateId: (record as any).id,
          aggregateType: String(this.tableName),
          eventType: "created",
          eventData: record,
          causedBy: "system",
          timestamp: new Date(),
        });
      }
    }

    return result;
  }

  /**
   * Advanced search with full-text search and optimization
   */
  async optimizedSearch(
    searchTerm: string,
    searchColumns: string[],
    options: QueryOptions & {
      fuzzy?: boolean;
      highlight?: boolean;
    } = {}
  ): Promise<{
    data: Tables<T>[] | null;
    error: any;
    metrics: QueryMetrics;
  }> {
    const filters: Record<string, any> = {};

    // Build text search filters
    if (options.fuzzy) {
      // Use ilike for fuzzy search
      searchColumns.forEach((column) => {
        filters[`${column}:ilike`] = `%${searchTerm}%`;
      });
    } else {
      // Use exact match or full-text search if available
      searchColumns.forEach((column) => {
        filters[`${column}:like`] = `%${searchTerm}%`;
      });
    }

    const result = await dbOptimization.optimizedSelect<Tables<T>>(
      this.tableName as string,
      {
        columns: options.columns,
        filters,
        orderBy: options.orderBy,
        limit: options.limit,
        offset: options.offset,
        cacheTTL: options.cacheTTL || this.options.defaultCacheTTL,
        skipCache: options.skipCache,
      }
    );

    this.recordServiceMetrics({
      operation: "optimizedSearch",
      duration: result.metrics.duration,
      success: result.metrics.success,
      cacheHit: result.metrics.cacheHit,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Get aggregated data with optimization
   */
  async optimizedAggregate(
    aggregations: {
      count?: boolean;
      sum?: string[];
      avg?: string[];
      min?: string[];
      max?: string[];
    },
    filters: Partial<Tables<T>> = {},
    options: { cacheTTL?: number; skipCache?: boolean } = {}
  ): Promise<{
    data: any;
    error: any;
    metrics: QueryMetrics;
  }> {
    // Build select with aggregation functions
    const selectParts: string[] = [];

    if (aggregations.count) {
      selectParts.push("count(*)");
    }

    aggregations.sum?.forEach((col) => selectParts.push(`sum(${col})`));
    aggregations.avg?.forEach((col) => selectParts.push(`avg(${col})`));
    aggregations.min?.forEach((col) => selectParts.push(`min(${col})`));
    aggregations.max?.forEach((col) => selectParts.push(`max(${col})`));

    const result = await dbOptimization.optimizedSelect(
      this.tableName as string,
      {
        columns: selectParts,
        filters,
        cacheTTL: options.cacheTTL || this.options.defaultCacheTTL,
        skipCache: options.skipCache,
      }
    );

    this.recordServiceMetrics({
      operation: "optimizedAggregate",
      duration: result.metrics.duration,
      success: result.metrics.success,
      cacheHit: result.metrics.cacheHit,
      queryMetrics: result.metrics,
      timestamp: new Date(),
    });

    return {
      data: result.data?.[0] || null,
      error: result.error,
      metrics: result.metrics,
    };
  }

  /**
   * Get service performance metrics
   */
  getServiceMetrics(): {
    totalOperations: number;
    averageResponseTime: number;
    successRate: number;
    cacheHitRate: number;
    operationBreakdown: Record<string, number>;
    recentMetrics: ServiceMetrics[];
  } {
    const totalOps = this.serviceMetrics.length;

    if (totalOps === 0) {
      return {
        totalOperations: 0,
        averageResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        operationBreakdown: {},
        recentMetrics: [],
      };
    }

    const totalTime = this.serviceMetrics.reduce(
      (sum, m) => sum + m.duration,
      0
    );
    const successCount = this.serviceMetrics.filter((m) => m.success).length;
    const cacheHits = this.serviceMetrics.filter((m) => m.cacheHit).length;

    const operationBreakdown: Record<string, number> = {};
    this.serviceMetrics.forEach((m) => {
      operationBreakdown[m.operation] =
        (operationBreakdown[m.operation] || 0) + 1;
    });

    return {
      totalOperations: totalOps,
      averageResponseTime: totalTime / totalOps,
      successRate: (successCount / totalOps) * 100,
      cacheHitRate: (cacheHits / totalOps) * 100,
      operationBreakdown,
      recentMetrics: this.serviceMetrics.slice(-10),
    };
  }

  /**
   * Clear service-specific cache
   */
  async clearServiceCache(): Promise<void> {
    // Clear optimization service cache for this table
    const cacheStats = dbOptimization.getCacheStats();
    const tablePrefix = `${this.tableName}:`;

    cacheStats.entries
      .filter((entry) => entry.key.startsWith(tablePrefix))
      .forEach((entry) => {
        // Note: This would need to be implemented in the optimization service
        console.log(`Would clear cache key: ${entry.key}`);
      });

    // Clear base service cache
    await this.cache.clear();
  }

  /**
   * Record service metrics
   */
  private recordServiceMetrics(metrics: ServiceMetrics): void {
    if (!this.options.enableMetrics) return;

    this.serviceMetrics.push(metrics);

    // Keep only last 1000 metrics
    if (this.serviceMetrics.length > 1000) {
      this.serviceMetrics = this.serviceMetrics.slice(-1000);
    }
  }

  /**
   * Create fallback metrics for non-optimized operations
   */
  private createFallbackMetrics(
    operation: string,
    success: boolean
  ): QueryMetrics {
    return {
      query: `${operation} ${this.tableName} (fallback)`,
      duration: 0,
      success,
      cacheHit: false,
      timestamp: new Date(),
    };
  }

  /**
   * Get database optimization metrics
   */
  getDatabaseMetrics() {
    return dbOptimization.getMetrics();
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics() {
    return dbOptimization.getCacheStats();
  }
}

// Factory function to create optimized services
export function createOptimizedService<
  T extends keyof Database["public"]["Tables"],
>(
  supabase: SupabaseClient<Database>,
  tableName: T,
  options?: OptimizedServiceOptions
): OptimizedBaseService<T> {
  return new OptimizedBaseService(supabase, tableName, options);
}

// Export types
export type { OptimizedServiceOptions, QueryOptions, ServiceMetrics };
