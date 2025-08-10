import React from "react";
import clsx from "clsx";

export interface TooltipProps {
  children: React.ReactNode; // trigger element
  content: React.ReactNode; // tooltip body
  className?: string;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number; // ms
  disabled?: boolean;
  /** Optional max width */
  maxWidth?: number | string;
}

/**
 * Lightweight, dependency-free tooltip using inverse surface token.
 * Accessible pattern: content rendered after trigger, aria-describedby link.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  className,
  placement = "top",
  delay = 140,
  disabled,
  maxWidth = 280,
}) => {
  const [open, setOpen] = React.useState(false);
  const [timer, setTimer] = React.useState<number | null>(null);
  const id = React.useId();

  const show = () => {
    if (disabled) return;
    if (delay === 0) return setOpen(true);
    const t = window.setTimeout(() => setOpen(true), delay);
    setTimer(t);
  };
  const hide = () => {
    if (timer) window.clearTimeout(timer);
    setTimer(null);
    setOpen(false);
  };

  // Basic placement translation (no collision handling yet)
  const placementStyles: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            "aria-describedby": open ? id : undefined,
          } as Record<string, unknown>)
        : children}
      {open && !disabled && (
        <span
          id={id}
          role="tooltip"
          className={clsx(
            "pointer-events-none absolute z-50 px-2 py-1 rounded-md shadow-sm text-[11px] leading-tight font-medium",
            "surface-inverse border border-gray-700/50 dark:border-gray-600/50",
            placementStyles[placement],
            className
          )}
          style={{ maxWidth }}
        >
          {content}
          <span
            className={clsx(
              "absolute w-2 h-2 rotate-45 bg-inherit border border-gray-700/40 dark:border-gray-600/40",
              placement === "top" && "left-1/2 -translate-x-1/2 top-full border-t-0 border-l-0",
              placement === "bottom" && "left-1/2 -translate-x-1/2 bottom-full border-b-0 border-r-0",
              placement === "left" && "top-1/2 -translate-y-1/2 left-full border-l-0 border-b-0",
              placement === "right" && "top-1/2 -translate-y-1/2 right-full border-r-0 border-t-0"
            )}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
};

export default Tooltip;
