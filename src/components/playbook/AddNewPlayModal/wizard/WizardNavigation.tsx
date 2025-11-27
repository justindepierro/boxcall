import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { cn } from "../../../../lib/utils/cn";

export interface WizardNavigationProps {
  /**
   * Current step number (1-indexed)
   */
  currentStep: number;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Handler for Back button click
   */
  onBack: () => void;

  /**
   * Handler for Next button click
   */
  onNext: () => void;

  /**
   * Handler for Skip button click (optional steps only)
   */
  onSkip?: () => void;

  /**
   * Whether Next button is disabled (validation failed)
   */
  nextDisabled?: boolean;

  /**
   * Custom label for Next button
   * @default "Next" on most steps, "Create Play" on last step
   */
  nextLabel?: string;

  /**
   * Whether Back button is disabled
   * @default true on first step
   */
  backDisabled?: boolean;

  /**
   * Loading state (e.g., submitting play)
   */
  loading?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * WizardNavigation - Mobile-optimized wizard navigation controls
 *
 * Renders Back/Next/Skip buttons for wizard flow.
 * - Full-width on mobile (48px height)
 * - Back: Secondary button (left)
 * - Next: Primary button (right)
 * - Skip: Text button (center, optional steps only)
 *
 * @example
 * ```tsx
 * <WizardNavigation
 *   currentStep={2}
 *   totalSteps={4}
 *   onBack={handleBack}
 *   onNext={handleNext}
 *   onSkip={handleSkip}
 *   nextDisabled={!isValid}
 *   nextLabel="Next"
 * />
 * ```
 */
export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSkip,
  nextDisabled = false,
  nextLabel,
  backDisabled,
  loading = false,
  className,
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  // Auto-determine labels if not provided
  const finalNextLabel = nextLabel || (isLastStep ? "Create Play" : "Next");
  const finalBackDisabled = backDisabled ?? isFirstStep;

  return (
    <div
      className={cn(
        "flex-shrink-0 p-6 border-t border-border bg-primary",
        "mobile-wizard-navigation", // For testing/debugging
        className
      )}
    >
      {/* Skip Button (centered, optional steps only) */}
      {onSkip && (
        <div className="flex justify-center mb-4">
          <Button
            variant="ghost"
            size="md"
            onClick={onSkip}
            disabled={loading}
            className="text-muted hover:text-primary"
          >
            Skip this step
          </Button>
        </div>
      )}

      {/* Back / Next Buttons */}
      <div className="flex gap-3">
        {/* Back Button */}
        <Button
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={finalBackDisabled || loading}
          className={cn(
            "flex-1 h-12", // 48px height (mobile touch-friendly)
            "font-semibold"
          )}
        >
          <Icon name="chevron-left" size="sm" className="mr-1" />
          Back
        </Button>

        {/* Next Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className={cn(
            "flex-1 h-12", // 48px height
            "font-semibold"
          )}
        >
          {loading ? (
            <>
              <Icon name="clock" size="sm" className="mr-2 animate-spin" />
              {isLastStep ? "Creating..." : "Loading..."}
            </>
          ) : (
            <>
              {finalNextLabel}
              {!isLastStep && (
                <Icon name="chevron-right" size="sm" className="ml-1" />
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
