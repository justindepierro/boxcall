/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Icon } from "../../ui/Icon/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { ErrorBoundary } from "../../ui/ErrorBoundary";
import { PullToRefresh } from "../../PullToRefresh";
import { FloatingActionButton } from "../../FloatingActionButton";
import { FABPresets } from "../../FABPresets";
import { PlaybookBottomNav } from "../page/PlaybookBottomNav";
import { MobileStatsBottomSheet } from "../page/MobileStatsBottomSheet";
import { FormationSyncPanel } from "../../formations/FormationSyncPanel";
import { MobileQuickActions } from "../../mobile";
import { MobilePlayCardSkeletonList } from "../../mobile/ui/MobilePlayCardSkeleton";
import { PlayGrid } from "../PlayGrid";
import { SelectionModeToggle } from "../SelectionModeToggle";
import { AdvancedFilters } from "../AdvancedFilters";
import { BottomSheet } from "../../BottomSheet";
import { PracticeScriptList } from "../PracticeScriptList";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { debug } from "../../../utils/logger";
import type { Play } from "../../../types/play";
import type {
  PlaybookState,
  CoachingView,
} from "../../../contexts/PlaybookContext";
import type { PracticeScript } from "../../../services/practiceService";

const MOBILE_RENDER_WARN_THRESHOLD_MS = 20;

interface MobilePlaybookViewProps {
  // State
  state: PlaybookState;
  mobileListExpanded: boolean;
  showFiltersSheet: boolean;
  showStatsSheet: boolean;
  activeTeamId: string | null;
  isLoadingPlays: boolean;

  // Data
  debouncedSearchQuery: string;
  optimisticPlays: Play[];
  formationAudit: {
    plays: Play[];
    loading: boolean;
    error: string | null;
  };
  formationAuditSummary: any; // TODO: Type properly

  // Handlers
  setMobileListExpanded: (expanded: boolean) => void;
  setShowFiltersSheet: (show: boolean) => void;
  setShowStatsSheet: (show: boolean) => void;
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
  dispatch: any; // TODO: Type properly
  navigate: (path: string) => void;

  // UI
  mobileButtonSize: any; // TODO: Type properly
  mobileSecondaryButtonSize: any; // TODO: Type properly

  // Suggestions
  suggestions: {
    formations: string[];
    playNames: string[];
  };
}

export function MobilePlaybookView({
  state,
  mobileListExpanded,
  showFiltersSheet,
  showStatsSheet,
  activeTeamId,
  isLoadingPlays,
  debouncedSearchQuery,
  optimisticPlays,
  formationAudit,
  formationAuditSummary,
  setMobileListExpanded,
  setShowFiltersSheet,
  setShowStatsSheet,
  handleOpenQuickCreate,
  handleOpenPersonnel,
  handleOpenSettings,
  handleQuickNewPracticeScript,
  handleQuickNewGamePlan,
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
  navigate,
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
      {/* Fixed Header - Shows for playbook view with plays, or view title for other views */}
      <div
        className="fixed top-0 left-0 right-0 z-sticky bg-surface-primary/98 backdrop-blur-lg border-b border-border shadow-sm"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), var(--spacing-md))",
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
                <Button
                  onClick={() => {
                    triggerHapticFeedback("light");
                    setShowFiltersSheet(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3"
                >
                  <Icon name="filter" className="mr-1.5 h-4 w-4" />
                  Filter
                  {Object.keys(state.advancedFilters).length > 0 && (
                    <span className="ml-1.5 rounded-full bg-brand-jade px-1.5 py-0.5 text-center text-xs text-white">
                      {Object.keys(state.advancedFilters).length}
                    </span>
                  )}
                </Button>
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
          {state.currentView === "game-plan" && (
            <Button
              onClick={() => {
                triggerHapticFeedback("light");
                handleQuickNewGamePlan();
              }}
              variant="primary"
              size="sm"
              className="h-9 px-3"
            >
              <Icon name="plus" className="h-4 w-4 mr-1.5" />
              New
            </Button>
          )}
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
                  value={state.searchQuery}
                  onChange={(e) =>
                    dispatch({ type: "SET_SEARCH", query: e.target.value })
                  }
                  className="h-11 w-full rounded-xl border-0 bg-neutral-100 pl-11 pr-11 text-base text-primary placeholder-neutral-500 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-jade/50"
                />
                {state.searchQuery && (
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
                      dispatch({ type: "SET_SEARCH", query: "" });
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

      {/* Content area with proper padding for fixed header */}
      <div
        className="min-h-screen bg-surface-secondary"
        style={{
          paddingTop: showSearchHeader
            ? `calc(110px + env(safe-area-inset-top, 0px))`
            : `calc(70px + env(safe-area-inset-top, 0px))`,
          paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* ============================================
            PLAYBOOK VIEW - Plays List
            ============================================ */}
        {state.currentView === "playbook" && (
          <>
            {/* Loading State - Show skeleton while data loads */}
            {!hasPlays && (
              <div className="px-4 py-6">
                <MobilePlayCardSkeletonList count={4} />
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
                    {/* Define common PlayGrid props once - single source of truth */}
                    {(() => {
                      const commonPlayGridProps = {
                        searchQuery: debouncedSearchQuery,
                        filters: state.selectedFilters,
                        optimisticPlays,
                        onAddToPracticeScript: handleAddToPracticeScript,
                        onAddToGamePlan: handleAddToGamePlan,
                        onEdit: handleEditPlay,
                        // Adapter: PlayGrid expects (playId, updates) but handleSavePlay receives full Play object
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
                      };

                      return (
                        <PlayGrid
                          {...commonPlayGridProps}
                          mobileListExpanded={mobileListExpanded}
                          onMobileListExpand={() => setMobileListExpanded(true)}
                        />
                      );
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

            {/* Quick Actions - Simplified grid */}
            {hasPlays && (
              <div className="px-4 py-4">
                <Typography
                  variant="label-md"
                  className="text-secondary uppercase tracking-wide mb-3"
                >
                  Quick Actions
                </Typography>
                <MobileQuickActions
                  actions={[
                    {
                      id: "personnel",
                      icon: "users",
                      label: "Personnel",
                      onTap: handleOpenPersonnel,
                    },
                    {
                      id: "settings",
                      icon: "settings",
                      label: "Settings",
                      onTap: handleOpenSettings,
                    },
                    {
                      id: "shortcuts",
                      icon: "zap",
                      label: "Shortcuts",
                      onTap: handleOpenKeyboardShortcuts,
                    },
                  ]}
                />
              </div>
            )}

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
                  onRefresh={() => dispatch({ type: "REFRESH" })}
                  onResolve={handleEditPlay}
                  onOpenMapper={() => navigate("/playbook/formation-mapper")}
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

        {/* ============================================
            GAME PLAN VIEW
            ============================================ */}
        {state.currentView === "game-plan" && (
          <div className="px-4 py-4">
            <div className="text-center py-12">
              <Icon
                name="target"
                className="h-16 w-16 text-neutral-300 mx-auto mb-4"
              />
              <Typography variant="headline-sm" className="text-secondary mb-2">
                No Game Plans Yet
              </Typography>
              <Typography variant="body-sm" className="text-neutral-500 mb-6">
                Create your first game plan to strategize plays for upcoming
                matches.
              </Typography>
              <Button
                onClick={() => {
                  triggerHapticFeedback("light");
                  handleQuickNewGamePlan();
                }}
                variant="primary"
                size={mobileButtonSize}
              >
                <Icon name="plus" className="h-4 w-4 mr-2" />
                Create Game Plan
              </Button>
            </div>
          </div>
        )}

        {/* Floating Action Button - context-aware */}
        <FloatingActionButton
          actions={FABPresets.playbook({
            onNewPlay: handleOpenQuickCreate,
            onWhiteboard: handleOpenKeyboardShortcuts,
            onPractice: handleQuickNewPracticeScript,
            onGamePlan: handleQuickNewGamePlan,
          })}
          icon="plus"
        />
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
          playsWithDiagrams: Math.floor(
            (state.playsCreated || 0) * (state.diagramCoverage / 100)
          ),
          formationsCount: Math.max(
            1,
            Math.floor((state.playsCreated || 0) / 3)
          ),
          passPlays: Math.floor((state.playsCreated || 0) * 0.4),
          runPlays: Math.floor((state.playsCreated || 0) * 0.4),
          rpoPlays: Math.floor((state.playsCreated || 0) * 0.15),
          playActionPlays: Math.floor((state.playsCreated || 0) * 0.05),
          formationsNeedingMapping: formationAuditSummary.needsMapping,
        }}
      />

      {/* Mobile Filters Bottom Sheet */}
      {showFiltersSheet && (
        <BottomSheet
          snapPoints={[0.1, 0.6, 0.9]}
          initialSnapPoint={1}
          onSnapPointChange={(snapPoint) => {
            // Close when fully minimized
            if (snapPoint < 0.15) {
              setShowFiltersSheet(false);
            }
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-muted">
              <Typography variant="headline-md" className="text-primary">
                Filters & Search
              </Typography>
              <Button
                onClick={() => setShowFiltersSheet(false)}
                variant="ghost"
                size="sm"
              >
                <Icon name="close" className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-20">
              <AdvancedFilters
                activeFilters={state.advancedFilters}
                onFiltersChange={(filters) =>
                  dispatch({ type: "SET_ADVANCED_FILTERS", filters })
                }
              />
            </div>

            {/* Action Footer - Fixed at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-primary border-t border-muted shadow-lg">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    dispatch({ type: "SET_ADVANCED_FILTERS", filters: [] });
                    setShowFiltersSheet(false);
                  }}
                  variant="secondary"
                  size={mobileSecondaryButtonSize}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowFiltersSheet(false)}
                  variant="primary"
                  size={mobileButtonSize}
                  className="flex-1"
                >
                  <Icon name="check" className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
              {Object.keys(state.advancedFilters).length > 0 && (
                <p className="text-center text-xs text-secondary mt-2">
                  {Object.keys(state.advancedFilters).length} filter
                  {Object.keys(state.advancedFilters).length === 1
                    ? ""
                    : "s"}{" "}
                  active
                </p>
              )}
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
