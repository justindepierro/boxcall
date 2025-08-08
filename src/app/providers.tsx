import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { AuthProvider } from "../components/auth/AuthProvider";
import { queryClient } from "./queryClient";
interface AppProvidersProps {
  children: ReactNode;
}
/**
 * AppProviders wraps the entire application with necessary providers
 * - React Query for server state management
 * - Auth Provider for authentication state management
 * - Error Boundaries for graceful error handling
 * - Zustand store is global and doesn't need a provider
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        {/* React Query Devtools will be added when we install the devtools package */}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
