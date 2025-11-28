/**
 * Data Validation & Normalization Utilities
 * 
 * Ensures database stays "Clean AF" by:
 * - Normalizing all text input (TWINS → Twins)
 * - Fuzzy matching similar entries (Twin → "Did you mean Twins?")
 * - Preventing duplicate variations
 * - Real-time validation feedback
 */

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

/**
 * Normalize text to title case (First Letter Capitalized)
 * Examples:
 * - "SHOTGUN" → "Shotgun"
 * - "trips right" → "Trips Right"
 * - "i-formation" → "I-Formation"
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle special cases
      if (word === 'i' || word === 'i-formation') {
        return word.toUpperCase();
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normalize formation name
 * Handles special football terminology
 */
export function normalizeFormation(formation: string): string {
  const normalized = normalizeText(formation);
  
  // Special cases for football formations
  const replacements: Record<string, string> = {
    'Shotgun': 'Shotgun',
    'I Formation': 'I-Formation',
    'I-form': 'I-Formation',
    'Empty': 'Empty',
    'Pistol': 'Pistol',
    'Singleback': 'Singleback',
    'Single Back': 'Singleback',
    'Ace': 'Ace',
    'Doubles': 'Doubles',
    'Trips': 'Trips',
    'Bunch': 'Bunch',
    'Stack': 'Stack',
    'Trey': 'Trey',
    'Deuce': 'Deuce',
    'Twins': 'Twins',
    'Twin': 'Twins', // Auto-correct
  };
  
  // Check for exact matches after normalization
  for (const [key, value] of Object.entries(replacements)) {
    if (normalized === key) {
      return value;
    }
  }
  
  return normalized;
}

/**
 * Normalize play name
 */
export function normalizePlayName(playName: string): string {
  return normalizeText(playName);
}

/**
 * Normalize personnel grouping (e.g., "11", "12", "21", "BLUE")
 */
export function normalizePersonnel(personnel: string): string {
  const trimmed = personnel.trim();
  
  // If it's a number grouping (11, 12, etc), keep as-is
  if (/^\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Otherwise, normalize to title case
  return normalizeText(trimmed);
}

// ============================================================================
// FUZZY MATCHING
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Returns number of edits needed to transform one string into another
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[s2.length][s1.length];
}

/**
 * Find similar existing values (fuzzy match)
 * Returns matches that are "close enough" to suggest
 */
export interface SimilarMatch {
  value: string;
  distance: number;
  confidence: number; // 0-100
}

/**
 * Find prefix matches (for instant suggestions)
 * Returns existing values that start with the input
 */
export function findPrefixMatches(
  input: string,
  existingValues: string[]
): SimilarMatch[] {
  if (!input || input.length < 1) return [];
  
  const normalized = normalizeText(input).toLowerCase();
  const matches: SimilarMatch[] = [];
  
  for (const existing of existingValues) {
    const existingLower = existing.toLowerCase();
    
    // Exact prefix match
    if (existingLower.startsWith(normalized)) {
      matches.push({
        value: existing,
        distance: 0,
        confidence: 100,
      });
    }
  }
  
  // Sort alphabetically
  return matches.sort((a, b) => a.value.localeCompare(b.value));
}

export function findSimilarMatches(
  input: string,
  existingValues: string[],
  maxDistance: number = 2
): SimilarMatch[] {
  // Show matches from 1 character to encourage database consistency
  if (!input || input.length < 1) return [];
  
  const normalized = normalizeText(input);
  const matches: SimilarMatch[] = [];
  
  // First, add all prefix matches (highest priority)
  const prefixMatches = findPrefixMatches(input, existingValues);
  matches.push(...prefixMatches);
  
  // Then add fuzzy matches that aren't already in prefix matches
  for (const existing of existingValues) {
    // Skip if already in prefix matches
    if (prefixMatches.some(m => m.value === existing)) continue;
    
    const distance = levenshteinDistance(normalized, existing);
    
    // Only consider close matches
    if (distance > 0 && distance <= maxDistance) {
      const confidence = Math.round((1 - distance / Math.max(normalized.length, existing.length)) * 100);
      matches.push({
        value: existing,
        distance,
        confidence,
      });
    }
  }
  
  // Sort: prefix matches first (distance=0), then by distance
  return matches.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.value.localeCompare(b.value);
  });
}

/**
 * Check if value already exists (exact match after normalization)
 */
export function isDuplicate(input: string, existingValues: string[]): boolean {
  const normalized = normalizeText(input);
  return existingValues.some(existing => 
    normalizeText(existing) === normalized
  );
}

// ============================================================================
// VALIDATION STATES
// ============================================================================

export type ValidationState = 
  | 'idle'       // No input yet
  | 'typing'     // User is typing
  | 'valid'      // Valid, normalized input (green)
  | 'warning'    // Similar match found (yellow)
  | 'error'      // Invalid or duplicate (red)
  | 'saving';    // Currently saving (green pulse)

export interface ValidationResult {
  state: ValidationState;
  normalizedValue: string;
  message?: string;
  suggestions?: SimilarMatch[];
  borderColor: string;
  shouldConfirm: boolean;
  confirmMessage?: string;
}

/**
 * Validate formation input
 */
export function validateFormation(
  input: string,
  existingFormations: string[]
): ValidationResult {
  // Empty input
  if (!input || input.trim().length === 0) {
    return {
      state: 'idle',
      normalizedValue: '',
      borderColor: 'border-secondary',
      shouldConfirm: false,
    };
  }
  
  // Normalize the input
  const normalized = normalizeFormation(input);
  
  // Check for exact duplicate
  if (isDuplicate(input, existingFormations)) {
    return {
      state: 'valid',
      normalizedValue: normalized,
      message: '✓ Formation exists',
      borderColor: 'border-green-500',
      shouldConfirm: false,
    };
  }
  
  // Find similar matches
  const similar = findSimilarMatches(normalized, existingFormations, 2);
  
  // Similar match found - warn user
  if (similar.length > 0 && similar[0].confidence > 70) {
    return {
      state: 'warning',
      normalizedValue: normalized,
      message: `Did you mean "${similar[0].value}"?`,
      suggestions: similar,
      borderColor: 'border-yellow-500',
      shouldConfirm: true,
      confirmMessage: `Create "${normalized}" instead of "${similar[0].value}"?`,
    };
  }
  
  // Valid new formation
  return {
    state: 'valid',
    normalizedValue: normalized,
    message: `✓ Will create "${normalized}"`,
    borderColor: 'border-green-500',
    shouldConfirm: false,
  };
}

/**
 * Validate play name input
 */
export function validatePlayName(
  input: string,
  existingPlays: string[]
): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      state: 'idle',
      normalizedValue: '',
      borderColor: 'border-secondary',
      shouldConfirm: false,
    };
  }
  
  const normalized = normalizePlayName(input);
  
  // Check for exact duplicate
  if (isDuplicate(input, existingPlays)) {
    return {
      state: 'error',
      normalizedValue: normalized,
      message: '⚠ Play name already exists',
      borderColor: 'border-red-500',
      shouldConfirm: false,
    };
  }
  
  // Find similar matches
  const similar = findSimilarMatches(normalized, existingPlays, 2);
  
  if (similar.length > 0 && similar[0].confidence > 75) {
    return {
      state: 'warning',
      normalizedValue: normalized,
      message: `Similar to "${similar[0].value}"`,
      suggestions: similar,
      borderColor: 'border-yellow-500',
      shouldConfirm: true,
      confirmMessage: `Create "${normalized}" (similar to "${similar[0].value}")?`,
    };
  }
  
  return {
    state: 'valid',
    normalizedValue: normalized,
    message: `✓ Will create "${normalized}"`,
    borderColor: 'border-green-500',
    shouldConfirm: false,
  };
}

/**
 * Validate personnel grouping
 */
export function validatePersonnel(
  input: string,
  existingPersonnel: string[]
): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      state: 'idle',
      normalizedValue: '',
      borderColor: 'border-secondary',
      shouldConfirm: false,
    };
  }
  
  const normalized = normalizePersonnel(input);
  
  // Check if it's a valid personnel format
  const isNumeric = /^\d{2}$/.test(normalized);
  const isNamed = /^[A-Z][a-z]+$/.test(normalized);
  
  if (!isNumeric && !isNamed) {
    return {
      state: 'error',
      normalizedValue: normalized,
      message: '⚠ Use format like "11", "12", or "Blue"',
      borderColor: 'border-red-500',
      shouldConfirm: false,
    };
  }
  
  return {
    state: 'valid',
    normalizedValue: normalized,
    message: `✓ "${normalized}"`,
    borderColor: 'border-green-500',
    shouldConfirm: false,
  };
}

// ============================================================================
// ADVANCED FIELD VALIDATIONS (Formation Details, Play Details, etc.)
// ============================================================================

/**
 * Generic validator for text fields with existing values
 * Used for: Formation Type, Backfield, Shift, Motion, Protection, etc.
 */
export function validateTextField(
  input: string,
  existingValues: string[],
  fieldName: string
): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      state: 'idle',
      normalizedValue: '',
      borderColor: 'border-secondary',
      shouldConfirm: false,
    };
  }
  
  const normalized = normalizeText(input);
  
  // Check for exact match
  if (existingValues.some(v => normalizeText(v) === normalized)) {
    return {
      state: 'valid',
      normalizedValue: normalized,
      message: `✓ ${fieldName} exists`,
      borderColor: 'border-green-500',
      shouldConfirm: false,
    };
  }
  
  // Find similar matches
  const similar = findSimilarMatches(normalized, existingValues, 2);
  
  if (similar.length > 0 && similar[0].confidence > 70) {
    return {
      state: 'warning',
      normalizedValue: normalized,
      message: `Did you mean "${similar[0].value}"?`,
      suggestions: similar,
      borderColor: 'border-yellow-500',
      shouldConfirm: false,
    };
  }
  
  return {
    state: 'valid',
    normalizedValue: normalized,
    message: `✓ Will create "${normalized}"`,
    borderColor: 'border-green-500',
    shouldConfirm: false,
  };
}

/**
 * Validate Formation Type (f_type)
 * Examples: "Spread", "Tight", "Balanced", "Compressed"
 */
export function validateFormationType(
  input: string,
  existingTypes: string[]
): ValidationResult {
  return validateTextField(input, existingTypes, 'Formation type');
}

/**
 * Validate Backfield Alignment (back_align)
 * Examples: "I-Formation", "Shotgun", "Pistol", "Under Center"
 */
export function validateBackfieldAlignment(
  input: string,
  existingAlignments: string[]
): ValidationResult {
  return validateTextField(input, existingAlignments, 'Backfield alignment');
}

/**
 * Validate Shift (shift)
 * Examples: "Z-Motion", "Jet", "Orbit", "None"
 */
export function validateShift(
  input: string,
  existingShifts: string[]
): ValidationResult {
  return validateTextField(input, existingShifts, 'Shift');
}

/**
 * Validate Motion (motion)
 * Examples: "Z across", "H orbit", "Fly", "None"
 */
export function validateMotion(
  input: string,
  existingMotions: string[]
): ValidationResult {
  return validateTextField(input, existingMotions, 'Motion');
}

/**
 * Validate Run Strength (r_str)
 * Examples: "Right", "Left", "Strong", "Weak"
 */
export function validateRunStrength(
  input: string,
  existingStrengths: string[]
): ValidationResult {
  return validateTextField(input, existingStrengths, 'Run strength');
}

/**
 * Validate Pass Strength (p_str)
 * Examples: "Right", "Left", "Strong", "Weak"
 */
export function validatePassStrength(
  input: string,
  existingStrengths: string[]
): ValidationResult {
  return validateTextField(input, existingStrengths, 'Pass strength');
}

/**
 * Validate Protection (protection)
 * Examples: "5-man", "6-man", "Slide Right", "BOB", "Max Protect"
 */
export function validateProtection(
  input: string,
  existingProtections: string[]
): ValidationResult {
  return validateTextField(input, existingProtections, 'Protection');
}

/**
 * Validate One Word Play (one_word_play)
 * Examples: "POWER", "SLANT", "READ", "GO"
 */
export function validateOneWordPlay(
  input: string,
  existingOneWord: string[]
): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      state: 'idle',
      normalizedValue: '',
      borderColor: 'border-secondary',
      shouldConfirm: false,
    };
  }
  
  // One-word plays are typically uppercase
  const normalized = input.trim().toUpperCase();
  
  // Check for exact match
  if (existingOneWord.includes(normalized)) {
    return {
      state: 'valid',
      normalizedValue: normalized,
      message: '✓ One-word call exists',
      borderColor: 'border-green-500',
      shouldConfirm: false,
    };
  }
  
  // Find similar matches
  const similar = findSimilarMatches(normalized, existingOneWord, 2);
  
  if (similar.length > 0 && similar[0].confidence > 70) {
    return {
      state: 'warning',
      normalizedValue: normalized,
      message: `Did you mean "${similar[0].value}"?`,
      suggestions: similar,
      borderColor: 'border-yellow-500',
      shouldConfirm: false,
    };
  }
  
  return {
    state: 'valid',
    normalizedValue: normalized,
    message: `✓ Will create "${normalized}"`,
    borderColor: 'border-green-500',
    shouldConfirm: false,
  };
}

/**
 * Validate Wristband Number (wristband_number)
 * Examples: "23", "8A", "Q12", "R5"
 * No normalization - keep exactly as entered
 */
export function validateWristbandNumber(
  input: string,
  existingNumbers: string[]
): ValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      state: 'idle',
      normalizedValue: '',
      borderColor: 'border-secondary',
      shouldConfirm: false,
    };
  }
  
  const trimmed = input.trim();
  
  // Check for exact duplicate
  if (existingNumbers.includes(trimmed)) {
    return {
      state: 'error',
      normalizedValue: trimmed,
      message: '⚠ Wristband number already in use',
      borderColor: 'border-red-500',
      shouldConfirm: false,
    };
  }
  
  return {
    state: 'valid',
    normalizedValue: trimmed,
    message: `✓ "${trimmed}"`,
    borderColor: 'border-green-500',
    shouldConfirm: false,
  };
}
