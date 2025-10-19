/**
 * Practice Script Caching Service
 * 
 * High-performance caching layer for practice scripts with:
 * - In-memory cache for instant access
 * - IndexedDB for offline support
 * - Automatic cache invalidation
 * - Optimistic updates
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  avgResponseTime: number;
}

class PracticeScriptCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private metrics: CacheMetrics = { hits: 0, misses: 0, avgResponseTime: 0 };
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly DB_NAME = "PracticeScriptCache";
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("scripts")) {
          db.createObjectStore("scripts", { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Get cached data with automatic freshness check
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();

    // Level 1: Check in-memory cache (instant)
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && !this.isStale(memoryEntry)) {
      this.recordHit(performance.now() - startTime);
      return memoryEntry.data as T;
    }

    // Level 2: Check IndexedDB (fast)
    const indexedEntry = await this.getFromIndexedDB<T>(key);
    if (indexedEntry && !this.isStale(indexedEntry)) {
      // Promote to memory cache
      this.cache.set(key, indexedEntry);
      this.recordHit(performance.now() - startTime);
      return indexedEntry.data;
    }

    this.recordMiss(performance.now() - startTime);
    return null;
  }

  /**
   * Set cache data with automatic persistence
   */
  async set<T>(key: string, data: T, version = 1): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version,
    };

    // Store in memory
    this.cache.set(key, entry);

    // Store in IndexedDB
    await this.setInIndexedDB(key, entry);
  }

  /**
   * Invalidate specific cache entry
   */
  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
    await this.deleteFromIndexedDB(key);
  }

  /**
   * Invalidate all cache entries matching pattern
   */
  async invalidatePattern(pattern: RegExp): Promise<void> {
    const keysToDelete: string[] = [];

    // Clear from memory
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key);
        this.cache.delete(key);
      }
    }

    // Clear from IndexedDB
    for (const key of keysToDelete) {
      await this.deleteFromIndexedDB(key);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    await this.clearIndexedDB();
  }

  /**
   * Get cache metrics for monitoring
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  private isStale(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.CACHE_TTL;
  }

  private recordHit(responseTime: number): void {
    this.metrics.hits++;
    this.updateAvgResponseTime(responseTime);
  }

  private recordMiss(responseTime: number): void {
    this.metrics.misses++;
    this.updateAvgResponseTime(responseTime);
  }

  private updateAvgResponseTime(responseTime: number): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.avgResponseTime =
      (this.metrics.avgResponseTime * (total - 1) + responseTime) / total;
  }

  private async getFromIndexedDB<T>(key: string): Promise<CacheEntry<T> | null> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["scripts"], "readonly");
      const store = transaction.objectStore("scripts");
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.entry : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async setInIndexedDB<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["scripts"], "readwrite");
      const store = transaction.objectStore("scripts");
      const request = store.put({ key, entry });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["scripts"], "readwrite");
      const store = transaction.objectStore("scripts");
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearIndexedDB(): Promise<void> {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["scripts"], "readwrite");
      const store = transaction.objectStore("scripts");
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const practiceScriptCache = new PracticeScriptCacheService();
