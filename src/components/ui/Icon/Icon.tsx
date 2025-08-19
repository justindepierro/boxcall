/**
 * Icon Component - Unified, Professional, Future-Proof
 *
 * This file should remain under 1000 lines. Refactor as needed to maintain clarity and maintainability.
 */
import React from "react";
import { getIconComponent } from "./registry";
import { sizeMap } from "./types";
import type { IconProps } from "./types";

/**
 * Icon - Main entry point for all icons in the system
 * Handles accessibility, fallback, and traceability
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "current",
  className = "",
  strokeWidth = 2,
  ...rest
}) => {
  const IconComponent = getIconComponent(name);
  const pixelSize =
    typeof size === "number" ? size : sizeMap[size] || sizeMap.md;
  const FallbackIconComponent = getIconComponent("help-circle");
  const ariaLabel = `icon-${name}`;
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={`icon-root ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...rest}
    >
      {IconComponent ? (
        <IconComponent
          width={pixelSize}
          height={pixelSize}
          color={color}
          strokeWidth={strokeWidth}
          aria-hidden="true"
        />
      ) : FallbackIconComponent ? (
        <FallbackIconComponent
          width={pixelSize}
          height={pixelSize}
          color={color}
          strokeWidth={strokeWidth}
          aria-hidden="true"
        />
      ) : (
        <span style={{ fontSize: pixelSize }} aria-hidden="true">
          ?
        </span>
      )}
    </span>
  );
};

export default Icon;
