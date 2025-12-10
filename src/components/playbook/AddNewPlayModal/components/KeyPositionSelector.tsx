import React from "react";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import { FormSelect } from "../../../ui";

interface KeyPositionSelectorProps {
  positions: string[];
  personnelId?: string;
  availablePositions: string[];
  onAdd: (position: string) => void;
  onRemove: (index: number) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}

/**
 * KeyPositionSelector Component
 *
 * Allows selection of key positions from personnel configuration.
 * Validates that selected positions exist in the active personnel group.
 *
 * Features:
 * - Dropdown validated against personnel config positions
 * - Shows available positions from selected personnel
 * - Chip-based UI for selected positions
 * - Prevents duplicate selections
 * - Disabled state when no personnel selected
 *
 * @example
 * <KeyPositionSelector
 *   positions={formData.key_positions || []}
 *   personnelId={formData.personnel}
 *   availablePositions={personnelConfig?.positions || []}
 *   onAdd={(pos) => setFormData({ ...formData, key_positions: [...(formData.key_positions || []), pos] })}
 *   onRemove={(index) => setFormData({ ...formData, key_positions: formData.key_positions?.filter((_, i) => i !== index) })}
 * />
 */
export const KeyPositionSelector: React.FC<KeyPositionSelectorProps> = ({
  positions,
  personnelId,
  availablePositions,
  onAdd,
  onRemove,
  label = "Key Positions",
  helperText,
  disabled = false,
}) => {
  const noPersonnel = !personnelId || availablePositions.length === 0;
  const availableToSelect = availablePositions.filter(
    (pos) => !positions.includes(pos)
  );

  return (
    <div className="space-y-2">
      {/* Label */}
      <Typography variant="label-md" className="block text-secondary">
        <Icon name="users" className="h-4 w-4 mr-2 inline" />
        {label}
        {positions.length > 0 && (
          <Typography
            variant="caption"
            as="span"
            color="muted"
            className="ml-2"
          >
            ({positions.length} selected)
          </Typography>
        )}
      </Typography>

      {/* Helper text */}
      {helperText && (
        <Typography variant="caption" color="muted">
          {helperText}
        </Typography>
      )}

      {/* No personnel warning */}
      {noPersonnel ? (
        <div className="p-3 bg-secondary rounded-md border border-muted">
          <Typography variant="body-sm" color="muted" className="italic">
            <Icon name="info" className="h-4 w-4 mr-2 inline" />
            Select personnel first to choose key positions
          </Typography>
        </div>
      ) : (
        <>
          {/* Position dropdown */}
          <FormSelect
            value=""
            onChange={(value) => {
              if (value && !positions.includes(value)) {
                onAdd(value);
              }
            }}
            disabled={disabled || availableToSelect.length === 0}
            placeholder={
              availableToSelect.length === 0
                ? "All positions selected"
                : "Select position..."
            }
            options={availableToSelect.map((position) => ({
              value: position,
              label: position,
            }))}
          />

          {/* Available positions hint */}
          {availableToSelect.length > 0 && (
            <Typography variant="caption" color="muted" className="italic">
              Available: {availableToSelect.join(", ")}
            </Typography>
          )}

          {/* Selected positions (chips) */}
          {positions.length > 0 && (
            <div className="flex flex-wrap gap-xs mt-sm p-sm bg-secondary rounded-md border border-border">
              {positions.map((pos, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-xs px-sm py-xs 
                             bg-success-subtle text-success-default rounded-md text-sm font-medium
                             border border-success-muted transition-colors hover:bg-success-muted"
                >
                  <Icon name="map-pin" className="h-3 w-3" />
                  <span>{pos}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={disabled}
                    className="hover:text-success-emphasis focus:outline-none focus:ring-2 
                               focus:ring-success-default rounded disabled:opacity-50 
                               disabled:cursor-not-allowed"
                    aria-label={`Remove ${pos} position`}
                  >
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
