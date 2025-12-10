import { memo } from "react";
import { Typography } from "../design-system/Typography";
import { FormSelect } from "../ui";
import type { ProfileField } from "../../types/profileFields";

export type FormValue = string | number | string[] | boolean | null | undefined;

interface FormFieldProps {
  field: ProfileField;
  value: FormValue;
  onChange: (value: FormValue) => void;
  error?: string;
}

export const FormField = memo<FormFieldProps>(
  ({ field, value, onChange, error }) => {
    const baseInputClasses = `
    w-full p-sm border rounded-lg transition-colors
    ${
      error
        ? "border-error focus:border-error"
        : "border-border focus:border-text-primary"
    }
    focus:outline-none focus:ring-2 focus:ring-text-primary/20
    bg-primary
  `;

    const renderInput = () => {
      switch (field.type) {
        case "textarea":
          return (
            <textarea
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={`${baseInputClasses} min-h-24 resize-y`}
              rows={4}
            />
          );

        case "number":
          return (
            <input
              type="number"
              value={
                typeof value === "number" ? value : (value as string) || ""
              }
              onChange={(e) =>
                onChange(e.target.value ? parseFloat(e.target.value) : "")
              }
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={baseInputClasses}
            />
          );

        case "select":
          return (
            <FormSelect
              value={String(value || "")}
              onChange={(val) => onChange(val)}
              placeholder={`Select ${field.label}`}
              options={field.options?.map((option) => ({
                value: option.value,
                label: option.label,
              })) || []}
            />
          );

        case "multi-select": {
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div className="space-y-xs">
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, option.value]);
                      } else {
                        onChange(
                          selectedValues.filter(
                            (v: string) => v !== option.value
                          )
                        );
                      }
                    }}
                    className="rounded border-secondary text-jade-600 focus:ring-jade-500"
                  />
                  <Typography variant="body-sm">{option.label}</Typography>
                </label>
              ))}
            </div>
          );
        }

        case "phone":
          return (
            <input
              type="tel"
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              className={baseInputClasses}
            />
          );

        case "email":
          return (
            <input
              type="email"
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
          );

        case "url":
          return (
            <input
              type="url"
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
          );

        default:
          return (
            <input
              type="text"
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClasses}
            />
          );
      }
    };

    return (
      <div className="space-y-1">
        <label className="block">
          <Typography
            variant="body-sm"
            className="font-medium text-primary mb-1"
          >
            {field.label}
            {field.required && <span className="text-error ml-1">*</span>}
          </Typography>
          {renderInput()}
        </label>

        {field.description && (
          <Typography variant="body-xs" className="text-muted">
            {field.description}
          </Typography>
        )}

        {error && (
          <Typography variant="body-xs" className="text-error">
            {error}
          </Typography>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

interface ProfileFormSectionProps {
  title: string;
  fields: ProfileField[];
  values: Record<string, FormValue>;
  onChange: (key: string, value: FormValue) => void;
  errors?: Record<string, string>;
}

export const ProfileFormSection = memo<ProfileFormSectionProps>(
  ({ title, fields, values, onChange, errors = {} }) => {
    return (
      <div className="space-y-md">
        <Typography
          variant="headline-sm"
          className="text-primary border-b border-muted pb-xs"
        >
          {title}
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {fields.map((field) => (
            <div
              key={field.key}
              className={
                field.type === "textarea" || field.type === "multi-select"
                  ? "md:col-span-2"
                  : ""
              }
            >
              <FormField
                field={field}
                value={values[field.key]}
                onChange={(value) => onChange(field.key, value)}
                error={errors[field.key]}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ProfileFormSection.displayName = "ProfileFormSection";
