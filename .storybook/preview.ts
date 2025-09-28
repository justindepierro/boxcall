import type { Preview } from "@storybook/react-vite";
import React from "react";
// import '../src/index.css'; // Import global styles including Tailwind CSS - commented out for Storybook
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "../src/components/ui/Toast";
import { ConfirmProvider } from "../src/contexts/ConfirmContext";
import { UndoQueueProvider } from "../src/contexts/UndoQueueContext";
import { TelemetryProvider } from "../src/telemetry/context";
import { RoleProvider } from "../src/hooks/useRoles";
import { queryClient } from "../src/app/queryClient";
import { ErrorBoundary } from "../src/components/ui/ErrorBoundary";

// Storybook wrapper with all necessary providers
const StorybookProviders = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ErrorBoundary, null,
    React.createElement(TelemetryProvider, null,
      React.createElement(QueryClientProvider, { client: queryClient },
        React.createElement(BrowserRouter, null,
          React.createElement(ToastProvider, null,
            React.createElement(ConfirmProvider, null,
              React.createElement(UndoQueueProvider, null,
                React.createElement(RoleProvider, null, children)
              )
            )
          )
        )
      )
    )
  );

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (Story: any) => React.createElement(StorybookProviders, null, React.createElement(Story)),
  ],
};

export default preview;
