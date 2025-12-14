/**
 * PersonnelConfigurationModal UI Components
 *
 * Smaller UI pieces for the modal
 */

import React from "react";
import { Icon } from "../../ui/Icon";
import { Button } from "../../ui/Button/Button";
import { Typography } from "../../design-system/Typography";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import type {
  ConfigurationHeaderProps,
  EmptyStateProps,
  ActionButtonsProps,
} from "./types";

/**
 * Header with title and add button
 */
export const ConfigurationHeader: React.FC<ConfigurationHeaderProps> = ({
  onAddConfiguration,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <Typography variant="headline-sm">Personnel Configurations</Typography>
      <Typography variant="body-sm" color="muted" className="mt-1">
        Define your personnel groupings with custom labels
      </Typography>
    </div>
    <Button
      onClick={() => {
        triggerHapticFeedback("light");
        onAddConfiguration();
      }}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Icon name="plus" className="w-4 h-4" />
      Add New
    </Button>
  </div>
);

/**
 * Empty state when no configurations exist
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  onAddConfiguration,
}) => (
  <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-default">
    <Icon name="users" className="w-12 h-12 mx-auto mb-3 text-tertiary" />
    <Typography variant="body-md" color="muted" className="mb-2">
      No personnel configurations yet
    </Typography>
    <Typography variant="caption" color="muted" className="mb-4">
      Create your first personnel grouping to get started
    </Typography>
    <Button
      onClick={() => {
        triggerHapticFeedback("light");
        onAddConfiguration();
      }}
      variant="outline"
      size="sm"
    >
      <Icon name="plus" className="w-4 h-4 mr-2" />
      Add Personnel Configuration
    </Button>
  </div>
);

/**
 * Action buttons (Cancel/Save)
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  justSaved,
  onCancel,
  onSave,
}) => (
  <div className="flex gap-3 pt-4 border-t border-default">
    <Button
      onClick={() => {
        triggerHapticFeedback("light");
        onCancel();
      }}
      variant="outline"
      className="flex-1 h-11"
    >
      Cancel
    </Button>
    <Button onClick={onSave} variant="primary" className="flex-1 h-11">
      {justSaved ? (
        <>
          <Icon name="check-circle" className="w-4 h-4 mr-2" />
          Saved!
        </>
      ) : (
        "Save Personnel"
      )}
    </Button>
  </div>
);

/**
 * Loading state for the modal
 */
export const LoadingContent: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-text-secondary">Loading personnel data...</div>
  </div>
);
