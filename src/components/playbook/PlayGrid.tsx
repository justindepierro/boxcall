import React, { useState, useMemo, useEffect } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { IconButton } from "../ui";
import { PlayCard } from "./PlayCard";
import { useTeamsData } from "../../hooks/useTeamsData";
import type { Play } from "../../types/play";
import {
  validatePlaybookData,
  logValidationResults,
} from "../../utils/playbook-test-validation";
import {
  getPlayCategory,
  playMatchesSubcategory,
} from "../../utils/playbook-categories";

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
}

export const PlayGrid: React.FC<PlayGridProps> = ({
  searchQuery,
  filters,
  selectedCategory,
  selectedSubcategory,
  onEdit,
  onDuplicate,
  onCreateDiagram,
  onAddToPracticeScript,
  onAddToGamePlan,
  onPlayCreated: _onPlayCreated, // Prefixed with _ to indicate intentionally unused
  onPlayCountChange,
  refreshTrigger = 0,
  // Bulk Operations
  enableBulkOperations = false,
  selectedPlayIds = new Set(),
  onPlaySelectionChange,
}) => {
  // Toggle for play name display mode (true = one-word calls, false = full names)
  const [showOneWordCalls, setShowOneWordCalls] = useState(false);

  // Get real data from database with refresh capability
  const { plays: allPlays, loading, error, refreshData } = useTeamsData();

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("🔄 Refreshing plays data due to trigger:", refreshTrigger);
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
      console.group("🏈 Playbook Database Integration Test");
      console.log("📊 Total Plays Loaded:", plays.length);
      console.log("🏟️ Sample Play:", plays[0]);
      console.log("🔍 Available Formations:", [
        ...new Set(plays.map((p) => p.formation)),
      ]);
      console.log("⚡ Available Play Types:", [
        ...new Set(plays.map((p) => p.p_type)),
      ]);
      console.groupEnd();

      const validationResults = validatePlaybookData(plays);
      logValidationResults(validationResults);
    }
  }, [plays]);

  // Bulk Operations Handlers
  const handlePlaySelect = (playId: string, selected: boolean) => {
    if (!onPlaySelectionChange) return;

    const newSelection = new Set(selectedPlayIds);
    if (selected) {
      newSelection.add(playId);
    } else {
      newSelection.delete(playId);
    }
    onPlaySelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onPlaySelectionChange) return;

    if (selectedPlayIds.size === filteredPlays.length) {
      // Deselect all
      onPlaySelectionChange(new Set());
    } else {
      // Select all filtered plays
      onPlaySelectionChange(new Set(filteredPlays.map((p) => p.id)));
    }
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
        if (!matchesName && !matchesFormation && !matchesNotes) return false;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jade-600"></div>
        <span className="ml-2 text-gray-600">Loading plays...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading plays: {error}</p>
      </div>
    );
  }

  const hasFilters =
    searchQuery ||
    selectedCategory ||
    selectedSubcategory ||
    Object.values(filters).some(
      (f) => f && (Array.isArray(f) ? f.length > 0 : true)
    );

  if (filteredPlays.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-slate-400 text-lg mb-4">
          {hasFilters
            ? selectedCategory && selectedSubcategory
              ? `No plays found in "${selectedSubcategory}" under "${selectedCategory}"`
              : selectedCategory
                ? `No plays found in "${selectedCategory}" category`
                : "No plays match your search criteria"
            : "No plays in your playbook yet"}
        </div>
        <p className="text-slate-500 text-sm">
          {hasFilters
            ? "Try adjusting your search or filters"
            : "Create your first play or import existing plays to get started"}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Results Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {filteredPlays.length}{" "}
              {filteredPlays.length === 1 ? "Play" : "Plays"}
              {selectedCategory && (
                <span className="text-slate-500 font-normal ml-2">
                  in{" "}
                  {selectedCategory.charAt(0).toUpperCase() +
                    selectedCategory.slice(1).replace("-", " ")}
                  {selectedSubcategory && ` › ${selectedSubcategory}`}
                </span>
              )}
            </h2>
          </div>

          {/* Bulk Selection Controls */}
          {enableBulkOperations && (
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={
                    selectedPlayIds.size > 0 &&
                    selectedPlayIds.size === filteredPlays.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-jade-500"
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

        {/* Play Name Display Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-600">One-word calls</span>
          <IconButton
            aria-label={
              showOneWordCalls
                ? "Switch to full play names"
                : "Switch to one-word calls"
            }
            onClick={() => setShowOneWordCalls(!showOneWordCalls)}
            variant="subtle"
            size="sm"
          >
            {showOneWordCalls ? (
              <ToggleRight className="h-5 w-5 text-blue-600" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-slate-400" />
            )}
          </IconButton>
          <span className="text-sm text-slate-600">Full names</span>
        </div>
      </div>

      {/* Play Grid */}
      <div className="space-y-4">
        {filteredPlays.map((play) => (
          <PlayCard
            key={play.id}
            play={play}
            showOneWordCalls={showOneWordCalls}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onCreateDiagram={onCreateDiagram}
            onAddToPracticeScript={onAddToPracticeScript}
            onAddToGamePlan={onAddToGamePlan}
            // Bulk Operations
            enableSelection={enableBulkOperations}
            isSelected={selectedPlayIds.has(play.id)}
            onSelectionChange={handlePlaySelect}
          />
        ))}
      </div>
    </div>
  );
};
