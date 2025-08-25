import React from "react";
import type { TeamFormData } from "../types";
import { Button } from "../../../components/ui/Button/Button";

interface ReviewStepProps {
  formData: TeamFormData;
  prev: () => void;
  submit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  prev,
  submit,
}) => {
  return (
    <div>
      <h2>Review & Confirm</h2>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
      {/* Replace with a styled summary in production */}
      <Button onClick={prev}>Back</Button>
      <Button onClick={submit}>Submit</Button>
    </div>
  );
};
