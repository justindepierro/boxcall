/**
 * Validation utilities for Practice Script Modal
 */

import type { PracticeScriptFormData, PracticeScriptPlay } from "./types";

export interface ValidationErrors {
  script?: string[];
  plays?: Record<number, string[]>;
}

/**
 * Validate script metadata
 */
export const validateScriptMetadata = (
  data: PracticeScriptFormData
): string[] => {
  const errors: string[] = [];

  if (!data.name || !data.name.trim()) {
    errors.push("Script name is required");
  }

  if (data.name && data.name.length > 100) {
    errors.push("Script name must be less than 100 characters");
  }

  if (data.opponent && data.opponent.length > 200) {
    errors.push("Opponent name must be less than 200 characters");
  }

  // Validate date format if provided
  if (data.date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push("Date must be in YYYY-MM-DD format");
    }
  }

  return errors;
};

/**
 * Validate individual play
 */
export const validatePlay = (play: PracticeScriptPlay): string[] => {
  const errors: string[] = [];

  if (!play.playName || !play.playName.trim()) {
    errors.push("Play name is required");
  }

  if (play.playName && play.playName.length > 200) {
    errors.push("Play name must be less than 200 characters");
  }

  if (play.notes && play.notes.length > 500) {
    errors.push("Notes must be less than 500 characters");
  }

  // Validate UUID format if playId is provided
  if (
    play.playId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      play.playId
    )
  ) {
    errors.push("Invalid play ID format");
  }

  return errors;
};

/**
 * Validate all plays in script
 */
export const validatePlays = (
  plays: PracticeScriptPlay[]
): Record<number, string[]> => {
  const errors: Record<number, string[]> = {};

  plays.forEach((play, index) => {
    const playErrors = validatePlay(play);
    if (playErrors.length > 0) {
      errors[index] = playErrors;
    }
  });

  return errors;
};

/**
 * Validate entire script (metadata + plays)
 */
export const validateScript = (
  metadata: PracticeScriptFormData,
  plays: PracticeScriptPlay[]
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate metadata
  const metadataErrors = validateScriptMetadata(metadata);
  if (metadataErrors.length > 0) {
    errors.script = metadataErrors;
  }

  // Validate plays
  const playErrors = validatePlays(plays);
  if (Object.keys(playErrors).length > 0) {
    errors.plays = playErrors;
  }

  // Check for at least one play (optional - remove if not required)
  // if (plays.length === 0) {
  //   if (!errors.script) errors.script = [];
  //   errors.script.push("At least one play is required");
  // }

  return errors;
};

/**
 * Check if there are any validation errors
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  if (errors.script && errors.script.length > 0) {
    return true;
  }
  if (errors.plays && Object.keys(errors.plays).length > 0) {
    return true;
  }
  return false;
};

/**
 * Get first error message for display
 */
export const getFirstError = (errors: ValidationErrors): string | null => {
  if (errors.script && errors.script.length > 0) {
    return errors.script[0];
  }

  if (errors.plays) {
    const firstPlayIndex = Object.keys(errors.plays)[0];
    if (firstPlayIndex !== undefined) {
      const playErrors = errors.plays[parseInt(firstPlayIndex)];
      if (playErrors && playErrors.length > 0) {
        return `Play ${parseInt(firstPlayIndex) + 1}: ${playErrors[0]}`;
      }
    }
  }

  return null;
};

/**
 * Format all errors for display
 */
export const formatErrors = (errors: ValidationErrors): string[] => {
  const messages: string[] = [];

  if (errors.script) {
    messages.push(...errors.script);
  }

  if (errors.plays) {
    Object.entries(errors.plays).forEach(([index, playErrors]) => {
      playErrors.forEach((error) => {
        messages.push(`Play ${parseInt(index) + 1}: ${error}`);
      });
    });
  }

  return messages;
};
