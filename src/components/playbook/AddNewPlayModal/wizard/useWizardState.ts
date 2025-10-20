import { useState, useCallback } from "react";

export interface WizardState {
  /**
   * Current step number (1-indexed)
   */
  currentStep: number;

  /**
   * Whether currently on first step
   */
  isFirstStep: boolean;

  /**
   * Whether currently on last step
   */
  isLastStep: boolean;

  /**
   * Go to next step (if not on last step)
   */
  goNext: () => void;

  /**
   * Go to previous step (if not on first step)
   */
  goBack: () => void;

  /**
   * Go to specific step number
   */
  goToStep: (step: number) => void;

  /**
   * Reset wizard to first step
   */
  reset: () => void;
}

/**
 * useWizardState - Hook for managing wizard step navigation
 *
 * Provides state and methods for navigating through wizard steps.
 *
 * @param totalSteps - Total number of steps in wizard
 * @param initialStep - Initial step number (default: 1)
 *
 * @example
 * ```tsx
 * const wizard = useWizardState(4);
 *
 * // Navigate
 * wizard.goNext();
 * wizard.goBack();
 * wizard.goToStep(3);
 *
 * // Check state
 * if (wizard.isLastStep) {
 *   // Submit form
 * }
 * ```
 */
export function useWizardState(
  totalSteps: number,
  initialStep: number = 1
): WizardState {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const reset = useCallback(() => {
    setCurrentStep(1);
  }, []);

  return {
    currentStep,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    goToStep,
    reset,
  };
}
