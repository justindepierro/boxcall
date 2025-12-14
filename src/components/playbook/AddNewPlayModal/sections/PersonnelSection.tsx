import React, { useMemo } from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import { ValidatedInput } from "../../ValidatedInput";
import { usePersonnelConfigurations } from "../../../../hooks/usePersonnel";
import { useToast } from "../../../../hooks/useToast";
import type { Play } from "../../../../types/database";

interface PersonnelSectionProps {
  personnel: string;
  onPersonnelChange: (personnel: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  onAddNew?: () => void; // NEW: Callback to open personnel creation panel
  playbookId?: string; // NEW: Playbook ID to load personnel configurations
  existingPlays?: Play[]; // NEW: For validation against existing plays
  onNextField?: () => void; // NEW: Keyboard navigation
}

export const PersonnelSection: React.FC<PersonnelSectionProps> = ({
  personnel,
  onPersonnelChange,
  onAddNew,
  playbookId,
  existingPlays = [],
  onNextField,
}) => {
  // Fetch personnel configurations from database
  const { data: configurations, isLoading } =
    usePersonnelConfigurations(playbookId);
  const toast = useToast();

  // Extract unique personnel values from existing plays for validation
  const existingPersonnelValues = useMemo(() => {
    const personnelSet = new Set<string>();
    existingPlays.forEach((play) => {
      if (play.personnel && play.personnel.trim()) {
        personnelSet.add(play.personnel.trim());
      }
    });
    return Array.from(personnelSet);
  }, [existingPlays]);

  const handleAddNewPersonnel = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      // Fallback for backwards compatibility
      toast.info("Personnel configuration modal will open here (Phase 6)");
    }
  };

  return (
    <div>
      <ValidatedInput
        type="personnel"
        label="Personnel"
        value={personnel}
        onChange={(e) => onPersonnelChange(e.target.value)}
        existingValues={existingPersonnelValues}
        placeholder={(() => {
          if (!playbookId) return "Playbook required";
          if (isLoading) return "Loading personnel...";
          return "e.g., 11, 12, 21, Trips, Empty";
        })()}
        disabled={isLoading || !playbookId}
        onEnterPress={onNextField}
        helperText={
          !playbookId
            ? "A playbook must be selected"
            : "Common: 11 (1 RB, 1 TE), 12 (1 RB, 2 TE), 21 (2 RB, 1 TE)"
        }
      />

      {/* Quick-select buttons for common personnel */}
      {!isLoading && configurations && configurations.length > 0 && (
        <div className="flex flex-wrap gap-xs">
          {configurations.slice(0, 4).map((config) => (
            <Button
              key={config.id}
              type="button"
              variant={personnel === config.name ? "primary" : "outline"}
              size="sm"
              onClick={() =>
                onPersonnelChange(personnel === config.name ? "" : config.name)
              }
            >
              {config.name}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddNewPersonnel}
            className="border-dashed"
          >
            <Icon name="plus" className="h-4 w-4 mr-xs" />
            Add New
          </Button>
        </div>
      )}

      {/* Helper text directing coaches to Formation Builder */}
      <Typography variant="caption" className="text-muted mt-sm">
        💡 Tip: Use the Formation Builder tile on the main page to create
        formations with visual positioning
      </Typography>
    </div>
  );
};
