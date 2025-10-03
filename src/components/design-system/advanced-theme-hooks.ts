/**
 * Advanced Theme Hooks
 * Separated from provider to avoid fast refresh warnings
 */
import React, { useContext } from "react";
import { AdvancedThemeContext } from "./AdvancedThemeProvider";

// Hook to use advanced theming
export function useAdvancedTheme() {
  const context = useContext(AdvancedThemeContext);
  if (!context) {
    throw new Error(
      "useAdvancedTheme must be used within an AdvancedThemeProvider"
    );
  }
  return context;
}

// Higher-order component for advanced theming
export function withAdvancedTheme<P extends object>(
  WrappedComponent: React.ComponentType<P & { theme: any }>
) {
  return function ThemedComponent(props: P) {
    const theme = useAdvancedTheme();
    return React.createElement(WrappedComponent, { ...props, theme });
  };
}