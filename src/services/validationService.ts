/**
 * Data Validation Service
 *
 * Comprehensive client and server-side validation for all entities:
 * - Formations: Name uniqueness, position validation, direction consistency
 * - Plays: Formation/personnel references, required fields, direction matching
 * - Personnel: Position constraints, configuration validity
 * - Teams: Member limits, role validation
 *
 * Provides both synchronous validation (client-side) and async validation (server-side checks)
 */

// Re-export validation services for backward compatibility
export { FormationValidationService } from "../validations/formationValidation";
export { PlayValidationService } from "../validations/playValidation";
export { PersonnelValidationService } from "../validations/personnelValidation";

// Re-export interfaces for backward compatibility
export type { ValidationResult, ValidationError, ValidationWarning } from "../validations/formationValidation";
