/**
 * usePlayCardContext Hook
 *
 * Custom hooks for accessing PlayCard context.
 * Separated from provider to satisfy Fast Refresh requirements.
 */

import { useContext } from "react";
import { PlayCardContext, type PlayCardContextValue } from "./PlayCardContext";

/**
 * Access the PlayCard context value.
 * Throws if used outside of PlayCardProvider.
 */
export function usePlayCardContext(): PlayCardContextValue {
  const context = useContext(PlayCardContext);
  if (!context) {
    throw new Error(
      "usePlayCardContext must be used within a PlayCardProvider"
    );
  }
  return context;
}

/**
 * Optional hook that returns null instead of throwing
 * when used outside of PlayCardProvider.
 */
export function useOptionalPlayCardContext(): PlayCardContextValue | null {
  return useContext(PlayCardContext);
}
