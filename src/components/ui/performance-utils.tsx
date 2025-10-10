/**
 * Performance Utilities
 * Separated from performance.tsx to avoid fast refresh warnings
 */
import React, { lazy, Suspense, useEffect } from "react";
import type { ComponentType } from "react";

// Route-based code splitting
export const lazyRoute = (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  componentName: string
) => {
  const LazyComponent = lazy(importFunc);

  const RouteWrapper: React.FC = () => {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600 mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading {componentName}...</p>
            </div>
          </div>
        }
      >
        <LazyComponent />
      </Suspense>
    );
  };

  RouteWrapper.displayName = `LazyRoute(${componentName})`;
  return RouteWrapper;
};

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const startTime = performance.now();

    return () => {
      const renderTime = performance.now() - startTime;
      console.info(
        `⚡ ${componentName} render time: ${renderTime.toFixed(2)}ms`
      );
    };
  }, [componentName]);
};
