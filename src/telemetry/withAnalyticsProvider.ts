import { createElement } from "react";

import { AnalyticsProvider } from "./AnalyticsProvider";

export function withAnalyticsProvider<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    enableInDevelopment?: boolean;
    customProperties?: Record<string, any>;
  }
) {
  return function WrappedComponent(props: P) {
    return createElement(AnalyticsProvider, {
      config: options,
      children: createElement(Component, props),
    });
  };
}
