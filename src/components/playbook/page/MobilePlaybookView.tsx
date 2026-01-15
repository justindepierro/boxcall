/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, {
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
  useDeferredValue,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import type { ButtonSize } from "../../ui/Button/Button.types";
import { Typography } from "../../design-system/Typography";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../ui/DropdownMenu";
import { ErrorBoundary } from "../../ui/ErrorBoundary";
import { PullToRefresh } from "../../PullToRefresh";
import { PlaybookBottomNav } from "../page/PlaybookBottomNav";
import { MobileStatsBottomSheet } from "../page/MobileStatsBottomSheet";
import { MobileFiltersSheet } from "./MobileFiltersSheet";
import { SortDropdown } from "../page/SortDropdown";
import { FormationSyncPanel } from "../../formations/FormationSyncPanel";
import { MobilePlayCardSkeletonList } from "../../mobile/ui/MobilePlayCardSkeleton";
import { PlayList } from "../PlayList";
import { PlayListEmptyState } from "../PlayListEmptyState";
import { SelectionModeToggle } from "../SelectionModeToggle";
import {
  hasActiveFilters,
  type PlaySortOption,
  type PlaybookFilters,
} from "../../../types/filters";
import { PracticeScriptList } from "../PracticeScriptList";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { softNavigate } from "../../../utils/softNavigate";
import { debug } from "../../../utils/logger";
import type { Play } from "../../../types/play";
import type {
  PlaybookState,
  PlaybookAction,
  CoachingView,
} from "../../../contexts/PlaybookContext";
import type { PracticeScript } from "@services";

const MOBILE_RENDER_WARN_THRESHOLD_MS = 20;

// CSS custom properties for header heights (prevents magic numbers)
const HEADER_HEIGHTS = {
  appHeader: "64px",
  mobileHeaderWithSearch: "110px",
  mobileHeaderNoSearch: "60px",
} as const;

interface MobilePlaybookViewProps {
  // State
  state: PlaybookState;
  showFiltersSheet: boolean;
  showStatsSheet: boolean;
  activeTeamId: string | null;
  activePlaybookId: string | null;
  isLoadingPlays: boolean;

  // Data
  optimisticPlays: Play[];
  formationAudit: {
    plays: Play[];
    loading: boolean;
    error: string | null;
  };

  // Handlers
  setShowFiltersSheet: (show: boolean) => void;
  setShowStatsSheet: (show: boolean) => void;
  handleSortChange: (sortBy: PlaySortOption) => void;
  handleOpenQuickCreate: () => void;
  handleOpenPersonnel: () => void;
  handleOpenSettings: () => void;
  handleOpenKeyboardShortcuts: () => void;
  handlePullRefresh: () => Promise<void>;
  handleEditPlay: (play: Play) => void;
  handleSavePlay: (play: Play) => Promise<void>;
  handleDuplicatePlay: (play: Play) => Promise<void>;
  handleOpenBuilder: () => void;
  handleOpenAssignments: (play: Play) => void;
  handlePostToTeamBulletin: (play: Play) => void;
  handleAddToPracticeScript: (play: Play) => void;
  handleAddToGamePlan: (play: Play) => void;
  handlePlayCountChange: (change: number) => void;
  handleViewChange: (view: CoachingView) => void;
  handleOpenPracticeScriptBuilder: (script?: PracticeScript) => void;
  dispatch: React.Dispatch<PlaybookAction>;

  // UI
  mobileButtonSize: ButtonSize;
  mobileSecondaryButtonSize: ButtonSize;

  // Suggestions
  suggestions: {
    formations: string[];
    playNames: string[];
  };
}

function MobilePlaybookViewInner({
  state,
  showFiltersSheet,
  showStatsSheet,
  activeTeamId,
  activePlaybookId,
  isLoadingPlays,
  optimisticPlays,
  formationAudit,
  setShowFiltersSheet,
  setShowStatsSheet,
  handleSortChange,
  handleOpenQuickCreate,
  handleOpenPersonnel,
  handleOpenSettings,
  handleOpenKeyboardShortcuts,
  handlePullRefresh,
  handleEditPlay,
  handleSavePlay,
  handleDuplicatePlay,
  handleOpenBuilder,
  handleOpenAssignments,
  handlePostToTeamBulletin,
  handleAddToPracticeScript,
  handleAddToGamePlan,
  handlePlayCountChange,
  handleViewChange,
  handleOpenPracticeScriptBuilder,
  dispatch,
  mobileButtonSize,
  mobileSecondaryButtonSize,
  suggestions,
}: MobilePlaybookViewProps) {
  const renderStartRef = useRef<number>(0);
  if (typeof performance !== "undefined") {
    renderStartRef.current = performance.now();
  }

  // Local search state for instant UI feedback (deferred for performance)
  const [localSearch, setLocalSearch] = useState(state.filters.search);
  const deferredSearch = useDeferredValue(localSearch);
  const isSearchStale = localSearch !== deferredSearch;

  // Sync deferred search back to state (batched updates)
  useEffect(() => {
    if (deferredSearch !== state.filters.search) {
      dispatch({
        type: "SET_FILTERS",
        filters: { ...state.filters, search: deferredSearch },
      });
    }
  }, [deferredSearch, dispatch, state.filters]);

  // Use playsCreated from state as the source of truth for whether plays exist
  const hasPlays = state.playsCreated > 0;
  const showHeaderSkeleton =
    isLoadingPlays && state.currentView === "playbook" && !hasPlays;
  const showSearchHeader = state.currentView === "playbook" && hasPlays;

  // Memoized view titles
  const viewTitles = useMemo<Record<CoachingView, string>>(
    () => ({
      playbook: `${state.playsCreated} ${state.playsCreated === 1 ? "Play" : "Plays"}`,
      "practice-script": "Practice Scripts",
      "game-plan": "Game Plans",
      analytics: "Analytics",
    }),
    [state.playsCreated]
  );

  // Memoized content padding style (uses CSS custom properties)
  const contentPaddingStyle = useMemo(
    () => ({
      paddingTop: showSearchHeader
        ? `calc(${HEADER_HEIGHTS.appHeader} + ${HEADER_HEIGHTS.mobileHeaderWithSearch})`
        : `calc(${HEADER_HEIGHTS.appHeader} + ${HEADER_HEIGHTS.mobileHeaderNoSearch})`,
      paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
    }),
    [showSearchHeader]
  );

  // Memoized stats for bottom sheet
  const mobileStats = useMemo(
    () => ({
      totalPlays: state.playsCreated || 0,
      formationsCount: Math.max(1, Math.floor((state.playsCreated || 0) / 3)),
      passPlays: Math.floor((state.playsCreated || 0) * 0.4),
      runPlays: Math.floor((state.playsCreated || 0) * 0.4),
      rpoPlays: Math.floor((state.playsCreated || 0) * 0.15),
      playActionPlays: Math.floor((state.playsCreated || 0) * 0.05),
    }),
    [state.playsCreated]
  );

  // Memoized callbacks for button handlers
  const handleNewPlayClick = useCallback(() => {
    triggerHapticFeedback("light");
    handleOpenQuickCreate();
  }, [handleOpenQuickCreate]);

  const handleFilterClick = useCallback(() => {
    triggerHapticFeedback("light");
    setShowFiltersSheet(true);
  }, [setShowFiltersSheet]);

  const handlePersonnelClick = useCallback(() => {
    triggerHapticFeedback("light");
    handleOpenPersonnel();
  }, [handleOpenPersonnel]);

  const handleSettingsClick = useCallback(() => {
    triggerHapticFeedback("light");
    handleOpenSettings();
  }, [handleOpenSettings]);

  const handleShortcutsClick = useCallback(() => {
    triggerHapticFeedback("light");
    handleOpenKeyboardShortcuts();
  }, [handleOpenKeyboardShortcuts]);

  const handleStatsClick = useCallback(() => {
    triggerHapticFeedback("light");
    setShowStatsSheet(true);
  }, [setShowStatsSheet]);

  const handleBulkToggle = useCallback(() => {
    triggerHapticFeedback("light");
    dispatch({ type: "TOGGLE_BULK" });
  }, [dispatch]);

  const handleSelectionChange = useCallback(
    (selection: Set<string>) => {
      dispatch({ type: "SET_SELECTION", selection });
    },
    [dispatch]
  );

  // Search handlers use local state for instant feedback
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    triggerHapticFeedback("light");
    setLocalSearch("");
  }, []);

  // Memoized handler for new practice script
  const handleNewPracticeScript = useCallback(() => {
    triggerHapticFeedback("light");
    handleOpenPracticeScriptBuilder();
  }, [handleOpenPracticeScriptBuilder]);

  // Memoized handler for import plays
  const handleImportPlays = useCallback(() => {
    triggerHapticFeedback("light");
    handleOpenBuilder();
  }, [handleOpenBuilder]);

  // Memoized handler for team selection navigation
  const handleSelectTeam = useCallback(() => {
    triggerHapticFeedback("light");
    softNavigate("/profile");
  }, []);

  const handleFiltersChange = useCallback(
    (filters: PlaybookFilters) => {
      dispatch({ type: "SET_FILTERS", filters });
    },
    [dispatch]
  );

  const handleRefreshFormations = useCallback(() => {
    dispatch({ type: "INCREMENT_REFRESH" });
  }, [dispatch]);

  // Memoized save handler adapter (PlayList expects different signature)
  const handlePlaySave = useCallback(
    async (playId: string, updates: Partial<Play>) => {
      const existingPlay = optimisticPlays.find((p) => p.id === playId);
      if (existingPlay) {
        await handleSavePlay({ ...existingPlay, ...updates });
      }
    },
    [optimisticPlays, handleSavePlay]
  );

  // Memoized PlayList props to prevent re-renders
  const playListProps = useMemo(
    () => ({
      filters: state.filters,
      playbookId: activePlaybookId ?? undefined,
      optimisticPlays,
      onAddToPracticeScript: handleAddToPracticeScript,
      onAddToGamePlan: handleAddToGamePlan,
      onEdit: handleEditPlay,
      onSave: handlePlaySave,
      onDuplicate: handleDuplicatePlay,
      onOpenBuilder: handleOpenBuilder,
      onOpenAssignments: handleOpenAssignments,
      onPostToTeamBulletin: handlePostToTeamBulletin,
      refreshTrigger: state.refreshTrigger,
      onPlayCountChange: handlePlayCountChange,
      formationSuggestions: suggestions.formations,
      playNameSuggestions: suggestions.playNames,
      enableBulkOperations: state.enableBulkOperations,
      selectedPlayIds: state.selectedPlayIds,
      onPlaySelectionChange: handleSelectionChange,
      hideHeader: true,
    }),
    [
      state.filters,
      state.refreshTrigger,
      state.enableBulkOperations,
      state.selectedPlayIds,
      activePlaybookId,
      optimisticPlays,
      handleAddToPracticeScript,
      handleAddToGamePlan,
      handleEditPlay,
      handlePlaySave,
      handleDuplicatePlay,
      handleOpenBuilder,
      handleOpenAssignments,
      handlePostToTeamBulletin,
      handlePlayCountChange,
      handleSelectionChange,
      suggestions.formations,
      suggestions.playNames,
    ]
  );

  // Dev render timing
  useEffect(() => {
    if (!import.meta.env.DEV || typeof performance === "undefined") {
      return;
    }
    const duration = performance.now() - renderStartRef.current;
    if (duration > MOBILE_RENDER_WARN_THRESHOLD_MS) {
      debug(
        `[MobilePlaybookView] render ${duration.toFixed(1)}ms (view=${state.currentView}, plays=${state.playsCreated})`
      );
    }
  });

  return (
    <>
      {/* Fixed Header - Below AppHeader (top-16 = 64px) */}
      <header
        className="fixed top-16 left-0 right-0 z-sticky bg-surface-primary/98 backdrop-blur-lg border-b border-border shadow-sm touch-manipulation"
        style={{
          paddingTop: "var(--spacing-md)",
          paddingBottom: "var(--spacing-md)",
          paddingLeft: "var(--spacing-lg)",
          paddingRight: "var(--spacing-lg)",
        }}
        role="banner"
        aria-label="Playbook controls"
      >
        {/* View header */}
        <div className="mb-2 flex items-center justify-between gap-3">
          {showHeaderSkeleton ? (
            <div
              className="h-7 flex-1 rounded-lg bg-neutral-200 animate-pulse"
              aria-hidden="true"
            />
          ) : (
            <Typography
              variant="headline-sm"
              className="text-primary font-bold"
            >
              {viewTitles[state.currentView]}
            </Typography>
          )}
          {state.currentView === "playbook" &&
            (showHeaderSkeleton ? (
              <div className="h-9 w-16 flex-shrink-0 rounded-lg bg-neutral-200 animate-pulse" />
            ) : (
              hasPlays && (
                <div className="flex items-center gap-2">
                  {/* New Play Button */}
                  <Button
                    onClick={handleNewPlayClick}
                    variant="primary"
                    size="sm"
                    className="h-9 px-3"
                    aria-label="Create new play"
                  >
                    <Icon
                      name="plus"
                      className="h-4 w-4 mr-1.5"
                      aria-hidden="true"
                    />
                    New
                  </Button>
                  {/* Sort Dropdown */}
                  <SortDropdown
                    value={state.filters.sortBy || "name_asc"}
                    onChange={handleSortChange}
                    compact
                  />
                  {/* Filter Button */}
                  <Button
                    onClick={handleFilterClick}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2"
                    aria-label={
                      hasActiveFilters(state.filters)
                        ? "Filters (active)"
                        : "Open filters"
                    }
                  >
                    <Icon
                      name="filter"
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    {hasActiveFilters(state.filters) && (
                      <span
                        className="ml-1 rounded-full bg-brand-jade px-1.5 py-0.5 text-center text-xs text-white"
                        aria-label="Active filter indicator"
                      >
                        ●
                      </span>
                    )}
                  </Button>
                  {/* More Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors touch-manipulation"
                        aria-label="More actions"
                      >
                        <Icon
                          name="menu"
                          className="h-4 w-4 text-neutral-600"
                          aria-hidden="true"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onSelect={handlePersonnelClick}>
                        <Icon
                          name="users"
                          className="h-4 w-4 mr-2"
                          aria-hidden="true"
                        />
                        Personnel
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleSettingsClick}>
                        <Icon
                          name="settings"
                          className="h-4 w-4 mr-2"
                          aria-hidden="true"
                        />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleShortcutsClick}>
                        <Icon
                          name="zap"
                          className="h-4 w-4 mr-2"
                          aria-hidden="true"
                        />
                        Shortcuts
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleStatsClick}>
                        <Icon
                          name="bar-chart-2"
                          className="h-4 w-4 mr-2"
                          aria-hidden="true"
                        />
                        Stats
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ))}
          {state.currentView === "practice-script" && (
            <Button
              onClick={handleNewPracticeScript}
              variant="primary"
              size="sm"
              className="h-9 px-3"
              aria-label="Create new practice script"
            >
              <Icon name="plus" className="h-4 w-4 mr-1.5" aria-hidden="true" />
              New
            </Button>
          )}
          {/* Game Plan view removed - bottom nav navigates to /gameplans page */}
        </div>

        {/* Search input - only for playbook view */}
        {state.currentView === "playbook" && (
          <>
            {showSearchHeader ? (
              <div className="relative">
                <Icon
                  name="search"
                  className={`pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transform transition-colors ${isSearchStale ? "text-brand-jade animate-pulse" : "text-neutral-400"}`}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search plays, formations..."
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="h-11 w-full rounded-xl border-0 bg-neutral-100 pl-11 pr-11 text-base text-primary placeholder-neutral-500 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-jade/50"
                  aria-label="Search plays"
                />
                {localSearch && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 transform items-center justify-center rounded-full transition-colors hover:bg-neutral-200 touch-manipulation"
                    aria-label="Clear search"
                  >
                    <Icon
                      name="close"
                      className="h-4 w-4 text-neutral-500"
                      aria-hidden="true"
                    />
                  </motion.button>
                )}
              </div>
            ) : (
              showHeaderSkeleton && (
                <div className="h-11 w-full rounded-xl bg-neutral-200 animate-pulse" />
              )
            )}
          </>
        )}
      </header>

      {/* Content area with proper padding for fixed headers */}
      <main
        className="min-h-screen bg-surface-secondary"
        style={contentPaddingStyle}
        role="main"
        aria-label="Playbook content"
        aria-live="polite"
        aria-busy={isLoadingPlays}
      >
        <AnimatePresence mode="wait">
          {/* ============================================
              PLAYBOOK VIEW - Plays List
              ============================================ */}
          {state.currentView === "playbook" && (
            <motion.div
              key="playbook-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {/* Loading State - Show skeleton while data loads */}
              {isLoadingPlays && !hasPlays && (
                <div className="px-4 py-6">
                  <MobilePlayCardSkeletonList count={4} />
                </div>
              )}

              {/* Empty State - Show when no plays exist (after loading completes) */}
              {!isLoadingPlays && !hasPlays && (
                <div className="px-4 py-8">
                  <PlayListEmptyState
                    onCreatePlay={handleNewPlayClick}
                    onImportPlays={handleImportPlays}
                  />
                </div>
              )}

              {/* Main Content - Plays List (show when we have plays) */}
              {hasPlays && (
                <div className="px-4">
                  <PullToRefresh onRefresh={handlePullRefresh}>
                    <ErrorBoundary
                      fallback={
                        <div className="p-6 text-center">
                          <Typography
                            variant="body-md"
                            className="text-secondary"
                          >
                            Failed to load plays. Please refresh the page.
                          </Typography>
                        </div>
                      }
                    >
                      <PlayList {...playListProps} />
                    </ErrorBoundary>
                  </PullToRefresh>
                </div>
              )}

              {/* Selection Mode Toggle - Mobile (moved inline with better styling) */}
              {hasPlays && (
                <div className="px-4 py-3 border-t border-border bg-surface-primary/50">
                  <SelectionModeToggle
                    isActive={state.enableBulkOperations}
                    onToggle={handleBulkToggle}
                    selectedCount={state.selectedPlayIds?.size || 0}
                    variant="compact"
                    className="w-full"
                  />
                </div>
              )}

              {/* Quick Actions moved to header "More" menu for easier access */}

              {/* Formation Cleanup (show only if needed) */}
              {formationAudit.plays.length > 0 && (
                <div className="px-4 py-4 border-t border-border">
                  <Typography
                    variant="label-md"
                    className="text-secondary uppercase tracking-wide mb-3"
                  >
                    Formation Cleanup
                  </Typography>
                  <FormationSyncPanel
                    plays={formationAudit.plays}
                    loading={formationAudit.loading}
                    error={formationAudit.error}
                    onRefresh={handleRefreshFormations}
                    onResolve={handleEditPlay}
                    isMobile
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================
              PRACTICE SCRIPT VIEW
              ============================================ */}
          {state.currentView === "practice-script" && (
            <motion.div
              key="practice-script-view"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <section className="px-4 py-4" aria-label="Practice scripts">
                {activeTeamId ? (
                  <PracticeScriptList
                    teamId={activeTeamId}
                    onEditScript={handleOpenPracticeScriptBuilder}
                    onCreateNew={handleNewPracticeScript}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center mb-6 shadow-md">
                      <Icon
                        name="users"
                        className="w-10 h-10 text-neutral-500"
                        aria-hidden="true"
                      />
                    </div>
                    <Typography
                      variant="headline-md"
                      className="text-primary mb-2"
                    >
                      No Team Selected
                    </Typography>
                    <Typography
                      variant="body-sm"
                      className="text-secondary mb-6 max-w-xs"
                    >
                      Select a team from your profile to view and manage
                      practice scripts.
                    </Typography>
                    <Button
                      onClick={handleSelectTeam}
                      variant="secondary"
                      size="lg"
                      className="w-full max-w-xs"
                    >
                      <Icon
                        name="users"
                        className="h-5 w-5 mr-2"
                        aria-hidden="true"
                      />
                      Select Team
                    </Button>
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Plan view removed - bottom nav now navigates to /gameplans page */}

        {/* FAB removed - redundant with header New button and bottom nav tabs */}
      </main>

      {/* Mobile Bottom Navigation */}
      <PlaybookBottomNav
        currentView={state.currentView}
        onViewChange={handleViewChange}
      />

      {/* Stats Bottom Sheet */}
      <MobileStatsBottomSheet
        isOpen={showStatsSheet}
        onClose={handleStatsClick}
        stats={mobileStats}
      />

      {/* Mobile Filters Bottom Sheet */}
      <MobileFiltersSheet
        isOpen={showFiltersSheet}
        onClose={handleFilterClick}
        filters={state.filters}
        onFiltersChange={handleFiltersChange}
        primaryButtonSize={mobileButtonSize}
        secondaryButtonSize={mobileSecondaryButtonSize}
      />
    </>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const MobilePlaybookView = memo(MobilePlaybookViewInner);
