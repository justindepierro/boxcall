/**
 * BoxCall Performance Optimization Components
 * Modern lazy loading, bundle splitting, and performance monitoring
 */

import { lazy, Suspense, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { debug } from "../../utils/logger";

// Lazy loading wrapper with performance monitoring
interface LazyWrapperProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ComponentType;
  componentName: string;
}

export function LazyWrapper({
  importFunc,
  fallback: Fallback,
  componentName,
}: LazyWrapperProps) {
  const LazyComponent = lazy(importFunc);

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-border-light h-10 w-10"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-border-light rounded-lg w-3/4"></div>
          <div className="h-4 bg-border-light rounded-lg w-1/2"></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    // Performance monitoring
    if (import.meta.env.DEV) {
      debug(`📦 Lazy loading component: ${componentName}`);
    }
  }, [componentName]);

  return (
    <Suspense fallback={Fallback ? <Fallback /> : defaultFallback}>
      <LazyComponent />
    </Suspense>
  );
}

// Image optimization component
interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  priority = false,
  placeholder = "empty",
  className = "",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate responsive image URLs (would integrate with your image CDN)
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [480, 768, 1024, 1280, 1920];
    return sizes
      .map((size) => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(", ");
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`bg-border flex items-center justify-center text-secondary text-sm ${className}`}
        style={{ width, height }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && placeholder === "blur" && (
        <div
          className="absolute inset-0 bg-border animate-pulse"
          style={{ width, height }}
        />
      )}
      <img
        src={`${src}?q=${quality}`}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
};

// Bundle analyzer component (development only)
export const BundleAnalyzer: React.FC = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      debug("📊 Bundle analyzer available in development mode");
      // TODO: Implement bundle analysis when vite-bundle-analyzer is properly configured
    }
  }, []);

  return null;
};

// Virtual scrolling for large lists
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = "",
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

export default {
  LazyWrapper,
  OptimizedImage,
  BundleAnalyzer,
  VirtualList,
};
