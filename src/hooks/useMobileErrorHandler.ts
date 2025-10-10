/**
 * Mobile error handler hook - stub implementation
 */
export interface MobileErrorState {
  type: "network" | "timeout" | "server" | "generic";
  title: string;
  message: string;
}

export const useMobileErrorHandler = () => {
  return {
    errorState: null as MobileErrorState | null,
    handleError: (error: Error) => {
      console.error("Mobile error:", error);
    },
    clearError: () => {
      // Clear error state
    },
  };
};
