import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";

interface PersonnelSectionProps {
  personnel: string;
  onPersonnelChange: (personnel: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
}

const QUICK_PERSONNEL_OPTIONS = [
  "11 Personnel",
  "12 Personnel",
  "21 Personnel",
  "22 Personnel",
];

export const PersonnelSection: React.FC<PersonnelSectionProps> = ({
  personnel,
  onPersonnelChange,
  suggestions,
  showSuggestions,
  onShowSuggestionsChange,
}) => {
  const filteredSuggestions = React.useMemo(() => {
    if (!personnel.trim()) return suggestions.slice(0, 5);
    const lower = personnel.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(lower))
      .slice(0, 5);
  }, [personnel, suggestions]);

  const handleAddNewPersonnel = () => {
    // TODO: Navigate to settings to add new personnel
    alert("Navigate to settings to add new personnel");
  };

  return (
    <div>
      <Typography variant="label-md" className="block mb-spacing-sm">
        Personnel
      </Typography>
      <div className="flex gap-spacing-sm mb-spacing-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            value={personnel}
            onChange={(e) => onPersonnelChange(e.target.value)}
            onFocus={() => onShowSuggestionsChange(true)}
            onBlur={() => setTimeout(() => onShowSuggestionsChange(false), 200)}
            placeholder="e.g., 11 Personnel, 12 Personnel"
            className="w-full px-spacing-sm py-spacing-xs border border-border-medium rounded-lg focus:ring-2 focus:ring-text-info focus:border-surface-primary/0"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-surface-primary border border-border-medium rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onPersonnelChange(suggestion);
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
      </div>
      <div className="flex flex-wrap gap-spacing-xs">
        {QUICK_PERSONNEL_OPTIONS.map((p) => (
          <Button
            key={p}
            type="button"
            variant={personnel === p ? "primary" : "outline"}
            size="sm"
            onClick={() => onPersonnelChange(personnel === p ? "" : p)}
          >
            {p}
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddNewPersonnel}
          className="border-dashed"
        >
          <Icon name="plus" className="h-4 w-4 mr-spacing-xs" />
          Add New
        </Button>
      </div>
    </div>
  );
};
