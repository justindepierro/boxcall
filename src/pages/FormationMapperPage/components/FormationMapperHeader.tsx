import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button/Button";
import { Typography } from "../../../components/design-system/Typography";
import { Icon } from "../../../components/ui/Icon";

// Minimal Playbook interface for Formation Mapper
interface Playbook {
  id: string;
  name: string;
  is_active: boolean | null;
}

interface FormationMapperHeaderProps {
  teamPlaybooks: Playbook[];
  selectedPlaybookId: string;
  onPlaybookChange: (playbookId: string) => void;
  playsCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onRefresh: () => void;
  loading: boolean;
  assigning: boolean;
}

export const FormationMapperHeader: React.FC<FormationMapperHeaderProps> = ({
  teamPlaybooks,
  selectedPlaybookId,
  onPlaybookChange,
  playsCount,
  allSelected,
  onToggleSelectAll,
  onRefresh,
  loading,
  assigning,
}) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6">
      <Typography variant="headline-lg" className="text-primary mb-1">
        Formation Mapper
      </Typography>
      <Typography variant="body" className="text-secondary">
        Review plays without linked formations and assign the proper versions.
      </Typography>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
        {teamPlaybooks.length > 0 && (
          <select
            value={selectedPlaybookId}
            onChange={(event) => onPlaybookChange(event.target.value)}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-jade"
          >
            {teamPlaybooks.map((playbook) => (
              <option key={playbook.id} value={playbook.id}>
                {playbook.name || "Unnamed Playbook"}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-2 justify-end">
          {playsCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSelectAll}
              disabled={assigning}
            >
              {allSelected ? "Clear selection" : "Select all"}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={assigning}
          >
            <Icon name="arrow-left" className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={loading || assigning}
          >
            <Icon
              name="refresh-cw"
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
};

FormationMapperHeader.displayName = "FormationMapperHeader";
