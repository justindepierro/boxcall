/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, { useMemo, useEffect, useCallback } from "react";
import { Icon } from "../ui/Icon/Icon";
import { PlayCardWrapper } from "./PlayCardWrapper";
import { PlayGridSkeleton } from "./PlayGridSkeleton";
import { PlayGridErrorState } from "./PlayGridErrorState";
import { PlayGridEmptyState } from "./PlayGridEmptyState";
import {
  PLAYGRID_CLEAR_FILTERS_EVENT,
  PLAYGRID_OPEN_IMPORT_EVENT,
  dispatchDocumentAppEvent,
} from "../../utils/appEvents";
import { Virtuoso } from "react-virtuoso";
import { useTeamsData } from "../../hooks/useTeamsData";
import { useActiveTeamStore } from "../../stores/activeTeamStore";
import type { Play } from "../../types/play";
import { Typography } from "../design-system/Typography";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
import { usePersonnelConfigurations } from "../../hooks/usePersonnel";
import { debug, warn, info } from "../../utils/logger";
import { useSaveState } from "../../hooks/useSaveState";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Extracted modules
import { mapDatabasePlayToFullPlay } from "./PlayGrid/utils/playDataUtils";
import {
  usePlayPreferences,
  useViewMode,
  usePlayExpansion,
  usePlaySelection,
  usePlayFiltering,
  useMobileProgressiveLoading,
  useCollectedSuggestions,
  useDragAndDrop,
  MOBILE_INITIAL_PLAYS,
} from "./PlayGrid/hooks";
import { createPlaySaveHandler } from "./PlayGrid/handlers";
import {
  PlayGridHeader,
  NoTeamSelectedState,
  LoadMoreButton,
  AllPlaysLoadedMessage,
} from "./PlayGrid/components";

// Mobile components
import { MobilePlayCard } from "./page/MobilePlayCard";
import { SwipeActions } from "./page/SwipeActions";

interface PlayGridProps {
  searchQuery: string;
  filters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
  optimisticPlays?: Play[];
  selectedCategory?: string;
  selectedSubcategory?: string;
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
  mobileListExpanded?: boolean;
  onMobileListExpand?: () => void;
}

const PlayGridInner: React.FC<PlayGridProps> = ({
  searchQuery,
  filters,
  optimisticPlays = [],
  selectedCategory,
  selectedSubcategory,
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
  mobileListExpanded = false,
  onMobileListExpand,
}) => {
  const activeTeamId = useActiveTeamStore((state) => state.activeTeamId);
  const isMobile = useIsMobile();

  // Extracted hooks
  const {
    showOneWordCalls,
    setShowOneWordCalls,
    directionDisplayFormat,
    setDirectionDisplayFormat,
  } = usePlayPreferences();
  const { viewMode, setViewMode } = useViewMode();
  const { favoriteIds } = useFavoritePlays();
  const { startSaving, finishSaving } = useSaveState();
  const { expandedPlayId, handleToggleExpand } = usePlayExpansion(
    viewMode || "grid"
  );

  // Get data from database
  const {
    plays: allPlays,
    loading,
    error,
    refreshData,
    updatePlay,
    hasMorePlays: hasMorePlaysFromDB,
    loadingMorePlays,
    totalPlaysCount,
    loadMorePlays,
  } = useTeamsData();

  // Refresh on trigger change
  useEffect(() => {
    if (refreshTrigger > 0) {
      debug("Refreshing plays data due to trigger:", refreshTrigger);
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

  // Convert database plays to full Play type
  const databasePlays: Play[] = useMemo(
    () => (allPlays || []).map(mapDatabasePlayToFullPlay),
    [allPlays]
  );

  // Merge optimistic plays with database plays
  const plays: Play[] = useMemo(() => {
    const dbPlayIds = new Set(databasePlays.map((p) => p.id));
    const uniqueOptimisticPlays = optimisticPlays.filter(
      (p) => !dbPlayIds.has(p.id)
    );
    return [...uniqueOptimisticPlays, ...databasePlays];
  }, [optimisticPlays, databasePlays]);

  // Notify parent of play count changes
  useEffect(() => {
    if (!onPlayCountChange || loading) return;
    onPlayCountChange(plays.length);
  }, [loading, plays.length, onPlayCountChange]);

  // Validate database integration (dev only)
  useEffect(() => {
    if (!import.meta.env.DEV || plays.length === 0) return;

    info("🏈 Playbook Database Integration Test");
    info("📊 Total Plays Loaded:", plays.length);

    let cancelled = false;
    import("../../utils/playbook-test-validation")
      .then(({ validatePlaybookData, logValidationResults }) => {
        if (cancelled) return;
        const validationResults = validatePlaybookData(plays);
        logValidationResults(validationResults);
      })
      .catch((e) => {
        warn("Playbook validation import failed", e);
      });

    return () => {
      cancelled = true;
    };
  }, [plays]);

  // Play save handler
  const handlePlaySave = useMemo(
    () => createPlaySaveHandler({ updatePlay, startSaving, finishSaving }),
    [updatePlay, startSaving, finishSaving]
  );

  // Filtering
  const { filteredPlays, hasFilters } = usePlayFiltering({
    plays,
    searchQuery,
    filters,
    selectedCategory,
    selectedSubcategory,
    favoriteIds,
  });

  // Drag and drop
  const { displayPlays, handleDragEnd } = useDragAndDrop({ filteredPlays });

  // Play selection
  const { handlePlaySelect, handleSelectAll } = usePlaySelection({
    selectedPlayIds,
    onPlaySelectionChange,
    displayPlays,
  });

  // Mobile progressive loading
  const {
    visiblePlays,
    hasMorePlays,
    isLoadingMore,
    loadMoreRef,
    mobileVisibleCount,
    loadMore,
  } = useMobileProgressiveLoading({
    displayPlays,
    isMobile,
    mobileListExpanded,
    onMobileListExpand,
  });

  // Personnel configurations
  const playbookId = plays.length > 0 ? plays[0].playbook_id : undefined;
  const { data: personnelConfigurations = [] } =
    usePersonnelConfigurations(playbookId);

  // Collected suggestions
  const collectedSuggestions = useCollectedSuggestions({
    plays,
    personnelConfigurations,
  });

  const showEmpty = displayPlays.length === 0 && !loading && !error;

  // Dev render diagnostics
  if (import.meta.env.DEV) {
    const selfAny = PlayGrid as unknown as {
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
          `[PlayGrid] High render frequency: ${count} renders in ${elapsed.toFixed(0)}ms`
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
      {loading && <PlayGridSkeleton count={8} viewMode={viewMode} />}
      {error && !loading && (
        <PlayGridErrorState error={error} onRetry={refreshData} />
      )}
      {showEmpty && !loading && !error && (
        <PlayGridEmptyState
          onCreatePlay={onOpenBuilder}
          onImportPlays={() =>
            dispatchDocumentAppEvent(PLAYGRID_OPEN_IMPORT_EVENT)
          }
          hasActiveFilters={!!hasFilters}
          totalPlayCount={plays.length}
          onClearFilters={() =>
            dispatchDocumentAppEvent(PLAYGRID_CLEAR_FILTERS_EVENT)
          }
        />
      )}

      {!loading && !error && !showEmpty && (
        <PlayGridHeader
          displayPlays={displayPlays}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          enableBulkOperations={enableBulkOperations}
          selectedPlayIds={selectedPlayIds}
          onSelectAll={handleSelectAll}
          viewMode={viewMode || "grid"}
          onViewModeChange={setViewMode}
          showOneWordCalls={showOneWordCalls ?? false}
          onShowOneWordCallsChange={setShowOneWordCalls}
          directionDisplayFormat={directionDisplayFormat || "full"}
          onDirectionDisplayFormatChange={setDirectionDisplayFormat}
        />
      )}

      {/* Grid View */}
      {!showEmpty && !loading && !error && viewMode === "grid" && (
        <>
          {isMobile ? (
            <MobileGridView
              visiblePlays={visiblePlays}
              mobileVisibleCount={mobileVisibleCount}
              selectedPlayIds={selectedPlayIds}
              showOneWordCalls={showOneWordCalls ?? false}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
            />
          ) : (
            <DesktopGridView
              visiblePlays={visiblePlays}
              handleDragEnd={handleDragEnd}
              expandedPlayId={expandedPlayId}
              showOneWordCalls={showOneWordCalls ?? false}
              selectedPlayIds={selectedPlayIds}
              enableBulkOperations={enableBulkOperations}
              handlePlaySelect={handlePlaySelect}
              handlePlaySave={handlePlaySave}
              collectedSuggestions={collectedSuggestions}
              personnelConfigurations={personnelConfigurations}
              directionDisplayFormat={directionDisplayFormat ?? "full"}
              handleToggleExpand={handleToggleExpand}
              plays={plays}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onOpenAssignments={onOpenAssignments}
              onPostToTeamBulletin={onPostToTeamBulletin}
            />
          )}
          {hasMorePlays && (
            <LoadMoreButton
              loadMoreRef={loadMoreRef}
              isLoadingMore={isLoadingMore}
              remainingCount={displayPlays.length - mobileVisibleCount}
              onLoadMore={loadMore}
            />
          )}
          {isMobile &&
            (mobileListExpanded || mobileVisibleCount >= displayPlays.length) &&
            displayPlays.length > MOBILE_INITIAL_PLAYS && (
              <AllPlaysLoadedMessage totalCount={displayPlays.length} />
            )}
        </>
      )}

      {/* List View with Virtuoso */}
      {!showEmpty && !loading && !error && viewMode === "list" && (
        <div
          style={{ height: "calc(100vh - 320px)" }}
          aria-label="Play list"
          role="list"
        >
          <Virtuoso
            data={displayPlays}
            overscan={5}
            computeItemKey={(_: number, playItem: Play) => playItem.id}
            itemContent={renderPlayItem}
            endReached={() => {
              if (hasMorePlaysFromDB && !loadingMorePlays) {
                debug("Virtuoso endReached - loading more plays");
                loadMorePlays();
              }
            }}
            components={{
              Footer: () => {
                if (loadingMorePlays) {
                  return (
                    <div className="flex justify-center py-4">
                      <div className="flex items-center gap-2 text-muted">
                        <Icon
                          name="refresh-cw"
                          className="h-4 w-4 animate-spin"
                        />
                        <Typography variant="body-sm">
                          Loading more plays...
                        </Typography>
                      </div>
                    </div>
                  );
                }

                if (hasMorePlaysFromDB) {
                  return (
                    <div className="flex justify-center py-2">
                      <Typography variant="body-sm" className="text-muted">
                        Scroll down to load more
                      </Typography>
                    </div>
                  );
                }

                if (
                  totalPlaysCount !== null &&
                  totalPlaysCount > 0 &&
                  displayPlays.length >= totalPlaysCount
                ) {
                  return (
                    <div className="flex justify-center py-4">
                      <Typography variant="body-sm" className="text-muted">
                        All {totalPlaysCount} plays loaded
                      </Typography>
                    </div>
                  );
                }

                return null;
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

// Mobile Grid View Component
const MobileGridView: React.FC<{
  visiblePlays: Play[];
  mobileVisibleCount: number;
  selectedPlayIds: Set<string>;
  showOneWordCalls: boolean;
  onEdit?: (play: Play) => void;
  onDuplicate?: (play: Play) => void;
}> = ({
  visiblePlays,
  mobileVisibleCount,
  selectedPlayIds,
  showOneWordCalls,
  onEdit,
  onDuplicate,
}) => (
  <div className="space-y-3">
    {visiblePlays.slice(0, mobileVisibleCount).map((play, index) => (
      <div key={play.id} data-card-index={index}>
        <SwipeActions
          playId={play.id}
          onEdit={() => onEdit?.(play)}
          onDuplicate={() => onDuplicate?.(play)}
          onDelete={() => debug("Delete play:", play.id)}
        >
          <MobilePlayCard
            play={play}
            onEdit={() => onEdit?.(play)}
            onMore={() => debug("More actions:", play.id)}
            onClick={() => onEdit?.(play)}
            isSelected={selectedPlayIds.has(play.id)}
            showOneWordCalls={showOneWordCalls}
          />
        </SwipeActions>
      </div>
    ))}
  </div>
);

// Desktop Grid View Component
const DesktopGridView: React.FC<{
  visiblePlays: Play[];
  handleDragEnd: (result: import("@hello-pangea/dnd").DropResult) => void;
  expandedPlayId: string | null;
  showOneWordCalls: boolean;
  selectedPlayIds: Set<string>;
  enableBulkOperations: boolean;
  handlePlaySelect: (playId: string, isSelected: boolean) => void;
  handlePlaySave: (playId: string, updates: Partial<Play>) => Promise<void>;
  collectedSuggestions: {
    formations: string[];
    playNames: string[];
    playTypes: string[];
    personnel: string[];
  };
  personnelConfigurations: import("../../types/personnel").PersonnelConfiguration[];
  directionDisplayFormat: "full" | "abbrev" | "letter" | null;
  handleToggleExpand: (playId: string) => void;
  plays: Play[];
  onEdit?: (play: Play) => void;
  onDuplicate?: (play: Play) => void;
  onOpenAssignments?: (play: Play) => void;
  onPostToTeamBulletin?: (play: Play) => void;
}> = ({
  visiblePlays,
  handleDragEnd,
  expandedPlayId,
  showOneWordCalls,
  selectedPlayIds,
  enableBulkOperations,
  handlePlaySelect,
  handlePlaySave,
  collectedSuggestions,
  personnelConfigurations,
  directionDisplayFormat,
  handleToggleExpand,
  plays,
  onEdit,
  onDuplicate,
  onOpenAssignments,
  onPostToTeamBulletin,
}) => (
  <DragDropContext onDragEnd={handleDragEnd}>
    <Droppable droppableId="play-grid" direction="horizontal">
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="grid gap-6 overflow-visible auto-rows-max sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          style={{ transition: "grid-template-rows 0.3s ease" }}
        >
          {visiblePlays.map((play, index) => (
            <Draggable key={play.id} draggableId={play.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`w-full overflow-visible transition-all duration-300 ${
                    snapshot.isDragging ? "opacity-50" : ""
                  } ${
                    expandedPlayId === play.id
                      ? "col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-4 2xl:col-span-5"
                      : ""
                  }`}
                >
                  <PlayCardWrapper
                    play={play}
                    variant="tile"
                    index={index}
                    showOneWordCalls={showOneWordCalls}
                    onEdit={onEdit}
                    onSave={handlePlaySave}
                    onDuplicate={onDuplicate}
                    onOpenAssignments={onOpenAssignments}
                    onPostToTeamBulletin={onPostToTeamBulletin}
                    isSelected={selectedPlayIds.has(play.id)}
                    onSelectionChange={
                      enableBulkOperations ? handlePlaySelect : undefined
                    }
                    formationSuggestions={collectedSuggestions.formations}
                    playNameSuggestions={collectedSuggestions.playNames}
                    playTypeSuggestions={collectedSuggestions.playTypes}
                    personnelSuggestions={collectedSuggestions.personnel}
                    personnelConfigurations={personnelConfigurations}
                    directionDisplayFormat={directionDisplayFormat ?? "full"}
                    expandedPlayId={expandedPlayId}
                    onToggleExpand={handleToggleExpand}
                    existingPlays={plays}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
);

// Props equality checker
function arePlayGridPropsEqual(prev: PlayGridProps, next: PlayGridProps) {
  if (prev.searchQuery !== next.searchQuery) return false;
  if (prev.selectedCategory !== next.selectedCategory) return false;
  if (prev.selectedSubcategory !== next.selectedSubcategory) return false;
  if (prev.refreshTrigger !== next.refreshTrigger) return false;
  if (prev.enableBulkOperations !== next.enableBulkOperations) return false;

  const pf = prev.filters;
  const nf = next.filters;
  const filterKeys = new Set([
    ...Object.keys(pf ?? {}),
    ...Object.keys(nf ?? {}),
  ]);
  for (const k of filterKeys) {
    // @ts-expect-error index
    if (pf[k] !== nf[k]) return false;
  }

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

  const handlerKeys: (keyof PlayGridProps)[] = [
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

export const PlayGrid = React.memo(PlayGridInner, arePlayGridPropsEqual);

if (import.meta.env.DEV) {
  interface WdyrMark {
    whyDidYouRender?: boolean;
  }
  (PlayGrid as unknown as WdyrMark).whyDidYouRender = false;
}
