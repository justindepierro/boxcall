import { createTeamSchema } from "../schemas/createTeamSchema";
import type { TeamCreationInput } from "../services/teamCreationService";

export interface ValidationResult {
  success: boolean;
  data?: TeamCreationInput;
  errors?: Record<string, string[]>;
  fieldErrors?: Record<string, string>;
}

/**
 * Team creation form validation service
 */
export class TeamValidationService {
  
  /**
   * Validate team creation form data
   */
  static validateTeamForm(formData: any): ValidationResult {
    const validation = createTeamSchema.safeParse(formData);

    if (!validation.success) {
      // Convert Zod errors to a more usable format
      const fieldErrors: Record<string, string> = {};
      const errors: Record<string, string[]> = {};
      
      validation.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        const message = issue.message;
        
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(message);
        
        // Store first error as field error for easy access
        if (!fieldErrors[field]) {
          fieldErrors[field] = message;
        }
      });

      return {
        success: false,
        errors,
        fieldErrors
      };
    }

    return {
      success: true,
      data: validation.data
    };
  }

  /**
   * Validate a specific field
   */
  static validateField(fieldName: string, value: any, formData: any): { isValid: boolean; error?: string } {
    const fullFormData = { ...formData, [fieldName]: value };
    const result = this.validateTeamForm(fullFormData);
    
    if (result.success) {
      return { isValid: true };
    }
    
    const error = result.fieldErrors?.[fieldName];
    return {
      isValid: !error,
      error
    };
  }

  /**
   * Check if form data is complete for a specific step
   */
  static isStepComplete(stepId: string, formData: any): boolean {
    switch (stepId) {
      case 'team-info':
        return !!(formData.teamName && formData.sport && formData.season);
      
      case 'school-info':
        return !!(formData.schoolName && formData.schoolDistrict);
      
      case 'contact-info':
        return !!(formData.ownerFirstName && formData.ownerLastName && formData.ownerEmail);
      
      case 'review':
        return this.validateTeamForm(formData).success;
      
      default:
        return false;
    }
  }
}