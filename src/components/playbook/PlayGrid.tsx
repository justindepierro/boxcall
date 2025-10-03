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
import { PlayCard } from "./PlayCard";
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
import { info, warn, debug } from "../../utils/logger";
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

// Convert database play data to full Play type
const mapDatabasePlayToFullPlay = (dbPlay: {
  id: string;
  playbook_id: string;
  formation: string;
  play_name: string;
  p_type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}): Play => ({
  id: dbPlay.id,
  playbook_id: dbPlay.playbook_id,
  formation: dbPlay.formation,
  play_name: dbPlay.play_name,
  p_type: dbPlay.p_type as "Pass" | "Run" | "RPO" | "Play Action",
  notes: dbPlay.notes,
  confidence_base: 70, // Default value
  times_called: 0, // Default value
  times_successful: 0, // Default value
  created_by: "system", // Default value
  created_at: new Date(dbPlay.created_at),
  updated_at: new Date(dbPlay.updated_at),
  install_phase: undefined, // placeholder until DB field exists
});
interface PlayGridProps {
  searchQuery: string;
  filters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
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
}

const PlayGridInner: React.FC<PlayGridProps> = ({
  searchQuery,
  filters,
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
  // Toggle for play name display mode (true = one-word calls, false = full names)
  const [showOneWordCalls, setShowOneWordCalls] = useState<boolean>(() => {
    try {
      return localStorage.getItem("bc_playgrid_oneword") === "1";
    } catch {
      return false;
    }
  });

  // View mode: 'list' or 'grid' (app icons)
  const [hasManualViewModeOverride, setHasManualViewModeOverride] =
    useState<boolean>(() => {
      try {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("bc_playgrid_view_manual") === "1";
      } catch {
        return false;
      }
    });

  const [viewMode, setViewModeState] = useState<"list" | "grid">(() => {
    try {
      if (typeof window === "undefined") {
        return "list";
      }

      const storedView = localStorage.getItem("bc_playgrid_view");
      const hasManualOverride =
        localStorage.getItem("bc_playgrid_view_manual") === "1";

      if (
        hasManualOverride &&
        (storedView === "list" || storedView === "grid")
      ) {
        return storedView;
      }

      const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

      if (isMobileViewport) {
        return "grid";
      }

      if (storedView === "list" || storedView === "grid") {
        return storedView;
      }

      return "list";
    } catch {
      return "list";
    }
  });

  const setViewMode = useCallback((mode: "list" | "grid", manual = true) => {
    setViewModeState((prev) => (prev === mode ? prev : mode));

    if (manual) {
      setHasManualViewModeOverride(true);
      try {
        localStorage.setItem("bc_playgrid_view_manual", "1");
      } catch {
        // Ignore persistence errors (private browsing, etc.)
      }
    }
  }, []);

  // Drag and drop state for play reordering
  const [reorderedPlays, setReorderedPlays] = useState<Play[]>([]);

  // Persist user preferences
  useEffect(() => {
    try {
      localStorage.setItem("bc_playgrid_oneword", showOneWordCalls ? "1" : "0");
    } catch {
      // ignore persistence errors (private browsing, etc.)
    }
  }, [showOneWordCalls]);

  useEffect(() => {
    try {
      localStorage.setItem("bc_playgrid_view", viewMode);
    } catch {
      // ignore persistence errors
    }
  }, [viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasManualViewModeOverride) return;
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const applyPreferredView = (matches: boolean) => {
      setViewMode(matches ? "grid" : "list", false);
    };

    applyPreferredView(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyPreferredView(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleChange);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [hasManualViewModeOverride, setViewMode]);

  // Get real data from database with refresh capability
  const { plays: allPlays, loading, error, refreshData } = useTeamsData();

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      debug("Refreshing plays data due to trigger:", refreshTrigger);
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

  // Convert database plays to full Play type
  const plays: Play[] = useMemo(
    () => (allPlays || []).map(mapDatabasePlayToFullPlay),
    [allPlays]
  );

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

  // Bulk Operations Handlers
  const handlePlaySelect = useCallback(
    (playId: string, selected: boolean) => {
      if (!onPlaySelectionChange) return;
      const newSelection = new Set(selectedPlayIds);
      if (selected) newSelection.add(playId);
      else newSelection.delete(playId);
      onPlaySelectionChange(newSelection);
    },
    [onPlaySelectionChange, selectedPlayIds]
  );

  const handleSelectAll = () => {
    if (!onPlaySelectionChange) return;
    const currentIds = new Set(displayPlays.map((p) => p.id));
    const allVisibleSelected = displayPlays.every((p) =>
      selectedPlayIds.has(p.id)
    );

    const next = new Set(selectedPlayIds);
    if (allVisibleSelected) {
      // Deselect only visible plays, keep hidden ones selected
      for (const id of currentIds) next.delete(id);
    } else {
      // Select all visible plays, keep any previously selected hidden plays
      for (const id of currentIds) next.add(id);
    }
    onPlaySelectionChange(next);
  };

  // Apply filters to plays
  const filteredPlays = useMemo(() => {
    return plays.filter((play) => {
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

      // Category-based filtering from Smart Playbook Glossary
      if (selectedCategory) {
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
  }, [plays, searchQuery, filters, selectedCategory, selectedSubcategory]);

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
      <div className="mb-4" role="listitem" data-index={index}>
        <PlayCard
          play={play}
          showOneWordCalls={showOneWordCalls}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onCreateDiagram={onCreateDiagram}
          isSelected={selectedPlayIds.has(play.id)}
          onSelectionChange={handlePlaySelect}
          density="compact"
          variant="list"
        />
      </div>
    ),
    [
      showOneWordCalls,
      onEdit,
      onDuplicate,
      onCreateDiagram,
      selectedPlayIds,
      handlePlaySelect,
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
            <div className="flex items-center space-x-2 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <IconButton
                aria-label="List view"
                tooltip="List view"
                onClick={() => setViewMode("list")}
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
                onClick={() => setViewMode("grid")}
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
          </div>
        </div>
      )}

      {/* Play Grid - Conditional Rendering based on view mode */}
      {!showEmpty && !loading && !error && viewMode === "grid" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="play-grid" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10 py-8 px-4 overflow-visible"
              >
                {displayPlays.map((play, index) => (
                  <Draggable key={play.id} draggableId={play.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-start justify-center overflow-visible ${
                          snapshot.isDragging ? "opacity-50" : ""
                        }`}
                      >
                        <PlayCard
                          play={play}
                          showOneWordCalls={showOneWordCalls}
                          onEdit={onEdit}
                          onDuplicate={onDuplicate}
                          onCreateDiagram={onCreateDiagram}
                          isSelected={selectedPlayIds.has(play.id)}
                          onSelectionChange={handlePlaySelect}
                          variant="tile"
                          density="comfortable"
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
      ) : !showEmpty &&
        !loading &&
        !error &&
        (disableVirtual || displayPlays.length < VIRTUALIZE_THRESHOLD) ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="play-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-6 overflow-visible"
                role="list"
              >
                {displayPlays.map((play, index) => (
                  <Draggable key={play.id} draggableId={play.id} index={index}>
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
                          <PlayCard
                            play={play}
                            showOneWordCalls={showOneWordCalls}
                            onEdit={onEdit}
                            onDuplicate={onDuplicate}
                            onCreateDiagram={onCreateDiagram}
                            isSelected={selectedPlayIds.has(play.id)}
                            onSelectionChange={handlePlaySelect}
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
