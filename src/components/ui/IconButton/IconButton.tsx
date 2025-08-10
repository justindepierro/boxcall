/**
 * IconButton - lightweight chromeless icon action control
 * Purpose: internal UI chrome (close modal, clear input, toggle visibility)
 */
import React, { forwardRef } from "react";
import clsx from "clsx";

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
  danger: "text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100",
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
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={rest.type || "button"}
        disabled={disabled}
        className={clsx(
          "inline-flex items-center justify-center rounded-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-jade focus-visible:ring-offset-2 transition-colors select-none",
          sizeStyles[size],
          variantStyles[variant],
          disabled && "opacity-40 cursor-not-allowed",
          className
        )}
        title={tooltip}
        {...rest}
      >
        {children}
        <span className="sr-only">{rest["aria-label"]}</span>
      </button>
    );
  }
);

export default IconButton;
