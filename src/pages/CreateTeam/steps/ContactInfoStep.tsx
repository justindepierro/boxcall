import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import type { TeamFormData } from "../types";

interface ContactInfoStepProps {
  _formData: TeamFormData;
  _updateField: (field: keyof TeamFormData, value: string) => void;
  next: () => void;
  prev: () => void;
}

export const ContactInfoStep: React.FC<ContactInfoStepProps> = ({
  _formData,
  _updateField,
  next,
  prev,
}) => {
  return (
    <div>
      <h2>Contact Info</h2>
      {/* Contact info fields here */}
      <Button onClick={prev}>Back</Button>
      <Button onClick={next}>Next</Button>
    </div>
  );
};
