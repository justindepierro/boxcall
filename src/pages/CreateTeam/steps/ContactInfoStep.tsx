import { Button } from "../../../components/ui/Button/Button";

import type { TeamFormData } from "../types";

export interface ContactInfoStepProps {
  formData: TeamFormData;
  updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const ContactInfoStep = ({
  formData: _formData,
  updateField: _updateField,
  next,
  prev,
}: ContactInfoStepProps) => (
  <div>
    <h2>Contact Info</h2>
    {/* Contact info fields here, use formData and updateField as needed */}
    <Button onClick={prev}>Back</Button>
    <Button onClick={next}>Next</Button>
  </div>
);
