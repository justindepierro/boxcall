import React from "react";
import type { TeamFormData } from "../types";
import { Button } from "../../../components/ui/Button/Button";

interface FallbackInfoStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const FallbackInfoStep: React.FC<FallbackInfoStepProps> = ({
  formData,
  updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Emergency Contact Information</h2>
      <input
        type="text"
        value={formData.fallbackName}
        onChange={(e) => updateField("fallbackName", e.target.value)}
        placeholder="Contact Name"
      />
      <input
        type="email"
        value={formData.fallbackEmail}
        onChange={(e) => updateField("fallbackEmail", e.target.value)}
        placeholder="Contact Email"
      />
      <input
        type="tel"
        value={formData.fallbackPhone}
        onChange={(e) => updateField("fallbackPhone", e.target.value)}
        placeholder="Contact Phone"
      />
      <input
        type="text"
        value={formData.fallbackRole}
        onChange={(e) => updateField("fallbackRole", e.target.value)}
        placeholder="Contact Role"
      />
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
