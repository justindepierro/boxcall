import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import type { TeamFormData } from "../types";

interface RoleAssignmentStepProps {
  _formData: TeamFormData;
  _updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const RoleAssignmentStep: React.FC<RoleAssignmentStepProps> = ({
  _formData,
  _updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Role Assignment</h2>
      {/* Role selection UI here */}
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
