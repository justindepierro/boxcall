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
export { FormationValidationService } from "../validation-services/formationValidation";
export { PlayValidationService } from "../validation-services/playValidation";
export { PersonnelValidationService } from "../validation-services/personnelValidation";

// Re-export interfaces for backward compatibility
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "../validation-services/formationValidation";
