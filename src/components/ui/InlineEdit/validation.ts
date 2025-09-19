/**
 * Validation utilities for InlineEdit component
 * Provides field-specific validation functions
 */

/**
 * Validates grouping names
 * - Must not be empty
 * - Must not contain special characters that could cause issues
 * - Should be reasonable length
 */
export const validateGroupingName = (value: string): boolean => {
  if (!value.trim()) return false;
  if (value.length > 50) return false;
  // Allow letters, numbers, spaces, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
  return validPattern.test(value);
};

/**
 * Validates position labels
 * - Must not be empty
 * - Should be reasonable length
 * - Allow common position abbreviations and names
 */
export const validatePositionLabel = (value: string): boolean => {
  if (!value.trim()) return false;
  if (value.length > 20) return false;
  // Allow letters, numbers, common punctuation
  const validPattern = /^[a-zA-Z0-9\s\-_()]+$/;
  return validPattern.test(value);
};

/**
 * Validates general text fields
 * - Must not be empty
 * - Should be reasonable length
 */
export const validateRequiredText = (value: string): boolean => {
  return value.trim().length > 0 && value.length <= 100;
};

/**
 * Validates optional text fields
 * - Can be empty
 * - Should be reasonable length if provided
 */
export const validateOptionalText = (value: string): boolean => {
  return value.length === 0 || value.length <= 100;
};
