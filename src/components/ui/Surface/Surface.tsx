import React from "react";
import clsx from "clsx";

export type SurfaceVariant =
  | "card"
  | "subtle"
  | "inverse"
  | "app"
  | "header"
  | "modal";

export type Elevation = "none" | "card" | "dropdown" | "modal" | "overlay";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  elevation?: Elevation;
  border?: boolean;
  padding?: boolean;
  radius?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<SurfaceVariant, string> = {
  app: "surface-app",
  header: "surface-header",
  card: "surface-card",
  subtle: "surface-subtle",
  inverse: "surface-inverse",
  modal: "surface-card",
};

const elevationClasses: Record<Elevation, string> = {
  none: "",
  card: "elevation-card",
  dropdown: "elevation-dropdown",
  modal: "elevation-modal",
  overlay: "shadow-xl",
};

export const Surface: React.FC<SurfaceProps> = ({
  variant = "card",
  elevation = "none",
  border = false,
  padding = false,
  radius = "md",
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={clsx(
        variantClasses[variant],
        elevationClasses[elevation],
        border && "border-subtle",
        padding && "p-4",
        radius === "sm" && "rounded-sm",
        radius === "md" && "rounded-md",
        radius === "lg" && "rounded-lg",
        radius === "none" && "rounded-none",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Surface;
