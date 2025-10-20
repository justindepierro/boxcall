import React from "react";
import { cn } from "../../../../lib/utils/cn";

export interface WizardProgressProps {
  /**
   * Current step number (1-indexed)
   */
  currentStep: number;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * WizardProgress - Visual progress indicator for wizard steps
 *
 * Renders step dots showing:
 * - Filled dot: Completed step
 * - Current dot: Larger with ring animation
 * - Empty dot: Future step
 *
 * Visual example:
 * ●────●────○────○
 * (Step 2 of 4)
 *
 * @example
 * ```tsx
 * <WizardProgress currentStep={2} totalSteps={4} />
 * ```
 */
export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        "py-4",
        "mobile-wizard-progress", // For testing/debugging
        className
      )}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isFuture = stepNumber > currentStep;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step Dot */}
            <div
              className={cn(
                "relative flex items-center justify-center",
                "transition-all duration-300"
              )}
            >
              {/* Outer Ring (current step only) */}
              {isCurrent && (
                <div
                  className={cn(
                    "absolute inset-0",
                    "w-8 h-8 rounded-full",
                    "border-2 border-primary",
                    "animate-pulse"
                  )}
                />
              )}

              {/* Dot */}
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  // Size - Larger for better mobile visibility
                  isCurrent ? "w-5 h-5" : "w-3.5 h-3.5",
                  // Color
                  isCompleted && "bg-primary",
                  isCurrent && "bg-primary",
                  isFuture && "bg-surface-muted border border-border"
                )}
                aria-label={`Step ${stepNumber}`}
              />
            </div>

            {/* Connector Line (not after last dot) */}
            {stepNumber < totalSteps && (
              <div
                className={cn(
                  "h-1 w-8",
                  "transition-colors duration-300",
                  stepNumber < currentStep ? "bg-primary" : "bg-surface-muted"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
