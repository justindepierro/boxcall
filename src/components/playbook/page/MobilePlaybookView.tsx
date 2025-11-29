import React from "react";
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
import { MobileCTACard, MobileSection, MobileQuickActions } from "../../mobile";
import { PlayGrid } from "../PlayGrid";
import { SelectionModeToggle } from "../SelectionModeToggle";
import { AdvancedFilters } from "../AdvancedFilters";
import { BottomSheet } from "../../BottomSheet";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type { Play } from "../../../types/play";
import type { PlaybookState } from "../../../contexts/PlaybookContext";
import type { FormationAuditResult } from "../../../hooks/useFormationAudit";

interface MobilePlaybookViewProps {
  // State
  state: PlaybookState;
  mobileListExpanded: boolean;
  showFiltersSheet: boolean;
  showStatsSheet: boolean;

  // Data
  debouncedSearchQuery: string;
  optimisticPlays: Play[];
  formationAudit: {
    plays: FormationAuditResult[];
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
  dispatch: any; // TODO: Type properly

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
  dispatch,
  mobileButtonSize,
  mobileSecondaryButtonSize,
  suggestions,
}: MobilePlaybookViewProps) {
  return (
    <>
      {/* Search Bar - FIXED at top (always visible, no scroll needed) */}
      {state.playsCreated > 0 && (
        <div
          className="fixed top-0 left-0 right-0 z-sticky bg-primary/95 backdrop-blur-md border-b border-muted px-4 shadow-md"
          style={{
            paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)",
            paddingBottom: "0.75rem",
          }}
        >
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search plays..."
              value={state.searchQuery}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH", query: e.target.value })
              }
              className="w-full h-12 pl-10 pr-20 bg-secondary border border-muted rounded-lg text-base text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-jade focus:border-transparent transition-all"
            />
            {/* 🚀 PERFORMANCE: Instant search feedback - shows while debouncing */}
            {state.isSearchPending && state.searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-2 bg-brand-jade/10 text-brand-jade px-3 py-1 rounded-full text-xs font-medium"
              >
                <Icon name="refresh-cw" className="h-3 w-3 animate-spin" />
                Searching...
              </motion.div>
            )}
            {state.searchQuery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  duration: 0.1, // Faster animation (was 200ms default)
                }}
                onClick={() => {
                  triggerHapticFeedback("light");
                  dispatch({ type: "SET_SEARCH", query: "" });
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-11 h-11 flex items-center justify-center hover:bg-tertiary rounded-full transition-colors"
                aria-label="Clear search"
              >
                <Icon
                  name="close"
                  className="h-5 w-5 text-secondary hover:text-primary"
                />
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Content area with padding for fixed search bar */}
      <div
        className={`px-4 py-3 space-y-3 pb-32 ${state.playsCreated > 0 ? "pt-20" : ""}`}
        style={{
          paddingTop:
            state.playsCreated > 0
              ? `calc(5rem + env(safe-area-inset-top, 0px))`
              : "1rem",
        }}
      >
        {/* Reduced spacing: py-3, space-y-3, pt-20 for tighter layout */}

        {/* Empty State - Hero CTA */}
        {state.playsCreated === 0 && (
          <MobileSection spacing="comfortable">
            <MobileCTACard
              icon="users"
              title="Setup Your Personnel"
              description="Configure position names and personnel groupings before creating plays"
              action="Configure Personnel"
              variant="primary"
              onTap={handleOpenPersonnel}
            />
          </MobileSection>
        )}

        {/* Main Content - Plays Grid (MOVED TO TOP) */}
        {state.playsCreated > 0 && (
          <MobileSection
            title="Your Plays"
            action={
              !mobileListExpanded && state.playsCreated > 3
                ? "See All"
                : undefined
            }
            onAction={() => {
              triggerHapticFeedback("light");
              setMobileListExpanded(true);
            }}
            spacing="tight"
          >
            <PullToRefresh onRefresh={handlePullRefresh}>
              <ErrorBoundary
                fallback={
                  <div className="p-lg text-center">
                    <Typography variant="body-md" className="text-secondary">
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
                    optimisticPlays: optimisticPlays,
                    onAddToPracticeScript: handleAddToPracticeScript,
                    onAddToGamePlan: handleAddToGamePlan,
                    onEdit: handleEditPlay,
                    onSave: handleSavePlay,
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
          </MobileSection>
        )}

        {/* Selection Mode Toggle - Mobile */}
        {state.playsCreated > 0 && (
          <MobileSection spacing="tight">
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
          </MobileSection>
        )}

        {/* Advanced Filters Button */}
        {state.playsCreated > 0 && (
          <MobileSection spacing="tight">
            <Button
              onClick={() => {
                triggerHapticFeedback("light");
                setShowFiltersSheet(true);
              }}
              variant="secondary"
              className="w-full h-10 text-sm"
            >
              <Icon name="filter" className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(state.advancedFilters).length > 0 && (
                <span className="ml-2 bg-brand-jade text-white text-xs rounded-full px-2 py-0.5">
                  {Object.keys(state.advancedFilters).length}
                </span>
              )}
            </Button>
          </MobileSection>
        )}

        {/* Quick Actions - Compact (MOVED BELOW GRID) */}
        {state.playsCreated > 0 && (
          <MobileSection title="Quick Actions" spacing="tight">
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
                  icon: "command",
                  label: "Shortcuts",
                  onTap: handleOpenKeyboardShortcuts,
                },
              ]}
            />
          </MobileSection>
        )}

        {/* Formation Cleanup (MOVED TO BOTTOM) */}
        {formationAudit.plays.length > 0 && (
          <MobileSection title="Formation Cleanup" spacing="tight">
            <FormationSyncPanel
              plays={formationAudit.plays}
              loading={formationAudit.loading}
              error={formationAudit.error}
              onRefresh={() => {}} // TODO: Pass handler
              onResolve={handleEditPlay}
              onOpenMapper={() => {}} // TODO: Pass handler
              isMobile
            />
          </MobileSection>
        )}

        {/* Floating Action Button for Quick Actions */}
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
      <PlaybookBottomNav />

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
