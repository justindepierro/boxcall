import { useCallback } from "react";

import { useUI } from "../app/store";
import { logError, warn } from "./logger";
/**
 * Error handler hook for consistent error handling across the application
 */
export function useErrorHandler() {
  const { addNotification } = useUI();
  const handleError = useCallback(
    (error: Error | string, context?: string) => {
      const errorMessage = typeof error === "string" ? error : error.message;
      const title = context ? `Error in ${context}` : "Application Error";
      // Log error to console for debugging
      logError("Error handled:", { error, context });
      // Add error notification to the UI
      addNotification({
        type: "error",
        title,
        message: errorMessage,
      });
    },
    [addNotification]
  );
  const handleWarning = useCallback(
    (warning: string, context?: string) => {
      const title = context ? `Warning in ${context}` : "Warning";
      warn("Warning handled:", { warning, context });
      addNotification({
        type: "warning",
        title,
        message: warning,
      });
    },
    [addNotification]
  );
  const handleSuccess = useCallback(
    (message: string, context?: string) => {
      const title = context ? `Success in ${context}` : "Success";
      addNotification({
        type: "success",
        title,
        message,
      });
    },
    [addNotification]
  );
  return {
    handleError,
    handleWarning,
    handleSuccess,
  };
}
