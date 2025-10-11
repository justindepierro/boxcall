import React from "react";
import { Icon } from "../ui/Icon/Icon";
import type { Play } from "../../types/play";
import { useRecentPlays } from "../../hooks/useRecentPlays";

interface RecentPlaysProps {
  plays: Play[];
  onPlayClick?: (play: Play) => void;
}

/**
 * Shows the last 5 recently viewed plays in a horizontal scrollable list
 */
export const RecentPlays: React.FC<RecentPlaysProps> = ({
  plays,
  onPlayClick,
}) => {
  const { recentPlayIds } = useRecentPlays();

  // Get the actual play objects for recent IDs
  const recentPlays = recentPlayIds
    .map((id) => plays.find((p) => p.id === id))
    .filter((p): p is Play => p !== undefined)
    .slice(0, 5);

  if (recentPlays.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-surface-secondary rounded-lg border border-subtle">
      <Icon name="clock" className="text-muted flex-shrink-0" size={16} />
      <span className="text-sm text-secondary flex-shrink-0">Recent:</span>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {recentPlays.map((play) => (
          <button
            key={play.id}
            onClick={() => onPlayClick?.(play)}
            className="px-3 py-1 text-sm bg-white dark:bg-surface-base rounded border border-border hover:border-brand-primary hover:shadow-sm transition-all whitespace-nowrap flex-shrink-0"
            title={`View ${play.play_name || play.formation}`}
          >
            {play.play_name || play.formation || "Unnamed Play"}
          </button>
        ))}
      </div>
    </div>
  );
};
