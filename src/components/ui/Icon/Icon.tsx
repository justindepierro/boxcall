import React from "react";
import { getIconComponent } from "./registry";

type IconSize = number | "xs" | "sm" | "md" | "lg" | "xl";

type IconProps = {
  name: string;
  size?: IconSize;
  color?: string;
  className?: string;
};

const sizeMap: Record<Exclude<IconSize, number>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = "currentColor",
  className = "",
}) => {
  const IconComponent = getIconComponent(name);
  if (!IconComponent) return null;
  const pixelSize =
    typeof size === "number" ? size : sizeMap[size] || sizeMap["md"];
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: pixelSize,
        height: pixelSize,
        minWidth: pixelSize,
        minHeight: pixelSize,
        maxWidth: pixelSize,
        maxHeight: pixelSize,
      }}
    >
      <IconComponent width={pixelSize} height={pixelSize} color={color} />
    </span>
  );
};

export default Icon;
export { Icon };
