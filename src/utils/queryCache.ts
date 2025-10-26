/**
 * Database Query Cache Utility
 * Phase 2: Database Query Optimization
 *
 * Provides client-side caching for Supabase queries to reduce network requests
 * and improve performance while maintaining data freshness.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  key?: string; // Custom cache key
  force?: boolean; // Force fresh data
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum cache entries

  private generateKey(query: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${query}:${paramStr}`;
  }

  public createKey(query: string, params?: any): string {
    return this.generateKey(query, params);
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If still too large, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.cleanup();
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for this
    };
  }
}

// Global cache instance
const queryCache = new QueryCache();

// Cache-enabled query wrapper
export async function cachedQuery<T>(
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    key,
    force = false,
  } = options;

  // Generate cache key from function if not provided
  const cacheKey = key || queryCache.createKey(queryFn.toString());

  // Return cached data if available and not forced refresh
  if (!force) {
    const cached = queryCache.get<T>(cacheKey);
    if (cached !== null) {
      if (import.meta.env.DEV) {
        console.log('🚀 Cache hit for:', cacheKey);
      }
      return cached;
    }
  }

  // Fetch fresh data
  try {
    const data = await queryFn();
    queryCache.set(cacheKey, data, ttl);

    if (import.meta.env.DEV) {
      console.log('📡 Fresh data for:', cacheKey);
    }

    return data;
  } catch (error) {
    // On error, try to return stale data if available
    const stale = queryCache.get<T>(cacheKey);
    if (stale !== null) {
      console.warn('⚠️ Returning stale data due to error:', error);
      return stale;
    }
    throw error;
  }
}

// Cache invalidation helpers
export const invalidateCache = (pattern?: string) => {
  queryCache.invalidate(pattern);
};

// Invalidate specific query types
export const invalidateTeamData = () => invalidateCache('teams');
export const invalidateUserData = () => invalidateCache('users');
export const invalidatePlayData = () => invalidateCache('plays');
export const invalidateGamePlanData = () => invalidateCache('game_plans');

// Cache statistics for monitoring
export const getCacheStats = () => queryCache.getStats();

// React hook for cache-aware queries
export function useCachedQuery<T>(
  queryFn: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...cacheOptions } = options;

  return cachedQuery(
    queryFn,
    enabled ? cacheOptions : { ...cacheOptions, force: true }
  );
}

// Connection pooling helper (for future use with multiple Supabase instances)
export class ConnectionPool {
  private static instance: ConnectionPool;
  private connections = new Map<string, any>();

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  getConnection(key: string) {
    return this.connections.get(key);
  }

  setConnection(key: string, connection: any) {
    this.connections.set(key, connection);
  }
}

export const connectionPool = ConnectionPool.getInstance();