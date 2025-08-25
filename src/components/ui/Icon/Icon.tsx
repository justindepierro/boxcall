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
export const Icon: React.FC<IconProps> = (props) => {
  const {
    name,
    size = "md",
    color = "current",
    className = "",
    strokeWidth = 2,
    tabIndex,
    ...rest
  } = props;
  // Prop validation and fallback
  const safeName = typeof name === "string" && name ? name : "help-circle";
  const safeSize =
    typeof size === "number" ? size : sizeMap[size] || sizeMap.md;
  const IconComponent = getIconComponent(safeName);
  const FallbackIconComponent = getIconComponent("help-circle");
  // Use restProps for all property access
  const restProps = rest as Record<string, unknown>;
  // Use custom aria-label if provided, otherwise default
  const customAriaLabel =
    typeof restProps["aria-label"] === "string"
      ? (restProps["aria-label"] as string)
      : undefined;
  const isDecorative =
    restProps["aria-hidden"] === "true" || restProps["aria-hidden"] === true;
  // Only spread role and aria-label if not decorative
  const spanProps: React.HTMLAttributes<HTMLSpanElement> = {
    className: `icon-root ${className}`.trim(),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    tabIndex,
    ...rest,
  };
  if (!isDecorative) {
    spanProps.role = "img";
    spanProps["aria-label"] = customAriaLabel || safeName;
  } else {
    // Remove aria-label if decorative
    delete spanProps["aria-label"];
  }
  return (
    <span {...spanProps}>
      {IconComponent ? (
        <IconComponent
          width={safeSize}
          height={safeSize}
          color={color}
          strokeWidth={strokeWidth}
          aria-hidden="true"
        />
      ) : FallbackIconComponent ? (
        <FallbackIconComponent
          width={safeSize}
          height={safeSize}
          color={color}
          strokeWidth={strokeWidth}
          aria-hidden="true"
        />
      ) : (
        <span style={{ fontSize: safeSize }} aria-hidden="true">
          ?
        </span>
      )}
    </span>
  );
};

export default Icon;
