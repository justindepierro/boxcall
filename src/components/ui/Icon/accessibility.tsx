/**
 * Accessibility Icon Components
 *
 * Coach-friendly accessibility components with larger touch targets
 * Optimized for mobile devices and accessibility guidelines
 */

import React from "react";
import { Icon } from "./Icon";
import type { IconProps, IconName } from "./types";

// Coach-friendly accessibility components
export const CoachActionIcon: React.FC<{
  name: IconName;
  color?: IconProps["color"];
}> = ({ name, color = "navy" }) => <Icon name={name} size="lg" color={color} />;

export const HeaderIcon: React.FC<{
  name: IconName;
  color?: IconProps["color"];
}> = ({ name, color = "navy" }) => <Icon name={name} size="xl" color={color} />;

export const TouchTargetIcon: React.FC<{
  name: IconName;
  color?: IconProps["color"];
}> = ({ name, color = "current" }) => (
  <Icon name={name} size="touch" color={color} />
);

// Quick access for common coach actions
export const CoachEditIcon: React.FC = () => (
  <CoachActionIcon name="award" color="info" />
);
export const CoachDeleteIcon: React.FC = () => (
  <CoachActionIcon name="award" color="error" />
);
export const CoachPDFIcon: React.FC = () => (
  <CoachActionIcon name="award" color="jade" />
);
export const CoachCloseIcon: React.FC = () => (
  <TouchTargetIcon name="award" color="info" />
);
