import { Button } from "../../../components/ui/Button/Button";

import type { TeamFormData } from "../types";

export interface SchoolVerificationStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const SchoolVerificationStep = ({
  formData: _formData,
  updateField: _updateField,
  next,
  prev,
}: SchoolVerificationStepProps) => (
  <div>
    <h2>School Verification</h2>
    {/* School verification fields here, use formData and updateField as needed */}
    <Button onClick={prev}>Back</Button>
    <Button onClick={next}>Next</Button>
  </div>
);
