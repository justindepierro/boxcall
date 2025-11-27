import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { FuzzySearchInput } from "../components/FuzzySearchInput";

interface PlayNameSectionProps {
  playName: string;
  playDir: string;
  playShowInName: boolean;
  onPlayNameChange: (playName: string) => void;
  onPlayDirChange: (dir: string) => void;
  onPlayShowInNameChange: (show: boolean) => void;
  suggestions: string[];
  aiSuggestions?: string[];
  generatedSuggestions?: string[];
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
  aiSuggestions = [],
  generatedSuggestions = [],
  showSuggestions,
  onShowSuggestionsChange,
}) => {
  return (
    <div className="flex gap-spacing-sm items-end">
      <FuzzySearchInput
        label="Play"
        value={playName}
        onChange={onPlayNameChange}
        placeholder="e.g., Power Read, Slant Route, Zone Blitz"
        suggestions={suggestions}
        aiSuggestions={aiSuggestions}
        generatedSuggestions={generatedSuggestions}
        showSuggestions={showSuggestions}
        onShowSuggestionsChange={onShowSuggestionsChange}
        required
        className="flex-1"
      />

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
          className={`p-spacing-xs ${playShowInName ? "text-info" : "text-muted"}`}
        >
          <Icon name="eye" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
