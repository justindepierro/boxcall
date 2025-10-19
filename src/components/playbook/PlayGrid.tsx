import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
// (Removed unused RefreshCw, Search imports after log text simplification)
import { Icon } from "../ui/Icon/Icon";
import { IconButton } from "../ui";
import { PlayCardWrapper } from "./PlayCardWrapper";
import { PlayGridSkeleton } from "./PlayGridSkeleton";
import { PlayGridErrorState } from "./PlayGridErrorState";
import { PlayGridEmptyState } from "./PlayGridEmptyState";
import { Virtuoso } from "react-virtuoso";
import { telemetry } from "../../telemetry/dispatcher";
import { TelemetryEventTypes } from "../../telemetry/events";
import { useTeamsData } from "../../hooks/useTeamsData";
import type { Play } from "../../types/play";
import { getPlayFlags } from "@utils/localPlayFlags";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { useIsMobile } from "../../hooks/useBreakpoint";
import { useFavoritePlays } from "../../hooks/useFavoritePlays";
import { usePersonnelConfigurations } from "../../hooks/usePersonnel";
import { info, warn, debug } from "../../utils/logger";
import { useSaveState } from "../../contexts/SaveStateContext";
import {
  validatePlaybookData,
  logValidationResults,
} from "../../utils/playbook-test-validation";
import {
  getPlayCategory,
  playMatchesSubcategory,
} from "../../utils/playbook-categories";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

// Extracted modules
import { mapDatabasePlayToFullPlay } from "./PlayGrid/utils/playDataUtils";
import {
  usePlayPreferences,
  useViewMode,
  usePlayExpansion,
  usePlaySelection,
} from "./PlayGrid/hooks";
import { createPlaySaveHandler } from "./PlayGrid/handlers";

interface PlayGridProps {
  searchQuery: string;
  filters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
  // 🚀 PERFORMANCE: Optimistic plays shown instantly before database confirmation
  optimisticPlays?: Play[];
  // Category-based filtering from Smart Glossary
  selectedCategory?: string;
  selectedSubcategory?: string;
  onEdit?: (play: Play) => void;
  onSave?: (playId: string, updates: Partial<Play>) => Promise<void>;
  onDuplicate?: (play: Play) => void;
  onCreateDiagram?: (play: Play) => void;
  onAddToPracticeScript?: (play: Play) => void;
  onAddToGamePlan?: (play: Play) => void;
  onPlayCreated?: () => void; // Add callback for when data should refresh
  onPlayCountChange?: (count: number) => void; // Callback to report actual play count
  refreshTrigger?: number; // Trigger to refresh data from parent
  // Bulk Operations
  enableBulkOperations?: boolean;
  selectedPlayIds?: Set<string>;
  onPlaySelectionChange?: (playIds: Set<string>) => void;
  onOpenBuilder?: () => void;
  // Suggestions for inline editing
  formationSuggestions?: string[];
  playNameSuggestions?: string[];
  playTypeSuggestions?: string[];
}

const PlayGridInner: React.FC<PlayGridProps> = ({
  searchQuery,
  filters,
  optimisticPlays = [],
  selectedCategory,
  selectedSubcategory,
  onEdit,
  onSave: _onSave, // Not used in V2 (no inline editing)
  onDuplicate,
  onCreateDiagram,
  onAddToPracticeScript: _onAddToPracticeScript, // Not used in V2
  onAddToGamePlan: _onAddToGamePlan, // Not used in V2
  onPlayCreated: _onPlayCreated, // Prefixed with _ to indicate intentionally unused
  onPlayCountChange,
  refreshTrigger = 0,
  // Bulk Operations
  enableBulkOperations = false,
  selectedPlayIds = new Set(),
  onPlaySelectionChange,
  onOpenBuilder: _onOpenBuilder,
  // Suggestions
  formationSuggestions: _formationSuggestions = [], // Not used in V2
  playNameSuggestions: _playNameSuggestions = [], // Not used in V2
}) => {
  // Extracted custom hooks
  const {
    showOneWordCalls,
    setShowOneWordCalls,
    directionDisplayFormat,
    setDirectionDisplayFormat,
  } = usePlayPreferences();
  const { viewMode, setViewMode } = useViewMode();

  // Quick Wins: Favorites hook
  const { favoriteIds } = useFavoritePlays();

  // Global save state for universal indicator
  const { startSaving, finishSaving } = useSaveState();

  // Play expansion state (extracted hook)
  const { expandedPlayId, handleToggleExpand } = usePlayExpansion(
    viewMode || "grid"
  );

  // Drag and drop state for play reordering
  const [reorderedPlays, setReorderedPlays] = useState<Play[]>([]);

  // Get real data from database with refresh capability and pagination
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

  // Refresh data when refreshTrigger changes
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

  // 🚀 PERFORMANCE: Merge optimistic plays with database plays
  // Optimistic plays appear first for instant feedback (<50ms)
  // Deduplication: Remove any optimistic plays that now exist in database
  const plays: Play[] = useMemo(() => {
    const dbPlayIds = new Set(databasePlays.map((p) => p.id));
    const uniqueOptimisticPlays = optimisticPlays.filter(
      (p) => !dbPlayIds.has(p.id)
    );
    return [...uniqueOptimisticPlays, ...databasePlays];
  }, [optimisticPlays, databasePlays]);

  // Notify parent of play count changes for the play counter
  useEffect(() => {
    if (onPlayCountChange) {
      onPlayCountChange(plays.length);
    }
  }, [plays.length, onPlayCountChange]);

  // Validate database integration (development mode only)
  useEffect(() => {
    if (plays.length > 0 && process.env.NODE_ENV === "development") {
      info("🏈 Playbook Database Integration Test");
      info("📊 Total Plays Loaded:", plays.length);
      info("🏟️ Sample Play:", plays[0]);
      info("Available Formations:", [
        ...new Set(plays.map((p) => p.formation)),
      ]);
      info("⚡ Available Play Types:", [
        ...new Set(plays.map((p) => p.p_type)),
      ]);
      // end group

      const validationResults = validatePlaybookData(plays);
      logValidationResults(validationResults);
    }
  }, [plays]);

  // Handle inline play updates (using extracted handler)
  const handlePlaySave = useMemo(
    () => createPlaySaveHandler({ updatePlay, startSaving, finishSaving }),
    [updatePlay, startSaving, finishSaving]
  );

  // Apply filters to plays
  const filteredPlays = useMemo(() => {
    let result = plays.filter((play) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = play.play_name.toLowerCase().includes(query);
        const matchesFormation = play.formation.toLowerCase().includes(query);
        const matchesNotes = play.notes?.toLowerCase().includes(query);
        let matchesFlags = false;
        if (!matchesName && !matchesFormation && !matchesNotes) {
          const flags = getPlayFlags(play.id);
          const haystack = [
            ...flags.positions,
            ...flags.players,
            ...flags.flags,
          ]
            .join("\n")
            .toLowerCase();
          matchesFlags = haystack.includes(query);
          if (!matchesFlags) return false;
        }
      }

      // Quick Win: Favorites filter
      if (selectedCategory === "favorites") {
        return favoriteIds.includes(play.id);
      }

      // Category-based filtering from Smart Playbook Glossary
      if (selectedCategory && selectedCategory !== "most-used") {
        const playCategories = getPlayCategory(play);
        if (!playCategories.includes(selectedCategory)) {
          return false;
        }

        // Subcategory filtering (more specific filtering within categories)
        if (selectedSubcategory) {
          if (!playMatchesSubcategory(play, selectedSubcategory)) {
            return false;
          }
        }
      }

      // Formation filter
      if (filters.formation && play.formation !== filters.formation)
        return false;

      // Play type filter
      if (filters.playType && play.p_type !== filters.playType) return false;

      // Additional filters can be added here as needed

      return true;
    });

    // Quick Win: Most Used sorting
    if (selectedCategory === "most-used") {
      result = [...result].sort(
        (a, b) => (b.times_called || 0) - (a.times_called || 0)
      );
    }

    return result;
  }, [
    plays,
    searchQuery,
    filters,
    selectedCategory,
    selectedSubcategory,
    favoriteIds,
  ]);

  // Telemetry: emit filter.apply when filter state meaningfully changes.
  // Guard against infinite loops if telemetry enqueue triggers a context update that re-renders PlayGrid.
  const lastFilterSignatureRef = useRef<string | null>(null);
  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        search: !!searchQuery,
        searchLength: searchQuery?.length || 0,
        formation: filters.formation || null,
        playType: filters.playType || null,
        selectedCategory: selectedCategory || null,
        selectedSubcategory: selectedSubcategory || null,
        resultCount: filteredPlays.length,
        resultBucket:
          filteredPlays.length === 0
            ? "0"
            : filteredPlays.length <= 10
              ? "1-10"
              : filteredPlays.length <= 50
                ? "11-50"
                : ">50",
      }),
    [
      searchQuery,
      filters.formation,
      filters.playType,
      selectedCategory,
      selectedSubcategory,
      filteredPlays.length,
    ]
  );

  useEffect(() => {
    if (lastFilterSignatureRef.current === filterSignature) return; // no meaningful change
    lastFilterSignatureRef.current = filterSignature;
    telemetry.enqueue({
      type: TelemetryEventTypes.FilterApply,
      data: JSON.parse(filterSignature),
    });
  }, [filterSignature]);

  const hasFilters =
    searchQuery ||
    selectedCategory ||
    selectedSubcategory ||
    Object.values(filters).some(
      (f) => f && (Array.isArray(f) ? f.length > 0 : true)
    );

  // Drag and drop handler for reordering plays
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      // Reorder the filtered plays
      const reordered = Array.from(filteredPlays);
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(destinationIndex, 0, removed);

      setReorderedPlays(reordered);
    },
    [filteredPlays]
  );

  // Use reordered plays if available, otherwise use filtered plays
  const displayPlays = useMemo(() => {
    return reorderedPlays.length > 0 ? reorderedPlays : filteredPlays;
  }, [reorderedPlays, filteredPlays]);

  // Play selection handlers (extracted hook)
  const { handlePlaySelect, handleSelectAll } = usePlaySelection({
    selectedPlayIds,
    onPlaySelectionChange,
    displayPlays,
  });

  // Mobile progressive disclosure - show limited plays initially
  const isMobile = useIsMobile();
  const MOBILE_INITIAL_PLAYS = 4;
  const [showAllPlays, setShowAllPlays] = useState(false);

  const visiblePlays = useMemo(() => {
    if (
      !isMobile ||
      showAllPlays ||
      displayPlays.length <= MOBILE_INITIAL_PLAYS
    ) {
      return displayPlays;
    }
    return displayPlays.slice(0, MOBILE_INITIAL_PLAYS);
  }, [isMobile, showAllPlays, displayPlays]);

  const hasMorePlays =
    isMobile && displayPlays.length > MOBILE_INITIAL_PLAYS && !showAllPlays;

  // Load personnel configurations to provide as suggestions
  const playbookId = plays.length > 0 ? plays[0].playbook_id : undefined;
  const { data: personnelConfigurations = [] } =
    usePersonnelConfigurations(playbookId);

  // Collect unique suggestions from all plays for inline editing
  const collectedSuggestions = useMemo(() => {
    const formations = new Set<string>();
    const playNames = new Set<string>();
    const playTypes = new Set<string>();

    plays.forEach((play) => {
      if (play.formation) formations.add(play.formation);
      if (play.play_name) playNames.add(play.play_name);
      if (play.p_type) playTypes.add(play.p_type);
    });

    // Convert personnel configurations to suggestions
    const personnelSuggestions = personnelConfigurations.map(
      (config) => config.name
    );

    return {
      formations: Array.from(formations).sort(),
      playNames: Array.from(playNames).sort(),
      playTypes: Array.from(playTypes).sort(),
      personnel: personnelSuggestions,
    };
  }, [plays, personnelConfigurations]);

  const showEmpty = displayPlays.length === 0 && !loading && !error;
  // Virtualization threshold (avoid overhead for small lists)
  const VIRTUALIZE_THRESHOLD = 30; // use simple map below this
  const disableVirtual =
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_DISABLE_VIRTUAL_PLAYGRID === "true";

  // --- Dev-only render diagnostics (no state updates) ---
  if (process.env.NODE_ENV === "development") {
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
          `[PlayGrid] High render frequency: ${count} renders in ${elapsed.toFixed(
            0
          )}ms (filteredPlays=${filteredPlays.length})`
        );
      }
    }
  }

  // Stable callback for item rendering (prevents new function each render)
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
        onCreateDiagram={onCreateDiagram}
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
      />
    ),
    [
      showOneWordCalls,
      onEdit,
      handlePlaySave,
      onDuplicate,
      onCreateDiagram,
      selectedPlayIds,
      handlePlaySelect,
      enableBulkOperations,
      collectedSuggestions,
      personnelConfigurations,
      directionDisplayFormat,
      expandedPlayId,
      handleToggleExpand,
    ]
  );

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Loading State */}
      {loading && <PlayGridSkeleton count={8} viewMode={viewMode} />}

      {/* Error State */}
      {error && !loading && (
        <PlayGridErrorState error={error} onRetry={refreshData} />
      )}

      {/* Empty State */}
      {showEmpty && !loading && !error && (
        <PlayGridEmptyState
          onCreatePlay={_onOpenBuilder}
          onImportPlays={() => {
            // TODO: Implement import modal trigger
            document.dispatchEvent(new CustomEvent("playgrid:open-import"));
          }}
          hasActiveFilters={!!hasFilters}
          totalPlayCount={plays.length}
          onClearFilters={() => {
            document.dispatchEvent(new CustomEvent("playgrid:clear-filters"));
          }}
        />
      )}

      {/* Results Header with Toggle */}
      {!loading && !error && !showEmpty && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="text-text-primary"
              >
                {displayPlays.length}{" "}
                {displayPlays.length === 1 ? "Play" : "Plays"}
                {selectedCategory && (
                  <span className="text-text-secondary font-normal ml-2">
                    in{" "}
                    {selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1).replace("-", " ")}
                    {selectedSubcategory && ` › ${selectedSubcategory}`}
                  </span>
                )}
              </Typography>
            </div>

            {/* Bulk Selection Controls */}
            {enableBulkOperations && (
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={
                      displayPlays.length > 0 &&
                      displayPlays.every((p) => selectedPlayIds.has(p.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-border text-text-info focus:ring-text-accent"
                  />
                  <span>
                    {selectedPlayIds.size > 0
                      ? `${selectedPlayIds.size} selected`
                      : "Select all"}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Play Name Display Toggle & View Mode */}
          <div className="flex items-center space-x-6">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 px-2 py-1 rounded-xl bg-surface-muted dark:bg-slate-800">
              <IconButton
                aria-label="List view"
                tooltip="List view"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setViewMode("list");
                }}
                variant="subtle"
                size="sm"
                className={
                  viewMode === "list" ? "bg-white dark:bg-slate-700" : ""
                }
              >
                <Icon name="list" className="h-4 w-4" />
              </IconButton>
              <IconButton
                aria-label="Grid view (app icons)"
                tooltip="Grid view"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setViewMode("grid");
                }}
                variant="subtle"
                size="sm"
                className={
                  viewMode === "grid" ? "bg-white dark:bg-slate-700" : ""
                }
              >
                <Icon name="grid" className="h-4 w-4" />
              </IconButton>
            </div>

            {/* One-word calls toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-text-secondary">
                One-word calls
              </span>
              <IconButton
                aria-label={
                  showOneWordCalls
                    ? "Switch to full play names"
                    : "Switch to one-word calls"
                }
                tooltip={
                  showOneWordCalls
                    ? "Show full play names"
                    : "Show one-word calls"
                }
                onClick={() => setShowOneWordCalls(!showOneWordCalls)}
                variant="subtle"
                size="sm"
              >
                {showOneWordCalls ? (
                  <Icon
                    name="toggle-right"
                    className="h-5 w-5 text-text-info"
                  />
                ) : (
                  <Icon
                    name="toggle-left"
                    className="h-5 w-5 text-text-tertiary"
                  />
                )}
              </IconButton>
              <span className="text-sm text-text-secondary">Full names</span>
            </div>

            {/* Direction Display Format Toggle */}
            <div className="flex items-center gap-2">
              <IconButton
                aria-label={`Direction format: ${directionDisplayFormat || "full"}`}
                tooltip={`Direction format: ${(directionDisplayFormat || "full") === "full" ? "Full words" : (directionDisplayFormat || "full") === "abbrev" ? "Abbreviations" : "Letters"}`}
                onClick={() => {
                  const formats: ("full" | "abbrev" | "letter")[] = [
                    "full",
                    "abbrev",
                    "letter",
                  ];
                  const currentIndex = formats.indexOf(
                    directionDisplayFormat || "full"
                  );
                  const nextIndex = (currentIndex + 1) % formats.length;
                  setDirectionDisplayFormat(formats[nextIndex]);
                }}
                variant="subtle"
                size="sm"
              >
                <Icon name="move" className="h-5 w-5 text-text-info" />
              </IconButton>
              <span className="text-sm text-text-secondary">
                {(directionDisplayFormat || "full") === "full"
                  ? "Right/Left"
                  : (directionDisplayFormat || "full") === "abbrev"
                    ? "Rt/Lt"
                    : "R/L"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Play Grid - Conditional Rendering based on view mode */}
      {!showEmpty && !loading && !error && viewMode === "grid" ? (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="play-grid" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`grid gap-6 py-6 px-4 overflow-visible auto-rows-max ${
                    isMobile 
                      ? "grid-cols-1" // Single column on mobile (<640px)
                      : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10 py-8"
                  }`}
                  style={{
                    transition: "grid-template-rows 0.3s ease",
                  }}
                >
                  {visiblePlays.map((play, index) => (
                    <Draggable
                      key={play.id}
                      draggableId={play.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`w-full overflow-visible transition-all duration-300 ${
                            snapshot.isDragging ? "opacity-50" : ""
                          } ${
                            expandedPlayId === play.id && !isMobile
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
                            onCreateDiagram={onCreateDiagram}
                            isSelected={selectedPlayIds.has(play.id)}
                            onSelectionChange={
                              enableBulkOperations
                                ? handlePlaySelect
                                : undefined
                            }
                            formationSuggestions={
                              collectedSuggestions.formations
                            }
                            playNameSuggestions={collectedSuggestions.playNames}
                            playTypeSuggestions={collectedSuggestions.playTypes}
                            personnelSuggestions={
                              collectedSuggestions.personnel
                            }
                            personnelConfigurations={personnelConfigurations}
                            directionDisplayFormat={directionDisplayFormat}
                            expandedPlayId={expandedPlayId}
                            onToggleExpand={handleToggleExpand}
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
          {hasMorePlays && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowAllPlays(true)}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                See All {displayPlays.length} Plays
              </Button>
            </div>
          )}
        </>
      ) : !showEmpty &&
        !loading &&
        !error &&
        (disableVirtual || displayPlays.length < VIRTUALIZE_THRESHOLD) ? (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="play-list">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-6 overflow-visible"
                  role="list"
                >
                  {visiblePlays.map((play, index) => (
                    <Draggable
                      key={play.id}
                      draggableId={play.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-4 ${snapshot.isDragging ? "opacity-50" : ""}`}
                          role="listitem"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <PlayCardWrapper
                              play={play}
                              variant="list"
                              index={index}
                              showOneWordCalls={showOneWordCalls}
                              onEdit={onEdit}
                              onSave={handlePlaySave}
                              onDuplicate={onDuplicate}
                              onCreateDiagram={onCreateDiagram}
                              isSelected={selectedPlayIds.has(play.id)}
                              onSelectionChange={handlePlaySelect}
                              formationSuggestions={
                                collectedSuggestions.formations
                              }
                              playNameSuggestions={
                                collectedSuggestions.playNames
                              }
                              playTypeSuggestions={
                                collectedSuggestions.playTypes
                              }
                              personnelSuggestions={
                                collectedSuggestions.personnel
                              }
                              personnelConfigurations={personnelConfigurations}
                              directionDisplayFormat={directionDisplayFormat}
                              expandedPlayId={expandedPlayId}
                              onToggleExpand={handleToggleExpand}
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {hasMorePlays && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowAllPlays(true)}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                See All {displayPlays.length} Plays
              </Button>
            </div>
          )}
        </>
      ) : !showEmpty && !loading && !error ? (
        <div
          style={{ height: "calc(100vh - 320px)" }}
          aria-label="Play list"
          role="list"
        >
          <Virtuoso
            data={displayPlays}
            overscan={200}
            computeItemKey={(_: number, playItem: Play) => playItem.id}
            itemContent={renderPlayItem}
            endReached={() => {
              // Load more plays when user scrolls near the end
              if (hasMorePlaysFromDB && !loadingMorePlays) {
                debug("Virtuoso endReached - loading more plays");
                loadMorePlays();
              }
            }}
            components={{
              Footer: () =>
                loadingMorePlays ? (
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
                ) : hasMorePlaysFromDB ? (
                  <div className="flex justify-center py-2">
                    <Typography variant="body-sm" className="text-muted">
                      Scroll down to load more
                    </Typography>
                  </div>
                ) : totalPlaysCount !== null &&
                  totalPlaysCount > 0 &&
                  displayPlays.length >= totalPlaysCount ? (
                  <div className="flex justify-center py-4">
                    <Typography variant="body-sm" className="text-muted">
                      All {totalPlaysCount} plays loaded
                    </Typography>
                  </div>
                ) : null,
            }}
          />
        </div>
      ) : null}

      {/* Play Detail Modal */}
      {/* Tile variant now uses the same inline details as list view, so the modal remains retired. */}
    </div>
  );
};

// Custom props compare to avoid unnecessary rerenders cascading into Virtuoso
function arePlayGridPropsEqual(prev: PlayGridProps, next: PlayGridProps) {
  // Primitive / simple checks
  if (prev.searchQuery !== next.searchQuery) return false;
  if (prev.selectedCategory !== next.selectedCategory) return false;
  if (prev.selectedSubcategory !== next.selectedSubcategory) return false;
  if (prev.refreshTrigger !== next.refreshTrigger) return false;
  if (prev.enableBulkOperations !== next.enableBulkOperations) return false;
  // Filters shallow compare (expected small object)
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
  // Selection set size + membership hash (cheap)
  const ps = prev.selectedPlayIds;
  const ns = next.selectedPlayIds;
  if (ps && ns) {
    if (ps.size !== ns.size) return false;
    // Spot check first 10 ids
    let i = 0;
    for (const id of ps) {
      if (!ns.has(id)) return false;
      if (++i > 10) break; // limit cost
    }
  } else if (ps !== ns) return false;
  // Handlers: we allow new function identities, they seldom cause heavy work; not part of equality (return false only if one exists and other missing)
  const handlerKeys: (keyof PlayGridProps)[] = [
    "onEdit",
    "onDuplicate",
    "onCreateDiagram",
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

// Dev hint: mark component to avoid why-did-you-render noise (only if that lib is present)
if (process.env.NODE_ENV === "development") {
  interface WdyrMark {
    whyDidYouRender?: boolean;
  }
  (PlayGrid as unknown as WdyrMark).whyDidYouRender = false;
}
