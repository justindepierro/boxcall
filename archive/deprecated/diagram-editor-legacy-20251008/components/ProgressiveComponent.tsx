/**
 * ProgressiveComponent
 *
 * A wrapper component that handles progressive loading of lazy components
 * with Suspense, error boundaries, and loading states.
 */

import React, { Suspense, useEffect } from "react";
import {
  LazyErrorBoundary,
  LoadingFallback,
} from "../components/LazyComponents";
import {
  useProgressiveLoading,
  type ProgressiveLoadingOptions,
} from "../hooks/useProgressiveLoading";

interface ProgressiveComponentProps {
  /** The lazy component to load */
  lazyComponent: React.LazyExoticComponent<React.ComponentType<any>>;
  /** Props to pass to the lazy component */
  componentProps?: Record<string, any>;
  /** Progressive loading options */
  loadingOptions?: ProgressiveLoadingOptions;
  /** Custom loading fallback */
  loadingFallback?: React.ReactNode;
  /** Custom error fallback */
  errorFallback?: React.ReactNode;
  /** Callback when component loads */
  onLoad?: () => void;
  /** Callback when loading fails */
  onError?: (error: Error) => void;
}

export const ProgressiveComponent: React.FC<ProgressiveComponentProps> = ({
  lazyComponent: LazyComponent,
  componentProps = {},
  loadingOptions = {},
  loadingFallback,
  errorFallback,
  onLoad,
  onError,
}) => {
  const { shouldLoad, isLoading, isLoaded, error, ref, onInteraction } =
    useProgressiveLoading(loadingOptions);

  // Handle load callback
  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  // Handle error callback
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Don't render anything until we should load
  if (!shouldLoad) {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        onClick={onInteraction}
        onMouseEnter={onInteraction}
        className="min-h-24 flex items-center justify-center cursor-pointer"
      >
        <div className="text-secondary text-sm">
          Click to load advanced features
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return <>{loadingFallback || <LoadingFallback />}</>;
  }

  // Show error state
  if (error) {
    return (
      <>
        {errorFallback || (
          <div className="flex items-center justify-center p-4 text-error-600">
            <span>Failed to load component: {error.message}</span>
          </div>
        )}
      </>
    );
  }

  // Render the lazy component with Suspense and error boundary
  return (
    <LazyErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback || <LoadingFallback />}>
        <LazyComponent {...componentProps} />
      </Suspense>
    </LazyErrorBoundary>
  );
};
