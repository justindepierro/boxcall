/**
 * Compatibility Hooks for Legacy Provider Access
 * 
 * These hooks provide backward compatibility for components
 * that were using the old individual provider hooks.
 * They wrap the new unified useApp hook.
 */

import { useApp } from "../components/core/useApp";

/**
 * Legacy hook for design system access
 * @deprecated Use useApp() instead
 */
export const useDesignSystemCompat = () => {
  const app = useApp();
  return {
    config: app.designConfig,
    updateConfig: app.updateDesignConfig,
    trackUsage: app.trackUsage,
    validateDesignToken: app.validateDesignToken,
    getPerformanceMetrics: app.getPerformanceMetrics,
  };
};

/**
 * Legacy hook for advanced theme access
 * @deprecated Use useApp() instead
 */
export const useAdvancedThemeCompat = () => {
  const app = useApp();
  return {
    ...app.colorTheme,
    teamColors: app.teamColors,
    setTeamColors: app.setTeamColors,
    currentContext: app.currentContext,
    setContext: app.setContext,
    currentEmotion: app.currentEmotion,
    setEmotion: app.setEmotion,
    applyTeamTheme: app.applyTeamTheme,
    applyEmotionTheme: app.applyEmotionTheme,
    applyContextTheme: app.applyContextTheme,
    showcaseMode: app.showcaseMode,
    setShowcaseMode: app.setShowcaseMode,
  };
};

/**
 * Legacy hook for accessibility access  
 * @deprecated Use useApp() instead
 */
export const useAccessibilityCompat = () => {
  const app = useApp();
  return {
    announce: app.announce,
    announceError: app.announceError,
    announceSuccess: app.announceSuccess,
    announcePageChange: app.announcePageChange,
    skipLinksEnabled: app.skipLinksEnabled,
    prefersReducedMotion: app.prefersReducedMotion,
    violations: app.a11yViolations,
  };
};

/**
 * Legacy hook for SEO access
 * @deprecated Use useApp() instead
 */
export const useSEOCompat = () => {
  const app = useApp();
  return {
    updateMeta: app.updateMeta,
    getMeta: app.getMeta,
  };
};
