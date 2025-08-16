/**
 * IconButton - lightweight chromeless icon action control
 * Purpose: internal UI chrome (close modal, clear input, toggle visibility)
 */
import clsx from "clsx";
import React, { forwardRef } from "react";

import { Button } from "../Button";

import type { ButtonProps } from "../Button/Button.types";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm";
  variant?: "ghost" | "subtle" | "danger";
  tooltip?: string; // optional native title fallback
  "aria-label": string; // required for icon-only accessibility
}

const sizeStyles = {
  xs: "h-6 w-6 p-1 text-[11px]",
  sm: "h-8 w-8 p-1.5 text-xs",
};

const variantStyles = {
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-neutral active:bg-surface-neutral-dark",
  subtle:
    "text-text-muted hover:text-text-primary hover:bg-surface-neutral/60 active:bg-surface-neutral-dark/60",
  danger:
    "text-red-600 hover:text-red-700 hover:surface-subtle active:bg-red-100",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      size = "xs",
      variant = "ghost",
      className,
      tooltip,
      children,
      disabled,
      type,
      ...rest
    },
    ref
  ) {
    // Map IconButton variants to existing Button variants.
    const buttonVariant: ButtonProps["variant"] =
      variant === "danger" ? "danger" : "ghost";
    const sizeMap: Record<
      NonNullable<IconButtonProps["size"]>,
      ButtonProps["size"]
    > = {
      xs: "xs",
      sm: "sm",
    };
    return (
      <Button
        ref={ref}
        type={type as ButtonProps["type"]}
        variant={buttonVariant}
        size={sizeMap[size]}
        disabled={disabled}
        className={clsx(
          sizeStyles[size],
          variant === "subtle" && variantStyles.subtle,
          variant === "ghost" && variantStyles.ghost,
          variant === "danger" && variantStyles.danger,
          "!rounded-sm !p-0",
          className
        )}
        title={tooltip}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);

export default IconButton;
