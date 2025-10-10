/**
 * Haptic Feedback System
 *
 * Provides tactile feedback for user interactions, with fallbacks for devices
 * that don't support native haptic feedback.
 */

export type HapticType =
  | "light" // Light tap feedback
  | "medium" // Medium tap feedback
  | "heavy" // Heavy tap feedback
  | "success" // Success confirmation
  | "warning" // Warning notification
  | "error" // Error feedback
  | "selection" // Selection change
  | "impact"; // Impact feedback

/**
 * Haptic feedback patterns for different interaction types
 */
const hapticPatterns = {
  light: [10], // Short light vibration
  medium: [20], // Medium vibration
  heavy: [30], // Heavy vibration
  success: [20, 10, 20], // Success pattern: buzz-pause-buzz
  warning: [30, 10, 30, 10, 30], // Warning pattern: buzz-pause-buzz-pause-buzz
  error: [50, 20, 50, 20, 50], // Error pattern: long buzzes
  selection: [15], // Quick selection feedback
  impact: [25], // Impact feedback
} as const;

/**
 * Visual feedback animations for non-haptic devices
 */
const visualFeedback = {
  light: "animate-pulse",
  medium: "animate-bounce",
  heavy: "animate-ping",
  success: "animate-pulse text-text-success",
  warning: "animate-pulse text-text-warning",
  error: "animate-pulse text-text-error",
  selection: "animate-pulse bg-electric-100",
  impact: "animate-bounce scale-110",
} as const;

/**
 * Check if the device supports haptic feedback
 */
export const supportsHapticFeedback = (): boolean => {
  return (
    typeof navigator !== "undefined" &&
    "vibrate" in navigator &&
    // Check if vibration is actually supported (not just present)
    typeof navigator.vibrate === "function"
  );
};

/**
 * Trigger haptic feedback
 */
export const triggerHapticFeedback = (type: HapticType): void => {
  if (supportsHapticFeedback()) {
    try {
      navigator.vibrate(hapticPatterns[type]);
    } catch (error) {
      // Silently fail if vibration fails
      console.warn("Haptic feedback failed:", error);
    }
  }
};

/**
 * Get visual feedback class for a haptic type
 */
export const getVisualFeedbackClass = (type: HapticType): string => {
  return visualFeedback[type];
};

/**
 * Combined haptic and visual feedback
 */
export const triggerFeedback = (type: HapticType): string => {
  triggerHapticFeedback(type);
  return getVisualFeedbackClass(type);
};

/**
 * Haptic feedback hook for React components
 */
export const useHapticFeedback = () => {
  return {
    trigger: triggerHapticFeedback,
    supports: supportsHapticFeedback(),
    getVisualClass: getVisualFeedbackClass,
    triggerCombined: triggerFeedback,
  };
};

export default {
  triggerHapticFeedback,
  supportsHapticFeedback,
  getVisualFeedbackClass,
  triggerFeedback,
  useHapticFeedback,
};
