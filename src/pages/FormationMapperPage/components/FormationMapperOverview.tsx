import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import { Card } from "../../../components/ui/Card";

// Minimal Playbook interface for Formation Mapper
interface Playbook {
  id: string;
  name: string;
}

interface FormationMapperOverviewProps {
  selectedPlaybook: Playbook | null;
  total: number;
  unresolved: number;
  lastUpdated: string | null;
}

export const FormationMapperOverview: React.FC<
  FormationMapperOverviewProps
> = ({ selectedPlaybook, total, unresolved, lastUpdated }) => {
  return (
    <Card variant="glass" size="lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="headline-sm" className="text-primary">
            Mapping Overview
          </Typography>
          <Typography variant="body-sm" className="text-secondary">
            {selectedPlaybook
              ? `Playbook: ${selectedPlaybook.name}`
              : "Select a playbook to review formation mappings."}
          </Typography>
          <Typography variant="body-xs" className="text-secondary mt-1">
            {unresolved === 0
              ? "All plays are synced to formations."
              : `${unresolved} play${unresolved === 1 ? "" : "s"} need formation mapping.`}
          </Typography>
        </div>
        <div className="flex gap-4 text-sm text-muted">
          <div>
            <Typography variant="caption" className="uppercase">
              Total plays
            </Typography>
            <Typography
              variant="body-md"
              className="font-semibold text-primary"
            >
              {total}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" className="uppercase">
              Last updated
            </Typography>
            <Typography
              variant="body-md"
              className="font-semibold text-primary"
            >
              {lastUpdated || "—"}
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
};

FormationMapperOverview.displayName = "FormationMapperOverview";
