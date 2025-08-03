import type { PlayBuilderData, PlayType } from "./play";

// Builder wizard step definitions
export type BuilderStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface BuilderStepInfo {
  step: BuilderStep;
  title: string;
  description: string;
  component: string;
  isComplete: (data: PlayBuilderData) => boolean;
}

// Builder wizard configuration
export const BUILDER_STEPS: BuilderStepInfo[] = [
  {
    step: 1,
    title: "Play Info",
    description: "Basic play information and type",
    component: "PlayInfoStep",
    isComplete: (data) => Boolean(data.play_name && data.p_type),
  },
  {
    step: 2,
    title: "Formation",
    description: "Formation setup and configuration",
    component: "FormationStep",
    isComplete: (data) => Boolean(data.formation),
  },
  {
    step: 3,
    title: "Protection & Motion",
    description: "Protection schemes and pre-snap motion",
    component: "ProtectionMotionStep",
    isComplete: () => true, // Optional step
  },
  {
    step: 4,
    title: "Play Details",
    description: "Routes, direction, and key players",
    component: "PlayDetailsStep",
    isComplete: () => true, // Optional step
  },
  {
    step: 5,
    title: "Preferences",
    description: "Situational preferences and tendencies",
    component: "PreferencesStep",
    isComplete: () => true, // Optional step
  },
  {
    step: 6,
    title: "Review",
    description: "Review and finalize your play",
    component: "ReviewStep",
    isComplete: () => true, // Always complete
  },
];

// Builder state management
export interface BuilderState {
  currentStep: BuilderStep;
  data: PlayBuilderData;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// Builder actions
export type BuilderAction =
  | { type: "SET_STEP"; step: BuilderStep }
  | { type: "UPDATE_DATA"; field: keyof PlayBuilderData; value: unknown }
  | { type: "SET_DATA"; data: Partial<PlayBuilderData> }
  | { type: "VALIDATE" }
  | { type: "RESET" }
  | { type: "SET_ERROR"; field: string; error: string }
  | { type: "CLEAR_ERROR"; field: string };

// Step validation helpers
export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Default play builder data
export const DEFAULT_BUILDER_DATA: PlayBuilderData = {
  play_name: "",
  p_type: "Pass" as PlayType,
  formation: "",
  confidence_base: 70,
  tags: [],
};

// Helper functions for step navigation
export const getNextStep = (currentStep: BuilderStep): BuilderStep | null => {
  return currentStep < 6 ? ((currentStep + 1) as BuilderStep) : null;
};

export const getPreviousStep = (
  currentStep: BuilderStep
): BuilderStep | null => {
  return currentStep > 1 ? ((currentStep - 1) as BuilderStep) : null;
};

export const canAdvanceToStep = (
  targetStep: BuilderStep,
  data: PlayBuilderData
): boolean => {
  // Must complete all previous steps to advance
  for (let i = 1; i < targetStep; i++) {
    const stepInfo = BUILDER_STEPS[i - 1];
    if (!stepInfo.isComplete(data)) {
      return false;
    }
  }
  return true;
};

// Progress calculation
export const calculateProgress = (currentStep: BuilderStep): number => {
  return (currentStep / BUILDER_STEPS.length) * 100;
};
