/**
 * usePlayPreferences Hook
 * Manages user preferences for PlayList display
 */

import { usePreference } from "../../../../hooks/usePreferences";

export function usePlayPreferences() {
  const [showOneWordCalls, setShowOneWordCalls] = usePreference(
    "bc_playgrid_oneword",
    false
  );

  const [directionDisplayFormat, setDirectionDisplayFormat] = usePreference(
    "bc_playgrid_direction_format",
    "full" as "full" | "abbrev" | "letter"
  );

  return {
    showOneWordCalls,
    setShowOneWordCalls,
    directionDisplayFormat,
    setDirectionDisplayFormat,
  };
}
