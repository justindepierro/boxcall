import { Typography } from "../design-system/Typography";
// (Removed unused lucide-react icon imports after emoji cleanup)
/**
 * Custom Fields Component
 * Renders team-specific custom fields in the Play Builder
 */

import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon/Icon";
import { customFieldsService } from "@services/customFieldsService";
import type {
  CustomFieldDefinition,
  CustomFieldValues,
  CustomFieldValue,
} from "../../types/play";

interface CustomFieldsProps {
  teamId: string;
  customFields?: CustomFieldValues;
  onCustomFieldsChange: (fields: CustomFieldValues) => void;
  category?: string; // Filter by category: 'analysis', 'tracking', 'conditions', 'formation'
  className?: string;
}

export const CustomFields: React.FC<CustomFieldsProps> = ({
  teamId,
  customFields = {},
  onCustomFieldsChange,
  category,
  className = "",
}) => {
  const [fieldDefinitions, setFieldDefinitions] = useState<
    CustomFieldDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<CustomFieldValues>(customFields);

  // Load field definitions
  useEffect(() => {
    const loadDefinitions = async () => {
      try {
        setLoading(true);
        const definitions =
          await customFieldsService.getFieldDefinitions(teamId);
        const filteredDefs = category
          ? definitions.filter((def) => def.category === category)
          : definitions;
        setFieldDefinitions(filteredDefs);

        // Merge with defaults
        const mergedValues = await customFieldsService.mergeWithDefaults(
          teamId,
          customFields
        );
        setValues(mergedValues);
      } catch (error) {
        console.error("Error loading custom field definitions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDefinitions();
  }, [teamId, category, customFields]);

  // Update field value
  const updateFieldValue = (fieldName: string, value: CustomFieldValue) => {
    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);
    onCustomFieldsChange(newValues);
  };

  // Get field icon based on type
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case "text":
        return <Icon name="type" className="h-4 w-4" />;
      case "number":
        return <Icon name="hash" className="h-4 w-4" />;
      case "boolean":
        return <Icon name="toggle-left" className="h-4 w-4" />;
      case "date":
        return <Icon name="calendar" className="h-4 w-4" />;
      case "url":
        return <Icon name="link" className="h-4 w-4" />;
      case "select":
      case "multi_select":
        return <Icon name="list" className="h-4 w-4" />;
      default:
        return <Icon name="settings" className="h-4 w-4" />;
    }
  };

  // Render field input based on type
  const renderFieldInput = (definition: CustomFieldDefinition) => {
    const value = values[definition.field_name];
    const commonClasses =
      "w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-jade-500 focus:border-jade-500";

    switch (definition.field_type) {
      case "text":
        return (
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) =>
              updateFieldValue(definition.field_name, e.target.value)
            }
            placeholder={definition.field_description}
            className={commonClasses}
          />
        );

      case "url":
        return (
          <input
            type="url"
            value={(value as string) || ""}
            onChange={(e) =>
              updateFieldValue(definition.field_name, e.target.value)
            }
            placeholder="https://example.com"
            className={commonClasses}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={(value as number) || ""}
            onChange={(e) =>
              updateFieldValue(
                definition.field_name,
                parseFloat(e.target.value) || 0
              )
            }
            className={commonClasses}
          />
        );

      case "date": {
        const dateValue =
          value instanceof Date
            ? value.toISOString().split("T")[0]
            : typeof value === "string"
              ? value
              : "";
        return (
          <input
            type="date"
            value={dateValue}
            onChange={(e) =>
              updateFieldValue(definition.field_name, e.target.value)
            }
            className={commonClasses}
          />
        );
      }

      case "boolean":
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(value as boolean) || false}
              onChange={(e) =>
                updateFieldValue(definition.field_name, e.target.checked)
              }
              className="h-4 w-4 text-jade-600 focus:ring-jade-500 border-border-light rounded-lg"
            />
            <span className="text-sm text-text-primary">
              {definition.field_label}
            </span>
          </label>
        );

      case "select":
        return (
          <select
            value={(value as string) || ""}
            onChange={(e) =>
              updateFieldValue(definition.field_name, e.target.value)
            }
            className={commonClasses}
          >
            <option value="">Select...</option>
            {definition.field_options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "multi_select": {
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {definition.field_options?.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v) => v !== option);
                    updateFieldValue(definition.field_name, newValues);
                  }}
                  className="h-4 w-4 text-jade-600 focus:ring-jade-500 border-border-light rounded-lg"
                />
                <span className="text-sm text-text-primary">{option}</span>
              </label>
            ))}
          </div>
        );
      }

      default:
        return (
          <input
            type="text"
            value={String(value || "")}
            onChange={(e) =>
              updateFieldValue(definition.field_name, e.target.value)
            }
            className={commonClasses}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-surface-secondary rounded-lg w-3/4"></div>
        <div className="h-10 bg-surface-secondary rounded-lg"></div>
        <div className="h-4 bg-surface-secondary rounded-lg w-1/2"></div>
        <div className="h-10 bg-surface-secondary rounded-lg"></div>
      </div>
    );
  }

  if (fieldDefinitions.length === 0) {
    return (
      <div className={`text-center py-6 text-text-secondary ${className}`}>
        <Icon
          name="settings"
          className="h-8 w-8 mx-auto mb-2 text-text-secondary"
        />
        <p className="text-sm">No custom fields defined for this category.</p>
        <p className="text-xs mt-1">Contact your admin to add custom fields.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {fieldDefinitions.map((definition) => (
        <div key={definition.field_name} className="space-y-2">
          {definition.field_type !== "boolean" && (
            <Typography
              variant="body-sm"
              as="label"
              className="flex items-center space-x-2 font-medium text-text-primary"
            >
              {getFieldIcon(definition.field_type)}
              <span>
                {definition.field_label}
                {definition.is_required && (
                  <span className="text-text-error ml-1">*</span>
                )}
              </span>
            </Typography>
          )}

          {definition.field_description &&
            definition.field_type !== "boolean" && (
              <p className="text-xs text-text-secondary mb-2">
                {definition.field_description}
              </p>
            )}

          <div className="relative">{renderFieldInput(definition)}</div>

          {definition.field_type === "multi_select" && (
            <div className="text-xs text-text-secondary">
              Selected:{" "}
              {((values[definition.field_name] as string[]) || []).length} items
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Component for grouped custom fields display
interface CustomFieldsGroupedProps {
  teamId: string;
  customFields?: CustomFieldValues;
  onCustomFieldsChange: (fields: CustomFieldValues) => void;
  className?: string;
}

export const CustomFieldsGrouped: React.FC<CustomFieldsGroupedProps> = ({
  teamId,
  customFields = {},
  onCustomFieldsChange,
  className = "",
}) => {
  const [fieldsByCategory, setFieldsByCategory] = useState<
    Record<string, CustomFieldDefinition[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupedFields = async () => {
      try {
        setLoading(true);
        const grouped = await customFieldsService.getFieldsByCategory(teamId);
        setFieldsByCategory(grouped);
      } catch (error) {
        console.error("Error loading grouped custom fields:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupedFields();
  }, [teamId]);

  const categoryLabels = {
    analysis: "Analysis & Scouting",
    tracking: "Practice & Usage Tracking",
    conditions: "Environmental Conditions",
    formation: "Formation & Execution",
    general: "General Information",
  };

  const categoryIcons = {
    analysis: "🔍",
    tracking: "📊",
    conditions: "🌤️",
    formation: "🏈",
    general: "📋",
  } as const;

  if (loading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-6 bg-surface-secondary rounded-lg w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-surface-secondary rounded-lg w-2/3"></div>
              <div className="h-10 bg-surface-secondary rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(fieldsByCategory).map(([category, _fields]) => (
        <div key={category} className="space-y-3">
          <Typography
            variant="label-lg"
            as="h4"
            className="text-text-primary flex items-center space-x-2"
          >
            <span className="text-lg">
              {categoryIcons[category as keyof typeof categoryIcons] || "📋"}
            </span>
            <span>
              {categoryLabels[category as keyof typeof categoryLabels] ||
                category}
            </span>
          </Typography>

          <CustomFields
            teamId={teamId}
            customFields={customFields}
            onCustomFieldsChange={onCustomFieldsChange}
            category={category}
          />
        </div>
      ))}
    </div>
  );
};
