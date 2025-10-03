/**
 * Dev Mode Utilities
 * Separated utilities to avoid circular dependencies
 */
import type { DevMode } from "./dev-mode-types";

// Utility to validate dev mode
export function isValidDevMode(mode: string): boolean {
  const validModes: DevMode[] = [
    "production",
    "blank_slate",
    "test_as_head_coach",
    "test_as_coach",
    "test_as_player",
    "test_as_family",
  ];
  return validModes.includes(mode as DevMode);
}