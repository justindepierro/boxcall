import { useMemo } from "react";
import type { Play } from "../../../types/play";
import type { Formation } from "../../../types/formation";
import type { PlayCombo } from "../../../hooks/useRecentPlayCombos";

export interface FormationSuggestion {
  formation: Formation;
  score: number;
  reasons: string[];
}

interface UseFormationSuggestionsParams {
  plays: Play[];
  formationCatalog: Formation[];
  combos: PlayCombo[];
}

export function useFormationSuggestions({
  plays,
  formationCatalog,
  combos,
}: UseFormationSuggestionsParams): Map<string, FormationSuggestion[]> {
  return useMemo(() => {
    if (plays.length === 0 || formationCatalog.length === 0) {
      return new Map<string, FormationSuggestion[]>();
    }

    const sanitize = (value?: string | null) =>
      (value || "").trim().toLowerCase();
    const normalize = (value?: string | null) =>
      sanitize(value).replace(/[^a-z0-9]/g, "");

    const combosByFormationId = new Map<string, PlayCombo[]>();
    const combosByName = new Map<string, PlayCombo[]>();

    combos.forEach((combo) => {
      if (combo.formationId) {
        const bucket = combosByFormationId.get(combo.formationId) ?? [];
        bucket.push(combo);
        combosByFormationId.set(combo.formationId, bucket);
      }

      const normalizedName = normalize(combo.formation);
      if (normalizedName) {
        const bucket = combosByName.get(normalizedName) ?? [];
        bucket.push(combo);
        combosByName.set(normalizedName, bucket);
      }
    });

    return plays.reduce((map, play) => {
      const suggestions = calculateSuggestionsForPlay(
        play,
        formationCatalog,
        combosByFormationId,
        combosByName,
        sanitize,
        normalize
      );

      map.set(play.id, suggestions.slice(0, 3));
      return map;
    }, new Map<string, FormationSuggestion[]>());
  }, [plays, formationCatalog, combos]);
}

function calculateSuggestionsForPlay(
  play: Play,
  formationCatalog: Formation[],
  combosByFormationId: Map<string, PlayCombo[]>,
  combosByName: Map<string, PlayCombo[]>,
  sanitize: (value?: string | null) => string,
  normalize: (value?: string | null) => string
): FormationSuggestion[] {
  const playFormationNormalized = normalize(play.formation);
  const playFormationSanitized = sanitize(play.formation);
  const playPersonnel = sanitize(play.personnel);
  const playType = sanitize(play.p_type);
  const playDirection = sanitize(
    play.f_dir || (play.formation_direction as string | undefined)
  );

  const suggestions: FormationSuggestion[] = [];

  formationCatalog.forEach((formation) => {
    const formationNameNormalized = normalize(formation.name);
    const formationNameSanitized = sanitize(formation.name);
    const formationPersonnel = sanitize(formation.personnel_name);
    const formationDirection = sanitize(formation.direction);

    let score = 0;
    const reasons: string[] = [];

    // Name matching
    if (playFormationNormalized && formationNameNormalized) {
      if (playFormationNormalized === formationNameNormalized) {
        score += 6;
        reasons.push("Exact name match");
      } else if (
        playFormationNormalized.includes(formationNameNormalized) ||
        formationNameNormalized.includes(playFormationNormalized)
      ) {
        score += 3;
        reasons.push("Similar name");
      } else if (
        playFormationSanitized &&
        formationNameSanitized &&
        playFormationSanitized.includes(formationNameSanitized)
      ) {
        score += 2;
        reasons.push("Partial name match");
      }
    }

    // Personnel matching
    if (playPersonnel && formationPersonnel) {
      if (playPersonnel === formationPersonnel) {
        score += 3;
        reasons.push(`${formation.personnel_name} personnel`);
      } else if (
        playPersonnel.includes(formationPersonnel) ||
        formationPersonnel.includes(playPersonnel)
      ) {
        score += 1;
        reasons.push("Personnel overlap");
      }
    }

    // Direction matching
    if (playDirection && formationDirection) {
      if (playDirection.startsWith(formationDirection)) {
        score += 1;
        reasons.push(`${formation.direction} side`);
      }
    }

    // Recent combo matching
    const recentCombos = [
      ...(formation.id ? (combosByFormationId.get(formation.id) ?? []) : []),
      ...(formationNameNormalized
        ? (combosByName.get(formationNameNormalized) ?? [])
        : []),
    ];

    if (recentCombos.length > 0) {
      score += 2;
      reasons.push("Recent pick");
      if (
        playPersonnel &&
        recentCombos.some((combo) => sanitize(combo.personnel) === playPersonnel)
      ) {
        score += 1;
      }
      if (
        playType &&
        recentCombos.some((combo) => sanitize(combo.playType) === playType)
      ) {
        score += 1;
      }
    }

    // Usage count bonus
    if (formation.usage_count > 0) {
      score += Math.min(2, Math.floor(formation.usage_count / 25));
    }

    if (score > 0) {
      suggestions.push({
        formation,
        score,
        reasons,
      });
    }
  });

  suggestions.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.formation.usage_count ?? 0) - (a.formation.usage_count ?? 0);
  });

  return suggestions;
}
