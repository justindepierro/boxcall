/**
 * playDataStandardization.ts
 * Centralized, idempotent canonicalization + duplicate key + search doc helpers
 * for Play domain objects. Designed for reuse (UI, services, background tasks).
 */
import {
  normalizePlayName,
  normalizeText,
  normalizeFormation,
} from "./textNormalization";

import type { Play } from "../types/play";

/** Shape accepted for inbound (partial) play creation/update */
export type InboundPlay = Partial<
  Pick<
    Play,
    | "play_name"
    | "formation"
    | "one_word_play"
    | "p_type"
    | "personnel"
    | "f_type"
    | "f_dir"
    | "protection"
    | "p_dir"
    | "r_str"
    | "p_str"
    | "ftag1"
    | "ftag2"
    | "p_tag1"
    | "p_tag2"
    | "back_align"
    | "shift"
    | "motion"
    | "key_player1"
    | "key_player2"
    | "check_into"
    | "notes"
    | "confidence_base"
    | "times_called"
    | "times_successful"
    | "complexity_score"
    | "is_archived"
  >
>;

export interface CanonicalizedPlay {
  play_name: string; // canonical name
  formation: string;
  one_word_play: string;
  p_type: string;
  personnel: string;
  // unchanged optional fields - pass-through (still trimmed)
  [key: string]: unknown;
}

/**
 * Trim helper – safe access
 */
const safe = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Canonicalize any inbound play fields ensuring consistent storage.
 * Does NOT assign IDs or playbook IDs (service layer concern).
 */
export function canonicalizePlayInput(input: InboundPlay): CanonicalizedPlay {
  const canonical: CanonicalizedPlay = {
    play_name: normalizePlayName(safe(input.play_name) || "Untitled Play"),
    formation: normalizeFormation(safe(input.formation)),
    one_word_play: input.one_word_play
      ? normalizeText(safe(input.one_word_play))
      : "",
    p_type: safe(input.p_type) || "Pass",
    personnel: safe(input.personnel),
  } as CanonicalizedPlay;

  // Pass-through list (trim only)
  const passthroughKeys: (keyof InboundPlay)[] = [
    "f_type",
    "f_dir",
    "protection",
    "p_dir",
    "r_str",
    "p_str",
    "ftag1",
    "ftag2",
    "p_tag1",
    "p_tag2",
    "back_align",
    "shift",
    "motion",
    "key_player1",
    "key_player2",
    "check_into",
    "notes",
  ];
  for (const k of passthroughKeys) {
    const raw = input[k];
    if (typeof raw === "string") {
      (canonical as Record<string, unknown>)[k as string] = safe(raw);
    } else if (raw !== undefined) {
      (canonical as Record<string, unknown>)[k as string] = raw;
    }
  }

  // Numeric performance fields with sane defaults
  canonical.confidence_base =
    typeof input.confidence_base === "number" && input.confidence_base > 0
      ? Math.min(100, Math.max(1, input.confidence_base))
      : 70;
  canonical.times_called =
    typeof input.times_called === "number"
      ? Math.max(0, input.times_called)
      : 0;
  canonical.times_successful =
    typeof input.times_successful === "number"
      ? Math.max(0, input.times_successful)
      : 0;
  canonical.complexity_score =
    typeof input.complexity_score === "number"
      ? Math.min(5, Math.max(1, input.complexity_score))
      : 1;
  canonical.is_archived = Boolean(input.is_archived);

  return canonical;
}

/**
 * Duplicate key – stable identifier for dedupe within a playbook.
 * Lowercases to ensure case-insensitive uniqueness.
 */
export function computeDuplicateKey(play: {
  play_name?: string;
  formation?: string;
}): string {
  const name = normalizePlayName(safe(play.play_name)).toLowerCase();
  const formation = normalizeFormation(safe(play.formation)).toLowerCase();
  return `${name}::${formation}`; // formation included to allow same concept in different base sets if desired
}

/**
 * Build a lightweight search document (front-end or lightweight index usage).
 * NOTE: Server already has search_vector; this is for client-side fuzzy.
 */
export function buildPlaySearchDocument(play: Partial<Play>): string {
  const fields: (keyof Play)[] = [
    "play_name",
    "one_word_play",
    "formation",
    "p_type",
    "notes",
    "ftag1",
    "ftag2",
    "p_tag1",
    "p_tag2",
    "protection",
  ];
  return fields
    .map((f) => safe(play[f]))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * Validate canonical vs original for diagnostics.
 */
export function diffCanonical(
  original: InboundPlay,
  canonical: CanonicalizedPlay
) {
  const diffs: Record<string, string[]> = {};
  for (const key of Object.keys(canonical)) {
    const origVal = (original as Record<string, unknown>)[key];
    const canonVal = (canonical as Record<string, unknown>)[key];
    if (typeof origVal === "string" && typeof canonVal === "string") {
      if (origVal.trim() !== canonVal) {
        diffs[key] = [origVal, canonVal];
      }
    }
  }
  return diffs;
}

/**
 * Quick helper to prepare a play for creation (wraps canonicalizePlayInput).
 */
export function prepareForCreate(input: InboundPlay) {
  const canonical = canonicalizePlayInput(input);
  return { canonical, diffs: diffCanonical(input, canonical) };
}

/**
 * Merge canonical normalization into an existing full Play object.
 */
export function applyCanonicalToPlay(play: Play, updates: InboundPlay): Play {
  const { canonical } = prepareForCreate({ ...play, ...updates });
  return { ...play, ...canonical, updated_at: new Date() };
}

/**
 * Client-side in-memory index builder for quick duplicate detection.
 */
export function buildDuplicateIndex(
  plays: Pick<Play, "play_name" | "formation">[]
) {
  const index = new Set<string>();
  for (const p of plays) index.add(computeDuplicateKey(p));
  return index;
}

export function isDuplicate(dupIndex: Set<string>, candidate: InboundPlay) {
  return dupIndex.has(computeDuplicateKey(candidate));
}

/**
 * Minimal contract for search filtering (fuzzy pre-processing stage)
 */
export function createSearchFilter(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return (_doc: string) => true;
  const tokens = q.split(/\s+/);
  return (doc: string) => tokens.every((t) => doc.includes(t));
}
