/**
 * DefaultStep Component
 *
 * Fallback step for unimplemented steps
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import type { JoinStep } from "../types";

interface DefaultStepProps {
  currentStep: JoinStep;
}

export const DefaultStep: React.FC<DefaultStepProps> = ({ currentStep }) => {
  return (
    <div className="text-center">
      <Typography variant="headline-lg" className="mb-4">
        Step: {currentStep}
      </Typography>
      <Typography variant="body-md" color="muted">
        This step is not yet implemented. Check back soon!
      </Typography>
    </div>
  );
};

DefaultStep.displayName = "DefaultStep";
