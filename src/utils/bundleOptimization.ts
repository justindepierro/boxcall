/**
 * Bundle Optimization Utilities
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */
import React from "react";

// Code splitting utilities
export const loadAsync = <T>(importFn: () => Promise<{ default: T }>) => {
  return importFn().then((module) => module.default);
};

// Lazy loading with error handling
export const createLazyComponent = <
  T extends React.ComponentType<Record<string, unknown>>,
>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return React.lazy(() =>
    importFn().catch((_error) => {
      // console.error("Failed to load component:", _error);
      // Return fallback component wrapped in default export
      const FallbackComponent =
        fallback ||
        (() => React.createElement("div", null, "Failed to load component"));
      return {
        default: FallbackComponent as T,
      };
    })
  );
};

// Resource preloading
export const preloadResource = (
  href: string,
  as: string,
  crossorigin?: boolean
) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;
  if (crossorigin) {
    link.crossOrigin = "anonymous";
  }
  document.head.appendChild(link);
};

// Module preloading
export const preloadModule = (moduleUrl: string) => {
  const link = document.createElement("link");
  link.rel = "modulepreload";
  link.href = moduleUrl;
  document.head.appendChild(link);
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string) => {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

// Bundle analysis utilities
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === "development") {
    // Log bundle information for development analysis
    const performanceEntries = performance.getEntriesByType("navigation");
    if (performanceEntries.length > 0) {
      const _navigationEntry =
        performanceEntries[0] as PerformanceNavigationTiming;
      // console.info("📦 Bundle Analysis");
      // console.info("Total Load Time:", _navigationEntry.loadEventEnd - _navigationEntry.fetchStart, "ms");
      // console.info("DOMContentLoaded:", _navigationEntry.domContentLoadedEventEnd - _navigationEntry.fetchStart, "ms");
      // console.info("First Contentful Paint:", "Check Lighthouse for FCP metrics");
      // end group
    }
  }
};

// Dynamic import with retry
export const dynamicImportWithRetry = async <T>(
  importFn: () => Promise<T>,
  maxRetries = 3,
  _delay = 1000
): Promise<T> => {
  let _lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFn();
    } catch (error) {
      _lastError = error as Error;
      // console.warn(`Dynamic import failed (attempt ${i + 1}/${maxRetries}):`, error);

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, _delay * (i + 1)));
      }
    }
  }

  throw _lastError!;
};

// Service worker registration for caching
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.register("/sw.js");
    // console.info("Service Worker registered successfully:", registration);
    return registration;
  } else {
    throw new Error("Service Worker not supported");
  }
};

// Prefetch next page resources
export const prefetchRoute = (route: string) => {
  // Prefetch route data
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = route;
  document.head.appendChild(link);
};

// Image optimization utilities
export const createOptimizedImageSrc = (
  src: string,
  width?: number,
  height?: number,
  format: "webp" | "avif" | "jpg" | "png" = "webp"
) => {
  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  params.set("f", format);
  params.set("q", "80"); // Quality

  return `${src}?${params.toString()}`;
};

// Memory monitoring for bundle optimization
export const monitorMemoryUsage = () => {
  if ("memory" in performance) {
    const memory = (
      performance as {
        memory: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      }
    ).memory;
    const memoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
    };

    if (process.env.NODE_ENV === "development") {
      // console.info("🧠 Memory Usage:", memoryInfo);
    }

    // Warn if memory usage is high
    if (memoryInfo.usage > 70) {
      // console.warn("High memory usage detected:", memoryInfo.usage + "%");
    }

    return memoryInfo;
  }
  return null;
};

// Chunk loading optimization
export const optimizeChunkLoading = () => {
  // Add resource hints for critical chunks
  const chunkHints = [
    { href: "/assets/vendor.js", as: "script" },
    { href: "/assets/main.css", as: "style" },
  ];

  chunkHints.forEach((hint) => {
    preloadResource(hint.href, hint.as);
  });
};

// Tree shaking verification (development only)
export const verifyTreeShaking = (moduleNames: string[]) => {
  if (process.env.NODE_ENV === "development") {
    // console.info("🌳 Tree Shaking Verification");
    moduleNames.forEach((_name) => {
      // console.info(`${_name}: Module should be tree-shakeable`);
    });
    // end group
  }
};

export default {
  loadAsync,
  createLazyComponent,
  preloadResource,
  preloadModule,
  inlineCriticalCSS,
  analyzeBundleSize,
  dynamicImportWithRetry,
  registerServiceWorker,
  prefetchRoute,
  createOptimizedImageSrc,
  monitorMemoryUsage,
  optimizeChunkLoading,
  verifyTreeShaking,
};
