import { readLocalJson, storageKeys, writeLocalJson } from "./storage";

export type PlayCardLayoutSection = "formation" | "playDetails";

export interface PlayCardLayoutPreferences {
  formationFieldOrder: string[];
  formationFieldVisibility: Record<string, boolean>;
  playDetailsFieldOrder: string[];
  playDetailsFieldVisibility: Record<string, boolean>;
}

type StoredLayout = Partial<PlayCardLayoutPreferences>;

function safeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((x) => typeof x === "string") as string[];
  return strings.length > 0 ? strings : [];
}

function safeBooleanRecord(
  value: unknown
): Record<string, boolean> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const out: Record<string, boolean> = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "boolean") out[key] = obj[key] as boolean;
  }
  return out;
}

/**
 * Reads per-play layout preferences from localStorage.
 *
 * This is intentionally per-play (keyed by play.id) so visibility toggles and
 * field ordering changes only affect the specific play card.
 *
 * For migration/back-compat, if per-play values are missing we fall back to the
 * existing global preference keys (still in localStorage due to usePreference).
 */
export function getPlayCardLayoutPreferences(
  playId: string
): StoredLayout | null {
  try {
    const parsed = readLocalJson<StoredLayout>(
      storageKeys.plays.cardLayoutForPlay(playId)
    );

    if (!parsed) {
      // Migration fallback: read global (legacy) visibility preferences if present.
      const globalFormationVisibility = readLocalJson<Record<string, boolean>>(
        storageKeys.preferences.formationFieldVisibility
      );
      const globalPlayDetailsVisibility = readLocalJson<
        Record<string, boolean>
      >(storageKeys.preferences.playDetailsFieldVisibility);

      const fallback: StoredLayout = {};
      if (globalFormationVisibility)
        fallback.formationFieldVisibility = globalFormationVisibility;
      if (globalPlayDetailsVisibility)
        fallback.playDetailsFieldVisibility = globalPlayDetailsVisibility;

      return Object.keys(fallback).length > 0 ? fallback : null;
    }

    const cleaned: StoredLayout = {
      formationFieldOrder: safeStringArray(parsed.formationFieldOrder),
      formationFieldVisibility: safeBooleanRecord(
        parsed.formationFieldVisibility
      ),
      playDetailsFieldOrder: safeStringArray(parsed.playDetailsFieldOrder),
      playDetailsFieldVisibility: safeBooleanRecord(
        parsed.playDetailsFieldVisibility
      ),
    };

    return cleaned;
  } catch {
    return null;
  }
}

export function patchPlayCardLayoutPreferences(
  playId: string,
  patch: StoredLayout
): StoredLayout {
  const current = getPlayCardLayoutPreferences(playId) ?? {};
  const next: StoredLayout = {
    ...current,
    ...patch,
  };

  try {
    writeLocalJson(storageKeys.plays.cardLayoutForPlay(playId), next);
  } catch {
    /* ignore */
  }

  return next;
}
