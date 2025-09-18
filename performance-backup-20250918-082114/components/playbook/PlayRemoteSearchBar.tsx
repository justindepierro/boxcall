import React, { useId } from "react";
import { usePlaySearch } from "../../hooks/usePlaySearch";
import { Icon } from "../ui/Icon";
import { Button } from "../ui";

/**
 * PlayRemoteSearchBar
 * Server-backed play search with full‑text primary + trigram fuzzy fallback.
 * Emits suggestion telemetry automatically via usePlaySearch hook.
 *
 * Props:
 *  - playbookId?: scope search to a single playbook
 *  - onSelect?: callback when a play is selected (receives play_id)
 *  - placeholder?: custom input placeholder
 *  - className?: wrapper class overrides
 */
export interface PlayRemoteSearchBarProps {
  playbookId?: string;
  onSelect?: (playId: string) => void;
  placeholder?: string;
  className?: string;
  limit?: number;
}

export const PlayRemoteSearchBar: React.FC<PlayRemoteSearchBarProps> = ({
  playbookId,
  onSelect,
  placeholder = "Search plays (remote)...",
  className = "",
  limit = 12,
}) => {
  const inputId = useId();
  const { query, setQuery, results, loading, error, attemptedFuzzy, select } =
    usePlaySearch("", { playbookId, limit });

  const handleSelect = (playId: string) => {
    select(playId); // telemetry accept
    if (onSelect) onSelect(playId);
  };

  return (
    <div
      className={`relative ${className}`}
      data-component="PlayRemoteSearchBar"
    >
      <label htmlFor={inputId} className="sr-only">
        Search plays
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="search" className="h-4 w-4 text-text-muted" />
        </div>
        <input
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="block w-full pl-10 pr-10 py-2 rounded-md border-subtle surface-card text-sm
                     focus:ring-2 focus:ring-jade-500 focus:border-jade-600 transition-colors"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Icon
              name="refresh-cw"
              className="h-4 w-4 animate-spin text-text-muted"
            />
          </div>
        )}
      </div>
      {query.trim().length >= 2 && (results.length > 0 || loading || error) && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-md border-subtle surface-card elevation-dropdown shadow-sm">
          <div className="py-1">
            {error && (
              <div className="px-3 py-2 text-xs text-error flex items-center gap-2">
                <Icon name="error" className="h-3 w-3" /> {error}
              </div>
            )}
            {!error && !loading && results.length === 0 && (
              <div className="px-3 py-2 text-xs text-text-muted">
                No matches
              </div>
            )}
            {!error &&
              results.map((r) => (
                <Button
                  key={r.play_id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start px-3 py-2 text-left text-xs surface-subtle-hover"
                  onClick={() => handleSelect(r.play_id)}
                >
                  <span className="truncate flex-1">{r.play_id}</span>
                  {r.rank !== undefined && (
                    <span className="ml-2 text-[10px] text-text-muted">
                      r:{r.rank?.toFixed(3)}
                    </span>
                  )}
                  {r.similarity !== undefined && (
                    <span className="ml-2 text-[10px] text-text-muted">
                      s:{r.similarity?.toFixed(3)}
                    </span>
                  )}
                  {r.source === "fuzzy" && (
                    <span className="ml-2 rounded surface-subtle0/15 text-amber-700 dark:text-amber-300 px-1 py-0.5 text-[10px]">
                      fuzzy
                    </span>
                  )}
                </Button>
              ))}
          </div>
          {attemptedFuzzy &&
            results.length > 0 &&
            results[0].source === "fuzzy" && (
              <div className="px-3 py-1 border-t-subtle text-[10px] text-text-muted flex justify-between">
                <span>Fuzzy fallback results</span>
                <span className="opacity-70">pg_trgm</span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default PlayRemoteSearchBar;
