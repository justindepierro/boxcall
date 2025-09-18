import React from "react";

/**
 * Progressive Loading Hook
 *
 * Provides smooth loading states with staggered appearance
 */
export const useProgressiveLoading = (
  totalSteps: number = 4,
  delayMs: number = 150
) => {
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (currentStep < totalSteps) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [currentStep, totalSteps, delayMs]);

  return {
    currentStep,
    isStepVisible: (step: number) => currentStep >= step,
    reset: () => setCurrentStep(0),
  };
};
