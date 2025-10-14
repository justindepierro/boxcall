import { memo } from "react";
import { Skeleton } from "../ui/Skeleton";
import { Grid } from "lucide-react";

/**
 * FormationSelectorSkeleton Component
 *
 * Loading skeleton for FormationSelector dropdown.
 * Shows placeholder with shimmer effect while formations are being fetched.
 *
 * @example
 * ```tsx
 * {isLoading && <FormationSelectorSkeleton />}
 * ```
 */

export const FormationSelectorSkeleton = memo(() => {
  return (
    <div className="w-full">
      {/* Label Skeleton */}
      <Skeleton className="h-4 w-24 mb-spacing-xs" />

      {/* Dropdown Button Skeleton */}
      <div className="w-full flex items-center justify-between px-spacing-md py-spacing-sm bg-surface-secondary border border-border-primary rounded-lg">
        <div className="flex items-center gap-spacing-sm flex-1">
          <Grid className="w-4 h-4 text-text-muted opacity-50" />
          <Skeleton className="h-4 w-36" />
        </div>
        {/* Chevron placeholder */}
        <div className="w-4 h-4 opacity-30">
          <svg
            className="w-4 h-4 text-text-muted"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
});

FormationSelectorSkeleton.displayName = "FormationSelectorSkeleton";
