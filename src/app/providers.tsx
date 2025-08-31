import { QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../components/auth/AuthProvider";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { ToastProvider } from "../components/ui/Toast";
import { ConfirmProvider } from "../contexts/ConfirmContext";
import { UndoQueueProvider } from "../contexts/UndoQueueContext";
import { TelemetryProvider } from "../telemetry/context";
import { RoleProvider } from "../hooks/useRoles";

import { queryClient } from "./queryClient";

import type { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}
/**
 * AppProviders wraps the entire application with necessary providers
 * - React Query for server state management
 * - Auth Provider for authentication state management
 * - Role Provider for unified role and permission management
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
            <ConfirmProvider>
              <UndoQueueProvider>
                <AuthProvider>
                  <RoleProvider>{children}</RoleProvider>
                </AuthProvider>
              </UndoQueueProvider>
            </ConfirmProvider>
          </ToastProvider>
          {/* React Query Devtools will be added when we install the devtools package */}
        </QueryClientProvider>
      </TelemetryProvider>
    </ErrorBoundary>
  );
}
