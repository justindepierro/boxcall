/**
 * Accessibility Icon Components
 *
 * Coach-friendly accessibility components with larger touch targets
 * Optimized for mobile devices and accessibility guidelines
 */

import React from "react";
import { Icon } from "./Icon";
import type { IconProps } from "./types";

// Ensure required icon categories are loaded
import "./categories/ActionIcons";
import "./categories/NavigationIcons";
import "./categories/BusinessIcons";

// Coach-friendly accessibility components
export const CoachActionIcon: React.FC<{
  name: string;
  color?: IconProps["color"];
}> = ({ name, color = "slate" }) => (
  <Icon name={name as any} size="lg" color={color} />
);

export const HeaderIcon: React.FC<{
  name: string;
  color?: IconProps["color"];
}> = ({ name, color = "navy" }) => (
  <Icon name={name as any} size="xl" color={color} />
);

export const TouchTargetIcon: React.FC<{
  name: string;
  color?: IconProps["color"];
}> = ({ name, color = "current" }) => (
  <Icon name={name as any} size="touch" color={color} />
);

// Quick access for common coach actions
export const CoachEditIcon: React.FC = () => (
  <CoachActionIcon name="edit" color="slate" />
);

export const CoachDeleteIcon: React.FC = () => (
  <CoachActionIcon name="delete" color="error" />
);

export const CoachPDFIcon: React.FC = () => (
  <CoachActionIcon name="pdf" color="jade" />
);

export const CoachCloseIcon: React.FC = () => (
  <TouchTargetIcon name="close" color="slate" />
);
