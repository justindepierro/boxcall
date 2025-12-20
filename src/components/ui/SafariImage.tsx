import React, { useState, useCallback, useRef, useEffect } from "react";
import { warn } from "../../utils/logger";

interface SafariImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * iOS Safari-compatible image component
 *
 * Handles common iOS Safari image issues:
 * - CORS with crossOrigin="anonymous"
 * - Removes loading="lazy" which can break on older iOS
 * - Uses decoding="async" for better performance
 * - Proper error handling with fallback
 * - Referrer policy for Supabase storage
 */
export const SafariImage: React.FC<SafariImageProps> = ({
  src,
  alt,
  className = "",
  fallback,
  onLoad,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    warn("[SafariImage] Image failed to load:", src);
    setHasError(true);
    onError?.(new Error(`Failed to load image: ${src}`));
  }, [src, onError]);

  // If no src or error, show fallback
  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
      // iOS Safari compatibility:
      // - crossOrigin for CORS with Supabase storage
      // - decoding="async" for better performance
      // - referrerPolicy for storage URLs
      // - NO loading="lazy" - breaks on older iOS
      crossOrigin="anonymous"
      decoding="async"
      referrerPolicy="no-referrer-when-downgrade"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

/**
 * iOS Safari-compatible play diagram image
 *
 * Specialized for play diagram thumbnails with:
 * - Proper sizing for thumbnails
 * - Icon fallback on error
 * - Supabase storage URL handling
 */
interface PlayDiagramImageProps {
  diagramUrl: string | null | undefined;
  diagramImageUrl?: string | null | undefined;
  playName: string;
  className?: string;
  fallback?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const PlayDiagramImage: React.FC<PlayDiagramImageProps> = ({
  diagramUrl,
  diagramImageUrl,
  playName,
  className = "",
  fallback,
  size = "md",
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use diagram_url first, fall back to diagram_image_url
  const imageSrc = diagramUrl || diagramImageUrl;

  // Reset states when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [imageSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    warn("[PlayDiagramImage] Failed to load diagram:", {
      playName,
      diagramUrl,
      diagramImageUrl,
    });
    setHasError(true);
  }, [playName, diagramUrl, diagramImageUrl]);

  // If no image URL or error occurred, show fallback
  if (!imageSrc || hasError) {
    return <>{fallback}</>;
  }

  // Size classes for different contexts
  const sizeClasses = {
    sm: "w-14 h-10",
    md: "w-20 h-14",
    lg: "w-24 h-18",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-200 animate-pulse rounded" />
      )}
      <img
        src={imageSrc}
        alt={`${playName} diagram`}
        className={`w-full h-full object-cover rounded ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-200`}
        // iOS Safari compatibility settings:
        crossOrigin="anonymous"
        decoding="async"
        referrerPolicy="no-referrer-when-downgrade"
        // Do NOT use loading="lazy" - breaks on iOS Safari 12-14
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default SafariImage;
