import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import type { TeamFormData } from "../types";

interface SchoolVerificationStepProps {
  _formData: TeamFormData;
  _updateField: (field: keyof TeamFormData, value: string) => void;
  prev: () => void;
}

export const SchoolVerificationStep: React.FC<SchoolVerificationStepProps> = ({
  _formData,
  _updateField,
  prev,
}) => {
  return (
    <div>
      <h2>School Verification</h2>
      {/* School verification fields here */}
      <Button onClick={prev}>Back</Button>
    </div>
  );
};
