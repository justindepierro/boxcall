/**
 * LoadingAnnouncer - Screen reader announcements for loading states
 * Provides accessible feedback when content is loading or updating
 */
import React from "react";

export interface LoadingAnnouncerProps {
  /** The loading message to announce to screen readers */
  message?: string;
  /** Whether content is currently loading */
  isLoading?: boolean;
  /** Politeness level for aria-live */
  politeness?: "polite" | "assertive";
  /** Additional CSS classes */
  className?: string;
}

export const LoadingAnnouncer: React.FC<LoadingAnnouncerProps> = ({
  message = "Loading...",
  isLoading = true,
  politeness = "polite",
  className = "",
}) => {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  );
};

/**
 * VisuallyHidden - Hide content visually but keep it accessible to screen readers
 */
export const VisuallyHidden: React.FC<{
  children: React.ReactNode;
  focusable?: boolean;
}> = ({ children, focusable = false }) => {
  return (
    <span className={focusable ? "sr-only-focusable" : "sr-only"}>
      {children}
    </span>
  );
};

/**
 * LiveRegion - Generic aria-live region for dynamic content announcements
 */
export const LiveRegion: React.FC<{
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "additions text" | "all" | "removals" | "text";
}> = ({
  children,
  politeness = "polite",
  atomic = true,
  relevant = "additions text",
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
};

export default LoadingAnnouncer;
