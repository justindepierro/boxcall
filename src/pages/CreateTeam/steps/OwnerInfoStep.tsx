import React from "react";
import type { TeamFormData } from "../types";
import { Button } from "../../../components/ui/Button/Button";

interface OwnerInfoStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const OwnerInfoStep: React.FC<OwnerInfoStepProps> = ({
  formData,
  updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Team Owner Information</h2>
      <input
        type="text"
        value={formData.ownerName}
        onChange={(e) => updateField("ownerName", e.target.value)}
        placeholder="Owner Name"
      />
      <input
        type="email"
        value={formData.ownerEmail}
        onChange={(e) => updateField("ownerEmail", e.target.value)}
        placeholder="Owner Email"
      />
      <input
        type="tel"
        value={formData.ownerPhone}
        onChange={(e) => updateField("ownerPhone", e.target.value)}
        placeholder="Owner Phone"
      />
      <input
        type="text"
        value={formData.ownerRole}
        onChange={(e) => updateField("ownerRole", e.target.value)}
        placeholder="Owner Role"
      />
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
