/**
 * Network status hook - stub implementation
 */
export const useNetworkStatus = () => {
  return {
    isOnline: true,
    connectionType: "wifi" as const,
    isSlowConnection: false,
  };
};
