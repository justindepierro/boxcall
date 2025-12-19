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

function applyNameMatchingScore(params: {
  playFormationNormalized: string;
  playFormationSanitized: string;
  formationNameNormalized: string;
  formationNameSanitized: string;
  score: number;
  reasons: string[];
}): number {
  const {
    playFormationNormalized,
    playFormationSanitized,
    formationNameNormalized,
    formationNameSanitized,
    reasons,
  } = params;

  let { score } = params;
  if (!playFormationNormalized || !formationNameNormalized) return score;

  if (playFormationNormalized === formationNameNormalized) {
    score += 6;
    reasons.push("Exact name match");
    return score;
  }

  if (
    playFormationNormalized.includes(formationNameNormalized) ||
    formationNameNormalized.includes(playFormationNormalized)
  ) {
    score += 3;
    reasons.push("Similar name");
    return score;
  }

  if (
    playFormationSanitized &&
    formationNameSanitized &&
    playFormationSanitized.includes(formationNameSanitized)
  ) {
    score += 2;
    reasons.push("Partial name match");
  }

  return score;
}

function applyPersonnelMatchingScore(params: {
  playPersonnel: string;
  formationPersonnel: string;
  formationPersonnelName: string | null | undefined;
  score: number;
  reasons: string[];
}): number {
  const { playPersonnel, formationPersonnel, formationPersonnelName, reasons } =
    params;
  let { score } = params;

  if (!playPersonnel || !formationPersonnel) return score;

  if (playPersonnel === formationPersonnel) {
    score += 3;
    reasons.push(`${formationPersonnelName} personnel`);
    return score;
  }

  if (
    playPersonnel.includes(formationPersonnel) ||
    formationPersonnel.includes(playPersonnel)
  ) {
    score += 1;
    reasons.push("Personnel overlap");
  }

  return score;
}

function applyDirectionMatchingScore(params: {
  playDirection: string;
  formationDirection: string;
  formationDirectionLabel: string | null | undefined;
  score: number;
  reasons: string[];
}): number {
  const {
    playDirection,
    formationDirection,
    formationDirectionLabel,
    reasons,
  } = params;
  let { score } = params;

  if (!playDirection || !formationDirection) return score;
  if (!playDirection.startsWith(formationDirection)) return score;

  score += 1;
  reasons.push(`${formationDirectionLabel} side`);
  return score;
}

function getRecentCombos(params: {
  formation: Formation;
  formationNameNormalized: string;
  combosByFormationId: Map<string, PlayCombo[]>;
  combosByName: Map<string, PlayCombo[]>;
}): PlayCombo[] {
  const {
    formation,
    formationNameNormalized,
    combosByFormationId,
    combosByName,
  } = params;

  return [
    ...(formation.id ? (combosByFormationId.get(formation.id) ?? []) : []),
    ...(formationNameNormalized
      ? (combosByName.get(formationNameNormalized) ?? [])
      : []),
  ];
}

function applyRecentComboScore(params: {
  recentCombos: PlayCombo[];
  playPersonnel: string;
  playType: string;
  score: number;
  reasons: string[];
  sanitize: (value?: string | null) => string;
}): number {
  const { recentCombos, playPersonnel, playType, reasons, sanitize } = params;
  let { score } = params;

  if (recentCombos.length === 0) return score;
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

  return score;
}

function applyUsageScore(formation: Formation, score: number): number {
  if (formation.usage_count > 0) {
    return score + Math.min(2, Math.floor(formation.usage_count / 25));
  }
  return score;
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

    score = applyNameMatchingScore({
      playFormationNormalized,
      playFormationSanitized,
      formationNameNormalized,
      formationNameSanitized,
      score,
      reasons,
    });
    score = applyPersonnelMatchingScore({
      playPersonnel,
      formationPersonnel,
      formationPersonnelName: formation.personnel_name,
      score,
      reasons,
    });
    score = applyDirectionMatchingScore({
      playDirection,
      formationDirection,
      formationDirectionLabel: formation.direction,
      score,
      reasons,
    });

    const recentCombos = getRecentCombos({
      formation,
      formationNameNormalized,
      combosByFormationId,
      combosByName,
    });
    score = applyRecentComboScore({
      recentCombos,
      playPersonnel,
      playType,
      score,
      reasons,
      sanitize,
    });

    score = applyUsageScore(formation, score);

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
