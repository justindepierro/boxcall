/**
 * Convenience Icon Components
 *
 * Pre-configured icon components for common use cases
 * Automatically loads the required icon categories
 */

import React from "react";

import { Icon } from "./Icon";

// Categories are no longer preloaded here to preserve proper code-splitting.
// The base Icon component directly maps required lucide icons, avoiding mixed
// dynamic+static imports and reducing bundle warnings.

// Common convenience components
export const PlayIcon: React.FC = () => <Icon name="play" color="primary" />;
export const PauseIcon: React.FC = () => (
  <Icon name="pause" color="secondary" />
);
export const EditIcon: React.FC = () => (
  <Icon name="edit" size="sm" color="secondary" />
);
export const DeleteIcon: React.FC = () => (
  <Icon name="delete" size="sm" color="error" />
);
export const AddIcon: React.FC = () => <Icon name="plus" color="primary" />;
export const PDFIcon: React.FC = () => <Icon name="pdf" color="primary" />;
export const CalendarIcon: React.FC = () => (
  <Icon name="calendar" color="navy" />
);
export const ClockIcon: React.FC = () => (
  <Icon name="clock" color="secondary" />
);
export const TeamIcon: React.FC = () => <Icon name="team" color="navy" />;
export const SettingsIcon: React.FC = () => (
  <Icon name="settings" color="secondary" />
);
