import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { ToastProvider } from "../components/ui/Toast";
import { queryClient } from "./queryClient";
import { ConfirmProvider } from "../contexts/ConfirmContext";
import { UndoQueueProvider } from "../contexts/UndoQueueContext";
import { TelemetryProvider } from "../telemetry/context";
import { RoleProvider } from "../hooks/useRoles";
interface AppProvidersProps {
  children: ReactNode;
}
/**
 * AppProviders wraps the entire application with necessary providers
 * - React Query for server state management
 * - Role Provider for role and permission management
 * - Toast Provider for notifications
 * - Error Boundaries for graceful error handling
 * - Zustand auth store is global and doesn't need a provider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <TelemetryProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <ConfirmProvider>
              <UndoQueueProvider>
                <RoleProvider>{children}</RoleProvider>
              </UndoQueueProvider>
            </ConfirmProvider>
          </ToastProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </TelemetryProvider>
    </ErrorBoundary>
  );
}
