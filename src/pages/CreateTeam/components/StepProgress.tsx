import React from "react";
import { Typography } from "../../../components/design-system/Typography";

interface StepProgressProps {
  steps: Array<{ id: string; title: string }>;
  currentStepIndex: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStepIndex,
}) => {
  return (
    <div className="mb-xl">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${
              index < steps.length - 1 ? "flex-1" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${(() => {
                if (index === currentStepIndex) return "bg-blue-600 text-white";
                if (currentStepIndex > index) return "bg-success-600 text-white";
                return "bg-muted text-secondary";
              })()}`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-md ${
                  currentStepIndex > index ? "bg-success-600" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-xs text-center">
        <Typography variant="body-lg" className="font-medium">
          {steps[currentStepIndex]?.title}
        </Typography>
      </div>
    </div>
  );
};

StepProgress.displayName = "StepProgress";
