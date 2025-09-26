import React, { useState, useEffect, useRef } from "react";

/**
 * Lazy Loading Component System
 *
 * Intersection observer-based lazy loading for any React component
 * to improve initial page load performance.
 */

export interface LazyLoadProps {
  /** Component to lazy load */
  children: React.ReactNode;
  /** Fallback component to show while loading */
  fallback?: React.ReactNode;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Height to reserve for the component */
  height?: string | number;
  /** Custom className */
  className?: string;
  /** Callback when component becomes visible */
  onVisible?: () => void;
  /** Whether to only load once */
  once?: boolean;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  height,
  className = "",
  onVisible,
  once = true,
}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenVisible(true);
          onVisible?.();

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, onVisible, once]);

  const shouldRender = once ? hasBeenVisible : isInView;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: height,
        display: height ? "block" : undefined,
      }}
    >
      {shouldRender ? children : fallback}
    </div>
  );
};

/**
 * Suspense-compatible lazy component loader
 */

export interface LazyComponentProps {
  /** Import function that returns a component */
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  /** Props to pass to the lazy component */
  componentProps?: Record<string, any>;
  /** Fallback component */
  fallback?: React.ReactNode;
  /** Error fallback */
  errorFallback?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  importFunc,
  componentProps = {},
  fallback,
  errorFallback,
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFunc()
      .then((module) => {
        setComponent(() => module.default);
      })
      .catch((err) => {
        setError(err);
      });
  }, [importFunc]);

  if (error && errorFallback) {
    return <>{errorFallback}</>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-text-error">
        <p>Failed to load component</p>
        <p className="text-sm text-text-secondary mt-1">{error.message}</p>
      </div>
    );
  }

  if (!Component) {
    return fallback ? <>{fallback}</> : null;
  }

  return <Component {...componentProps} />;
};

/**
 * Pre-configured lazy loading variants
 */

export const LazySection: React.FC<
  Omit<LazyLoadProps, "fallback"> & {
    skeleton?: React.ReactNode;
  }
> = ({ skeleton, children, ...props }) => (
  <LazyLoad
    fallback={
      skeleton || (
        <div
          className="animate-pulse bg-border rounded-lg"
          style={{ height: props.height || "200px" }}
        />
      )
    }
    {...props}
  >
    {children}
  </LazyLoad>
);

export const LazyCard: React.FC<Omit<LazyLoadProps, "fallback">> = (props) => (
  <LazyLoad
    fallback={
      <div className="bg-surface-primary rounded-lg p-6 shadow-sm animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-border rounded w-3/4" />
          <div className="h-4 bg-border rounded w-1/2" />
          <div className="h-4 bg-border rounded w-2/3" />
        </div>
      </div>
    }
    {...props}
  >
    {props.children}
  </LazyLoad>
);

export default LazyLoad;
