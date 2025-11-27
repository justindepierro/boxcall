/**
 * Formation Direction Detection
 *
 * Detects direction keywords in formation names to help users separate
 * formation names from play directions.
 */

export interface DirectionDetectionResult {
  hasDirection: boolean;
  detectedDirection: "L" | "R" | null;
  suggestedFormationName?: string;
  directionKeyword?: string;
}

export function detectDirectionInFormationName(
  name: string
): DirectionDetectionResult {
  if (!name || typeof name !== "string") {
    return {
      hasDirection: false,
      detectedDirection: null,
      suggestedFormationName: "",
    };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return {
      hasDirection: false,
      detectedDirection: null,
      suggestedFormationName: "",
    };
  }

  // Single-word formations should NOT trigger direction detection
  // But should return the original name as suggestedFormationName
  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    return {
      hasDirection: false,
      detectedDirection: null,
      suggestedFormationName: trimmed,
    };
  }

  // Check for direction keywords in multi-word formations
  const lowerWords = words.map((w) => w.toLowerCase());

  for (let i = 0; i < lowerWords.length; i++) {
    const word = lowerWords[i];

    if (word === "left" || word === "lt" || word === "l") {
      const otherWords = [...words];
      const directionKeyword = otherWords.splice(i, 1)[0];
      return {
        hasDirection: true,
        detectedDirection: "L",
        suggestedFormationName: otherWords.join(" ").trim(),
        directionKeyword,
      };
    }

    if (word === "right" || word === "rt" || word === "r") {
      const otherWords = [...words];
      const directionKeyword = otherWords.splice(i, 1)[0];
      return {
        hasDirection: true,
        detectedDirection: "R",
        suggestedFormationName: otherWords.join(" ").trim(),
        directionKeyword,
      };
    }
  }

  // Multi-word without direction keywords
  return {
    hasDirection: false,
    detectedDirection: null,
    suggestedFormationName: trimmed,
  };
}

export function validateFormationDirection(_direction: string): boolean {
  return true;
}
