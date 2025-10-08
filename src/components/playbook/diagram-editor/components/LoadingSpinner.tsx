/**
 * LoadingSpinner - Shows a loading indicator while Pixi initializes
 *
 * Provides visual feedback during async initialization to improve perceived performance.
 */

import React from "react";

export interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

/**
 * Loading spinner component for diagram canvas
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading diagram editor...",
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-surface-secondary ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-border rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-secondary">{message}</p>
      </div>
    </div>
  );
};
