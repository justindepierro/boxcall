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

    // === ANALYTICS QUALITY WARNINGS ===
    // These warnings help coaches create plays that will generate better analytics

    // Personnel grouping - critical for personnel tendency reports
    if (!data.personnel) {
      warnings.push({
        field: "personnel",
        code: "ANALYTICS_QUALITY",
        message: "No personnel grouping specified",
        suggestion:
          "Adding personnel (e.g., 11, 12, 21) enables tendency reports by personnel",
      });
    }

    // Formation - important for formation-based analytics
    if (!data.formation_id) {
      warnings.push({
        field: "formation_id",
        code: "ANALYTICS_QUALITY",
        message: "No formation linked",
        suggestion:
          "Linking a formation enables formation success rate tracking",
      });
    }

    // Play type family detection - helps categorize for analytics
    const playTypeFamily = this.detectPlayTypeFamily(data.p_type);
    if (!playTypeFamily) {
      warnings.push({
        field: "p_type",
        code: "ANALYTICS_QUALITY",
        message: `Play type "${data.p_type}" doesn't match a standard category`,
        suggestion:
          "Standard types (Run, Pass, Screen, RPO, PA, etc.) improve analytics grouping",
      });
    }

    // Tags - useful for filtering and searching
    if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
      warnings.push({
        field: "tags",
        code: "ANALYTICS_QUALITY",
        message: "No tags specified",
        suggestion:
          "Tags like 'goal-line', 'two-minute', 'red-zone' enable situational filtering",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Detect standard play type family from p_type string
   * Returns null if no standard family matches
   */
  static detectPlayTypeFamily(pType: string | undefined | null): string | null {
    if (!pType) return null;

    const normalized = pType.toLowerCase().trim();

    // Run family
    if (
      normalized.includes("run") ||
      normalized.includes("rush") ||
      normalized.includes("dive") ||
      normalized.includes("sweep") ||
      normalized.includes("power") ||
      normalized.includes("counter") ||
      normalized.includes("trap") ||
      normalized.includes("draw") ||
      normalized.includes("stretch") ||
      normalized.includes("zone")
    ) {
      return "run";
    }

    // Pass family
    if (
      normalized.includes("pass") ||
      normalized.includes("slant") ||
      normalized.includes("curl") ||
      normalized.includes("out") ||
      normalized.includes("post") ||
      normalized.includes("corner") ||
      normalized.includes("seam") ||
      normalized.includes("go") ||
      normalized.includes("fade") ||
      normalized.includes("hitch") ||
      normalized.includes("dig") ||
      normalized.includes("comeback")
    ) {
      return "pass";
    }

    // Screen family
    if (
      normalized.includes("screen") ||
      normalized.includes("tunnel") ||
      normalized.includes("bubble") ||
      normalized.includes("jailbreak")
    ) {
      return "screen";
    }

    // Play action family
    if (
      normalized.includes("play action") ||
      normalized.includes("play-action") ||
      normalized.includes("playaction") ||
      normalized === "pa" ||
      normalized.startsWith("pa ")
    ) {
      return "play_action";
    }

    // RPO family
    if (
      normalized.includes("rpo") ||
      normalized.includes("run-pass option") ||
      normalized.includes("run pass option")
    ) {
      return "rpo";
    }

    // Trick play family
    if (
      normalized.includes("trick") ||
      normalized.includes("reverse") ||
      normalized.includes("flea flicker") ||
      normalized.includes("double pass") ||
      normalized.includes("gadget")
    ) {
      return "trick";
    }

    // Special teams family
    if (
      normalized.includes("punt") ||
      normalized.includes("kick") ||
      normalized.includes("field goal") ||
      normalized.includes("fg") ||
      normalized.includes("onside") ||
      normalized.includes("return")
    ) {
      return "special_teams";
    }

    return null;
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

  /**
   * Calculate analytics quality score for a play (0-100)
   * Higher score = better data for analytics
   */
  static getAnalyticsQualityScore(data: any): {
    score: number;
    breakdown: Record<string, { points: number; max: number; reason: string }>;
    grade: "A" | "B" | "C" | "D" | "F";
    suggestions: string[];
  } {
    const breakdown: Record<
      string,
      { points: number; max: number; reason: string }
    > = {};
    const suggestions: string[] = [];

    // Personnel (25 points) - critical for tendency reports
    if (data.personnel && data.personnel.trim()) {
      breakdown.personnel = {
        points: 25,
        max: 25,
        reason: "Personnel grouping specified",
      };
    } else {
      breakdown.personnel = {
        points: 0,
        max: 25,
        reason: "Missing personnel grouping",
      };
      suggestions.push(
        "Add personnel (e.g., 11, 12, 21) for tendency analysis"
      );
    }

    // Formation (20 points) - important for formation analytics
    if (data.formation_id) {
      breakdown.formation = {
        points: 20,
        max: 20,
        reason: "Formation linked",
      };
    } else {
      breakdown.formation = {
        points: 0,
        max: 20,
        reason: "No formation linked",
      };
      suggestions.push("Link a formation for formation success tracking");
    }

    // Play type family (20 points) - enables category grouping
    const family = this.detectPlayTypeFamily(data.p_type);
    if (family) {
      breakdown.playType = {
        points: 20,
        max: 20,
        reason: `Recognized type family: ${family}`,
      };
    } else {
      breakdown.playType = {
        points: 5,
        max: 20,
        reason: `Non-standard type: ${data.p_type || "none"}`,
      };
      suggestions.push(
        "Use standard type names (Run, Pass, Screen, RPO) for better grouping"
      );
    }

    // Tags (15 points) - enables filtering
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      const tagPoints = Math.min(15, data.tags.length * 5);
      breakdown.tags = {
        points: tagPoints,
        max: 15,
        reason: `${data.tags.length} tag(s) specified`,
      };
      if (data.tags.length < 3) {
        suggestions.push("Consider adding more situational tags");
      }
    } else {
      breakdown.tags = {
        points: 0,
        max: 15,
        reason: "No tags specified",
      };
      suggestions.push(
        "Add tags (goal-line, two-minute, red-zone) for filtering"
      );
    }

    // Play name quality (10 points) - descriptive names help
    if (data.play_name && data.play_name.length >= 5) {
      breakdown.playName = {
        points: 10,
        max: 10,
        reason: "Descriptive play name",
      };
    } else {
      breakdown.playName = {
        points: 3,
        max: 10,
        reason: "Short or generic play name",
      };
      suggestions.push("Use descriptive names for easier identification");
    }

    // Direction (10 points) - useful for directional tendency analysis
    if (data.p_dir || data.f_dir) {
      breakdown.direction = {
        points: 10,
        max: 10,
        reason: "Direction specified",
      };
    } else {
      breakdown.direction = {
        points: 0,
        max: 10,
        reason: "No direction specified",
      };
      suggestions.push(
        "Specify direction (L/R) for directional tendency tracking"
      );
    }

    // Calculate total
    const totalPoints = Object.values(breakdown).reduce(
      (sum, item) => sum + item.points,
      0
    );
    const maxPoints = Object.values(breakdown).reduce(
      (sum, item) => sum + item.max,
      0
    );
    const score = Math.round((totalPoints / maxPoints) * 100);

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (score >= 90) grade = "A";
    else if (score >= 80) grade = "B";
    else if (score >= 70) grade = "C";
    else if (score >= 60) grade = "D";
    else grade = "F";

    return { score, breakdown, grade, suggestions };
  }
}
