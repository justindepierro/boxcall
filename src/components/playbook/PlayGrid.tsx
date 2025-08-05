import React, { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import type { Play } from "../../types/play";
import { PlayCard } from "./PlayCard";
import { getDemoPlays } from "../../data/demoPlays";
interface PlayGridProps {
  searchQuery: string;
  filters: {
    formation?: string;
    playType?: string;
    down?: string;
    distance?: string;
    tags?: string[];
  };
  onAddToPracticeScript?: (play: Play) => void;
  onAddToGamePlan?: (play: Play) => void;
}
export const PlayGrid: React.FC<PlayGridProps> = ({
  searchQuery,
  filters,
  onAddToPracticeScript,
  onAddToGamePlan,
}) => {
  // Toggle for play name display mode (true = one-word calls, false = full names)
  const [showOneWordCalls, setShowOneWordCalls] = useState(false);
  // Use demo data for now - replace with actual API call later
  const plays: Play[] = getDemoPlays({
    formation: filters.formation,
    playType: filters.playType,
    down: filters.down,
    distance: filters.distance,
    search: searchQuery,
  });
  const filteredPlays = plays; // Filtering is now done in getDemoPlays()
  if (filteredPlays.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-slate-400 text-lg mb-4">
          {searchQuery || Object.values(filters).some((f) => f)
            ? "No plays match your search criteria"
            : "No plays in your playbook yet"}
        </div>
        <p className="text-slate-500 text-sm">
          {searchQuery || Object.values(filters).some((f) => f)
            ? "Try adjusting your search or filters"
            : "Create your first play or import existing plays to get started"}
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {filteredPlays.length} {filteredPlays.length === 1 ? "Play" : "Plays"}
        </h2>
        {/* Play Name Display Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-600">One-word calls</span>
          <button
            onClick={() => setShowOneWordCalls(!showOneWordCalls)}
            className="inline-flex items-center p-1 rounded-md hover:bg-slate-100 transition-colors"
            title={
              showOneWordCalls
                ? "Switch to full play names"
                : "Switch to one-word calls"
            }
          >
            {showOneWordCalls ? (
              <ToggleRight className="h-5 w-5 text-blue-600" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-slate-400" />
            )}
          </button>
          <span className="text-sm text-slate-600">Full names</span>
        </div>
      </div>
      {/* Play Grid - Changed to single column vertical layout */}
      <div className="space-y-4">
        {filteredPlays.map((play) => (
          <PlayCard
            key={play.id}
            play={play}
            showOneWordCalls={showOneWordCalls}
            onEdit={(_play: Play) => {
              // TODO: Implement edit functionality
            }}
            onDuplicate={(_play: Play) => {
              // TODO: Implement duplicate functionality
            }}
            onCreateDiagram={(_play: Play) => {
              // TODO: Implement create diagram functionality
            }}
            onAddToPracticeScript={onAddToPracticeScript}
            onAddToGamePlan={onAddToGamePlan}
          />
        ))}
      </div>
    </div>
  );
};
