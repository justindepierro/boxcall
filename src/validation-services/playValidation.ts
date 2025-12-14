/**
 * Play Validation Service
 *
 * Client and server-side validation for plays
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

export class PlayValidationService {
  /**
   * Comprehensive play validation (client-side)
   */
  static validatePlay(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!data.playbook_id) {
      errors.push({
        field: "playbook_id",
        code: "REQUIRED",
        message: "Playbook ID is required",
      });
    }

    if (
      !data.play_name ||
      typeof data.play_name !== "string" ||
      data.play_name.trim() === ""
    ) {
      errors.push({
        field: "play_name",
        code: "REQUIRED",
        message: "Play name is required",
      });
    }

    // Name validation
    if (data.play_name) {
      const name = data.play_name.trim();
      if (name.length > 200) {
        errors.push({
          field: "play_name",
          code: "TOO_LONG",
          message: "Play name cannot exceed 200 characters",
          value: name.length,
        });
      }
    }

    // Play type validation - allow custom types
    if (
      !data.p_type ||
      typeof data.p_type !== "string" ||
      data.p_type.trim() === ""
    ) {
      errors.push({
        field: "p_type",
        code: "REQUIRED",
        message: "Play type is required",
        value: data.p_type,
      });
    } else if (data.p_type.length > 50) {
      errors.push({
        field: "p_type",
        code: "TOO_LONG",
        message: "Play type cannot exceed 50 characters",
        value: data.p_type.length,
      });
    }

    // Direction validation
    if (data.f_dir) {
      const validDirs = ["L", "R", "Left", "Right", "left", "right"];
      if (!validDirs.includes(data.f_dir)) {
        errors.push({
          field: "f_dir",
          code: "INVALID_VALUE",
          message:
            'Formation direction must be "L", "R", "Left", "Right", "left", or "right"',
          value: data.f_dir,
        });
      }
    }

    if (data.p_dir) {
      const validDirs = ["L", "R", "Left", "Right", "left", "right"];
      if (!validDirs.includes(data.p_dir)) {
        errors.push({
          field: "p_dir",
          code: "INVALID_VALUE",
          message:
            'Play direction must be "L", "R", "Left", "Right", "left", or "right"',
          value: data.p_dir,
        });
      }
    }

    // Confidence validation
    if (data.confidence_base !== undefined) {
      if (
        typeof data.confidence_base !== "number" ||
        data.confidence_base < 0 ||
        data.confidence_base > 100
      ) {
        errors.push({
          field: "confidence_base",
          code: "INVALID_RANGE",
          message: "Confidence must be between 0 and 100",
          value: data.confidence_base,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Server-side play validation (async checks)
   * Note: This method now takes service functions as parameters to avoid circular dependencies
   */
  static async validatePlayServer(
    data: any,
    _existingId?: string,
    getFormationById?: (id: string) => Promise<any>,
    getPersonnelConfiguration?: (id: string) => Promise<any>
  ): Promise<ValidationResult> {
    const clientResult = this.validatePlay(data);
    const errors = [...clientResult.errors];
    const warnings = [...clientResult.warnings];

    // Formation reference validation
    if (data.formation_id && getFormationById) {
      try {
        const formation = await getFormationById(data.formation_id);
        if (!formation) {
          errors.push({
            field: "formation_id",
            code: "INVALID_REFERENCE",
            message: "Referenced formation does not exist",
            value: data.formation_id,
          });
        } else if (formation.playbook_id !== data.playbook_id) {
          errors.push({
            field: "formation_id",
            code: "INVALID_REFERENCE",
            message: "Formation belongs to a different playbook",
            value: data.formation_id,
          });
        }

        // Direction consistency check
        if (formation && data.f_dir) {
          const normalizedPlayDir = this.normalizeDirection(data.f_dir);
          const formationDir = formation.direction;

          if (normalizedPlayDir && formationDir) {
            const expectedDir = (() => {
              if (formationDir === "left") return "L";
              if (formationDir === "right") return "R";
              return null;
            })();
            if (expectedDir && normalizedPlayDir !== expectedDir) {
              warnings.push({
                field: "f_dir",
                code: "DIRECTION_MISMATCH",
                message: `Play direction "${data.f_dir}" doesn't match formation direction "${formationDir}"`,
                suggestion: `Consider changing to "${expectedDir}" to match the formation`,
              });
            }
          }
        }
      } catch {
        warnings.push({
          field: "formation_id",
          code: "VALIDATION_ERROR",
          message: "Could not verify formation reference",
          suggestion: "Check your connection and try again",
        });
      }
    }

    // Personnel reference validation
    if (data.personnel_id && getPersonnelConfiguration) {
      try {
        const personnel = await getPersonnelConfiguration(data.personnel_id);
        if (!personnel) {
          errors.push({
            field: "personnel_id",
            code: "INVALID_REFERENCE",
            message: "Referenced personnel configuration does not exist",
            value: data.personnel_id,
          });
        } else if (personnel.playbook_id !== data.playbook_id) {
          errors.push({
            field: "personnel_id",
            code: "INVALID_REFERENCE",
            message: "Personnel configuration belongs to a different playbook",
            value: data.personnel_id,
          });
        }
      } catch {
        warnings.push({
          field: "personnel_id",
          code: "VALIDATION_ERROR",
          message: "Could not verify personnel reference",
          suggestion: "Check your connection and try again",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Normalize direction string to standard format
   */
  private static normalizeDirection(direction: string): "L" | "R" | null {
    if (!direction) return null;
    const normalized = direction.toLowerCase().trim();
    if (normalized === "left" || normalized === "l") return "L";
    if (normalized === "right" || normalized === "r") return "R";
    return null;
  }
}
