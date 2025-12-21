/**
 * Personnel Validation Service
 *
 * Client and server-side validation for personnel configurations
 */

import { table } from "../data/supabase/db";

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

export class PersonnelValidationService {
  /**
   * Comprehensive personnel configuration validation (client-side)
   */
  static validatePersonnelConfiguration(data: any): ValidationResult {
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
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim() === ""
    ) {
      errors.push({
        field: "name",
        code: "REQUIRED",
        message: "Personnel configuration name is required",
      });
    }

    // Name validation (allow custom names like colors, animals, etc.)
    if (data.name) {
      const name = data.name.trim();
      if (name.length > 50) {
        errors.push({
          field: "name",
          code: "TOO_LONG",
          message: "Personnel name cannot exceed 50 characters",
          value: name.length,
        });
      }

      // Allow any non-empty string (no format restrictions)
    }

    // Players validation
    if (!Array.isArray(data.players)) {
      errors.push({
        field: "players",
        code: "INVALID_TYPE",
        message: "Players must be an array",
      });
    } else {
      // Must have exactly one QB
      const qbs = data.players.filter((p: any) => p.player_position === "QB");
      if (qbs.length !== 1) {
        errors.push({
          field: "players",
          code: "INVALID_QB_COUNT",
          message: "Personnel configuration must have exactly one QB",
          value: qbs.length,
        });
      }

      // Position validation
      const validPositions = ["QB", "RB", "TE", "WR"];
      data.players.forEach((player: any, index: number) => {
        if (
          !player.player_position ||
          !validPositions.includes(player.player_position)
        ) {
          errors.push({
            field: `players[${index}].player_position`,
            code: "INVALID_VALUE",
            message: `Player ${index + 1}: position must be one of: ${validPositions.join(", ")}`,
            value: player.player_position,
          });
        }

        if (
          !player.label ||
          typeof player.label !== "string" ||
          player.label.trim() === ""
        ) {
          errors.push({
            field: `players[${index}].label`,
            code: "REQUIRED",
            message: `Player ${index + 1}: label is required`,
          });
        }

        // Label format validation (should be short, like "X", "Y", "H", etc.)
        if (player.label && player.label.length > 3) {
          warnings.push({
            field: `players[${index}].label`,
            code: "LONG_LABEL",
            message: `Player ${index + 1}: label "${player.label}" is long (max 3 characters recommended)`,
            suggestion:
              'Use short labels like "X", "Y", "H" for better diagram display',
          });
        }
      });

      // Sort order validation (QB should be first)
      if (qbs.length === 1) {
        const qbSortOrder = qbs[0].sort_order;
        if (qbSortOrder !== 0) {
          errors.push({
            field: "players",
            code: "INVALID_QB_ORDER",
            message: "QB must have sort_order = 0",
            value: qbSortOrder,
          });
        }
      }

      // Check for duplicate labels
      const labels = data.players.map((p: any) => p.label).filter(Boolean);
      const duplicateLabels = labels.filter(
        (label: string, i: number) => labels.indexOf(label) !== i
      );
      if (duplicateLabels.length > 0) {
        errors.push({
          field: "players",
          code: "DUPLICATE_LABELS",
          message: `Duplicate player labels found: ${[...new Set(duplicateLabels)].join(", ")}`,
          value: duplicateLabels,
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
   * Server-side personnel validation (async checks)
   */
  static async validatePersonnelConfigurationServer(
    data: any,
    existingId?: string
  ): Promise<ValidationResult> {
    const clientResult = this.validatePersonnelConfiguration(data);
    const errors = [...clientResult.errors];
    const warnings = [...clientResult.warnings];

    // Name uniqueness check
    if (data.name && data.playbook_id) {
      try {
        const { data: existing } = await table("personnel_configurations")
          .select("id")
          .eq("playbook_id", data.playbook_id)
          .ilike("name", data.name.trim())
          .neq("id", existingId || "")
          .limit(1);

        if (existing && existing.length > 0) {
          errors.push({
            field: "name",
            code: "DUPLICATE",
            message:
              "A personnel configuration with this name already exists in this playbook",
          });
        }
      } catch {
        warnings.push({
          field: "name",
          code: "VALIDATION_ERROR",
          message: "Could not verify name uniqueness",
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
}
