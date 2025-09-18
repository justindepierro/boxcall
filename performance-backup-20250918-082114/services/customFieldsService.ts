/**
 * Custom Fields Service
 * Handles team-specific custom field definitions and values for plays
 */

import type {
  CustomFieldDefinition,
  CustomFieldValues,
  CustomFieldValue,
} from "../types/play";

export class CustomFieldsService {
  private static instance: CustomFieldsService;
  private fieldDefinitions: Map<string, CustomFieldDefinition[]> = new Map(); // team_id -> definitions

  static getInstance(): CustomFieldsService {
    if (!CustomFieldsService.instance) {
      CustomFieldsService.instance = new CustomFieldsService();
    }
    return CustomFieldsService.instance;
  }

  /**
   * Get custom field definitions for a team
   */
  async getFieldDefinitions(teamId: string): Promise<CustomFieldDefinition[]> {
    // Check cache first
    if (this.fieldDefinitions.has(teamId)) {
      return this.fieldDefinitions.get(teamId) || [];
    }

    // In production, this would fetch from Supabase
    // For now, return common field definitions
    const commonFields: CustomFieldDefinition[] = [
      {
        id: "coach_rating",
        team_id: teamId,
        field_name: "coach_rating",
        field_type: "number",
        field_label: "Coach Rating (1-10)",
        field_description: "Rate this play 1-10 for execution difficulty",
        default_value: 7,
        is_required: false,
        display_order: 1,
        category: "analysis",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "install_date",
        team_id: teamId,
        field_name: "install_date",
        field_type: "date",
        field_label: "Install Date",
        field_description: "When was this play first installed?",
        default_value: null,
        is_required: false,
        display_order: 2,
        category: "tracking",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "last_practiced",
        team_id: teamId,
        field_name: "last_practiced",
        field_type: "date",
        field_label: "Last Practiced",
        field_description: "Last date this play was practiced",
        default_value: null,
        is_required: false,
        display_order: 3,
        category: "tracking",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "scout_notes",
        team_id: teamId,
        field_name: "scout_notes",
        field_type: "text",
        field_label: "Scout Notes",
        field_description: "Notes from film study/scouting",
        default_value: "",
        is_required: false,
        display_order: 4,
        category: "analysis",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "weather_conditions",
        team_id: teamId,
        field_name: "weather_conditions",
        field_type: "select",
        field_label: "Weather Preference",
        field_description: "Best weather conditions for this play",
        field_options: [
          "Sunny/Dry",
          "Light Rain",
          "Heavy Rain",
          "Snow",
          "Wind 15+mph",
          "Any",
        ],
        default_value: "Any",
        is_required: false,
        display_order: 5,
        category: "conditions",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "field_condition",
        team_id: teamId,
        field_name: "field_condition",
        field_type: "select",
        field_label: "Field Condition",
        field_description: "Best field condition for execution",
        field_options: [
          "Natural Grass",
          "Artificial Turf",
          "Wet Field",
          "Muddy Field",
          "Any",
        ],
        default_value: "Any",
        is_required: false,
        display_order: 6,
        category: "conditions",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "opponent_tendency",
        team_id: teamId,
        field_name: "opponent_tendency",
        field_type: "multi_select",
        field_label: "Best vs Opponent",
        field_description: "Opponent tendencies this play works best against",
        field_options: [
          "Aggressive Pass Rush",
          "Cover 2 Teams",
          "Man Coverage",
          "Zone Teams",
          "Blitz Heavy",
          "Conservative",
        ],
        default_value: [],
        is_required: false,
        display_order: 7,
        category: "analysis",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "red_zone_variant",
        team_id: teamId,
        field_name: "red_zone_variant",
        field_type: "boolean",
        field_label: "Has Red Zone Variant",
        field_description:
          "Does this play have a specific red zone adjustment?",
        default_value: false,
        is_required: false,
        display_order: 8,
        category: "formation",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Cache the definitions
    this.fieldDefinitions.set(teamId, commonFields);
    return commonFields;
  }

  /**
   * Get field definitions grouped by category
   */
  async getFieldsByCategory(
    teamId: string
  ): Promise<Record<string, CustomFieldDefinition[]>> {
    const fields = await this.getFieldDefinitions(teamId);
    const grouped: Record<string, CustomFieldDefinition[]> = {};

    fields.forEach((field) => {
      if (!grouped[field.category]) {
        grouped[field.category] = [];
      }
      grouped[field.category].push(field);
    });

    // Sort by display_order within each category
    Object.keys(grouped).forEach((category) => {
      grouped[category].sort((a, b) => a.display_order - b.display_order);
    });

    return grouped;
  }

  /**
   * Validate custom field value against definition
   */
  validateFieldValue(
    definition: CustomFieldDefinition,
    value: CustomFieldValue
  ): boolean {
    if (
      definition.is_required &&
      (value === null || value === undefined || value === "")
    ) {
      return false;
    }

    if (value === null || value === undefined) {
      return true; // Optional field
    }

    switch (definition.field_type) {
      case "text":
      case "url":
        return typeof value === "string";

      case "number":
        return typeof value === "number" && !isNaN(value);

      case "boolean":
        return typeof value === "boolean";

      case "date":
        return (
          value instanceof Date ||
          (typeof value === "string" && !isNaN(Date.parse(value)))
        );

      case "select":
        return (
          typeof value === "string" &&
          (definition.field_options?.includes(value) || false)
        );

      case "multi_select":
        return (
          Array.isArray(value) &&
          value.every(
            (v) =>
              typeof v === "string" &&
              (definition.field_options?.includes(v) || false)
          )
        );

      default:
        return false;
    }
  }

  /**
   * Get default values for all fields
   */
  async getDefaultValues(teamId: string): Promise<CustomFieldValues> {
    const definitions = await this.getFieldDefinitions(teamId);
    const defaults: CustomFieldValues = {};

    definitions.forEach((def) => {
      if (def.default_value !== undefined && def.default_value !== null) {
        defaults[def.field_name] = def.default_value;
      }
    });

    return defaults;
  }

  /**
   * Merge custom field values with defaults
   */
  async mergeWithDefaults(
    teamId: string,
    customFields?: CustomFieldValues
  ): Promise<CustomFieldValues> {
    const defaults = await this.getDefaultValues(teamId);
    return { ...defaults, ...customFields };
  }

  /**
   * Create a new custom field definition (would save to Supabase in production)
   */
  async createFieldDefinition(
    definition: Omit<CustomFieldDefinition, "id" | "created_at" | "updated_at">
  ): Promise<CustomFieldDefinition> {
    const newDef: CustomFieldDefinition = {
      ...definition,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Update cache
    const teamFields = this.fieldDefinitions.get(definition.team_id) || [];
    teamFields.push(newDef);
    teamFields.sort((a, b) => a.display_order - b.display_order);
    this.fieldDefinitions.set(definition.team_id, teamFields);

    return newDef;
  }

  /**
   * Format field value for display
   */
  formatFieldValue(
    definition: CustomFieldDefinition,
    value: CustomFieldValue
  ): string {
    if (value === null || value === undefined) {
      return "-";
    }

    switch (definition.field_type) {
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        if (typeof value === "string") {
          return new Date(value).toLocaleDateString();
        }
        return String(value);

      case "boolean":
        return value ? "Yes" : "No";

      case "multi_select":
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return String(value);

      default:
        return String(value);
    }
  }

  /**
   * Get field definition by name
   */
  async getFieldDefinition(
    teamId: string,
    fieldName: string
  ): Promise<CustomFieldDefinition | undefined> {
    const definitions = await this.getFieldDefinitions(teamId);
    return definitions.find((def) => def.field_name === fieldName);
  }

  /**
   * Clear cache (useful for testing or when definitions change)
   */
  clearCache(teamId?: string): void {
    if (teamId) {
      this.fieldDefinitions.delete(teamId);
    } else {
      this.fieldDefinitions.clear();
    }
  }
}

// Export singleton instance
export const customFieldsService = CustomFieldsService.getInstance();
