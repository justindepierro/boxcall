/**
 * Database Query Optimization Service
 *
 * Provides query caching, connection pooling, performance monitoring,
 * and optimization utilities for Supabase database operations
 */

import { supabase } from "../../lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database";

interface QueryMetrics {
  query: string;
  duration: number;
  success: boolean;
  cacheHit: boolean;
  rowCount?: number;
  error?: string;
  timestamp: Date;
}

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface QueryOptimizationConfig {
  defaultCacheTTL: number;
  maxCacheSize: number;
  slowQueryThreshold: number;
  enableMetrics: boolean;
  enableQueryLogging: boolean;
  connectionPoolSize: number;
}

export class DatabaseOptimizationService {
  private cache = new Map<string, CacheEntry>();
  private metrics: QueryMetrics[] = [];
  private config: QueryOptimizationConfig;
  private connectionPool: SupabaseClient<Database>[] = [];

  constructor(config?: Partial<QueryOptimizationConfig>) {
    this.config = {
      defaultCacheTTL: Number(import.meta.env.VITE_DB_CACHE_TTL) || 300000, // 5 minutes
      maxCacheSize: Number(import.meta.env.VITE_DB_MAX_CACHE_SIZE) || 1000,
      slowQueryThreshold:
        Number(import.meta.env.VITE_SLOW_QUERY_THRESHOLD) || 1000, // 1 second
      enableMetrics: import.meta.env.VITE_DB_ENABLE_METRICS !== "false",
      enableQueryLogging:
        import.meta.env.VITE_DB_ENABLE_QUERY_LOGGING === "true",
      connectionPoolSize:
        Number(import.meta.env.VITE_DB_CONNECTION_POOL_SIZE) || 5,
      ...config,
    };

    this.initializeConnectionPool();
    this.startCacheCleanup();
  }

  /**
   * Initialize connection pool for better performance
   */
  private initializeConnectionPool(): void {
    // Note: Supabase handles connection pooling internally,
    // but we can pre-initialize clients for different use cases
    for (let i = 0; i < this.config.connectionPoolSize; i++) {
      this.connectionPool.push(supabase);
    }
  }

  /**
   * Get a database client from the pool
   */
  private getClient(): SupabaseClient<Database> {
    // For now, return the main client as Supabase handles pooling
    // In a custom implementation, this would rotate through pool
    return supabase;
  }

  /**
   * Generate cache key for a query
   */
  private generateCacheKey(
    table: string,
    filters: any,
    columns?: string[]
  ): string {
    const filterString = JSON.stringify(filters || {});
    const columnString = columns?.join(",") || "*";
    return `${table}:${columnString}:${filterString}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  private setCache<T>(key: string, data: T, ttl?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // Remove oldest 20% of entries
      const removeCount = Math.floor(this.config.maxCacheSize * 0.2);
      for (let i = 0; i < removeCount; i++) {
        this.cache.delete(entries[i][0]);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultCacheTTL,
      key,
    });
  }

  /**
   * Record query metrics
   */
  private recordMetrics(metrics: Omit<QueryMetrics, "timestamp">): void {
    if (!this.config.enableMetrics) return;

    const fullMetrics: QueryMetrics = {
      ...metrics,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetrics);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log slow queries
    if (metrics.duration > this.config.slowQueryThreshold) {
      console.warn(
        `🐌 Slow query detected (${metrics.duration}ms):`,
        metrics.query
      );
    }

    // Log all queries in development
    if (this.config.enableQueryLogging && import.meta.env.DEV) {
      console.log(
        `📊 Query (${metrics.duration}ms, cache: ${metrics.cacheHit}):`,
        metrics.query
      );
    }
  }

  /**
   * Optimized select query with caching
   */
  async optimizedSelect<T = any>(
    table: string,
    options: {
      columns?: string[];
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
      cacheTTL?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<{ data: T[] | null; error: any; metrics: QueryMetrics }> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(
      table,
      options.filters,
      options.columns
    );

    let cacheHit = false;
    let data: T[] | null = null;
    let error: any = null;

    try {
      // Check cache first
      if (!options.skipCache) {
        const cachedData = this.getFromCache<T[]>(cacheKey);
        if (cachedData) {
          cacheHit = true;
          data = cachedData;

          const duration = performance.now() - startTime;
          const metrics: QueryMetrics = {
            query: `SELECT ${options.columns?.join(",") || "*"} FROM ${table} (cached)`,
            duration,
            success: true,
            cacheHit: true,
            rowCount: data?.length,
            timestamp: new Date(),
          };

          this.recordMetrics(metrics);
          return { data, error: null, metrics };
        }
      }

      // Build and execute query with proper type casting
      const client = this.getClient();
      let query: any = (client as any).from(table);

      // Apply column selection
      if (options.columns && options.columns.length > 0) {
        query = query.select(options.columns.join(","));
      } else {
        query = query.select("*");
      }

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === "object" && value !== null) {
            // Handle range filters, etc.
            if ("gte" in value) query = query.gte(key, value.gte);
            if ("lte" in value) query = query.lte(key, value.lte);
            if ("gt" in value) query = query.gt(key, value.gt);
            if ("lt" in value) query = query.lt(key, value.lt);
            if ("like" in value) query = query.like(key, value.like);
            if ("ilike" in value) query = query.ilike(key, value.ilike);
          } else {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false,
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 1000) - 1
        );
      }

      const result = await query;
      data = result.data;
      error = result.error;

      // Cache successful results
      if (!error && data && !options.skipCache) {
        this.setCache(cacheKey, data, options.cacheTTL);
      }
    } catch (err) {
      error = err;
    }

    const duration = performance.now() - startTime;
    const metrics: QueryMetrics = {
      query: `SELECT ${options.columns?.join(",") || "*"} FROM ${table}`,
      duration,
      success: !error,
      cacheHit,
      rowCount: data?.length,
      error: error?.message,
      timestamp: new Date(),
    };

    this.recordMetrics(metrics);
    return { data, error, metrics };
  }

  /**
   * Optimized insert with cache invalidation
   */
  async optimizedInsert<T = any>(
    table: string,
    data: any,
    options: {
      returning?: string[];
      onConflict?: string;
    } = {}
  ): Promise<{ data: T[] | null; error: any; metrics: QueryMetrics }> {
    const startTime = performance.now();

    try {
      const client = this.getClient();
      let query: any = (client as any).from(table).insert(data);

      if (options.returning) {
        query = query.select(options.returning.join(","));
      } else {
        query = query.select();
      }

      if (options.onConflict) {
        // Handle onConflict if supported
        try {
          query = query.onConflict?.(options.onConflict) || query;
        } catch {
          // Ignore if onConflict is not available
        }
      }

      const result = await query;

      // Invalidate related cache entries
      this.invalidateTableCache(table);

      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `INSERT INTO ${table}`,
        duration,
        success: !result.error,
        cacheHit: false,
        rowCount: result.data?.length,
        error: result.error?.message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: result.data, error: result.error, metrics };
    } catch (err) {
      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `INSERT INTO ${table}`,
        duration,
        success: false,
        cacheHit: false,
        error: (err as Error).message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: null, error: err, metrics };
    }
  }

  /**
   * Optimized update with cache invalidation
   */
  async optimizedUpdate<T = any>(
    table: string,
    updates: any,
    filters: Record<string, any>,
    options: {
      returning?: string[];
    } = {}
  ): Promise<{ data: T[] | null; error: any; metrics: QueryMetrics }> {
    const startTime = performance.now();

    try {
      const client = this.getClient();
      let query: any = (client as any).from(table).update(updates);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (options.returning) {
        query = query.select(options.returning.join(","));
      } else {
        query = query.select();
      }

      const result = await query;

      // Invalidate related cache entries
      this.invalidateTableCache(table);

      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `UPDATE ${table}`,
        duration,
        success: !result.error,
        cacheHit: false,
        rowCount: (() => {
          if (Array.isArray(result.data)) return result.data.length;
          if (result.data) return 1;
          return 0;
        })(),
        error: result.error?.message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: result.data, error: result.error, metrics };
    } catch (err) {
      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `UPDATE ${table}`,
        duration,
        success: false,
        cacheHit: false,
        error: (err as Error).message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: null, error: err, metrics };
    }
  }

  /**
   * Optimized delete with cache invalidation
   */
  async optimizedDelete(
    table: string,
    filters: Record<string, any>
  ): Promise<{ data: any; error: any; metrics: QueryMetrics }> {
    const startTime = performance.now();

    try {
      const client = this.getClient();
      let query = (client as any).from(table).delete();

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const result = await query;

      // Invalidate related cache entries
      this.invalidateTableCache(table);

      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `DELETE FROM ${table}`,
        duration,
        success: !result.error,
        cacheHit: false,
        error: result.error?.message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: result.data, error: result.error, metrics };
    } catch (err) {
      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `DELETE FROM ${table}`,
        duration,
        success: false,
        cacheHit: false,
        error: (err as Error).message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: null, error: err, metrics };
    }
  }

  /**
   * Batch operations for better performance
   */
  async batchInsert<T = any>(
    table: string,
    records: any[],
    batchSize: number = 100
  ): Promise<{ data: T[] | null; error: any; metrics: QueryMetrics }> {
    const startTime = performance.now();
    const results: T[] = [];
    let error: any = null;

    try {
      // Process in batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const result = await this.optimizedInsert(table, batch);

        if (result.error) {
          error = result.error;
          break;
        }

        if (result.data) {
          results.push(...result.data);
        }
      }

      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `BATCH INSERT INTO ${table} (${records.length} records)`,
        duration,
        success: !error,
        cacheHit: false,
        rowCount: results.length,
        error: error?.message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: results, error, metrics };
    } catch (err) {
      const duration = performance.now() - startTime;
      const metrics: QueryMetrics = {
        query: `BATCH INSERT INTO ${table}`,
        duration,
        success: false,
        cacheHit: false,
        error: (err as Error).message,
        timestamp: new Date(),
      };

      this.recordMetrics(metrics);
      return { data: null, error: err, metrics };
    }
  }

  /**
   * Invalidate cache entries for a table
   */
  private invalidateTableCache(table: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.cache) {
      if (key.startsWith(`${table}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    totalQueries: number;
    averageResponseTime: number;
    cacheHitRate: number;
    slowQueries: number;
    errorRate: number;
    recentMetrics: QueryMetrics[];
  } {
    const totalQueries = this.metrics.length;

    if (totalQueries === 0) {
      return {
        totalQueries: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        slowQueries: 0,
        errorRate: 0,
        recentMetrics: [],
      };
    }

    const totalTime = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const cacheHits = this.metrics.filter((m) => m.cacheHit).length;
    const slowQueries = this.metrics.filter(
      (m) => m.duration > this.config.slowQueryThreshold
    ).length;
    const errors = this.metrics.filter((m) => !m.success).length;

    return {
      totalQueries,
      averageResponseTime: totalTime / totalQueries,
      cacheHitRate: (cacheHits / totalQueries) * 100,
      slowQueries,
      errorRate: (errors / totalQueries) * 100,
      recentMetrics: this.metrics.slice(-10),
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: { key: string; size: number; age: number }[];
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      age: Date.now() - entry.timestamp,
    }));

    const totalHits = this.metrics.filter((m) => m.cacheHit).length;
    const totalQueries = this.metrics.length;

    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: totalQueries > 0 ? (totalHits / totalQueries) * 100 : 0,
      entries,
    };
  }

  /**
   * Start periodic cache cleanup
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache) {
        if (now > entry.timestamp + entry.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => this.cache.delete(key));

      if (keysToDelete.length > 0) {
        console.log(
          `🧹 Cleaned up ${keysToDelete.length} expired cache entries`
        );
      }
    }, 60000); // Run every minute
  }
}

// Singleton instance
export const dbOptimization = new DatabaseOptimizationService();

// Helper types for better TypeScript support
export type OptimizedSelectOptions = Parameters<
  typeof dbOptimization.optimizedSelect
>[1];
export type OptimizedInsertOptions = Parameters<
  typeof dbOptimization.optimizedInsert
>[2];
export type OptimizedUpdateOptions = Parameters<
  typeof dbOptimization.optimizedUpdate
>[3];

export { type QueryMetrics };
