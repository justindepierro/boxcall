/**
 * BoxCall Design System Provider
 * Enforces consistent design languageconst DesignSystemContext = createContext<DesignSystemContextType | null>(null);

// Export context for use in hooks file
export { DesignSystemContext };

// Design token validation
const validateDesignToken = (token: string): boolean => {ire application
 *
 * Features:
 * - Centralized theme management
 * - Design token validation
 * - Performance monitoring
 * - Accessibility enforcement
 * - Design system consistency checks
 */

import React, {
  createContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useDesignSystem } from "./design-system-hooks";

// Design system configuration
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

// Component usage tracking for consistency
interface ComponentUsage {
  component: string;
  variant?: string;
  page: string;
  timestamp: number;
}

// Design system context
interface DesignSystemContextType {
  config: DesignSystemConfig;
  updateConfig: (updates: Partial<DesignSystemConfig>) => void;
  trackUsage: (usage: ComponentUsage) => void;
  validateDesignToken: (token: string) => boolean;
  getPerformanceMetrics: () => PerformanceMetrics;
}

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  lcp: number;
  fid: number;
  cls: number;
}

// Default configuration
const defaultConfig: DesignSystemConfig = {
  theme: "auto",
  density: "comfortable",
  motion: "enabled",
  glassmorphism: true,
  performance: {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableBundleAnalysis: false,
  },
};

const DesignSystemContext = createContext<DesignSystemContextType | null>(null);

// Export context for use in hooks file
export { DesignSystemContext };

// Design token validation
const validateDesignToken = (token: string): boolean => {
  // Check if token exists in our design system
  const validTokens = [
    // Colors
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    // Spacing
    "space-1",
    "space-2",
    "space-3",
    "space-4",
    "space-6",
    "space-8",
    "space-12",
    // Typography
    "text-xs",
    "text-sm",
    "text-base",
    "text-lg",
    "text-xl",
    "text-2xl",
    // Shadows
    "shadow-sm",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
  ];

  return (
    validTokens.includes(token) ||
    token.startsWith("color-") ||
    token.startsWith("bg-")
  );
};

// Performance monitoring
const getPerformanceMetrics = (): PerformanceMetrics => {
  if (typeof window === "undefined" || !window.performance) {
    return { bundleSize: 0, loadTime: 0, lcp: 0, fid: 0, cls: 0 };
  }

  const navigation = window.performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;
  const loadTime = navigation
    ? navigation.loadEventEnd - navigation.fetchStart
    : 0;

  // Get Core Web Vitals (simplified)
  const lcp = (window as any).webVitals?.lcp || 0;
  const fid = (window as any).webVitals?.fid || 0;
  const cls = (window as any).webVitals?.cls || 0;

  return {
    bundleSize: 0, // Would be populated by build analysis
    loadTime,
    lcp,
    fid,
    cls,
  };
};

interface DesignSystemProviderProps {
  children: ReactNode;
  config?: Partial<DesignSystemConfig>;
  enableDevTools?: boolean;
}

export const DesignSystemProvider: React.FC<DesignSystemProviderProps> = ({
  children,
  config: userConfig = {},
  enableDevTools = false,
}) => {
  // Manage design system config with state
  const [config, setConfig] = useState<DesignSystemConfig>(() => ({
    ...defaultConfig,
    ...userConfig,
  }));

  // Component usage tracking
  const trackUsage = useCallback(
    (usage: ComponentUsage) => {
      if (enableDevTools && process.env.NODE_ENV === "development") {
        console.info("🎨 Design System Usage:", usage);
      }
    },
    [enableDevTools]
  );

  // Update configuration
  const updateConfig = useCallback(
    (updates: Partial<DesignSystemConfig>) => {
      setConfig((prev) => ({ ...prev, ...updates }));
      if (enableDevTools && process.env.NODE_ENV === "development") {
        console.info("🎨 Design System Config Updated:", updates);
      }
    },
    [enableDevTools]
  );

  // Apply design system classes to body
  useEffect(() => {
    const classes = [
      `density-${config.density}`,
      `motion-${config.motion}`,
      config.glassmorphism ? "glassmorphism-enabled" : "glassmorphism-disabled",
    ];

    document.body.className = classes.join(" ");

    // Apply theme
    if (config.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (config.theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, [config]);

  // Performance monitoring
  useEffect(() => {
    if (config.performance.enableBundleAnalysis && enableDevTools) {
      // Log performance metrics in development
      const metrics = getPerformanceMetrics();
      console.info("📊 Performance Metrics:", metrics);
    }
  }, [config.performance.enableBundleAnalysis, enableDevTools]);

  const contextValue: DesignSystemContextType = useMemo(
    () => ({
      config,
      updateConfig,
      trackUsage,
      validateDesignToken,
      getPerformanceMetrics,
    }),
    [config, updateConfig, trackUsage]
  );

  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
      {enableDevTools && process.env.NODE_ENV === "development" && (
        <DesignSystemDevTools />
      )}
    </DesignSystemContext.Provider>
  );
};

// Development tools component
const DesignSystemDevTools: React.FC = () => {
  const { config, getPerformanceMetrics } = useDesignSystem();
  const metrics = getPerformanceMetrics();

  return (
    <div className="fixed bottom-4 right-4 bg-text-primary/80 text-text-inverse p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🎨 Design System DevTools</div>
      <div>Theme: {config.theme}</div>
      <div>Density: {config.density}</div>
      <div>Motion: {config.motion}</div>
      <div>Glassmorphism: {config.glassmorphism ? "✅" : "❌"}</div>
      <div className="mt-2 pt-2 border-t border-text-inverse/20">
        <div>Load Time: {metrics.loadTime.toFixed(0)}ms</div>
        <div>LCP: {metrics.lcp.toFixed(0)}ms</div>
        <div>FID: {metrics.fid.toFixed(2)}ms</div>
        <div>CLS: {metrics.cls.toFixed(4)}</div>
      </div>
    </div>
  );
};

export default DesignSystemProvider;
