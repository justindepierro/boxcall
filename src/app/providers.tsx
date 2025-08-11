import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { AuthProvider } from "../components/auth/AuthProvider";
import { ToastProvider } from "../components/ui/Toast";
import { queryClient } from "./queryClient";
import { TelemetryProvider } from "../telemetry/context";
interface AppProvidersProps {
  children: ReactNode;
}
/**
 * AppProviders wraps the entire application with necessary providers
 * - React Query for server state management
 * - Auth Provider for authentication state management
 * - Toast Provider for notifications
 * - Error Boundaries for graceful error handling
 * - Zustand store is global and doesn't need a provider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <TelemetryProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
          {/* React Query Devtools will be added when we install the devtools package */}
        </QueryClientProvider>
      </TelemetryProvider>
    </ErrorBoundary>
  );
}
