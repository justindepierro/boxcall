import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface PlayNameSectionProps {
  playName: string;
  playDir: string;
  playShowInName: boolean;
  onPlayNameChange: (playName: string) => void;
  onPlayDirChange: (dir: string) => void;
  onPlayShowInNameChange: (show: boolean) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
}

export const PlayNameSection: React.FC<PlayNameSectionProps> = ({
  playName,
  playDir,
  playShowInName,
  onPlayNameChange,
  onPlayDirChange,
  onPlayShowInNameChange,
  suggestions,
  showSuggestions,
  onShowSuggestionsChange,
}) => {
  const filteredSuggestions = React.useMemo(() => {
    if (!playName.trim()) return suggestions.slice(0, 5);
    const lower = playName.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [playName, suggestions]);

  return (
    <div>
      <Typography variant="label-md" className="block mb-spacing-sm">
        Play *
      </Typography>
      <div className="flex gap-spacing-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            value={playName}
            onChange={(e) => onPlayNameChange(e.target.value)}
            onFocus={() => onShowSuggestionsChange(true)}
            onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
            placeholder="e.g., Power Read, Slant Route, Zone Blitz"
            className="w-full px-spacing-sm py-spacing-xs border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
            required
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onPlayNameChange(suggestion);
                    onShowSuggestionsChange(false);
                  }}
                  className="w-full text-left px-spacing-sm py-spacing-xs hover:bg-surface-secondary/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-spacing-xs">
          <Button
            type="button"
            variant={playDir === "Left" ? "primary" : "outline"}
            size="sm"
            onClick={() => onPlayDirChange(playDir === "Left" ? "" : "Left")}
            className="px-spacing-sm"
          >
            Left
          </Button>
          <Button
            type="button"
            variant={playDir === "Right" ? "primary" : "outline"}
            size="sm"
            onClick={() => onPlayDirChange(playDir === "Right" ? "" : "Right")}
            className="px-spacing-sm"
          >
            Right
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPlayShowInNameChange(!playShowInName)}
            className={`p-spacing-xs ${playShowInName ? "text-text-info" : "text-text-muted"}`}
          >
            <Icon name="eye" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
