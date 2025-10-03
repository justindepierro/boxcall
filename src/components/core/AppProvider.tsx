/**
 * Unified App Provider
 *
 * Consolidates multiple providers to reduce nesting:
 * - Design System (theme, tokens, performance)
 * - Accessibility (a11y, reduced motion, screen reader)
 * - SEO (meta tags, structured data)
 * - Security hooks (applied at app level)
 *
 * This replaces the previous 6-level provider nesting with a single provider.
 */

import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";

// Design System imports
import type { TeamColors } from "../../lib/colorGeneration";
import {
  useColorTheme,
  type UseColorThemeReturn,
} from "../../hooks/useColorTheme";

// Accessibility imports
import {
  useScreenReader,
  useKeyboardNavigation,
  useReducedMotion,
  useSkipLinks,
  useA11yTesting,
} from "../../hooks/useAccessibility";
import { accessibilityConfig } from "../../config/accessibility";

// SEO imports
import { seoConfig } from "../../config/seo";
import type { SEOMetaData } from "../../hooks/useSEO";

// Security imports
import {
  useSecurity,
  useCSRFProtection,
  useSecureSession,
} from "../../hooks/useSecurity";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface DesignSystemConfig {
  theme: "light" | "dark" | "auto";
  density: "compact" | "comfortable";
  motion: "enabled" | "reduced" | "disabled";
  glassmorphism: boolean;
  performance: {
    enableLazyLoading: boolean;
    enableImageOptimization: boolean;
    enableBundleAnalysis: boolean;
  };
}

interface ComponentUsage {
  component: string;
  variant?: string;
  page: string;
  timestamp: number;
}

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  lcp: number;
  fid: number;
  cls: number;
}

// Combined context type
interface AppContextType {
  // Design System
  designConfig: DesignSystemConfig;
  updateDesignConfig: (updates: Partial<DesignSystemConfig>) => void;
  trackUsage: (usage: ComponentUsage) => void;
  validateDesignToken: (token: string) => boolean;
  getPerformanceMetrics: () => PerformanceMetrics;

  // Theme
  colorTheme: UseColorThemeReturn;
  teamColors: TeamColors | null;
  setTeamColors: (colors: TeamColors | null) => void;
  currentContext: "calm" | "energetic" | "professional" | null;
  setContext: (context: "calm" | "energetic" | "professional" | null) => void;
  currentEmotion: "trust" | "energy" | "calm" | "achievement" | null;
  setEmotion: (
    emotion: "trust" | "energy" | "calm" | "achievement" | null
  ) => void;
  applyTeamTheme: (teamColors: TeamColors) => void;
  applyEmotionTheme: (
    emotion: "trust" | "energy" | "calm" | "achievement"
  ) => void;
  applyContextTheme: (context: "calm" | "energetic" | "professional") => void;
  showcaseMode: boolean;
  setShowcaseMode: (enabled: boolean) => void;

  // Accessibility
  announce: (
    message: string,
    priority?: "POLITE" | "ASSERTIVE" | "OFF"
  ) => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  announcePageChange: (pageName: string) => void;
  skipLinksEnabled: boolean;
  prefersReducedMotion: boolean;
  a11yViolations: Array<{ message: string; severity: "error" | "warning" }>;

  // SEO
  updateMeta: (metadata: Partial<SEOMetaData>) => void;
  getMeta: () => SEOMetaData;
}

// ============================================
// CONTEXT
// ============================================

export const AppContext = createContext<AppContextType | null>(null);

// ============================================
// DEFAULT CONFIGS
// ============================================

const defaultDesignConfig: DesignSystemConfig = {
  theme: "auto",
  density: "compact",
  motion: "enabled",
  glassmorphism: true,
  performance: {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableBundleAnalysis: false,
  },
};

const defaultSEOMeta: SEOMetaData = {
  title: seoConfig.defaultMeta.title,
  description: seoConfig.defaultMeta.description,
};

// ============================================
// PROVIDER COMPONENT
// ============================================

interface AppProviderProps {
  children: ReactNode;
  enableDevTools?: boolean;
  enableShowcase?: boolean;
  enableCSRF?: boolean;
  enableSessionSecurity?: boolean;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  enableDevTools = import.meta.env.DEV,
  enableShowcase = import.meta.env.DEV,
  enableCSRF = true,
  enableSessionSecurity = true,
}) => {
  // ============================================
  // DESIGN SYSTEM STATE
  // ============================================
  const [designConfig, setDesignConfig] =
    useState<DesignSystemConfig>(defaultDesignConfig);
  const [usageTracking] = useState<ComponentUsage[]>([]);

  const updateDesignConfig = useCallback(
    (updates: Partial<DesignSystemConfig>) => {
      setDesignConfig((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const trackUsage = useCallback(
    (usage: ComponentUsage) => {
      if (enableDevTools) {
        usageTracking.push(usage);
      }
    },
    [enableDevTools, usageTracking]
  );

  const validateDesignToken = useCallback((token: string): boolean => {
    // Simple validation - can be expanded
    return token.startsWith("--semantic-") || token.startsWith("--font-");
  }, []);

  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    return {
      bundleSize: 0, // Would be populated by build tools
      loadTime: performance.now(),
      lcp: 0,
      fid: 0,
      cls: 0,
    };
  }, []);

  // ============================================
  // THEME STATE
  // ============================================
  const colorTheme = useColorTheme();
  const [teamColors, setTeamColors] = useState<TeamColors | null>(null);
  const [currentContext, setCurrentContext] = useState<
    "calm" | "energetic" | "professional" | null
  >(null);
  const [currentEmotion, setCurrentEmotion] = useState<
    "trust" | "energy" | "calm" | "achievement" | null
  >(null);
  const [showcaseMode, setShowcaseMode] = useState(enableShowcase);

  const applyTeamTheme = useCallback((colors: TeamColors) => {
    setTeamColors(colors);
    // Apply colors to CSS custom properties
    document.documentElement.style.setProperty(
      "--team-primary",
      colors.primary
    );
    if (colors.secondary) {
      document.documentElement.style.setProperty(
        "--team-secondary",
        colors.secondary
      );
    }
  }, []);

  const applyEmotionTheme = useCallback(
    (emotion: "trust" | "energy" | "calm" | "achievement") => {
      setCurrentEmotion(emotion);
      // Emotion themes would apply specific color palettes
    },
    []
  );

  const applyContextTheme = useCallback(
    (context: "calm" | "energetic" | "professional") => {
      setCurrentContext(context);
      // Context themes would apply specific styling
    },
    []
  );

  // ============================================
  // ACCESSIBILITY HOOKS
  // ============================================
  const {
    announce,
    announceError,
    announceSuccess,
    announcePageChange,
    announcementRef,
  } = useScreenReader();
  const { skipLinksEnabled } = useSkipLinks();
  const prefersReducedMotion = useReducedMotion();
  const { violations } = useA11yTesting();

  useKeyboardNavigation();

  // Apply a11y CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--a11y-min-touch-target",
      `${accessibilityConfig.interactive.minTouchTarget}px`
    );
    root.style.setProperty(
      "--a11y-focus-width",
      `${accessibilityConfig.interactive.focusIndicatorWidth}px`
    );
    root.style.setProperty(
      "--a11y-line-height",
      accessibilityConfig.text.lineHeight.toString()
    );
    root.style.setProperty(
      "--a11y-letter-spacing",
      `${accessibilityConfig.text.letterSpacing}em`
    );

    if (prefersReducedMotion) {
      root.style.setProperty("--a11y-animation-duration", "0ms");
      root.classList.add("reduce-motion");
    } else {
      root.style.setProperty(
        "--a11y-animation-duration",
        `${accessibilityConfig.motion.defaultAnimationDuration}ms`
      );
      root.classList.remove("reduce-motion");
    }
  }, [prefersReducedMotion]);

  // ============================================
  // SEO STATE
  // ============================================
  const [seoMeta, setSeoMeta] = useState<SEOMetaData>(defaultSEOMeta);

  const updateMeta = useCallback((metadata: Partial<SEOMetaData>) => {
    setSeoMeta((prev) => ({ ...prev, ...metadata }));
  }, []);

  const getMeta = useCallback(() => seoMeta, [seoMeta]);

  // Apply SEO meta tags
  useEffect(() => {
    if (seoMeta.title) {
      document.title = seoMeta.title;
    }

    // Update meta description
    if (seoMeta.description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement("meta");
        descMeta.setAttribute("name", "description");
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute("content", seoMeta.description);
    }

    // Update canonical if available
    if (seoMeta.url) {
      let canonicalLink = document.querySelector(
        'link[rel="canonical"]'
      ) as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = seoMeta.url;
    }
  }, [seoMeta]);

  // ============================================
  // SECURITY HOOKS (no state, just side effects)
  // ============================================
  useSecurity();
  const csrfProtection = useCSRFProtection();
  const secureSession = useSecureSession();

  useEffect(() => {
    if (enableCSRF && csrfProtection) {
      // CSRF protection applied
    }
    if (enableSessionSecurity && secureSession) {
      // Session security applied
    }
  }, [enableCSRF, enableSessionSecurity, csrfProtection, secureSession]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AppContextType = useMemo(
    () => ({
      // Design System
      designConfig,
      updateDesignConfig,
      trackUsage,
      validateDesignToken,
      getPerformanceMetrics,

      // Theme
      colorTheme,
      teamColors,
      setTeamColors,
      currentContext,
      setContext: setCurrentContext,
      currentEmotion,
      setEmotion: setCurrentEmotion,
      applyTeamTheme,
      applyEmotionTheme,
      applyContextTheme,
      showcaseMode,
      setShowcaseMode,

      // Accessibility
      announce,
      announceError,
      announceSuccess,
      announcePageChange,
      skipLinksEnabled,
      prefersReducedMotion,
      a11yViolations: violations,

      // SEO
      updateMeta,
      getMeta,
    }),
    [
      designConfig,
      updateDesignConfig,
      trackUsage,
      validateDesignToken,
      getPerformanceMetrics,
      colorTheme,
      teamColors,
      currentContext,
      currentEmotion,
      applyTeamTheme,
      applyEmotionTheme,
      applyContextTheme,
      showcaseMode,
      announce,
      announceError,
      announceSuccess,
      announcePageChange,
      skipLinksEnabled,
      prefersReducedMotion,
      violations,
      updateMeta,
      getMeta,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      {children}
    </AppContext.Provider>
  );
};
