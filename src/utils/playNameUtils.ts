import { normalizePlayName } from "./textNormalization";

import type { Play } from "../types/play";

export type PlayNameSource = {
  play_name?: string | null;
  one_word_play?: string | null;
  formation?: string | null;
  f_type?: string | null;
  f_dir?: string | null;
  back_align?: string | null;
  ftag1?: string | null;
  ftag2?: string | null;
  shift?: string | null;
  motion?: string | null;
  r_str?: string | null;
  p_str?: string | null;
  p_dir?: string | null;
  p_type?: string | null;
  protection?: string | null;
  p_tag1?: string | null;
  p_tag2?: string | null;
};

/**
 * Format a direction value according to the display format preference
 */
function formatDirection(
  value: string | undefined | null,
  format: "full" | "abbrev" | "letter" = "full"
): string {
  const val = (value || "").trim().toUpperCase();
  if (!val) return "";

  switch (format) {
    case "full":
      if (val === "R" || val === "RIGHT") return "Right";
      if (val === "L" || val === "LEFT") return "Left";
      return val;
    case "abbrev":
      if (val === "R" || val === "RIGHT") return "Rt";
      if (val === "L" || val === "LEFT") return "Lt";
      return val;
    case "letter":
      if (val === "R" || val === "RIGHT") return "R";
      if (val === "L" || val === "LEFT") return "L";
      return val;
    default:
      return val;
  }
}

/**
 * Format directions within a text string according to the display format preference
 */
function formatDirectionsInText(
  text: string | undefined | null,
  format: "full" | "abbrev" | "letter" = "full"
): string {
  if (!text) return "";

  // Split text into words and format any direction words
  return text
    .split(/\s+/)
    .map((word) => {
      const upperWord = word.toUpperCase();
      if (upperWord === "LEFT" || upperWord === "L" || upperWord === "LT") {
        return formatDirection("L", format);
      }
      if (upperWord === "RIGHT" || upperWord === "R" || upperWord === "RT") {
        return formatDirection("R", format);
      }
      return word;
    })
    .join(" ");
}

/**
 * Utility functions for play name generation
 */
function safe(value: string | undefined | null): string {
  return (value || "").trim();
}
function clean(value: string | undefined | null): string {
  const cleaned = safe(value);
  if (!cleaned) return "";
  // Preserve known all-caps abbreviations (<=4 chars and already all caps)
  if (/^[A-Z0-9]{1,4}$/.test(cleaned)) return cleaned.toUpperCase();
  // Proper-case each word while preserving single-letter tokens (e.g., "Z")
  return cleaned
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      if (/^[A-Z0-9]{1,3}$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
function normalize(value: string | undefined | null): string {
  return safe(value).toLowerCase();
}
/**
 * 🧠 Generates a human-readable play name.
 * Uses key offensive tags and formation fields for clarity.
 */
export function generatePlayName(play: PlayNameSource): string {
  if (!play || typeof play !== "object") return "[Untitled Play]";
  const oneWord = safe(play.one_word_play);
  if (oneWord) {
    return oneWord.toUpperCase();
  }
  return generateConcatenatedName(play);
}
/**
 * Generates the concatenated name from play parts
 */
export function generateConcatenatedName(play: PlayNameSource): string {
  const parts: string[] = [];
  // Formation and directional orientation
  const formation = clean(play.formation);
  const formDir = clean(play.f_dir);
  const suppressDir = ["River", "Lake", "East", "West"];
  if (formation) parts.push(formation);
  if (formDir && !suppressDir.includes(formation)) {
    parts.push(formDir);
  }
  // Formation tags - using the correct field names
  [play.ftag1, play.ftag2].forEach((tag) => {
    const val = clean(tag);
    if (val) parts.push(val);
  });
  // Alignment nuance
  if (normalize(play.back_align) === "near") {
    parts.push("Near");
  }
  // Motion / Shift / Action
  [play.shift, play.motion].forEach((key) => {
    const val = clean(key);
    if (val) parts.push(val);
  });
  // Protection (omit "half" protections)
  const protection = safe(play.protection);
  if (protection && !normalize(protection).includes("half")) {
    parts.push(clean(protection));
  }
  // Core play + direction
  const playCore = normalizePlayName(play.play_name || "");
  const playDir = clean(play.p_dir);
  if (playCore) parts.push(playCore);
  if (playDir) parts.push(playDir);
  // Post-snap tags
  [play.p_tag1, play.p_tag2].forEach((tag) => {
    const val = clean(tag);
    if (val) parts.push(val);
  });
  return parts.length > 0 ? parts.join(" ") : "[Untitled Play]";
}
/**
 * Plain name generation for fallback
 */
export function generatePlayNamePlain(play: Play): string {
  const name = play?.play_name?.trim() || "Unnamed";
  return name.toUpperCase();
}
/**
 * Gets the display name based on toggle state and optional field order
 */
export function getDisplayName(
  play: PlayNameSource,
  showOneWord: boolean,
  formationFieldOrder?: string[],
  playDetailsFieldOrder?: string[],
  directionDisplayFormat: "full" | "abbrev" | "letter" = "full"
): string {
  if (showOneWord) {
    const oneWord = safe(play.one_word_play);
    if (oneWord) return oneWord.toUpperCase();
  }

  // If field orders are provided, construct name from visible fields in that order
  if (formationFieldOrder || playDetailsFieldOrder) {
    const formationParts: string[] = [];
    const playParts: string[] = [];

    // Add formation fields in order
    if (formationFieldOrder) {
      formationFieldOrder.forEach((fieldKey) => {
        let value = "";
        switch (fieldKey) {
          case "formation":
            value = formatDirectionsInText(
              clean(play.formation),
              directionDisplayFormat
            );
            break;
          case "f_type":
            value = clean(play.f_type);
            break;
          case "f_dir":
            value = formatDirection(play.f_dir, directionDisplayFormat);
            break;
          case "back_align":
            value = clean(play.back_align);
            break;
          case "shift":
            value = clean(play.shift);
            break;
          case "motion":
            value = clean(play.motion);
            break;
          case "ftags":
            [play.ftag1, play.ftag2].forEach((tag) => {
              const val = clean(tag);
              if (val) formationParts.push(val);
            });
            return; // Skip adding empty
          case "r_str":
            value = clean(play.r_str);
            break;
          case "p_str":
            value = clean(play.p_str);
            break;
        }
        if (value) formationParts.push(value);
      });
    }

    // Add play details fields in order
    if (playDetailsFieldOrder) {
      playDetailsFieldOrder.forEach((fieldKey) => {
        let value = "";
        switch (fieldKey) {
          case "play_name":
            value = normalizePlayName(play.play_name || "");
            break;
          case "p_dir":
            value = formatDirection(play.p_dir, directionDisplayFormat);
            break;
          case "p_type":
            value = clean(play.p_type);
            break;
          case "protection":
            value = clean(play.protection);
            break;
          case "ptags":
            [play.p_tag1, play.p_tag2].forEach((tag) => {
              const val = clean(tag);
              if (val) playParts.push(val);
            });
            return; // Skip adding empty
          case "one_word_play":
            // Skip one_word_play as it's handled separately
            return;
        }
        if (value) playParts.push(value);
      });
    }

    // Combine formation and play parts
    const allParts = [...formationParts, ...playParts];
    if (allParts.length > 0) {
      return allParts.join(" ");
    }
  }

  return generatePlayName(play);
}
/**
 * Gets the secondary/subtitle text
 */
/**
 * Convert text to title case (capitalize first letter of each word)
 */
function toTitleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function getSubtitleText(play: Play, showOneWord: boolean): string {
  if (showOneWord && play.one_word_play) {
    // When showing one-word, show the full concatenated name underneath in title case
    return toTitleCase(generateConcatenatedName(play));
  }
  return "";
}
/**
 * Checks if play has one-word call
 */
export function hasOneWordPlay(play: Play): boolean {
  return Boolean(safe(play.one_word_play));
}
