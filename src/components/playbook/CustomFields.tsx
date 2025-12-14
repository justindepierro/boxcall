import { Typography } from "../design-system/Typography";
import { FormSelect } from "../ui";
// (Removed unused lucide-react icon imports after emoji cleanup)
/**
 * Custom Fields Component
 * Renders team-specific custom fields in the Play Builder
 */

import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon/Icon";
import { customFieldsService } from "@services/customFieldsService";
import { logError } from "../../utils/logger";
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

// Common input classes
const COMMON_INPUT_CLASSES =
  "w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-jade-500 focus:border-jade-500";

// Individual field type renderers
const TextInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={COMMON_INPUT_CLASSES}
  />
);

const UrlInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <input
    type="url"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="https://example.com"
    className={COMMON_INPUT_CLASSES}
  />
);

const NumberInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => (
  <input
    type="number"
    value={value || ""}
    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    className={COMMON_INPUT_CLASSES}
  />
);

const DateInput: React.FC<{
  value: Date | string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const dateValue = (() => {
    if (value instanceof Date) return value.toISOString().split("T")[0];
    if (typeof value === "string") return value;
    return "";
  })();

  return (
    <input
      type="date"
      value={dateValue}
      onChange={(e) => onChange(e.target.value)}
      className={COMMON_INPUT_CLASSES}
    />
  );
};

const BooleanInput: React.FC<{
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      checked={value || false}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 text-jade-600 focus:ring-jade-500 border-light rounded-lg"
    />
    <span className="text-sm text-primary">{label}</span>
  </label>
);

const MultiSelectInput: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}> = ({ value, onChange, options }) => {
  const selectedValues = value || [];

  return (
    <div className="space-y-2">
      {options.map((option) => (
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
              onChange(newValues);
            }}
            className="h-4 w-4 text-jade-600 focus:ring-jade-500 border-light rounded-lg"
          />
          <span className="text-sm text-primary">{option}</span>
        </label>
      ))}
    </div>
  );
};

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
        logError("Error loading custom field definitions:", error);
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

    switch (definition.field_type) {
      case "text":
        return (
          <TextInput
            value={value as string}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
            placeholder={definition.field_description}
          />
        );

      case "url":
        return (
          <UrlInput
            value={value as string}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
          />
        );

      case "number":
        return (
          <NumberInput
            value={value as number}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
          />
        );

      case "date":
        return (
          <DateInput
            value={value as Date | string}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
          />
        );

      case "boolean":
        return (
          <BooleanInput
            value={value as boolean}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
            label={definition.field_label}
          />
        );

      case "select":
        return (
          <FormSelect
            value={(value as string) || ""}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
            placeholder="Select..."
            options={
              definition.field_options?.map((option) => ({
                value: option,
                label: option,
              })) || []
            }
          />
        );

      case "multi_select":
        return (
          <MultiSelectInput
            value={value as string[]}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
            options={definition.field_options || []}
          />
        );

      default:
        return (
          <TextInput
            value={String(value || "")}
            onChange={(val) => updateFieldValue(definition.field_name, val)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-secondary rounded-lg w-3/4"></div>
        <div className="h-10 bg-secondary rounded-lg"></div>
        <div className="h-4 bg-secondary rounded-lg w-1/2"></div>
        <div className="h-10 bg-secondary rounded-lg"></div>
      </div>
    );
  }

  if (fieldDefinitions.length === 0) {
    return (
      <div className={`text-center py-6 text-secondary ${className}`}>
        <Icon name="settings" className="h-8 w-8 mx-auto mb-2 text-secondary" />
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
              className="flex items-center space-x-2 font-medium text-primary"
            >
              {getFieldIcon(definition.field_type)}
              <span>
                {definition.field_label}
                {definition.is_required && (
                  <span className="text-error ml-1">*</span>
                )}
              </span>
            </Typography>
          )}

          {definition.field_description &&
            definition.field_type !== "boolean" && (
              <p className="text-xs text-secondary mb-2">
                {definition.field_description}
              </p>
            )}

          <div className="relative">{renderFieldInput(definition)}</div>

          {definition.field_type === "multi_select" && (
            <div className="text-xs text-secondary">
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
        logError("Error loading grouped custom fields:", error);
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
            <div className="h-6 bg-secondary rounded-lg w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary rounded-lg w-2/3"></div>
              <div className="h-10 bg-secondary rounded-lg"></div>
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
            className="text-primary flex items-center space-x-2"
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
