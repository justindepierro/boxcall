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
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
import { usePersonnelConfigurations } from "../../hooks/usePersonnel";
import { debug, warn, info } from "../../utils/logger";
import { useSaveState } from "../../hooks/useSaveState";

// Extracted modules
import { mapDatabasePlayToFullPlay } from "./PlayGrid/utils/playDataUtils";
import {
  usePlayPreferences,
  usePlayExpansion,
  usePlaySelection,
  usePlayFiltering,
  useCollectedSuggestions,
} from "./PlayGrid/hooks";
import { createPlaySaveHandler } from "./PlayGrid/handlers";
import {
  PlayGridHeader,
  NoTeamSelectedState,
} from "./PlayGrid/components";

interface PlayGridProps {
  searchQuery: string;
  advancedFilters?: Array<{
    id: string;
    field: string;
    operator: "equals" | "contains" | "in";
    value: string | string[];
    label?: string;
  }>;
  optimisticPlays?: Play[];
  selectedCategory?: string;
  selectedSubcategory?: string;
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
}

const PlayGridInner: React.FC<PlayGridProps> = ({
  searchQuery,
  advancedFilters = [],
  optimisticPlays = [],
  selectedCategory,
  selectedSubcategory,
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
  } = useTeamsData(undefined, { playbookId: effectivePlaybookId });

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

  const scopedPlays: Play[] = useMemo(() => {
    if (!effectivePlaybookId) {
      debug("[PlayGrid] scopedPlays: No playbook filter, returning all", plays.length);
      return plays;
    }
    const filtered = plays.filter((play) => play.playbook_id === effectivePlaybookId);
    debug("[PlayGrid] scopedPlays:", {
      effectivePlaybookId,
      input: plays.length,
      output: filtered.length,
      samplePlaybookIds: plays.slice(0, 5).map(p => p.playbook_id),
    });
    return filtered;
  }, [plays, effectivePlaybookId]);

  // Dev-only tracing for playbook scoping issues
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (loading) return;
    const uniquePlaybookIds = Array.from(
      new Set((allPlays || []).map((p: any) => String(p?.playbook_id ?? "")))
    ).filter(Boolean);
    debug("[PlayGrid] scope trace", {
      activeTeamId,
      playbookIdProp: playbookId,
      effectivePlaybookId,
      dbPlaysCount: (allPlays || []).length,
      mergedPlaysCount: plays.length,
      scopedPlaysCount: scopedPlays.length,
      uniquePlaybookIdsSample: uniquePlaybookIds.slice(0, 10),
    });
  }, [
    activeTeamId,
    allPlays,
    effectivePlaybookId,
    loading,
    playbookId,
    plays.length,
    scopedPlays.length,
  ]);

  // Notify parent of play count changes
  useEffect(() => {
    if (!onPlayCountChange || loading) return;
    onPlayCountChange(scopedPlays.length);
  }, [loading, scopedPlays.length, onPlayCountChange]);

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

  // Filtering - SINGLE SOURCE OF TRUTH: advancedFilters
  const { filteredPlays, hasFilters } = usePlayFiltering({
    plays: scopedPlays,
    searchQuery,
    advancedFilters,
    selectedCategory,
    selectedSubcategory,
    favoriteIds,
  });

  // Use filtered plays directly (drag-and-drop removed with grid view)
  const displayPlays = filteredPlays;

  // Play selection
  const { handlePlaySelect, handleSelectAll } = usePlaySelection({
    selectedPlayIds,
    onPlaySelectionChange,
    displayPlays,
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
      {loading && <PlayGridSkeleton count={8} />}
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
          showOneWordCalls={showOneWordCalls ?? false}
          onShowOneWordCallsChange={setShowOneWordCalls}
          directionDisplayFormat={directionDisplayFormat || "full"}
          onDirectionDisplayFormatChange={setDirectionDisplayFormat}
        />
      )}

      {/* List View with Virtuoso */}
      {!showEmpty && !loading && !error && (
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

// Props equality checker
function arePlayGridPropsEqual(prev: PlayGridProps, next: PlayGridProps) {
  if (prev.searchQuery !== next.searchQuery) return false;
  if (prev.selectedCategory !== next.selectedCategory) return false;
  if (prev.selectedSubcategory !== next.selectedSubcategory) return false;
  if (prev.refreshTrigger !== next.refreshTrigger) return false;
  if (prev.enableBulkOperations !== next.enableBulkOperations) return false;

  // Compare advancedFilters by length and reference
  const paf = prev.advancedFilters ?? [];
  const naf = next.advancedFilters ?? [];
  if (paf.length !== naf.length) return false;
  if (paf !== naf && JSON.stringify(paf) !== JSON.stringify(naf)) return false;

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
