/**
 * IconButton - lightweight chromeless icon action control
 * Purpose: internal UI chrome (close modal, clear input, toggle visibility)
 */
import React, { forwardRef } from "react";
import clsx from "clsx";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/Button.types";
import { Tooltip } from "../Tooltip/Tooltip";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm";
  variant?: "ghost" | "subtle" | "danger";
  tooltip?: string; // contextual help tooltip (uses Tooltip component)
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
  "aria-label": string; // required for icon-only accessibility
}

const sizeStyles = {
  xs: "h-6 w-6 p-1 text-[11px]",
  sm: "h-8 w-8 p-2 text-xs",
};

const variantStyles = {
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-surface-neutral active:bg-surface-neutral-dark",
  subtle:
    "text-text-muted hover:text-text-primary hover:bg-surface-neutral/60 active:bg-surface-neutral-dark/60",
  danger:
    "text-text-error hover:text-text-error hover:surface-subtle active:bg-surface-error",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      size = "xs",
      variant = "ghost",
      className,
      tooltip,
      tooltipPlacement = "top",
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

    const button = (
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
        {...rest}
      >
        {children}
      </Button>
    );

    // Wrap with Tooltip if tooltip prop provided
    if (tooltip && !disabled) {
      return (
        <Tooltip content={tooltip} placement={tooltipPlacement}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

export default IconButton;
