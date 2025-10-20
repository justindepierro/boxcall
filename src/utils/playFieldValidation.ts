/**
 * Play Field Validation
 * 
 * Validates play field values to prevent common data entry errors:
 * - Formation names that look like personnel packages
 * - Personnel packages that look like formation names
 */

/**
 * Common personnel package patterns that shouldn't be used as formation names
 */
const PERSONNEL_PATTERNS = [
  /^\d+\s+Players?$/i,        // "6 Players", "11 Player"
  /^\d{2}\s+Personnel$/i,     // "11 Personnel", "12 Personnel"
  /^\d{2}$/,                  // "11", "12", "21"
  /^(Blue|Black|Green|Red|Gold|White|Orange)$/i,  // Color-based personnel names
];

/**
 * Common formation patterns that shouldn't be used as personnel values
 */
const FORMATION_PATTERNS = [
  /^(Shotgun|Pistol|Under\s+Center|Gun|Singleback|I\s+Form)/i,
  /^(Trips|Twins|Bunch|Stack|Empty|Spread|Trey)/i,
  /^(Pro|Power|Strong|Weak|Ace|Deuce)/i,
];

/**
 * Validate that a formation name doesn't look like a personnel package
 * 
 * @param value - The formation value to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateFormationName(value: string | null | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!value || value.trim() === '') {
    return { isValid: true }; // Empty is ok (will be handled by required validation)
  }

  const trimmedValue = value.trim();

  // Check if it matches personnel patterns
  for (const pattern of PERSONNEL_PATTERNS) {
    if (pattern.test(trimmedValue)) {
      return {
        isValid: false,
        error: `"${trimmedValue}" looks like a personnel package. Use the Personnel field for that. Formation names should be like "Shotgun", "Trips Right", "I Formation", etc.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate that a personnel value doesn't look like a formation name
 * 
 * @param value - The personnel value to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validatePersonnelValue(value: string | null | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!value || value.trim() === '') {
    return { isValid: true }; // Empty is ok
  }

  const trimmedValue = value.trim();

  // Check if it matches formation patterns
  for (const pattern of FORMATION_PATTERNS) {
    if (pattern.test(trimmedValue)) {
      return {
        isValid: false,
        error: `"${trimmedValue}" looks like a formation name. Use the Formation field for that. Personnel should be like "11", "12", "Blue", etc.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Get a user-friendly suggestion for fixing the error
 */
export function getSuggestionForInvalidField(
  fieldName: 'formation' | 'personnel',
  value: string
): string {
  if (fieldName === 'formation') {
    // If user entered personnel in formation field
    if (/^\d+\s+Players?$/i.test(value)) {
      return `Move "${value}" to the Personnel field, then enter a formation name like "Shotgun" or "Trips Right"`;
    }
    if (/^\d{2}$/.test(value)) {
      return `Move "${value}" to the Personnel field, then enter a formation name like "Shotgun" or "I Formation"`;
    }
    if (/^(Blue|Black|Green)$/i.test(value)) {
      return `Move "${value}" to the Personnel field, then enter a formation name like "Trips" or "Pro"`;
    }
  }

  if (fieldName === 'personnel') {
    // If user entered formation in personnel field
    return `Move "${value}" to the Formation field, then enter a personnel package like "11" or "Blue"`;
  }

  return '';
}
