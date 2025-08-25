import React from "react";
import { Button } from "../../../components/ui/Button/Button";

interface CompleteStepProps {
  restart: () => void;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({ restart }) => {
  return (
    <div>
      <h2>Team Creation Complete!</h2>
      <p>Your team has been successfully created.</p>
      <Button onClick={restart}>Create Another Team</Button>
    </div>
  );
};
