/**
 * Haptic Feedback Utility
 *
 * Provides tactile feedback on mobile devices using the Vibration API.
 * Gracefully degrades on unsupported platforms.
 *
 * Browser Support:
 * - iOS Safari: ✅ (iOS 13+)
 * - Android Chrome: ✅
 * - Desktop browsers: No-op (silent fail)
 *
 * Usage:
 * ```typescript
 * import { haptics } from '@utils/haptics';
 *
 * // Light tap (button press)
 * haptics.light();
 *
 * // Medium tap (player grab)
 * haptics.medium();
 *
 * // Heavy tap (formation insert)
 * haptics.heavy();
 *
 * // Success pattern
 * haptics.success();
 *
 * // Error pattern
 * haptics.error();
 * ```
 */

/**
 * Check if vibration API is available
 */
function isVibrationSupported(): boolean {
  return "vibrate" in navigator;
}

/**
 * Safe vibrate wrapper with error handling
 */
function vibrate(pattern: number | number[]): void {
  if (!isVibrationSupported()) {
    return;
  }

  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Silent fail - vibration is non-critical
    console.debug("Vibration failed:", error);
  }
}

/**
 * Haptic feedback patterns
 */
export const haptics = {
  /**
   * Light haptic feedback (10ms)
   * Use for: Button press, tab switch, toggle
   */
  light: () => {
    vibrate(10);
  },

  /**
   * Medium haptic feedback (25ms)
   * Use for: Player grab, drag start, selection
   */
  medium: () => {
    vibrate(25);
  },

  /**
   * Heavy haptic feedback (50ms)
   * Use for: Formation insert, delete player, major action
   */
  heavy: () => {
    vibrate(50);
  },

  /**
   * Success pattern (short-pause-short)
   * Use for: Formation inserted, defense matched, save complete
   */
  success: () => {
    vibrate([20, 50, 20]);
  },

  /**
   * Error pattern (long-pause-long)
   * Use for: Invalid action, error notification
   */
  error: () => {
    vibrate([50, 100, 50]);
  },

  /**
   * Warning pattern (short burst)
   * Use for: Confirmation dialogs, important alerts
   */
  warning: () => {
    vibrate([30, 30, 30]);
  },

  /**
   * Selection pattern (quick double tap)
   * Use for: Player selected, multi-select toggle
   */
  selection: () => {
    vibrate([15, 30, 15]);
  },

  /**
   * Cancel/stop all ongoing vibrations
   */
  cancel: () => {
    vibrate(0);
  },

  /**
   * Check if haptics are supported
   */
  isSupported: isVibrationSupported,
};

/**
 * Hook for React components to use haptics
 *
 * @example
 * ```typescript
 * const { light, heavy } = useHaptics();
 *
 * <button onClick={() => {
 *   light();
 *   handleClick();
 * }}>
 *   Press Me
 * </button>
 * ```
 */
export function useHaptics() {
  return haptics;
}

/**
 * Higher-order function to add haptic feedback to event handlers
 *
 * @example
 * ```typescript
 * const handleClick = withHaptics(() => {
 *   console.log('Clicked!');
 * }, 'light');
 * ```
 */
export function withHaptics<T extends (...args: any[]) => any>(
  handler: T,
  feedback: keyof typeof haptics = "light"
): T {
  return ((...args: Parameters<T>) => {
    // Trigger haptic
    if (typeof haptics[feedback] === "function") {
      (haptics[feedback] as () => void)();
    }

    // Call original handler
    return handler(...args);
  }) as T;
}
