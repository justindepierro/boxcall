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
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "An unexpected error occurred";

    // Keep the mapping simple and non-invasive
    const isNetworkish =
      message.toLowerCase().includes("network") ||
      message.toLowerCase().includes("failed to fetch") ||
      message.toLowerCase().includes("offline");

    const isTimeoutish =
      message.toLowerCase().includes("timeout") ||
      message.toLowerCase().includes("timed out");

    const type: MobileErrorType = isTimeoutish
      ? "timeout"
      : isNetworkish
        ? "network"
        : "generic";

    setErrorState({
      type,
      title:
        type === "network"
          ? "Connection issue"
          : type === "timeout"
            ? "Request timed out"
            : "Something went wrong",
      message,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return { errorState, handleError, clearError };
}
