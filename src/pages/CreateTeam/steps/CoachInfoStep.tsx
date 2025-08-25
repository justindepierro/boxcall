import React from "react";
import type { TeamFormData } from "../types";
import { Button } from "../../../components/ui/Button/Button";

interface CoachInfoStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const CoachInfoStep: React.FC<CoachInfoStepProps> = ({
  formData,
  updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Head Coach Information</h2>
      <input
        type="text"
        value={formData.coachName}
        onChange={(e) => updateField("coachName", e.target.value)}
        placeholder="Coach Name"
      />
      <input
        type="email"
        value={formData.coachEmail}
        onChange={(e) => updateField("coachEmail", e.target.value)}
        placeholder="Coach Email"
      />
      <input
        type="tel"
        value={formData.coachPhone}
        onChange={(e) => updateField("coachPhone", e.target.value)}
        placeholder="Coach Phone"
      />
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
