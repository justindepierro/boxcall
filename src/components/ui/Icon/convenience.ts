/**
 * Convenience Icon Components
 * 
 * Pre-configured icon components for common use cases
 * Automatically loads the required icon categories
 */

import React from "react";
import { Icon } from "./Icon";

// Ensure required icon categories are loaded
import "./categories/ActionIcons";
import "./categories/CalendarIcons";
import "./categories/SportsIcons";
import "./categories/NavigationIcons";
import "./categories/BusinessIcons";

// Common convenience components
export const PlayIcon: React.FC = () => <Icon name="play" color="jade" />;
export const PauseIcon: React.FC = () => <Icon name="pause" color="slate" />;
export const EditIcon: React.FC = () => <Icon name="edit" size="sm" color="slate" />;
export const DeleteIcon: React.FC = () => <Icon name="delete" size="sm" color="error" />;
export const AddIcon: React.FC = () => <Icon name="plus" color="jade" />;
export const PDFIcon: React.FC = () => <Icon name="pdf" color="jade" />;
export const CalendarIcon: React.FC = () => <Icon name="calendar" color="navy" />;
export const ClockIcon: React.FC = () => <Icon name="clock" color="slate" />;
export const TeamIcon: React.FC = () => <Icon name="team" color="navy" />;
export const SettingsIcon: React.FC = () => <Icon name="settings" color="slate" />;
