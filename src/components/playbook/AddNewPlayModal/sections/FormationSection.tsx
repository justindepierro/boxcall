import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { FuzzySearchInput } from "../components/FuzzySearchInput";

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
  return (
    <div className="flex gap-spacing-sm items-end">
      <FuzzySearchInput
        label="Formation"
        value={formation}
        onChange={onFormationChange}
        placeholder="e.g., Shotgun, Empty, Pistol"
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        onShowSuggestionsChange={onShowSuggestionsChange}
        required
        className="flex-1"
      />

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
  );
};
