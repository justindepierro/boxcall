/**
 * Advanced Caching Strategies for Phase 3 Optimization
 *
 * Implements component-level memoization, query deduplication,
 * and intelligent cache invalidation for maximum performance
 */

import { useMemo, useCallback, useRef } from 'react';

// Component-level memoization with deep comparison
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const prevDeps = useRef<React.DependencyList | undefined>(undefined);
  const prevResult = useRef<T | undefined>(undefined);

  const depsChanged = !prevDeps.current ||
    deps.length !== prevDeps.current.length ||
    deps.some((dep, index) => !Object.is(dep, prevDeps.current![index]));

  if (depsChanged) {
    prevDeps.current = deps;
    prevResult.current = factory();
  }

  return prevResult.current!;
}

// Query deduplication cache
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private pending = new Map<string, Promise<any>>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    // Return pending request if exists
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Fetch new data
    const promise = fetcher()
      .then(data => {
        this.cache.set(key, { data, timestamp: now, ttl });
        this.pending.delete(key);
        return data;
      })
      .catch(error => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.pending.clear();
  }
}

// Global query cache instance
export const queryCache = new QueryCache();

// React hook for cached queries
export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
) {
  return useMemo(() => {
    return queryCache.get(key, fetcher, ttl);
  }, [key, fetcher, ttl]);
}

// Intelligent cache invalidation based on data patterns
export class CacheInvalidator {
  private patterns = new Map<string, Set<string>>();

  register(pattern: string, keys: string[]): void {
    if (!this.patterns.has(pattern)) {
      this.patterns.set(pattern, new Set());
    }
    keys.forEach(key => this.patterns.get(pattern)!.add(key));
  }

  invalidate(pattern: string): void {
    const keys = this.patterns.get(pattern);
    if (keys) {
      keys.forEach(key => queryCache.invalidate(key));
    }
  }

  invalidateAll(): void {
    queryCache.clear();
    this.patterns.clear();
  }
}

// Global cache invalidator instance
export const cacheInvalidator = new CacheInvalidator();

// Component render optimization with bailout
export function useOptimizedRender(
  componentName: string,
  shouldRender: boolean = true
) {
  const renderCount = useRef(0);
  const lastRender = useRef(Date.now());

  if (!shouldRender) {
    return false;
  }

  renderCount.current++;
  const now = Date.now();

  // Throttle renders to prevent excessive updates
  if (now - lastRender.current < 16) { // 60fps limit
    return false;
  }

  lastRender.current = now;

  if (import.meta.env.DEV && renderCount.current > 10) {
    console.warn(`${componentName} has rendered ${renderCount.current} times`);
  }

  return true;
}

// Memory-efficient event debouncing
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

// Preload critical resources
export function useResourcePreloader(urls: string[]) {
  useMemo(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = url.endsWith('.js') ? 'script' :
               url.endsWith('.css') ? 'style' : 'fetch';
      document.head.appendChild(link);
    });
  }, [urls]);
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const elementRef = useRef<Element | null>(null);

  useMemo(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [callback, options]);

  return elementRef;
}