import { memo } from "react";
import { motion } from "framer-motion";
import { Icon, type IconName } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

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
  /** Total number of plays in the playbook (for filtered state messaging) */
  totalPlayCount?: number;
  /** Current search query */
  searchQuery?: string;
  /** Callback when user clicks a suggested search */
  onSuggestedSearch?: (query: string) => void;
}

const SEARCH_SUGGESTIONS = [
  { label: 'Try "screen"', query: "screen" },
  { label: 'Try "shotgun"', query: "shotgun" },
  { label: 'Try "pass"', query: "pass" },
  { label: 'Try "run"', query: "run" },
];

type PlayGridEmptyStateHandlers = {
  handleCreatePlay: () => void;
  handleImportPlays: () => void;
  handleClearFilters: () => void;
  handleSuggestedSearch: (query: string) => void;
};

const usePlayGridEmptyStateHandlers = (
  props: Pick<
    PlayGridEmptyStateProps,
    "onCreatePlay" | "onImportPlays" | "onClearFilters" | "onSuggestedSearch"
  >
): PlayGridEmptyStateHandlers => {
  const isMobile = useIsMobile();

  const handleCreatePlay = () => {
    if (isMobile) triggerHapticFeedback("medium");
    props.onCreatePlay?.();
  };

  const handleImportPlays = () => {
    if (isMobile) triggerHapticFeedback("medium");
    props.onImportPlays?.();
  };

  const handleClearFilters = () => {
    if (isMobile) triggerHapticFeedback("light");
    props.onClearFilters?.();
  };

  const handleSuggestedSearch = (query: string) => {
    if (isMobile) triggerHapticFeedback("light");
    props.onSuggestedSearch?.(query);
  };

  return {
    handleCreatePlay,
    handleImportPlays,
    handleClearFilters,
    handleSuggestedSearch,
  };
};

const FilteredSmartBanner: React.FC<{
  totalPlayCount: number;
  onClearFilters?: () => void;
  onShowAll: () => void;
}> = ({ totalPlayCount, onClearFilters, onShowAll }) => {
  if (!onClearFilters || totalPlayCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-r from-warning-500/10 to-warning-600/10 border-2 border-warning-500/30"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-warning-500 flex items-center justify-center flex-shrink-0">
          <Icon name="alert" className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <Typography
            variant="body-sm"
            className="font-semibold text-primary mb-1"
          >
            {totalPlayCount} {totalPlayCount === 1 ? "Play" : "Plays"} Hidden by
            Filters
          </Typography>
          <Typography variant="body-xs" className="text-secondary">
            Your active filters are hiding all plays. Tap below to see your
            entire playbook.
          </Typography>
        </div>
      </div>
      <Button
        onClick={onShowAll}
        variant="primary"
        size="lg"
        className="w-full mt-3"
      >
        <Icon name="eye" className="w-5 h-5 mr-2" />
        Show All {totalPlayCount} {totalPlayCount === 1 ? "Play" : "Plays"}
      </Button>
    </motion.div>
  );
};

const SearchSuggestionChips: React.FC<{
  onSuggestedSearch?: (query: string) => void;
  show: boolean;
}> = ({ onSuggestedSearch, show }) => {
  if (!show || !onSuggestedSearch) return null;

  return (
    <div className="mb-6 space-y-2">
      <Typography variant="body-sm" className="text-muted text-center">
        Try searching for:
      </Typography>
      <div className="flex gap-2 justify-center flex-wrap">
        {SEARCH_SUGGESTIONS.map(({ label, query }) => (
          <button
            key={query}
            onClick={() => onSuggestedSearch(query)}
            className="px-3 py-1 text-sm bg-secondary hover:bg-muted rounded-lg border border-muted transition-colors"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

const FilteredActionButtons: React.FC<{
  onClearFilters?: () => void;
  onClearAll: () => void;
  searchQuery?: string;
  onCreatePlay?: () => void;
  onCreateFromQuery: () => void;
}> = ({
  onClearFilters,
  onClearAll,
  searchQuery,
  onCreatePlay,
  onCreateFromQuery,
}) => (
  <div className="flex flex-col sm:flex-row gap-3">
    {onClearFilters && (
      <Button onClick={onClearAll} variant="primary" size="lg">
        <Icon name="close" className="w-5 h-5 mr-2" />
        Clear All Filters
      </Button>
    )}
    {searchQuery && onCreatePlay && (
      <Button
        onClick={onCreateFromQuery}
        variant="primary"
        size="lg"
        className="bg-brand-jade hover:bg-brand-jade-hover"
      >
        <Icon name="plus" className="w-5 h-5 mr-2" />
        Create "{searchQuery}"
      </Button>
    )}
    {!searchQuery && onCreatePlay && (
      <Button onClick={onCreateFromQuery} variant="secondary" size="lg">
        <Icon name="plus" className="w-5 h-5 mr-2" />
        Create New Play
      </Button>
    )}
  </div>
);

const FilterQuickTip: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="mt-8 p-4 rounded-xl bg-secondary max-w-md w-full"
  >
    <div className="flex items-start gap-3">
      <Icon
        name="lightbulb"
        className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5"
      />
      <div>
        <Typography
          variant="body-sm"
          className="font-semibold mb-1 text-primary"
        >
          Quick Tip
        </Typography>
        <Typography variant="body-xs" className="text-secondary">
          Clear individual filters in the filter menu, or use the button above
          to reset everything at once.
        </Typography>
      </div>
    </div>
  </motion.div>
);

const FilteredEmptyState: React.FC<{
  totalPlayCount: number;
  searchQuery?: string;
  onCreatePlay?: () => void;
  onClearFilters?: () => void;
  onSuggestedSearch?: (query: string) => void;
  handlers: PlayGridEmptyStateHandlers;
}> = ({
  totalPlayCount,
  searchQuery,
  onCreatePlay,
  onClearFilters,
  onSuggestedSearch,
  handlers,
}) => (
  <div className="space-y-4">
    <FilteredSmartBanner
      totalPlayCount={totalPlayCount}
      onClearFilters={onClearFilters}
      onShowAll={handlers.handleClearFilters}
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-warning-500/10 to-warning-600/10 border-2 border-warning-500/20 flex items-center justify-center mb-6"
      >
        <Icon
          name="search"
          className="w-12 h-12 text-warning-600 dark:text-warning-400"
        />
      </motion.div>

      <Typography
        variant="headline-lg"
        className="text-primary mb-2 text-center"
      >
        No Plays Found
      </Typography>

      <Typography
        variant="body"
        className="text-secondary mb-8 text-center max-w-md"
      >
        {searchQuery
          ? `No plays match "${searchQuery}". Try different keywords or check your spelling.`
          : "Your filters are hiding all plays. Try adjusting your criteria or clear filters to see your entire playbook."}
      </Typography>

      <SearchSuggestionChips
        show={Boolean(onSuggestedSearch && searchQuery)}
        onSuggestedSearch={
          onSuggestedSearch ? handlers.handleSuggestedSearch : undefined
        }
      />

      <FilteredActionButtons
        onClearFilters={onClearFilters}
        onClearAll={handlers.handleClearFilters}
        searchQuery={searchQuery}
        onCreatePlay={onCreatePlay}
        onCreateFromQuery={handlers.handleCreatePlay}
      />

      <FilterQuickTip />
    </motion.div>
  </div>
);

const TemplateCard: React.FC<{
  iconBg: string;
  icon: IconName;
  title: string;
  subtitle: string;
  onClick: () => void;
}> = ({ iconBg, icon, title, subtitle, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="p-4 rounded-xl bg-secondary hover:bg-tertiary border border-muted hover:border-brand-jade transition-all text-left"
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon name={icon} className="w-5 h-5 text-white" />
      </div>
      <div>
        <Typography
          variant="body-sm"
          className="font-semibold mb-1 text-primary"
        >
          {title}
        </Typography>
        <Typography variant="body-xs" className="text-muted">
          {subtitle}
        </Typography>
      </div>
    </div>
  </motion.button>
);

const EmptyPlaybookQuickTips: React.FC = () => (
  <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
    <div className="text-center p-4 rounded-2xl bg-secondary dark:bg-navy-800/50">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
        <Icon name="zap" className="w-6 h-6 text-white" />
      </div>
      <Typography variant="body-sm" className="font-semibold mb-1">
        Quick Builder
      </Typography>
      <Typography variant="body-xs" className="text-muted">
        Create plays in seconds with our step-by-step wizard
      </Typography>
    </div>

    <div className="text-center p-4 rounded-2xl bg-secondary dark:bg-navy-800/50">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-3">
        <Icon name="upload" className="w-6 h-6 text-white" />
      </div>
      <Typography variant="body-sm" className="font-semibold mb-1">
        CSV Import
      </Typography>
      <Typography variant="body-xs" className="text-muted">
        Bulk import your existing plays from spreadsheets
      </Typography>
    </div>

    <div className="text-center p-4 rounded-2xl bg-secondary dark:bg-navy-800/50">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-jade-500 to-emerald-500 flex items-center justify-center mx-auto mb-3">
        <Icon name="image" className="w-6 h-6 text-white" />
      </div>
      <Typography variant="body-sm" className="font-semibold mb-1">
        Visual Diagrams
      </Typography>
      <Typography variant="body-xs" className="text-muted">
        Draw routes and formations with our diagram tool
      </Typography>
    </div>
  </div>
);

const FirstTimeEmptyState: React.FC<{
  onCreatePlay?: () => void;
  onImportPlays?: () => void;
  handlers: PlayGridEmptyStateHandlers;
}> = ({ onCreatePlay, onImportPlays, handlers }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      }}
      className="w-24 h-24 rounded-xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-jade-500/25"
    >
      <Icon name="file" className="w-12 h-12 text-white" />
    </motion.div>

    <Typography variant="headline-lg" className="text-primary mb-2 text-center">
      Your Playbook is Empty
    </Typography>

    <Typography
      variant="body"
      className="text-secondary mb-8 text-center max-w-md"
    >
      Get started by creating your first play or try one of our sample templates
      below.
    </Typography>

    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {onCreatePlay && (
        <Button onClick={handlers.handleCreatePlay} variant="primary" size="lg">
          <Icon name="plus" className="w-5 h-5 mr-2" />
          Create First Play
        </Button>
      )}
      {onImportPlays && (
        <Button
          onClick={handlers.handleImportPlays}
          variant="secondary"
          size="lg"
        >
          <Icon name="upload" className="w-5 h-5 mr-2" />
          Import Plays
        </Button>
      )}
    </div>

    <div className="max-w-3xl w-full mb-8">
      <Typography
        variant="body-sm"
        className="text-secondary text-center mb-4 font-semibold"
      >
        Popular Starting Templates
      </Typography>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TemplateCard
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
          icon="arrow-right"
          title="Quick Pass"
          subtitle="Shotgun • 3-step drop"
          onClick={handlers.handleCreatePlay}
        />
        <TemplateCard
          iconBg="bg-gradient-to-br from-green-500 to-emerald-500"
          icon="trending-up"
          title="Power Run"
          subtitle="I-Form • Inside zone"
          onClick={handlers.handleCreatePlay}
        />
        <TemplateCard
          iconBg="bg-gradient-to-br from-purple-500 to-pink-500"
          icon="zap"
          title="Play Action"
          subtitle="Under Center • Boot"
          onClick={handlers.handleCreatePlay}
        />
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-3 max-w-md w-full mt-6">
      {onCreatePlay && (
        <Button onClick={handlers.handleCreatePlay} variant="primary" size="lg">
          <Icon name="plus" className="w-5 h-5 mr-2" />
          Create First Play
        </Button>
      )}
      {onImportPlays && (
        <Button
          onClick={handlers.handleImportPlays}
          variant="secondary"
          size="lg"
        >
          <Icon name="upload" className="w-5 h-5 mr-2" />
          Import Plays
        </Button>
      )}
    </div>

    <EmptyPlaybookQuickTips />
  </motion.div>
);

export const PlayGridEmptyState = memo<PlayGridEmptyStateProps>(
  ({
    onCreatePlay,
    onImportPlays,
    hasActiveFilters = false,
    onClearFilters,
    totalPlayCount = 0,
    searchQuery,
    onSuggestedSearch,
  }) => {
    const handlers = usePlayGridEmptyStateHandlers({
      onCreatePlay,
      onImportPlays,
      onClearFilters,
      onSuggestedSearch,
    });

    // Different messaging based on whether it's filtered or truly empty
    if (hasActiveFilters) {
      return (
        <FilteredEmptyState
          totalPlayCount={totalPlayCount}
          searchQuery={searchQuery}
          onCreatePlay={onCreatePlay}
          onClearFilters={onClearFilters}
          onSuggestedSearch={onSuggestedSearch}
          handlers={handlers}
        />
      );
    }

    // Empty playbook - first time user
    return (
      <FirstTimeEmptyState
        onCreatePlay={onCreatePlay}
        onImportPlays={onImportPlays}
        handlers={handlers}
      />
    );
  }
);

PlayGridEmptyState.displayName = "PlayGridEmptyState";
