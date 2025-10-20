import React from "react";
import { Typography } from "../../../design-system/Typography";
import { cn } from "../../../../lib/utils/cn";

export interface WizardStepProps {
  /**
   * Step title (e.g., "Basic Info", "Personnel & Type")
   */
  title: string;

  /**
   * Current step number (1-indexed)
   */
  step: number;

  /**
   * Total number of steps in wizard
   */
  totalSteps: number;

  /**
   * Whether this step is optional
   * Shows "Optional" badge and allows skipping
   */
  optional?: boolean;

  /**
   * Step content (form fields, etc.)
   */
  children: React.ReactNode;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * WizardStep - Mobile-optimized wizard step container
 *
 * Renders a single step in a multi-step wizard flow.
 * Shows step number, title, optional badge, and content.
 *
 * @example
 * ```tsx
 * <WizardStep title="Basic Info" step={1} totalSteps={4}>
 *   <FormationSection />
 *   <PlayNameSection />
 * </WizardStep>
 * ```
 */
export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  step,
  totalSteps,
  optional = false,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full",
        "mobile-wizard-step", // For testing/debugging
        className
      )}
    >
      {/* Step Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
        {/* Step Number */}
        <Typography
          variant="caption"
          className="text-muted mb-1 font-medium uppercase tracking-wide"
        >
          Step {step} of {totalSteps}
        </Typography>

        {/* Step Title with Optional Badge */}
        <div className="flex items-center gap-2">
          <Typography
            variant="headline-lg"
            className="text-primary font-semibold"
          >
            {title}
          </Typography>

          {optional && (
            <span className="px-2 py-0.5 bg-surface-muted text-muted text-xs font-medium rounded">
              Optional
            </span>
          )}
        </div>
      </div>

      {/* Step Content (Scrollable) */}
      <div
        className={cn(
          "flex-1 overflow-y-auto",
          "px-6 py-6",
          "space-y-6", // Generous spacing for mobile
          "mobile-wizard-content"
        )}
      >
        {children}
      </div>
    </div>
  );
};
