/**
 * Lazy-loaded components for progressive loading
 *
 * Components that are not critical for initial page load are lazy-loaded
 * to improve initial bundle size and loading performance.
 */

import { lazy } from "react";

// Lazy load advanced features that aren't needed immediately
export const LazyAISuggestionsPanel = lazy(() =>
  import("../components/AISuggestionsPanel").then((module) => ({
    default: module.AISuggestionsPanel,
  }))
);

export const LazyRoutePropertiesPanel = lazy(() =>
  import("../components/RoutePropertiesPanel").then((module) => ({
    default: module.RoutePropertiesPanel,
  }))
);

export const LazyPlayerPropertiesPanel = lazy(() =>
  import("../components/PlayerPropertiesPanel").then((module) => ({
    default: module.PlayerPropertiesPanel,
  }))
);

export const LazyHelpOverlay = lazy(() =>
  import("../components/HelpOverlay").then((module) => ({
    default: module.HelpOverlay,
  }))
);

export const LazyTipsOverlay = lazy(() =>
  import("../components/TipsOverlay").then((module) => ({
    default: module.TipsOverlay,
  }))
);

export const LazyAuroraFieldPresets = lazy(() =>
  import("../components/AuroraFieldPresets").then((module) => ({
    default: module.AuroraFieldPresets,
  }))
);

// Loading fallback component
export const LoadingFallback = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
    <span className="ml-2 text-sm text-secondary">Loading...</span>
  </div>
);

// Error boundary for lazy-loaded components
import React, { Component } from "react";
import type { ReactNode } from "react";

interface LazyErrorBoundaryState {
  hasError: boolean;
}

interface LazyErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class LazyErrorBoundary extends Component<
  LazyErrorBoundaryProps,
  LazyErrorBoundaryState
> {
  constructor(props: LazyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): LazyErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Lazy loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-4 text-error-600">
            <span>Failed to load component</span>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
