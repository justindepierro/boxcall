/**
 * Text Normalization Utilities for PlayBuilder
 * Ensures consistent data entry regardless of user input style
 */

/**
 * Normalizes text input for consistent storage
 * DEUCE = Deuce = deuce = DeuCE → "Deuce"
 */
export const normalizeText = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars except hyphens
    .replace(/\s+/g, " ") // Normalize whitespace
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Normalizes play names with special handling for common football terms
 */
export const normalizePlayName = (input: string): string => {
  if (!input) return "";

  const normalized = normalizeText(input);

  // Special cases for common football terms
  const footballTerms: Record<string, string> = {
    Pa: "PA", // Play Action
    Rpo: "RPO", // Run-Pass Option
    Hb: "HB", // Halfback
    Fb: "FB", // Fullback
    Qb: "QB", // Quarterback
    Wr: "WR", // Wide Receiver
    Te: "TE", // Tight End
    Rb: "RB", // Running Back
  };

  return normalized.replace(
    /\b(Pa|Rpo|Hb|Fb|Qb|Wr|Te|Rb)\b/g,
    (match) => footballTerms[match] || match
  );
};

/**
 * Normalizes formation names with football-specific rules
 */
export const normalizeFormation = (input: string): string => {
  if (!input) return "";

  const normalized = normalizeText(input);

  // Common formation normalizations
  const formationMap: Record<string, string> = {
    Gun: "Shotgun",
    "I Form": "I-Form",
    Iform: "I-Form",
    "Single Back": "Singleback",
    Singleback: "Singleback",
    "Empty Set": "Empty",
    "Wild Cat": "Wildcat",
  };

  return formationMap[normalized] || normalized;
};

/**
 * Normalizes personnel packages (11, 12, 21, etc.)
 */
export const normalizePersonnel = (input: string): string => {
  if (!input) return "";

  // Extract just the numbers if it's a full description
  const match = input.match(/^(\d{2})/);
  if (match) {
    const numbers = match[1];
    const descriptions: Record<string, string> = {
      "11": "11 Personnel (3 WR, 1 TE, 1 RB)",
      "12": "12 Personnel (2 WR, 2 TE, 1 RB)",
      "10": "10 Personnel (4 WR, 0 TE, 1 RB)",
      "21": "21 Personnel (2 WR, 1 TE, 2 RB)",
      "22": "22 Personnel (1 WR, 1 TE, 3 RB)",
      "01": "01 Personnel (0 RB, 1 TE, 4 WR)",
      "00": "00 Personnel (0 RB, 0 TE, 5 WR)",
    };
    return descriptions[numbers] || input;
  }

  return normalizeText(input);
};

/**
 * Smart input handler that applies normalization on blur
 * Generic version for type safety
 */
export const createNormalizedInputHandler = <T extends Record<string, unknown>>(
  field: keyof T,
  onUpdate: (field: keyof T, value: string) => void,
  normalizer: (input: string) => string = normalizeText
) => {
  return {
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      const normalized = normalizer(e.target.value);
      if (normalized !== e.target.value) {
        onUpdate(field, normalized);
      }
    },
  };
};

/**
 * Fuzzy matching for auto-complete
 * "pwr" matches "Power", "dcue" matches "Deuce"
 */
export const fuzzyMatch = (query: string, options: string[]): string[] => {
  if (!query) return options;

  const normalizedQuery = query.toLowerCase();

  return options
    .filter((option) => {
      const normalizedOption = option.toLowerCase();

      // Exact match gets highest priority
      if (normalizedOption.includes(normalizedQuery)) return true;

      // Fuzzy matching - check if all characters in query appear in order
      let queryIndex = 0;
      for (
        let i = 0;
        i < normalizedOption.length && queryIndex < normalizedQuery.length;
        i++
      ) {
        if (normalizedOption[i] === normalizedQuery[queryIndex]) {
          queryIndex++;
        }
      }

      return queryIndex === normalizedQuery.length;
    })
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const queryLower = normalizedQuery;

      // Prioritize starts-with matches
      if (aLower.startsWith(queryLower) && !bLower.startsWith(queryLower))
        return -1;
      if (bLower.startsWith(queryLower) && !aLower.startsWith(queryLower))
        return 1;

      // Then prioritize contains matches
      if (aLower.includes(queryLower) && !bLower.includes(queryLower))
        return -1;
      if (bLower.includes(queryLower) && !aLower.includes(queryLower)) return 1;

      // Finally alphabetical
      return a.localeCompare(b);
    });
};
