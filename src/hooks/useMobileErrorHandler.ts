import { useCallback, useState } from "react";

export type MobileErrorType = "generic" | "network" | "timeout";

export type MobileErrorState = {
  type: MobileErrorType;
  title?: string;
  message: string;
};

export function useMobileErrorHandler() {
  const [errorState, setErrorState] = useState<MobileErrorState | null>(null);

  const handleError = useCallback((error: unknown) => {
    let message = "An unexpected error occurred";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    // Keep the mapping simple and non-invasive
    const isNetworkish =
      message.toLowerCase().includes("network") ||
      message.toLowerCase().includes("failed to fetch") ||
      message.toLowerCase().includes("offline");

    const isTimeoutish =
      message.toLowerCase().includes("timeout") ||
      message.toLowerCase().includes("timed out");

    let type: MobileErrorType = "generic";
    if (isTimeoutish) {
      type = "timeout";
    } else if (isNetworkish) {
      type = "network";
    }

    let title = "Something went wrong";
    if (type === "network") {
      title = "Connection issue";
    } else if (type === "timeout") {
      title = "Request timed out";
    }

    setErrorState({
      type,
      title,
      message,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return { errorState, handleError, clearError };
}
