import React, { useState, useEffect } from "react";

/**
 * Progressive Image Loading Component
 *
 * Provides smooth loading transitions with blur-to-sharp effects
 * for better perceived performance and user experience.
 */

export interface ProgressiveImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Low quality placeholder image (blur) */
  placeholder?: string;
  /** High quality final image */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Blur intensity (CSS blur value) */
  blur?: string;
  /** Transition duration in ms */
  transitionDuration?: number;
  /** Custom className for the container */
  className?: string;
  /** Custom className for the image */
  imageClassName?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  placeholder,
  src,
  alt,
  blur = "20px",
  transitionDuration = 300,
  className = "",
  imageClassName = "",
  onLoad,
  onError,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    const handleLoad = () => {
      setImageLoaded(true);
      onLoad?.();
    };

    const handleError = () => {
      setImageError(true);
      onError?.();
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    return () => {
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
    };
  }, [src, onLoad, onError]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/Blur Image */}
      {placeholder && !imageLoaded && !imageError && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover filter blur-[${blur}] scale-110 ${imageClassName}`}
          style={{ filter: `blur(${blur})` }}
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className={`
          w-full h-full object-cover transition-all duration-${transitionDuration} ease-out
          ${imageLoaded ? "opacity-100 filter-none scale-100" : "opacity-0 scale-105"}
          ${imageClassName}
        `}
        style={{
          transitionDuration: `${transitionDuration}ms`,
        }}
        {...props}
      />

      {/* Loading Overlay */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-surface-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-jade-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 bg-surface-muted flex items-center justify-center">
          <div className="text-center text-text-muted">
            <div className="w-12 h-12 mx-auto mb-2 bg-border rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Lazy Loading Image Component
 *
 * Combines progressive loading with intersection observer
 * for optimal performance.
 */

export interface LazyImageProps extends ProgressiveImageProps {
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  rootMargin = "50px",
  threshold = 0.1,
  ...props
}) => {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, rootMargin, threshold]);

  return (
    <div ref={setRef} className={props.className}>
      {isInView ? (
        <ProgressiveImage {...props} />
      ) : (
        <div className="w-full h-full bg-surface-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-jade-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;
