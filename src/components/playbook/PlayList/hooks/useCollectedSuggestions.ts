/**
 * useCollectedSuggestions Hook
 * Collects unique suggestions from plays for inline editing
 */

import { useMemo } from "react";
import type { Play } from "../../../../types/play";
import type { PersonnelConfiguration } from "../../../../types/personnel";

interface UseCollectedSuggestionsProps {
  plays: Play[];
  personnelConfigurations: PersonnelConfiguration[];
}

interface CollectedSuggestions {
  formations: string[];
  playNames: string[];
  playTypes: string[];
  personnel: string[];
}

export function useCollectedSuggestions({
  plays,
  personnelConfigurations,
}: UseCollectedSuggestionsProps): CollectedSuggestions {
  return useMemo(() => {
    const formations = new Set<string>();
    const playNames = new Set<string>();
    const playTypes = new Set<string>();

    plays.forEach((play) => {
      if (play.formation) formations.add(play.formation);
      if (play.play_name) playNames.add(play.play_name);
      if (play.p_type) playTypes.add(play.p_type);
    });

    // Convert personnel configurations to suggestions
    const personnelSuggestions = personnelConfigurations.map(
      (config) => config.name
    );

    return {
      formations: Array.from(formations).sort(),
      playNames: Array.from(playNames).sort(),
      playTypes: Array.from(playTypes).sort(),
      personnel: personnelSuggestions,
    };
  }, [plays, personnelConfigurations]);
}
