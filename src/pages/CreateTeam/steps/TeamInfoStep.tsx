import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import type { TeamFormData } from "../types";

interface TeamInfoStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
}

export const TeamInfoStep: React.FC<TeamInfoStepProps> = ({
  formData,
  updateField,
  next,
}) => {
  return (
    <div>
      <h2>Team Info</h2>
      <input
        type="text"
        value={formData.teamName}
        onChange={(e) => updateField("teamName", e.target.value)}
        placeholder="Team Name"
      />
      {/* Add more fields as needed */}
      <Button onClick={next}>Next</Button>
    </div>
  );
};
