/**
 * Database Optimization Integration Tests
 * 
 * Tests the database optimization system including caching,
 * performance monitoring, and React hooks integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { DatabaseOptimizationService } from '../src/services/database/DatabaseOptimizationService';
import { OptimizedBaseService } from '../src/services/base/OptimizedBaseService';
import { useOptimizedQuery, useOptimizedMutation } from '../src/hooks/useOptimizedDatabase';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        limit: vi.fn(() => ({
          data: [
            { id: '1', name: 'Test User 1', email: 'test1@example.com' },
            { id: '2', name: 'Test User 2', email: 'test2@example.com' }
          ],
          error: null
        }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          data: { id: '3', name: 'New User', email: 'new@example.com' },
          error: null
        }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '1', name: 'Updated User', email: 'updated@example.com' },
            error: null
          }))
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }))
};

describe('Database Optimization System', () => {
  let dbOptimization: DatabaseOptimizationService;
  let optimizedService: OptimizedBaseService<'users'>;

  beforeEach(() => {
    // Clear any existing state
    vi.clearAllMocks();
    
    // Create fresh instances
    dbOptimization = new DatabaseOptimizationService({
      defaultCacheTTL: 1000, // 1 second for testing
      maxCacheSize: 10,
      slowQueryThreshold: 100,
      enableMetrics: true,
      enableQueryLogging: false
    });

    optimizedService = new OptimizedBaseService(
      mockSupabaseClient as any,
      'users' as any,
      {
        enableQueryOptimization: true,
        defaultCacheTTL: 1000,
        enableMetrics: true
      }
    );
  });

  describe('DatabaseOptimizationService', () => {
    it('should cache query results', async () => {
      const filters = { status: 'active' };
      
      // First query
      const result1 = await dbOptimization.optimizedSelect('users', { filters });
      expect(result1.metrics.cacheHit).toBe(false);
      
      // Second query should hit cache
      const result2 = await dbOptimization.optimizedSelect('users', { filters });
      expect(result2.metrics.cacheHit).toBe(true);
      expect(result2.data).toEqual(result1.data);
    });

    it('should invalidate cache on mutations', async () => {
      const filters = { status: 'active' };
      
      // Query to populate cache
      await dbOptimization.optimizedSelect('users', { filters });
      
      // Insert should invalidate cache
      await dbOptimization.optimizedInsert('users', { name: 'New User' });
      
      // Next query should not hit cache
      const result = await dbOptimization.optimizedSelect('users', { filters });
      expect(result.metrics.cacheHit).toBe(false);
    });

    it('should track performance metrics', async () => {
      await dbOptimization.optimizedSelect('users', { filters: {} });
      await dbOptimization.optimizedSelect('users', { filters: {} }); // Cache hit
      
      const metrics = dbOptimization.getMetrics();
      
      expect(metrics.totalQueries).toBe(2);
      expect(metrics.cacheHitRate).toBe(50); // 1 out of 2 was cache hit
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
    });

    it('should handle batch operations', async () => {
      const records = [
        { name: 'User 1', email: 'user1@example.com' },
        { name: 'User 2', email: 'user2@example.com' }
      ];
      
      const result = await dbOptimization.batchInsert('users', records, 1);
      
      expect(result.metrics.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should manage cache size limits', async () => {
      // Fill cache beyond limit
      for (let i = 0; i < 15; i++) {
        await dbOptimization.optimizedSelect('users', { 
          filters: { id: `user_${i}` } 
        });
      }
      
      const cacheStats = dbOptimization.getCacheStats();
      expect(cacheStats.size).toBeLessThanOrEqual(10); // Max cache size
    });
  });

  describe('OptimizedBaseService', () => {
    it('should provide optimized CRUD operations', async () => {
      // Test optimized create
      const createResult = await optimizedService.optimizedCreate({
        name: 'Test User',
        email: 'test@example.com'
      });
      
      expect(createResult.data).toBeDefined();
      expect(createResult.metrics.success).toBe(true);
      
      // Test optimized find
      const findResult = await optimizedService.optimizedFindById('1');
      expect(findResult.data).toBeDefined();
      expect(findResult.metrics).toBeDefined();
      
      // Test optimized update
      const updateResult = await optimizedService.optimizedUpdate('1', {
        name: 'Updated Name'
      });
      expect(updateResult.data).toBeDefined();
      expect(updateResult.metrics.success).toBe(true);
    });

    it('should provide service-level metrics', async () => {
      await optimizedService.optimizedFindMany({ status: 'active' });
      await optimizedService.optimizedFindById('1');
      
      const metrics = optimizedService.getServiceMetrics();
      
      expect(metrics.totalOperations).toBe(2);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.operationBreakdown).toBeDefined();
    });

    it('should support search functionality', async () => {
      const result = await optimizedService.optimizedSearch(
        'test',
        ['name', 'email'],
        { fuzzy: true, limit: 10 }
      );
      
      expect(result.data).toBeDefined();
      expect(result.metrics.success).toBe(true);
    });

    it('should support aggregation queries', async () => {
      const result = await optimizedService.optimizedAggregate(
        { count: true, sum: ['score'] },
        { status: 'active' }
      );
      
      expect(result.data).toBeDefined();
      expect(result.metrics.success).toBe(true);
    });
  });

  describe('React Hooks', () => {
    it('should handle optimized queries', async () => {
      const { result } = renderHook(() =>
        useOptimizedQuery(
          optimizedService,
          { status: 'active' },
          { limit: 10 }
        )
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);

      // Wait for query to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBe(null);
      expect(result.current.metrics).toBeDefined();
    });

    it('should handle optimized mutations', async () => {
      const { result } = renderHook(() =>
        useOptimizedMutation(optimizedService, 'create')
      );

      // Initially not loading
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);

      // Trigger mutation
      await result.current.mutate({
        name: 'New User',
        email: 'new@example.com'
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.error).toBe(null);
      expect(result.current.metrics).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should expire cached entries after TTL', async () => {
      const filters = { id: 'test' };
      
      // Query to populate cache
      const result1 = await dbOptimization.optimizedSelect('users', { filters });
      expect(result1.metrics.cacheHit).toBe(false);
      
      // Immediately query again - should hit cache
      const result2 = await dbOptimization.optimizedSelect('users', { filters });
      expect(result2.metrics.cacheHit).toBe(true);
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds
      
      // Query again - should not hit cache
      const result3 = await dbOptimization.optimizedSelect('users', { filters });
      expect(result3.metrics.cacheHit).toBe(false);
    });

    it('should clear cache manually', async () => {
      // Populate cache
      await dbOptimization.optimizedSelect('users', { filters: { id: '1' } });
      
      let cacheStats = dbOptimization.getCacheStats();
      expect(cacheStats.size).toBeGreaterThan(0);
      
      // Clear cache
      dbOptimization.clearCache();
      
      cacheStats = dbOptimization.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });
  });

  describe('Performance Monitoring', () => {
    it('should detect slow queries', async () => {
      // Mock a slow operation
      const originalSelect = dbOptimization.optimizedSelect;
      vi.spyOn(dbOptimization, 'optimizedSelect').mockImplementation(async (...args) => {
        // Add delay to simulate slow query
        await new Promise(resolve => setTimeout(resolve, 150));
        return originalSelect.apply(dbOptimization, args);
      });
      
      await dbOptimization.optimizedSelect('users', { filters: {} });
      
      const metrics = dbOptimization.getMetrics();
      expect(metrics.slowQueries).toBe(1); // Should detect 1 slow query
    });

    it('should track error rates', async () => {
      // Mock an error
      const mockErrorClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => {
            throw new Error('Database error');
          })
        }))
      };

      const errorService = new OptimizedBaseService(
        mockErrorClient as any,
        'users' as any
      );

      try {
        await errorService.optimizedFindMany({});
      } catch (_error) {
        // Expected error
      }

      const metrics = errorService.getServiceMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should demonstrate cache performance benefits', async () => {
    const dbOptimization = new DatabaseOptimizationService({
      defaultCacheTTL: 10000,
      enableMetrics: true
    });

    const filters = { status: 'active' };
    
    // First query (no cache)
    const start1 = performance.now();
    await dbOptimization.optimizedSelect('users', { filters });
    const duration1 = performance.now() - start1;
    
    // Second query (with cache)
    const start2 = performance.now();
    await dbOptimization.optimizedSelect('users', { filters });
    const duration2 = performance.now() - start2;
    
    // Cached query should be significantly faster
    expect(duration2).toBeLessThan(duration1 * 0.5);
  });

  it('should handle concurrent queries efficiently', async () => {
    const dbOptimization = new DatabaseOptimizationService({
      defaultCacheTTL: 10000,
      enableMetrics: true
    });

    const promises = Array.from({ length: 10 }, (_, i) =>
      dbOptimization.optimizedSelect('users', { 
        filters: { id: `user_${i % 3}` } // Some overlap for cache hits
      })
    );

    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result.metrics.success).toBe(true);
    });

    const metrics = dbOptimization.getMetrics();
    expect(metrics.cacheHitRate).toBeGreaterThan(0); // Should have some cache hits
  });
});