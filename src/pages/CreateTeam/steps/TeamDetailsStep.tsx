import React from "react";
import type { TeamFormData } from "../types";
import { Button } from "../../../components/ui/Button/Button";

interface TeamDetailsStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const TeamDetailsStep: React.FC<TeamDetailsStepProps> = ({
  formData,
  updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Team Details</h2>
      <input
        type="number"
        value={formData.expectedPlayerCount}
        onChange={(e) => updateField("expectedPlayerCount", e.target.value)}
        placeholder="Expected Player Count"
        min={0}
      />
      <input
        type="number"
        value={formData.coachingStaffCount}
        onChange={(e) => updateField("coachingStaffCount", e.target.value)}
        placeholder="Coaching Staff Count"
        min={0}
      />
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
