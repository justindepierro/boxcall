/**
 * Formation Validation Schemas
 *
 * Validates formation data to ensure clean, consistent naming
 * and prevent direction keywords in base formation names
 *
 * Phase 2: Data Quality & Validation System
 */

import { z } from "zod";

// ========================================
// Direction Keywords to Reject
// ========================================

const DIRECTION_KEYWORDS = [
  "left",
  "right",
  "l",
  "r",
  "lt",
  "rt",
  "lft",
  "rgt",
];

// ========================================
// Formation Name Validation
// ========================================

/**
 * Check if a formation name contains direction keywords
 * Allows single-word formations like "Left" or "Right" (formation names)
 * Rejects multi-word formations with direction like "Trips Left" or "I-Form R"
 */
function hasDirectionKeyword(name: string): boolean {
  const normalized = name.toLowerCase().trim();
  const words = normalized.split(/[\s-]+/);

  // Single word is OK (could be a formation named "Left" or "Right")
  if (words.length === 1) {
    return false;
  }

  // Multi-word: check if any word is a direction keyword
  return words.some((word) => DIRECTION_KEYWORDS.includes(word));
}

/**
 * Extract base formation name without direction
 * Examples:
 *   "Trips Left" → "Trips"
 *   "I-Form R" → "I-Form"
 *   "Shotgun Right" → "Shotgun"
 */
export function extractBaseFormation(name: string): string {
  const words = name.trim().split(/\s+/);

  // Filter out direction keywords
  const baseWords = words.filter(
    (word) => !DIRECTION_KEYWORDS.includes(word.toLowerCase())
  );

  return baseWords.join(" ");
}

/**
 * Extract direction from formation name
 * Examples:
 *   "Trips Left" → "L"
 *   "I-Form R" → "R"
 *   "Shotgun" → null
 */
export function extractDirection(name: string): "L" | "R" | "Middle" | null {
  const normalized = name.toLowerCase().trim();
  const words = normalized.split(/[\s-]+/);

  for (const word of words) {
    if (["left", "l", "lt", "lft"].includes(word)) return "L";
    if (["right", "r", "rt", "rgt"].includes(word)) return "R";
    if (["middle", "mid", "center", "c"].includes(word)) return "Middle";
  }

  return null;
}

// ========================================
// Zod Schemas
// ========================================

/**
 * Formation name schema - base formation without direction
 * Used for formation_name field in database
 */
export const FormationNameSchema = z
  .string()
  .min(1, "Formation name required")
  .max(50, "Formation name too long (max 50 characters)")
  .regex(
    /^[a-zA-Z0-9\s\-']+$/,
    "Formation name can only contain letters, numbers, spaces, hyphens, and apostrophes"
  )
  .refine((name) => !hasDirectionKeyword(name), {
    message:
      'Formation name cannot contain direction keywords like "Left", "Right", "L", "R". Use the direction field instead.',
  });

/**
 * Formation direction schema
 */
export const FormationDirectionSchema = z.enum(["L", "R", "Middle"]).optional();

/**
 * Personnel configuration schema
 * Examples: "11 Personnel", "12 Personnel", "21 Personnel", "Goal Line"
 */
export const PersonnelSchema = z
  .string()
  .min(1, "Personnel required")
  .max(50, "Personnel name too long")
  .regex(
    /^[a-zA-Z0-9\s-]+$/,
    "Personnel can only contain letters, numbers, spaces, and hyphens"
  );

/**
 * Formation create schema
 */
export const FormationCreateSchema = z.object({
  playbook_id: z.string().uuid("Invalid playbook ID"),
  formation_name: FormationNameSchema,
  direction: FormationDirectionSchema,
  personnel: PersonnelSchema.optional(),
  notes: z
    .string()
    .max(5000, "Notes too long (max 5000 characters)")
    .optional()
    .transform((val) => {
      // Basic XSS protection: strip HTML tags
      if (!val) return val;
      return val.replace(/<[^>]*>/g, "");
    }),
});

/**
 * Formation update schema
 */
export const FormationUpdateSchema = z.object({
  id: z.string().uuid("Invalid formation ID"),
  formation_name: FormationNameSchema.optional(),
  direction: FormationDirectionSchema,
  personnel: PersonnelSchema.optional(),
  notes: z
    .string()
    .max(5000, "Notes too long (max 5000 characters)")
    .optional()
    .transform((val) => {
      if (!val) return val;
      return val.replace(/<[^>]*>/g, "");
    }),
});

// ========================================
// Validation Functions
// ========================================

/**
 * Validate formation creation data
 */
export function validateFormationCreate(data: unknown) {
  return FormationCreateSchema.parse(data);
}

/**
 * Validate formation update data
 */
export function validateFormationUpdate(data: unknown) {
  return FormationUpdateSchema.parse(data);
}

/**
 * Safe parse (returns { success, data, error })
 */
export function safeValidateFormationCreate(data: unknown) {
  return FormationCreateSchema.safeParse(data);
}

export function safeValidateFormationUpdate(data: unknown) {
  return FormationUpdateSchema.safeParse(data);
}

/**
 * Validate formation name (standalone check)
 */
export function validateFormationName(name: string): {
  isValid: boolean;
  error?: string;
  baseFormation?: string;
  direction?: "L" | "R" | "Middle" | null;
} {
  const result = FormationNameSchema.safeParse(name);

  if (!result.success) {
    return {
      isValid: false,
      error: result.error.issues[0]?.message || "Invalid formation name",
    };
  }

  const baseFormation = extractBaseFormation(name);
  const direction = extractDirection(name);

  return {
    isValid: true,
    baseFormation,
    direction,
  };
}

// ========================================
// Type Exports
// ========================================

export type FormationCreateInput = z.infer<typeof FormationCreateSchema>;
export type FormationUpdateInput = z.infer<typeof FormationUpdateSchema>;

/**
 * Formation validation result with suggestions
 */
export interface FormationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  baseFormation?: string;
  direction?: "L" | "R" | "Middle" | null;
}

/**
 * Comprehensive formation validation with suggestions
 */
export function validateFormationWithSuggestions(
  formationName: string,
  direction?: "L" | "R" | "Middle"
): FormationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for direction keywords in name
  if (hasDirectionKeyword(formationName)) {
    errors.push(
      'Formation name contains direction keywords like "Left", "Right", "L", or "R"'
    );
    suggestions.push(
      `Use "${extractBaseFormation(formationName)}" as the formation name and select direction separately`
    );
  }

  // Check if direction is missing but could be extracted
  const detectedDirection = extractDirection(formationName);
  if (detectedDirection && !direction) {
    warnings.push(
      `Direction "${detectedDirection}" detected in formation name`
    );
    suggestions.push(
      `Consider setting direction to "${detectedDirection}" in the direction field`
    );
  }

  // Validate base formation name
  const baseFormation = extractBaseFormation(formationName);
  const nameValidation = FormationNameSchema.safeParse(baseFormation);

  if (!nameValidation.success) {
    nameValidation.error.issues.forEach((issue) => {
      errors.push(issue.message);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    baseFormation,
    direction: detectedDirection,
  };
}
