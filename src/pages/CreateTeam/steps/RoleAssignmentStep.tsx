import { Button } from "../../../components/ui/Button/Button";

import type { TeamFormData } from "../types";

export interface RoleAssignmentStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const RoleAssignmentStep = ({
  formData: _formData,
  updateField: _updateField,
  next,
  prev,
}: RoleAssignmentStepProps) => (
  <div>
    <h2>Role Assignment</h2>
    {/* Role selection UI here, use formData and updateField as needed */}
    <Button onClick={prev}>Back</Button>
    <Button onClick={next}>Next</Button>
  </div>
);
