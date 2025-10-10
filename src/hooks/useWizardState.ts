import { useState, useCallback } from "react";

export interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
}

export interface WizardProgress {
  currentStep: string;
  completedSteps: Set<string>;
  isStepCompleted: (stepId: string) => boolean;
  isStepAccessible: (stepId: string) => boolean;
  canProceedToNext: boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepId: string) => void;
  markStepCompleted: (stepId: string) => void;
  resetWizard: () => void;
}

/**
 * Hook for managing multi-step wizard state
 */
export function useWizardState(
  steps: StepConfig[],
  initialStep?: string
): WizardProgress {
  const [currentStep, setCurrentStep] = useState(
    initialStep || steps[0]?.id || ""
  );
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const isStepCompleted = useCallback(
    (stepId: string): boolean => {
      return completedSteps.has(stepId);
    },
    [completedSteps]
  );

  const isStepAccessible = useCallback(
    (stepId: string): boolean => {
      const stepIndex = steps.findIndex((step) => step.id === stepId);
      if (stepIndex === 0) return true;

      // Step is accessible if all previous steps are completed
      for (let i = 0; i < stepIndex; i++) {
        if (!completedSteps.has(steps[i].id)) {
          return false;
        }
      }
      return true;
    },
    [steps, completedSteps]
  );

  const getCurrentStepIndex = useCallback((): number => {
    return steps.findIndex((step) => step.id === currentStep);
  }, [steps, currentStep]);

  const canProceedToNext = useCallback((): boolean => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex >= 0 && currentIndex < steps.length - 1;
  }, [getCurrentStepIndex, steps.length]);

  const nextStep = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  }, [getCurrentStepIndex, steps]);

  const previousStep = useCallback(() => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  }, [getCurrentStepIndex, steps]);

  const goToStep = useCallback(
    (stepId: string) => {
      if (isStepAccessible(stepId)) {
        setCurrentStep(stepId);
      }
    },
    [isStepAccessible]
  );

  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(steps[0]?.id || "");
    setCompletedSteps(new Set());
  }, [steps]);

  return {
    currentStep,
    completedSteps,
    isStepCompleted,
    isStepAccessible,
    canProceedToNext: canProceedToNext(),
    nextStep,
    previousStep,
    goToStep,
    markStepCompleted,
    resetWizard,
  };
}
