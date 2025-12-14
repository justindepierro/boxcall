import React from "react";
import { Typography } from "../../../components/design-system/Typography";
import {
  EnhancedInput,
  EnhancedSelect,
} from "../../../components/forms/EnhancedFormFields";
import type { TeamCreationInput } from "../../../services/teamService";

interface TeamInfoStepProps {
  formData: TeamCreationInput;
  onUpdateFormData: (updates: Partial<TeamCreationInput>) => void;
}

export const TeamInfoStep: React.FC<TeamInfoStepProps> = ({
  formData,
  onUpdateFormData,
}) => {
  return (
    <div className="space-y-md">
      <Typography variant="headline-md" className="mb-md">
        Team Information
      </Typography>
      <EnhancedInput
        label="School Name"
        placeholder="e.g., Burke Catholic High School"
        value={formData.schoolName}
        onChange={(value) => onUpdateFormData({ schoolName: value })}
        required
      />
      <EnhancedInput
        label="Team Name"
        placeholder="e.g., Eagles"
        value={formData.teamName}
        onChange={(value) => onUpdateFormData({ teamName: value })}
        required
      />
      <EnhancedSelect
        label="Sport"
        value={formData.sport}
        onChange={(value) => onUpdateFormData({ sport: value })}
        options={[
          { value: "Football", label: "Football" },
          { value: "Basketball", label: "Basketball" },
          { value: "Baseball", label: "Baseball" },
          { value: "Soccer", label: "Soccer" },
          { value: "Other", label: "Other" },
        ]}
      />
    </div>
  );
};

TeamInfoStep.displayName = "TeamInfoStep";
