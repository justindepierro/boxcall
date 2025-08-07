/**
 * Mobile error handling hook for production-ready error management
 * Part of Phase 3A: Critical Performance & Error Handling
 */
import React from "react";
import type { MobileErrorStateProps } from "../components/ui/MobileErrorState";

// Hook for handling common error states in mobile components
export const useMobileErrorHandler = () => {
  const [errorState, setErrorState] = React.useState<{
    type: MobileErrorStateProps["type"];
    title?: string;
    message?: string;
  } | null>(null);

  const handleError = React.useCallback((error: Error) => {
    // Determine error type based on error characteristics
    if (error.message.includes("network") || error.message.includes("fetch")) {
      setErrorState({
        type: "network",
        message: "Unable to connect. Please check your internet connection.",
      });
    } else if (error.message.includes("timeout")) {
      setErrorState({
        type: "timeout",
        message: "Request is taking too long. Please try again.",
      });
    } else if (
      error.message.includes("server") ||
      error.message.includes("500")
    ) {
      setErrorState({
        type: "server",
        message: "Server is temporarily unavailable. Please try again later.",
      });
    } else {
      setErrorState({
        type: "generic",
        message: error.message || "An unexpected error occurred.",
      });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setErrorState(null);
  }, []);

  const retry = React.useCallback(() => {
    clearError();
    // Return a promise to allow chaining with retry logic
    return Promise.resolve();
  }, [clearError]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
    hasError: errorState !== null,
  };
};
