import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import Select from "../../../ui/Select/Select";
import { usePersonnelConfigurations } from "../../../../hooks/usePersonnel";

interface PersonnelSectionProps {
  personnel: string;
  onPersonnelChange: (personnel: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
  onAddNew?: () => void; // NEW: Callback to open personnel creation panel
  playbookId?: string; // NEW: Playbook ID to load personnel configurations
}

export const PersonnelSection: React.FC<PersonnelSectionProps> = ({
  personnel,
  onPersonnelChange,
  onAddNew,
  playbookId,
}) => {
  // Fetch personnel configurations from database
  const { data: configurations, isLoading } =
    usePersonnelConfigurations(playbookId);

  // Format options for dropdown
  const personnelOptions = React.useMemo(() => {
    if (!configurations) return [];
    return configurations.map((config) => ({
      value: config.name,
      label: config.description
        ? `${config.name} (${config.description})`
        : config.name,
    }));
  }, [configurations]);

  const handleAddNewPersonnel = () => {
    if (onAddNew) {
      onAddNew();
    } else {
      // Fallback for backwards compatibility
      alert("Personnel configuration modal will open here (Phase 6)");
    }
  };

  return (
    <div>
      <Select
        label="Personnel"
        value={personnel}
        onChange={(value) => onPersonnelChange(String(value))}
        options={personnelOptions}
        placeholder={
          isLoading ? "Loading personnel..." : "Select personnel grouping"
        }
        className="mb-spacing-sm"
        disabled={isLoading || !playbookId}
      />

      {/* Quick-select buttons for common personnel */}
      {!isLoading && configurations && configurations.length > 0 && (
        <div className="flex flex-wrap gap-spacing-xs">
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
            <Icon name="plus" className="h-4 w-4 mr-spacing-xs" />
            Add New
          </Button>
        </div>
      )}

      {/* Helper text directing coaches to Formation Builder */}
      <Typography variant="caption" className="text-text-muted mt-spacing-sm">
        💡 Tip: Use the Formation Builder tile on the main page to create
        formations with visual positioning
      </Typography>
    </div>
  );
};
