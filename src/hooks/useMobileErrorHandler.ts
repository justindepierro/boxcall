/**
 * Mobile error handler hook - stub implementation
 */
export const useMobileErrorHandler = () => {
  return {
    errorState: null,
    handleError: (error: Error) => {
      console.error('Mobile error:', error);
    },
    clearError: () => {
      // Clear error state
    },
  };
};