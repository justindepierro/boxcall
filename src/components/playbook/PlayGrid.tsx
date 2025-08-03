import React from "react";
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
}

export const PlayGrid: React.FC<PlayGridProps> = ({ searchQuery, filters }) => {
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

        {/* View Toggle - Future enhancement */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">Grid view</span>
        </div>
      </div>

      {/* Play Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlays.map((play) => (
          <PlayCard
            key={play.id}
            play={play}
            onEdit={(play: Play) => console.log("Edit play:", play.play_name)}
            onDuplicate={(play: Play) =>
              console.log("Duplicate play:", play.play_name)
            }
            onCreateDiagram={(play: Play) =>
              console.log("Create diagram for:", play.play_name)
            }
          />
        ))}
      </div>
    </div>
  );
};
