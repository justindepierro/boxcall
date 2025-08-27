import React from "react";
import { getIconComponent } from "./registry";
import type { IconProps } from "./types";
import { sizeMap } from "./types";

const FALLBACK_ICON = getIconComponent("help-circle");

const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "currentColor",
  className = "",
  strokeWidth,
  tabIndex,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}) => {
  // Defensive: handle missing name
  if (!name) {
    return (
      <span role="img" aria-label="icon" className={className}>
        {FALLBACK_ICON ? (
          <FALLBACK_ICON width={sizeMap.md} height={sizeMap.md} color={color} />
        ) : (
          "?"
        )}
      </span>
    );
  }

  const IconComponent = getIconComponent(name);
  const pixelSize =
    typeof size === "number"
      ? size
      : sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
  const label = ariaLabel || name;
  const isHidden = !!ariaHidden;

  // Fallback if icon missing
  if (!IconComponent) {
    if (isHidden) {
      return (
        <span
          aria-hidden="true"
          className={className}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: pixelSize,
            height: pixelSize,
          }}
          tabIndex={tabIndex}
        >
          {FALLBACK_ICON ? (
            <FALLBACK_ICON
              width={pixelSize}
              height={pixelSize}
              color={color}
              aria-hidden="true"
              strokeWidth={strokeWidth}
            />
          ) : (
            "?"
          )}
        </span>
      );
    }
    return (
      <span
        role="img"
        aria-label={label}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: pixelSize,
          height: pixelSize,
        }}
        tabIndex={tabIndex}
      >
        {FALLBACK_ICON ? (
          <FALLBACK_ICON
            width={pixelSize}
            height={pixelSize}
            color={color}
            aria-hidden="true"
            strokeWidth={strokeWidth}
          />
        ) : (
          "?"
        )}
      </span>
    );
  }

  // Main icon
  if (isHidden) {
    return (
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: pixelSize,
          height: pixelSize,
        }}
        tabIndex={tabIndex}
      >
        <IconComponent
          width={pixelSize}
          height={pixelSize}
          color={color}
          aria-hidden="true"
          strokeWidth={strokeWidth}
        />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: pixelSize,
        height: pixelSize,
      }}
      tabIndex={tabIndex}
    >
      <IconComponent
        width={pixelSize}
        height={pixelSize}
        color={color}
        aria-hidden="true"
        strokeWidth={strokeWidth}
      />
    </span>
  );
};

export default Icon;
export { Icon };
