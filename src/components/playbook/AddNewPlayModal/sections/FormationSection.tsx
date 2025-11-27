import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { FuzzySearchInput } from "../components/FuzzySearchInput";
import { FormationSelector } from "../../FormationSelector";
import type { Formation } from "../../../../types/formation";

interface FormationSectionProps {
  formation: string;
  formationId: string | null;
  formationDir: string;
  formationShowInName: boolean;
  playbookId?: string; // NEW: Required for FormationSelector
  onCreateFormation?: () => void; // NEW: Callback to open Formation Builder
  onFormationChange: (formation: string) => void;
  onFormationIdChange: (
    formationId: string | null,
    formation: Formation | null
  ) => void;
  onFormationDirChange: (dir: string) => void;
  onFormationShowInNameChange: (show: boolean) => void;
  suggestions: string[];
  aiSuggestions?: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
}

export const FormationSection: React.FC<FormationSectionProps> = ({
  formation,
  formationId,
  formationDir,
  formationShowInName,
  playbookId,
  onCreateFormation: _onCreateFormation,
  onFormationChange,
  onFormationIdChange,
  onFormationDirChange,
  onFormationShowInNameChange,
  suggestions,
  aiSuggestions = [],
  showSuggestions,
  onShowSuggestionsChange,
}) => {
  // Use FormationSelector if playbookId is available (new flow)
  // Otherwise fall back to text input (backwards compatibility)
  const useFormationSelector = Boolean(playbookId);

  return (
    <div className="flex gap-spacing-sm items-end">
      {useFormationSelector ? (
        <FormationSelector
          playbookId={playbookId!}
          value={formationId}
          onChange={(id, formationObj) => {
            onFormationIdChange(id, formationObj);
            // Also update text field for backwards compatibility
            if (formationObj) {
              onFormationChange(formationObj.name);
            }
          }}
          className="flex-1"
        />
      ) : (
        <FuzzySearchInput
          label="Formation"
          value={formation}
          onChange={onFormationChange}
          placeholder="e.g., Shotgun, Empty, Pistol"
          suggestions={suggestions}
          aiSuggestions={aiSuggestions}
          showSuggestions={showSuggestions}
          onShowSuggestionsChange={onShowSuggestionsChange}
          required
          className="flex-1"
        />
      )}

      <div className="flex gap-spacing-xs">
        <Button
          type="button"
          variant={formationDir ? "primary" : "outline"}
          size="sm"
          onClick={() => {
            const nextValue =
              formationDir.toLowerCase() === "left"
                ? "Right"
                : formationDir.toLowerCase() === "right"
                  ? ""
                  : "Left";
            onFormationDirChange(nextValue);
          }}
          className="px-spacing-sm min-w-24"
        >
          {formationDir
            ? formationDir.toLowerCase() === "left"
              ? "Left"
              : "Right"
            : "Neutral"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFormationShowInNameChange(!formationShowInName)}
          className={`p-spacing-xs ${formationShowInName ? "text-info" : "text-muted"}`}
        >
          <Icon name="eye" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
