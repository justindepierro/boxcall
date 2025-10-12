import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import Select from "../../../ui/Select/Select";
import { usePersonnelConfigurations } from "../../../../hooks/usePersonnel";
import { supabase } from "../../../../lib/supabase";

interface PersonnelSectionProps {
  personnel: string;
  onPersonnelChange: (personnel: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  onShowSuggestionsChange: (show: boolean) => void;
}

export const PersonnelSection: React.FC<PersonnelSectionProps> = ({
  personnel,
  onPersonnelChange,
}) => {
  // Get playbook ID from current user
  const [playbookId, setPlaybookId] = React.useState<string | undefined>();

  React.useEffect(() => {
    async function fetchPlaybookId() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get user's first playbook
        const { data: playbooks } = await supabase
          .from("playbooks")
          .select("id")
          .eq("created_by", user.id)
          .limit(1);

        if (playbooks && playbooks.length > 0) {
          setPlaybookId(playbooks[0].id as string);
        }
      } catch (error) {
        console.error("Failed to fetch playbook ID:", error);
      }
    }

    fetchPlaybookId();
  }, []);

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
    // TODO: Open PersonnelConfigurationModal
    alert("Personnel configuration modal will open here (Phase 6)");
  };

  const handleFormationBuilder = () => {
    // TODO: Open FormationBuilderModal
    alert("Formation Builder modal will open here - visual formation creator");
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
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleFormationBuilder}
            className="ml-auto"
          >
            <Icon name="grid" className="h-4 w-4 mr-spacing-xs" />
            Formation Builder
          </Button>
        </div>
      )}
    </div>
  );
};
