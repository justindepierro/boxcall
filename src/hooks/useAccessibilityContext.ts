import { createContext, useContext } from "react";

export interface AccessibilityContextType {
  announceMessage: (message: string, priority?: "POLITE" | "ASSERTIVE") => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announcePageChange: (pageName: string) => void;
  prefersReducedMotion: boolean;
  isA11yTestingEnabled: boolean;
  a11yViolations: any[];
}

export const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibilityContext must be used within an AccessibilityProvider"
    );
  }
  return context;
};
