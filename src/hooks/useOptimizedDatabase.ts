/**
 * React Hooks for Database Optimization
 * 
 * Provides React hooks for using optimized database operations
 * with automatic state management, error handling, and performance monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { OptimizedBaseService, type QueryOptions } from '../services/base/OptimizedBaseService';
import { dbOptimization, type QueryMetrics } from '../services/database/DatabaseOptimizationService';
import type { Database } from '../types/database';

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];

interface UseOptimizedQueryState<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  metrics?: QueryMetrics;
  refetch: () => Promise<void>;
}

interface UseOptimizedMutationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  metrics?: QueryMetrics;
  mutate: (data: any) => Promise<void>;
  reset: () => void;
}

interface UseOptimizedCacheState {
  hitRate: number;
  size: number;
  maxSize: number;
  entries: number;
  clearCache: () => void;
}

/**
 * Hook for optimized data fetching with caching
 */
export function useOptimizedQuery<T extends keyof Database["public"]["Tables"]>(
  service: OptimizedBaseService<T>,
  filters?: Partial<Tables<T>>,
  options?: QueryOptions & {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
): UseOptimizedQueryState<Tables<T>> {
  const [state, setState] = useState<UseOptimizedQueryState<Tables<T>>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    if (options?.enabled === false) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check stale time
    const now = Date.now();
    const staleTime = options?.staleTime || 0;
    if (staleTime > 0 && now - lastFetchRef.current < staleTime) {
      return;
    }

    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await service.optimizedFindMany(filters || {}, options);
      
      if (abortControllerRef.current?.signal.aborted) return;

      lastFetchRef.current = now;
      
      setState({
        data: result.data,
        loading: false,
        error: result.error ? new Error(result.error.message) : null,
        metrics: result.metrics,
        refetch: fetchData
      });
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [service, filters, options]);

  useEffect(() => {
    fetchData();

    // Set up refetch interval
    let intervalId: NodeJS.Timeout | null = null;
    if (options?.refetchInterval && options.refetchInterval > 0) {
      intervalId = setInterval(fetchData, options.refetchInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, options?.refetchInterval]);

  return state;
}

/**
 * Hook for optimized single record fetching
 */
export function useOptimizedRecord<T extends keyof Database["public"]["Tables"]>(
  service: OptimizedBaseService<T>,
  id: string | null,
  options?: QueryOptions & {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
): UseOptimizedQueryState<Tables<T>> {
  const [state, setState] = useState<UseOptimizedQueryState<Tables<T>>>({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    if (!id || options?.enabled === false) {
      setState(prev => ({ ...prev, loading: false, data: null }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check stale time
    const now = Date.now();
    const staleTime = options?.staleTime || 0;
    if (staleTime > 0 && now - lastFetchRef.current < staleTime) {
      return;
    }

    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await service.optimizedFindById(id, options);
      
      if (abortControllerRef.current?.signal.aborted) return;

      lastFetchRef.current = now;
      
      setState({
        data: result.data ? [result.data] : null,
        loading: false,
        error: result.error ? new Error(result.error.message) : null,
        metrics: result.metrics,
        refetch: fetchData
      });
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) return;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [service, id, options]);

  useEffect(() => {
    fetchData();

    // Set up refetch interval
    let intervalId: NodeJS.Timeout | null = null;
    if (options?.refetchInterval && options.refetchInterval > 0) {
      intervalId = setInterval(fetchData, options.refetchInterval);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, options?.refetchInterval]);

  return state;
}

/**
 * Hook for optimized data mutations (create, update, delete)
 */
export function useOptimizedMutation<T extends keyof Database["public"]["Tables"]>(
  service: OptimizedBaseService<T>,
  operation: 'create' | 'update' | 'delete'
): UseOptimizedMutationState<Tables<T>> {
  const [state, setState] = useState<UseOptimizedMutationState<Tables<T>>>({
    data: null,
    loading: false,
    error: null,
    mutate: async () => {},
    reset: () => {}
  });

  const mutate = useCallback(async (data: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let result;

      switch (operation) {
        case 'create':
          result = await service.optimizedCreate(data as Inserts<T>);
          break;
        case 'update':
          if (!data.id) throw new Error('ID is required for update operation');
          result = await service.optimizedUpdate(data.id, data as Updates<T>);
          break;
        case 'delete':
          {
            if (!data.id && typeof data !== 'string') throw new Error('ID is required for delete operation');
            const deleteResult = await service.optimizedDelete(typeof data === 'string' ? data : data.id);
            result = {
              data: deleteResult.success ? {} : null,
              error: deleteResult.error,
              metrics: deleteResult.metrics
            };
          }
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      setState(prev => ({
        ...prev,
        data: result.data as Tables<T>,
        loading: false,
        error: result.error ? new Error(result.error.message) : null,
        metrics: result.metrics
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [service, operation]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: null,
      error: null,
      metrics: undefined
    }));
  }, []);

  return {
    ...state,
    mutate,
    reset
  };
}

/**
 * Hook for batch operations
 */
export function useOptimizedBatch<T extends keyof Database["public"]["Tables"]>(
  service: OptimizedBaseService<T>
): {
  data: Tables<T>[] | null;
  loading: boolean;
  error: Error | null;
  metrics?: QueryMetrics;
  batchCreate: (records: Inserts<T>[], batchSize?: number) => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState({
    data: null as Tables<T>[] | null,
    loading: false,
    error: null as Error | null,
    metrics: undefined as QueryMetrics | undefined
  });

  const batchCreate = useCallback(async (records: Inserts<T>[], batchSize?: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await service.optimizedBatchCreate(records, batchSize);
      
      setState({
        data: result.data,
        loading: false,
        error: result.error ? new Error(result.error.message) : null,
        metrics: result.metrics
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [service]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      metrics: undefined
    });
  }, []);

  return {
    ...state,
    batchCreate,
    reset
  };
}

/**
 * Hook for search functionality
 */
export function useOptimizedSearch<T extends keyof Database["public"]["Tables"]>(
  service: OptimizedBaseService<T>,
  searchColumns: string[]
): {
  data: Tables<T>[] | null;
  loading: boolean;
  error: Error | null;
  metrics?: QueryMetrics;
  search: (term: string, options?: QueryOptions & { fuzzy?: boolean }) => Promise<void>;
  clear: () => void;
} {
  const [state, setState] = useState({
    data: null as Tables<T>[] | null,
    loading: false,
    error: null as Error | null,
    metrics: undefined as QueryMetrics | undefined
  });

  const search = useCallback(async (
    term: string, 
    options?: QueryOptions & { fuzzy?: boolean }
  ) => {
    if (!term.trim()) {
      setState(prev => ({ ...prev, data: null, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await service.optimizedSearch(term, searchColumns, options);
      
      setState({
        data: result.data,
        loading: false,
        error: result.error ? new Error(result.error.message) : null,
        metrics: result.metrics
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      }));
    }
  }, [service, searchColumns]);

  const clear = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      metrics: undefined
    });
  }, []);

  return {
    ...state,
    search,
    clear
  };
}

/**
 * Hook for monitoring database performance
 */
export function useOptimizedMetrics(
  service?: OptimizedBaseService<any>
): {
  databaseMetrics: ReturnType<typeof dbOptimization.getMetrics>;
  serviceMetrics?: any;
  cacheStats: ReturnType<typeof dbOptimization.getCacheStats>;
  refresh: () => void;
} {
  const [metrics, setMetrics] = useState({
    databaseMetrics: dbOptimization.getMetrics(),
    serviceMetrics: service?.getServiceMetrics(),
    cacheStats: dbOptimization.getCacheStats()
  });

  const refresh = useCallback(() => {
    setMetrics({
      databaseMetrics: dbOptimization.getMetrics(),
      serviceMetrics: service?.getServiceMetrics(),
      cacheStats: dbOptimization.getCacheStats()
    });
  }, [service]);

  useEffect(() => {
    const interval = setInterval(refresh, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    ...metrics,
    refresh
  };
}

/**
 * Hook for cache management
 */
export function useOptimizedCache(): UseOptimizedCacheState {
  const [cacheStats, setCacheStats] = useState(dbOptimization.getCacheStats());

  const clearCache = useCallback(() => {
    dbOptimization.clearCache();
    setCacheStats(dbOptimization.getCacheStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(dbOptimization.getCacheStats());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    hitRate: cacheStats.hitRate,
    size: cacheStats.size,
    maxSize: cacheStats.maxSize,
    entries: cacheStats.entries.length,
    clearCache
  };
}

/**
 * Hook for real-time performance monitoring
 */
export function useOptimizedPerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState({
    slowQueries: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    totalQueries: 0
  });

  useEffect(() => {
    const updatePerformance = () => {
      const metrics = dbOptimization.getMetrics();
      setPerformanceData({
        slowQueries: metrics.slowQueries,
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        cacheHitRate: metrics.cacheHitRate,
        totalQueries: metrics.totalQueries
      });
    };

    updatePerformance();
    const interval = setInterval(updatePerformance, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return performanceData;
}