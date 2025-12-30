/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
import { SelectionModeToggle } from "../SelectionModeToggle";
import { hasActiveFilters, type PlaySortOption } from "../../../types/filters";
import { PracticeScriptList } from "../PracticeScriptList";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { debug } from "../../../utils/logger";
import type { Play } from "../../../types/play";
import type {
  PlaybookState,
  PlaybookAction,
  CoachingView,
} from "../../../contexts/PlaybookContext";
import type { PracticeScript } from "../../../services/practiceService";

const MOBILE_RENDER_WARN_THRESHOLD_MS = 20;

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
  handleQuickNewPracticeScript: () => void;
  handleQuickNewGamePlan: () => void;
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

export function MobilePlaybookView({
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
  handleQuickNewPracticeScript: _handleQuickNewPracticeScript,
  handleQuickNewGamePlan: _handleQuickNewGamePlan,
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

  // Use playsCreated from state as the source of truth for whether plays exist
  // optimisticPlays only contains newly created/updated plays, not all plays
  const hasPlays = state.playsCreated > 0;
  const showHeaderSkeleton =
    isLoadingPlays && state.currentView === "playbook" && !hasPlays;

  // View titles for header
  const viewTitles: Record<CoachingView, string> = {
    playbook: `${state.playsCreated} ${state.playsCreated === 1 ? "Play" : "Plays"}`,
    "practice-script": "Practice Scripts",
    "game-plan": "Game Plans",
    analytics: "Analytics",
  };

  // Determine if we should show the search/filter header
  const showSearchHeader = state.currentView === "playbook" && hasPlays;

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
      {/* Fixed Header - Below AppHeader (top-16 = 64px), shows for playbook view with plays */}
      <div
        className="fixed top-16 left-0 right-0 z-sticky bg-surface-primary/98 backdrop-blur-lg border-b border-border shadow-sm"
        style={{
          paddingTop: "var(--spacing-md)",
          paddingBottom: "var(--spacing-md)",
          paddingLeft: "var(--spacing-lg)",
          paddingRight: "var(--spacing-lg)",
        }}
      >
        {/* View header */}
        <div className="mb-2 flex items-center justify-between gap-3">
          {showHeaderSkeleton ? (
            <div className="h-7 flex-1 rounded-lg bg-neutral-200 animate-pulse" />
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
                    onClick={() => {
                      triggerHapticFeedback("light");
                      handleOpenQuickCreate();
                    }}
                    variant="primary"
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Icon name="plus" className="h-4 w-4 mr-1.5" />
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
                    onClick={() => {
                      triggerHapticFeedback("light");
                      setShowFiltersSheet(true);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-9 px-2"
                  >
                    <Icon name="filter" className="h-4 w-4" />
                    {hasActiveFilters(state.filters) && (
                      <span className="ml-1 rounded-full bg-brand-jade px-1.5 py-0.5 text-center text-xs text-white">
                        ●
                      </span>
                    )}
                  </Button>
                  {/* More Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                        aria-label="More actions"
                      >
                        <Icon
                          name="menu"
                          className="h-4 w-4 text-neutral-600"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onSelect={() => {
                          triggerHapticFeedback("light");
                          handleOpenPersonnel();
                        }}
                      >
                        <Icon name="users" className="h-4 w-4 mr-2" />
                        Personnel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          triggerHapticFeedback("light");
                          handleOpenSettings();
                        }}
                      >
                        <Icon name="settings" className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          triggerHapticFeedback("light");
                          handleOpenKeyboardShortcuts();
                        }}
                      >
                        <Icon name="zap" className="h-4 w-4 mr-2" />
                        Shortcuts
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          triggerHapticFeedback("light");
                          setShowStatsSheet(true);
                        }}
                      >
                        <Icon name="bar-chart-2" className="h-4 w-4 mr-2" />
                        Stats
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            ))}
          {state.currentView === "practice-script" && (
            <Button
              onClick={() => {
                triggerHapticFeedback("light");
                handleOpenPracticeScriptBuilder();
              }}
              variant="primary"
              size="sm"
              className="h-9 px-3"
            >
              <Icon name="plus" className="h-4 w-4 mr-1.5" />
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
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transform text-neutral-400"
                />
                <input
                  type="search"
                  placeholder="Search plays, formations..."
                  value={state.filters.search}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FILTERS",
                      filters: { ...state.filters, search: e.target.value },
                    })
                  }
                  className="h-11 w-full rounded-xl border-0 bg-neutral-100 pl-11 pr-11 text-base text-primary placeholder-neutral-500 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-jade/50"
                />
                {state.filters.search && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    }}
                    onClick={() => {
                      triggerHapticFeedback("light");
                      dispatch({
                        type: "SET_FILTERS",
                        filters: { ...state.filters, search: "" },
                      });
                    }}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 transform items-center justify-center rounded-full transition-colors hover:bg-neutral-200"
                    aria-label="Clear search"
                  >
                    <Icon name="close" className="h-4 w-4 text-neutral-500" />
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
      </div>

      {/* Content area with proper padding for fixed headers (AppHeader 64px + MobileHeader ~80-110px) */}
      <div
        className="min-h-screen bg-surface-secondary"
        style={{
          paddingTop: showSearchHeader
            ? "calc(64px + 110px)" // AppHeader (64px) + MobileHeader with search (~110px)
            : "calc(64px + 60px)", // AppHeader (64px) + MobileHeader without search (~60px)
          paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* ============================================
            PLAYBOOK VIEW - Plays List
            ============================================ */}
        {state.currentView === "playbook" && (
          <>
            {/* Loading State - Show skeleton while data loads */}
            {isLoadingPlays && !hasPlays && (
              <div className="px-4 py-6">
                <MobilePlayCardSkeletonList count={4} />
              </div>
            )}

            {/* Empty State - Show when no plays exist (after loading completes) */}
            {!isLoadingPlays && !hasPlays && (
              <div className="px-4 py-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-jade-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-jade-500/25">
                    <Icon name="file" className="w-10 h-10 text-white" />
                  </div>
                  <Typography
                    variant="headline-md"
                    className="text-primary mb-2"
                  >
                    Your Playbook is Empty
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-secondary mb-6 max-w-xs"
                  >
                    Get started by creating your first play or importing from a
                    spreadsheet.
                  </Typography>
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <Button
                      onClick={() => {
                        triggerHapticFeedback("medium");
                        handleOpenQuickCreate();
                      }}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <Icon name="plus" className="h-5 w-5 mr-2" />
                      Create First Play
                    </Button>
                    <Button
                      onClick={() => {
                        triggerHapticFeedback("light");
                        handleOpenBuilder();
                      }}
                      variant="secondary"
                      size="lg"
                      className="w-full"
                    >
                      <Icon name="upload" className="h-5 w-5 mr-2" />
                      Import Plays
                    </Button>
                  </div>
                </div>
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
                    {/* Define common PlayList props once - single source of truth */}
                    {(() => {
                      const commonPlayListProps = {
                        filters: state.filters,
                        playbookId: activePlaybookId ?? undefined,
                        optimisticPlays,
                        onAddToPracticeScript: handleAddToPracticeScript,
                        onAddToGamePlan: handleAddToGamePlan,
                        onEdit: handleEditPlay,
                        // Adapter: PlayList expects (playId, updates) but handleSavePlay receives full Play object
                        onSave: async (
                          playId: string,
                          updates: Partial<Play>
                        ) => {
                          const existingPlay = optimisticPlays.find(
                            (p) => p.id === playId
                          );
                          if (existingPlay) {
                            await handleSavePlay({
                              ...existingPlay,
                              ...updates,
                            });
                          }
                        },
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
                        onPlaySelectionChange: (selection: Set<string>) =>
                          dispatch({ type: "SET_SELECTION", selection }),
                        // Hide PlayListHeader on mobile - MobilePlaybookView has its own header
                        hideHeader: true,
                      };

                      return <PlayList {...commonPlayListProps} />;
                    })()}
                  </ErrorBoundary>
                </PullToRefresh>
              </div>
            )}

            {/* Selection Mode Toggle - Mobile (moved inline with better styling) */}
            {hasPlays && (
              <div className="px-4 py-3 border-t border-border bg-surface-primary/50">
                <SelectionModeToggle
                  isActive={state.enableBulkOperations}
                  onToggle={() => {
                    triggerHapticFeedback("light");
                    dispatch({ type: "TOGGLE_BULK" });
                  }}
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
                  onRefresh={() => dispatch({ type: "INCREMENT_REFRESH" })}
                  onResolve={handleEditPlay}
                  isMobile
                />
              </div>
            )}
          </>
        )}

        {/* ============================================
            PRACTICE SCRIPT VIEW
            ============================================ */}
        {state.currentView === "practice-script" && (
          <div className="px-4 py-4">
            {activeTeamId ? (
              <PracticeScriptList
                teamId={activeTeamId}
                onEditScript={handleOpenPracticeScriptBuilder}
                onCreateNew={() => handleOpenPracticeScriptBuilder()}
              />
            ) : (
              <div className="text-center py-12">
                <Icon
                  name="clock"
                  className="h-16 w-16 text-neutral-300 mx-auto mb-4"
                />
                <Typography
                  variant="headline-sm"
                  className="text-secondary mb-2"
                >
                  Select a Team
                </Typography>
                <Typography variant="body-sm" className="text-neutral-500">
                  Please select a team to view practice scripts.
                </Typography>
              </div>
            )}
          </div>
        )}

        {/* Game Plan view removed - bottom nav now navigates to /gameplans page */}

        {/* FAB removed - redundant with header New button and bottom nav tabs */}
      </div>

      {/* Mobile Bottom Navigation */}
      <PlaybookBottomNav
        currentView={state.currentView}
        onViewChange={handleViewChange}
      />

      {/* Stats Bottom Sheet */}
      <MobileStatsBottomSheet
        isOpen={showStatsSheet}
        onClose={() => setShowStatsSheet(false)}
        stats={{
          totalPlays: state.playsCreated || 0,
          formationsCount: Math.max(
            1,
            Math.floor((state.playsCreated || 0) / 3)
          ),
          passPlays: Math.floor((state.playsCreated || 0) * 0.4),
          runPlays: Math.floor((state.playsCreated || 0) * 0.4),
          rpoPlays: Math.floor((state.playsCreated || 0) * 0.15),
          playActionPlays: Math.floor((state.playsCreated || 0) * 0.05),
        }}
      />

      {/* Mobile Filters Bottom Sheet */}
      <MobileFiltersSheet
        isOpen={showFiltersSheet}
        onClose={() => setShowFiltersSheet(false)}
        filters={state.filters}
        onFiltersChange={(filters) =>
          dispatch({ type: "SET_FILTERS", filters })
        }
        primaryButtonSize={mobileButtonSize}
        secondaryButtonSize={mobileSecondaryButtonSize}
      />
    </>
  );
}
