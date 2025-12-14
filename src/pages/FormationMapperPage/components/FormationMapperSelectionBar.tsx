import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Typography } from "../../../components/design-system/Typography";
import { Icon } from "../../../components/ui/Icon";

interface FormationMapperSelectionBarProps {
  selectedCount: number;
  selectedSuggestionsCount: number;
  assigning: boolean;
  canApplySuggestions: boolean;
  canBulkAssign: boolean;
  onClearSelection: () => void;
  onBulkAssignOpen: () => void;
  onApplySuggestions: () => void;
}

export const FormationMapperSelectionBar: React.FC<
  FormationMapperSelectionBarProps
> = ({
  selectedCount,
  selectedSuggestionsCount,
  assigning,
  canApplySuggestions,
  canBulkAssign,
  onClearSelection,
  onBulkAssignOpen,
  onApplySuggestions,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-4xl -translate-x-1/2 px-4">
      <div className="rounded-xl border border-border bg-primary shadow-xl flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Icon name="check-circle" className="h-5 w-5 text-success-500" />
          <div>
            <Typography
              variant="body-md"
              className="font-semibold text-primary"
            >
              {selectedCount} play{selectedCount === 1 ? "" : "s"} selected
            </Typography>
            <Typography variant="caption" className="text-secondary">
              {selectedSuggestionsCount > 0
                ? `${selectedSuggestionsCount} selection${selectedSuggestionsCount === 1 ? "" : "s"} have suggestions ready`
                : "No suggestions available yet"}
            </Typography>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={assigning}
          >
            Clear
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onBulkAssignOpen}
            disabled={!canBulkAssign}
          >
            <Icon name="grid" className="h-4 w-4 mr-2" />
            Assign formation
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onApplySuggestions}
            disabled={!canApplySuggestions}
          >
            <Icon name="sparkles" className="h-4 w-4 mr-2" />
            Apply suggestions
          </Button>
        </div>
      </div>
    </div>
  );
};

FormationMapperSelectionBar.displayName = "FormationMapperSelectionBar";
