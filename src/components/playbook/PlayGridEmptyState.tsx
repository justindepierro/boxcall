import { memo } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";

/**
 * PlayGridEmptyState Component
 *
 * Empty state displayed when PlayGrid has no plays to show.
 * Provides helpful guidance and actions for users to get started.
 *
 * @example
 * ```tsx
 * {!loading && plays.length === 0 && (
 *   <PlayGridEmptyState onCreatePlay={handleOpenBuilder} />
 * )}
 * ```
 */

export interface PlayGridEmptyStateProps {
  /** Callback when user clicks "Create First Play" */
  onCreatePlay?: () => void;
  /** Callback when user clicks "Import Plays" */
  onImportPlays?: () => void;
  /** Whether filters are active (empty result vs empty playbook) */
  hasActiveFilters?: boolean;
  /** Clear filters callback */
  onClearFilters?: () => void;
}

export const PlayGridEmptyState = memo<PlayGridEmptyStateProps>(
  ({
    onCreatePlay,
    onImportPlays,
    hasActiveFilters = false,
    onClearFilters,
  }) => {
    // Different messaging based on whether it's filtered or truly empty
    if (hasActiveFilters) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {/* Search Icon */}
          <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
            <Icon
              name="search"
              className="w-10 h-10 text-slate-400 dark:text-slate-500"
            />
          </div>

          <Typography
            variant="headline-md"
            className="text-text-primary mb-2 text-center"
          >
            No Plays Match Your Filters
          </Typography>

          <Typography
            variant="body"
            className="text-text-secondary mb-6 text-center max-w-md"
          >
            Try adjusting your search or filters to find what you're looking
            for.
          </Typography>

          {onClearFilters && (
            <Button onClick={onClearFilters} variant="secondary">
              <Icon name="close" className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>
      );
    }

    // Empty playbook - first time user
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Play Icon with Gradient */}
        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-jade-500/25">
          <Icon name="file" className="w-12 h-12 text-white" />
        </div>

        <Typography
          variant="headline-lg"
          className="text-text-primary mb-2 text-center"
        >
          Your Playbook is Empty
        </Typography>

        <Typography
          variant="body"
          className="text-text-secondary mb-8 text-center max-w-md"
        >
          Get started by creating your first play or importing an existing
          playbook.
        </Typography>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {onCreatePlay && (
            <Button onClick={onCreatePlay} variant="primary" size="lg">
              <Icon name="plus" className="w-5 h-5 mr-2" />
              Create First Play
            </Button>
          )}
          {onImportPlays && (
            <Button onClick={onImportPlays} variant="secondary" size="lg">
              <Icon name="upload" className="w-5 h-5 mr-2" />
              Import Plays
            </Button>
          )}
        </div>

        {/* Quick Tips */}
        <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
              <Icon name="zap" className="w-6 h-6 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold mb-1">
              Quick Builder
            </Typography>
            <Typography variant="body-xs" className="text-text-muted">
              Create plays in seconds with our step-by-step wizard
            </Typography>
          </div>

          <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
              <Icon name="upload" className="w-6 h-6 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold mb-1">
              CSV Import
            </Typography>
            <Typography variant="body-xs" className="text-text-muted">
              Bulk import your existing plays from spreadsheets
            </Typography>
          </div>

          <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jade-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Icon name="image" className="w-6 h-6 text-white" />
            </div>
            <Typography variant="body-sm" className="font-semibold mb-1">
              Visual Diagrams
            </Typography>
            <Typography variant="body-xs" className="text-text-muted">
              Draw routes and formations with our diagram tool
            </Typography>
          </div>
        </div>
      </div>
    );
  }
);

PlayGridEmptyState.displayName = "PlayGridEmptyState";
