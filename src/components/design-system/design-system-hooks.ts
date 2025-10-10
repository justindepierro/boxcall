/**
 * Design System Hooks
 * Separated from provider to avoid fast refresh warnings
 */
import React, { useContext, useEffect } from "react";
import { DesignSystemContext } from "./DesignSystemProvider";

// Custom hook for using design system
export const useDesignSystem = () => {
  const context = useContext(DesignSystemContext);
  if (!context) {
    throw new Error(
      "useDesignSystem must be used within a DesignSystemProvider"
    );
  }
  return context;
};

// Higher-order component for design system compliance
export const withDesignSystem = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  const WrappedComponent = (props: P) => {
    const { trackUsage } = useDesignSystem();

    useEffect(() => {
      trackUsage({
        component: componentName,
        page: window.location.pathname,
        timestamp: Date.now(),
      });
    }, [trackUsage]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withDesignSystem(${componentName})`;
  return WrappedComponent;
};
