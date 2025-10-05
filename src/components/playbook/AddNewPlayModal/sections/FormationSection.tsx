import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface FormationSectionProps {
  formation: string;
  formationDir: string;
  formationShowInName: boolean;
  onFormationChange: (formation: string) => void;
  onFormationDirChange: (dir: string) => void;
  onFormationShowInNameChange: (show: boolean) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
}

export const FormationSection: React.FC<FormationSectionProps> = ({
  formation,
  formationDir,
  formationShowInName,
  onFormationChange,
  onFormationDirChange,
  onFormationShowInNameChange,
  suggestions,
  showSuggestions,
  onShowSuggestionsChange,
}) => {
  const filteredSuggestions = React.useMemo(() => {
    if (!formation.trim()) return suggestions.slice(0, 5);
    const lower = formation.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [formation, suggestions]);

  return (
    <div>
      <Typography variant="label-md" className="block mb-spacing-sm">
        Formation *
      </Typography>
      <div className="flex gap-spacing-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            value={formation}
            onChange={(e) => onFormationChange(e.target.value)}
            onFocus={() => onShowSuggestionsChange(true)}
            onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
            placeholder="e.g., Shotgun, Empty, Pistol"
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
                    onFormationChange(suggestion);
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
            variant={formationDir === "Left" ? "primary" : "outline"}
            size="sm"
            onClick={() =>
              onFormationDirChange(formationDir === "Left" ? "" : "Left")
            }
            className="px-spacing-sm"
          >
            Left
          </Button>
          <Button
            type="button"
            variant={formationDir === "Right" ? "primary" : "outline"}
            size="sm"
            onClick={() =>
              onFormationDirChange(formationDir === "Right" ? "" : "Right")
            }
            className="px-spacing-sm"
          >
            Right
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFormationShowInNameChange(!formationShowInName)}
            className={`p-spacing-xs ${formationShowInName ? "text-text-info" : "text-text-muted"}`}
          >
            <Icon name="eye" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
