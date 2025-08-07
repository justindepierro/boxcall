/**
 * Phase 1 Foundation - Base Service Architecture
 * Standardized service pattern for all domain services
 *
 * Features:
 * - Standard CRUD operations with caching
 * - Performance monitoring
 * - Event sourcing support
 * - Error handling and logging
 * - Type safety with database types
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, Inserts, Updates } from "../../types/database";

// Performance monitoring interface
export interface ServiceMetrics {
  operationName: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

// Event sourcing interface
export interface DomainEvent {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: Record<string, unknown>;
  causedBy: string;
  timestamp: Date;
}

// Cache interface
export interface CacheManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Simple in-memory cache implementation
class InMemoryCacheManager implements CacheManager {
  private cache = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const expires = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expires });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Base service abstract class
export abstract class BaseService<
  T extends keyof Database["public"]["Tables"],
> {
  protected supabase: SupabaseClient<Database>;
  protected cache: CacheManager;
  protected tableName: T;
  protected metrics: ServiceMetrics[] = [];

  constructor(
    supabase: SupabaseClient<Database>,
    tableName: T,
    cache?: CacheManager
  ) {
    this.supabase = supabase;
    this.tableName = tableName;
    this.cache = cache || new InMemoryCacheManager();
  }

  // Standard CRUD operations with caching and monitoring

  /**
   * Create a new record
   */
  async create(data: Inserts<T>): Promise<Tables<T>> {
    return this.executeWithMetrics("create", async () => {
      const { data: result, error } = await this.supabase
        .from(this.tableName as string)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      // Invalidate relevant cache entries
      await this.invalidateCache(result.id as string);

      // Emit domain event
      await this.emitEvent({
        aggregateId: result.id as string,
        aggregateType: String(this.tableName),
        eventType: "created",
        eventData: result,
        causedBy: "system", // TODO: Get from auth context
        timestamp: new Date(),
      });

      return result;
    });
  }

  /**
   * Find record by ID with caching
   */
  async findById(id: string): Promise<Tables<T> | null> {
    const cacheKey = `${String(this.tableName)}:${id}`;

    // Check cache first
    const cached = await this.cache.get<Tables<T>>(cacheKey);
    if (cached) return cached;

    return this.executeWithMetrics("findById", async () => {
      const { data, error } = await this.supabase
        .from(this.tableName as string)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Record not found
        throw error;
      }

      // Cache the result
      await this.cache.set(cacheKey, data, 300); // 5 minutes TTL

      return data;
    });
  }

  /**
   * Find multiple records with filtering
   */
  async findMany(
    filters: Partial<Tables<T>> = {},
    limit = 100
  ): Promise<Tables<T>[]> {
    return this.executeWithMetrics("findMany", async () => {
      let query = this.supabase.from(this.tableName as string).select("*");

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query.limit(limit);

      if (error) throw error;

      return data || [];
    });
  }

  /**
   * Update a record
   */
  async update(id: string, data: Updates<T>): Promise<Tables<T>> {
    return this.executeWithMetrics("update", async () => {
      const { data: result, error } = await this.supabase
        .from(this.tableName as string)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Invalidate cache
      await this.invalidateCache(id);

      // Emit domain event
      await this.emitEvent({
        aggregateId: id,
        aggregateType: String(this.tableName),
        eventType: "updated",
        eventData: { id, changes: data },
        causedBy: "system",
        timestamp: new Date(),
      });

      return result;
    });
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    await this.executeWithMetrics("delete", async () => {
      const { error } = await this.supabase
        .from(this.tableName as string)
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Invalidate cache
      await this.invalidateCache(id);

      // Emit domain event
      await this.emitEvent({
        aggregateId: id,
        aggregateType: String(this.tableName),
        eventType: "deleted",
        eventData: { id },
        causedBy: "system",
        timestamp: new Date(),
      });
    });
  }

  /**
   * Count records matching filters
   */
  async count(filters: Partial<Tables<T>> = {}): Promise<number> {
    return this.executeWithMetrics("count", async () => {
      let query = this.supabase
        .from(this.tableName as string)
        .select("*", { count: "exact", head: true });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;

      if (error) throw error;

      return count || 0;
    });
  }

  // Performance monitoring
  protected async executeWithMetrics<R>(
    operationName: string,
    operation: () => Promise<R>
  ): Promise<R> {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;

    try {
      const result = await operation();
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;

      const metric: ServiceMetrics = {
        operationName: `${String(this.tableName)}.${operationName}`,
        duration,
        success,
        errorMessage,
        timestamp: new Date(),
      };

      this.metrics.push(metric);

      // Keep only last 100 metrics
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }

      // Log slow operations (> 1000ms)
      if (duration > 1000) {
        console.warn(
          `Slow operation detected: ${metric.operationName} took ${duration}ms`
        );
      }
    }
  }

  // Event sourcing
  protected async emitEvent(event: DomainEvent): Promise<void> {
    // TODO: Implement proper event sourcing
    // For now, just log the event
    console.log(
      `Domain Event: ${event.eventType} for ${event.aggregateType}:${event.aggregateId}`
    );
  }

  // Cache management
  protected async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await this.cache.delete(`${String(this.tableName)}:${id}`);
    }
    // Could also invalidate list caches here
  }

  // Performance metrics
  getMetrics(): ServiceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    return total / this.metrics.length;
  }

  getSuccessRate(): number {
    if (this.metrics.length === 0) return 100;
    const successful = this.metrics.filter((m) => m.success).length;
    return (successful / this.metrics.length) * 100;
  }

  // Abstract methods for domain-specific logic
  protected abstract validateCreate(data: Inserts<T>): Promise<void>;
  protected abstract validateUpdate(
    id: string,
    data: Updates<T>
  ): Promise<void>;
}
