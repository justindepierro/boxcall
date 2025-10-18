/**
 * Formation Direction Detection Utility
 *
 * Detects when users accidentally include direction keywords (Left, Right, Lt, Rt, R, L)
 * in the formation name field instead of using the separate f_dir selector.
 *
 * This keeps formation names clean and ensures consistent data structure.
 */

export interface DirectionDetectionResult {
  hasDirection: boolean;
  detectedDirection: "R" | "L" | null;
  suggestedFormationName: string; // Formation name with direction removed
  originalInput: string;
  directionKeyword: string | null; // The actual keyword found (e.g., "Right", "Rt")
}

/**
 * Detect if a formation name contains direction keywords
 *
 * Patterns detected (multi-word names only):
 * - "Trips Right" → direction: R, name: "Trips"
 * - "Twins Lt" → direction: L, name: "Twins"
 * - "I Form R" → direction: R, name: "I Form"
 * - "Bunch Left" → direction: L, name: "Bunch"
 * - "Right Slot" → direction: R, name: "Slot"
 *
 * Allowed (single-word formations):
 * - "Right" → No warning (legitimate formation name like "Rip"/"Liz")
 * - "Left" → No warning (legitimate formation name)
 * - "East" → No warning (directional formation)
 * - "West" → No warning (directional formation)
 *
 * @param formationName - Raw formation name input from user
 * @returns Detection result with suggestions
 */
export function detectDirectionInFormationName(
  formationName: string
): DirectionDetectionResult {
  if (!formationName || formationName.trim() === "") {
    return {
      hasDirection: false,
      detectedDirection: null,
      suggestedFormationName: "",
      originalInput: formationName,
      directionKeyword: null,
    };
  }

  const trimmed = formationName.trim();
  const lower = trimmed.toLowerCase();

  // IMPORTANT: If it's just a single word like "Right" or "Left", don't flag it
  // These could be legitimate formation names (like "Rip", "Liz", "East", "West")
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount === 1) {
    return {
      hasDirection: false,
      detectedDirection: null,
      suggestedFormationName: trimmed,
      originalInput: trimmed,
      directionKeyword: null,
    };
  }

  // Pattern 1: Check for "Right" variations at the end (only if multi-word)
  const rightPatterns = [
    { pattern: /\s+(right)$/i, keyword: "Right" },
    { pattern: /\s+(rt)$/i, keyword: "Rt" },
    { pattern: /\s+(r)$/i, keyword: "R" },
  ];

  for (const { pattern, keyword } of rightPatterns) {
    if (pattern.test(trimmed)) {
      const cleanName = trimmed.replace(pattern, "").trim();
      return {
        hasDirection: true,
        detectedDirection: "R",
        suggestedFormationName: cleanName,
        originalInput: trimmed,
        directionKeyword: keyword,
      };
    }
  }

  // Pattern 2: Check for "Left" variations at the end (only if multi-word)
  const leftPatterns = [
    { pattern: /\s+(left)$/i, keyword: "Left" },
    { pattern: /\s+(lt)$/i, keyword: "Lt" },
    { pattern: /\s+(l)$/i, keyword: "L" },
  ];

  for (const { pattern, keyword } of leftPatterns) {
    if (pattern.test(trimmed)) {
      const cleanName = trimmed.replace(pattern, "").trim();
      return {
        hasDirection: true,
        detectedDirection: "L",
        suggestedFormationName: cleanName,
        originalInput: trimmed,
        directionKeyword: keyword,
      };
    }
  }

  // Pattern 3: Check for direction words at the START (only if multi-word)
  // e.g., "Right Slot" or "Left Wing"
  if (lower.startsWith("right ") || lower.startsWith("rt ") || lower.startsWith("r ")) {
    const match = trimmed.match(/^(right|rt|r)\s+(.+)/i);
    if (match) {
      return {
        hasDirection: true,
        detectedDirection: "R",
        suggestedFormationName: match[2].trim(),
        originalInput: trimmed,
        directionKeyword: match[1],
      };
    }
  }

  if (lower.startsWith("left ") || lower.startsWith("lt ") || lower.startsWith("l ")) {
    const match = trimmed.match(/^(left|lt|l)\s+(.+)/i);
    if (match) {
      return {
        hasDirection: true,
        detectedDirection: "L",
        suggestedFormationName: match[2].trim(),
        originalInput: trimmed,
        directionKeyword: match[1],
      };
    }
  }

  // No direction detected
  return {
    hasDirection: false,
    detectedDirection: null,
    suggestedFormationName: trimmed,
    originalInput: trimmed,
    directionKeyword: null,
  };
}

/**
 * Generate a user-friendly warning message
 *
 * @param result - Detection result from detectDirectionInFormationName
 * @returns User-friendly message explaining the issue
 */
export function getDirectionWarningMessage(result: DirectionDetectionResult): string {
  if (!result.hasDirection) return "";

  const directionLabel = result.detectedDirection === "R" ? "Right" : "Left";

  return `It looks like you included "${result.directionKeyword}" in the formation name. 
  
For better organization, we recommend:
• Formation Name: "${result.suggestedFormationName}"
• Direction: ${directionLabel} (use the direction selector)

This keeps your playbook data clean and makes it easier to flip plays.`;
}

/**
 * Check if a formation name is likely valid (doesn't contain direction keywords)
 *
 * @param formationName - Formation name to validate
 * @returns True if valid, false if it contains direction keywords
 */
export function isValidFormationName(formationName: string): boolean {
  const result = detectDirectionInFormationName(formationName);
  return !result.hasDirection;
}
