/**
 * Formation Validation Service
 *
 * Client and server-side validation for formations
 */

import { supabase } from "../lib/supabase";

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

export class FormationValidationService {
  /**
   * Comprehensive formation validation (client-side)
   */
  static validateFormation(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!data.playbook_id) {
      errors.push({
        field: 'playbook_id',
        code: 'REQUIRED',
        message: 'Playbook ID is required'
      });
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push({
        field: 'name',
        code: 'REQUIRED',
        message: 'Formation name is required'
      });
    }

    // Name validation
    if (data.name) {
      const name = data.name.trim();
      if (name.length > 100) {
        errors.push({
          field: 'name',
          code: 'TOO_LONG',
          message: 'Formation name cannot exceed 100 characters',
          value: name.length
        });
      }

      // Check for invalid characters
      if (/[<>"'&]/.test(name)) {
        errors.push({
          field: 'name',
          code: 'INVALID_CHARS',
          message: 'Formation name contains invalid characters: < > " \' &'
        });
      }
    }

    // Direction validation
    if (data.direction !== undefined && data.direction !== null) {
      const validDirections = ['left', 'right'];
      if (!validDirections.includes(data.direction)) {
        errors.push({
          field: 'direction',
          code: 'INVALID_VALUE',
          message: 'Direction must be "left", "right", or null',
          value: data.direction
        });
      }
    }

    // Player positions validation
    if (!Array.isArray(data.player_positions)) {
      errors.push({
        field: 'player_positions',
        code: 'INVALID_TYPE',
        message: 'Player positions must be an array'
      });
    } else {
      data.player_positions.forEach((pos: any, index: number) => {
        // Required position code
        if (!pos.position || typeof pos.position !== 'string') {
          errors.push({
            field: `player_positions[${index}].position`,
            code: 'REQUIRED',
            message: `Player ${index + 1}: position code is required`
          });
        }

        // Position code format (should be 1-3 uppercase letters)
        if (pos.position && !/^[A-Z]{1,3}$/.test(pos.position)) {
          errors.push({
            field: `player_positions[${index}].position`,
            code: 'INVALID_FORMAT',
            message: `Player ${index + 1}: position code must be 1-3 uppercase letters`,
            value: pos.position
          });
        }

        // Coordinates validation
        if (typeof pos.x !== 'number' || pos.x < 0 || pos.x > 53.3) {
          errors.push({
            field: `player_positions[${index}].x`,
            code: 'INVALID_RANGE',
            message: `Player ${index + 1}: X coordinate must be between 0 and 53.3 yards`,
            value: pos.x
          });
        }

        if (typeof pos.y !== 'number' || pos.y < 0 || pos.y > 50) {
          errors.push({
            field: `player_positions[${index}].y`,
            code: 'INVALID_RANGE',
            message: `Player ${index + 1}: Y coordinate must be between 0 and 50 yards`,
            value: pos.y
          });
        }
      });

      // Check for duplicate position codes
      const positions = data.player_positions.map((p: any) => p.position).filter(Boolean);
      const duplicates = positions.filter((pos: string, i: number) => positions.indexOf(pos) !== i);
      if (duplicates.length > 0) {
        warnings.push({
          field: 'player_positions',
          code: 'DUPLICATE_POSITIONS',
          message: `Duplicate position codes found: ${[...new Set(duplicates)].join(', ')}`,
          suggestion: 'Each position code should be unique within the formation'
        });
      }

      // Check for overlapping positions (within 1 yard)
      for (let i = 0; i < data.player_positions.length; i++) {
        for (let j = i + 1; j < data.player_positions.length; j++) {
          const p1 = data.player_positions[i];
          const p2 = data.player_positions[j];
          const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          if (distance < 1) {
            warnings.push({
              field: 'player_positions',
              code: 'OVERLAPPING_POSITIONS',
              message: `Positions ${p1.position} and ${p2.position} are too close (${distance.toFixed(1)} yards apart)`,
              suggestion: 'Consider spacing players at least 1 yard apart for better diagram clarity'
            });
          }
        }
      }
    }

    // Strength validation
    const validStrengths = ['left', 'right', 'balanced'];
    if (data.run_strength && !validStrengths.includes(data.run_strength)) {
      errors.push({
        field: 'run_strength',
        code: 'INVALID_VALUE',
        message: 'Run strength must be "left", "right", or "balanced"',
        value: data.run_strength
      });
    }

    if (data.pass_strength && !validStrengths.includes(data.pass_strength)) {
      errors.push({
        field: 'pass_strength',
        code: 'INVALID_VALUE',
        message: 'Pass strength must be "left", "right", or "balanced"',
        value: data.pass_strength
      });
    }

    // Strength player validation
    if (data.strength_player_position) {
      const hasPosition = data.player_positions?.some((p: any) => p.position === data.strength_player_position);
      if (!hasPosition) {
        errors.push({
          field: 'strength_player_position',
          code: 'INVALID_REFERENCE',
          message: `Strength player position "${data.strength_player_position}" not found in player positions`,
          value: data.strength_player_position
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Server-side formation validation (async checks)
   * Note: This method now takes service functions as parameters to avoid circular dependencies
   */
  static async validateFormationServer(
    data: any,
    existingId?: string,
    getPersonnelConfiguration?: (id: string) => Promise<any>,
    getFormationById?: (id: string) => Promise<any>
  ): Promise<ValidationResult> {
    const clientResult = this.validateFormation(data);
    const errors = [...clientResult.errors];
    const warnings = [...clientResult.warnings];

    // Name uniqueness check
    if (data.name && data.playbook_id) {
      try {
        const { data: existing } = await supabase
          .from('formations')
          .select('id')
          .eq('playbook_id', data.playbook_id)
          .ilike('name', data.name.trim())
          .neq('id', existingId || '')
          .limit(1);

        if (existing && existing.length > 0) {
          errors.push({
            field: 'name',
            code: 'DUPLICATE',
            message: 'A formation with this name already exists in this playbook'
          });
        }
      } catch (error) {
        warnings.push({
          field: 'name',
          code: 'VALIDATION_ERROR',
          message: 'Could not verify name uniqueness',
          suggestion: 'Check your connection and try again'
        });
      }
    }

    // Personnel reference validation
    if (data.personnel_id && getPersonnelConfiguration) {
      try {
        const personnel = await getPersonnelConfiguration(data.personnel_id);
        if (!personnel) {
          errors.push({
            field: 'personnel_id',
            code: 'INVALID_REFERENCE',
            message: 'Referenced personnel configuration does not exist',
            value: data.personnel_id
          });
        } else if (personnel.playbook_id !== data.playbook_id) {
          errors.push({
            field: 'personnel_id',
            code: 'INVALID_REFERENCE',
            message: 'Personnel configuration belongs to a different playbook',
            value: data.personnel_id
          });
        }
      } catch (error) {
        warnings.push({
          field: 'personnel_id',
          code: 'VALIDATION_ERROR',
          message: 'Could not verify personnel reference',
          suggestion: 'Check your connection and try again'
        });
      }
    }

    // Opposite formation validation
    if (data.opposite_formation_id && getFormationById) {
      try {
        const opposite = await getFormationById(data.opposite_formation_id);
        if (!opposite) {
          errors.push({
            field: 'opposite_formation_id',
            code: 'INVALID_REFERENCE',
            message: 'Referenced opposite formation does not exist',
            value: data.opposite_formation_id
          });
        } else if (opposite.playbook_id !== data.playbook_id) {
          errors.push({
            field: 'opposite_formation_id',
            code: 'INVALID_REFERENCE',
            message: 'Opposite formation belongs to a different playbook',
            value: data.opposite_formation_id
          });
        } else if (opposite.opposite_formation_id && opposite.opposite_formation_id !== (existingId || 'new')) {
          errors.push({
            field: 'opposite_formation_id',
            code: 'INVALID_REFERENCE',
            message: 'Opposite formation is already linked to a different formation',
            value: data.opposite_formation_id
          });
        }
      } catch (error) {
        warnings.push({
          field: 'opposite_formation_id',
          code: 'VALIDATION_ERROR',
          message: 'Could not verify opposite formation reference',
          suggestion: 'Check your connection and try again'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}