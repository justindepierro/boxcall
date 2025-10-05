import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { FuzzySearchInput } from "../components/FuzzySearchInput";

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
  const handleAddNewPersonnel = () => {
    // TODO: Navigate to settings to add new personnel
    alert("Navigate to settings to add new personnel");
  };

  return (
    <div>
      <FuzzySearchInput
        label="Personnel"
        value={personnel}
        onChange={onPersonnelChange}
        placeholder="e.g., 11 Personnel, 12 Personnel"
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onShowSuggestionsChange={onShowSuggestionsChange}
        className="mb-spacing-sm"
      />
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
