/**
 * Optimized Image Component
 *
 * Provides lazy loading, WebP support, CDN optimization, and responsive images for better performance
 */

import React, { useState, useRef, useEffect } from "react";
import { colorTokens } from "../../design-system/tokens";
import { cdnService } from "../../services/cdn/CDNService";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  responsiveSizes?: number[];
  loading?: "lazy" | "eager";
  priority?: boolean;
  quality?: number;
  format?: "webp" | "avif" | "jpeg" | "png";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  placeholder?: "blur" | "empty" | string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  sizes,
  responsiveSizes,
  loading = "lazy",
  priority = false,
  quality = 85,
  format,
  fit = "cover",
  placeholder = "blur",
  fallbackSrc,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      cdnService.preloadAsset(src, "image").catch(console.warn);
    }
  }, [priority, src]);

  // Generate optimized URLs using CDN service
  const optimizedUrls = React.useMemo(() => {
    const options = { width, height, quality, format, fit };

    // Get WebP and fallback URLs
    const { webp, fallback } = cdnService.getWebPFallback(src, options);

    // Generate responsive srcSet if sizes provided
    const srcSet = responsiveSizes
      ? cdnService.getResponsiveImageSrcSet(src, responsiveSizes, options)
      : "";

    return {
      main: fallback,
      webp,
      srcSet,
    };
  }, [src, width, height, quality, format, fit, responsiveSizes]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: "50px", // Start loading 50px before image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();

    // Try fallback source if available
    if (fallbackSrc && imgRef.current && imgRef.current.src !== fallbackSrc) {
      imgRef.current.src = fallbackSrc;
    }
  };

  // Generate placeholder styles
  const placeholderStyle: React.CSSProperties = {
    backgroundColor:
      placeholder === "blur" ? colorTokens.gray[100] : "transparent",
    backgroundImage:
      typeof placeholder === "string" &&
      placeholder !== "blur" &&
      placeholder !== "empty"
        ? `url(${placeholder})`
        : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: !isLoaded && placeholder === "blur" ? "blur(10px)" : undefined,
    transition: "filter 0.3s ease-in-out",
  };

  // Placeholder while loading
  const placeholderElement = (
    <div
      className={`bg-surface-muted animate-pulse ${className}`}
      style={{ width, height, ...placeholderStyle }}
      aria-label="Loading image..."
    />
  );

  // Error state
  if (hasError) {
    return (
      <div
        className={`bg-surface-muted flex items-center justify-center text-muted text-sm ${className}`}
        style={{ width, height }}
        aria-label="Failed to load image"
      >
        Image unavailable
      </div>
    );
  }

  // Don't render image until it's in view (for lazy loading)
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-surface-muted ${className}`}
        style={{ width, height, ...placeholderStyle }}
        aria-label="Loading..."
      />
    );
  }

  // Use picture element for optimized WebP support
  return (
    <div className={`relative ${className}`}>
      {!isLoaded && placeholderElement}
      <picture
        className={`${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      >
        {/* WebP source for modern browsers */}
        {optimizedUrls.webp && (
          <source srcSet={optimizedUrls.webp} type="image/webp" sizes={sizes} />
        )}

        {/* Responsive source with multiple sizes */}
        {optimizedUrls.srcSet && (
          <source srcSet={optimizedUrls.srcSet} sizes={sizes} />
        )}

        {/* Fallback image */}
        <img
          ref={imgRef}
          src={optimizedUrls.main}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`${isLoaded ? "block" : "hidden"} ${className}`}
          decoding={priority ? "sync" : "async"}
          style={{
            objectFit:
              fit === "inside" || fit === "outside"
                ? "cover"
                : (fit as React.CSSProperties["objectFit"]),
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />
      </picture>
    </div>
  );
};

// Avatar component with optimized loading
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className = "",
  fallbackInitials,
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackInitials?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-muted text-secondary font-medium rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setHasError(true)}
      priority={size <= 64} // Small avatars are usually above the fold
      quality={90}
    />
  );
}

// Hero image component for large above-the-fold images
export function HeroImage({
  src,
  alt,
  className = "",
  overlay = false,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={true}
        loading="eager"
        responsiveSizes={[640, 768, 1024, 1280, 1536]}
        sizes="100vw"
        className="w-full h-full object-cover"
        placeholder="blur"
        quality={85}
      />

      {overlay && <div className="absolute inset-0 bg-black bg-opacity-30" />}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
