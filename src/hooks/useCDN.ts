/**
 * CDN and Asset Management Hooks
 * 
 * React hooks for asset optimization, lazy loading, and CDN integration
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { cdnService, AssetLoader } from '../services/cdn/CDNService';

// Hook for CDN-optimized URLs
export function useCDN() {
  const getOptimizedUrl = useCallback((src: string, options?: any) => {
    return cdnService.getOptimizedImageUrl(src, options);
  }, []);

  const preloadAsset = useCallback((src: string, type?: 'image' | 'script' | 'style' | 'font') => {
    return cdnService.preloadAsset(src, type);
  }, []);

  const prefetchAsset = useCallback((src: string) => {
    cdnService.prefetchAsset(src);
  }, []);

  const getResponsiveSrcSet = useCallback((src: string, sizes: number[], options?: any) => {
    return cdnService.getResponsiveImageSrcSet(src, sizes, options);
  }, []);

  return {
    getOptimizedUrl,
    preloadAsset,
    prefetchAsset,
    getResponsiveSrcSet,
    getCacheStats: cdnService.getCacheStats.bind(cdnService),
    clearCache: cdnService.clearCache.bind(cdnService)
  };
}

// Hook for route-based asset preloading
export function useRouteAssets(routeName?: string) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadedRoutes, setLoadedRoutes] = useState<Set<string>>(new Set());

  const currentRoute = routeName || location.pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    if (loadedRoutes.has(currentRoute)) return;

    setIsLoading(true);
    AssetLoader.preloadRouteAssets(currentRoute)
      .then(() => {
        setLoadedRoutes(prev => new Set(prev).add(currentRoute));
      })
      .catch(error => {
        console.warn(`Failed to preload assets for route ${currentRoute}:`, error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentRoute, loadedRoutes]);

  const preloadRoute = useCallback((route: string) => {
    if (loadedRoutes.has(route)) return Promise.resolve();

    return AssetLoader.preloadRouteAssets(route).then(() => {
      setLoadedRoutes(prev => new Set(prev).add(route));
    });
  }, [loadedRoutes]);

  return {
    isLoading,
    loadedRoutes: Array.from(loadedRoutes),
    preloadRoute
  };
}

// Hook for lazy loading with Intersection Observer
export function useLazyLoading(threshold = 0.1, rootMargin = '50px') {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return { isInView, ref: setRef };
}

// Hook for dynamic script loading
export function useScript(src: string, options?: { async?: boolean; defer?: boolean; attributes?: Record<string, string> }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!src) {
      setStatus('ready');
      return;
    }

    setStatus('loading');

    AssetLoader.loadScript(src, options?.attributes)
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, [src, options?.attributes]);

  return status;
}

// Hook for dynamic stylesheet loading
export function useStylesheet(href: string, options?: { attributes?: Record<string, string> }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!href) {
      setStatus('ready');
      return;
    }

    setStatus('loading');

    AssetLoader.loadStylesheet(href, options?.attributes)
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, [href, options?.attributes]);

  return status;
}

// Hook for performance monitoring of asset loading
export function useAssetPerformance() {
  const [metrics, setMetrics] = useState<{
    loadTime: number;
    assetCount: number;
    cacheHitRate: number;
  }>({ loadTime: 0, assetCount: 0, cacheHitRate: 0 });

  useEffect(() => {
    const updateMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource');
      const cacheStats = cdnService.getCacheStats();

      setMetrics({
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        assetCount: resources.length,
        cacheHitRate: cacheStats.cacheHitRate
      });
    };

    // Update metrics on load
    if (document.readyState === 'complete') {
      updateMetrics();
    } else {
      window.addEventListener('load', updateMetrics);
    }

    // Periodic updates
    const interval = setInterval(updateMetrics, 5000);

    return () => {
      window.removeEventListener('load', updateMetrics);
      clearInterval(interval);
    };
  }, []);

  return metrics;
}

// Hook for responsive image sizes
export function useResponsiveImage(src: string, breakpoints: { [key: string]: number } = {}) {
  const [currentSize, setCurrentSize] = useState<number>();

  const defaultBreakpoints = useMemo(() => ({
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    ...breakpoints
  }), [breakpoints]);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const sizes = Object.values(defaultBreakpoints).sort((a, b) => a - b);
      const appropriateSize = sizes.find(size => width <= size) || sizes[sizes.length - 1];
      setCurrentSize(appropriateSize);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, [breakpoints, defaultBreakpoints]);

  const { getOptimizedUrl, getResponsiveSrcSet } = useCDN();

  return {
    currentSize,
    optimizedUrl: currentSize ? getOptimizedUrl(src, { width: currentSize }) : src,
    srcSet: getResponsiveSrcSet(src, Object.values(defaultBreakpoints)),
    sizes: Object.entries(defaultBreakpoints)
      .map(([_, size]) => `(max-width: ${size}px) ${size}px`)
      .join(', ')
  };
}