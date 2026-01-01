/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, { useMemo, useEffect, useCallback } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { PlayCardWrapper } from "./PlayCardWrapper";
import { PlayListSkeleton } from "./PlayListSkeleton";
import { PlayListErrorState } from "./PlayListErrorState";
import { PlayListEmptyState } from "./PlayListEmptyState";
import {
  PLAYLIST_CLEAR_FILTERS_EVENT,
  PLAYLIST_OPEN_IMPORT_EVENT,
  dispatchDocumentAppEvent,
} from "../../utils/appEvents";
import { usePlaybookData } from "../../hooks/usePlaybookData";
import { useFilteredPlays } from "../../hooks/useFilteredPlays";
import { EMPTY_FILTERS } from "../../types/filters";
import type { PlaybookFilters, PlaySortOption } from "../../types/filters";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import type { Play } from "../../types/play";
import { Typography } from "../design-system/Typography";
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
import { usePersonnelConfigurations } from "../../hooks/usePersonnel";
import { debug, warn } from "../../utils/logger";
import { useSaveState } from "../../hooks/useSaveState";

// Extracted modules
import {
  usePlayPreferences,
  usePlayExpansion,
  usePlaySelection,
  useCollectedSuggestions,
  usePlaylistKeyboard,
} from "./PlayList/hooks";
import { createPlaySaveHandler } from "./PlayList/handlers";
import { PlayListHeader, NoTeamSelectedState } from "./PlayList/components";

interface PlayListProps {
  filters?: PlaybookFilters;
  optimisticPlays?: Play[];
  playbookId?: string;
  onEdit?: (play: Play) => void;
  onSave?: (playId: string, updates: Partial<Play>) => Promise<void>;
  onDuplicate?: (play: Play) => void;
  onOpenAssignments?: (play: Play) => void;
  onAddToPracticeScript?: (play: Play) => void;
  onAddToGamePlan?: (play: Play) => void;
  onPostToTeamBulletin?: (play: Play) => void;
  onEnterFullscreen?: (plays: Play[], playIndex: number) => void;
  onPlayCreated?: () => void;
  onPlayCountChange?: (count: number) => void;
  refreshTrigger?: number;
  enableBulkOperations?: boolean;
  selectedPlayIds?: Set<string>;
  onPlaySelectionChange?: (playIds: Set<string>) => void;
  onOpenBuilder?: () => void;
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
  // Search and sort props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  sortBy?: PlaySortOption;
  onSortChange?: (value: PlaySortOption) => void;
  useWindowScroll?: boolean;
  // Mobile-specific
  hideHeader?: boolean;
}

const PlayListInner: React.FC<PlayListProps> = ({
  filters = EMPTY_FILTERS,
  optimisticPlays = [],
  playbookId,
  onEdit,
  onDuplicate,
  onOpenAssignments,
  onPostToTeamBulletin,
  onEnterFullscreen,
  onPlayCountChange,
  refreshTrigger = 0,
  enableBulkOperations = false,
  selectedPlayIds = new Set(),
  onPlaySelectionChange,
  onOpenBuilder,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  // useWindowScroll prop kept for API compatibility but not used (Virtuoso removed)
  useWindowScroll: _useWindowScroll = false,
  hideHeader = false,
}) => {
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);

  const effectivePlaybookId = useMemo(() => {
    const trimmed = String(playbookId ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
  }, [playbookId]);

  // Extracted hooks
  const {
    showOneWordCalls,
    setShowOneWordCalls,
    directionDisplayFormat,
    setDirectionDisplayFormat,
  } = usePlayPreferences();
  const { favoriteIds } = useFavoritePlays();
  const { startSaving, finishSaving } = useSaveState();
  const { expandedPlayId, handleToggleExpand } = usePlayExpansion("list");

  // Get data from database - SINGLE SOURCE OF TRUTH
  const {
    plays: databasePlays,
    loading,
    error,
    refreshData,
    updatePlay,
    hasMorePlays: hasMorePlaysFromDB,
    loadingMorePlays,
    totalCount: totalPlaysCount,
    loadMorePlays,
  } = usePlaybookData(effectivePlaybookId);

  // Refresh on trigger change
  useEffect(() => {
    if (refreshTrigger > 0) {
      debug("Refreshing plays data due to trigger:", refreshTrigger);
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

  // Merge optimistic plays with database plays
  const plays: Play[] = useMemo(() => {
    const dbPlayIds = new Set(databasePlays.map((p) => p.id));
    const uniqueOptimisticPlays = optimisticPlays.filter(
      (p) => !dbPlayIds.has(p.id)
    );
    return [...uniqueOptimisticPlays, ...databasePlays];
  }, [optimisticPlays, databasePlays]);

  // Plays are already scoped by usePlaybookData - no additional filtering needed
  const scopedPlays: Play[] = plays;

  // Dev-only logging
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (loading) return;
    debug("[PlayList] Data loaded:", {
      playbookId: effectivePlaybookId,
      playsCount: plays.length,
      totalCount: totalPlaysCount,
    });
  }, [effectivePlaybookId, loading, plays.length, totalPlaysCount]);

  // Notify parent of play count changes
  useEffect(() => {
    if (!onPlayCountChange || loading) return;
    onPlayCountChange(scopedPlays.length);
  }, [loading, scopedPlays.length, onPlayCountChange]);

  // Play save handler
  const handlePlaySave = useMemo(
    () => createPlaySaveHandler({ updatePlay, startSaving, finishSaving }),
    [updatePlay, startSaving, finishSaving]
  );

  // UNIFIED FILTERING (Phase 3) - Convert legacy props to unified PlaybookFilters
  // Apply filters using the unified hook
  const { filteredPlays, hasFilters } = useFilteredPlays(
    scopedPlays,
    filters,
    favoriteIds
  );

  // Use filtered plays directly (drag-and-drop removed with grid view)
  const displayPlays = filteredPlays;

  // Play selection
  const { handlePlaySelect, handleSelectAll } = usePlaySelection({
    selectedPlayIds,
    onPlaySelectionChange,
    displayPlays,
  });

  // Keyboard navigation
  const playIds = useMemo(() => displayPlays.map((p) => p.id), [displayPlays]);
  const { focusedPlayId, containerProps } = usePlaylistKeyboard({
    playIds,
    expandedPlayId,
    onToggleExpand: handleToggleExpand,
    enabled: !loading && displayPlays.length > 0,
  });

  // Personnel configurations
  const playbookIdForPersonnel =
    playbookId ?? (plays.length > 0 ? plays[0].playbook_id : undefined);
  const { data: personnelConfigurations = [] } = usePersonnelConfigurations(
    playbookIdForPersonnel
  );

  // Collected suggestions
  const collectedSuggestions = useCollectedSuggestions({
    plays,
    personnelConfigurations,
  });

  const showEmpty = displayPlays.length === 0 && !loading && !error;

  // Dev render diagnostics
  if (import.meta.env.DEV) {
    const selfAny = PlayList as unknown as {
      __renderInfo?: { count: number; start: number };
    };
    if (!selfAny.__renderInfo) {
      selfAny.__renderInfo = { count: 0, start: performance.now() };
    }
    selfAny.__renderInfo.count += 1;
    const { count, start } = selfAny.__renderInfo;
    if (count % 100 === 0) {
      const elapsed = performance.now() - start;
      if (elapsed < 8000) {
        warn(
          `[PlayList] High render frequency: ${count} renders in ${elapsed.toFixed(0)}ms`
        );
      }
    }
  }

  // Stable render callback for Virtuoso
  const renderPlayItem = useCallback(
    (index: number, play: Play) => (
      <PlayCardWrapper
        play={play}
        variant="list"
        index={index}
        showOneWordCalls={showOneWordCalls}
        onEdit={onEdit}
        onSave={handlePlaySave}
        onDuplicate={onDuplicate}
        onOpenAssignments={onOpenAssignments}
        onPostToTeamBulletin={onPostToTeamBulletin}
        onEnterFullscreen={onEnterFullscreen}
        allPlays={plays}
        isSelected={selectedPlayIds.has(play.id)}
        onSelectionChange={enableBulkOperations ? handlePlaySelect : undefined}
        formationSuggestions={collectedSuggestions.formations}
        playNameSuggestions={collectedSuggestions.playNames}
        playTypeSuggestions={collectedSuggestions.playTypes}
        personnelSuggestions={collectedSuggestions.personnel}
        personnelConfigurations={personnelConfigurations}
        directionDisplayFormat={directionDisplayFormat}
        expandedPlayId={expandedPlayId}
        onToggleExpand={handleToggleExpand}
        isFocused={focusedPlayId === play.id}
        searchQuery={searchQuery}
        existingPlays={plays}
      />
    ),
    [
      showOneWordCalls,
      onEdit,
      handlePlaySave,
      onDuplicate,
      onOpenAssignments,
      onPostToTeamBulletin,
      selectedPlayIds,
      handlePlaySelect,
      enableBulkOperations,
      collectedSuggestions,
      personnelConfigurations,
      plays,
      focusedPlayId,
      searchQuery,
      directionDisplayFormat,
      expandedPlayId,
      handleToggleExpand,
      onEnterFullscreen,
    ]
  );

  // No team selected state
  if (!activeTeamId && !loading) {
    return <NoTeamSelectedState />;
  }

  return (
    <div className="space-y-3" aria-live="polite">
      {loading && <PlayListSkeleton count={8} />}
      {error && !loading && (
        <PlayListErrorState error={error} onRetry={refreshData} />
      )}
      {showEmpty && !loading && !error && (
        <PlayListEmptyState
          onCreatePlay={onOpenBuilder}
          onImportPlays={() =>
            dispatchDocumentAppEvent(PLAYLIST_OPEN_IMPORT_EVENT)
          }
          hasActiveFilters={!!hasFilters}
          totalPlayCount={plays.length}
          searchQuery={filters.search}
          onClearFilters={() =>
            dispatchDocumentAppEvent(PLAYLIST_CLEAR_FILTERS_EVENT)
          }
          onSuggestedSearch={onSearchChange}
        />
      )}

      {!loading &&
        !error &&
        !hideHeader &&
        (() => {
          // Derive category for header display
          let selectedCategory: string | undefined;
          if (filters.favoritesOnly) {
            selectedCategory = "favorites";
          } else if (filters.mostUsedOnly) {
            selectedCategory = "most-used";
          } else {
            selectedCategory = filters.playType ?? undefined;
          }

          return (
            <div className="sticky top-[var(--playbook-sticky-offset,96px)] z-20 bg-surface-primary pb-3 pt-2 -mx-4 px-4 border-b border-border mb-2 shadow-sm">
              <PlayListHeader
                displayPlays={displayPlays}
                totalCount={totalPlaysCount}
                selectedCategory={selectedCategory}
                selectedSubcategory={undefined}
                enableBulkOperations={enableBulkOperations}
                selectedPlayIds={selectedPlayIds}
                onSelectAll={handleSelectAll}
                showOneWordCalls={showOneWordCalls ?? false}
                onShowOneWordCallsChange={setShowOneWordCalls}
                directionDisplayFormat={directionDisplayFormat || "full"}
                onDirectionDisplayFormatChange={setDirectionDisplayFormat}
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
              />
            </div>
          );
        })()}

      {/* List View - Simple render without virtualization for window scroll mode */}
      {!showEmpty && !loading && !error && (
        <div
          className="outline-none focus-visible:ring-2 focus-visible:ring-jade-500 focus-visible:ring-offset-2 rounded-lg"
          {...containerProps}
        >
          {/* Render all plays directly - virtualization disabled for now due to height calculation issues */}
          <div className="space-y-2">
            {displayPlays.map((play, index) => (
              <React.Fragment key={play.id}>
                {renderPlayItem(index, play)}
              </React.Fragment>
            ))}
          </div>

          {/* Footer content */}
          <div className="mt-4">
            {loadingMorePlays && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-2 text-muted">
                  <Icon name="refresh-cw" className="h-4 w-4 animate-spin" />
                  <Typography variant="body-sm">
                    Loading more plays...
                  </Typography>
                </div>
              </div>
            )}

            {!loadingMorePlays && hasMorePlaysFromDB && (
              <div className="flex justify-center py-6 pb-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    debug("Manual load more triggered");
                    loadMorePlays();
                  }}
                  className="w-52"
                  icon={<Icon name="arrow-down" />}
                  iconPosition="right"
                >
                  Load More Plays
                </Button>
              </div>
            )}

            {!loadingMorePlays &&
              !hasMorePlaysFromDB &&
              totalPlaysCount !== null &&
              totalPlaysCount > 0 &&
              displayPlays.length >= totalPlaysCount && (
                <div className="flex justify-center py-6 pb-8">
                  <Typography variant="body-sm" className="text-muted">
                    All {totalPlaysCount} plays loaded
                  </Typography>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

// Props equality checker
function arePlayListPropsEqual(prev: PlayListProps, next: PlayListProps) {
  // CRITICAL: Check playbookId first - this determines which plays to load!
  if (prev.playbookId !== next.playbookId) return false;

  // Compare unified filters - shallow compare each property
  const pf = prev.filters ?? EMPTY_FILTERS;
  const nf = next.filters ?? EMPTY_FILTERS;
  if (pf.search !== nf.search) return false;
  if (pf.playType !== nf.playType) return false;
  if (pf.personnel !== nf.personnel) return false;
  if (pf.situation !== nf.situation) return false;
  if (pf.fieldPosition !== nf.fieldPosition) return false;
  if (pf.down !== nf.down) return false;
  if (pf.distance !== nf.distance) return false;
  if (pf.favoritesOnly !== nf.favoritesOnly) return false;
  if (pf.mostUsedOnly !== nf.mostUsedOnly) return false;
  // Deep compare tags array
  if (pf.tags.length !== nf.tags.length) return false;
  if (pf.tags.length > 0 && JSON.stringify(pf.tags) !== JSON.stringify(nf.tags))
    return false;

  if (prev.refreshTrigger !== next.refreshTrigger) return false;
  if (prev.enableBulkOperations !== next.enableBulkOperations) return false;
  if (prev.useWindowScroll !== next.useWindowScroll) return false;
  if (prev.hideHeader !== next.hideHeader) return false;

  const ps = prev.selectedPlayIds;
  const ns = next.selectedPlayIds;
  if (ps && ns) {
    if (ps.size !== ns.size) return false;
    let i = 0;
    for (const id of ps) {
      if (!ns.has(id)) return false;
      if (++i > 10) break;
    }
  } else if (ps !== ns) return false;

  const handlerKeys: (keyof PlayListProps)[] = [
    "onEdit",
    "onDuplicate",
    "onAddToPracticeScript",
    "onAddToGamePlan",
    "onPlaySelectionChange",
    "onPlayCountChange",
  ];
  for (const hk of handlerKeys) {
    const a = prev[hk];
    const b = next[hk];
    if ((a && !b) || (!a && b)) return false;
  }
  return true;
}

export const PlayList = React.memo(PlayListInner, arePlayListPropsEqual);

if (import.meta.env.DEV) {
  interface WdyrMark {
    whyDidYouRender?: boolean;
  }
  (PlayList as unknown as WdyrMark).whyDidYouRender = false;
}
