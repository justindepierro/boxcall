/**
 * Animated Save Indicator Logo
 *
 * BoxCall logo that responds to global save state:
 * - Spins during save operations
 * - Flashes green on success
 * - Flashes red on error
 * - Flashes yellow on warning
 * - Optimized for 60fps animations
 * - Accessible with ARIA live regions
 *
 * @version 2.0.0 - Production Optimized
 */

import React from "react";
import { LogoIcon } from "./Logo";
import { useSaveState } from "../../../hooks/useSaveState";

export interface SaveIndicatorLogoProps {
  /** Base size of the logo */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Logo component that responds to global save state
 * Memoized to prevent unnecessary re-renders
 *
 * Usage:
 * ```tsx
 * <SaveIndicatorLogo size="sm" />
 * ```
 */
export const SaveIndicatorLogo: React.FC<SaveIndicatorLogoProps> = React.memo(
  ({ size = "sm", className = "" }) => {
    const { isSaving, saveStatus } = useSaveState();

    // Determine color based on save status
    const getColorClass = () => {
      switch (saveStatus) {
        case "success":
          return "text-success-600";
        case "error":
          return "text-error-600";
        case "warning":
          return "text-warning-600";
        default:
          return "text-primary-600"; // Use design system primary color
      }
    };

    // Get scale class for flash effect
    const getScaleClass = () => {
      return saveStatus !== "idle" ? "scale-110" : "scale-100";
    };

    // Get status message for screen readers
    const getAriaLabel = () => {
      if (isSaving) return "Saving changes...";
      switch (saveStatus) {
        case "success":
          return "Changes saved successfully";
        case "error":
          return "Error saving changes";
        case "warning":
          return "Changes saved with warnings";
        default:
          return "BoxCall logo";
      }
    };

    return (
      <>
        {/* Visual indicator */}
        <div
          className={`
          relative
          will-change-transform
          transform-gpu
          ${isSaving ? "animate-spin" : ""}
          ${className}
        `}
          style={{
            transition: isSaving
              ? "none" // No transition during spin for smooth animation
              : "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)", // Smooth deceleration
          }}
          aria-hidden="true"
        >
          <div
            className={`
            transition-all duration-300 ease-out
            ${getColorClass()}
            ${getScaleClass()}
          `}
          >
            <LogoIcon size={size} color="current" />
          </div>
        </div>

        {/* Screen reader announcements */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {(isSaving || saveStatus !== "idle") && getAriaLabel()}
        </div>
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if props actually changed
    return (
      prevProps.size === nextProps.size &&
      prevProps.className === nextProps.className
    );
  }
);

SaveIndicatorLogo.displayName = "SaveIndicatorLogo";

export default SaveIndicatorLogo;
