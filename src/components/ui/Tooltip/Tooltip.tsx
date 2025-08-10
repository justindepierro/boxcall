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
  /** Automatically flip / shift if collision with viewport (basic heuristic) */
  smart?: boolean;
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
  smart = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const [timer, setTimer] = React.useState<number | null>(null);
  const id = React.useId();
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);
  const resolvedPlacement = React.useRef(placement);

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

  React.useEffect(() => {
    if (!open || !smart) return;
    const el = wrapperRef.current;
    if (!el) return;
    const tooltip = el.querySelector('[role="tooltip"]') as HTMLElement | null;
    const trigger = el.firstElementChild as HTMLElement | null;
    if (!tooltip || !trigger) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = tooltip.getBoundingClientRect();
    // Flip vertically if clipped
    if (rect.top < 0 && resolvedPlacement.current === "top") {
      resolvedPlacement.current = "bottom";
    } else if (rect.bottom > vh && resolvedPlacement.current === "bottom") {
      resolvedPlacement.current = "top";
    }
    // Shift horizontally if overflowing
    if (rect.left < 4) tooltip.style.left = `${rect.width / 2 + 8}px`;
    if (rect.right > vw - 4)
      tooltip.style.left = `calc(100% - ${rect.width / 2 + 8}px)`;
  }, [open, smart]);

  return (
    <span
      ref={wrapperRef}
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
            placementStyles[resolvedPlacement.current],
            className
          )}
          style={{ maxWidth }}
        >
          {content}
          <span
            className={clsx(
              "absolute w-2 h-2 rotate-45 bg-inherit border border-gray-700/40 dark:border-gray-600/40",
              resolvedPlacement.current === "top" &&
                "left-1/2 -translate-x-1/2 top-full border-t-0 border-l-0",
              resolvedPlacement.current === "bottom" &&
                "left-1/2 -translate-x-1/2 bottom-full border-b-0 border-r-0",
              resolvedPlacement.current === "left" &&
                "top-1/2 -translate-y-1/2 left-full border-l-0 border-b-0",
              resolvedPlacement.current === "right" &&
                "top-1/2 -translate-y-1/2 right-full border-r-0 border-t-0"
            )}
            aria-hidden="true"
          />
        </span>
      )}
    </span>
  );
};

export default Tooltip;
